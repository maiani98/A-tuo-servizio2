from __future__ import annotations
import optuna, pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from models.lgbm import LGBMModel
from backtest.walk_forward import sharpe_ratio

def _objective(trial: optuna.trial.Trial, X: pd.DataFrame, y: pd.Series):
    params = dict(
        num_leaves=trial.suggest_int("num_leaves", 31, 255),
        learning_rate=trial.suggest_float("lr", 1e-4, 0.2, log=True),
        n_estimators=trial.suggest_int("n", 300, 800),
        subsample=trial.suggest_float("sub", 0.5, 1.0),
        colsample_bytree=trial.suggest_float("col", 0.5, 1.0),
    )
    model = LGBMModel(**params)
    tscv = TimeSeriesSplit(n_splits=5)
    sharpe_scores = []
    for tr_idx, te_idx in tscv.split(X):
        model.fit(X.iloc[tr_idx], y.iloc[tr_idx])
        sharpe_scores.append(sharpe_ratio(model, X.iloc[te_idx], y.iloc[te_idx]))
    return sum(sharpe_scores) / len(sharpe_scores)

def run_optuna(X: pd.DataFrame, y: pd.Series, n_trials: int = 300):
    study = optuna.create_study(direction="maximize")
    study.optimize(lambda t: _objective(t, X, y), n_trials=n_trials)
    return study.best_params
