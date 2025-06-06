from fastapi import FastAPI

from .api.v1.endpoints import utenti
from .db.database import init_db

app = FastAPI(title="Servizio Utenti")

# Initialize database
@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(utenti.router, prefix="/api/v1/utenti", tags=["utenti"])

@app.get("/")
async def root():
    return {"message": "Servizio Utenti"}
