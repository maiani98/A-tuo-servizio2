"""Gestione feed tick, bar builder (dollar/imbalance) e loader bar live."""
from __future__ import annotations
import json, time, gzip, datetime as dt
from pathlib import Path
import pandas as pd
import websocket
import ccxt
from loguru import logger
from config import SYMBOL, TICKS_DIR, BARS_DIR, HISTORICAL_DATA_DIR

# Creo le cartelle se non esistono
Path('data/ticks').mkdir(parents=True, exist_ok=True)
Path('data/bars').mkdir(parents=True, exist_ok=True)
Path('data/historical').mkdir(parents=True, exist_ok=True)


class DataManager:
    def __init__(self, exchange_id='binance', testnet: bool = False):
        self.exchange_id = exchange_id
        self.testnet = testnet
        self.exchange = getattr(ccxt, exchange_id)()
        self.exchange.enableRateLimit = True
        self.ws = None
        self._setup_directories()

    def _setup_directories(self):
        Path(TICKS_DIR).mkdir(parents=True, exist_ok=True)
        Path(BARS_DIR).mkdir(parents=True, exist_ok=True)
        Path(HISTORICAL_DATA_DIR).mkdir(parents=True, exist_ok=True)

    def start_tick_collector(self, symbol: str = SYMBOL) -> None:
        """Avvia WebSocket Binance e salva i ticks in data/ticks/{date}.jsonl.gz"""
        if self.exchange_id != 'binance':
            logger.warning(f"Tick collection via WebSocket not implemented for {self.exchange_id}")
            return

        fname = dt.datetime.utcnow().strftime(f"{symbol.replace('/','_')}_%Y%m%d.jsonl.gz")
        path = Path(TICKS_DIR) / fname

        def on_message(_, msg: str):
            # Simulate writing to a time-series DB and fallback to file
            try:
                # TODO: Implement writing to InfluxDB or TimescaleDB
                pass # Simulate DB write success
            except Exception as e:
                logger.error(f"Errore scrittura DB, fallback su file: {e}")
                with gzip.open(path, 'ab') as f:
                    f.write((msg + '\n').encode())

        websocket_url = f"wss://stream.{self.exchange.hostname}:9443/ws/{symbol.lower().replace('/','')}"
        if self.exchange_id == 'binance':
             websocket_url += "@trade"
        # TODO: Add WebSocket URLs for other exchanges

        self.ws = websocket.WebSocketApp(websocket_url, on_message=on_message)
        logger.info(f"Collector WS avviato per {symbol} su {self.exchange_id}")
        self.ws.run_forever(ping_interval=15, ping_timeout=10)


    def fetch_ohlcv(self, symbol: str = SYMBOL, timeframe='1m', since=None, limit=1000):
        """Recupera dati OHLCV storici da exchange."""
        logger.info(f"Recupero dati OHLCV per {symbol} ({timeframe}) da {self.exchange_id}")
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df = df.set_index('timestamp')
            logger.info(f"Recuperati {len(df)} candele per {symbol} ({timeframe})")
            return df
        except Exception as e:
            logger.error(f"Errore nel recupero OHLCV da {self.exchange_id}: {e}")
            return pd.DataFrame()

    def load_historical_data(self, symbol: str = SYMBOL, timeframe='1m', source='file'):
        """Carica dati storici da file o database."""
        if source == 'file':
            fname = f"{symbol.replace('/','_')}_{timeframe}.parquet"
            path = Path(HISTORICAL_DATA_DIR) / fname
            if path.exists():
                logger.info(f"Caricamento dati storici da file: {path}")
                return pd.read_parquet(path)
            else:
                logger.warning(f"File dati storici non trovato: {path}")
                return pd.DataFrame()
        elif source == 'database':
            # TODO: Implement loading from InfluxDB or TimescaleDB
            logger.warning("Caricamento da database non ancora implementato.")
            return pd.DataFrame()
        else:
            logger.warning(f"Sorgente dati storici non valida: {source}")
            return pd.DataFrame()

    def save_historical_data(self, df: pd.DataFrame, symbol: str = SYMBOL, timeframe='1m'):
        """Salva dati storici su file."""
        fname = f"{symbol.replace('/','_')}_{timeframe}.parquet"
        path = Path(HISTORICAL_DATA_DIR) / fname
        df.to_parquet(path)
        logger.info(f"Dati storici salvati su file: {path}")

    def save_ohlcv_as_ticks(self, df: pd.DataFrame, symbol: str = SYMBOL):
        """Salva dati OHLCV come file tick."""
        fname = dt.datetime.utcnow().strftime(f"{symbol.replace('/','_')}_%Y%m%d.jsonl.gz")
        path = Path(TICKS_DIR) / fname
        try:
            with gzip.open(path, 'ab') as f:
                for index, row in df.iterrows():
                    tick = {
                        'p': float(row['close']),
                        'q': float(row['volume']),
                        'm': False,
                        'T': int(index.timestamp() * 1000)
                    }
                    f.write((json.dumps(tick) + '\n').encode())
            logger.info(f"Dati OHLCV salvati come file tick: {path}")
        except Exception as e:
            logger.error(f"Errore nella scrittura del file tick: {e}")


