# A Tuo Servizio

Progetto modulare per una piattaforma di servizi professionali, organizzata in microservizi con documentazione centralizzata.

## Struttura del repository

- **services/**  
  Contiene tutti i microservizi indipendenti:
  - `servizio_utenti/` – autenticazione, registrazione e gestione utenti  
  - `servizio_profili_professionisti/` – CRUD profili professionali  
  - `servizio_ricerca/` – meccanismi di ricerca e filtraggio  
  - `servizio_portfolio/` – gestione media e progetti portfolio  
  - `calendar-svc/`, `chat-svc/`, `quote-svc/` – servizi di calendarizzazione, chat e preventivi  

- **backend/**  
  Progetto Django consolidato per servizi core monolitici (schema database, API REST, ecc.).  

- **docs/**  
  Documentazione, mockup e user stories:
  - `feat-user-service-v1/` – descrizioni e diagrammi relativi alla prima
    implementazione del servizio utenti e alla proposta di architettura
    complessiva dei microservizi;
  - `screen-descriptions/` – wireframe e schede riassuntive delle schermate
    principali a supporto dello sviluppo front‑end.

- **scripts/**  
  Script e cron-job (ad esempio `scripts/cron-jobs.sh`).  

- **archive/**  
  Branch di lavoro precedenti e codebase obsolete, mantenuti per riferimento storico.  

## Guida rapida

1. Crea l’ambiente virtuale e installa dipendenze (per Django e microservizi FastAPI/NodeJS).  
2. Avvia i container Docker definiti nei `Dockerfile` di ogni microservizio sotto `services/`.
3. In alternativa avvia tutti i servizi con `docker-compose up`.  
4. Consulta la documentazione in `docs/` per istruzioni dettagliate su mockup, API e flussi dati.  
5. Esegui gli script di manutenzione presenti in `scripts/`.  

## Scelte architetturali

- Architettura a microservizi per scalabilità e indipendenza di deployment.  
- Documentazione centralizzata per garantire coerenza tra team di sviluppo e design.
