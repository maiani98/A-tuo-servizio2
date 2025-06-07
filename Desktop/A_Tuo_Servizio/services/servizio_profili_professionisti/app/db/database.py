from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

from ..core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL  # Database specifico per i profili

engine_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)
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
