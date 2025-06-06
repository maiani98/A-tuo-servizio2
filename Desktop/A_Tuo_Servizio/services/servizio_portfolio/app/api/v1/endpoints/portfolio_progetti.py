from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ....app.db import database
from ....app.schemas import progetto_schemas
from ....app.crud import crud_progetto_portfolio
from ....app.deps import get_current_user_data_from_token, TokenData

# Router per la gestione da parte del professionista autenticato
router_management = APIRouter()

# Router per la visualizzazione pubblica
router_public_view = APIRouter()


# --- Endpoints per la Gestione del Portfolio (Professionista Autenticato) ---
@router_management.post(
    "/", 
    response_model=progetto_schemas.ProgettoPortfolioRead, 
    status_code=status.HTTP_201_CREATED
)
def create_nuovo_progetto_portfolio(
    progetto_in: progetto_schemas.ProgettoPortfolioCreate,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
):
    # La dipendenza get_current_user_data_from_token già verifica se tipo_utente == 'professionista'
    # e fornisce profilo_id.
    profilo_id = current_user_data.profilo_id
    
    return crud_progetto_portfolio.create_progetto(db=db, progetto_in=progetto_in, profilo_id=profilo_id)

@router_management.get(
    "/", 
    response_model=List[progetto_schemas.ProgettoPortfolioRead]
)
def read_progetti_portfolio_del_professionista(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
):
    profilo_id = current_user_data.profilo_id
    return crud_progetto_portfolio.get_progetti_by_profilo_id(db=db, profilo_id=profilo_id, skip=skip, limit=limit)

@router_management.get(
    "/{progetto_id}/", 
    response_model=progetto_schemas.ProgettoPortfolioRead
)
def read_singolo_progetto_portfolio_del_professionista(
    progetto_id: int,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
):
    profilo_id = current_user_data.profilo_id
    db_progetto = crud_progetto_portfolio.get_progetto_by_id_and_profilo_id(
        db=db, progetto_id=progetto_id, profilo_id=profilo_id
    )
    if db_progetto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progetto non trovato o non appartenente a questo profilo.")
    return db_progetto

@router_management.put(
    "/{progetto_id}/", 
    response_model=progetto_schemas.ProgettoPortfolioRead
)
def update_progetto_portfolio_del_professionista(
    progetto_id: int,
    progetto_update_data: progetto_schemas.ProgettoPortfolioUpdate,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
):
    profilo_id = current_user_data.profilo_id
    db_progetto = crud_progetto_portfolio.get_progetto_by_id_and_profilo_id(
        db=db, progetto_id=progetto_id, profilo_id=profilo_id
    )
    if db_progetto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progetto non trovato o non appartenente a questo profilo. Impossibile aggiornare.")
    
    return crud_progetto_portfolio.update_progetto(db=db, db_progetto=db_progetto, progetto_in=progetto_update_data)

@router_management.delete(
    "/{progetto_id}/", 
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_progetto_portfolio_del_professionista(
    progetto_id: int,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
):
    profilo_id = current_user_data.profilo_id
    deleted_progetto = crud_progetto_portfolio.delete_progetto(
        db=db, progetto_id=progetto_id, profilo_id=profilo_id
    )
    if deleted_progetto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progetto non trovato o non appartenente a questo profilo. Impossibile eliminare.")
    return None


# --- Endpoints per la Visualizzazione Pubblica del Portfolio ---
@router_public_view.get(
    "/", 
    response_model=List[progetto_schemas.ProgettoPortfolioRead]
)
def read_progetti_portfolio_pubblici(
    profilo_id_pub: int, # Path parameter dal prefisso del router
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    # Qui non c'è autenticazione, si basa sul profilo_id_pub dall'URL
    # Potrebbe essere utile verificare se il profilo_id_pub esiste nel servizio Profili,
    # ma per ora ci concentriamo sul recupero dei progetti se esistono.
    return crud_progetto_portfolio.get_progetti_by_profilo_id(db=db, profilo_id=profilo_id_pub, skip=skip, limit=limit)

@router_public_view.get(
    "/{progetto_id}/", 
    response_model=progetto_schemas.ProgettoPortfolioRead
)
def read_singolo_progetto_portfolio_pubblico(
    profilo_id_pub: int, # Path parameter
    progetto_id: int,    # Path parameter
    db: Session = Depends(database.get_db)
):
    db_progetto = crud_progetto_portfolio.get_progetto_for_public_view(
        db=db, progetto_id=progetto_id, profilo_id_pub=profilo_id_pub
    )
    if db_progetto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progetto non trovato per il profilo specificato.")
    return db_progetto
