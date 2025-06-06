import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session # For type hinting if direct DB interaction needed
from typing import Dict

from ....app.core.config import settings as app_settings # For API prefix, not used here
from ....app.schemas import profilo_schemas
from ...utils.profile_utils import create_profilo_professionista_data, create_profilo_professionista_update_data
from ...utils.security_utils import generate_valid_jwt_token
from ....app.crud import crud_profilo # To verify DB state

# API Prefix for profili
API_V1_PROFILI_STR = "/api/v1/profili"


# --- Test Creazione Profilo (POST /profili/) ---
# This endpoint is actually POST /api/v1/profili/ in profili.py, not /profili/me/
# The task description for API test_profili_api.py: "Creazione Profilo (POST /profili/)"
# The endpoint in profili.py is: router.post("/", response_model=profilo_schemas.ProfiloProfessionistaRead, status_code=status.HTTP_201_CREATED)
# This endpoint is under /api/v1/profili (defined in main.py) and then "/" from its own router.
# So, the path is /api/v1/profili/

def test_create_profilo_professionista_success(client: TestClient, db_session: Session):
    user_id = 401
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    
    profilo_data_payload = create_profilo_professionista_data()
    
    response = client.post(f"{API_V1_PROFILI_STR}/", json=profilo_data_payload, headers=headers)
    
    assert response.status_code == 201
    created_profilo_resp = response.json()
    assert created_profilo_resp["user_id"] == user_id
    assert created_profilo_resp["ragione_sociale"] == profilo_data_payload["ragione_sociale"]
    assert "id" in created_profilo_resp
    
    # Verify in DB
    db_profilo = crud_profilo.get_profilo_by_user_id(db_session, user_id=user_id)
    assert db_profilo is not None
    assert db_profilo.ragione_sociale == profilo_data_payload["ragione_sociale"]

def test_create_profilo_fail_user_is_cliente(client: TestClient, db_session: Session):
    user_id = 402
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="cliente")
    headers = {"Authorization": f"Bearer {token}"}
    profilo_data_payload = create_profilo_professionista_data()
    
    response = client.post(f"{API_V1_PROFILI_STR}/", json=profilo_data_payload, headers=headers)
    
    assert response.status_code == 403
    assert "Solo i professionisti possono creare un profilo" in response.json()["detail"]

def test_create_profilo_fail_no_token(client: TestClient):
    profilo_data_payload = create_profilo_professionista_data()
    response = client.post(f"{API_V1_PROFILI_STR}/", json=profilo_data_payload)
    assert response.status_code == 401 # FastAPI's default for missing auth

def test_create_profilo_fail_already_exists(client: TestClient, db_session: Session):
    user_id = 403
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    profilo_data_payload1 = create_profilo_professionista_data(ragione_sociale="Prima Azienda")
    
    # Create first profile
    client.post(f"{API_V1_PROFILI_STR}/", json=profilo_data_payload1, headers=headers)
    
    # Attempt to create second profile for same user
    profilo_data_payload2 = create_profilo_professionista_data(ragione_sociale="Seconda Azienda")
    response = client.post(f"{API_V1_PROFILI_STR}/", json=profilo_data_payload2, headers=headers)
    
    assert response.status_code == 409
    assert "Profilo già esistente per questo utente" in response.json()["detail"]

# --- Test Operazioni /me/ (GET /profili/me/, PUT /profili/me/) ---
# These are under /api/v1/profili prefix
ME_ENDPOINT = f"{API_V1_PROFILI_STR}/me/"

def test_read_profilo_me_success(client: TestClient, db_session: Session):
    user_id = 404
    # Create a profile first directly via CRUD for setup
    crud_profilo.create_profilo(
        db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data(ragione_sociale="MeTest SRL")), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get(ME_ENDPOINT, headers=headers)
    assert response.status_code == 200
    profilo_resp = response.json()
    assert profilo_resp["user_id"] == user_id
    assert profilo_resp["ragione_sociale"] == "MeTest SRL"

def test_read_profilo_me_fail_no_profile_exists(client: TestClient, db_session: Session):
    user_id = 405 # This user has no profile
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get(ME_ENDPOINT, headers=headers)
    assert response.status_code == 404
    assert "Profilo non trovato" in response.json()["detail"]

