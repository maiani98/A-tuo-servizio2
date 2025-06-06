from fastapi import FastAPI
from .db import database
from .api.v1.endpoints import portfolio_progetti
from .api.v1.endpoints import portfolio_media # Importa il nuovo router per i media

app = FastAPI(
    title="Servizio Portfolio",
    description="API per la gestione dei portfolio dei professionisti, inclusi progetti e media.",
    version="0.1.1" # Bump version
)

@app.on_event("startup")
def on_startup():
    database.init_db() # Crea le tabelle del database all'avvio se non esistono

# Include i router per i progetti del portfolio
app.include_router(
    portfolio_progetti.router_management, 
    prefix="/api/v1/profili/me/portfolio/progetti", 
    tags=["Portfolio Management (Progetti)"]
)
app.include_router(
    portfolio_progetti.router_public_view, 
    prefix="/api/v1/profili/{profilo_id_pub}/portfolio/progetti", 
    tags=["Portfolio Public View (Progetti)"]
)

# Include il router per i media dei progetti del portfolio
# Questo router sarà nidificato sotto uno specifico progetto
app.include_router(
    portfolio_media.router, 
    prefix="/api/v1/profili/me/portfolio/progetti/{progetto_id}/media", 
    tags=["Portfolio Media Management"]
)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "service": "Servizio Portfolio"}
