# Servizio Profili Professionisti

Questo servizio è responsabile della gestione dei profili dei professionisti, includendo le loro competenze, aree di specializzazione, certificazioni e disponibilità.

## Avvio rapido

1. Crea un ambiente virtuale ed installa le dipendenze indicate in `requirements.txt`.
2. Copia `.env.example` in `.env` e personalizza `SECRET_KEY` e `DATABASE_URL` se necessario.
3. Avvia il server con:
   ```bash
   uvicorn app.main:app --reload
   ```
