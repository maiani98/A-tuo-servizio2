# Servizio Utenti

Questo microservizio espone API per la registrazione, il login e la gestione dei profili utente utilizzando FastAPI.

## Requisiti
- Python 3.9+
- `uvicorn` per eseguire l'app
- Dipendenze elencate in `requirements.txt`

## Avvio locale
1. Creare e attivare un ambiente virtuale:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Installare le dipendenze:
   ```bash
   pip install -r requirements.txt
   ```
3. Copiare `.env.example` in `.env` e personalizzare le variabili `SECRET_KEY` e `DATABASE_URL` se necessario:
   ```bash
   cp .env.example .env
   ```
4. Avviare il servizio:
   ```bash
   uvicorn app.main:app --reload
   ```
   Il servizio sarà disponibile su `http://localhost:8000`.

## Test
Eseguire la suite di test con:
```bash
pytest
```
