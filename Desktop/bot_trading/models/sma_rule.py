"""Strategia di trading basata sul crossover di medie mobili."""
from __future__ import annotations
import pandas as pd
import ta
from typing import Dict, Any
from .base import Strategy, Signal
from loguru import logger

class SMACrossoverStrategy(Strategy):
    """Strategia basata sul crossover di due medie mobili (SMA)."""
    def __init__(self, params: Dict[str, Any]):
        super().__init__(params)
        self.fast_window = self.params.get('fast_window', 20)
        self.slow_window = self.params.get('slow_window', 50)
        self.data_buffer = pd.DataFrame() # Buffer per i dati in arrivo

    def on_bar(self, bar: pd.Series) -> None:
        """Gestisce l'arrivo di una nuova barra."""
        # Aggiungi la nuova barra al buffer
        # Assicurati che la barra sia un Series con un indice temporale
        if isinstance(bar, pd.Series) and isinstance(bar.name, pd.Timestamp):
            self.data_buffer = pd.concat([self.data_buffer, bar.to_frame().T])
            # Mantieni solo le barre necessarie per il calcolo delle SMA
            self.data_buffer = self.data_buffer.tail(max(self.fast_window, self.slow_window) + 1)

            # Calcola le medie mobili
            if 'close' in self.data_buffer.columns:
                self.data_buffer['fast_sma'] = ta.trend.sma_indicator(self.data_buffer['close'], window=self.fast_window)
                self.data_buffer['slow_sma'] = ta.trend.sma_indicator(self.data_buffer['close'], window=self.slow_window)
            else:
                logger.error("Colonna 'close' mancante nel DataFrame per la strategia SMA.")

        else:
            logger.warning(f"Ricevuta barra non valida in on_bar: {bar}")


    def on_tick(self, tick: Dict[str, Any]) -> None:
        """Gestisce l'arrivo di un nuovo tick."""
        # Per questa strategia basata su barre, i tick potrebbero non essere necessari,
        # ma si potrebbe usare per costruire barre in tempo reale o per logica intraday più fine.
        pass

    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Genera segnali di trading basati sul crossover SMA."""
        if data.empty:
            logger.warning("Nessun dato disponibile per generare segnali.")
            return pd.DataFrame(index=data.index, columns=['entry_signal', 'exit_signal']).fillna(False)

        # Genera segnali di crossover
        # Segnale di ingresso: fast_sma incrocia sopra slow_sma
        entry_signal = (data['fast_sma'].shift(1) <= data['slow_sma'].shift(1)) & (data['fast_sma'] > data['slow_sma'])

        # Segnale di uscita: fast_sma incrocia sotto slow_sma
        exit_signal = (data['fast_sma'].shift(1) >= data['slow_sma'].shift(1)) & (data['fast_sma'] < data['slow_sma'])

        # Crea il DataFrame dei segnali
        signals = pd.DataFrame(index=data.index)
        signals['entry_signal'] = entry_signal.fillna(False)
        signals['exit_signal'] = exit_signal.fillna(False)

        logger.info(f"Generati {signals['entry_signal'].sum()} segnali di ingresso e {signals['exit_signal'].sum()} segnali di uscita.")

        return signals

# Esempio di utilizzo (da rimuovere o spostare in script di test/esecuzione)
if __name__ == '__main__':
    # Creare un DataFrame di esempio per il test
    data = pd.DataFrame({
        'close': np.random.rand(100) * 100,
    }, index=pd.to_datetime(pd.date_range('2023-01-01', periods=100)))

    # Aggiungere dati fittizi per le medie mobili
    data['close'] = data['close'].rolling(window=5).mean().fillna(data['close']) # Smoothing per un esempio più realistico

    # Creare istanza della strategia
    sma_params = {'fast_window': 10, 'slow_window': 30}
    sma_strategy = SMACrossoverStrategy(sma_params)

    # Generare segnali
    signals = sma_strategy.generate_signals(data.copy()) # Passa una copia per non modificare l'originale

    print("Dati con medie mobili:")
    print(data.head())
    print("\nSegnali generati:")
    print(signals.head())
