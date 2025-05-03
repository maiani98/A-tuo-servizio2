from __future__ import annotations
import vectorbt as vbt, pandas as pd, numpy as np
from models.base import BaseModel

def sharpe_ratio(model: BaseModel, X: pd.DataFrame, y: pd.Series) -> float:
    """Calcola Sharpe annualizzato su un set di test."""
    prob = model.predict_proba(X)
    ret = np.where(prob > 0.66, y.values, 0.0)
    mu, sigma = ret.mean(), ret.std(ddof=1)
    return (mu / sigma) * np.sqrt(252) if sigma else 0.0

# --------------------------------------------------------------- #
def walk_forward_backtest(df: pd.DataFrame,
                          labels: pd.Series,
                          model_params: dict[str, float],
                          splits: int = 10):
    from models.lgbm import LGBMModel
    wf = vbt.WalkForwardSplitter(n_splits=splits, walk_forward=True,
                                 min_train_periods='60d', min_test_periods='30d')
    results = []
    for tr, te in wf.split(df):
        X_tr, y_tr, X_te, y_te = df.iloc[tr], labels.iloc[tr], df.iloc[te], labels.iloc[te]
        model = LGBMModel(**model_params)
        model.fit(X_tr, y_tr)
        results.append(sharpe_ratio(model, X_te, y_te))
    return pd.Series(results, name="sharpe_oos")
