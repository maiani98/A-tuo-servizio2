import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ...app.crud import crud_profilo
from ...app.schemas import profilo_schemas
from ...app.db.models.profilo import ProfiloProfessionista # For type hinting
from ..utils.profile_utils import create_profilo_professionista_data

# --- Test create_profilo ---
def test_create_profilo_success(db_session: Session):
    user_id_prof = 1
    tipo_utente_prof = "professionista"
    profilo_in_data = create_profilo_professionista_data()
    profilo_in = profilo_schemas.ProfiloProfessionistaCreate(**profilo_in_data)
    
    created_profilo = crud_profilo.create_profilo(
        db=db_session, 
        profilo_in=profilo_in, 
        user_id=user_id_prof, 
        tipo_utente_token=tipo_utente_prof
    )
    
    assert created_profilo is not None
    assert created_profilo.user_id == user_id_prof
    assert created_profilo.ragione_sociale == profilo_in.ragione_sociale
    assert created_profilo.partita_iva == profilo_in.partita_iva
    assert created_profilo.descrizione_estesa == profilo_in.descrizione_estesa
    # Check JSON fields were stored (SQLAlchemy returns them as dicts/lists)
    assert isinstance(created_profilo.indirizzo_sede_json, dict)
    assert created_profilo.indirizzo_sede_json["citta"] == profilo_in.indirizzo_sede_json.citta
    
    db_retrieved_profilo = db_session.query(ProfiloProfessionista).filter(ProfiloProfessionista.id == created_profilo.id).first()
    assert db_retrieved_profilo is not None
    assert db_retrieved_profilo.user_id == user_id_prof

def test_create_profilo_user_not_professionista(db_session: Session):
    user_id_cliente = 2
    tipo_utente_cliente = "cliente"
    profilo_in_data = create_profilo_professionista_data()
    profilo_in = profilo_schemas.ProfiloProfessionistaCreate(**profilo_in_data)
    
    with pytest.raises(HTTPException) as excinfo:
        crud_profilo.create_profilo(
            db=db_session, 
            profilo_in=profilo_in, 
            user_id=user_id_cliente, 
            tipo_utente_token=tipo_utente_cliente
        )
    assert excinfo.value.status_code == 403
    assert "Solo i professionisti possono creare un profilo" in excinfo.value.detail

def test_create_profilo_duplicate_for_user(db_session: Session):
    user_id_prof = 3
    tipo_utente_prof = "professionista"
    profilo_in_data1 = create_profilo_professionista_data(ragione_sociale="Prima Azienda")
    profilo_in1 = profilo_schemas.ProfiloProfessionistaCreate(**profilo_in_data1)
    
    crud_profilo.create_profilo( # First profile
        db=db_session, 
        profilo_in=profilo_in1, 
        user_id=user_id_prof, 
        tipo_utente_token=tipo_utente_prof
    )
    
    profilo_in_data2 = create_profilo_professionista_data(ragione_sociale="Seconda Azienda")
    profilo_in2 = profilo_schemas.ProfiloProfessionistaCreate(**profilo_in_data2)
    
    with pytest.raises(HTTPException) as excinfo:
        crud_profilo.create_profilo( # Attempt second profile for same user
            db=db_session, 
            profilo_in=profilo_in2, 
            user_id=user_id_prof, 
            tipo_utente_token=tipo_utente_prof
        )
    assert excinfo.value.status_code == 409
    assert "Profilo già esistente per questo utente" in excinfo.value.detail

# --- Test get_profilo_by_user_id ---
def test_get_profilo_by_user_id_found(db_session: Session):
    user_id = 4
    profilo = crud_profilo.create_profilo(
        db=db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data()), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    found_profilo = crud_profilo.get_profilo_by_user_id(db=db_session, user_id=user_id)
    assert found_profilo is not None
    assert found_profilo.id == profilo.id
    assert found_profilo.user_id == user_id

def test_get_profilo_by_user_id_not_found(db_session: Session):
    non_existent_user_id = 999
    found_profilo = crud_profilo.get_profilo_by_user_id(db=db_session, user_id=non_existent_user_id)
    assert found_profilo is None

