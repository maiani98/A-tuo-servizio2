import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ....app.schemas import progetto_schemas, media_schemas
from ....app.crud import crud_progetto_portfolio, crud_media_progetto
from ...utils.portfolio_utils import create_progetto_portfolio_data, create_media_progetto_data, create_media_progetto_update_data
from ...utils.security_utils import generate_valid_jwt_token

# Base API prefix for media, specific project_id will be inserted
API_MEDIA_BASE_STR = "/api/v1/profili/me/portfolio/progetti"


# Helper to create a project and return its ID, along with auth headers for its owner
def _setup_project_and_get_auth(
    client: TestClient, db: Session, user_id: int, profilo_id: int, tipo_utente: str = "professionista"
) -> tuple[int, dict]: # Returns (project_id, headers)
    
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente=tipo_utente, profilo_id=profilo_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Create a project for this user if they are a professionista
    # Note: In a real scenario, the profile (profilo_id) must exist in the User/Profile service.
    # Here, we are testing portfolio service, so we assume profilo_id from token is valid.
    if tipo_utente == "professionista":
        progetto_data = create_progetto_portfolio_data(titolo=f"Progetto di Test per User {user_id}")
        # Use CRUD directly to set up the project for media tests
        # This avoids dependency on the project creation API endpoint working perfectly during these media tests
        progetto = crud_progetto_portfolio.create_progetto(
            db, 
            progetto_in=progetto_schemas.ProgettoPortfolioCreate(**progetto_data), 
            profilo_id=profilo_id
        )
        return progetto.id, headers
    return 0, headers # Should not happen if we only test for professionista valid cases


# --- Test POST /{progetto_id}/media/ ---
def test_create_media_for_progetto_success(client: TestClient, db_session: Session):
    user_id = 301
    profilo_id = 21 # Assume this profilo_id is valid and belongs to user_id
    progetto_id, headers = _setup_project_and_get_auth(client, db_session, user_id, profilo_id)
    
    media_payload = create_media_progetto_data()
    response = client.post(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/", json=media_payload, headers=headers)
    
    assert response.status_code == 201
    created_media_resp = response.json()
    assert created_media_resp["tipo_media"] == media_payload["tipo_media"]
    assert created_media_resp["media_url"] == media_payload["media_url"] # HttpUrl will be stringified
    assert created_media_resp["progetto_portfolio_id"] == progetto_id
    assert "id" in created_media_resp

    db_media = crud_media_progetto.get_media_by_id(db_session, media_id=created_media_resp["id"])
    assert db_media is not None
    assert db_media.progetto_portfolio_id == progetto_id

def test_create_media_fail_project_not_owned(client: TestClient, db_session: Session):
    # User 1 / Profile 1 creates a project
    user1_id = 302
    profilo1_id = 22
    progetto1_id, _ = _setup_project_and_get_auth(client, db_session, user1_id, profilo1_id)

    # User 2 / Profile 2 tries to add media to User 1's project
    user2_id = 303
    profilo2_id = 23
    _, headers_user2 = _setup_project_and_get_auth(client, db_session, user2_id, profilo2_id) # Sets up a dummy project for user2, not used

    media_payload = create_media_progetto_data()
    response = client.post(f"{API_MEDIA_BASE_STR}/{progetto1_id}/media/", json=media_payload, headers=headers_user2)
    assert response.status_code == 404 # Because get_project_owned_by_user won't find project1_id for user2

def test_create_media_fail_no_token(client: TestClient, db_session: Session):
    user_id = 304
    profilo_id = 24
    progetto_id, _ = _setup_project_and_get_auth(client, db_session, user_id, profilo_id) # Project created
    
    media_payload = create_media_progetto_data()
    response = client.post(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/", json=media_payload) # No headers
    assert response.status_code == 401

def test_create_media_fail_cliente_token(client: TestClient, db_session: Session):
    user_id = 305
    profilo_id = 25 # This profile_id might be associated with a 'cliente' in a real system
    
    # Setup: Create a project associated with this profilo_id for the test to target.
    # The project creation itself doesn't strictly check token type, only associates with profilo_id.
    # The endpoint protection is what matters.
    progetto_id_for_cliente_target = crud_progetto_portfolio.create_progetto(
        db_session,
        progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()),
        profilo_id=profilo_id  # Associate project with this "cliente's" profile
    ).id

    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="cliente", profilo_id=profilo_id)
    headers = {"Authorization": f"Bearer {token}"}
    media_payload = create_media_progetto_data()
    
    response = client.post(f"{API_MEDIA_BASE_STR}/{progetto_id_for_cliente_target}/media/", json=media_payload, headers=headers)
    assert response.status_code == 403 # From get_current_user_data_from_token in deps.py

