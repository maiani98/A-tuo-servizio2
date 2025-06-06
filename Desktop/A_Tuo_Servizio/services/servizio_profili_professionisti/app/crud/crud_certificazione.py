from typing import List, Optional
from sqlalchemy.orm import Session

from ..db.models.certificazione import Certificazione
from ..schemas import certificazione_schemas as schemas_cert

def create_profilo_certificazione(db: Session, *, certificazione_in: schemas_cert.CertificazioneCreate, profilo_id: int) -> Certificazione:
    db_certificazione = Certificazione(**certificazione_in.dict(), profilo_id=profilo_id)
    db.add(db_certificazione)
    db.commit()
    db.refresh(db_certificazione)
    return db_certificazione

def get_certificazioni_by_profilo_id(db: Session, *, profilo_id: int, skip: int = 0, limit: int = 100) -> List[Certificazione]:
    return db.query(Certificazione)\
             .filter(Certificazione.profilo_id == profilo_id)\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_certificazione_by_id_and_profilo_id(db: Session, *, certificazione_id: int, profilo_id: int) -> Optional[Certificazione]:
    return db.query(Certificazione)\
             .filter(Certificazione.id == certificazione_id, Certificazione.profilo_id == profilo_id)\
             .first()

def update_certificazione(db: Session, *, db_certificazione: Certificazione, certificazione_in: schemas_cert.CertificazioneUpdate) -> Certificazione:
    update_data = certificazione_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_certificazione, field, value)
    
    db.add(db_certificazione)
    db.commit()
    db.refresh(db_certificazione)
    return db_certificazione

def delete_certificazione(db: Session, *, certificazione_id: int, profilo_id: int) -> Optional[Certificazione]:
    db_certificazione = get_certificazione_by_id_and_profilo_id(db, certificazione_id=certificazione_id, profilo_id=profilo_id)
    if db_certificazione:
        db.delete(db_certificazione)
        db.commit()
    return db_certificazione
