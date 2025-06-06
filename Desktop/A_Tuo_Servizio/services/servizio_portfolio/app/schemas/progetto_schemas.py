from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, HttpUrl

# Importa MediaProgettoRead per la relazione
from .media_schemas import MediaProgettoRead

class ProgettoPortfolioBase(BaseModel):
    titolo: str
    descrizione: Optional[str] = None
    data_completamento: Optional[date] = None
    categoria_lavoro: Optional[str] = None
    link_esterno: Optional[HttpUrl] = None
    ordine: Optional[int] = 0

class ProgettoPortfolioCreate(ProgettoPortfolioBase):
    pass

class ProgettoPortfolioUpdate(BaseModel):
    titolo: Optional[str] = None
    descrizione: Optional[str] = None
    data_completamento: Optional[date] = None
    categoria_lavoro: Optional[str] = None
    link_esterno: Optional[HttpUrl] = None
    ordine: Optional[int] = None

class ProgettoPortfolioRead(ProgettoPortfolioBase):
    id: int
    profilo_professionista_id: int # Assicurati che questo nome corrisponda al campo nel modello SQLAlchemy
    data_creazione: datetime
    data_aggiornamento: datetime
    media: List[MediaProgettoRead] = [] # Aggiornato tipo a List[MediaProgettoRead]

    class Config:
        orm_mode = True
