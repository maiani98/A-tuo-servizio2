import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ....app.schemas import profilo_schemas, area_operativita_schemas as schemas_ao
from ....app.crud import crud_profilo, crud_area_operativita
from ...utils.profile_utils import create_profilo_professionista_data, create_area_operativita_data, create_area_operativita_update_data
from ...utils.security_utils import generate_valid_jwt_token

# API Prefix for aree_operativita, relative to /profili/me/
API_AREE_STR = "/api/v1/profili/me/aree-operativita"

# Helper to create a profile and return its ID and a valid token for its user
def _setup_profilo_and_get_auth_headers(
    client: TestClient, db: Session, user_id: int, tipo_utente: str = "professionista"
) -> tuple[int, dict]:
    # Ensure no existing profile for this user_id from previous tests if db is not reset per test
    existing_profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
    if existing_profilo: # Should not happen with db_session fixture if used per test
        # This part of the logic might be complex if we don't clean db per test.
        # Assuming db_session fixture handles cleanup.
        pass

    token = generate_valid_jwt_token(user_id=user_id, tipo_utente=tipo_utente)
    headers = {"Authorization": f"Bearer {token}"}

    if tipo_utente == "professionista":
        # Create a profile for this user if one doesn't exist
        profilo_data = create_profilo_professionista_data()
        # Use the client to create profile to simulate API flow, or CRUD directly
        # For simplicity and to focus on area tests, using CRUD directly here.
        # This assumes the /profili/ endpoint works, or we bypass it for test setup.
        profilo = crud_profilo.create_profilo(
            db, 
            profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**profilo_data), 
            user_id=user_id, 
            tipo_utente_token=tipo_utente
        )
        return profilo.id, headers
    return 0, headers # No profile_id for non-professionista

# --- Test POST /aree-operativita/ ---
def test_create_area_operativita_success(client: TestClient, db_session: Session):
    user_id = 501
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    area_payload = create_area_operativita_data()
    response = client.post(f"{API_AREE_STR}/", json=area_payload, headers=headers)
    
    assert response.status_code == 201
    created_area_resp = response.json()
    assert created_area_resp["tipo_area"] == area_payload["tipo_area"]
    assert created_area_resp["valore_area"] == area_payload["valore_area"]
    assert created_area_resp["profilo_id"] == profilo_id
    assert "id" in created_area_resp

    # Verify in DB
    db_area = crud_area_operativita.get_area_by_id_and_profilo_id(db_session, area_id=created_area_resp["id"], profilo_id=profilo_id)
    assert db_area is not None
    assert db_area.tipo_area == area_payload["tipo_area"]

def test_create_area_operativita_fail_not_professionista(client: TestClient, db_session: Session):
    user_id = 502
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id, tipo_utente="cliente") # No profile created
    
    area_payload = create_area_operativita_data()
    response = client.post(f"{API_AREE_STR}/", json=area_payload, headers=headers)
    assert response.status_code == 403 # From get_current_profilo_professionista dependency

def test_create_area_operativita_fail_no_profile(client: TestClient, db_session: Session):
    user_id = 503 # This prof has a token but no profile created yet
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    # DO NOT call _setup_profilo_and_get_auth_headers which creates a profile.
    
    area_payload = create_area_operativita_data()
    response = client.post(f"{API_AREE_STR}/", json=area_payload, headers=headers)
    assert response.status_code == 404 # From get_current_profilo_professionista if profile not found

def test_create_area_operativita_fail_no_token(client: TestClient):
    area_payload = create_area_operativita_data()
    response = client.post(f"{API_AREE_STR}/", json=area_payload)
    assert response.status_code == 401


# --- Test GET /aree-operativita/ (List) ---
def test_read_aree_operativita_list_success(client: TestClient, db_session: Session):
    user_id = 504
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    # Add some areas
    crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**create_area_operativita_data()), profilo_id=profilo_id)
    crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**create_area_operativita_data()), profilo_id=profilo_id)
    
    response = client.get(f"{API_AREE_STR}/", headers=headers)
    assert response.status_code == 200
    aree_list = response.json()
    assert isinstance(aree_list, list)
    assert len(aree_list) == 2
    assert aree_list[0]["profilo_id"] == profilo_id

