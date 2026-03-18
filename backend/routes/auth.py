from fastapi import APIRouter, HTTPException, status
from models import UserCreate, UserLogin, Token
from database import user_collection
from security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Registers a new user in the database."""
    # Check if user already exists
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Hash the password before storing
    hashed_password = get_password_hash(user.password)
    
    user_data = {
        "fullName": user.fullName,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    await user_collection.insert_one(user_data)
    
    return {"message": "User registered successfully!"}


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    """Authenticates user and returns a JWT token."""
    user = await user_collection.find_one({"email": form_data.email})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["email"]}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}