import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ...app.crud import crud_utente
from ...app.schemas import utente as schemas_utente
from ...app.db import models # For type hinting
from ..utils.user import create_user_data, get_valid_password, random_email

def test_create_user_success(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    
    created_user = crud_utente.create_user(db_session, user_in)
    
    assert created_user is not None
    assert created_user.email == user_in.email
    assert created_user.nome == user_in.nome
    assert created_user.cognome == user_in.cognome
    assert created_user.tipo_utente == user_in.tipo_utente
    assert created_user.stato_account == "non_verificato" # Default value
    assert hasattr(created_user, "id")
    assert created_user.id is not None
    assert hasattr(created_user, "password_hash")
    assert created_user.password_hash is not None

    # Verify it's in the DB
    db_user = db_session.query(models.utente.Utente).filter(models.utente.Utente.id == created_user.id).first()
    assert db_user is not None
    assert db_user.email == user_in.email

def test_create_user_duplicate_email(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    
    crud_utente.create_user(db_session, user_in) # First user
    
    with pytest.raises(HTTPException) as excinfo:
        crud_utente.create_user(db_session, user_in) # Attempt to create with same email
    assert excinfo.value.status_code == 409
    assert "Email already registered" in excinfo.value.detail

def test_get_user_by_email_found(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    created_user = crud_utente.create_user(db_session, user_in)
    
    found_user = crud_utente.get_user_by_email(db_session, email=created_user.email)
    assert found_user is not None
    assert found_user.id == created_user.id
    assert found_user.email == created_user.email

def test_get_user_by_email_not_found(db_session: Session):
    non_existent_email = random_email()
    found_user = crud_utente.get_user_by_email(db_session, email=non_existent_email)
    assert found_user is None

def test_get_user_by_id_found(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    created_user = crud_utente.create_user(db_session, user_in)
    
    found_user = crud_utente.get_user_by_id(db_session, user_id=created_user.id)
    assert found_user is not None
    assert found_user.id == created_user.id
    assert found_user.email == created_user.email

def test_get_user_by_id_not_found(db_session: Session):
    non_existent_id = 999999
    found_user = crud_utente.get_user_by_id(db_session, user_id=non_existent_id)
    assert found_user is None

def test_authenticate_user_success(db_session: Session):
    password = get_valid_password()
    user_in_data = create_user_data(password=password)
    user_in = schemas_utente.UserCreate(**user_in_data)
    created_user = crud_utente.create_user(db_session, user_in)
    
    authenticated_user = crud_utente.authenticate_user(db_session, email=created_user.email, password=password)
    assert authenticated_user is not None
    assert authenticated_user.id == created_user.id
    assert authenticated_user.email == created_user.email

def test_authenticate_user_wrong_password(db_session: Session):
    password = get_valid_password()
    user_in_data = create_user_data(password=password)
    user_in = schemas_utente.UserCreate(**user_in_data)
    created_user = crud_utente.create_user(db_session, user_in)
    
    authenticated_user = crud_utente.authenticate_user(db_session, email=created_user.email, password="wrongpassword")
    assert authenticated_user is None

def test_authenticate_user_not_found(db_session: Session):
    non_existent_email = random_email()
    password = get_valid_password()
    authenticated_user = crud_utente.authenticate_user(db_session, email=non_existent_email, password=password)
    assert authenticated_user is None

def test_update_user_success(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    db_user = crud_utente.create_user(db_session, user_in)
    
    original_update_time = db_user.data_aggiornamento

    update_data_dict = {"nome": "UpdatedName", "cognome": "UpdatedSurname"}
    user_update_schema = schemas_utente.UserUpdateSchema(**update_data_dict)
    
    # Ensure some time passes for data_aggiornamento to change
    # This is a bit tricky to test precisely with onupdate=func.now() without mocking time
    # or waiting. For now, we'll check if it's different or greater if the system supports it.
    
    updated_user = crud_utente.update_user(db_session, db_user=db_user, user_in=user_update_schema)
    
    assert updated_user is not None
    assert updated_user.id == db_user.id
    assert updated_user.nome == "UpdatedName"
    assert updated_user.cognome == "UpdatedSurname"
    assert updated_user.email == user_in.email # Email should not change
    
    # Check if data_aggiornamento was updated
    # This might be the same if the transaction is too fast.
    # A more robust test would involve mocking func.now() or checking its value explicitly.
    assert updated_user.data_aggiornamento >= original_update_time

    # Verify in DB
    re_fetched_user = db_session.query(models.utente.Utente).filter(models.utente.Utente.id == db_user.id).first()
    assert re_fetched_user.nome == "UpdatedName"
    assert re_fetched_user.cognome == "UpdatedSurname"

def test_update_user_no_fields_changed(db_session: Session):
    user_in_data = create_user_data()
    user_in = schemas_utente.UserCreate(**user_in_data)
    db_user = crud_utente.create_user(db_session, user_in)
    original_update_time = db_user.data_aggiornamento

    user_update_schema = schemas_utente.UserUpdateSchema() # No fields to update
    
    updated_user = crud_utente.update_user(db_session, db_user=db_user, user_in=user_update_schema)
    
    assert updated_user is not None
    assert updated_user.id == db_user.id
    assert updated_user.nome == user_in.nome # Should remain the same
    assert updated_user.cognome == user_in.cognome # Should remain the same
    
    # data_aggiornamento might or might not change depending on DB and if commit happens
    # For SQLAlchemy, if no actual column values changed, an UPDATE statement might not be issued.
    # If it is issued (e.g. due to setting data_aggiornamento explicitly in code), then it would change.
    # Given our current update_user, it iterates user_data.items(). If empty, no setattr calls.
    # So, data_aggiornamento should ideally not change if no fields are in user_in.
    # However, the model has onupdate=func.now(). If SQLAlchemy issues an UPDATE for any reason
    # (even if no values changed from the user_in perspective but other model defaults kick in),
    # it could update.
    # For this test, let's assume if no fields are passed, no actual user-data update occurs.
    # The behavior of `data_aggiornamento` can be very specific to the ORM's dirty tracking.
    # If the test db_user.data_aggiornamento == original_update_time fails, it means an UPDATE was issued.
    # This is not necessarily wrong, but good to be aware of.

    # Let's check that the values are indeed unchanged.
    assert updated_user.data_aggiornamento == original_update_time # More precise for "no change"

def test_update_user_partial_update(db_session: Session):
    user_in_data = create_user_data(nome="OriginalName", cognome="OriginalSurname")
    user_in = schemas_utente.UserCreate(**user_in_data)
    db_user = crud_utente.create_user(db_session, user_in)
    
    update_data_dict = {"nome": "NewNameOnly"}
    user_update_schema = schemas_utente.UserUpdateSchema(**update_data_dict)
    
    updated_user = crud_utente.update_user(db_session, db_user=db_user, user_in=user_update_schema)
    
    assert updated_user.nome == "NewNameOnly"
    assert updated_user.cognome == "OriginalSurname" # Should remain unchanged
    assert updated_user.email == user_in.email # Should remain unchanged
