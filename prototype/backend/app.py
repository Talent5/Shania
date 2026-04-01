from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import re
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

# CORS configuration - allow one or many frontend URLs from environment
frontend_url_env = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
allowed_origins = [
    origin.strip().rstrip('/')
    for origin in frontend_url_env.split(',')
    if origin.strip()
]
# Allow any vercel.app domain (like preview deployments)
allowed_origins.append(re.compile(r"^https://.*\.vercel\.app$"))

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


def _find_matching_onehot_feature(model_features, prefix, value):
    """Match incoming category values to trained one-hot feature names."""
    target = str(value).strip().lower()
    start = f"{prefix}_"

    for feature in model_features:
        if not feature.startswith(start):
            continue
        category_value = feature[len(start):].strip().lower()
        if category_value == target:
            return feature

    return None

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
        model_features = getattr(model, 'feature_names_in_', None)
        if model_features is None:
            return jsonify({'error': 'Model does not include feature names. Re-train and save model with feature metadata.'}), 500

        required_numeric = numerical_cols
        required_binary = ['Gender', 'Diabetes', 'Hypertension', 'AtrialFib', 'COPD']
        required_categories = ['AdmissionType', 'Insurance']

        missing = [
            key for key in (required_numeric + required_binary + required_categories)
            if key not in data
        ]
        if missing:
            return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

        input_row = {feature: 0.0 for feature in model_features}

        # 1. Map continuous features directly
        for col in required_numeric:
            if col in input_row:
                input_row[col] = float(data[col])

        # 2. Map binary clinical features directly
        input_row['Gender'] = 1.0 if str(data['Gender']).strip().upper() == 'M' else 0.0
        for col in required_binary[1:]:
            if col in input_row:
                input_row[col] = float(int(data[col]))

        # 3. Map one-hot categorical values by matching trained feature names
        selected_categories = {
            'AdmissionType': data['AdmissionType'],
            'Insurance': data['Insurance']
        }
        unmatched_categories = {}
        for prefix, value in selected_categories.items():
            matched_feature = _find_matching_onehot_feature(model_features, prefix, value)
            if matched_feature:
                input_row[matched_feature] = 1.0
            else:
                unmatched_categories[prefix] = value

        df_final = pd.DataFrame([input_row], columns=model_features)

        # Predict
        prediction = model.predict(df_final)[0]
        probability = model.predict_proba(df_final)[0][1]

        result = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': 'High' if int(prediction) == 1 else 'Low',
            'message': 'Patient is at high risk of 30-day readmission.' if prediction == 1 else 'Patient has a low risk of readmission.'
        }

        if unmatched_categories:
            result['category_mapping_warning'] = (
                'Some categories were not present in model features and were ignored: '
                + ', '.join([f"{k}={v}" for k, v in unmatched_categories.items()])
            )
        
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
