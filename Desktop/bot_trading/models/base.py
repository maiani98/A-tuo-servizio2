"""Interfaccia comune modello ↔ main."""
from __future__ import annotations
import abc
import pandas as pd
from pathlib import Path
import joblib, json
from typing import List, Dict, Any

class BaseModel(abc.ABC):
    @abc.abstractmethod
    def fit(self, X: pd.DataFrame, y: pd.Series) -> None: ...

    @abc.abstractmethod
    def predict_proba(self, X: pd.DataFrame) -> pd.Series: ...

    # -------------------------------------------------------------- #
    def save(self, path: Path) -> None:
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: Path) -> "BaseModel":
        return joblib.load(path)

class Signal:
    """Rappresenta un segnale di trading."""
    def __init__(self, symbol: str, direction: str, price: float, volume: float, metadata: Dict[str, Any] = None):
        self.symbol = symbol
        self.direction = direction # 'buy', 'sell', 'hold', 'exit'
        self.price = price
        self.volume = volume
        self.metadata = metadata if metadata is not None else {}

    def __repr__(self):
        return f"Signal(symbol='{self.symbol}', direction='{self.direction}', price={self.price}, volume={self.volume})"


class Strategy(abc.ABC):
    """Classe base astratta per le strategie di trading."""
    def __init__(self, params: Dict[str, Any]):
        self.params = params

    @abc.abstractmethod
    def on_bar(self, bar: pd.Series) -> None:
        """Gestisce l'arrivo di una nuova barra."""
        pass

    @abc.abstractmethod
    def on_tick(self, tick: Dict[str, Any]) -> None:
        """Gestisce l'arrivo di un nuovo tick."""
        pass

    @abc.abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Genera segnali di trading basati sui dati storici o correnti.
           Dovrebbe ritornare un DataFrame con colonne 'entry_signal' e 'exit_signal' (booleani).
        """
        pass

    # TODO: Aggiungere metodi per la gestione dello stato, logging specifico della strategia, ecc.
