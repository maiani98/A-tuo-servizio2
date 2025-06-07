from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "a_very_secret_key_that_should_be_changed_in_production_and_loaded_from_env",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

    class Config:
        env_file = ".env" 
        env_file_encoding = 'utf-8'

settings = Settings()
