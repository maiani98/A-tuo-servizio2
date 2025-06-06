import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool # Recommended for SQLite in-memory for tests

# Adjust the import path to match your project structure
# This assumes 'app' is a directory at the same level as 'tests' or in PYTHONPATH
from ..app.main import app 
from ..app.db.database import Base, get_db 
from ..app.db.models.utente import Utente # Ensure your User model is imported if needed for cleanup or setup

# Define a separate SQLite database URL for testing
# Using in-memory SQLite for speed and isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool # Use StaticPool for SQLite in-memory tests
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the in-memory database before tests run
# This is handled by the autouse fixture 'setup_database' further down.

def override_get_db():
    """
    Dependency override for get_db to use the test database session.
    """
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the override for get_db for all tests
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Fixture to create all database tables once per test session.
    The autouse=True ensures it runs automatically.
    """
    Base.metadata.create_all(bind=engine)
    yield
    # You might also drop tables here if needed, but for in-memory DB, it's less critical
    # Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function") # Changed to "function" for cleaner test isolation
def db_session():
    """
    Provides a test database session for CRUD tests.
    Ensures the database is clean before each test using this fixture.
    """
    Base.metadata.drop_all(bind=engine) # Clean up from previous test
    Base.metadata.create_all(bind=engine) # Recreate tables

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    """
    Provides a TestClient instance for API integration tests.
    This client will use the overridden get_db.
    """
    # Ensure tables are created before the client is used, handled by setup_database
    with TestClient(app) as c:
        yield c

# Removed the cleanup_db fixture as individual test functions or db_session 
# will handle cleaning/recreating tables for better isolation.
# If using a file-based test.db, you might want a session-scoped cleanup.
# For :memory: SQLite, each connection is to a new DB, but tables need to be
# created for each new connection if not handled globally or via fixtures.
# The setup_database fixture handles initial creation, and db_session handles per-test cleanup.

# Optional: A fixture to clean tables before each test run, if db_session is not used everywhere
@pytest.fixture(autouse=True, scope="function")
def auto_cleanup_db(db_session: sessionmaker): # db_session implicitly handles this now
    """Ensures the database tables are clean before each test."""
    # The db_session fixture already handles this by dropping and recreating tables.
    # If you don't use db_session in a test, you might need separate cleanup logic.
    # For now, relying on db_session or tests explicitly managing their state.
    pass
