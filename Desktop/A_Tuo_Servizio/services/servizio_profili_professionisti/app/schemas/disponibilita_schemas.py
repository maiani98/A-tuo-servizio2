from typing import Optional, List, Dict, Any
from pydantic import BaseModel, constr

# Esempio di struttura per orari_json, se si vuole essere più specifici
class OrarioLavorativo(BaseModel):
    giorno: constr(min_length=1, max_length=20) # Es. "Lunedì", "Martedì"
    dalle: constr(regex=r"^\d{2}:\d{2}$") # Formato HH:MM
    alle: constr(regex=r"^\d{2}:\d{2}$") # Formato HH:MM

class DisponibilitaGeneraleBase(BaseModel):
    giorni_lavorativi_json: Optional[List[constr(max_length=20)]] = None # Es. ["Lunedì", "Martedì"]
    orari_json: Optional[List[OrarioLavorativo]] = None # Lista di oggetti OrarioLavorativo
    note: Optional[str] = None

class DisponibilitaGeneraleCreate(DisponibilitaGeneraleBase):
    # Tutti i campi sono opzionali per la creazione,
    # un professionista potrebbe voler creare un record vuoto e popolarlo dopo.
    # Se alcuni campi fossero obbligatori alla creazione, andrebbero definiti qui.
    pass

class DisponibilitaGeneraleUpdate(DisponibilitaGeneraleBase):
    # Tutti i campi sono opzionali per l'aggiornamento.
    pass

class DisponibilitaGeneraleRead(DisponibilitaGeneraleBase):
    id: int
    profilo_id: int

    class Config:
        orm_mode = True
