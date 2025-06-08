# Servizio Ricerca

Questo servizio è responsabile di fornire funzionalità di ricerca avanzata sui dati dei professionisti e dei loro portfolio, interagendo con un motore di ricerca come OpenSearch o Elasticsearch.

## Avvio rapido

1. Crea un ambiente virtuale ed installa le dipendenze elencate in `requirements.txt`.
2. Copia `.env.example` in `.env` e personalizza `OPENSEARCH_URL` e `PROFILI_INDEX_NAME` se necessario.
3. Avvia il servizio con:
   ```bash
   uvicorn app.main:app --reload
   ```
