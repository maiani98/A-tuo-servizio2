from typing import Optional
from pydantic import BaseModel, constr

class AreaOperativitaBase(BaseModel):
    tipo_area: constr(min_length=1, max_length=100) # E.g., "Regione", "Provincia", "CAP", "RaggioKm"
    valore_area: constr(min_length=1, max_length=255) # E.g., "Lombardia", "MI", "20100", "25"

class AreaOperativitaCreate(AreaOperativitaBase):
    pass

class AreaOperativitaUpdate(BaseModel): # Explicitly define fields as Optional
    tipo_area: Optional[constr(min_length=1, max_length=100)] = None
    valore_area: Optional[constr(min_length=1, max_length=255)] = None

class AreaOperativitaRead(AreaOperativitaBase):
    id: int
    profilo_id: int # To show which profile it belongs to

    class Config:
        orm_mode = True
