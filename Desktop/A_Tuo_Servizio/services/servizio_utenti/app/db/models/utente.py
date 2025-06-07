from sqlalchemy import Column, Integer, String, DateTime, func
from ..database import Base

class Utente(Base):
    __tablename__ = "utenti"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    nome = Column(String, nullable=True)
    cognome = Column(String, nullable=True)
    tipo_utente = Column(String, nullable=False)  # 'cliente' o 'professionista'
    stato_account = Column(String, nullable=False, default='non_verificato')  # 'attivo', 'inattivo', 'sospeso', 'non_verificato'
    data_creazione = Column(DateTime, server_default=func.now())
    data_aggiornamento = Column(DateTime, server_default=func.now(), onupdate=func.now())
