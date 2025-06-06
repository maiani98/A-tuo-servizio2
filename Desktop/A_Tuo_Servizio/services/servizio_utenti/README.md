# Servizio Utenti

Questo microservizio gestisce la registrazione, l'autenticazione e la gestione degli utenti della piattaforma.

## Dipendenze principali
- Python 3.9+
- FastAPI
- SQLAlchemy
- Pydantic
- passlib[bcrypt]
- python-jose
- pytest (per i test)

I pacchetti necessari sono elencati in `docs/feat-user-service-v1/requirements.txt`.

## Avvio locale
1. Creare e attivare un ambiente virtuale:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r ../../docs/feat-user-service-v1/requirements.txt
    ```
2. Avviare il servizio con Uvicorn:
    ```bash
    uvicorn app.main:app --reload
    ```

## Variabili d'ambiente esempio
```
SECRET_KEY=supersecret
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
Le variabili possono essere definite in un file `.env` oppure esportate nel proprio ambiente.

## Test
I test automatici si trovano nella cartella `tests/` e sono basati su **pytest**.
Per eseguirli:
```bash
pytest tests
```
