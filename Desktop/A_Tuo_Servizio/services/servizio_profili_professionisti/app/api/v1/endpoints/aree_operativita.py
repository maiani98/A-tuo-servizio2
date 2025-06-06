from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from ....app.db import database
from ....app.schemas import area_operativita_schemas as schemas_ao
from ....app.crud import crud_area_operativita, crud_profilo # Import crud_profilo
from ....app.deps import get_current_user_from_token, TokenData
from ....app.db.models.profilo import ProfiloProfessionista # For type hinting

router = APIRouter()

# Helper dependency to get current user's profile
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
    response_model=schemas_ao.AreaOperativitaRead, 
    status_code=status.HTTP_201_CREATED,
    summary="Aggiungi una nuova area di operatività al profilo del professionista autenticato",
    description="Crea e associa una nuova area di operatività al profilo del professionista."
)
def create_area_operativita_for_current_user_profilo(
    area_in: schemas_ao.AreaOperativitaCreate,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    return crud_area_operativita.create_profilo_area(
        db=db, area_in=area_in, profilo_id=current_profilo.id
    )

@router.get(
    "/", 
    response_model=List[schemas_ao.AreaOperativitaRead],
    summary="Ottieni le aree di operatività del professionista autenticato",
    description="Recupera la lista delle aree di operatività associate al profilo del professionista."
)
def read_aree_operativita_for_current_user_profilo(
    skip: int = Query(0, ge=0, description="Numero di record da saltare"),
    limit: int = Query(100, ge=1, le=200, description="Numero massimo di record da restituire"),
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    return crud_area_operativita.get_aree_by_profilo_id(
        db=db, profilo_id=current_profilo.id, skip=skip, limit=limit
    )

@router.get(
    "/{area_id}/", 
    response_model=schemas_ao.AreaOperativitaRead,
    summary="Ottieni una specifica area di operatività del professionista autenticato",
    description="Recupera una specifica area di operatività tramite il suo ID, se appartiene al profilo del professionista."
)
def read_specific_area_operativita_for_current_user_profilo(
    area_id: int,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    db_area = crud_area_operativita.get_area_by_id_and_profilo_id(
        db=db, area_id=area_id, profilo_id=current_profilo.id
    )
    if db_area is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area di operatività non trovata o non appartenente a questo profilo."
        )
    return db_area

@router.put(
    "/{area_id}/", 
    response_model=schemas_ao.AreaOperativitaRead,
    summary="Aggiorna una specifica area di operatività del professionista autenticato",
    description="Aggiorna i dettagli di una specifica area di operatività, se appartiene al profilo del professionista."
)
def update_specific_area_operativita_for_current_user_profilo(
    area_id: int,
    area_update_data: schemas_ao.AreaOperativitaUpdate,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    db_area = crud_area_operativita.get_area_by_id_and_profilo_id(
        db=db, area_id=area_id, profilo_id=current_profilo.id
    )
    if db_area is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area di operatività non trovata o non appartenente a questo profilo. Impossibile aggiornare."
        )
    
    return crud_area_operativita.update_area(db=db, db_area=db_area, area_in=area_update_data)

@router.delete(
    "/{area_id}/", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina una specifica area di operatività del professionista autenticato",
    description="Elimina una specifica area di operatività, se appartiene al profilo del professionista."
)
def delete_specific_area_operativita_for_current_user_profilo(
    area_id: int,
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    deleted_area = crud_area_operativita.delete_area(
        db=db, area_id=area_id, profilo_id=current_profilo.id
    )
    if deleted_area is None: # delete_area now returns the object or None if not found
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area di operatività non trovata o non appartenente a questo profilo. Impossibile eliminare."
        )
    # No content is returned for 204, so no need to return deleted_area to client.
    return None # FastAPI will handle the 204 response type.Okay, I have implemented the API endpoints for `AreaOperativita` in `servizio_profili_professionisti/app/api/v1/endpoints/aree_operativita.py`. This includes a helper dependency `get_current_profilo_professionista` to ensure that the authenticated user is a 'professionista' and has an existing profile before performing CRUD operations on their `aree_operativita`.

Now I will proceed with Step 5: **Global Updates**.
This involves:
-   Registering the new router for `aree_operativita` in `app/main.py`.
-   Ensuring the `AreaOperativita` model is imported in `app/db/database.py` so that its table is created by `init_db()`. (This should already be handled if `profilo.py` imports `area_operativita.py` or if `database.py` imports `area_operativita.py` directly). I'll double-check `database.py`.

Let's start by updating `app/main.py`.
