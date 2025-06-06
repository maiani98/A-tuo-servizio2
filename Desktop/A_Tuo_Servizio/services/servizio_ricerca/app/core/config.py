from pydantic import BaseSettings

class Settings(BaseSettings):
    OPENSEARCH_URL: str = "http://localhost:9200" # Valore di default, sovrascrivibile con env var
    PROFILI_INDEX_NAME: str = "indice_professionisti" # Nome dell'indice OpenSearch per i profili

    # Altre configurazioni...

    class Config:
        env_file = ".env" # Opzionale, per caricare da file .env
        env_file_encoding = 'utf-8' # Specificare encoding per coerenza

settings = Settings()
