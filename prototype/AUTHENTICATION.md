# Authentication System Guide

## Overview

The ADHF Prediction Platform now includes a complete authentication system to ensure secure access and personalized user experience for healthcare professionals.

## Features

✅ **User Registration** - Clinicians can create accounts with role-based access
✅ **Secure Login** - Password hashing with session management  
✅ **Protected Routes** - Prediction tool requires authentication
✅ **Prediction History** - Users can view their past predictions
✅ **Session Persistence** - Stay logged in for 7 days
✅ **Role-Based Access** - Support for different healthcare roles

## User Roles

- **Clinician** - Primary healthcare providers
- **Nurse** - Nursing staff
- **Researcher** - Clinical researchers
- **Administrator** - System administrators

## Getting Started

### 1. Create an Account

1. Navigate to http://localhost:3000
2. Click "Sign up here"
3. Fill in your details:
   - Full Name (e.g., "Dr. Jane Smith")
   - Email Address (professional email)
   - Password (minimum 6 characters)
   - Confirm Password
   - Select your role
4. Click "Sign Up"
5. You'll be redirected to login

### 2. Login

1. Enter your registered email
2. Enter your password
3. Click "Login"
4. You'll be taken to the prediction dashboard

### 3. Using the Platform

Once logged in, you can:
- **Make Predictions**: Enter patient data and get risk assessments
- **View History**: Click the history icon to see your past predictions
- **Logout**: Click the logout button to end your session

## API Endpoints

### Authentication

#### POST /auth/signup
Register a new user

**Request:**
```json
{
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@hospital.com",
  "password": "securepassword",
  "role": "clinician"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

#### POST /auth/login
Login and create session

**Request:**
```json
{
  "email": "jane.smith@hospital.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "jane.smith@hospital.com",
    "full_name": "Dr. Jane Smith",
    "role": "clinician"
  }
}
```

#### POST /auth/logout
Logout and clear session

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me
Get current user info (requires authentication)

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "jane.smith@hospital.com",
    "full_name": "Dr. Jane Smith",
    "role": "clinician"
  }
}
```

### Predictions

#### POST /predict
Make a prediction (requires authentication)

**Request:** Same as before (see main README)

**Response:** Same as before + prediction saved to history

#### GET /history?limit=10
Get user's prediction history (requires authentication)

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "patient_age": 72,
      "prediction": 1,
      "probability": 0.78,
      "risk_level": "High",
      "created_at": "2026-02-23T14:30:00"
    }
  ]
}
```

## Database Schema

### users Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| email | TEXT | User email (unique) |
| password_hash | TEXT | Hashed password |
| full_name | TEXT | User's full name |
| role | TEXT | User role |
| created_at | TIMESTAMP | Account creation date |
| last_login | TIMESTAMP | Last login time |

### prediction_history Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| patient_age | INTEGER | Patient age |
| prediction | INTEGER | 0 (low) or 1 (high) |
| probability | REAL | Risk probability |
| risk_level | TEXT | "High" or "Low" |
| created_at | TIMESTAMP | Prediction timestamp |

## Security Features

### Password Security
- Passwords are hashed using Werkzeug's `generate_password_hash`
- Uses PBKDF2 with SHA-256
- Salt automatically generated per password

### Session Management
- Server-side sessions using Flask sessions
- Session cookie with 7-day expiration
- Secure flag ready for HTTPS in production
- SameSite=Lax for CSRF protection

### API Protection
- All prediction endpoints require authentication
- `@login_required` decorator on protected routes
- Returns 401 Unauthorized if not authenticated

## Frontend Authentication Flow

```
┌─────────────┐
│  App Start  │
└──────┬──────┘
       │
       ├─ Check /auth/me
       │
       ├─ Authenticated? ──Yes──> Dashboard
       │
       └─ No ──> Login Page
                     │
                     ├─ Signup ──> Login
                     │
                     └─ Login Success ──> Dashboard
                                              │
                                              ├─ Make Predictions
                                              ├─ View History
                                              └─ Logout ──> Login Page
```

## Testing Authentication

### Create Test User
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Doctor",
    "email": "test@example.com",
    "password": "test123",
    "role": "clinician"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' \
  -c cookies.txt
```

### Make Authenticated Request
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ ... patient data ... }'
```

## Troubleshooting

### "Authentication required" error
- **Cause**: Session expired or not logged in
- **Solution**: Login again

### "Email already registered"
- **Cause**: Account already exists with that email
- **Solution**: Use a different email or login with existing account

### "Invalid email or password"
- **Cause**: Wrong credentials
- **Solution**: Check your email and password

### Session not persisting
- **Cause**: Cookies blocked or CORS misconfigured
- **Solution**: Ensure `withCredentials: true` in axios requests

### Can't access /predict endpoint
- **Cause**: Not authenticated
- **Solution**: Login first, then make prediction

## Production Considerations

For production deployment:

1. **Change Secret Key**
   ```python
   app.secret_key = os.environ.get('SECRET_KEY')
   ```

2. **Enable HTTPS**
   ```python
   app.config['SESSION_COOKIE_SECURE'] = True
   ```

3. **Use PostgreSQL/MySQL**
   - Replace SQLite with production database
   - Update connection strings

4. **Add Rate Limiting**
   - Prevent brute force attacks
   - Use Flask-Limiter

5. **Implement Password Reset**
   - Email-based password recovery
   - Token-based reset links

6. **Add Email Verification**
   - Verify email on signup
   - Prevent fake accounts

7. **Enable CORS Properly**
   ```python
   CORS(app, 
        origins=['https://yourdomain.com'],
        supports_credentials=True)
   ```

8. **Add Logging**
   - Log authentication attempts
   - Monitor suspicious activity

## Support

For questions or issues with authentication, please refer to the main README or contact the development team.

---

**Built with security and healthcare compliance in mind**
