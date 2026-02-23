# 🚀 Quick Start Guide

Get the ADHF Readmission Prediction System running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8 or higher installed
- ✅ Node.js 14 or higher installed
- ✅ Internet connection (for downloading dependencies)

Check your versions:
```bash
python --version
node --version
npm --version
```

## Option 1: Automated Setup (Recommended)

### Windows:
1. Double-click `setup.bat`
2. Wait for installation to complete
3. Double-click `start_system.bat`
4. Both servers will start automatically in separate windows

### macOS/Linux:
```bash
chmod +x setup.sh start_system.sh
./setup.sh
./start_system.sh
```

## Option 2: Manual Setup

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend runs at: **http://localhost:5000**

### Step 2: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

## First Time Use

1. Open browser to **http://localhost:3000**
2. **Create your account**:
   - Click "Sign up here" on the login page
   - Enter your full name (e.g., "Dr. Jane Smith")
   - Enter your professional email
   - Create a secure password (minimum 6 characters)
   - Select your role (Clinician, Nurse, Researcher, etc.)
   - Click "Sign Up"
3. **Login** with your new credentials
4. You should see the "ADHF Readmission Predictor" dashboard
5. Try the default values or enter custom patient data
6. Click "Predict Re-admission Risk"
7. View results with probability and risk classification
8. Click the history icon to see your past predictions

## Sample Test Case

Use this high-risk patient example:

- **Age**: 75 years
- **Gender**: Male
- **Blood Pressure**: 145/95 mmHg
- **Heart Rate**: 98 bpm
- **Respiratory Rate**: 24 bpm
- **SpO2**: 92%
- **BNP**: 1200 pg/mL
- **Creatinine**: 2.1 mg/dL
- **Sodium**: 132 mEq/L
- **Hemoglobin**: 9.8 g/dL
- **Comorbidities**: Diabetes, Hypertension, Atrial Fibrillation all YES
- **Ethnicity**: White
- **Admission Type**: Emergency
- **Insurance**: Medicare

Expected Result: **High Risk** (>70% probability)

## Troubleshooting

### Backend won't start
- Check if Python is installed: `python --version`
- Check if port 5000 is available
- Verify model file exists: `backend/adhf_rf_model.pkl`

### Frontend won't start
- Check if Node.js is installed: `node --version`
- Try clearing cache: `npm cache clean --force`
- Delete `node_modules` folder and run `npm install` again

### "Model not loaded" error
- Run the Jupyter notebook to train the model:
  ```bash
  jupyter notebook backend/adhf_readmission_prediction.ipynb
  ```
- Or check if `adhf_rf_model.pkl` exists in the backend folder

### Cannot connect to backend
- Ensure backend server is running (check terminal output)
- Verify backend URL in browser: http://localhost:5000/health
- Check firewall settings

## Stopping the Servers

- Press **Ctrl+C** in each terminal window
- Or close the terminal windows

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Explore the model training notebook
- Customize the UI styling in `frontend/src/index.css`
- Add new features or endpoints

## Need Help?

- Check [README.md](README.md) for detailed troubleshooting
- Review backend logs in the Flask terminal
- Check browser console for frontend errors (F12)

---

**Enjoy predicting readmission risk! 🏥❤️**
