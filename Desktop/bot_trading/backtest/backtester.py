"""Modulo per il backtesting delle strategie di trading."""
from __future__ import annotations
import pandas as pd
import numpy as np
import vectorbt as vbt
from loguru import logger
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.base import Strategy # Assumendo che le strategie ereditino da una base

class Backtester:
    def __init__(self, data: pd.DataFrame, strategy: Strategy, initial_capital: float = 10000.0, commission: float = 0.001, slippage: float = 0.0001):
        self.data = data
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage
        self.portfolio = None

    def run(self) -> vbt.Portfolio:
        """Esegue il backtest della strategia sui dati forniti."""
        logger.info("Avvio backtest...")

        # Assicurati che il DataFrame abbia un indice Datetime
        if not isinstance(self.data.index, pd.DatetimeIndex):
            logger.warning("L'indice del DataFrame non è DatetimeIndex. Tentativo di conversione.")
            try:
                self.data.index = pd.to_datetime(self.data.index)
            except Exception as e:
                logger.error(f"Impossibile convertire l'indice in DatetimeIndex: {e}")
                return None # O sollevare un'eccezione

        # Genera segnali dalla strategia
        # Questo richiede che la strategia abbia un metodo generate_signals che ritorni un DataFrame
        # con colonne 'entry_signal' e 'exit_signal' (booleani)
        try:
            signals_df = self.strategy.generate_signals(self.data)
            if not isinstance(signals_df, pd.DataFrame) or 'entry_signal' not in signals_df.columns or 'exit_signal' not in signals_df.columns:
                 logger.error("La strategia non ha generato un DataFrame di segnali valido con colonne 'entry_signal' e 'exit_signal'.")
                 # Crea segnali vuoti per evitare errori
                 signals_df = pd.DataFrame(index=self.data.index)
                 signals_df['entry_signal'] = False
                 signals_df['exit_signal'] = False

        except AttributeError:
            logger.error("La strategia non ha un metodo 'generate_signals'.")
            # Crea segnali vuoti per evitare errori
            signals_df = pd.DataFrame(index=self.data.index)
            signals_df['entry_signal'] = False
            signals_df['exit_signal'] = False
        except Exception as e:
            logger.error(f"Errore durante la generazione dei segnali: {e}")
            # Crea segnali vuoti per evitare errori
            signals_df = pd.DataFrame(index=self.data.index)
            signals_df['entry_signal'] = False
            signals_df['exit_signal'] = False


        # Esegui il backtest con VectorBT
        # Utilizziamo le colonne 'close' per l'esecuzione degli ordini
        price_data = self.data['close']

        # Assicurati che i segnali e i dati sui prezzi abbiano lo stesso indice
        if not signals_df.index.equals(price_data.index):
            logger.warning("Gli indici dei segnali e dei dati sui prezzi non corrispondono. Rialliniamento.")
            signals_df = signals_df.reindex(price_data.index, fill_value=False)


        self.portfolio = vbt.Portfolio.from_signals(
            price_data,
            entries=signals_df['entry_signal'],
            exits=signals_df['exit_signal'],
            init_cash=self.initial_capital,
            fees=self.commission,
            slippage=self.slippage,
            # TODO: Aggiungere altri parametri di configurazione del portfolio di vectorbt
        )

        logger.info("Backtest completato.")
        return self.portfolio

    def generate_report(self) -> str:
        """Genera un report di performance dal backtest."""
        if self.portfolio is None:
            logger.warning("Eseguire prima il backtest.")
            return "Report non disponibile. Eseguire prima il backtest."

        logger.info("Generazione report di performance...")
        # Utilizza i metodi di reporting di VectorBT
        report = self.portfolio.deep_dive() # O altri metodi come stats(), annualized_returns(), etc.

        # TODO: Formattare il report in modo più leggibile o salvarlo su file

        logger.info("Report generato.")
        return str(report)

    # TODO: Implementare campionamento montecarlo e walk-forward analysis (potrebbe essere in un modulo separato)

# Esempio di utilizzo (richiede una strategia e dati di esempio)
if __name__ == '__main__':
    # Questo esempio richiede una classe Strategy definita altrove (es. models/sma_rule.py)
    # e un DataFrame di dati di esempio.

    # Esempio di dati (sostituire con dati reali)
    data = pd.DataFrame({
        'open': np.random.rand(100) * 100,
        'high': np.random.rand(100) * 100 + 1,
        'low': np.random.rand(100) * 100 - 1,
        'close': np.random.rand(100) * 100,
        'volume': np.random.rand(100) * 1000
    }, index=pd.to_datetime(pd.date_range('2023-01-01', periods=100)))

    # Esempio di strategia (sostituire con la tua strategia)
    class ExampleStrategy:
        def __init__(self, params=None):
            self.params = params if params is not None else {}

        def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
            # Logica di esempio: compra se close > 50, vendi se close < 50
            signals = pd.DataFrame(index=data.index)
            signals['entry_signal'] = data['close'] > 50
            signals['exit_signal'] = data['close'] < 50
            return signals

    # Creare istanze
    example_strategy = ExampleStrategy()
    backtester = Backtester(data, example_strategy)

    # Eseguire backtest e generare report
    portfolio = backtester.run()
    if portfolio:
        report = backtester.generate_report()
        print(report)
