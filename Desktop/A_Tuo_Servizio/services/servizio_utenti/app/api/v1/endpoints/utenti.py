from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ....crud import crud_utente
from ....schemas import utente as schemas_utente
from ....db import database, models # Added models import
from ....db.database import get_db
from ....core.security import create_access_token
from ....core.config import settings
from .. import deps # Import the dependencies

router = APIRouter()

@router.post("/registra", response_model=schemas_utente.UserRead, status_code=status.HTTP_201_CREATED)
def registra_utente(
    user: schemas_utente.UserCreate, 
    db: Session = Depends(get_db)
):
    db_user = crud_utente.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    created_user = crud_utente.create_user(db=db, user=user)
    return created_user

@router.post("/login", response_model=schemas_utente.TokenSchema)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud_utente.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user account is active and verified
    if user.stato_account == "non_verificato":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User account is not verified. Please verify your account."
        )
    if user.stato_account != "attivo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"User account is {user.stato_account}. Please contact support."
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": user.id, "sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas_utente.UserRead)
async def read_users_me(
    current_user: models.utente.Utente = Depends(deps.get_current_active_user)
):
    """
    Get current logged-in user.
    """
    return current_user

@router.put("/me", response_model=schemas_utente.UserRead)
async def update_user_me(
    user_in: schemas_utente.UserUpdateSchema,
    db: Session = Depends(database.get_db),
    current_user: models.utente.Utente = Depends(deps.get_current_active_user)
):
    """
    Update current logged-in user.
    """
    updated_user = crud_utente.update_user(db=db, db_user=current_user, user_in=user_in)
    return updated_user
