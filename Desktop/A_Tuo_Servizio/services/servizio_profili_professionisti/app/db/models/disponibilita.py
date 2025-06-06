from sqlalchemy import Column, Integer, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class DisponibilitaGenerale(Base):
    __tablename__ = "disponibilita_generali"

    id = Column(Integer, primary_key=True, index=True)
    profilo_id = Column(Integer, ForeignKey("profili_professionisti.id"), unique=True, nullable=False, index=True)
    
    giorni_lavorativi_json = Column(JSON, nullable=True) # Es: ["Lunedì", "Martedì", "Mercoledì"]
    orari_json = Column(JSON, nullable=True) # Es: [{"giorno": "Lunedì", "dalle": "09:00", "alle": "13:00"}, ...]
    note = Column(Text, nullable=True)
    
    profilo = relationship("ProfiloProfessionista", back_populates="disponibilita")

    def __repr__(self):
        return f"<DisponibilitaGenerale(id={self.id}, profilo_id={self.profilo_id})>"
