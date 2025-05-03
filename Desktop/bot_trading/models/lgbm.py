from __future__ import annotations
import pandas as pd
from lightgbm import LGBMClassifier
from .base import BaseModel

class LGBMModel(BaseModel):
    def __init__(self, **params) -> None:
        self.params = params or dict(
            n_estimators=500,
            learning_rate=0.05,
            num_leaves=63,
            subsample=0.7,
            colsample_bytree=0.8,
        )
        self.clf = LGBMClassifier(**self.params)

    def fit(self, X: pd.DataFrame, y: pd.Series) -> None:
        self.clf.fit(X, y)

    def predict_proba(self, X: pd.DataFrame):
        return self.clf.predict_proba(X)[:, 1]
