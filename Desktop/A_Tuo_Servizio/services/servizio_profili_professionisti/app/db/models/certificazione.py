from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Certificazione(Base):
    __tablename__ = "certificazioni"

    id = Column(Integer, primary_key=True, index=True)
    nome_certificazione = Column(String(255), nullable=False)
    ente_rilasciante = Column(String(255), nullable=True)
    data_conseguimento = Column(Date, nullable=True)
    documento_url = Column(String(500), nullable=True) # Consider using HttpUrl type if validated at model level, or keep as String

    profilo_id = Column(Integer, ForeignKey("profili_professionisti.id"), nullable=False, index=True)
    
    profilo = relationship("ProfiloProfessionista", back_populates="certificazioni")

    def __repr__(self):
        return f"<Certificazione(id={self.id}, nome_certificazione='{self.nome_certificazione}', profilo_id={self.profilo_id})>"
