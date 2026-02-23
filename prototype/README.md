# ADHF Readmission Prediction System

A production-ready machine learning system with user authentication for predicting 30-day hospital readmission risk in patients with Acute Decompensated Heart Failure (ADHF).

## 🏗️ System Architecture

```
prototype/
├── backend/          # Flask API + ML Model + Auth
│   ├── app.py                          # Main Flask application with auth
│   ├── auth.py                         # Authentication module
│   ├── data_processing.py              # Data preprocessing pipeline
│   ├── model_training.py               # Model training script
│   ├── adhf_rf_model.pkl               # Trained Random Forest model
│   ├── .env.example                    # Environment configuration template
│   └── requirements.txt                # Python dependencies
│
└── frontend/         # React Web Application
    ├── src/
    │   ├── App.js                     # Main app with routing
    │   ├── components/
    │   │   ├── Login.js               # Login component
    │   │   ├── Signup.js              # Signup component
    │   │   └── Dashboard.js           # Main prediction interface
    │   ├── index.js                   # React entry point
    │   └── index.css                  # Styling (incl. auth styles)
    ├── public/
    │   └── index.html                 # HTML template
    └── package.json                    # Node.js dependencies
```

## 🚀 Features

### Authentication & Security
- **User Registration**: Secure signup for healthcare professionals
- **Login System**: Session-based authentication with password hashing
- **Protected Access**: Prediction tool requires authentication
- **Role-Based Users**: Support for clinicians, nurses, researchers, administrators
- **Prediction History**: Users can view their past risk assessments
- **Session Management**: 7-day persistent sessions

### Machine Learning
- **Model**: Random Forest classifier trained on MIMIC-III data
- **Performance**: ~85% accuracy, AUROC ~0.88
- **Real-time Predictions**: Instant risk assessment with probability scores
- **Feature Visualization**: Interactive charts showing key predictive factors

### User Interface
- **Modern Design**: Clean, healthcare-focused interface
- **Responsive**: Works on desktop and mobile devices
- **Interactive Forms**: Real-time validation and feedback
- **History Tracking**: View past predictions with timestamps

## 📊 Model Information

- **Algorithm**: Random Forest Classifier with SMOTE (addressing class imbalance)
- **Features**: 15 numerical/binary + 3 categorical variables (one-hot encoded)
- **Performance Metrics**: 
  - Accuracy: ~85%
  - AUROC: ~0.88
  - Precision/Recall balanced for clinical use
- **Dataset**: Derived from MIMIC-III Critical Care Database

### Input Features

**Demographics:**
- Age (years)
- Gender (M/F)
- Ethnicity (White, Black, Hispanic, Asian, Other)

**Vital Signs:**
- Systolic Blood Pressure (mmHg)
- Diastolic Blood Pressure (mmHg)
- Heart Rate (bpm)
- Respiratory Rate (bpm)
- SpO2 (%)

**Laboratory Values:**
- BNP Level (pg/mL) - Key heart failure biomarker
- Serum Creatinine (mg/dL)
- Sodium (mEq/L)
- Hemoglobin (g/dL)

**Comorbidities:**
- Diabetes (Yes/No)
- Hypertension (Yes/No)
- Atrial Fibrillation (Yes/No)
- COPD (Yes/No)

**Administrative:**
- Admission Type (Emergency, Urgent, Elective)
- Insurance (Medicare, Medicaid, Private, Government, Self Pay)

## 🛠️ Installation & Setup

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 14+** and npm (for frontend)
- **pip** (Python package manager)

### Quick Start

The easiest way to get started:

**Windows:**
```bash
cd prototype
setup.bat
start_system.bat
```

**macOS/Linux:**
```bash
cd prototype
chmod +x setup.sh start_system.sh
./setup.sh
./start_system.sh
```

### Manual Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd prototype/backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Verify model file exists:
```bash
# Check for adhf_rf_model.pkl in the backend folder
dir adhf_rf_model.pkl  # Windows
ls adhf_rf_model.pkl   # macOS/Linux
```

5. Start the Flask server:
```bash
python app.py
```

The backend API will run at: `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd prototype/frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will automatically open at: `http://localhost:3000`

## 🧪 Testing the System

### First Time Use

1. **Open your browser** to `http://localhost:3000`
2. **Create an account**:
   - Click "Sign up here"
   - Enter your name, email, and password
   - Select your role (e.g., Clinician)
   - Click "Sign Up"
3. **Login** with your credentials
4. **Start making predictions!**

### API Health Check

Test if the backend is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Sample Prediction Request

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 72,
    "Gender": "M",
    "SystolicBP": 140,
    "DiastolicBP": 90,
    "HeartRate": 95,
    "RespRate": 22,
    "SpO2": 94,
    "BNP": 850,
    "Creatinine": 1.8,
    "Sodium": 135,
    "Hemoglobin": 10.5,
    "Diabetes": 1,
    "Hypertension": 1,
    "AtrialFib": 1,
    "COPD": 0,
    "Ethnicity": "WHITE",
    "AdmissionType": "EMERGENCY",
    "Insurance": "Medicare"
  }'
