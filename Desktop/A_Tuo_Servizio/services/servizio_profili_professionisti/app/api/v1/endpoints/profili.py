from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List # For potential future list endpoints

from ....app.db import database
from ....app.schemas import profilo_schemas
from ....app.crud import crud_profilo
from ....app.deps import get_current_user_from_token, TokenData # Ensure TokenData is imported

router = APIRouter()

@router.post(
    "/", 
    response_model=profilo_schemas.ProfiloProfessionistaRead, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuovo profilo professionista",
    description="Crea un nuovo profilo per l'utente autenticato, se è un professionista e non ha già un profilo."
)
def create_profilo_professionista(
    profilo_in: profilo_schemas.ProfiloProfessionistaCreate,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_from_token)
):
    user_id = current_user_data.user_id
    tipo_utente = current_user_data.tipo_utente

    # La logica di controllo tipo_utente e profilo esistente è in crud_profilo.create_profilo
    db_profilo = crud_profilo.create_profilo(
        db=db, 
        profilo_in=profilo_in, 
        user_id=user_id, 
        tipo_utente_token=tipo_utente
    )
    return db_profilo

@router.get(
    "/me/", 
    response_model=profilo_schemas.ProfiloProfessionistaRead,
    summary="Ottieni il profilo del professionista autenticato",
    description="Recupera il profilo professionista associato all'utente autenticato."
)
def read_profilo_me(
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_from_token)
):
    user_id = current_user_data.user_id
    profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
    if profilo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo non trovato per l'utente autenticato."
        )
    return profilo

@router.put(
    "/me/", 
    response_model=profilo_schemas.ProfiloProfessionistaRead,
    summary="Aggiorna il profilo del professionista autenticato",
    description="Aggiorna i dettagli del profilo professionista associato all'utente autenticato."
)
def update_profilo_me(
    profilo_update_data: profilo_schemas.ProfiloProfessionistaUpdate,
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_from_token)
):
    user_id = current_user_data.user_id
    
    # Verifica che l'utente sia un professionista prima di permettere l'aggiornamento
    if current_user_data.tipo_utente != 'professionista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo i professionisti possono aggiornare il proprio profilo."
        )
        
    db_profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
    if db_profilo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo non trovato. Impossibile aggiornare."
        )
    
    updated_profilo = crud_profilo.update_profilo(db=db, db_profilo=db_profilo, profilo_in=profilo_update_data)
    return updated_profilo

@router.get(
    "/{profilo_id}/", 
    response_model=profilo_schemas.ProfiloProfessionistaRead,
    summary="Ottieni un profilo professionista per ID (pubblico)",
    description="Recupera un profilo professionista specifico tramite il suo ID. Accesso pubblico."
)
def read_profilo_by_id(
    profilo_id: int,
    db: Session = Depends(database.get_db)
):
    profilo = crud_profilo.get_profilo_by_id(db, profilo_id=profilo_id)
    if profilo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profilo con ID {profilo_id} non trovato."
        )
    return profilo

@router.get(
    "/utente/{user_id}/", 
    response_model=profilo_schemas.ProfiloProfessionistaRead,
    summary="Ottieni un profilo professionista per User ID (pubblico)",
    description="Recupera un profilo professionista specifico tramite l'ID dell'utente associato. Accesso pubblico."
)
def read_profilo_by_user_id_public(
    user_id: int, # Questo user_id è un path parameter, non dall'utente autenticato
    db: Session = Depends(database.get_db)
):
    profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
    if profilo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profilo non trovato per l'utente con ID {user_id}."
        )
    return profilo
