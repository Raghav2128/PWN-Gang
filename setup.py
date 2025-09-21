#!/usr/bin/env python3
"""
Setup script for PWN-Gang MedShare Application
This script helps initialize the database and create sample data
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command: {command}")
        print(f"Exception: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ['logs', 'backend/__pycache__', 'MessageBoard/__pycache__', 'Chatbot/Backend/__pycache__']
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    print("✓ Created necessary directories")

def install_dependencies():
    """Install Python dependencies"""
    print("Installing dependencies...")
    
    # Backend dependencies
    backend_deps = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0", 
        "sqlalchemy==2.0.23",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0"
    ]
    
    for dep in backend_deps:
        if not run_command(f"pip install {dep}"):
            print(f"Failed to install {dep}")
            return False
    
    # MessageBoard dependencies
    messageboard_deps = ["fastapi", "uvicorn", "jinja2", "python-multipart"]
    for dep in messageboard_deps:
        if not run_command(f"pip install {dep}"):
            print(f"Failed to install {dep}")
            return False
    
    # Chatbot dependencies
    chatbot_deps = ["fastapi", "uvicorn", "python-dotenv", "google-generativeai"]
    for dep in chatbot_deps:
        if not run_command(f"pip install {dep}"):
            print(f"Failed to install {dep}")
            return False
    
    print("✓ Dependencies installed successfully")
    return True

def create_env_file():
    """Create .env file for chatbot if it doesn't exist"""
    env_file = Path("Chatbot/Backend/.env")
    if not env_file.exists():
        env_content = """# Google Gemini API Key
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here
"""
        env_file.write_text(env_content)
        print("✓ Created .env file for chatbot (please add your GEMINI_API_KEY)")
    else:
        print("✓ .env file already exists")

def main():
    """Main setup function"""
    print("PWN-Gang MedShare Application Setup")
    print("===================================")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✓ Python {sys.version.split()[0]} detected")
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if not install_dependencies():
        print("Error: Failed to install dependencies")
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    print("\nSetup completed successfully!")
    print("\nNext steps:")
    print("1. Add your GEMINI_API_KEY to Chatbot/Backend/.env")
    print("2. Run: make start-all")
    print("3. Open: http://localhost:3000")
    print("\nFor help, run: make help")

if __name__ == "__main__":
    main()
