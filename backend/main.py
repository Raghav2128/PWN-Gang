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

# Create sample dorms if they don't exist
def create_sample_dorms():
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Check if dorms already exist
        if db.query(Dorm).count() == 0:
            sample_dorms = [
                {"id": 1, "name": "Barrett, The Honors College", "location": "Tempe Campus"},
                {"id": 2, "name": "Hassayampa Academic Village", "location": "Tempe Campus"},
                {"id": 3, "name": "Tooker House", "location": "Tempe Campus"},
                {"id": 4, "name": "San Pablo", "location": "Tempe Campus"},
                {"id": 5, "name": "Sonora Center", "location": "Tempe Campus"},
                {"id": 6, "name": "Vista del Sol", "location": "Tempe Campus"},
                {"id": 7, "name": "Adelphi Commons", "location": "Tempe Campus"},
                {"id": 8, "name": "Best Hall", "location": "Tempe Campus"},
                {"id": 9, "name": "Irish Hall", "location": "Tempe Campus"},
                {"id": 10, "name": "Lawson Hall", "location": "Tempe Campus"},
                {"id": 11, "name": "Papago Park", "location": "Tempe Campus"},
                {"id": 12, "name": "Norte", "location": "Tempe Campus"},
                {"id": 13, "name": "Manzy", "location": "Tempe Campus"},
            ]
            
            for dorm_data in sample_dorms:
                dorm = Dorm(id=dorm_data["id"], name=dorm_data["name"], location=dorm_data["location"])
                db.add(dorm)
            
            db.commit()
            print("Sample dorms created successfully!")
    except Exception as e:
        print(f"Error creating sample dorms: {e}")
        db.rollback()
    finally:
        db.close()

# Create sample dorms on startup
create_sample_dorms()

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

# Authentication Endpoints

# Register a new user
@app.post("/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Enforce ASU email domain
    if not user.email.endswith("@asu.edu"):
        raise HTTPException(status_code=400, detail="Only @asu.edu emails are allowed")

    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
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

# Accept a medical request
@app.post("/requests/{request_id}/accept")
def accept_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get the request
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if user is in the same dorm as requester
    requester = db.query(User).filter(User.id == request.requester_id).first()
    if not requester or requester.dorm_id != current_user.dorm_id:
        raise HTTPException(status_code=403, detail="You can only accept requests from your dorm")
    
    # Generate a unique chat room URL
    import uuid
    chat_room_id = str(uuid.uuid4())
    
    # Update request status
    request.status = "accepted"
    request.accepted_by_id = current_user.id
    request.chat_room_id = chat_room_id
    db.commit()
    
    return {
        "message": "Request accepted successfully",
        "chat_room_url": f"http://localhost:8001/chat/{chat_room_id}",
        "chat_room_id": chat_room_id
    }

# Decline a medical request
@app.post("/requests/{request_id}/decline")
def decline_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if user is in the same dorm as requester
    requester = db.query(User).filter(User.id == request.requester_id).first()
    if not requester or requester.dorm_id != current_user.dorm_id:
        raise HTTPException(status_code=403, detail="You can only decline requests from your dorm")
    
    # Update request status
    request.status = "declined"
    request.accepted_by_id = current_user.id
    db.commit()
    
    return {"message": "Request declined"}

# Cancel a medical request
@app.post("/requests/{request_id}/cancel")
def cancel_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    request = db.query(Request).filter(Request.id == request_id, Request.requester_id == current_user.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found or you don't have permission to cancel it")
    
    # Update request status
    request.status = "cancelled"
    db.commit()
    
    return {"message": "Request cancelled"}

# RUN APP (when executed directly)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)