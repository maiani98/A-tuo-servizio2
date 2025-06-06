import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import date

from ....app.schemas import profilo_schemas, certificazione_schemas as schemas_cert
from ....app.crud import crud_profilo, crud_certificazione
from ...utils.profile_utils import create_profilo_professionista_data, create_certificazione_data, create_certificazione_update_data
from ...utils.security_utils import generate_valid_jwt_token

# API Prefix for certificazioni, relative to /profili/me/
API_CERT_STR = "/api/v1/profili/me/certificazioni"

# Helper (can be refactored into a common conftest.py or utils if used by many test files)
def _setup_profilo_and_get_auth_headers(
    client: TestClient, db: Session, user_id: int, tipo_utente: str = "professionista"
) -> tuple[int, dict]:
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente=tipo_utente)
    headers = {"Authorization": f"Bearer {token}"}

    if tipo_utente == "professionista":
        existing_profilo = crud_profilo.get_profilo_by_user_id(db, user_id=user_id)
        if existing_profilo: # Avoid re-creating if test setup implies it might exist
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

# --- Test POST /certificazioni/ ---
def test_create_certificazione_success(client: TestClient, db_session: Session):
    user_id = 601
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    cert_payload = create_certificazione_data()
    # Ensure date is in correct string format if Pydantic expects str for HttpUrl models
    if isinstance(cert_payload.get("data_conseguimento"), date):
        cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()

    response = client.post(f"{API_CERT_STR}/", json=cert_payload, headers=headers)
    
    assert response.status_code == 201
    created_cert_resp = response.json()
    assert created_cert_resp["nome_certificazione"] == cert_payload["nome_certificazione"]
    assert created_cert_resp["profilo_id"] == profilo_id
    assert "id" in created_cert_resp

    db_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(db_session, certificazione_id=created_cert_resp["id"], profilo_id=profilo_id)
    assert db_cert is not None
    assert db_cert.nome_certificazione == cert_payload["nome_certificazione"]

def test_create_certificazione_fail_not_professionista(client: TestClient, db_session: Session):
    user_id = 602
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id, tipo_utente="cliente")
    
    cert_payload = create_certificazione_data()
    if isinstance(cert_payload.get("data_conseguimento"), date): cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()

    response = client.post(f"{API_CERT_STR}/", json=cert_payload, headers=headers)
    assert response.status_code == 403

def test_create_certificazione_fail_no_profile(client: TestClient, db_session: Session):
    user_id = 603
    token = generate_valid_jwt_token(user_id=user_id, tipo_utente="professionista")
    headers = {"Authorization": f"Bearer {token}"}
    
    cert_payload = create_certificazione_data()
    if isinstance(cert_payload.get("data_conseguimento"), date): cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()
        
    response = client.post(f"{API_CERT_STR}/", json=cert_payload, headers=headers)
    assert response.status_code == 404 # Profile not found by dependency


# --- Test GET /certificazioni/ (List) ---
def test_read_certificazioni_list_success(client: TestClient, db_session: Session):
    user_id = 604
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    
    cert_data1 = create_certificazione_data()
    if isinstance(cert_data1.get("data_conseguimento"), date): cert_data1["data_conseguimento"] = cert_data1["data_conseguimento"].isoformat()
    cert_data2 = create_certificazione_data()
    if isinstance(cert_data2.get("data_conseguimento"), date): cert_data2["data_conseguimento"] = cert_data2["data_conseguimento"].isoformat()

    crud_certificazione.create_profilo_certificazione(db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data1), profilo_id=profilo_id)
    crud_certificazione.create_profilo_certificazione(db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data2), profilo_id=profilo_id)
    
    response = client.get(f"{API_CERT_STR}/", headers=headers)
    assert response.status_code == 200
    cert_list = response.json()
    assert isinstance(cert_list, list)
    assert len(cert_list) == 2
    assert cert_list[0]["profilo_id"] == profilo_id


# --- Test GET /certificazioni/{certificazione_id}/ (Single) ---
def test_read_single_certificazione_success(client: TestClient, db_session: Session):
    user_id = 605
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    cert_payload = create_certificazione_data()
    if isinstance(cert_payload.get("data_conseguimento"), date): cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()
    created_cert = crud_certificazione.create_profilo_certificazione(db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_payload), profilo_id=profilo_id)
    
    response = client.get(f"{API_CERT_STR}/{created_cert.id}/", headers=headers)
    assert response.status_code == 200
    cert_resp = response.json()
    assert cert_resp["id"] == created_cert.id
    assert cert_resp["nome_certificazione"] == cert_payload["nome_certificazione"]

def test_read_single_certificazione_fail_not_found(client: TestClient, db_session: Session):
    user_id = 606
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    non_existent_cert_id = 9999
    
    response = client.get(f"{API_CERT_STR}/{non_existent_cert_id}/", headers=headers)
    assert response.status_code == 404


# --- Test PUT /certificazioni/{certificazione_id}/ ---
def test_update_certificazione_success(client: TestClient, db_session: Session):
    user_id = 607
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    cert_payload = create_certificazione_data()
    if isinstance(cert_payload.get("data_conseguimento"), date): cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()
    created_cert = crud_certificazione.create_profilo_certificazione(db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_payload), profilo_id=profilo_id)
    
    update_payload = create_certificazione_update_data()
    if isinstance(update_payload.get("data_conseguimento"), date): update_payload["data_conseguimento"] = update_payload["data_conseguimento"].isoformat()

    response = client.put(f"{API_CERT_STR}/{created_cert.id}/", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    updated_cert_resp = response.json()
    assert updated_cert_resp["id"] == created_cert.id
    assert updated_cert_resp["ente_rilasciante"] == update_payload["ente_rilasciante"] # Example field from update util

    db_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(db_session, certificazione_id=created_cert.id, profilo_id=profilo_id)
    assert db_cert.ente_rilasciante == update_payload["ente_rilasciante"]


# --- Test DELETE /certificazioni/{certificazione_id}/ ---
def test_delete_certificazione_success(client: TestClient, db_session: Session):
    user_id = 608
    profilo_id, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    cert_payload = create_certificazione_data()
    if isinstance(cert_payload.get("data_conseguimento"), date): cert_payload["data_conseguimento"] = cert_payload["data_conseguimento"].isoformat()
    created_cert = crud_certificazione.create_profilo_certificazione(db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_payload), profilo_id=profilo_id)
    
    response = client.delete(f"{API_CERT_STR}/{created_cert.id}/", headers=headers)
    assert response.status_code == 204
    
    assert crud_certificazione.get_certificazione_by_id_and_profilo_id(db_session, certificazione_id=created_cert.id, profilo_id=profilo_id) is None

def test_delete_certificazione_fail_not_found(client: TestClient, db_session: Session):
    user_id = 609
    _, headers = _setup_profilo_and_get_auth_headers(client, db_session, user_id)
    non_existent_cert_id = 9996
    
    response = client.delete(f"{API_CERT_STR}/{non_existent_cert_id}/", headers=headers)
    assert response.status_code == 404
