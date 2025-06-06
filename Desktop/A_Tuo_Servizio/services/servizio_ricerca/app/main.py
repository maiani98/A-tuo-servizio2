from fastapi import FastAPI
from .core.config import settings # Per configurazioni
from .services.search_service import SearchClient # Per inizializzare il client
from .api.v1.endpoints import ricerca # Importa il router

app = FastAPI(title="Servizio Ricerca")

@app.on_event("startup")
async def startup_event():
    app.state.search_client = SearchClient()

@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, 'search_client') and app.state.search_client:
        await app.state.search_client.close()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include il router per la ricerca
app.include_router(ricerca.router, prefix="/api/v1/ricerca", tags=["Ricerca"])
