from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ....app.db import database
from ....app.schemas import certificazione_schemas as schemas_cert
from ....app.crud import crud_certificazione, crud_profilo # Import crud_profilo
from ....app.deps import get_current_user_from_token, TokenData
from ....app.db.models.profilo import ProfiloProfessionista # For type hinting

router = APIRouter()

# Helper dependency to get current user's profile (similar to aree_operativita)
async def get_current_profilo_professionista(
    db: Session = Depends(database.get_db),
    current_user_data: TokenData = Depends(get_current_user_from_token)
) -> ProfiloProfessionista:
    if current_user_data.tipo_utente != 'professionista':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operazione consentita solo ai professionisti."
        )
    
    profilo = crud_profilo.get_profilo_by_user_id(db, user_id=current_user_data.user_id)
    if not profilo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profilo professionista non trovato per l'utente autenticato."
        )
    return profilo

@router.post(
    "/", 
    response_model=schemas_cert.CertificazioneRead, 
    status_code=status.HTTP_201_CREATED,
    summary="Aggiungi una nuova certificazione al profilo del professionista autenticato",
    description="Crea e associa una nuova certificazione al profilo del professionista."
)
def create_certificazione_for_current_user_profilo(
    cert_in: schemas_cert.CertificazioneCreate,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    return crud_certificazione.create_profilo_certificazione(
        db=db, certificazione_in=cert_in, profilo_id=current_profilo.id
    )

@router.get(
    "/", 
    response_model=List[schemas_cert.CertificazioneRead],
    summary="Ottieni le certificazioni del professionista autenticato",
    description="Recupera la lista delle certificazioni associate al profilo del professionista."
)
def read_certificazioni_for_current_user_profilo(
    skip: int = Query(0, ge=0, description="Numero di record da saltare"),
    limit: int = Query(100, ge=1, le=200, description="Numero massimo di record da restituire"),
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    return crud_certificazione.get_certificazioni_by_profilo_id(
        db=db, profilo_id=current_profilo.id, skip=skip, limit=limit
    )

@router.get(
    "/{certificazione_id}/", 
    response_model=schemas_cert.CertificazioneRead,
    summary="Ottieni una specifica certificazione del professionista autenticato",
    description="Recupera una specifica certificazione tramite il suo ID, se appartiene al profilo del professionista."
)
def read_specific_certificazione_for_current_user_profilo(
    certificazione_id: int,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    db_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(
        db=db, certificazione_id=certificazione_id, profilo_id=current_profilo.id
    )
    if db_cert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificazione non trovata o non appartenente a questo profilo."
        )
    return db_cert

@router.put(
    "/{certificazione_id}/", 
    response_model=schemas_cert.CertificazioneRead,
    summary="Aggiorna una specifica certificazione del professionista autenticato",
    description="Aggiorna i dettagli di una specifica certificazione, se appartiene al profilo del professionista."
)
def update_specific_certificazione_for_current_user_profilo(
    certificazione_id: int,
    cert_update_data: schemas_cert.CertificazioneUpdate,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    db_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(
        db=db, certificazione_id=certificazione_id, profilo_id=current_profilo.id
    )
    if db_cert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificazione non trovata o non appartenente a questo profilo. Impossibile aggiornare."
        )
    
    return crud_certificazione.update_certificazione(db=db, db_certificazione=db_cert, certificazione_in=cert_update_data)

@router.delete(
    "/{certificazione_id}/", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina una specifica certificazione del professionista autenticato",
    description="Elimina una specifica certificazione, se appartiene al profilo del professionista."
)
def delete_specific_certificazione_for_current_user_profilo(
    certificazione_id: int,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    deleted_cert = crud_certificazione.delete_certificazione(
        db=db, certificazione_id=certificazione_id, profilo_id=current_profilo.id
    )
    if deleted_cert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificazione non trovata o non appartenente a questo profilo. Impossibile eliminare."
        )
    return None # FastAPI handles 204 response type, no content needed.
