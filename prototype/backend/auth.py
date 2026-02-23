"""
Authentication module for ADHF Prediction System
Handles user registration, login, and session management
"""

from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import jsonify, session, request
import sqlite3
import os
from datetime import datetime

DATABASE_PATH = 'users.db'

def init_db():
    """Initialize the user database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'clinician',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            patient_age INTEGER,
            prediction INTEGER,
            probability REAL,
            risk_level TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_user(email, password, full_name, role='clinician'):
    """Create a new user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return {'success': False, 'message': 'Email already registered'}
        
        # Hash password and create user
        password_hash = generate_password_hash(password)
        cursor.execute(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            (email, password_hash, full_name, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return {'success': True, 'message': 'User created successfully', 'user_id': user_id}
    except Exception as e:
        return {'success': False, 'message': str(e)}

def verify_user(email, password):
    """Verify user credentials"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return {'success': False, 'message': 'Invalid email or password'}
        
        if not check_password_hash(user['password_hash'], password):
            conn.close()
            return {'success': False, 'message': 'Invalid email or password'}
        
        # Update last login
        cursor.execute('UPDATE users SET last_login = ? WHERE id = ?', 
                      (datetime.now(), user['id']))
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role']
            }
        }
    except Exception as e:
        return {'success': False, 'message': str(e)}

def save_prediction(user_id, patient_data, prediction_result):
    """Save prediction to history"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO prediction_history 
            (user_id, patient_age, prediction, probability, risk_level)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            patient_data.get('Age'),
            prediction_result.get('prediction'),
            prediction_result.get('probability'),
            prediction_result.get('risk_level')
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving prediction: {e}")
        return False

def get_user_predictions(user_id, limit=10):
    """Get user's prediction history"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM prediction_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        predictions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return predictions
    except Exception as e:
        print(f"Error fetching predictions: {e}")
        return []

def login_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Initialize database on module import
if not os.path.exists(DATABASE_PATH):
    init_db()
