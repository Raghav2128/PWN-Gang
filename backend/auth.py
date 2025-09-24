"""
auth.py
--------
Handles authentication and security:
- Password hashing and verification using bcrypt.
- JWT (JSON Web Token) for creating and decoding.
- Utility functions for validating access tokens.

How it works:
- When a user logs in, we hash their password and compare with the stored hash.
- If valid, we create a JWT token with an expiration time.
- Protected endpoints can call verify_token() to check validity of the token.
"""

from datetime import datetime, timedelta   # for token expiration times
from typing import Optional                # allows optional arguments
from jose import JWTError, jwt             # to create and decode JWT tokens
from passlib.context import CryptContext   # for password hashing
from fastapi import HTTPException, status  # to raise errors in FastAPI
import os                                  # (optional) for environment variables

# Configuration

# Secret key used to sign the JWT tokens.
SECRET_KEY = "your-secret-key-change-this-in-production"

# Algorithm for signing JWT tokens. HS256 = HMAC with SHA-256.
ALGORITHM = "HS256"

# Default token expiration time (in minutes).
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password Hashing

# Passlib provides a context to handle hashing/verification.
# We use bcrypt algorithm here.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Verify a plain password against a hashed one.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Hash a plain password before storing it in the database.
def get_password_hash(password):
    return pwd_context.hash(password)

# JWT token creation

# Create a new access token (JWT).
# `data` = dictionary of values to include in the token (e.g., {"sub": user.email})
# `expires_delta` = optional custom expiration time
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()   # copy so we don't modify the original
    if expires_delta:
        expire = datetime.utcnow() + expires_delta  # use custom expiration
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # default = 15 min
    to_encode.update({"exp": expire})   # add expiration time to the token payload
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # sign it
    return encoded_jwt

# JWT token verification

# Decode and validate a token. If invalid/expired, raise HTTP 401 Unauthorized.
def verify_token(token: str):
    try:
        # Decode token with our secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract the "sub" (subject, usually the user’s email/ID)
        email: str = payload.get("sub")
        if email is None:
            # If no subject found, reject the token
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email   # return the subject (email) for later use
    except JWTError:
        # If token is expired, invalid, or tampered with → reject
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )