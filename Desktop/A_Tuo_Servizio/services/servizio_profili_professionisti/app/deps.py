from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt 
from sqlalchemy.orm import Session

from .core.config import settings
from .db.database import get_db
from pydantic import BaseModel, EmailStr

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[int] = None
    tipo_utente: Optional[str] = None # Aggiunto tipo_utente

# Aggiorna tokenUrl se necessario, per ora è un placeholder
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/api/v1/utenti/login") 

async def get_current_user_from_token(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> TokenData: 
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[int] = payload.get("user_id")
        email: Optional[str] = payload.get("sub") 
        tipo_utente: Optional[str] = payload.get("tipo_utente") # Estrai tipo_utente

        if user_id is None or email is None or tipo_utente is None: # Verifica anche tipo_utente
            raise credentials_exception
        
        token_data = TokenData(user_id=user_id, email=email, tipo_utente=tipo_utente)

    except JWTError:
        raise credentials_exception
    
    return token_data

async def get_current_active_user( # Questo potrebbe essere rinominato o adattato se non c'è un concetto di "attivo" in questo servizio
    current_user: TokenData = Depends(get_current_user_from_token)
) -> TokenData:
    # Qui potresti aggiungere logica specifica se il servizio profili dovesse
    # verificare lo stato del profilo o permessi specifici basati sul profilo.
    # Per ora, restituisce semplicemente i dati del token validato.
    # Esempio: se il profilo avesse uno stato 'sospeso' in questo DB:
    # profile_details = crud_profilo.get_profilo_by_user_id(db_session_for_this_check, user_id=current_user.user_id)
    # if profile_details and profile_details.stato == 'sospeso':
    #     raise HTTPException(status_code=403, detail="Profile is suspended")
    return current_user
