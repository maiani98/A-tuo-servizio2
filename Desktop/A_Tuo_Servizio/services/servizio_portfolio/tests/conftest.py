import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importa l'app principale e le dipendenze del database dal tuo servizio
from ..app.main import app
from ..app.db.database import Base, get_db # Assicurati che Base sia importabile

# URL del database SQLite in memoria per i test
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}, # Necessario per SQLite
    poolclass=StaticPool  # Consigliato per SQLite in memoria per i test
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override della dipendenza get_db per usare la sessione di test
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Crea tutte le tabelle del database una volta per sessione di test.
    L'opzione autouse=True assicura che venga eseguita automaticamente.
    """
    # Assicurati che tutti i modelli siano importati prima di chiamare create_all
    # Questo di solito avviene importando i moduli dei modelli nel file database.py
    # o nel file main dell'app se init_db li importa.
    # Per i test, se Base non è popolata, le tabelle non verranno create.
    # La funzione init_db() nel tuo database.py dovrebbe importare i modelli.
    # Qui, Base.metadata.create_all presume che Base sia stata popolata.
    Base.metadata.create_all(bind=engine)
    yield
    # Base.metadata.drop_all(bind=engine) # Opzionale: pulizia dopo i test

@pytest.fixture(scope="function")
def db_session():
    """
    Fornisce una sessione di database di test pulita per ogni funzione di test.
    Si assicura che le tabelle siano vuote prima di ogni test.
    """
    Base.metadata.drop_all(bind=engine) # Pulisce da test precedenti
    Base.metadata.create_all(bind=engine) # Ricrea le tabelle

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module")
def client():
    """
    Fornisce un'istanza di TestClient per i test di integrazione API.
    """
    with TestClient(app) as c:
        yield c
