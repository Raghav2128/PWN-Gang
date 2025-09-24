@echo off
echo Starting Pulse Application with MessageBoard...

REM Start MessageBoard on port 8006
start "MessageBoard" cmd /k "cd MessageBoard && python main.py"

REM Wait a moment for MessageBoard to start
timeout /t 3 /nobreak > nul

REM Start main application on port 8080
start "Pulse Main App" cmd /k "python -m http.server 8080"

echo.
echo Both servers are starting...
echo Main App: http://localhost:8080
echo MessageBoard: http://localhost:8006
echo.
echo Press any key to close this window...
pause > nul
