import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError
from unittest.mock import patch

from ...app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from ...app.core.config import settings

def test_hash_password():
    password = "plainpassword"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)

def test_verify_password_correct():
    password = "correctpassword"
    hashed = hash_password(password)
    assert verify_password(password, hashed)

def test_verify_password_incorrect():
    password = "correctpassword"
    wrong_password = "wrongpassword"
    hashed = hash_password(password)
    assert not verify_password(wrong_password, hashed)

def test_create_access_token():
    data = {"sub": "testuser@example.com", "user_id": 1}
    token = create_access_token(data)
    assert isinstance(token, str)
    
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == data["sub"]
    assert payload["user_id"] == data["user_id"]
    assert "exp" in payload

def test_create_access_token_custom_expiry():
    data = {"sub": "testuser@example.com", "user_id": 1}
    expires_delta = timedelta(minutes=15)
    token = create_access_token(data, expires_delta=expires_delta)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    
    expected_exp = datetime.utcnow() + expires_delta
    # Allow a small tolerance for the expiration time check due to execution time
    assert abs(datetime.fromtimestamp(payload["exp"]) - expected_exp).total_seconds() < 5


def test_decode_access_token_valid():
    user_id = 123
    email = "test@example.com"
    token = create_access_token(data={"user_id": user_id, "sub": email})
    
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("user_id") == user_id
    assert payload.get("sub") == email

def test_decode_access_token_expired():
    # Create a token that expires very quickly
    token = create_access_token(data={"user_id": 1, "sub": "test@example.com"}, expires_delta=timedelta(seconds=-1)) # Expired
    
    # We might need to mock time if the token creation and decoding is too fast
    # For now, let's assume a timedelta of -1 second is enough
    payload = decode_access_token(token)
    assert payload is None

@patch('jose.jwt.decode')
def test_decode_access_token_jwt_error(mock_jwt_decode):
    mock_jwt_decode.side_effect = JWTError("Simulated JWT Error")
    
    token = "a-malformed-or-invalid-token"
    payload = decode_access_token(token)
    assert payload is None

def test_decode_access_token_invalid_signature():
    # Create a token with the correct structure but wrong secret key
    data = {"sub": "testuser@example.com", "user_id": 1, "exp": datetime.utcnow() + timedelta(minutes=15)}
    invalid_token = jwt.encode(data, "WRONG_SECRET_KEY", algorithm=settings.ALGORITHM)
    
    payload = decode_access_token(invalid_token)
    assert payload is None

def test_decode_access_token_malformed():
    token = "this.is.not.a.valid.jwt.token"
    payload = decode_access_token(token)
    assert payload is None
