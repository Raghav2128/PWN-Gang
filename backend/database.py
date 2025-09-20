"""
database.py
------------
This file sets up the database connection for our FastAPI backend.

- Uses SQLite as the database (medshare.db file in the project folder).
- Creates the SQLAlchemy engine (manages the actual connection).
- Defines a SessionLocal class (used to create sessions for queries).
- Defines a Base class (all our models/tables will inherit from this).
- Provides a get_db() function that gives each request its own database session
  and ensures the session is closed after the request finishes.

In short:
This file is the foundation for working with the database. 
Other files (models.py, main.py, etc.) will import Base and get_db from here.
"""

# Import the create_engine function to connect SQLAlchemy to a database
from sqlalchemy import create_engine

# Import declarative_base to create a base class for our database models (tables)
from sqlalchemy.ext.declarative import declarative_base

# Import sessionmaker to create database sessions (connections to run queries)
from sqlalchemy.orm import sessionmaker

# Uses SQLite database and saves the file in the current folder
SQLALCHEMY_DATABASE_URL = "sqlite:///./medshare.db"

# Engine manages the connection to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Session is a factory for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is a class all of our database models will inherit from
Base = declarative_base()

# Dependency for FastAPI: creates and cleans up a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()