from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, HttpUrl, constr

# Pydantic model for address components
class IndirizzoSede(BaseModel):
    via: Optional[str] = None
    citta: Optional[str] = None
    cap: Optional[constr(max_length=10)] = None
    provincia: Optional[str] = None
    paese: Optional[str] = "Italia"

# Pydantic model for social media links
class LinkSocial(BaseModel):
    facebook: Optional[HttpUrl] = None
    instagram: Optional[HttpUrl] = None
    linkedin: Optional[HttpUrl] = None
    twitter: Optional[HttpUrl] = None
    # Add other social media platforms as needed

class ProfiloProfessionistaBase(BaseModel):
    ragione_sociale: Optional[str] = None # Will be made mandatory in Create
    partita_iva: Optional[constr(max_length=100)] = None
    descrizione_estesa: Optional[str] = None
    
    foto_profilo_url: Optional[HttpUrl] = None
    immagine_copertina_url: Optional[HttpUrl] = None
    
    indirizzo_sede_json: Optional[IndirizzoSede] = None # Using the nested Pydantic model
    telefoni_pubblici_json: Optional[List[constr(max_length=20)]] = None # List of phone numbers
    
    sito_web: Optional[HttpUrl] = None
    link_social_json: Optional[LinkSocial] = None # Using the nested Pydantic model

    class Config:
        orm_mode = True
        # Allow arbitrary types for JSON fields if not using nested Pydantic models
        # arbitrary_types_allowed = True 

class ProfiloProfessionistaCreate(ProfiloProfessionistaBase):
    ragione_sociale: constr(min_length=1, max_length=255) # Mandatory for creation

class ProfiloProfessionistaUpdate(ProfiloProfessionistaBase):
    # All fields are optional for update, inheriting from Base
    pass

class ProfiloProfessionistaRead(ProfiloProfessionistaBase):
    id: int
    user_id: int # This comes from the authenticated user or path parameter
    data_creazione: datetime
    data_aggiornamento: datetime

    # If you want to ensure that JSON fields are parsed into Pydantic models when reading from DB:
    # This requires that the data in JSON columns is stored in a way Pydantic can understand
    # or you might need custom validators. With orm_mode = True, Pydantic tries its best.
    # indirizzo_sede_json: Optional[IndirizzoSede] = None
    # link_social_json: Optional[LinkSocial] = None
    # telefoni_pubblici_json: Optional[List[str]] = None

    # This is already handled by orm_mode = True and the types defined in ProfiloProfessionistaBase
    # No need to redefine them here unless you want to change their type for reading.

    class Config:
        orm_mode = True
