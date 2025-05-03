from __future__ import annotations
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .base import BaseModel

class RFModel(BaseModel):
    def __init__(self, **params) -> None:
        self.params = params or dict(n_estimators=400, max_depth=None)
        self.clf = RandomForestClassifier(**self.params)

    def fit(self, X: pd.DataFrame, y: pd.Series) -> None:
        self.clf.fit(X, y)

    def predict_proba(self, X: pd.DataFrame):
        return self.clf.predict_proba(X)[:, 1]
