"""Configurazioni globali, lette da .env o impostate di default."""
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).resolve().parent
ENV_PATH = ROOT_DIR / ".env"
load_dotenv(str(ENV_PATH))

# API Binance
BINANCE_KEY: str = os.getenv("BINANCE_KEY", "")
BINANCE_SECRET: str = os.getenv("BINANCE_SECRET", "")
TESTNET: bool = True

# Parametri base
BASE_CURRENCY: str = os.getenv("BASE_CURRENCY", "EUR")
START_BALANCE: float = float(os.getenv("START_BALANCE", "500"))
SYMBOL: str = os.getenv("SYMBOL", "BTC/USDT")

# Risk
RISK_PER_TRADE: float = float(os.getenv("RISK_PER_TRADE", "0.01"))
MAX_DAILY_LOSS: float = float(os.getenv("MAX_DAILY_LOSS", "0.03"))
MAX_TOTAL_EXPOSURE: float = float(os.getenv("MAX_TOTAL_EXPOSURE", "1.0")) # Max esposizione totale come frazione del capitale iniziale
MAX_POSITION_PER_ASSET: float = float(os.getenv("MAX_POSITION_PER_ASSET", "1.0")) # Max posizione per asset come frazione del capitale iniziale

# Dati
TICKS_DIR = ROOT_DIR / "data" / "ticks"
BARS_DIR = ROOT_DIR / "data" / "bars"
HISTORICAL_DATA_DIR = ROOT_DIR / "data" / "historical" # Aggiunta directory per dati storici
TICKS_DIR.mkdir(parents=True, exist_ok=True)
BARS_DIR.mkdir(parents=True, exist_ok=True)
HISTORICAL_DATA_DIR.mkdir(parents=True, exist_ok=True) # Crea la directory se non esiste
