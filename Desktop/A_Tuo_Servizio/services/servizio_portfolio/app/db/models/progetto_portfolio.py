from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base

class ProgettoPortfolioModel(Base):
    __tablename__ = "progetti_portfolio"

    id = Column(Integer, primary_key=True, index=True)
    profilo_professionista_id = Column(Integer, nullable=False, index=True) # Non è una FK diretta, ma logica
    
    titolo = Column(String(255), nullable=False, index=True)
    descrizione = Column(Text, nullable=True)
    data_completamento = Column(Date, nullable=True)
    categoria_lavoro = Column(String(100), nullable=True, index=True)
    link_esterno = Column(String(500), nullable=True)
    ordine = Column(Integer, nullable=False, default=0)
    
    data_creazione = Column(DateTime, server_default=func.now())
    data_aggiornamento = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relazione con MediaProgettoModel (verrà definita completamente nel prossimo subtask)
    # Per ora, possiamo definirla come stringa. SQLAlchemy la risolverà più tardi.
    media = relationship(
        "MediaProgettoModel", 
        back_populates="progetto", 
        cascade="all, delete-orphan",
        order_by="MediaProgettoModel.ordine" # SQLAlchemy sa che MediaProgettoModel è una classe
    )

    def __repr__(self):
        return f"<ProgettoPortfolioModel(id={self.id}, titolo='{self.titolo}', profilo_id={self.profilo_professionista_id})>"
