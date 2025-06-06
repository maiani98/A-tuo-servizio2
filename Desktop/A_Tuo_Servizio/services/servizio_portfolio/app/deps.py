from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

# Importa le impostazioni dal core.config del servizio corrente
from .core.config import settings
# Importa get_db dal database.py del servizio corrente
from .db.database import get_db

# Schema per i dati contenuti nel token.
# Assicurati che questo corrisponda a come i token sono generati nel Servizio Utenti
# e come sono interpretati/validati nel Servizio Profili.
# Per il Servizio Portfolio, è cruciale avere `profilo_id`.
class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None # 'sub' nel token JWT
    tipo_utente: Optional[str] = None
    profilo_id: Optional[int] = None # Assumiamo che il token contenga profilo_id

# L'URL del token punta al servizio di autenticazione (Servizio Utenti)
# Questo è un placeholder per la documentazione Swagger e per il client.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/api/v1/utenti/login") 

async def get_current_user_data_from_token(
    db: Session = Depends(get_db), # get_db da questo servizio (portfolio)
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
        tipo_utente: Optional[str] = payload.get("tipo_utente")
        profilo_id: Optional[int] = payload.get("profilo_id") # Estrai profilo_id

        if user_id is None or email is None or tipo_utente is None or profilo_id is None:
            # Se profilo_id è essenziale per questo servizio, la sua assenza è un errore.
            # Logica alternativa: se profilo_id non è nel token, potrebbe essere recuperato
            # dal Servizio Profili usando user_id, ma questo aggiunge complessità (chiamata inter-servizio).
            # Per ora, si assume che il token DEBBA contenere profilo_id.
            raise credentials_exception
        
        # Verifica che l'utente sia un professionista, se necessario per tutte le operazioni portfolio
        if tipo_utente != "professionista":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo i professionisti possono accedere a questa risorsa."
            )
            
        token_data = TokenData(
            user_id=user_id, 
            email=email, 
            tipo_utente=tipo_utente, 
            profilo_id=profilo_id
        )

    except JWTError:
        raise credentials_exception
    
    # Qui potresti voler verificare se il profilo_id esiste nel DB del Servizio Profili,
    # ma ciò richiederebbe una chiamata inter-servizio o la replica dei dati del profilo.
    # Per ora, ci fidiamo del token.
    
    return token_data
