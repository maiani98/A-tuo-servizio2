from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Union # For Union type in request body for POST

from ....app.db import database
from ....app.schemas import disponibilita_schemas as schemas_disp
from ....app.crud import crud_disponibilita, crud_profilo
from ....app.deps import get_current_user_from_token, TokenData
from ....app.db.models.profilo import ProfiloProfessionista
from ....app.db.models.disponibilita import DisponibilitaGenerale # For type hinting

router = APIRouter()

# Helper dependency to get current user's profile (re-usable)
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

@router.get(
    "/", 
    response_model=schemas_disp.DisponibilitaGeneraleRead,
    summary="Ottieni la disponibilità generale del professionista autenticato",
    description="Recupera la configurazione della disponibilità generale associata al profilo del professionista."
)
def read_disponibilita_me(
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    db_disponibilita = crud_disponibilita.get_disponibilita_by_profilo_id(db, profilo_id=current_profilo.id)
    if db_disponibilita is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disponibilità non impostata."
        )
    return db_disponibilita

@router.post(
    "/", 
    response_model=schemas_disp.DisponibilitaGeneraleRead,
    # Status code will depend on whether it was created or updated
    summary="Crea o aggiorna la disponibilità generale del professionista autenticato",
    description="Crea una nuova configurazione di disponibilità o aggiorna quella esistente."
)
def upsert_disponibilita_me_post( # Renamed to avoid conflict if POST/PUT are separate
    disponibilita_in: schemas_disp.DisponibilitaGeneraleCreate, # Use Create schema for POST
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista),
):
    # Check if it exists to determine status code
    existing_disponibilita = crud_disponibilita.get_disponibilita_by_profilo_id(db, profilo_id=current_profilo.id)
    
    # Note: The status code handling (201 vs 200) based on creation/update is tricky
    # with a single upsert function if the function itself doesn't return that info.
    # For simplicity, FastAPI will default to 200 for POST if not specified,
    # or we can set a default like 200 OK.
    # A more RESTful approach might be separate POST (create) and PUT (update).
    # Given the task asked for POST to upsert, we'll use a common success code.
    # If specific 201/200 is needed, the CRUD might need to return a flag.
    
    db_disponibilita = crud_disponibilita.upsert_profilo_disponibilita(
        db=db, disponibilita_in=disponibilita_in, profilo_id=current_profilo.id
    )
    
    if existing_disponibilita:
        # It was an update
        # If you need to explicitly return 200 for update and 201 for create with POST,
        # you would need to adjust response or have separate endpoints.
        # For now, FastAPI default or a general 200 is fine.
        # To set status code dynamically: response.status_code = status.HTTP_200_OK
        pass # Default status code will be used (200 for POST if not specified otherwise)
    else:
        # It was a creation
        # To set status code dynamically for creation via POST:
        # from fastapi import Response
        # response.status_code = status.HTTP_201_CREATED 
        # This requires `response: Response` in function signature.
        # For simplicity, we'll let FastAPI handle it or set a general one.
        # As POST / is specified, 201 is more appropriate if it's purely create.
        # Since it's upsert, 200 is also acceptable.
        # Let's assume the default (200 for POST if not specified) or use status_code on decorator.
        # For this task, let's assume a single upsert endpoint with POST is fine with default status.
        # Or, let's set it to 200 OK as it's an upsert.
        # If we want to be very specific:
        # from fastapi.responses import JSONResponse
        # if existing_disponibilita:
        #     return JSONResponse(content=db_disponibilita.dict(), status_code=status.HTTP_200_OK)
        # else:
        #     return JSONResponse(content=db_disponibilita.dict(), status_code=status.HTTP_201_CREATED)
        # This requires `db_disponibilita` to be converted to dict for JSONResponse.
        # Pydantic models with orm_mode handle this conversion for `response_model`.
        pass

    return db_disponibilita


@router.put(
    "/", 
    response_model=schemas_disp.DisponibilitaGeneraleRead,
    summary="Crea o aggiorna la disponibilità generale del professionista autenticato (PUT)",
    description="Crea una nuova configurazione di disponibilità o aggiorna quella esistente utilizzando PUT."
)
def upsert_disponibilita_me_put(
    disponibilita_in: schemas_disp.DisponibilitaGeneraleUpdate, # Use Update schema for PUT
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    # Similar logic to POST for status code if needed, but PUT is idempotent
    # and typically returns 200 OK for successful update, or 201 if it created.
    # Sometimes 204 No Content if it only updates and doesn't return content.
    # Here, we return content.
    db_disponibilita = crud_disponibilita.upsert_profilo_disponibilita(
        db=db, disponibilita_in=disponibilita_in, profilo_id=current_profilo.id
    )
    return db_disponibilita

@router.delete(
    "/", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina la disponibilità generale del professionista autenticato",
    description="Rimuove la configurazione della disponibilità generale associata al profilo."
)
def delete_disponibilita_me(
    db: Session = Depends(database.get_db),
    current_profilo: ProfiloProfessionista = Depends(get_current_profilo_professionista)
):
    deleted_disponibilita = crud_disponibilita.delete_disponibilita_by_profilo_id(db, profilo_id=current_profilo.id)
    if deleted_disponibilita is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disponibilità non trovata o già eliminata."
        )
    # No content is returned for 204
    return None
