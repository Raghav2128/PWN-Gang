# Import the create_engine function to connect SQLAlchemy to a database
from sqlalchemy import create_engine

# Import declarative_base to create a base class for our database models (tables)
from sqlalchemy.ext.declarative import declarative_base

# Import sessionmaker to create database sessions (connections to run queries)
from sqlalchemy.orm import sessionmaker

# Uses SQLite database and saves the file in the current folder
SQLALCHEMY_DATABASE_URL = "sqlite:///./medshare.db"