def test_read_aree_operativita_list_empty(client: TestClient, db_session: Session):
    user_id = 505
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id) # Profile created, but no areas
    
    response = client.get(f"{API_AREE_STR}/", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


# --- Test GET /aree-operativita/{area_id}/ (Single) ---
def test_read_single_area_operativita_success(client: TestClient, db_session: Session):
    user_id = 506
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    area_payload = create_area_operativita_data()
    created_area = crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_payload), profilo_id=profilo_id)
    
    response = client.get(f"{API_AREE_STR}/{created_area.id}/", headers=headers)
    assert response.status_code == 200
    area_resp = response.json()
    assert area_resp["id"] == created_area.id
    assert area_resp["tipo_area"] == area_payload["tipo_area"]

def test_read_single_area_operativita_fail_not_found(client: TestClient, db_session: Session):
    user_id = 507
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    non_existent_area_id = 9999
    
    response = client.get(f"{API_AREE_STR}/{non_existent_area_id}/", headers=headers)
    assert response.status_code == 404

def test_read_single_area_operativita_fail_belongs_to_other_user(client: TestClient, db_session: Session):
    user1_id = 508
    profilo1_id, _ = _setup_profilo_and_get_auth_headers(client, db_session, user1_id, tipo_utente="professionista")
    area_user1 = crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**create_area_operativita_data()), profilo_id=profilo1_id)

    user2_id = 509
    _, headers_user2 = _setup_profilo_and_get_auth_headers(client, db_session, user2_id, tipo_utente="professionista")

    response = client.get(f"{API_AREE_STR}/{area_user1.id}/", headers=headers_user2) # User2 tries to get User1's area
    assert response.status_code == 404 # Because get_area_by_id_and_profilo_id will not find it for current_profilo.id


# --- Test PUT /aree-operativita/{area_id}/ ---
def test_update_area_operativita_success(client: TestClient, db_session: Session):
    user_id = 510
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    created_area = crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**create_area_operativita_data()), profilo_id=profilo_id)
    
    update_payload = create_area_operativita_update_data()
    response = client.put(f"{API_AREE_STR}/{created_area.id}/", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    updated_area_resp = response.json()
    assert updated_area_resp["id"] == created_area.id
    assert updated_area_resp["valore_area"] == update_payload["valore_area"]

    db_area = crud_area_operativita.get_area_by_id_and_profilo_id(db_session, area_id=created_area.id, profilo_id=profilo_id)
    assert db_area.valore_area == update_payload["valore_area"]

def test_update_area_operativita_fail_not_found(client: TestClient, db_session: Session):
    user_id = 511
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    non_existent_area_id = 9998
    update_payload = create_area_operativita_update_data()
    
    response = client.put(f"{API_AREE_STR}/{non_existent_area_id}/", json=update_payload, headers=headers)
    assert response.status_code == 404


# --- Test DELETE /aree-operativita/{area_id}/ ---
def test_delete_area_operativita_success(client: TestClient, db_session: Session):
    user_id = 512
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    created_area = crud_area_operativita.create_profilo_area(db_session, area_in=schemas_ao.AreaOperativitaCreate(**create_area_operativita_data()), profilo_id=profilo_id)
    
    response = client.delete(f"{API_AREE_STR}/{created_area.id}/", headers=headers)
    assert response.status_code == 204
    
    assert crud_area_operativita.get_area_by_id_and_profilo_id(db_session, area_id=created_area.id, profilo_id=profilo_id) is None

def test_delete_area_operativita_fail_not_found(client: TestClient, db_session: Session):
    user_id = 513
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    non_existent_area_id = 9997
    
    response = client.delete(f"{API_AREE_STR}/{non_existent_area_id}/", headers=headers)
    assert response.status_code == 404
