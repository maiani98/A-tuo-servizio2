from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from ..core import security
from ..db import database, models
from ..schemas.utente import TokenData # Ensure this path is correct
from ..crud import crud_utente
from ..core.config import settings # Import settings to use ALGORITHM and SECRET_KEY for decoding

# tokenUrl should match the path to your login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/utenti/login")

async def get_current_user(
    db: Session = Depends(database.get_db), 
    token: str = Depends(oauth2_scheme)
) -> models.utente.Utente:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: Optional[int] = payload.get("user_id")
    email: Optional[str] = payload.get("sub") # 'sub' is often used for the username/email

    if user_id is None and email is None: # Check if identifier is present
        raise credentials_exception
    
    # Optional: Validate payload with TokenData schema if you have specific structure for it
    # try:
    #     token_data = TokenData(email=email, user_id=user_id) # Adjust based on your TokenData fields
    # except Exception: # Replace with Pydantic's ValidationError if possible
    #     raise credentials_exception

    user: Optional[models.utente.Utente] = None
    if user_id:
        user = crud_utente.get_user_by_id(db, user_id=user_id)
    elif email: # Fallback or primary way if user_id is not in token
        user = crud_utente.get_user_by_email(db, email=email)

    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: models.utente.Utente = Depends(get_current_user)
) -> models.utente.Utente:
    if current_user.stato_account != "attivo":
        # Before raising HTTPException, check if the account is 'non_verificato' to give a more specific error.
        if current_user.stato_account == "non_verificato":
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is not verified. Please verify your account.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user
