"""Creazione delle etichette con metodo triple-barrier di López de Prado."""
from __future__ import annotations
import pandas as pd
from mlfinlab.labeling import get_events, add_vertical_barrier

def make_labels(df: pd.DataFrame,
                pt: float = 2.0,
                sl: float = 2.0,
                min_ret: float = 1e-3) -> pd.Series:
    vol = df.close.pct_change().ewm(span=100).std()
    events = get_events(df.close, vol, [pt, sl], min_ret, num_threads=0)
    labels = add_vertical_barrier(events.index, df.close)
    return labels
