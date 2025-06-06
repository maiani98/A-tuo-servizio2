from typing import List, Optional
from sqlalchemy.orm import Session

from ..db.models.progetto_portfolio import ProgettoPortfolioModel
from ..schemas import progetto_schemas

def create_progetto(db: Session, *, progetto_in: progetto_schemas.ProgettoPortfolioCreate, profilo_id: int) -> ProgettoPortfolioModel:
    db_progetto = ProgettoPortfolioModel(
        **progetto_in.dict(), 
        profilo_professionista_id=profilo_id
    )
    db.add(db_progetto)
    db.commit()
    db.refresh(db_progetto)
    return db_progetto

def get_progetti_by_profilo_id(db: Session, *, profilo_id: int, skip: int = 0, limit: int = 100) -> List[ProgettoPortfolioModel]:
    return db.query(ProgettoPortfolioModel)\
             .filter(ProgettoPortfolioModel.profilo_professionista_id == profilo_id)\
             .order_by(ProgettoPortfolioModel.ordine, ProgettoPortfolioModel.data_creazione.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_progetto_by_id_and_profilo_id(db: Session, *, progetto_id: int, profilo_id: int) -> Optional[ProgettoPortfolioModel]:
    return db.query(ProgettoPortfolioModel)\
             .filter(ProgettoPortfolioModel.id == progetto_id, ProgettoPortfolioModel.profilo_professionista_id == profilo_id)\
             .first()

def get_progetto_for_public_view(db: Session, *, progetto_id: int, profilo_id_pub: int) -> Optional[ProgettoPortfolioModel]:
    """
    Recupera un progetto specifico per la visualizzazione pubblica, 
    verificando che appartenga al profilo_id_pub specificato.
    """
    return db.query(ProgettoPortfolioModel)\
             .filter(ProgettoPortfolioModel.id == progetto_id, ProgettoPortfolioModel.profilo_professionista_id == profilo_id_pub)\
             .first()

def update_progetto(db: Session, *, db_progetto: ProgettoPortfolioModel, progetto_in: progetto_schemas.ProgettoPortfolioUpdate) -> ProgettoPortfolioModel:
    update_data = progetto_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_progetto, field, value)
    
    db.add(db_progetto) # SQLAlchemy gestisce l'update se l'oggetto è già nel DB
    db.commit()
    db.refresh(db_progetto)
    return db_progetto

def delete_progetto(db: Session, *, progetto_id: int, profilo_id: int) -> Optional[ProgettoPortfolioModel]:
    db_progetto = get_progetto_by_id_and_profilo_id(db, progetto_id=progetto_id, profilo_id=profilo_id)
    if db_progetto:
        db.delete(db_progetto)
        db.commit()
    return db_progetto
