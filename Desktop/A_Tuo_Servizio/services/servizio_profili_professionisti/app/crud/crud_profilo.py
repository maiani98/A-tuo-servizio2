from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..db.models.profilo import ProfiloProfessionista # Model
from ..schemas import profilo_schemas # Schemas

def get_profilo_by_user_id(db: Session, *, user_id: int) -> Optional[ProfiloProfessionista]:
    return db.query(ProfiloProfessionista).filter(ProfiloProfessionista.user_id == user_id).first()

def get_profilo_by_id(db: Session, *, profilo_id: int) -> Optional[ProfiloProfessionista]:
    return db.query(ProfiloProfessionista).filter(ProfiloProfessionista.id == profilo_id).first()

def create_profilo(db: Session, *, profilo_in: profilo_schemas.ProfiloProfessionistaCreate, user_id: int, tipo_utente_token: str) -> ProfiloProfessionista:
    # Verifica che l'utente sia un professionista
    if tipo_utente_token != 'professionista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo i professionisti possono creare un profilo."
        )

    # Verifica se esiste già un profilo per questo user_id
    existing_profilo = get_profilo_by_user_id(db, user_id=user_id)
    if existing_profilo:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profilo già esistente per questo utente."
        )
    
    # Convert Pydantic schema to dictionary, handling nested Pydantic models if any
    # For JSON fields that are Pydantic models, they need to be converted to dicts for SQLAlchemy's JSON type
    profilo_data = profilo_in.dict(exclude_unset=True)

    # Specifically convert nested Pydantic models to dict for JSON fields
    if profilo_in.indirizzo_sede_json:
        profilo_data['indirizzo_sede_json'] = profilo_in.indirizzo_sede_json.dict(exclude_unset=True)
    if profilo_in.link_social_json:
        profilo_data['link_social_json'] = profilo_in.link_social_json.dict(exclude_unset=True)
    # telefoni_pubblici_json is already a list of strings, so it's fine

    db_profilo = ProfiloProfessionista(**profilo_data, user_id=user_id)
    
    db.add(db_profilo)
    db.commit()
    db.refresh(db_profilo)
    return db_profilo

def update_profilo(db: Session, *, db_profilo: ProfiloProfessionista, profilo_in: profilo_schemas.ProfiloProfessionistaUpdate) -> ProfiloProfessionista:
    update_data = profilo_in.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field == "indirizzo_sede_json" and value is not None:
            # If indirizzo_sede_json is a Pydantic model from schema, convert to dict
            if isinstance(value, dict): # Already a dict from .dict() call
                 setattr(db_profilo, field, value)
            elif hasattr(value, 'dict'): # Is a Pydantic model
                 setattr(db_profilo, field, value.dict(exclude_unset=True))
            else: # Fallback if it's some other type (should ideally not happen with proper schema use)
                 setattr(db_profilo, field, value)

        elif field == "link_social_json" and value is not None:
            # If link_social_json is a Pydantic model from schema, convert to dict
            if isinstance(value, dict):
                setattr(db_profilo, field, value)
            elif hasattr(value, 'dict'):
                setattr(db_profilo, field, value.dict(exclude_unset=True))
            else:
                setattr(db_profilo, field, value)
        else:
            setattr(db_profilo, field, value)
            
    # data_aggiornamento si aggiorna automaticamente grazie a onupdate=func.now() nel modello
    db.add(db_profilo)
    db.commit()
    db.refresh(db_profilo)
    return db_profilo
