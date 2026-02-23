@echo off
echo ========================================
echo   Starting ADHF Backend Server
echo ========================================
echo.

cd backend

echo Checking for virtual environment...
if exist venv (
    echo Activating virtual environment...
    call venv\Scripts\activate
) else (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
