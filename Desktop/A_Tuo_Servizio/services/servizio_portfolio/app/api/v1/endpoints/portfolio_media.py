from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ....app.db import database, models # Import models for ProgettoPortfolioModel type hint
from ....app.schemas import media_schemas
from ....app.crud import crud_media_progetto, crud_progetto_portfolio # Need crud_progetto_portfolio for helper
from ....app.deps import get_current_user_data_from_token, TokenData

router = APIRouter()

# Helper Dependency/Function
async def get_project_owned_by_user(
    progetto_id: int,
    db: Session = Depends(database.get_db), # Ensure get_db is correctly imported from database.py
    current_user_data: TokenData = Depends(get_current_user_data_from_token)
) -> models.progetto_portfolio.ProgettoPortfolioModel: # Use the actual model type
    profilo_id_from_token = current_user_data.profilo_id
    
    # Fetch the project and verify ownership in one go using existing CRUD
    db_progetto = crud_progetto_portfolio.get_progetto_by_id_and_profilo_id(
        db=db, progetto_id=progetto_id, profilo_id=profilo_id_from_token
    )
    if not db_progetto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progetto non trovato o non appartenente all'utente."
        )
    return db_progetto

@router.post(
    "/", 
    response_model=media_schemas.MediaProgettoRead, 
    status_code=status.HTTP_201_CREATED
)
def create_media_for_progetto(
    media_in: media_schemas.MediaProgettoCreate,
    progetto: models.progetto_portfolio.ProgettoPortfolioModel = Depends(get_project_owned_by_user), # Use helper
    db: Session = Depends(database.get_db)
):
    return crud_media_progetto.create_media_for_progetto(
        db=db, media_in=media_in, progetto_id=progetto.id
    )

@router.get(
    "/", 
    response_model=List[media_schemas.MediaProgettoRead]
)
def read_media_for_progetto(
    progetto: models.progetto_portfolio.ProgettoPortfolioModel = Depends(get_project_owned_by_user), # Use helper
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    return crud_media_progetto.get_media_by_progetto_id(
        db=db, progetto_id=progetto.id, skip=skip, limit=limit
    )

@router.get(
    "/{media_id}/", 
    response_model=media_schemas.MediaProgettoRead
)
def read_single_media_for_progetto(
    media_id: int,
    progetto: models.progetto_portfolio.ProgettoPortfolioModel = Depends(get_project_owned_by_user), # Use helper
    db: Session = Depends(database.get_db)
):
    db_media = crud_media_progetto.get_media_by_id(db=db, media_id=media_id)
    if db_media is None or db_media.progetto_portfolio_id != progetto.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Media non trovato o non appartenente a questo progetto."
        )
    return db_media

@router.put(
    "/{media_id}/", 
    response_model=media_schemas.MediaProgettoRead
)
def update_media_for_progetto(
    media_id: int,
    media_update_data: media_schemas.MediaProgettoUpdate,
    progetto: models.progetto_portfolio.ProgettoPortfolioModel = Depends(get_project_owned_by_user), # Use helper
    db: Session = Depends(database.get_db)
):
    db_media = crud_media_progetto.get_media_by_id(db=db, media_id=media_id)
    if db_media is None or db_media.progetto_portfolio_id != progetto.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Media non trovato o non appartenente a questo progetto. Impossibile aggiornare."
        )
    
    return crud_media_progetto.update_media(db=db, db_media=db_media, media_in=media_update_data)

@router.delete(
    "/{media_id}/", 
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_media_for_progetto(
    media_id: int,
    progetto: models.progetto_portfolio.ProgettoPortfolioModel = Depends(get_project_owned_by_user), # Use helper
    db: Session = Depends(database.get_db)
):
    db_media = crud_media_progetto.get_media_by_id(db=db, media_id=media_id)
    if db_media is None or db_media.progetto_portfolio_id != progetto.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Media non trovato o non appartenente a questo progetto. Impossibile eliminare."
        )
    
    crud_media_progetto.delete_media(db=db, db_media=db_media)
    return None