def test_read_profilo_me_fail_no_token(client: TestClient):
    response = client.get(ME_ENDPOINT)
    assert response.status_code == 401

def test_update_profilo_me_success(client: TestClient, db_session: Session):
    user_id = 406
    initial_profilo_data = create_profilo_professionista_data(ragione_sociale="Old Corp")
    crud_profilo.create_profilo(
        db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**initial_profilo_data), 
        user_id=user_id, 
        tipo_utente_token="professionista"
    )
    
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    
    update_payload = create_profilo_professionista_update_data() # e.g. new description
    update_payload["ragione_sociale"] = "New Corp Updated" # Make sure to update a specific field for assertion
    
    response = client.put(ME_ENDPOINT, json=update_payload, headers=headers)
    assert response.status_code == 200
    updated_profilo_resp = response.json()
    assert updated_profilo_resp["user_id"] == user_id
    assert updated_profilo_resp["ragione_sociale"] == "New Corp Updated"
    assert updated_profilo_resp["descrizione_estesa"] == update_payload["descrizione_estesa"]

    # Verify in DB
    db_profilo = crud_profilo.get_profilo_by_user_id(db_session, user_id=user_id)
    assert db_profilo.ragione_sociale == "New Corp Updated"

def test_update_profilo_me_fail_user_is_cliente(client: TestClient, db_session: Session):
    user_id = 407
    # Create a profile for this user_id for testing (even if it's a 'cliente' token, profile might exist)
    crud_profilo.create_profilo(
        db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data()), 
        user_id=user_id, 
        tipo_utente_token="professionista" # Profile created as if by a prof
    )

    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="cliente") # But token is 'cliente'
    headers = {"Authorization": f"Bearer {token}"}
    update_payload = create_profilo_professionista_update_data()
    
    response = client.put(ME_ENDPOINT, json=update_payload, headers=headers)
    assert response.status_code == 403
    assert "Solo i professionisti possono aggiornare il proprio profilo" in response.json()["detail"]

def test_update_profilo_me_fail_no_profile_exists(client: TestClient, db_session: Session):
    user_id = 408 # This user has no profile
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    update_payload = create_profilo_professionista_update_data()
    
    response = client.put(ME_ENDPOINT, json=update_payload, headers=headers)
    assert response.status_code == 404
    assert "Profilo non trovato. Impossibile aggiornare." in response.json()["detail"]

# --- Test Recupero Pubblico ---
# GET /profili/{profilo_id}/
# GET /profili/utente/{user_id}/

def test_read_profilo_by_id_public_success(client: TestClient, db_session: Session):
    user_id_for_profile = 409
    created_profilo = crud_profilo.create_profilo(
        db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data(ragione_sociale="Public Get Test")), 
        user_id=user_id_for_profile, 
        tipo_utente_token="professionista"
    )
    profilo_id_to_get = created_profilo.id
    
    response = client.get(f"{API_V1_PROFILI_STR}/{profilo_id_to_get}/")
    assert response.status_code == 200
    profilo_resp = response.json()
    assert profilo_resp["id"] == profilo_id_to_get
    assert profilo_resp["ragione_sociale"] == "Public Get Test"

def test_read_profilo_by_id_public_fail_not_found(client: TestClient):
    non_existent_profilo_id = 99999
    response = client.get(f"{API_V1_PROFILI_STR}/{non_existent_profilo_id}/")
    assert response.status_code == 404

def test_read_profilo_by_user_id_public_success(client: TestClient, db_session: Session):
    user_id_to_get = 410
    crud_profilo.create_profilo(
        db_session, 
        profilo_in=profilo_schemas.ProfiloProfessionistaCreate(**create_profilo_professionista_data(ragione_sociale="Public UserID Test")), 
        user_id=user_id_to_get, 
        tipo_utente_token="professionista"
    )
    
    response = client.get(f"{API_V1_PROFILI_STR}/utente/{user_id_to_get}/")
    assert response.status_code == 200
    profilo_resp = response.json()
    assert profilo_resp["user_id"] == user_id_to_get
    assert profilo_resp["ragione_sociale"] == "Public UserID Test"

def test_read_profilo_by_user_id_public_fail_not_found(client: TestClient):
    non_existent_user_id = 88888
    response = client.get(f"{API_V1_PROFILI_STR}/utente/{non_existent_user_id}/")
    assert response.status_code == 404
