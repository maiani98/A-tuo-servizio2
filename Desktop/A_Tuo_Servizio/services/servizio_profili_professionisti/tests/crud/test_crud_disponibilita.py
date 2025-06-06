import pytest
from sqlalchemy.orm import Session

from ...app.crud import crud_disponibilita, crud_profilo
from ...app.schemas import disponibilita_schemas as schemas_disp
from ...app.schemas import profilo_schemas
from ...app.db.models.disponibilita import DisponibilitaGenerale # For type hinting
from ..utils.profile_utils import create_profilo_professionista_data, create_disponibilita_data

# Helper to create a profile first
def _create_test_profilo(db: Session, user_id: int = 1) -> int:
    profilo_data = create_profilo_professionista_data()
    profilo_in = profilo_schemas.ProfiloProfessionistaCreate(**profilo_data)
    profilo = crud_profilo.create_profilo(db, profilo_in=profilo_in, user_id=user_id, tipo_utente_token="professionista")
    return profilo.id

# --- Test get_disponibilita_by_profilo_id ---
def test_get_disponibilita_by_profilo_id_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=301)
    disp_data = create_disponibilita_data()
    disp_in = schemas_disp.DisponibilitaGeneraleCreate(**disp_data)
    
    crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=disp_in, profilo_id=profilo_id)
    
    found_disp = crud_disponibilita.get_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id)
    assert found_disp is not None
    assert found_disp.profilo_id == profilo_id
    assert found_disp.note == disp_data["note"]
    # Compare giorni_lavorativi_json by converting to sets for order-insensitivity
    assert set(found_disp.giorni_lavorativi_json) == set(disp_data["giorni_lavorativi_json"])


def test_get_disponibilita_by_profilo_id_not_found(db_session: Session):
    profilo_id_no_disp = _create_test_profilo(db_session, user_id=302)
    found_disp = crud_disponibilita.get_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id_no_disp)
    assert found_disp is None

# --- Test upsert_profilo_disponibilita ---
def test_upsert_profilo_disponibilita_create(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=303)
    disp_data = create_disponibilita_data()
    disp_in = schemas_disp.DisponibilitaGeneraleCreate(**disp_data)
    
    created_disp = crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=disp_in, profilo_id=profilo_id)
    
    assert created_disp is not None
    assert created_disp.profilo_id == profilo_id
    assert created_disp.note == disp_data["note"]
    assert hasattr(created_disp, "id")
    
    db_retrieved_disp = db_session.query(DisponibilitaGenerale).filter(DisponibilitaGenerale.id == created_disp.id).first()
    assert db_retrieved_disp is not None
    assert db_retrieved_disp.note == disp_data["note"]

def test_upsert_profilo_disponibilita_update(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=304)
    initial_disp_data = create_disponibilita_data(note="Nota iniziale")
    initial_disp_in = schemas_disp.DisponibilitaGeneraleCreate(**initial_disp_data)
    
    # Create first
    crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=initial_disp_in, profilo_id=profilo_id)
    
    # Now update
    update_disp_data = {"note": "Nota aggiornata", "giorni_lavorativi_json": ["Lunedì", "Venerdì"]}
    update_disp_in = schemas_disp.DisponibilitaGeneraleUpdate(**update_disp_data)
    
    updated_disp = crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=update_disp_in, profilo_id=profilo_id)
    
    assert updated_disp is not None
    assert updated_disp.profilo_id == profilo_id
    assert updated_disp.note == "Nota aggiornata"
    assert set(updated_disp.giorni_lavorativi_json) == {"Lunedì", "Venerdì"}
    
    # Check orari_json was not wiped out if not provided in update (should remain from initial create)
    # The initial create_disponibilita_data() has orari_json.
    # The update_disp_data does not mention orari_json, so it should persist.
    # This relies on `exclude_unset=True` in `disponibilita_in.dict(exclude_unset=True)` in CRUD.
    assert updated_disp.orari_json is not None 
    assert len(updated_disp.orari_json) > 0 # Assuming initial data has some
    
    # Verify specific content of orari_json from initial data
    # The upsert logic with `setattr(db_disponibilita, field, value)` and `disponibilita_in.dict(exclude_unset=True)`
    # means if 'orari_json' is not in `update_disp_data`, it won't be touched.
    expected_initial_orari = initial_disp_data.get("orari_json")
    actual_orari_from_db = db_session.query(DisponibilitaGenerale.orari_json).filter(DisponibilitaGenerale.profilo_id == profilo_id).scalar()
    assert actual_orari_from_db == expected_initial_orari


def test_upsert_profilo_disponibilita_update_orari_json(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=305)
    initial_disp_data = create_disponibilita_data(note="Orari Test")
    initial_disp_in = schemas_disp.DisponibilitaGeneraleCreate(**initial_disp_data)
    crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=initial_disp_in, profilo_id=profilo_id)

    new_orari = [{"giorno": "Sabato", "dalle": "10:00", "alle": "14:00"}]
    update_disp_data = {"orari_json": new_orari}
    update_disp_in = schemas_disp.DisponibilitaGeneraleUpdate(**update_disp_data)
    
    updated_disp = crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=update_disp_in, profilo_id=profilo_id)
    
    assert updated_disp.orari_json == new_orari
    assert updated_disp.note == initial_disp_data["note"] # Note should be unchanged


# --- Test delete_disponibilita_by_profilo_id ---
def test_delete_disponibilita_by_profilo_id_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=306)
    disp_data = create_disponibilita_data()
    disp_in = schemas_disp.DisponibilitaGeneraleCreate(**disp_data)
    
    crud_disponibilita.upsert_profilo_disponibilita(db=db_session, disponibilita_in=disp_in, profilo_id=profilo_id)
    
    # Ensure it exists before delete
    assert crud_disponibilita.get_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id) is not None
    
    deleted_disp = crud_disponibilita.delete_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id)
    
    assert deleted_disp is not None
    assert deleted_disp.profilo_id == profilo_id
    
    assert crud_disponibilita.get_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id) is None

def test_delete_disponibilita_by_profilo_id_not_found(db_session: Session):
    profilo_id_no_disp = _create_test_profilo(db_session, user_id=307)
    
    deleted_disp = crud_disponibilita.delete_disponibilita_by_profilo_id(db=db_session, profilo_id=profilo_id_no_disp)
    assert deleted_disp is None
