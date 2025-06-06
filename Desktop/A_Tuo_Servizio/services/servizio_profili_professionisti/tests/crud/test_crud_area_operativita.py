import pytest
from sqlalchemy.orm import Session

from ...app.crud import crud_area_operativita, crud_profilo
from ...app.schemas import area_operativita_schemas as schemas_ao
from ...app.schemas import profilo_schemas
from ...app.db.models.area_operativita import AreaOperativita # For type hinting
from ..utils.profile_utils import create_profilo_professionista_data, create_area_operativita_data

# Helper to create a profile first
def _create_test_profilo(db: Session, user_id: int = 1) -> int:
    profilo_data = create_profilo_professionista_data()
    profilo_in = profilo_schemas.ProfiloProfessionistaCreate(**profilo_data)
    profilo = crud_profilo.create_profilo(db, profilo_in=profilo_in, user_id=user_id, tipo_utente_token="professionista")
    return profilo.id

# --- Test create_profilo_area ---
def test_create_profilo_area_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=101)
    area_data = create_area_operativita_data()
    area_in = schemas_ao.AreaOperativitaCreate(**area_data)
    
    created_area = crud_area_operativita.create_profilo_area(db=db_session, area_in=area_in, profilo_id=profilo_id)
    
    assert created_area is not None
    assert created_area.profilo_id == profilo_id
    assert created_area.tipo_area == area_data["tipo_area"]
    assert created_area.valore_area == area_data["valore_area"]
    assert hasattr(created_area, "id")
    
    db_retrieved_area = db_session.query(AreaOperativita).filter(AreaOperativita.id == created_area.id).first()
    assert db_retrieved_area is not None
    assert db_retrieved_area.tipo_area == area_data["tipo_area"]

# --- Test get_aree_by_profilo_id ---
def test_get_aree_by_profilo_id_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=102)
    area1_data = create_area_operativita_data(tipo_area="Regione", valore_area="Lombardia")
    area2_data = create_area_operativita_data(tipo_area="Provincia", valore_area="MI")
    
    crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area1_data), profilo_id=profilo_id)
    crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area2_data), profilo_id=profilo_id)
    
    aree = crud_area_operativita.get_aree_by_profilo_id(db=db_session, profilo_id=profilo_id)
    assert len(aree) == 2
    assert aree[0].valore_area == "Lombardia"
    assert aree[1].valore_area == "MI"

def test_get_aree_by_profilo_id_not_found(db_session: Session):
    profilo_id_with_no_areas = _create_test_profilo(db_session, user_id=103)
    aree = crud_area_operativita.get_aree_by_profilo_id(db=db_session, profilo_id=profilo_id_with_no_areas)
    assert len(aree) == 0

def test_get_aree_by_profilo_id_pagination(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=104)
    for i in range(5):
        area_data = create_area_operativita_data(valore_area=f"Area{i}")
        crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo_id)
        
    aree_page1 = crud_area_operativita.get_aree_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=0, limit=2)
    assert len(aree_page1) == 2
    assert aree_page1[0].valore_area == "Area0"
    
    aree_page2 = crud_area_operativita.get_aree_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=2, limit=2)
    assert len(aree_page2) == 2
    assert aree_page2[0].valore_area == "Area2"

# --- Test get_area_by_id_and_profilo_id ---
def test_get_area_by_id_and_profilo_id_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=105)
    area_data = create_area_operativita_data()
    created_area = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo_id)
    
    found_area = crud_area_operativita.get_area_by_id_and_profilo_id(db=db_session, area_id=created_area.id, profilo_id=profilo_id)
    assert found_area is not None
    assert found_area.id == created_area.id

def test_get_area_by_id_and_profilo_id_not_found_for_profilo(db_session: Session):
    profilo1_id = _create_test_profilo(db_session, user_id=106)
    profilo2_id = _create_test_profilo(db_session, user_id=107) # Different profile
    
    area_data = create_area_operativita_data()
    created_area_for_profilo1 = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo1_id)
    
    # Try to get area with correct ID but wrong profilo_id
    found_area = crud_area_operativita.get_area_by_id_and_profilo_id(db=db_session, area_id=created_area_for_profilo1.id, profilo_id=profilo2_id)
    assert found_area is None

def test_get_area_by_id_and_profilo_id_area_does_not_exist(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=108)
    non_existent_area_id = 9999
    found_area = crud_area_operativita.get_area_by_id_and_profilo_id(db=db_session, area_id=non_existent_area_id, profilo_id=profilo_id)
    assert found_area is None

# --- Test update_area ---
def test_update_area_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=109)
    area_data = create_area_operativita_data(tipo_area="OriginalType", valore_area="OriginalValue")
    db_area = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo_id)
    
    update_data_dict = {"tipo_area": "UpdatedType", "valore_area": "UpdatedValue"}
    area_update_schema = schemas_ao.AreaOperativitaUpdate(**update_data_dict)
    
    updated_area = crud_area_operativita.update_area(db=db_session, db_area=db_area, area_in=area_update_schema)
    
    assert updated_area is not None
    assert updated_area.id == db_area.id
    assert updated_area.tipo_area == "UpdatedType"
    assert updated_area.valore_area == "UpdatedValue"
    
    re_fetched_area = db_session.query(AreaOperativita).filter(AreaOperativita.id == db_area.id).first()
    assert re_fetched_area.tipo_area == "UpdatedType"

def test_update_area_partial(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=110)
    area_data = create_area_operativita_data(tipo_area="OriginalType", valore_area="OriginalValue")
    db_area = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo_id)
    
    update_data_dict = {"valore_area": "OnlyValueUpdated"} # Update only one field
    area_update_schema = schemas_ao.AreaOperativitaUpdate(**update_data_dict)
    
    updated_area = crud_area_operativita.update_area(db=db_session, db_area=db_area, area_in=area_update_schema)
    
    assert updated_area.tipo_area == "OriginalType" # Should remain unchanged
    assert updated_area.valore_area == "OnlyValueUpdated"

# --- Test delete_area ---
def test_delete_area_success(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=111)
    area_data = create_area_operativita_data()
    db_area = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo_id)
    area_id_to_delete = db_area.id
    
    deleted_area = crud_area_operativita.delete_area(db=db_session, area_id=area_id_to_delete, profilo_id=profilo_id)
    
    assert deleted_area is not None
    assert deleted_area.id == area_id_to_delete
    
    assert db_session.query(AreaOperativita).filter(AreaOperativita.id == area_id_to_delete).first() is None

def test_delete_area_not_found(db_session: Session):
    profilo_id = _create_test_profilo(db_session, user_id=112)
    non_existent_area_id = 8888
    
    deleted_area = crud_area_operativita.delete_area(db=db_session, area_id=non_existent_area_id, profilo_id=profilo_id)
    assert deleted_area is None

def test_delete_area_wrong_profilo_id(db_session: Session):
    profilo1_id = _create_test_profilo(db_session, user_id=113)
    profilo2_id = _create_test_profilo(db_session, user_id=114)
    
    area_data = create_area_operativita_data()
    db_area_profilo1 = crud_area_operativita.create_profilo_area(db=db_session, area_in=schemas_ao.AreaOperativitaCreate(**area_data), profilo_id=profilo1_id)
    
    # Try to delete area belonging to profilo1 using profilo2_id
    deleted_area = crud_area_operativita.delete_area(db=db_session, area_id=db_area_profilo1.id, profilo_id=profilo2_id)
    assert deleted_area is None
    
    # Ensure area still exists for profilo1
    assert db_session.query(AreaOperativita).filter(AreaOperativita.id == db_area_profilo1.id).first() is not None
