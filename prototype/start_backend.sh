#!/bin/bash
echo "========================================"
echo "  Starting ADHF Backend Server"
echo "========================================"
echo

cd backend

echo "Checking for virtual environment..."
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

echo
echo "Starting Flask server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo

python app.py
