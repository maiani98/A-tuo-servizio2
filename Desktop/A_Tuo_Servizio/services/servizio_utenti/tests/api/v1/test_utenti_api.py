import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session # Only for type hinting if needed, client handles db session
from typing import Dict

from ....app.core.config import settings # For API prefix
from ....app.schemas import utente as schemas_utente # For response model validation
from ...utils.user import create_user_data, random_email, get_valid_password, create_user_update_data
from ....app.crud import crud_utente # To directly create users for some tests
from ....app.db import models # To type hint user model

# API Prefix
API_V1_STR = "/api/v1/utenti"


# --- Test User Registration ---
def test_registra_utente_success(client: TestClient, db_session: Session): # db_session for potential direct db interaction if needed
    user_data = create_user_data()
    response = client.post(f"{API_V1_STR}/registra", json=user_data)
    
    assert response.status_code == 201
    created_user = response.json()
    assert created_user["email"] == user_data["email"]
    assert created_user["nome"] == user_data["nome"]
    assert created_user["cognome"] == user_data["cognome"]
    assert created_user["tipo_utente"] == user_data["tipo_utente"]
    assert "id" in created_user
    assert created_user["stato_account"] == "non_verificato"
    assert "password_hash" not in created_user # Ensure password hash is not returned

def test_registra_utente_duplicate_email(client: TestClient, db_session: Session):
    user_data = create_user_data()
    # Create user first
    client.post(f"{API_V1_STR}/registra", json=user_data)
    
    # Attempt to register again with the same email
    response = client.post(f"{API_V1_STR}/registra", json=user_data)
    assert response.status_code == 409
    assert "Email already registered" in response.json()["detail"]

@pytest.mark.parametrize("invalid_payload, expected_detail_part", [
    ({"email": "not-an-email", "password": "short", "tipo_utente": "cliente"}, "value is not a valid email address"),
    ({"email": random_email(), "password": "short", "tipo_utente": "cliente"}, "ensure this value has at least 8 characters"),
    ({"email": random_email(), "password": get_valid_password()}, "field required"), # Missing tipo_utente
])
def test_registra_utente_invalid_data(client: TestClient, invalid_payload: dict, expected_detail_part: str):
    response = client.post(f"{API_V1_STR}/registra", json=invalid_payload)
    assert response.status_code == 422
    assert expected_detail_part in str(response.json()["detail"]).lower()


# --- Test User Login ---
def test_login_for_access_token_success(client: TestClient, db_session: Session):
    user_data = create_user_data()
    # 1. Register user
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    assert reg_response.status_code == 201
    registered_user_id = reg_response.json()["id"]

    # 2. Manually activate user for login (since registration defaults to non_verificato)
    db_user = crud_utente.get_user_by_id(db_session, user_id=registered_user_id)
    assert db_user is not None
    db_user.stato_account = "attivo"
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    
    # 3. Login
    login_payload = {"username": user_data["email"], "password": user_data["password"]}
    response = client.post(f"{API_V1_STR}/login", data=login_payload) # Use data for OAuth2PasswordRequestForm
    
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_login_unverified_user(client: TestClient, db_session: Session):
    user_data = create_user_data()
    client.post(f"{API_V1_STR}/registra", json=user_data) # User is 'non_verificato' by default

    login_payload = {"username": user_data["email"], "password": user_data["password"]}
    response = client.post(f"{API_V1_STR}/login", data=login_payload)
    
    assert response.status_code == 403
    assert "User account is not verified" in response.json()["detail"]

def test_login_inactive_user(client: TestClient, db_session: Session):
    user_data = create_user_data()
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    registered_user_id = reg_response.json()["id"]

    db_user = crud_utente.get_user_by_id(db_session, user_id=registered_user_id)
    db_user.stato_account = "sospeso" # Set to an inactive state
    db_session.add(db_user)
    db_session.commit()
    
    login_payload = {"username": user_data["email"], "password": user_data["password"]}
    response = client.post(f"{API_V1_STR}/login", data=login_payload)
    
    assert response.status_code == 403
    assert f"User account is {db_user.stato_account}" in response.json()["detail"]


