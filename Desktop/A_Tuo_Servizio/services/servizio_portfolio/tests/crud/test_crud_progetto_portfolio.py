import pytest
from sqlalchemy.orm import Session

from ...app.crud import crud_progetto_portfolio
from ...app.schemas import progetto_schemas
from ...app.db.models.progetto_portfolio import ProgettoPortfolioModel # For type hinting
from ..utils.portfolio_utils import create_progetto_portfolio_data

# --- Test create_progetto ---
def test_create_progetto_success(db_session: Session):
    profilo_id = 1 # Example profilo_id
    progetto_in_data = create_progetto_portfolio_data()
    progetto_in = progetto_schemas.ProgettoPortfolioCreate(**progetto_in_data)
    
    created_progetto = crud_progetto_portfolio.create_progetto(
        db=db_session, 
        progetto_in=progetto_in, 
        profilo_id=profilo_id
    )
    
    assert created_progetto is not None
    assert created_progetto.profilo_professionista_id == profilo_id
    assert created_progetto.titolo == progetto_in.titolo
    assert created_progetto.descrizione == progetto_in.descrizione
    assert created_progetto.ordine == progetto_in.ordine
    assert hasattr(created_progetto, "id")
    
    db_retrieved_progetto = db_session.query(ProgettoPortfolioModel).filter(ProgettoPortfolioModel.id == created_progetto.id).first()
    assert db_retrieved_progetto is not None
    assert db_retrieved_progetto.profilo_professionista_id == profilo_id

# --- Test get_progetti_by_profilo_id ---
def test_get_progetti_by_profilo_id_found(db_session: Session):
    profilo_id = 2
    # Create a couple of projects for this profile
    crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data(titolo="Progetto Alpha", ordine=1)), profilo_id=profilo_id)
    crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data(titolo="Progetto Beta", ordine=0)), profilo_id=profilo_id)
    
    # Create a project for another profile to ensure filtering works
    crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data(titolo="Progetto Gamma")), profilo_id=profilo_id + 1)

    found_progetti = crud_progetto_portfolio.get_progetti_by_profilo_id(db=db_session, profilo_id=profilo_id)
    assert len(found_progetti) == 2
    # Check order (ordine ASC, then data_creazione DESC - data_creazione is harder to test without time mocking)
    assert found_progetti[0].titolo == "Progetto Beta" # ordine 0
    assert found_progetti[1].titolo == "Progetto Alpha" # ordine 1

def test_get_progetti_by_profilo_id_not_found(db_session: Session):
    non_existent_profilo_id = 999
    found_progetti = crud_progetto_portfolio.get_progetti_by_profilo_id(db=db_session, profilo_id=non_existent_profilo_id)
    assert len(found_progetti) == 0

def test_get_progetti_by_profilo_id_pagination(db_session: Session):
    profilo_id = 3
    for i in range(5):
        crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data(titolo=f"Progetto {i}", ordine=i)), profilo_id=profilo_id)

    progetti_page1 = crud_progetto_portfolio.get_progetti_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=0, limit=2)
    assert len(progetti_page1) == 2
    assert progetti_page1[0].titolo == "Progetto 0"
    
    progetti_page2 = crud_progetto_portfolio.get_progetti_by_profilo_id(db=db_session, profilo_id=profilo_id, skip=2, limit=2)
    assert len(progetti_page2) == 2
    assert progetti_page2[0].titolo == "Progetto 2"

# --- Test get_progetto_by_id_and_profilo_id ---
def test_get_progetto_by_id_and_profilo_id_found(db_session: Session):
    profilo_id = 4
    progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id)
    
    found_progetto = crud_progetto_portfolio.get_progetto_by_id_and_profilo_id(db=db_session, progetto_id=progetto.id, profilo_id=profilo_id)
    assert found_progetto is not None
    assert found_progetto.id == progetto.id
    assert found_progetto.profilo_professionista_id == profilo_id

