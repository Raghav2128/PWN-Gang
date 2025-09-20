"""
schemas.py
-----------
This file defines Pydantic models (schemas) for request validation
and response formatting in FastAPI.

- User schemas: handle signup, login, and returning user info (without exposing password).
- Medicine schemas: handle adding medicines and returning inventory info.
- Request schemas: handle medicine requests and return request status.
- Dorm schemas: handle dorm creation and listing.

These schemas sit between the database models (models.py) and the API endpoints,
making sure that data passed in/out of the API is clean, validated, and secure.
"""

# Pydantic is used for data validation and serialization in FastAPI
from pydantic import BaseModel, EmailStr

# Optional lets fields be None, List can define arrays
from typing import Optional, List

# datetime type for timestamps (created_at, expiration_date, etc.)
from datetime import datetime

# User Schemas

# Shared fields for all user schemas
class UserBase(BaseModel):
    email: EmailStr             # validate that this is a proper email
    first_name: str             # user’s first name
    last_name: str              # user’s last name
    dorm_id: int                # dorm the user belongs to (foreign key in DB)

# Schema used when creating a new user (sign-up)
class UserCreate(UserBase):
    password: str                             # plain password (will be hashed in backend)
    medical_conditions: Optional[str] = None  # optional medical conditions (JSON string for now)
    allergies: Optional[str] = None           # optional allergies (JSON string for now)

# Schema returned when sending user data back to the frontend
class UserResponse(UserBase):
    id: int                  # user ID
    is_active: bool          # whether account is active
    created_at: datetime     # when the account was created
    
    class Config:
        from_attributes = True   # allows conversion from SQLAlchemy model to Pydantic schema

# Medicine Schemas

# Shared fields for medicines
class MedicineBase(BaseModel):
    name: str                # medicine name (e.g., ibuprofen)
    quantity: int            # how many units are available
    expiration_date: datetime # expiration date (could later be just a Date)

# Schema used when creating a medicine entry
class MedicineCreate(MedicineBase):
    pass  # no extra fields needed for creation, so we just reuse MedicineBase

# Schema returned when sending medicine info back to the frontend
class MedicineResponse(MedicineBase):
    id: int                  # medicine ID
    owner_id: int            # which user owns it
    created_at: datetime     # when it was added
    
    class Config:
        from_attributes = True   # convert from SQLAlchemy model automatically

# Request Schemas

# Shared fields for a medicine request
class RequestBase(BaseModel):
    medicine_name: str             # which medicine is being requested
    quantity_requested: int        # how many units are requested
    message: Optional[str] = None  # optional message (e.g., "for headache")

# Schema used when creating a request
class RequestCreate(RequestBase):
    pass  # same fields as RequestBase, no extras needed

# Schema returned when sending request info back to the frontend
class RequestResponse(RequestBase):
    id: int               # request ID
    requester_id: int     # who made the request
    status: str           # status (pending, accepted, declined, completed)
    is_anonymous: bool    # whether the requester is hidden
    created_at: datetime  # when the request was created
    
    class Config:
        from_attributes = True   # convert from SQLAlchemy model automatically

# Dorm Schemas

# Shared fields for dorms
class DormBase(BaseModel):
    name: str             # dorm name
    location: str         # dorm location (optional extra info)

# Schema returned when sending dorm info back to the frontend
class DormResponse(DormBase):
    id: int               # dorm ID
    
    class Config:
        from_attributes = True   # convert from SQLAlchemy model automatically