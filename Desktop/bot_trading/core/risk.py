"""Gestione del rischio a livello di giornata e stop operativi."""
from __future__ import annotations
import datetime as dt
from decimal import Decimal
from loguru import logger
from config import MAX_DAILY_LOSS, MAX_TOTAL_EXPOSURE, MAX_POSITION_PER_ASSET
from typing import Dict, Any
import pandas as pd # Aggiunto per ATR e altri calcoli
import ta

class RiskManager:
    def __init__(self, initial_capital: Decimal = Decimal("10000.0")) -> None:
        self.start_date: dt.date = dt.date.today()
        self.daily_pnl: Decimal = Decimal("0")
        self.current_exposure: Decimal = Decimal("0") # Esposizione totale corrente
        self.positions: Dict[str, Decimal] = {} # Posizioni attuali per asset {symbol: volume}
        self.initial_capital = initial_capital
        self.current_capital: Decimal = initial_capital # Capitale corrente (semplificato)
        self.peak_capital: Decimal = initial_capital # Capitale massimo raggiunto per drawdown

    # ---------------------------------------------------------------- #
    def _roll_date(self) -> None:
        """Resetta il PnL giornaliero se è iniziato un nuovo giorno."""
        if dt.date.today() != self.start_date:
            logger.info("Nuovo giorno: reset PnL giornaliero.")
            self.start_date = dt.date.today()
            self.daily_pnl = Decimal("0")
            # TODO: Potrebbe essere necessario resettare altri limiti giornalieri qui

    def update_capital(self, pnl: Decimal) -> None:
        """Aggiorna il capitale corrente e il picco per il calcolo del drawdown."""
        self.current_capital += pnl
        self.peak_capital = max(self.peak_capital, self.current_capital)
        self.register_pnl(pnl) # Aggiorna anche il PnL giornaliero

    def calculate_drawdown(self) -> Decimal:
        """Calcola il drawdown corrente."""
        if self.peak_capital == Decimal("0"): # Evita divisione per zero all'inizio
            return Decimal("0")
        return (self.peak_capital - self.current_capital) / self.peak_capital

    def can_trade(self) -> bool:
        """Verifica se il trading è permesso in base ai limiti di rischio."""
        self._roll_date()

        # Controllo limite di perdita giornaliera
        if self.daily_pnl < -Decimal(str(MAX_DAILY_LOSS)):
            logger.warning(f"Limite di perdita giornaliera ({MAX_DAILY_LOSS}) oltrepassato. Trading sospeso.")
            return False

        # Controllo limite di esposizione totale (semplificato: somma dei valori delle posizioni)
        # TODO: Calcolare l'esposizione in modo più accurato (es. valore di mercato corrente delle posizioni)
        # Per ora, usiamo una stima basata sul volume e un prezzo medio o ultimo noto.
        # Questo richiede l'accesso ai dati di mercato correnti.
        # self.current_exposure = sum(pos * price_lookup(symbol) for symbol, pos in self.positions.items())
        # if self.current_exposure > Decimal(str(MAX_TOTAL_EXPOSURE)):
        #     logger.warning(f"Limite di esposizione totale ({MAX_TOTAL_EXPOSURE}) oltrepassato. Trading sospeso.")
        #     return False

        # Controllo limite di drawdown (se implementato un limite specifico)
        # if self.calculate_drawdown() > Decimal(str(MAX_DRAWDOWN)): # Assumendo MAX_DRAWDOWN in config
        #     logger.warning(f"Limite di drawdown oltrepassato. Trading sospeso.")
        #     return False

        # TODO: Aggiungere altri controlli di rischio globali

        return True

    def can_open_position(self, symbol: str, volume: Decimal, price: Decimal) -> bool:
        """Verifica se è possibile aprire una nuova posizione per un asset specifico."""
        if not self.can_trade():
            return False

        # Controllo limite di posizione per asset
        current_pos = self.positions.get(symbol, Decimal("0"))
        if current_pos + volume > Decimal(str(MAX_POSITION_PER_ASSET)):
            logger.warning(f"Limite di posizione per {symbol} ({MAX_POSITION_PER_ASSET}) oltrepassato.")
            return False

        # Controllo impatto sull'esposizione totale (stima)
        # estimated_new_exposure = self.current_exposure + (volume * price)
        # if estimated_new_exposure > Decimal(str(MAX_TOTAL_EXPOSURE)):
        #      logger.warning(f"Apertura posizione per {symbol} supererebbe limite esposizione totale ({MAX_TOTAL_EXPOSURE}).")
        #      return False

        # TODO: Aggiungere altri controlli specifici per l'apertura di posizione

        return True

    def register_trade(self, symbol: str, volume: Decimal, price: Decimal, trade_type: str) -> None:
        """Registra un trade eseguito e aggiorna le posizioni e l'esposizione."""
        if trade_type == 'buy':
            self.positions[symbol] = self.positions.get(symbol, Decimal("0")) + volume
            # self.current_exposure += volume * price # Aggiornamento esposizione (semplificato)
            logger.info(f"Registrato BUY {volume:.4f} di {symbol} a {price:.4f}. Posizione attuale: {self.positions[symbol]:.4f}")
        elif trade_type == 'sell':
            self.positions[symbol] = self.positions.get(symbol, Decimal("0")) - volume
            # self.current_exposure -= volume * price # Aggiornamento esposizione (semplificato)
            logger.info(f"Registrato SELL {volume:.4f} di {symbol} a {price:.4f}. Posizione attuale: {self.positions[symbol]:.4f}")
        else:
            logger.warning(f"Tipo di trade non riconosciuto: {trade_type}")

        # Rimuovi l'asset se la posizione diventa zero
        if symbol in self.positions and self.positions[symbol] == Decimal("0"):
            del self.positions[symbol]
            logger.info(f"Posizione per {symbol} chiusa.")

        # TODO: Aggiornare l'esposizione totale in modo più robusto

    def calculate_position_size(self, capital: Decimal, risk_per_trade: float, price: Decimal, method: str = 'fixed-fractional', **kwargs) -> Decimal:
        """Calcola la dimensione della posizione in base a diversi metodi."""
        if price == Decimal("0"):
            logger.warning("Prezzo zero, impossibile calcolare la dimensione della posizione.")
            return Decimal("0")

        if method == 'fixed-fractional':
            # risk_per_trade è la frazione del capitale da rischiare per trade (es. 0.01 per 1%)
            # Questo richiede di definire uno stop-loss per calcolare la dimensione.
            # Esempio semplificato: rischia una frazione del capitale per trade,
            # la dimensione è (capitale * risk_per_trade) / (distanza dallo stop-loss * prezzo)
            # Questo metodo è incompleto senza la logica dello stop-loss.
            logger.warning("Metodo fixed-fractional richiede logica stop-loss non implementata qui.")
            # Placeholder: dimensione fissa basata su una frazione del capitale
            size = (capital * Decimal(str(risk_per_trade))) / price
            return size

        elif method == 'volatility-based':
            # Richiede dati storici per calcolare la volatilità (es. ATR)
            # kwargs dovrebbe contenere il DataFrame dei dati e il periodo per l'ATR
            data = kwargs.get('data')
            atr_period = kwargs.get('atr_period', 14)
            if data is None or 'high' not in data.columns or 'low' not in data.columns or 'close' not in data.columns:
                logger.error("Dati insufficienti per il calcolo ATR per il pos sizing volatility-based.")
                return Decimal("0")

            # Calcola l'ATR
            atr_indicator = ta.volatility.AverageTrueRange(data['high'], data['low'], data['close'], window=atr_period)
            atr = atr_indicator.average_true_range().iloc[-1] # Ultimo valore ATR

            if atr == 0:
                 logger.warning("ATR calcolato è zero, impossibile calcolare la dimensione della posizione.")
                 return Decimal("0")

            # Dimensione = (capitale * risk_per_trade) / (ATR * prezzo)
            size = (capital * Decimal(str(risk_per_trade))) / (Decimal(str(atr)) * price)
            return size

        elif method == 'kelly-criterion':
            # Richiede la probabilità di vincita (p), il rapporto vincita/perdita (b)
            # Formula: f = p - (1-p)/b
            # kwargs dovrebbe contenere 'win_probability' e 'win_loss_ratio'
            win_probability = kwargs.get('win_probability')
            win_loss_ratio = kwargs.get('win_loss_ratio')

            if win_probability is None or win_loss_ratio is None or win_loss_ratio == 0:
                logger.error("Parametri insufficienti o invalidi per il Kelly criterion.")
                return Decimal("0")

            f = win_probability - (1 - win_probability) / win_loss_ratio
            if f <= 0:
                logger.warning("Kelly criterion suggerisce di non investire (f <= 0).")
                return Decimal("0")

            # Dimensione = Capitale * f
            size = capital * Decimal(str(f))
            return size

        else:
            logger.warning(f"Metodo di pos sizing non riconosciuto: {method}")
            return Decimal("0")

    def check_stop_loss_take_profit(self, symbol: str, current_price: Decimal) -> str | None:
        """Controlla se stop-loss o take-profit sono stati raggiunti per una posizione."""
        # TODO: Implementare la logica per stop-loss e take-profit (statici e dinamici)
        # Questo richiede di memorizzare i livelli di SL/TP per ogni posizione aperta.
        # Potrebbe essere necessario passare più informazioni sulla posizione (prezzo di ingresso, ecc.)
        # Ritorna 'stop_loss' o 'take_profit' se attivati, altrimenti None.
        pass

    def register_pnl(self, pnl: Decimal) -> None:
        """Registra il PnL di un trade e aggiorna il PnL giornaliero."""
        self.daily_pnl += pnl
        logger.debug(f"PnL giornaliero aggiornato: {self.daily_pnl:.4f}")

