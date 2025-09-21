@echo off
echo PWN-Gang MedShare Application
echo ==============================
echo.

echo Starting all services...
echo.

echo Starting Backend API on port 8000...
start "Backend API" cmd /k "cd backend && python main.py"

echo Starting MessageBoard on port 8001...
start "MessageBoard" cmd /k "cd MessageBoard && python main.py"

echo Starting Chatbot on port 8002...
start "Chatbot" cmd /k "cd Chatbot/Backend && python main.py"

echo Starting Frontend server on port 3000...
start "Frontend" cmd /k "python -m http.server 3000"

echo.
echo All services are starting...
echo.
echo Access the application at:
echo   - Main App: http://localhost:3000
echo   - API Docs: http://localhost:8000/docs
echo   - Chatbot: Integrated in main app (click the robot icon)
echo.
echo Press any key to exit...
pause > nul
