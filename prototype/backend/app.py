from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import re
import json
from datetime import timedelta
from auth import (
    init_db, create_user, verify_user, login_required,
    save_prediction, get_user_predictions, create_auth_token,
    delete_auth_token, get_token_from_request, apply_user_to_session
)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Required for cross-site cookies
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_REFRESH_EACH_REQUEST'] = True
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

MODEL_METRICS_PATH = os.environ.get('MODEL_METRICS_PATH', 'model_metrics.json')
DATA_PATH = os.environ.get('MODEL_DATA_PATH', 'data/mimic_adhf_raw.csv')
feature_reference_stats = None

FEATURE_LABELS = {
    'Age': 'Age',
    'Gender': 'Gender',
    'SystolicBP': 'Sys BP',
    'DiastolicBP': 'Dia BP',
    'HeartRate': 'Heart Rate',
    'RespRate': 'Resp Rate',
    'SpO2': 'SpO2',
    'BNP': 'BNP',
    'Creatinine': 'Creatinine',
    'Sodium': 'Sodium',
    'Hemoglobin': 'Hemoglobin',
    'Diabetes': 'Diabetes',
    'Hypertension': 'Hypertension',
    'AtrialFib': 'Atrial Fib',
    'COPD': 'COPD',
    'HIV': 'HIV',
    'AdmissionType_URGENT': 'Urgent Admission',
    'Insurance_Medicaid': 'Medicaid',
    'Insurance_Medicare': 'Medicare',
    'Insurance_Private': 'Private Insurance',
}
DISPLAY_IMPACT_EXCLUDED_FEATURES = {'Gender', 'HIV'}
DISPLAY_IMPACT_EXCLUDED_PREFIXES = ('AdmissionType_', 'Insurance_')


def load_model_metrics():
    """Load evaluation metrics produced with the deployed model artifact."""
    try:
        with open(MODEL_METRICS_PATH, 'r', encoding='utf-8') as metrics_file:
            metrics = json.load(metrics_file)
    except FileNotFoundError:
        return {
            'available': False,
            'error': 'Model metrics file not found. Re-run training to generate model_metrics.json.'
        }
    except Exception as e:
        return {
            'available': False,
            'error': f'Unable to load model metrics: {e}'
        }

    metrics['available'] = True
    return metrics


def load_feature_reference_stats():
    """Load training-data medians/IQRs used to make patient-specific impact scores."""
    global feature_reference_stats
    if feature_reference_stats is not None:
        return feature_reference_stats

    stats = {}
    try:
        df = pd.read_csv(DATA_PATH, usecols=lambda col: col in numerical_cols)
        for col in numerical_cols:
            if col not in df:
                continue
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if series.empty:
                continue
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1
            stats[col] = {
                'median': float(series.median()),
                'scale': float(iqr if iqr > 0 else series.std() or 1.0)
            }
    except Exception as e:
        print(f"Unable to load feature reference stats: {e}")

    feature_reference_stats = stats
    return feature_reference_stats


def _feature_label(feature):
    return FEATURE_LABELS.get(feature, feature.replace('_', ' '))


def calculate_patient_feature_impacts(model, model_features, input_row, limit=6):
    """Rank features for this patient using model importance weighted by patient values."""
    importances = getattr(model, 'feature_importances_', None)
    if importances is None:
        return []

    reference_stats = load_feature_reference_stats()
    impacts = []
    for feature, importance in zip(model_features, importances):
        if feature in DISPLAY_IMPACT_EXCLUDED_FEATURES or feature.startswith(DISPLAY_IMPACT_EXCLUDED_PREFIXES):
            continue

        raw_value = float(input_row.get(feature, 0.0) or 0.0)

        if feature in reference_stats:
            stats = reference_stats[feature]
            distance = abs(raw_value - stats['median']) / stats['scale']
            patient_weight = 0.25 + min(distance, 3.0)
        elif feature.startswith(('AdmissionType_', 'Insurance_')) or feature in binary_cols or feature == 'HIV':
            patient_weight = 1.0 if raw_value else 0.05
        else:
            patient_weight = 1.0

        impact = float(importance) * patient_weight
        if impact > 0:
            impacts.append({
                'feature': feature,
                'name': _feature_label(feature),
                'value': impact,
                'raw_value': raw_value,
            })

    impacts.sort(key=lambda item: item['value'], reverse=True)
    top_impacts = impacts[:limit]
    max_impact = top_impacts[0]['value'] if top_impacts else 0
    for item in top_impacts:
        item['percent'] = float((item['value'] / max_impact) * 100) if max_impact else 0.0
        item['value'] = float(item['percent'] / 100)

    return top_impacts

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
        'model_loaded': model is not None,
        'model_metrics_available': load_model_metrics().get('available', False)
    })

@app.route('/model-metrics')
def model_metrics():
    return jsonify(load_model_metrics())

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
            apply_user_to_session(result['user'])
            auth_token = create_auth_token(result['user']['id'])
            
            return jsonify({
                'message': 'Login successful',
                'user': result['user'],
                'auth_token': auth_token
            }), 200
        else:
            return jsonify({'error': result['message']}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    delete_auth_token(get_token_from_request())
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
        feature_impacts = calculate_patient_feature_impacts(model, model_features, input_row)

        result = {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': 'High' if int(prediction) == 1 else 'Low',
            'message': 'Patient is at high risk of 30-day readmission.' if prediction == 1 else 'Patient has a low risk of readmission.',
            'feature_impacts': feature_impacts,
            'primary_feature': feature_impacts[0] if feature_impacts else None
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
