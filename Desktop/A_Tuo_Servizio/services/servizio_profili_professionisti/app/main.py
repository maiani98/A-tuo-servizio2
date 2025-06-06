from fastapi import FastAPI

# Importa i router
from .api.v1.endpoints import profili
from .api.v1.endpoints import aree_operativita
from .api.v1.endpoints import certificazioni
from .api.v1.endpoints import disponibilita # Importa il nuovo router per la disponibilità

# Importa la funzione per inizializzare il DB
from .db.database import init_db

app = FastAPI(
    title="Servizio Profili Professionisti",
    description="API per la gestione dei profili dei professionisti, aree di operatività, certificazioni e disponibilità.",
    version="0.1.3" # Bump version
)

@app.on_event("startup")
def on_startup():
    init_db() # Crea le tabelle del database all'avvio se non esistono

# Include i router
app.include_router(profili.router, prefix="/api/v1/profili", tags=["Profili Professionisti"])
app.include_router(
    aree_operativita.router, 
    prefix="/api/v1/profili/me/aree-operativita", 
    tags=["Aree Operativita"]
)
app.include_router(
    certificazioni.router, 
    prefix="/api/v1/profili/me/certificazioni", 
    tags=["Certificazioni"]
)
app.include_router(
    disponibilita.router, 
    prefix="/api/v1/profili/me/disponibilita", # Prefisso come da specifiche
    tags=["Disponibilità"]
)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "service": "Servizio Profili Professionisti"}