```

Expected response:
```json
{
  "prediction": 1,
  "probability": 0.78,
  "risk_level": "High",
  "message": "Patient is at high risk of 30-day readmission."
}
```

## 📱 Using the Web Interface

1. **Create Account / Login**
   - First-time users: Click "Sign up here" and create an account
   - Returning users: Login with your credentials

2. **Fill in Patient Information**
   - Enter demographic data (age, gender, ethnicity)
   - Input vital signs (BP, heart rate, respiratory rate, SpO2)
   - Provide laboratory values (BNP, creatinine, sodium, hemoglobin)
   - Select comorbidities and administrative details

3. **Get Prediction**
   - Click "Predict Re-admission Risk"
   - View results with risk probability and classification
   - See feature importance chart

4. **View History**
   - Click the history icon in the header
   - Review your past predictions with timestamps

5. **Logout**
   - Click the logout button when done

## 🔧 API Documentation

### Authentication Endpoints

#### GET `/`
Root endpoint with API information
- **Response**: JSON with API status, authentication status, and available endpoints

#### GET `/health`
Health check endpoint
- **Response**: `{ "status": "healthy", "model_loaded": true }`

#### POST `/auth/signup`
Register a new user
- **Request**: `{ "fullName": "...", "email": "...", "password": "...", "role": "..." }`
- **Response**: `{ "success": true, "message": "User created successfully" }`

#### POST `/auth/login`
Login user and create session
- **Request**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "message": "Login successful", "user": {...} }`

#### POST `/auth/logout`
Logout user and clear session
- **Response**: `{ "message": "Logged out successfully" }`

#### GET `/auth/me`
Get current logged-in user (requires authentication)
- **Response**: `{ "user": {...} }`

#### GET `/history?limit=10`
Get user's prediction history (requires authentication)
- **Response**: `{ "history": [...] }`

#### POST `/predict` (requires authentication)
Generate readmission risk prediction
- **Content-Type**: `application/json`
- **Request Body**: Patient data (see Input Features above)
- **Response**:
  ```json
  {
    "prediction": 0 | 1,
    "probability": 0.0-1.0,
    "risk_level": "High" | "Low",
    "message": "Risk assessment message"
  }
  ```

## 🏥 Clinical Use Case

This system is designed to assist healthcare providers in:
1. **Risk Stratification**: Identify high-risk patients at discharge
2. **Resource Allocation**: Prioritize follow-up care and interventions
3. **Quality Improvement**: Reduce preventable readmissions
4. **Care Planning**: Tailor discharge plans based on risk factors

**⚠️ Important**: This tool is for research and educational purposes. Not approved for clinical use without proper validation and regulatory approval.

## 🔬 Model Training

To retrain the model with new data:

1. Place your dataset in `backend/data/mimic_adhf_raw.csv`
2. Open and run the Jupyter notebook:
```bash
jupyter notebook backend/adhf_readmission_prediction.ipynb
```
3. The notebook will:
   - Clean and preprocess data
   - Handle class imbalance with SMOTE
   - Train Random Forest model
   - Evaluate performance metrics
   - Save model as `adhf_rf_model.pkl`

Alternatively, use the training script:
```bash
cd backend
python model_training.py
```

## 📦 Dependencies

### Backend (Python)
- Flask - Web framework
- Flask-CORS - Cross-origin resource sharing
- pandas - Data manipulation
- numpy - Numerical computing
- scikit-learn - Machine learning
- imbalanced-learn - SMOTE implementation
- joblib - Model serialization
- shap - Model interpretability (optional)

### Frontend (React)
- React 18.x - UI framework
- axios - HTTP client
- recharts - Data visualization
- lucide-react - Icon library
- framer-motion - Animations (optional)

## 🐛 Troubleshooting

### Backend Issues

**Model not loading:**
- Verify `adhf_rf_model.pkl` exists in the backend folder
- Retrain the model using the Jupyter notebook

**Port already in use:**
```bash
# Change port in app.py:
app.run(debug=True, port=5001)
```

**CORS errors:**
- Ensure Flask-CORS is installed: `pip install flask-cors`
- Backend must start before frontend

### Frontend Issues

**Cannot connect to backend:**
- Verify backend is running at http://localhost:5000
- Check the API URL in App.js (line ~42)

**Dependencies installation fails:**
```bash
# Clear npm cache and retry
npm cache clean --force
npm install
```

**Port 3000 already in use:**
- React will prompt to use a different port automatically
- Or specify: `PORT=3001 npm start`

## � Production Deployment

This application is production-ready! For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Options:
- **Traditional Server**: Linux/Windows with Nginx/Apache
- **Docker**: Containerized deployment with Docker Compose
- **Cloud Platforms**: Heroku, AWS, Azure, GCP

### Pre-Deployment Steps:
1. Configure environment variables (copy `.env.example` to `.env`)
2. Set a secure `SECRET_KEY`
3. Build frontend for production: `npm run build`
4. Use production server (Gunicorn/Waitress, not Flask dev server)
5. Enable HTTPS/SSL
6. Configure database backups

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete instructions.

## 📈 Future Enhancements

- [x] User authentication with role-based access
- [x] Patient history tracking
- [ ] Deploy to cloud (AWS/Azure/GCP)
- [ ] Add more explainability features (SHAP/LIME)
- [ ] Support batch predictions
- [ ] Integration with EHR systems
- [ ] Mobile responsive design improvements
- [ ] Real-time model monitoring dashboard

## 👨‍💻 Development

### Project Structure
- Backend follows Flask best practices
- Frontend uses functional React with Hooks
- Model training separated for reproducibility
- Data processing modularized

### Code Quality
- Type hints in Python code
- ESLint for JavaScript linting
- Comprehensive error handling
- API request validation

## 📄 License

This project is for educational and research purposes. Dataset usage follows MIMIC-III data usage agreements.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📧 Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for improving healthcare outcomes**