# ----------------------------- Builder ----------------------------- #
def build_bars(mode: str = "dollar", notional: int = 1_000_000):
    """Converte tutti i file ticks→bars.parquet; restituisce ultimo DF."""
    files = sorted(Path(TICKS_DIR).glob("*.gz"))
    if not files:
        logger.warning("Nessun file tick presente per costruire le barre.")
        return pd.DataFrame()

    all_ticks = []
    for file in files:
        try:
            with gzip.open(file, 'rt', encoding='utf-8') as f:
                # Read line by line to handle potential incomplete last line
                content = f.read()
                # Ensure content ends with a newline for proper splitting
                if not content.endswith('\n'):
                    content += '\n'
                # Split into lines and parse each line as JSON
                lines = content.strip().split('\n')
                if lines:
                    # Filter out empty strings that might result from split
                    valid_lines = [line for line in lines if line]
                    if valid_lines:
                        ticks_data = [json.loads(line) for line in valid_lines]
                        all_ticks.extend(ticks_data)
        except Exception as e:
            logger.error(f"Errore nella lettura o parsing del file {file}: {e}")
            continue # Skip to the next file

    if not all_ticks:
        logger.warning("Nessun dato valido dai file tick per costruire le barre.")
        return pd.DataFrame()

    last_ticks = pd.DataFrame(all_ticks)

    # Ensure required columns exist and are in correct format
    if 'p' not in last_ticks.columns or 'q' not in last_ticks.columns or 'm' not in last_ticks.columns or 'T' not in last_ticks.columns:
         logger.error("Dati tick mancanti colonne essenziali (p, q, m, T).")
         return pd.DataFrame()

    last_ticks['price'] = pd.to_numeric(last_ticks['p'])
    last_ticks['volume'] = pd.to_numeric(last_ticks['q'])
    last_ticks['is_buyer_maker'] = last_ticks['m']
    last_ticks['date_time'] = pd.to_datetime(last_ticks['T'], unit='ms')

    # Implementa la logica di costruzione delle barre basata sul tempo
    logger.info("Costruzione delle barre basata sul tempo.")
    last_ticks = last_ticks.sort_values('date_time')
    last_ticks = last_ticks.set_index('date_time')

    # Inizializza una lista per contenere le barre
    bars_list = []

    # Itera sui tick e costruisci le barre in modo incrementale
    for i in range(0, len(last_ticks), 60):  # Itera ogni 60 secondi (1 minuto)
        minute_ticks = last_ticks[i:i+60]
        if not minute_ticks.empty:
            # Calcola OHLC e volume per la barra
            open_price = minute_ticks['price'][0]
            high_price = minute_ticks['price'].max()
            low_price = minute_ticks['price'].min()
            close_price = minute_ticks['price'][-1]
            volume = minute_ticks['volume'].sum()
            date_time = minute_ticks.index[0]

            # Aggiungi la barra alla lista
            bars_list.append({
                'open': open_price,
                'high': high_price,
                'low': low_price,
                'close': close_price,
                'volume': volume,
                'date_time': date_time
            })

    # Crea un DataFrame pandas dalle barre
    bars = pd.DataFrame(bars_list)
    if not bars.empty:
        bars = bars.set_index('date_time')

    out_path = Path(BARS_DIR) / f"{mode}_bars.parquet"
    bars.to_parquet(out_path)
    logger.info(f"{len(bars)} bar salvate in {out_path}")
    return bars

# Esempio di utilizzo (da rimuovere o spostare in script di test/esecuzione)
if __name__ == '__main__':
    data_manager = DataManager('binance')

    # Esempio di recupero dati storici
    # data_manager.fetch_ohlcv('BTC/USDT', '1h', limit=100)

    # Esempio di avvio collector tick (richiede esecuzione in un processo separato o con asyncio)
    # data_manager.start_tick_collector('BTC/USDT')

    # Esempio di costruzione barre (richiede file tick preesistenti)
    # build_bars("dollar", 1_000_000)