# Esempio di utilizzo (da rimuovere o spostare in script di test/esecuzione)
if __name__ == '__main__':
    risk_manager = RiskManager(initial_capital=Decimal("20000.0"))

    # Esempio di trade che genera PnL
    risk_manager.update_capital(Decimal("100.0"))
    print(f"Capitale corrente dopo PnL: {risk_manager.current_capital}")
    print(f"PnL giornaliero: {risk_manager.daily_pnl}")

    # Esempio di controllo trading permesso
    MAX_DAILY_LOSS = 500 # Esempio di configurazione
    if risk_manager.can_trade():
        print("Trading permesso.")
    else:
        print("Trading sospeso.")

    # Esempio di calcolo dimensione posizione (fixed-fractional - incompleto senza SL)
    # size = risk_manager.calculate_position_size(risk_manager.current_capital, 0.01, Decimal("50000.0"), method='fixed-fractional')
    # print(f"Dimensione posizione calcolata (fixed-fractional): {size}")

    # Esempio di calcolo dimensione posizione (volatility-based)
    # Richiede dati di esempio con high, low, close
    data_for_atr = pd.DataFrame({
        'high': [50000, 51000, 50500, 51500, 52000],
        'low': [49000, 49500, 49800, 50800, 51200],
        'close': [49800, 50500, 50200, 51200, 51800]
    })
    size_atr = risk_manager.calculate_position_size(risk_manager.current_capital, 0.02, Decimal("51800.0"), method='volatility-based', data=data_for_atr, atr_period=3)
    print(f"Dimensione posizione calcolata (volatility-based): {size_atr}")

    # Esempio di registrazione trade
    if risk_manager.can_open_position("BTC/USDT", size_atr, Decimal("51800.0")):
         risk_manager.register_trade("BTC/USDT", size_atr, Decimal("51800.0"), 'buy')
         print(f"Posizioni attuali: {risk_manager.positions}")

    # Esempio di calcolo drawdown
    risk_manager.update_capital(Decimal("-1000.0"))
    print(f"Capitale corrente dopo perdita: {risk_manager.current_capital}")
    print(f"Drawdown corrente: {risk_manager.calculate_drawdown():.4f}")