# --- Test GET /{progetto_id}/media/ (List) ---
def test_read_media_for_progetto_success(client: TestClient, db_session: Session):
    user_id = 306
    profilo_id = 26
    progetto_id, headers = _setup_project_and_get_auth(client, db_session, user_id, profilo_id)

    crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=progetto_id)
    crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=progetto_id)

    response = client.get(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/", headers=headers)
    assert response.status_code == 200
    media_list = response.json()
    assert isinstance(media_list, list)
    assert len(media_list) == 2
    assert media_list[0]["progetto_portfolio_id"] == progetto_id

# --- Test GET /{progetto_id}/media/{media_id}/ (Single) ---
def test_read_single_media_success(client: TestClient, db_session: Session):
    user_id = 307
    profilo_id = 27
    progetto_id, headers = _setup_project_and_get_auth(client, db_session, user_id, profilo_id)
    media_payload = create_media_progetto_data()
    created_media = crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**media_payload), progetto_id=progetto_id)

    response = client.get(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/{created_media.id}/", headers=headers)
    assert response.status_code == 200
    media_resp = response.json()
    assert media_resp["id"] == created_media.id
    assert media_resp["media_url"] == media_payload["media_url"]

def test_read_single_media_fail_not_owned_project(client: TestClient, db_session: Session):
    user1_id, p1_id, proj1_id = 308, 28, _setup_project_and_get_auth(client, db_session, 308, 28)[0]
    media_user1 = crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=proj1_id)
    
    user2_id, p2_id = 309, 29
    _, headers_user2 = _setup_project_and_get_auth(client, db_session, user2_id, p2_id) # User2 token

    response = client.get(f"{API_MEDIA_BASE_STR}/{proj1_id}/media/{media_user1.id}/", headers=headers_user2)
    assert response.status_code == 404 # Project proj1_id not owned by user2

def test_read_single_media_fail_media_not_in_project(client: TestClient, db_session: Session):
    user_id, profilo_id, progetto_id, headers = 310, 30, _setup_project_and_get_auth(client, db_session, 310, 30)[0], _setup_project_and_get_auth(client, db_session, 310, 30)[1]
    
    # Create media for a *different* project
    other_progetto_id = _setup_project_and_get_auth(client, db_session, user_id, profilo_id, tipo_utente="professionista")[0] # Re-call for a new project
    media_other_project = crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=other_progetto_id)

    response = client.get(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/{media_other_project.id}/", headers=headers)
    assert response.status_code == 404 # Media not found for *this* project

# --- Test PUT /{progetto_id}/media/{media_id}/ ---
def test_update_media_success(client: TestClient, db_session: Session):
    user_id, profilo_id, progetto_id, headers = 311, 31, _setup_project_and_get_auth(client, db_session, 311, 31)[0], _setup_project_and_get_auth(client, db_session, 311, 31)[1]
    created_media = crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=progetto_id)
    
    update_payload = create_media_progetto_update_data()
    response = client.put(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/{created_media.id}/", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    updated_media_resp = response.json()
    assert updated_media_resp["id"] == created_media.id
    assert updated_media_resp["didascalia"] == update_payload["didascalia"]

# --- Test DELETE /{progetto_id}/media/{media_id}/ ---
def test_delete_media_success(client: TestClient, db_session: Session):
    user_id, profilo_id, progetto_id, headers = 312, 32, _setup_project_and_get_auth(client, db_session, 312, 32)[0], _setup_project_and_get_auth(client, db_session, 312, 32)[1]
    created_media = crud_media_progetto.create_media_for_progetto(db_session, media_in=media_schemas.MediaProgettoCreate(**create_media_progetto_data()), progetto_id=progetto_id)
    
    response = client.delete(f"{API_MEDIA_BASE_STR}/{progetto_id}/media/{created_media.id}/", headers=headers)
    assert response.status_code == 204
    
    assert crud_media_progetto.get_media_by_id(db_session, media_id=created_media.id) is None
