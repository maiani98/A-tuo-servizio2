# Usa un'immagine base Python ufficiale e leggera
FROM python:3.9-slim-bullseye

# Imposta variabili d'ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Imposta la directory di lavoro
WORKDIR /app

# Copia il file requirements.txt e installa le dipendenze
# Questo layer viene cachato se requirements.txt non cambia
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia il resto dell'applicazione
# Assumendo che la tua app sia nella cartella 'app' e main.py sia in app/main.py
COPY ./app /app/app

# Espone la porta su cui Uvicorn ascolterà
EXPOSE 8000

# Comando per avviare l'applicazione
# Assicura che il percorso a 'app.main:app' sia corretto rispetto alla WORKDIR e alla struttura del progetto copiata
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
