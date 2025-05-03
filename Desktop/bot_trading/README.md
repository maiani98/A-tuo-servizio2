# Bot di Trading Automatico

Bot di trading automatico su Binance basato su Python 3.10, ccxt, LightGBM e gestione del rischio avanzata.

## Descrizione

Questo progetto implementa un bot di trading automatico per Binance. Il bot utilizza diverse strategie di trading, gestione del rischio avanzata e machine learning per massimizzare il profitto e minimizzare il drawdown.

## Installazione

1.  Clonare il repository:

    ```bash
    git clone https://github.com/tuo-username/bot_trading.git
    ```
2.  Installare le dipendenze utilizzando Poetry:

    ```bash
    poetry install
    ```
3.  Configurare le credenziali di Binance nel file `.env`.

## Utilizzo

1.  Eseguire il bot:

    ```bash
    python main.py
    ```

## Struttura del progetto

```
.
├── configs/              # File di configurazione
├── core/                 # Logica principale del bot (broker, rischio, sizing)
├── data/                 # Dati (tick, barre)
├── features/             # Feature engineering
├── models/               # Modelli di trading
├── models_store/         # Modelli di machine learning salvati
├── optimizer/            # Ottimizzazione degli iperparametri
├── tests/                # Test unitari
├── .env                  # Credenziali e variabili d'ambiente
├── config.py             # Configurazione del bot
├── main.py               # Punto d'ingresso del bot
├── poetry.lock           # Lockfile di Poetry
├── pyproject.toml        # File di configurazione di Poetry
└── README.md             # Questo file
```

## Esempi

### Esempio di strategia

```python
# models/sma_rule.py
class Strategy:
    def __init__(self, params):
        self.params = params

    def on_bar(self, bar):
        # Logica della strategia
        pass

    def generate_signals(self):
        # Genera segnali di trading
        pass
```

### Esempio di RiskManager

```python
# core/risk.py
class RiskManager:
    def __init__(self):
        # Inizializzazione
        pass

    def can_trade(self):
        # Verifica se è possibile fare trading
        pass

    def register_pnl(self, pnl):
        # Registra il PnL
        pass
