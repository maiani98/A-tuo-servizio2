import pytest
from sqlalchemy.orm import Session
from datetime import date

from ...app.crud import crud_certificazione, crud_profilo
from ...app.schemas import certificazione_schemas as schemas_cert
from ...app.schemas import profilo_schemas
from ...app.db.models.certificazione import Certificazione # For type hinting
from ..utils.profile_utils import create_profilo_professionista_data, create_certificazione_data

# Helper to create a profile first
def _create_test_profilo(db: Session, user_id: int = 1) -> int:
    profilo_data = create_profilo_professionista_data()
    profilo_in = profilo_schemas.ProfiloProfessionistaCreate(**profilo_data)
    profilo = crud_profilo.create_profilo(db, profilo_in=profilo_in, user_id=user_id, tipo_utente_token="professionista")
    return profilo.id

# --- Test create_profilo_certificazione ---
def test_create_profilo_certificazione_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=201)
    cert_data = create_certificazione_data()
    # Convert date string from util to date object if necessary for schema
    if isinstance(cert_data.get("data_conseguimento"), str):
        cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
        
    cert_in = schemas_cert.CertificazioneCreate(**cert_data)
    
    created_cert = crud_certificazione.create_profilo_certificazione(
        db=db_session, certificazione_in=cert_in, profilo_id=profilo_id
    )
    
    assert created_cert is not None
    assert created_cert.profilo_id == profilo_id
    assert created_cert.nome_certificazione == cert_data["nome_certificazione"]
    assert created_cert.ente_rilasciante == cert_data["ente_rilasciante"]
    assert created_cert.data_conseguimento == cert_data["data_conseguimento"]
    assert str(created_cert.documento_url) == cert_data["documento_url"] # Pydantic HttpUrl to str
    assert hasattr(created_cert, "id")
    
    db_retrieved_cert = db_session.query(Certificazione).filter(Certificazione.id == created_cert.id).first()
    assert db_retrieved_cert is not None
    assert db_retrieved_cert.nome_certificazione == cert_data["nome_certificazione"]

# --- Test get_certificazioni_by_profilo_id ---
def test_get_certificazioni_by_profilo_id_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=202)
    cert1_data = create_certificazione_data(nome_certificazione="Cert1")
    if isinstance(cert1_data.get("data_conseguimento"), str): cert1_data["data_conseguimento"] = date.fromisoformat(cert1_data["data_conseguimento"])
    cert2_data = create_certificazione_data(nome_certificazione="Cert2")
    if isinstance(cert2_data.get("data_conseguimento"), str): cert2_data["data_conseguimento"] = date.fromisoformat(cert2_data["data_conseguimento"])

    crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert1_data), profilo_id=profilo_id)
    crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert2_data), profilo_id=profilo_id)
    
    certs = crud_certificazione.get_certificazioni_by_profilo_id(db=db_session, profilo_id=profilo_id)
    assert len(certs) == 2
    assert certs[0].nome_certificazione == "Cert1"
    assert certs[1].nome_certificazione == "Cert2"

def test_get_certificazioni_by_profilo_id_not_found(db_session: Session):
    profilo_id_no_certs = _create_test_profilo(db_session, user_id=203)
    certs = crud_certificazione.get_certificazioni_by_profilo_id(db=db_session, profilo_id=profilo_id_no_certs)
    assert len(certs) == 0

def test_get_certificazioni_by_profilo_id_pagination(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=204)
    for i in range(5):
        cert_data = create_certificazione_data(nome_certificazione=f"Cert{i}")
        if isinstance(cert_data.get("data_conseguimento"), str): cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
        crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data), profilo_id=profilo_id)
        
    certs_page1 = crud_certificazione.get_certificazioni_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=0, limit=2)
    assert len(certs_page1) == 2
    assert certs_page1[0].nome_certificazione == "Cert0"
    
    certs_page2 = crud_certificazione.get_certificazioni_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=2, limit=2)
    assert len(certs_page2) == 2
    assert certs_page2[0].nome_certificazione == "Cert2"

# --- Test get_certificazione_by_id_and_profilo_id ---
def test_get_certificazione_by_id_and_profilo_id_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=205)
    cert_data = create_certificazione_data()
    if isinstance(cert_data.get("data_conseguimento"), str): cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
    created_cert = crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data), profilo_id=profilo_id)
    
    found_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(db=db_session, certificazione_id=created_cert.id, profilo_id=profilo_id)
    assert found_cert is not None
    assert found_cert.id == created_cert.id

def test_get_certificazione_by_id_and_profilo_id_not_found_for_profilo(db_session: Session):
    profilo1_id = _create_test_profilo(db_session, user_id=206)
    profilo2_id = _create_test_profilo(db_session, user_id=207) # Different profile
    
    cert_data = create_certificazione_data()
    if isinstance(cert_data.get("data_conseguimento"), str): cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
    created_cert_for_profilo1 = crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data), profilo_id=profilo1_id)
    
    found_cert = crud_certificazione.get_certificazione_by_id_and_profilo_id(db=db_session, certificazione_id=created_cert_for_profilo1.id, profilo_id=profilo2_id)
    assert found_cert is None

# --- Test update_certificazione ---
def test_update_certificazione_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=208)
    cert_data = create_certificazione_data(nome_certificazione="OldName")
    if isinstance(cert_data.get("data_conseguimento"), str): cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
    db_cert = crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data), profilo_id=profilo_id)
    
    update_data_dict = {"nome_certificazione": "NewName", "ente_rilasciante": "NewEnte"}
    cert_update_schema = schemas_cert.CertificazioneUpdate(**update_data_dict)
    
    updated_cert = crud_certificazione.update_certificazione(db=db_session, db_certificazione=db_cert, certificazione_in=cert_update_schema)
    
    assert updated_cert is not None
    assert updated_cert.id == db_cert.id
    assert updated_cert.nome_certificazione == "NewName"
    assert updated_cert.ente_rilasciante == "NewEnte"
    
    re_fetched_cert = db_session.query(Certificazione).filter(Certificazione.id == db_cert.id).first()
    assert re_fetched_cert.nome_certificazione == "NewName"

# --- Test delete_certificazione ---
def test_delete_certificazione_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=209)
    cert_data = create_certificazione_data()
    if isinstance(cert_data.get("data_conseguimento"), str): cert_data["data_conseguimento"] = date.fromisoformat(cert_data["data_conseguimento"])
    db_cert = crud_certificazione.create_profilo_certificazione(db=db_session, certificazione_in=schemas_cert.CertificazioneCreate(**cert_data), profilo_id=profilo_id)
    cert_id_to_delete = db_cert.id
    
    deleted_cert = crud_certificazione.delete_certificazione(db=db_session, certificazione_id=cert_id_to_delete, profilo_id=profilo_id)
    
    assert deleted_cert is not None
    assert deleted_cert.id == cert_id_to_delete
    
    assert db_session.query(Certificazione).filter(Certificazione.id == cert_id_to_delete).first() is None

def test_delete_certificazione_not_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=210)
    non_existent_cert_id = 7777
    
    deleted_cert = crud_certificazione.delete_certificazione(db=db_session, certificazione_id=non_existent_cert_id, profilo_id=profilo_id)
    assert deleted_cert is None
