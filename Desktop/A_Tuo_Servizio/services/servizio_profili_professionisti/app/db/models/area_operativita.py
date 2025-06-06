from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class AreaOperativita(Base):
    __tablename__ = "aree_operativita"

    id = Column(Integer, primary_key=True, index=True)
    tipo_area = Column(String(100), nullable=False) # Es. "Regione", "Provincia", "CAP", "RaggioKm"
    valore_area = Column(String(255), nullable=False) # Es. "Lombardia", "MI", "20100", "25"
    
    profilo_id = Column(Integer, ForeignKey("profili_professionisti.id"), nullable=False, index=True)
    
    profilo = relationship("ProfiloProfessionista", back_populates="aree_operativita")

    def __repr__(self):
        return f"<AreaOperativita(id={self.id}, tipo_area='{self.tipo_area}', valore_area='{self.valore_area}', profilo_id={self.profilo_id})>"