def test_get_progetto_by_id_and_profilo_id_wrong_profilo(db_session: Session):
    profilo_id_owner = 5
    profilo_id_other = 6
    progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id_owner)
    
    found_progetto = crud_progetto_portfolio.get_progetto_by_id_and_profilo_id(db=db_session, progetto_id=progetto.id, profilo_id=profilo_id_other)
    assert found_progetto is None

# --- Test get_progetto_for_public_view ---
def test_get_progetto_for_public_view_found(db_session: Session):
    profilo_id_pub = 7
    progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id_pub)

    found_progetto = crud_progetto_portfolio.get_progetto_for_public_view(db=db_session, progetto_id=progetto.id, profilo_id_pub=profilo_id_pub)
    assert found_progetto is not None
    assert found_progetto.id == progetto.id
    assert found_progetto.profilo_professionista_id == profilo_id_pub

def test_get_progetto_for_public_view_wrong_profilo(db_session: Session):
    profilo_id_owner_pub = 8
    profilo_id_other_pub = 9
    progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id_owner_pub)

    found_progetto = crud_progetto_portfolio.get_progetto_for_public_view(db=db_session, progetto_id=progetto.id, profilo_id_pub=profilo_id_other_pub)
    assert found_progetto is None


# --- Test update_progetto ---
def test_update_progetto_success(db_session: Session):
    profilo_id = 10
    db_progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data(titolo="Titolo Originale")), profilo_id=profilo_id)
    
    update_data_dict = {"titolo": "Titolo Aggiornato", "descrizione": "Descrizione aggiornata."}
    progetto_update_schema = progetto_schemas.ProgettoPortfolioUpdate(**update_data_dict)
    
    updated_progetto = crud_progetto_portfolio.update_progetto(db=db_session, db_progetto=db_progetto, progetto_in=progetto_update_schema)
    
    assert updated_progetto is not None
    assert updated_progetto.id == db_progetto.id
    assert updated_progetto.titolo == "Titolo Aggiornato"
    assert updated_progetto.descrizione == "Descrizione aggiornata."
    
    re_fetched_progetto = db_session.query(ProgettoPortfolioModel).filter(ProgettoPortfolioModel.id == db_progetto.id).first()
    assert re_fetched_progetto.titolo == "Titolo Aggiornato"

# --- Test delete_progetto ---
def test_delete_progetto_success(db_session: Session):
    profilo_id = 11
    db_progetto = crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id)
    progetto_id_to_delete = db_progetto.id
    
    deleted_progetto = crud_progetto_portfolio.delete_progetto(db=db_session, progetto_id=progetto_id_to_delete, profilo_id=profilo_id)
    
    assert deleted_progetto is not None
    assert deleted_progetto.id == progetto_id_to_delete
    
    assert db_session.query(ProgettoPortfolioModel).filter(ProgettoPortfolioModel.id == progetto_id_to_delete).first() is None

def test_delete_progetto_not_found_or_wrong_profilo(db_session: Session):
    profilo_id = 12
    # Create a project for this profile
    crud_progetto_portfolio.create_progetto(db_session, progetto_in=progetto_schemas.ProgettoPortfolioCreate(**create_progetto_portfolio_data()), profilo_id=profilo_id)

    # Attempt to delete a non-existent project for this profile
    deleted_non_existent = crud_progetto_portfolio.delete_progetto(db=db_session, progetto_id=9999, profilo_id=profilo_id)
    assert deleted_non_existent is None
    
    # Attempt to delete an existing project but with wrong profilo_id
    real_progetto = crud_progetto_portfolio.get_progetti_by_profilo_id(db=db_session, profilo_id=profilo_id)[0]
    deleted_wrong_profilo = crud_progetto_portfolio.delete_progetto(db=db_session, progetto_id=real_progetto.id, profilo_id=profilo_id + 1)
    assert deleted_wrong_profilo is None
    assert db_session.query(ProgettoPortfolioModel).filter(ProgettoPortfolioModel.id == real_progetto.id).first() is not None # Still exists
