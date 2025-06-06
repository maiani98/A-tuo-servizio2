from typing import List, Optional
from sqlalchemy.orm import Session

from ..db.models.media_progetto import MediaProgettoModel
from ..schemas import media_schemas

def create_media_for_progetto(db: Session, *, media_in: media_schemas.MediaProgettoCreate, progetto_id: int) -> MediaProgettoModel:
    db_media = MediaProgettoModel(
        **media_in.dict(), 
        progetto_portfolio_id=progetto_id
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

def get_media_by_progetto_id(db: Session, *, progetto_id: int, skip: int = 0, limit: int = 100) -> List[MediaProgettoModel]:
    return db.query(MediaProgettoModel)\
             .filter(MediaProgettoModel.progetto_portfolio_id == progetto_id)\
             .order_by(MediaProgettoModel.ordine, MediaProgettoModel.data_creazione.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_media_by_id(db: Session, *, media_id: int) -> Optional[MediaProgettoModel]:
    """
    Recupera un media specifico per ID. Non verifica l'appartenenza al progetto qui.
    L'appartenenza deve essere verificata nel chiamante (es. endpoint API) se necessario.
    """
    return db.query(MediaProgettoModel)\
             .filter(MediaProgettoModel.id == media_id)\
             .first()

def update_media(db: Session, *, db_media: MediaProgettoModel, media_in: media_schemas.MediaProgettoUpdate) -> MediaProgettoModel:
    update_data = media_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_media, field, value)
    
    db.add(db_media) # SQLAlchemy gestisce l'update se l'oggetto è già nel DB
    db.commit()
    db.refresh(db_media)
    return db_media

def delete_media(db: Session, *, db_media: MediaProgettoModel) -> MediaProgettoModel:
    """
    Elimina l'oggetto media fornito.
    Restituisce l'oggetto eliminato (prima del commit finale della sessione).
    """
    db.delete(db_media)
    db.commit()
    return db_media # L'oggetto è "detached" dopo il commit se la sessione scade o viene chiusa, ma contiene ancora i dati.
