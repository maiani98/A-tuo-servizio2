# Backend Django

Questa cartella ospita il progetto Django che centralizza parte delle API di "A Tuo Servizio".

Il backend include:

- un **modello utente personalizzato** con flussi di verifica email e recupero password;
- i modelli per **profili professionali**, servizi offerti, portfolio e recensioni;
- script di inizializzazione e manutenzione del database (es. `populate_db.py`).

Per avviare l'ambiente di sviluppo:

```bash
python manage.py migrate
python manage.py runserver
```

Il progetto è pensato per integrarsi con i microservizi presenti nella cartella `services/`.
