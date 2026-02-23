#!/bin/bash
echo "========================================"
echo "  ADHF System - Quick Setup"
echo "========================================"
echo
echo "This script will set up both backend and frontend"
echo

echo "[1/2] Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing Python packages..."
pip install -r requirements.txt

echo
echo "Checking for model file..."
if [ -f "adhf_rf_model.pkl" ]; then
    echo "✓ Model file found!"
else
    echo "✗ Warning: Model file not found!"
    echo "Please run the Jupyter notebook to train the model."
fi

cd ..

echo
echo "[2/2] Setting up Frontend..."
cd frontend

echo "Installing Node.js packages..."
npm install

cd ..

echo
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo
echo "To start the system, run:"
echo "  chmod +x start_system.sh && ./start_system.sh"
echo
echo "Or start servers individually:"
echo "  Backend:  chmod +x start_backend.sh && ./start_backend.sh"
echo "  Frontend: chmod +x start_frontend.sh && ./start_frontend.sh"
echo
