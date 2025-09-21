# PWN-Gang MedShare Application

A comprehensive medical sharing platform for ASU students living in dorms, featuring request management, inventory tracking, and real-time chat communication.

## Features

- **User Authentication**: Secure login/registration with ASU email validation
- **Medical Request System**: Create and manage medicine requests with urgency levels
- **Inventory Management**: Track personal medicine inventory
- **Real-time Chat**: Secure chat rooms for accepted requests
- **Health Assistant**: AI-powered chatbot for medical advice
- **Dorm-based Community**: Connect with students in your dorm

## Quick Start

1. **Install dependencies and start all services:**
   ```bash
   # On Windows
   start.bat
   
   # On Linux/Mac
   ./start.sh
   ```

2. **Access the application:**
   - Main App: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Chatbot: Integrated in main app (click the robot icon in bottom-right corner)

## Service Architecture

- **Backend API** (Port 8000): Main FastAPI application with authentication, requests, and inventory management
- **MessageBoard** (Port 8001): WebSocket-based chat service for real-time communication
- **Chatbot** (Port 8002): AI health assistant powered by Google Gemini
- **Frontend** (Port 3000): Static file server for all frontend components

## Available Commands

```bash
# Start all services
start.bat              # Windows
./start.sh             # Linux/Mac

# Install dependencies manually
cd backend && pip install -r requirements.txt
cd ../MessageBoard && pip install fastapi uvicorn jinja2 python-multipart
cd ../Chatbot/Backend && pip install -r requirements.txt
```

## How It Works

1. **Registration/Login**: Students register with ASU email and dorm information
2. **Create Requests**: Submit medicine requests with urgency levels and preferences
3. **Accept Requests**: Other students can accept requests from their dorm
4. **Chat Integration**: When a request is accepted, both users are redirected to a unique chat room
5. **Inventory Management**: Track and manage personal medicine inventory
6. **Health Assistant**: Get AI-powered medical advice through the chatbot

## Medical Request Flow

1. User creates a medical request with medicine name, quantity, and urgency
2. Request appears in the dorm's request feed
3. Another user accepts the request
4. System generates a unique chat room URL
5. Both users are redirected to the same chat room for coordination
6. Users can communicate securely to arrange medicine sharing

## Technology Stack

- **Backend**: FastAPI, SQLAlchemy, JWT Authentication
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: SQLite (development)
- **Real-time**: WebSockets
- **AI**: Google Gemini API
- **Deployment**: Python HTTP servers

## Development

For development, you can start individual services:

```bash
# Backend API
cd backend && python main.py

# MessageBoard (Chat service)
cd MessageBoard && python main.py

# Chatbot
cd Chatbot/Backend && python main.py

# Frontend server
python -m http.server 3000
```

## Security Features

- JWT-based authentication
- ASU email domain validation
- Dorm-based request filtering
- Secure WebSocket connections
- Input validation and sanitization

## Contributing

This is a hackathon project by the PWN-Gang team. Feel free to contribute improvements and new features!
