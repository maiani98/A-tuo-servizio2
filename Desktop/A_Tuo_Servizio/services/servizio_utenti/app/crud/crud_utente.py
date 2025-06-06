from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func # Import func for now()
from fastapi import HTTPException

from ..db import models
from ..schemas import utente as schemas_utente
from ..core.security import hash_password, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[models.utente.Utente]:
    return db.query(models.utente.Utente).filter(models.utente.Utente.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[models.utente.Utente]:
    return db.query(models.utente.Utente).filter(models.utente.Utente.id == user_id).first()

def create_user(db: Session, user: schemas_utente.UserCreate) -> models.utente.Utente:
    if get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    db_user = models.utente.Utente(
        email=user.email,
        password_hash=hashed_password,
        nome=user.nome,
        cognome=user.cognome,
        tipo_utente=user.tipo_utente
        # stato_account will use the default 'non_verificato'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.utente.Utente]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def update_user(db: Session, *, db_user: models.utente.Utente, user_in: schemas_utente.UserUpdateSchema) -> models.utente.Utente:
    user_data = user_in.dict(exclude_unset=True) # Use exclude_unset to only get provided values
    for field, value in user_data.items():
        setattr(db_user, field, value)
    
    # The Utente model already has onupdate=func.now() for data_aggiornamento
    # So, it should be updated automatically when the record is changed and committed.
    # If not, or for explicit control:
    # db_user.data_aggiornamento = func.now() 

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
