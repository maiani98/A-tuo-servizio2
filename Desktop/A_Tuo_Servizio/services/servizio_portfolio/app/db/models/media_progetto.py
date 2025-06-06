from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base

class MediaProgettoModel(Base):
    __tablename__ = "media_progetti"

    id = Column(Integer, primary_key=True, index=True)
    progetto_portfolio_id = Column(Integer, ForeignKey("progetti_portfolio.id"), nullable=False, index=True)
    
    tipo_media = Column(String(50), nullable=False) # Es. "immagine", "video"
    media_url = Column(String(500), nullable=False)
    didascalia = Column(String(500), nullable=True)
    is_immagine_principale = Column(Boolean, default=False, nullable=False)
    ordine = Column(Integer, nullable=False, default=0)
    
    data_creazione = Column(DateTime, server_default=func.now())
    data_aggiornamento = Column(DateTime, server_default=func.now(), onupdate=func.now())

    progetto = relationship("ProgettoPortfolioModel", back_populates="media")

    def __repr__(self):
        return f"<MediaProgettoModel(id={self.id}, tipo_media='{self.tipo_media}', progetto_id={self.progetto_portfolio_id})>"
