"""Creazione feature tecniche e fondamentali dal DataFrame di bar."""
from __future__ import annotations
import pandas as pd
import ta
import numpy as np
# from mlfinlab.data_structures import get_dollar_bars, get_imbalance_bars # Uncomment if mlfinlab is installed
# import vectorbt as vbt # Uncomment if vectorbt is used for indicators

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Aggiunge indicatori tecnici comuni al DataFrame."""
    out = df.copy()

    # Moving Averages
    out['SMA_10'] = ta.trend.sma_indicator(out['close'], window=10)
    out['EMA_10'] = ta.trend.ema_indicator(out['close'], window=10)

    # RSI
    out['RSI_14'] = ta.momentum.rsi(out['close'], window=14)

    # MACD
    macd = ta.trend.MACD(out['close'])
    out['MACD'] = macd.macd()
    out['MACD_signal'] = macd.macd_signal()
    out['MACD_diff'] = macd.macd_diff()

    # Bollinger Bands
    bollinger = ta.volatility.BollingerBands(out['close'])
    out['BBP'] = bollinger.bollinger_pband()
    out['BBW'] = bollinger.bollinger_wband()

    # Keltner Channels (using ta)
    keltner = ta.volatility.KeltnerChannel(out['high'], out['low'], out['close'])
    out['KCH'] = keltner.keltner_channel_hband()
    out['KCL'] = keltner.keltner_channel_lband()
    out['KCM'] = keltner.keltner_channel_mband()

    # TODO: Add more indicators as needed

    return out

def add_advanced_features(df: pd.DataFrame) -> pd.DataFrame:
    """Aggiunge feature avanzate (placeholder)."""
    out = df.copy()

    # TODO: Implement imbalance bars, volume-profile, order-flow imbalance
    # Requires tick data or specific order book data

    # Example placeholder for a custom feature
    out['price_volume_interaction'] = out['close'] * out['volume']

    return out

def normalize_features(df: pd.DataFrame, method='z-score', window=None) -> pd.DataFrame:
    """Normalizza le feature."""
    out = df.copy()
    numeric_cols = out.select_dtypes(include=np.number).columns

    if method == 'z-score':
        if window:
            out[numeric_cols] = out[numeric_cols].rolling(window=window).apply(lambda x: (x - x.mean()) / x.std(), raw=True)
        else:
            out[numeric_cols] = (out[numeric_cols] - out[numeric_cols].mean()) / out[numeric_cols].std()
    elif method == 'min-max':
         if window:
            out[numeric_cols] = out[numeric_cols].rolling(window=window).apply(lambda x: (x - x.min()) / (x.max() - x.min()), raw=True)
         else:
            out[numeric_cols] = (out[numeric_cols] - out[numeric_cols].min()) / (out[numeric_cols].max() - out[numeric_cols].min())
    # TODO: Add other normalization methods

    return out

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """Funzione principale per aggiungere tutte le feature."""
    df = add_technical_indicators(df)
    df = add_advanced_features(df)
    # Example of normalization (can be applied selectively)
    # df = normalize_features(df, method='z-score', window=50)
    return df

# Esempio di utilizzo (da rimuovere o spostare in script di test/esecuzione)
if __name__ == '__main__':
    # Creare un DataFrame di esempio per il test
    data = {
        'open': np.random.rand(100),
        'high': np.random.rand(100) + 1,
        'low': np.random.rand(100) - 1,
        'close': np.random.rand(100),
        'volume': np.random.rand(100) * 1000
    }
    sample_df = pd.DataFrame(data)

    # Aggiungere feature
    df_with_features = add_features(sample_df)
    print(df_with_features.head())
