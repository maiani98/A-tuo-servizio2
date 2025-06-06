from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

# Import settings from the main application to use the same SECRET_KEY and ALGORITHM
from ...app.core.config import settings as app_settings

def generate_valid_jwt_token(
    user_id: int, 
    tipo_utente: str, 
    profilo_id: int, # Crucial for Servizio Portfolio
    email: str = "test.user@example.com",
    expires_delta_minutes: Optional[int] = None
) -> str:
    """
    Generates a JWT token for testing purposes for Servizio Portfolio.
    Includes user_id, tipo_utente, profilo_id, and email (sub).
    """
    if expires_delta_minutes is None:
        expires_delta = timedelta(minutes=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        expires_delta = timedelta(minutes=expires_delta_minutes)
        
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "user_id": user_id,
        "sub": email,
        "tipo_utente": tipo_utente,
        "profilo_id": profilo_id, # Added profilo_id to the token payload
        "exp": expire,
    }
    encoded_jwt = jwt.encode(to_encode, app_settings.SECRET_KEY, algorithm=app_settings.ALGORITHM)
    return encoded_jwt
