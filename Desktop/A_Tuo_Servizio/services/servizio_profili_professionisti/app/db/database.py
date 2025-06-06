from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./profiles.db" # Database specifico per i profili

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Necessario solo per SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    # Importa qui i tuoi modelli.
    # Questo assicura che siano registrati con SQLAlchemy prima che create_all sia chiamato.
    from .models import profilo # noqa
    from .models import area_operativita # noqa
    from .models import certificazione # noqa
    from .models import disponibilita # noqa - Aggiunto import per DisponibilitaGenerale
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