# --- Test get_profilo_by_id ---
def test_get_profilo_by_id_found(db_session: Session):
    user_id = 5
    profilo = crud_profilo.create_profilo(
        db=db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data()), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    found_profilo = crud_profilo.get_profilo_by_id(db=db_session, profilo_id=profilo.id)
    assert found_profilo is not None
    assert found_profilo.id == profilo.id

def test_get_profilo_by_id_not_found(db_session: Session):
    non_existent_profilo_id = 9999
    found_profilo = crud_profilo.get_profilo_by_id(db=db_session, profilo_id=non_existent_profilo_id)
    assert found_profilo is None

# --- Test update_profilo ---
def test_update_profilo_success(db_session: Session):
    user_id = 6
    db_profilo = crud_profilo.create_profilo(
        db=db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data(ragione_sociale="Originale SRL")), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    update_data_dict = {"ragione_sociale": "Nuova SRL", "descrizione_estesa": "Descrizione aggiornata."}
    profilo_update_schema = profilo_schemas.ProfiloProfessionistaUpdate(**update_data_dict)
    
    updated_profilo = crud_profilo.update_profilo(db=db_session, db_profilo=db_profilo, profilo_in=profilo_update_schema)
    
    assert updated_profilo is not None
    assert updated_profilo.id == db_profilo.id
    assert updated_profilo.ragione_sociale == "Nuova SRL"
    assert updated_profilo.descrizione_estesa == "Descrizione aggiornata."
    assert updated_profilo.user_id == user_id # Should not change
    
    # Verify in DB
    re_fetched_profilo = db_session.query(ProfiloProfessionista).filter(ProfiloProfessionista.id == db_profilo.id).first()
    assert re_fetched_profilo.ragione_sociale == "Nuova SRL"

