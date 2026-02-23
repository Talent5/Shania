@echo off
echo ========================================
echo   ADHF Readmission Prediction System
echo ========================================
echo.
echo Starting both Backend and Frontend servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers
echo.

start "ADHF Backend" cmd /k start_backend.bat
timeout /t 3 /nobreak > nul
start "ADHF Frontend" cmd /k start_frontend.bat

echo.
echo Both servers are starting in separate windows...
echo.
pause
