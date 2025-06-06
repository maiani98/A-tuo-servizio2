from typing import Optional
from datetime import date
from pydantic import BaseModel, HttpUrl, constr

class CertificazioneBase(BaseModel):
    nome_certificazione: constr(min_length=1, max_length=255)
    ente_rilasciante: Optional[constr(max_length=255)] = None
    data_conseguimento: Optional[date] = None
    documento_url: Optional[HttpUrl] = None

class CertificazioneCreate(CertificazioneBase):
    pass

class CertificazioneUpdate(BaseModel):
    nome_certificazione: Optional[constr(min_length=1, max_length=255)] = None
    ente_rilasciante: Optional[constr(max_length=255)] = None
    data_conseguimento: Optional[date] = None
    documento_url: Optional[HttpUrl] = None

class CertificazioneRead(CertificazioneBase):
    id: int
    profilo_id: int

    class Config:
        orm_mode = True
