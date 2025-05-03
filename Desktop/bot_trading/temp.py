import pandas as pd
import ta
from decimal import Decimal

data = pd.DataFrame({
    'high': [50000, 51000, 50500, 51500, 52000],
    'low': [49000, 49500, 49800, 50800, 51200],
    'close': [49800, 50500, 50200, 51200, 51800]
})

atr_period = 3
atr_indicator = ta.volatility.AverageTrueRange(data['high'], data['low'], data['close'], window=atr_period)
atr = atr_indicator.average_true_range().iloc[-1]

print(atr)
