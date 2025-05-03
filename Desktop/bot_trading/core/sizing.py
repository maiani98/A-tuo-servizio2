"""Position sizing dinamico: risk-parity, vol-target, Kelly frazionato."""
from __future__ import annotations
import numpy as np
from decimal import Decimal, ROUND_DOWN

def _risk_parity(vols: np.ndarray) -> np.ndarray:
    inv = 1.0 / vols
    return inv / inv.sum()

def _vol_target(sigma_port: float, target: float = 0.10, max_lev: float = 2.0) -> float:
    lev = target / sigma_port if sigma_port else 1.0
    return float(min(lev, max_lev))

def _kelly(edge: float, var: float, frac: float = 0.25) -> float:
    return float(frac * edge / var) if var else 0.0

# -------------------------------------------------------------------- #
def position_size_dynamic(price: float,
                          capital: float,
                          sigma_asset: float,
                          sigma_port: float,
                          edge: float) -> Decimal:
    w = _risk_parity(np.asarray([sigma_asset]))[0]
    lev = _vol_target(sigma_port)
    kelly_f = _kelly(edge, sigma_port ** 2)
    qty = (capital * w * lev * kelly_f) / price
    return Decimal(str(qty)).quantize(Decimal("0.000001"), rounding=ROUND_DOWN)
