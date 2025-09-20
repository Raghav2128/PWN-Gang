"""
models.py
---------
This file defines the database tables (models) for our app using SQLAlchemy ORM.

Tables:
- User: stores account info, dorm assignment, medical conditions/allergies.
- Dorm: represents a dorm building; links to its users.
- Medicine: medicines owned by users, with quantity and expiration.
- Request: anonymized medicine requests between users.

Each model includes relationships so we can easily navigate:
- User <-> Dorm
- User <-> Medicine
- User <-> Request (sent/received)
- Request <-> User (requester/provider)
"""

# Column types (Integer, String, etc.) define what kind of data each field stores
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey

# relationship() is used to link models together (like foreign keys in SQL)
from sqlalchemy.orm import relationship

# Base comes from database.py — all models must inherit from it
from database import Base

# datetime is used for timestamps (created_at, expiration, etc.)
from datetime import datetime

# User Table

class User(Base):
    __tablename__ = "users" # Name of the table in the database


    # Columns = fields in the users table
    id = Column(Integer, primary_key=True, index=True)         # unique user ID
    email = Column(String, unique=True, index=True)            # user email (must be unique)
    hashed_password = Column(String)                           # password (stored as hash, not plain text)
    first_name = Column(String)                                # first name
    last_name = Column(String)                                 # last name
    dorm_id = Column(Integer, ForeignKey("dorms.id"))          # dorm this user belongs to
    medical_conditions = Column(Text)                          # stored as JSON string (list of conditions)
    allergies = Column(Text)                                   # stored as JSON string (list of allergies)
    is_active = Column(Boolean, default=True)                  # active/inactive flag
    created_at = Column(DateTime, default=datetime.utcnow)     # timestamp when account was created

    # Relationships (links to other tables)
    dorm = relationship("Dorm", back_populates="users")        # User belongs to a Dorm
    medicines = relationship("Medicine", back_populates="owner") # User owns many Medicines
    requests_sent = relationship(
        "Request", foreign_keys="Request.requester_id", back_populates="requester"
    )   # Requests this user has SENT
    requests_received = relationship(
        "Request", foreign_keys="Request.provider_id", back_populates="provider"
    )   # Requests this user has RECEIVED

class Dorm(Base):
    __tablename__ = "dorms"

    id = Column(Integer, primary_key=True, index=True) # Unique dorm ID
    name = Column(String, index=True) # Dorm name
    location = Column(String, index=True) # Dorm location

    # Relationships
    users = relationship("User", back_populates="dorm") # Dorm has many Users
    
# Medicine Table

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)         # medicine ID
    name = Column(String, index=True)                          # medicine name (e.g., ibuprofen)
    quantity = Column(Integer)                                 # how many pills/items are available
    expiration_date = Column(DateTime)                         # expiration date
    owner_id = Column(Integer, ForeignKey("users.id"))         # links to User who owns it
    created_at = Column(DateTime, default=datetime.utcnow)     # timestamp when added
    
    # Relationships
    owner = relationship("User", back_populates="medicines")   # Medicine belongs to a User

# Request Table

class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)         # request ID
    requester_id = Column(Integer, ForeignKey("users.id"))     # user who made the request
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=True) # user who will fulfill it
    medicine_name = Column(String)                             # requested medicine (string version)
    quantity_requested = Column(Integer)                       # how many units requested
    message = Column(Text)                                     # optional message ("I need it for headache")
    status = Column(String, default="pending")                 # request status: pending, accepted, declined, completed
    is_anonymous = Column(Boolean, default=True)               # whether requester is anonymous until accepted
    created_at = Column(DateTime, default=datetime.utcnow)     # timestamp when request was created
    expires_at = Column(DateTime)                              # when request should expire


    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="requests_sent")
    provider = relationship("User", foreign_keys=[provider_id], back_populates="requests_received")