def test_update_profilo_partial_update_json_fields(db_session: Session):
    user_id = 7
    initial_data = create_profilo_professionista_data()
    initial_data["indirizzo_sede_json"] = {"via": "Via Roma 1", "citta": "Roma", "cap": "00100"}
    db_profilo = crud_profilo.create_profilo(
        db=db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**initial_data), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    # Update only a part of the indirizzo_sede_json and another field
    update_payload = {
        "indirizzo_sede_json": {"via": "Via Milano 10", "citta": "Milano"}, # CAP is missing, should be kept if logic merges, or replaced if logic overwrites
        "descrizione_estesa": "Nuova descrizione"
    }
    profilo_update_schema = profilo_schemas.ProfiloProfessionistaUpdate(**update_payload)
    
    updated_profilo = crud_profilo.update_profilo(db=db_session, db_profilo=db_profilo, profilo_in=profilo_update_schema)
    
    assert updated_profilo.descrizione_estesa == "Nuova descrizione"
    
    # The current CRUD update_profilo overwrites the entire JSON field if provided in input.
    # So, 'cap' will be None if not provided in the update_payload's indirizzo_sede_json,
    # assuming ProfiloProfessionistaUpdate makes indirizzo_sede_json.cap optional.
    # Our IndirizzoSede schema has optional fields.
    expected_address = {"via": "Via Milano 10", "citta": "Milano", "cap": None, "provincia": None, "paese": "Italia"} # Default for paese
    
    # Accessing the raw JSON from the model to compare
    updated_address_from_db = db_session.query(ProfiloProfessionista.indirizzo_sede_json).filter(ProfiloProfessionista.id == db_profilo.id).scalar()

    # The crud function converts pydantic model to dict. If a field is missing in the pydantic model, it won't be in the dict.
    # So, if `profilo_update_schema.indirizzo_sede_json` is `IndirizzoSede(via="Via Milano 10", citta="Milano")`,
    # its `.dict(exclude_unset=True)` would be `{"via": "Via Milano 10", "citta": "Milano"}`.
    # This dict is then set to `db_profilo.indirizzo_sede_json`.
    # So `cap`, `provincia` would effectively be "removed" or "nulled" if not provided in the update.
    
    # Let's re-evaluate the expected output based on Pydantic model behavior:
    # `profilo_schemas.IndirizzoSede(**{"via": "Via Milano 10", "citta": "Milano"})`
    # would result in an object where `cap` is `None`, `provincia` is `None`, `paese` is "Italia" (default).
    # So the value set in the DB would be `{"via": "Via Milano 10", "citta": "Milano", "paese": "Italia"}`
    # if `exclude_none=True` was used in `.dict()`, or include `None`s if not.
    # The current crud_profilo.update_profilo uses `value.dict(exclude_unset=True)` for nested models.
    # If `indirizzo_sede_json` in `profilo_update_schema` is `IndirizzoSede(via="Via Milano 10", citta="Milano")`,
    # then `value.dict(exclude_unset=True)` would be `{'via': 'Via Milano 10', 'citta': 'Milano'}`.
    # This is then assigned to `db_profilo.indirizzo_sede_json`.
    
    # The actual value stored will be exactly what `profilo_update_schema.indirizzo_sede_json.dict(exclude_unset=True)` returns.
    assert updated_address_from_db["via"] == "Via Milano 10"
    assert updated_address_from_db["citta"] == "Milano"
    assert "cap" not in updated_address_from_db # CAP was not in the update_payload's indirizzo_sede_json
    assert "paese" not in updated_address_from_db # paese was not in update_payload's indirizzo_sede_json, and no default merge logic in CRUD

    # If we wanted merge behavior for JSON, the CRUD would need to be more complex.
    # Current behavior: top-level JSON fields are entirely replaced by the new Pydantic model's dict representation.
    # For example, if indirizzo_sede_json is provided in update, it replaces the whole address.
    # If only a sub-field of indirizzo_sede_json should be updated, the client must send the full desired state of indirizzo_sede_json.

    # Let's re-verify the test based on simple replacement:
    # The `profilo_in.indirizzo_sede_json.dict(exclude_unset=True)` for the update payload
    # `{"via": "Via Milano 10", "citta": "Milano"}` will be exactly that: `{"via": "Via Milano 10", "citta": "Milano"}`.
    # So this is what should be in the DB.
    assert updated_address_from_db == {"via": "Via Milano 10", "citta": "Milano"}

    # Let's refine the update_payload to test more thoroughly:
    update_payload_full_address = {
        "indirizzo_sede_json": {"via": "Via Napoli 20", "citta": "Napoli", "cap": "80100", "paese": "Italia"},
        "descrizione_estesa": "Descrizione Napoli"
    }
    profilo_update_schema_2 = profilo_schemas.ProfiloProfessionistaUpdate(**update_payload_full_address)
    updated_profilo_2 = crud_profilo.update_profilo(db=db_session, db_profilo=db_profilo, profilo_in=profilo_update_schema_2)
    updated_address_from_db_2 = db_session.query(ProfiloProfessionista.indirizzo_sede_json).filter(ProfiloProfessionista.id == db_profilo.id).scalar()

    assert updated_profilo_2.descrizione_estesa == "Descrizione Napoli"
    assert updated_address_from_db_2 == {"via": "Via Napoli 20", "citta": "Napoli", "cap": "80100", "paese": "Italia"}

    # Test updating only non-JSON field, JSON should remain
    update_payload_non_json = {"descrizione_estesa": "Solo descrizione"}
    profilo_update_schema_3 = profilo_schemas.ProfiloProfessionistaUpdate(**update_payload_non_json)
    updated_profilo_3 = crud_profilo.update_profilo(db=db_session, db_profilo=db_profilo, profilo_in=profilo_update_schema_3)
    updated_address_from_db_3 = db_session.query(ProfiloProfessionista.indirizzo_sede_json).filter(ProfiloProfessionista.id == db_profilo.id).scalar()

    assert updated_profilo_3.descrizione_estesa == "Solo descrizione"
    assert updated_address_from_db_3 == {"via": "Via Napoli 20", "citta": "Napoli", "cap": "80100", "paese": "Italia"} # Should be from previous update