def test_login_wrong_email(client: TestClient):
    login_payload = {"username": random_email(), "password": get_valid_password()}
    response = client.post(f"{API_V1_STR}/login", data=login_payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_wrong_password(client: TestClient, db_session: Session):
    user_data = create_user_data()
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    registered_user_id = reg_response.json()["id"]
    
    # Activate user
    db_user = crud_utente.get_user_by_id(db_session, user_id=registered_user_id)
    db_user.stato_account = "attivo"
    db_session.add(db_user)
    db_session.commit()

    login_payload = {"username": user_data["email"], "password": "wrongpassword"}
    response = client.post(f"{API_V1_STR}/login", data=login_payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

# --- Helper to get token ---
def get_auth_token_headers(client: TestClient, db_session: Session, email: str = None, password: str = None) -> Dict[str, str]:
    if email is None:
        email = random_email()
    if password is None:
        password = get_valid_password()
    
    user_data = create_user_data(email=email, password=password)
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    assert reg_response.status_code == 201, f"Failed to register user for token: {reg_response.json()}"
    user_id = reg_response.json()["id"]

    # Activate user
    db_user = crud_utente.get_user_by_id(db_session, user_id=user_id)
    assert db_user is not None, f"User with ID {user_id} not found after registration."
    db_user.stato_account = "attivo"
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    assert db_user.stato_account == "attivo", "User account failed to activate."

    login_payload = {"username": email, "password": password}
    login_response = client.post(f"{API_V1_STR}/login", data=login_payload)
    assert login_response.status_code == 200, f"Login failed for token generation: {login_response.json()}"
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# --- Test /me Endpoints ---
def test_read_users_me_success(client: TestClient, db_session: Session):
    user_email = random_email()
    auth_headers = get_auth_token_headers(client, db_session, email=user_email)
    
    response = client.get(f"{API_V1_STR}/me", headers=auth_headers)
    assert response.status_code == 200
    user_me = response.json()
    assert user_me["email"] == user_email
    assert "password_hash" not in user_me

def test_read_users_me_no_token(client: TestClient):
    response = client.get(f"{API_V1_STR}/me")
    assert response.status_code == 401 # FastAPI default for missing OAuth2 token
    assert response.json()["detail"] == "Not authenticated"

def test_read_users_me_invalid_token(client: TestClient):
    auth_headers = {"Authorization": "Bearer thisisnotavalidtoken"}
    response = client.get(f"{API_V1_STR}/me", headers=auth_headers)
    assert response.status_code == 401 # Should be 401 due to deps.py logic
    assert "Could not validate credentials" in response.json()["detail"]


def test_update_user_me_success(client: TestClient, db_session: Session):
    user_email = random_email()
    auth_headers = get_auth_token_headers(client, db_session, email=user_email)
    
    update_data = create_user_update_data() # e.g., {"nome": "NewName", "cognome": "NewSurname"}
    
    response = client.put(f"{API_V1_STR}/me", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    updated_user = response.json()
    assert updated_user["nome"] == update_data["nome"]
    assert updated_user["cognome"] == update_data["cognome"]
    assert updated_user["email"] == user_email # Email should not change

    # Verify in DB
    db_user_after_update = crud_utente.get_user_by_email(db_session, email=user_email)
    assert db_user_after_update.nome == update_data["nome"]
    assert db_user_after_update.cognome == update_data["cognome"]

def test_update_user_me_no_token(client: TestClient):
    update_data = create_user_update_data()
    response = client.put(f"{API_V1_STR}/me", json=update_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_update_user_me_invalid_data(client: TestClient, db_session: Session):
    # This test is for structural validation of UserUpdateSchema by Pydantic
    # e.g. if UserUpdateSchema had validation like `nome: constr(min_length=1)`
    # For now, UserUpdateSchema allows all Optional fields, so an empty dict is valid
    # If you add constraints to UserUpdateSchema, you'd test them here.
    # Example: if email was part of UserUpdateSchema and an invalid email was sent.
    # For now, let's assume an empty payload is fine (no updates happen).
    
    auth_headers = get_auth_token_headers(client, db_session)
    # An empty payload should be valid for UserUpdateSchema if all fields are Optional
    # If UserUpdateSchema had required fields or specific validation (e.g. min_length for nome)
    # then this test would be more meaningful.
    # Example (if 'nome' was not optional or had min_length=2):
    # invalid_update_payload = {"nome": "N"} 
    # response = client.put(f"{API_V1_STR}/me", json=invalid_update_payload, headers=auth_headers)
    # assert response.status_code == 422 
    # assert "ensure this value has at least 2 characters" in str(response.json()["detail"]).lower()
    
    # Current UserUpdateSchema allows empty dict
    response = client.put(f"{API_V1_STR}/me", json={}, headers=auth_headers)
    assert response.status_code == 200 # No error, just no fields updated.

    # Test with a field that is not in UserUpdateSchema (e.g. trying to update email)
    # Pydantic by default ignores extra fields, so this won't cause a 422 unless config forbids extra.
    # If we want to test that email cannot be updated this way, UserUpdateSchema must not include 'email'.
    # This is already the case.
    response = client.put(f"{API_V1_STR}/me", json={"email": "new@example.com"}, headers=auth_headers)
    assert response.status_code == 200 # No error, 'email' is ignored.
    user_after_attempted_email_update = response.json()
    assert user_after_attempted_email_update["email"] != "new@example.com"

def test_get_me_user_not_active(client: TestClient, db_session: Session):
    user_data = create_user_data()
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    user_id = reg_response.json()["id"]

    # User is 'non_verificato' by default. Get token.
    # To get a token, we need to log in. But login checks for 'attivo' or 'non_verificato'.
    # So, we first need to get a token for an active user, then change that user's state.
    # This is a bit convoluted for /me. A better way is to get a token, then make user inactive.
    
    # Step 1: Register and activate a user to get a token
    active_user_email = random_email()
    active_user_password = get_valid_password()
    auth_headers = get_auth_token_headers(client, db_session, email=active_user_email, password=active_user_password)

    # Step 2: Find this user in DB and make them inactive (e.g., 'sospeso')
    user_to_make_inactive = crud_utente.get_user_by_email(db_session, email=active_user_email)
    assert user_to_make_inactive is not None
    user_to_make_inactive.stato_account = "sospeso"
    db_session.add(user_to_make_inactive)
    db_session.commit()
    db_session.refresh(user_to_make_inactive)

    # Step 3: Try to access /me with the token of the now inactive user
    response = client.get(f"{API_V1_STR}/me", headers=auth_headers)
    assert response.status_code == 403 # deps.get_current_active_user should raise this
    assert "Inactive user" in response.json()["detail"]

def test_get_me_user_not_verified(client: TestClient, db_session: Session):
    # Step 1: Register a user. They will be 'non_verificato'.
    user_data = create_user_data()
    reg_response = client.post(f"{API_V1_STR}/registra", json=user_data)
    assert reg_response.status_code == 201
    
    # Step 2: Try to log in. This will fail because user is 'non_verificato' (as tested in test_login_unverified_user)
    # So, we cannot get a token for a 'non_verificato' user through the normal login flow.
    # To test get_current_active_user's check for 'non_verificato', we would need to:
    # a) Create a token for a user_id that is 'non_verificato' (e.g. by manually creating a token)
    # b) Or, have an admin role that can deactivate/change status and then try to use the token.
    
    # Let's simulate by manually creating a token for a 'non_verificato' user
    # This means we need access to `create_access_token` and the user's ID.
    user_id = reg_response.json()["id"]
    from ....app.core.security import create_access_token # Import here for test specific use
    from datetime import timedelta
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Note: The 'sub' in the token is typically the username (email).
    # The 'user_id' is what `get_current_user` in `deps.py` uses primarily if present.
    # Our `create_access_token` in `endpoints/utenti.py` uses `data={"user_id": user.id, "sub": user.email}`
    manual_token = create_access_token(
        data={"user_id": user_id, "sub": user_data["email"]}, 
        expires_delta=access_token_expires
    )
    manual_auth_headers = {"Authorization": f"Bearer {manual_token}"}

    # Step 3: Try to access /me with this manually created token
    response = client.get(f"{API_V1_STR}/me", headers=manual_auth_headers)
    assert response.status_code == 403
    assert "User account is not verified" in response.json()["detail"]
