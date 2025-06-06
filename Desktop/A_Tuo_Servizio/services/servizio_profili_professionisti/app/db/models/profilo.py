from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, func
from sqlalchemy.orm import relationship # Import relationship
from ..database import Base 

# Importa i modelli correlati se usi i nomi delle classi nelle relazioni
# from .area_operativita import AreaOperativita
# from .certificazione import Certificazione
# from .disponibilita import DisponibilitaGenerale # Se si usa il nome classe

class ProfiloProfessionista(Base):
    __tablename__ = "profili_professionisti"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False) 
    
    ragione_sociale = Column(String(255), index=True, nullable=False)
    partita_iva = Column(String(100), unique=True, index=True, nullable=True)
    descrizione_estesa = Column(Text, nullable=True)
    
    foto_profilo_url = Column(String(500), nullable=True)
    immagine_copertina_url = Column(String(500), nullable=True)
    
    indirizzo_sede_json = Column(JSON, nullable=True) 
    telefoni_pubblici_json = Column(JSON, nullable=True) 
    
    sito_web = Column(String(255), nullable=True)
    link_social_json = Column(JSON, nullable=True) 
    
    data_creazione = Column(DateTime, server_default=func.now())
    data_aggiornamento = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relazione con AreaOperativita
    aree_operativita = relationship(
        "AreaOperativita", 
        back_populates="profilo", 
        cascade="all, delete-orphan"
    )

    # Relazione con Certificazione
    certificazioni = relationship(
        "Certificazione", 
        back_populates="profilo", 
        cascade="all, delete-orphan"
    )

    # Relazione con DisponibilitaGenerale
    disponibilita = relationship(
        "DisponibilitaGenerale", 
        uselist=False, # Chiave per la relazione one-to-one (o zero)
        back_populates="profilo", 
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<ProfiloProfessionista(id={self.id}, user_id={self.user_id}, ragione_sociale='{self.ragione_sociale}')>"
