from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    # Impostazioni JWT - queste dovrebbero corrispondere a quelle del Servizio Utenti
    # e Servizio Profili per una corretta validazione del token.
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_changed_in_production_and_loaded_from_env")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Anche se questo servizio valida, è bene averlo per coerenza

    # Eventuali altre configurazioni specifiche per il servizio portfolio
    # Esempio: MAX_PROJECTS_PER_USER: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
