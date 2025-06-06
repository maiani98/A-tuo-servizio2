from typing import Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class MediaProgettoBase(BaseModel):
    tipo_media: str # Es. "immagine", "video"
    media_url: HttpUrl
    didascalia: Optional[str] = None
    is_immagine_principale: bool = False
    ordine: int = 0

class MediaProgettoCreate(MediaProgettoBase):
    pass

class MediaProgettoUpdate(BaseModel):
    tipo_media: Optional[str] = None
    media_url: Optional[HttpUrl] = None
    didascalia: Optional[str] = None
    is_immagine_principale: Optional[bool] = None
    ordine: Optional[int] = None

class MediaProgettoRead(MediaProgettoBase):
    id: int
    progetto_portfolio_id: int
    data_creazione: datetime
    data_aggiornamento: datetime

    class Config:
        orm_mode = True
