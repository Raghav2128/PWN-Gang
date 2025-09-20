"""
main.py
--------
This is the main entry point for the MedShare API.

Features:
- User authentication (register/login with JWT)
- Profile management (view/update medical info)
- Dorm management (sample dorms auto-created at startup)
- Medicine inventory (add/list medicines per user)
- Requests (create/list requests within a dorm community)

Security:
- JWT-based auth using HTTPBearer
- Protected routes require a valid token
"""

from fastapi import FastAPI, Depends, HTTPException, status   # FastAPI core tools
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # for JWT auth via "Bearer <token>"
from sqlalchemy.orm import Session                            # database session
from database import get_db, engine, Base                     # our DB setup
from models import User, Dorm, Medicine, Request              # database models (tables)
from schemas import UserCreate, UserResponse, MedicineCreate, MedicineResponse, RequestCreate, RequestResponse, DormResponse
from auth import verify_password, get_password_hash, create_access_token, verify_token  # auth helpers
from datetime import timedelta
import json
from auth import ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.middleware.cors import CORSMiddleware

# Database setup

# Automatically create all database tables defined in models.py
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="MedShare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (fine for hackathon/demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the security scheme (HTTP Bearer token in headers)
security = HTTPBearer()

# Helper: Get current user from token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials              # extract token string
    email = verify_token(token)                  # decode & verify token
    user = db.query(User).filter(User.email == email).first()   # look up user in DB
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Startup: preload dorm data

@app.on_event("startup")
def create_sample_data():
    db = next(get_db())
    # Only add dorms if none exist yet
    if not db.query(Dorm).first():
        dorms = [
            Dorm(name="North Dorm", location="North Campus"),
            Dorm(name="South Dorm", location="South Campus"),
            Dorm(name="East Dorm", location="East Campus"),
            Dorm(name="West Dorm", location="West Campus"),
        ]
        for dorm in dorms:
            db.add(dorm)
        db.commit()

# Authentication Endpoints

# Register a new user
@app.post("/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        dorm_id=user.dorm_id,
        medical_conditions=user.medical_conditions,
        allergies=user.allergies
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Log in existing user (returns JWT token)
@app.post("/auth/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    # Verify credentials
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create a JWT token that expires after set time
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User Profile Endpoints

# View current user's profile
@app.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Update current user's profile
@app.put("/profile", response_model=UserResponse)
def update_profile(
    medical_conditions: str = None,
    allergies: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if medical_conditions is not None:
        current_user.medical_conditions = medical_conditions
    if allergies is not None:
        current_user.allergies = allergies
    
    db.commit()
    db.refresh(current_user)
    return current_user

# Medicine Inventory Endpoints

# Add medicine to current user's inventory
@app.post("/medicines", response_model=MedicineResponse)
def add_medicine(medicine: MedicineCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_medicine = Medicine(
        name=medicine.name,
        quantity=medicine.quantity,
        expiration_date=medicine.expiration_date,
        owner_id=current_user.id
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

# View all medicines owned by current user
@app.get("/medicines", response_model=list[MedicineResponse])
def get_my_medicines(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Medicine).filter(Medicine.owner_id == current_user.id).all()

# Dorm endpoints

# List all dorms
@app.get("/dorms", response_model=list[DormResponse])
def get_dorms(db: Session = Depends(get_db)):
    return db.query(Dorm).all()

# Request Endpoints

# Create a new medicine request
@app.post("/requests", response_model=RequestResponse)
def create_request(request: RequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_request = Request(
        requester_id=current_user.id,
        medicine_name=request.medicine_name,
        quantity_requested=request.quantity_requested,
        message=request.message
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

# View all requests in the current user's dorm
@app.get("/requests", response_model=list[RequestResponse])
def get_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Request).join(User, Request.requester_id == User.id).filter(User.dorm_id == current_user.dorm_id).all()

# RUN APP (when executed directly)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)