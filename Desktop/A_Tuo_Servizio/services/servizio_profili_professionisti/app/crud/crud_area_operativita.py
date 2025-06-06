from typing import List, Optional
from sqlalchemy.orm import Session

from ..db.models.area_operativita import AreaOperativita
from ..schemas import area_operativita_schemas as schemas_ao

def create_profilo_area(db: Session, *, area_in: schemas_ao.AreaOperativitaCreate, profilo_id: int) -> AreaOperativita:
    db_area = AreaOperativita(**area_in.dict(), profilo_id=profilo_id)
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

def get_aree_by_profilo_id(db: Session, *, profilo_id: int, skip: int = 0, limit: int = 100) -> List[AreaOperativita]:
    return db.query(AreaOperativita)\
             .filter(AreaOperativita.profilo_id == profilo_id)\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_area_by_id_and_profilo_id(db: Session, *, area_id: int, profilo_id: int) -> Optional[AreaOperativita]:
    return db.query(AreaOperativita)\
             .filter(AreaOperativita.id == area_id, AreaOperativita.profilo_id == profilo_id)\
             .first()

def update_area(db: Session, *, db_area: AreaOperativita, area_in: schemas_ao.AreaOperativitaUpdate) -> AreaOperativita:
    update_data = area_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_area, field, value)
    
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

def delete_area(db: Session, *, area_id: int, profilo_id: int) -> Optional[AreaOperativita]:
    db_area = get_area_by_id_and_profilo_id(db, area_id=area_id, profilo_id=profilo_id)
    if db_area:
        db.delete(db_area)
        db.commit()
    return db_area
