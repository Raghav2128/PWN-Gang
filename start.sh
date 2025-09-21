#!/bin/bash

echo "PWN-Gang MedShare Application"
echo "=============================="
echo

echo "Starting all services..."
echo

# Create logs directory
mkdir -p logs

echo "Starting Backend API on port 8000..."
cd backend && python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

echo "Starting MessageBoard on port 8001..."
cd MessageBoard && python main.py > ../logs/messageboard.log 2>&1 &
MESSAGEBOARD_PID=$!
echo $MESSAGEBOARD_PID > ../logs/messageboard.pid
cd ..

echo "Starting Chatbot on port 8002..."
cd Chatbot/Backend && python main.py > ../../logs/chatbot.log 2>&1 &
CHATBOT_PID=$!
echo $CHATBOT_PID > ../../logs/chatbot.pid
cd ../..

echo "Starting Frontend server on port 3000..."
python -m http.server 3000 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > logs/frontend.pid

echo
echo "All services are starting..."
echo
echo "Access the application at:"
echo "  - Main App: http://localhost:3000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Chatbot: Integrated in main app (click the robot icon)"
echo
echo "Service PIDs:"
echo "  - Backend: $BACKEND_PID"
echo "  - MessageBoard: $MESSAGEBOARD_PID"
echo "  - Chatbot: $CHATBOT_PID"
echo "  - Frontend: $FRONTEND_PID"
echo
echo "To stop all services, kill the processes or restart your terminal"
echo "To view logs, check the logs/ directory"
echo
echo "Press Ctrl+C to exit this script (services will continue running)"
echo

# Wait for user to press Ctrl+C
trap 'echo "Script stopped. Services are still running."; exit 0' INT
while true; do
    sleep 1
done
