@echo off
echo ========================================
echo   Starting ADHF Frontend Server
echo ========================================
echo.

cd frontend

echo Checking for node_modules...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting React development server on http://localhost:3000
echo The browser will open automatically
echo Press Ctrl+C to stop the server
echo.

npm start

pause
