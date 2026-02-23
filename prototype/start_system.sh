#!/bin/bash
echo "========================================"
echo "  ADHF Readmission Prediction System"
echo "========================================"
echo
echo "Starting both Backend and Frontend servers..."
echo
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo
echo "Press Ctrl+C in each terminal to stop the servers"
echo

# Start backend in new terminal
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./start_backend.sh"'
    sleep 3
    osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./start_frontend.sh"'
else
    # Linux
    gnome-terminal -- bash -c "cd '$(pwd)' && ./start_backend.sh; exec bash"
    sleep 3
    gnome-terminal -- bash -c "cd '$(pwd)' && ./start_frontend.sh; exec bash"
fi

echo
echo "Both servers are starting in separate terminals..."
echo
