from typing import Optional, Union
from sqlalchemy.orm import Session

from ..db.models.disponibilita import DisponibilitaGenerale
from ..schemas import disponibilita_schemas as schemas_disp

def get_disponibilita_by_profilo_id(db: Session, *, profilo_id: int) -> Optional[DisponibilitaGenerale]:
    return db.query(DisponibilitaGenerale)\
             .filter(DisponibilitaGenerale.profilo_id == profilo_id)\
             .first()

def upsert_profilo_disponibilita(
    db: Session, 
    *, 
    disponibilita_in: Union[schemas_disp.DisponibilitaGeneraleCreate, schemas_disp.DisponibilitaGeneraleUpdate], 
    profilo_id: int
) -> DisponibilitaGenerale:
    
    db_disponibilita = get_disponibilita_by_profilo_id(db, profilo_id=profilo_id)
    
    # Convert Pydantic schema to dictionary for JSON fields
    # This is important if orari_json contains Pydantic models (like OrarioLavorativo)
    disponibilita_data = disponibilita_in.dict(exclude_unset=True)
    
    if 'orari_json' in disponibilita_data and disponibilita_data['orari_json'] is not None:
        # Ensure each item in orari_json is a dict if it came from a Pydantic model list
        disponibilita_data['orari_json'] = [
            item.dict() if hasattr(item, 'dict') else item 
            for item in disponibilita_data['orari_json']
        ]

    if db_disponibilita:
        # Update existing record
        for field, value in disponibilita_data.items():
            setattr(db_disponibilita, field, value)
    else:
        # Create new record
        db_disponibilita = DisponibilitaGenerale(**disponibilita_data, profilo_id=profilo_id)
        db.add(db_disponibilita)
        
    db.commit()
    db.refresh(db_disponibilita)
    return db_disponibilita

def delete_disponibilita_by_profilo_id(db: Session, *, profilo_id: int) -> Optional[DisponibilitaGenerale]:
    db_disponibilita = get_disponibilita_by_profilo_id(db, profilo_id=profilo_id)
    if db_disponibilita:
        db.delete(db_disponibilita)
        db.commit()
    return db_disponibilita
