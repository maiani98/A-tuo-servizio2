import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ....app.schemas import profilo_schemas, disponibilita_schemas as schemas_disp
from ....app.crud import crud_profilo, crud_disponibilita
from ...utils.profile_utils import create_profilo_professionista_data, create_disponibilita_data, create_disponibilita_update_data
from ...utils.security_utils import generate_valid_jwt_token

# API Prefix for disponibilita, relative to /profili/me/
API_DISP_STR = "/api/v1/profili/me/disponibilita"

# Helper (can be refactored)
def _setup_profilo_and_get_auth_headers(
    client: TestClient, db: Session, user_id: int, tipo_utente: str = "professionista"
) -> tuple[int, dict]:
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente=tipo_utente)
    headers = {"Authorization": f"Bearer {token}"}

    if tipo_utente == "professionista":
        existing_profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
        if existing_profilo:
             return existing_profilo.id, headers
        
        profilo_data = create_profilo_professionista_data()
        profilo = crud_profilo.create_profilo(
            db, 
            profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**profilo_data), 
            user_id=user_id, 
            tipo_utente_token=tipo_utente
        )
        return profilo.id, headers
    return 0, headers

# --- Test POST /disponibilita/ (Upsert) ---
def test_upsert_disponibilita_create_success_post(client: TestClient, db_session: Session):
    user_id = 701
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    disp_payload = create_disponibilita_data()
    response = client.post(f"{API_DISP_STR}/", json=disp_payload, headers=headers)
    
    # Upsert via POST could return 200 or 201. Endpoint defines response_model.
    # If status_code is not explicitly set on decorator for POST, it defaults to 200.
    # Our endpoint does not set status_code in decorator, so it's 200 by default for POST.
    assert response.status_code == 200 
    created_disp_resp = response.json()
    assert created_disp_resp["note"] == disp_payload["note"]
    assert created_disp_resp["profilo_id"] == profilo_id
    assert "id" in created_disp_resp

    db_disp = crud_disponibilita.get_disponibilita_by_profilo_id(db_session, profilo_id=profilo_id)
    assert db_disp is not None
    assert db_disp.note == disp_payload["note"]

def test_upsert_disponibilita_update_success_post(client: TestClient, db_session: Session):
    user_id = 702
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    # Initial creation
    initial_payload = create_disponibilita_data(note="Initial Note")
    client.post(f"{API_DISP_STR}/", json=initial_payload, headers=headers)
    
    # Update
    update_payload = create_disponibilita_update_data(note="Updated Note Via POST")
    response = client.post(f"{API_DISP_STR}/", json=update_payload, headers=headers)
    
    assert response.status_code == 200 # Default for POST if not specified
    updated_disp_resp = response.json()
    assert updated_disp_resp["note"] == "Updated Note Via POST"
    assert updated_disp_resp["profilo_id"] == profilo_id

    db_disp = crud_disponibilita.get_disponibilita_by_profilo_id(db_session, profilo_id=profilo_id)
    assert db_disp.note == "Updated Note Via POST"

# --- Test PUT /disponibilita/ (Upsert) ---
def test_upsert_disponibilita_create_success_put(client: TestClient, db_session: Session):
    user_id = 703
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    disp_payload = create_disponibilita_data(note="Created via PUT")
    response = client.put(f"{API_DISP_STR}/", json=disp_payload, headers=headers)
    
    assert response.status_code == 200 # PUT typically 200 for update/create if returning content
    created_disp_resp = response.json()
    assert created_disp_resp["note"] == "Created via PUT"
    assert created_disp_resp["profilo_id"] == profilo_id

def test_upsert_disponibilita_update_success_put(client: TestClient, db_session: Session):
    user_id = 704
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    initial_payload = create_disponibilita_data(note="Initial for PUT update")
    client.put(f"{API_DISP_STR}/", json=initial_payload, headers=headers) # Create
    
    update_payload = create_disponibilita_update_data(note="Updated Note Via PUT")
    response = client.put(f"{API_DISP_STR}/", json=update_payload, headers=headers) # Update
    
    assert response.status_code == 200
    updated_disp_resp = response.json()
    assert updated_disp_resp["note"] == "Updated Note Via PUT"

# --- Test GET /disponibilita/ ---
def test_read_disponibilita_success(client: TestClient, db_session: Session):
    user_id = 705
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    disp_payload = create_disponibilita_data()
    crud_disponibilita.upsert_profilo_disponibilita(db_session, disponibilita_in=schemas_disp.DisponibilitaGeneraleCreate(**disp_payload), profilo_id=profilo_id)
    
    response = client.get(f"{API_DISP_STR}/", headers=headers)
    assert response.status_code == 200
    disp_resp = response.json()
    assert disp_resp["note"] == disp_payload["note"]
    assert disp_resp["profilo_id"] == profilo_id

def test_read_disponibilita_fail_not_set_up(client: TestClient, db_session: Session):
    user_id = 706
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id) # Profile exists, no disponibilita
    
    response = client.get(f"{API_DISP_STR}/", headers=headers)
    assert response.status_code == 404
    assert "Disponibilità non impostata" in response.json()["detail"]

def test_read_disponibilita_fail_not_professionista(client: TestClient, db_session: Session):
    user_id = 707
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id, tipo_utente="cliente")
    
    response = client.get(f"{API_DISP_STR}/", headers=headers)
    assert response.status_code == 403 # Dependency check

# --- Test DELETE /disponibilita/ ---
def test_delete_disponibilita_success(client: TestClient, db_session: Session):
    user_id = 708
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    disp_payload = create_disponibilita_data()
    crud_disponibilita.upsert_profilo_disponibilita(db_session, disponibilita_in=schemas_disp.DisponibilitaGeneraleCreate(**disp_payload), profilo_id=profilo_id)
    
    response = client.delete(f"{API_DISP_STR}/", headers=headers)
    assert response.status_code == 204
    
    assert crud_disponibilita.get_disponibilita_by_profilo_id(db_session, profilo_id=profilo_id) is None

def test_delete_disponibilita_fail_not_found(client: TestClient, db_session: Session):
    user_id = 709
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id) # Profile exists, no disponibilita
    
    response = client.delete(f"{API_DISP_STR}/", headers=headers)
    assert response.status_code == 404
    assert "Disponibilità non trovata o già eliminata" in response.json()["detail"]

def test_upsert_disponibilita_fail_no_token(client: TestClient):
    disp_payload = create_disponibilita_data()
    response_post = client.post(f"{API_DISP_STR}/", json=disp_payload)
    assert response_post.status_code == 401
    response_put = client.put(f"{API_DISP_STR}/", json=disp_payload)
    assert response_put.status_code == 401

def test_get_disponibilita_fail_no_token(client: TestClient):
    response = client.get(f"{API_DISP_STR}/")
    assert response.status_code == 401

def test_delete_disponibilita_fail_no_token(client: TestClient):
    response = client.delete(f"{API_DISP_STR}/")
    assert response.status_code == 401
