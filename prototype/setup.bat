@echo off
echo ========================================
echo   ADHF System - Quick Setup
echo ========================================
echo.
echo This script will set up both backend and frontend
echo.

echo [1/2] Setting up Backend...
cd backend

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Installing Python packages...
pip install -r requirements.txt

echo.
echo Checking for model file...
if exist adhf_rf_model.pkl (
    echo ✓ Model file found!
) else (
    echo ✗ Warning: Model file not found!
    echo Please run the Jupyter notebook to train the model.
)

cd ..

echo.
echo [2/2] Setting up Frontend...
cd frontend

echo Installing Node.js packages...
call npm install

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the system, run:
echo   start_system.bat
echo.
echo Or start servers individually:
echo   Backend:  start_backend.bat
echo   Frontend: start_frontend.bat
echo.
pause
