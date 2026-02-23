from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
from datetime import timedelta
from auth import (
    init_db, create_user, verify_user, login_required,
    save_prediction, get_user_predictions
)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Required for cross-site cookies
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# CORS configuration - allow frontend URL from environment
allowed_origins = os.environ.get('FRONTEND_URL', 'http://localhost:3000').split(',')
CORS(app, supports_credentials=True, origins=allowed_origins)

# Load Model
try:
    model = joblib.load('adhf_rf_model.pkl')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Expected order of columns MUST match X_final.columns from the notebook
# Based on the notebook's preprocessing:
numerical_cols = ['Age', 'SystolicBP', 'DiastolicBP', 'HeartRate', 'RespRate', 'SpO2', 'BNP', 'Creatinine', 'Sodium', 'Hemoglobin']
binary_cols = ['Gender', 'Diabetes', 'Hypertension', 'AtrialFib', 'COPD']

@app.route('/')
def home():
    return jsonify({
        'message': 'ADHF Readmission Prediction API',
        'status': 'running',
        'model_loaded': model is not None,
        'authenticated': 'user_id' in session,
        'endpoints': {
            'auth': {
                'signup': '/auth/signup',
                'login': '/auth/login',
                'logout': '/auth/logout',
                'me': '/auth/me'
            },
            'predict': '/predict',
            'history': '/history',
            'health': '/health'
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

# Authentication Routes
@app.route('/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')
        role = data.get('role', 'clinician')
        
        if not all([email, password, full_name]):
            return jsonify({'error': 'Email, password, and full name are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        result = create_user(email, password, full_name, role)
        
        if result['success']:
            return jsonify({
                'message': result['message'],
                'success': True
            }), 201
        else:
            return jsonify({'error': result['message']}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/auth/login', methods=['POST'])
def login():
    """Login user and create session"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = verify_user(email, password)
        
        if result['success']:
            session.permanent = True
            session['user_id'] = result['user']['id']
            session['email'] = result['user']['email']
            session['full_name'] = result['user']['full_name']
            session['role'] = result['user']['role']
            
            return jsonify({
                'message': 'Login successful',
                'user': result['user']
            }), 200
        else:
            return jsonify({'error': result['message']}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged-in user info"""
    return jsonify({
        'user': {
            'id': session.get('user_id'),
            'email': session.get('email'),
            'full_name': session.get('full_name'),
            'role': session.get('role')
        }
    }), 200

@app.route('/history', methods=['GET'])
@login_required
def get_history():
    """Get user's prediction history"""
    user_id = session.get('user_id')
    limit = request.args.get('limit', 10, type=int)
    predictions = get_user_predictions(user_id, limit)
    return jsonify({'history': predictions}), 200

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.json
        input_data = {}

        # 1. Map incoming JSON to raw features
        input_data['Age'] = float(data.get('Age', 65))
        input_data['SystolicBP'] = float(data.get('SystolicBP', 120))
        input_data['DiastolicBP'] = float(data.get('DiastolicBP', 80))
        input_data['HeartRate'] = float(data.get('HeartRate', 80))
        input_data['RespRate'] = float(data.get('RespRate', 20))
        input_data['SpO2'] = float(data.get('SpO2', 98))
        input_data['BNP'] = float(data.get('BNP', 500))
        input_data['Creatinine'] = float(data.get('Creatinine', 1.2))
        input_data['Sodium'] = float(data.get('Sodium', 138))
        input_data['Hemoglobin'] = float(data.get('Hemoglobin', 12)) 
        
        # Binary Mappings
        input_data['Gender'] = 1 if data.get('Gender') == 'M' else 0
        input_data['Diabetes'] = int(data.get('Diabetes', 0))
        input_data['Hypertension'] = int(data.get('Hypertension', 0))
        input_data['AtrialFib'] = int(data.get('AtrialFib', 0))
        input_data['COPD'] = int(data.get('COPD', 0))

        # Categorical dummies setup
        ethnicity = data.get('Ethnicity', 'WHITE')
        admission = data.get('AdmissionType', 'EMERGENCY')
        insurance = data.get('Insurance', 'Medicare')

        df_input = pd.DataFrame([input_data])

        # Get the feature names expected by the model
        if hasattr(model, 'feature_names_in_'):
            model_features = model.feature_names_in_
        else:
            # Fallback if specific version of sklearn doesn't save feature_names_in_
            return jsonify({'error': 'Model does not have feature names stored. Re-train model.'}), 500

        # Initialize all model features to 0
        for feature in model_features:
            if feature not in df_input.columns:
                df_input[feature] = 0

        # Set One-Hot values manually based on input strings
        # Example: 'Ethnicity_ASIAN' - Need to match exactly how pandas named them
        # Pandas names: "Column_Value"
        
        eth_col = f'Ethnicity_{ethnicity}'
        if eth_col in model_features:
            df_input[eth_col] = 1
            
        adm_col = f'AdmissionType_{admission}'
        if adm_col in model_features:
            df_input[adm_col] = 1
            
        ins_col = f'Insurance_{insurance}'
        if ins_col in model_features:
            df_input[ins_col] = 1

        # Reorder to match model
        df_final = df_input[model_features]

        # Predict
        prediction = model.predict(df_final)[0]
        probability = model.predict_proba(df_final)[0][1]

        result = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': 'High' if probability > 0.5 else 'Low',
            'message': 'Patient is at high risk of 30-day readmission.' if prediction == 1 else 'Patient has a low risk of readmission.'
        }
        
        # Save prediction to user's history
        user_id = session.get('user_id')
        if user_id:
            save_prediction(user_id, data, result)
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    init_db()  # Initialize database on startup
    app.run(debug=True, port=5000)
