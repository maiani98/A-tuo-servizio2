import unittest
from decimal import Decimal
from core.risk import RiskManager
import pandas as pd
import ta

class TestRiskManager(unittest.TestCase):

    def setUp(self):
        self.risk_manager = RiskManager(initial_capital=Decimal("10000.0"))
        self.symbol = "BTC/USDT"
        self.price = Decimal("50000.0")

    def test_calculate_drawdown(self):
        # Test when current capital is equal to peak capital
        self.assertEqual(self.risk_manager.calculate_drawdown(), Decimal("0"))

        # Test when current capital is less than peak capital
        self.risk_manager.current_capital = Decimal("9000.0")
        self.assertEqual(self.risk_manager.calculate_drawdown(), Decimal("0.1"))

    def test_can_trade(self):
        # Test when daily PnL is within the limit
        self.assertTrue(self.risk_manager.can_trade())

        # Test when daily PnL exceeds the limit
        self.risk_manager.daily_pnl = Decimal("-301.0")
        self.assertFalse(self.risk_manager.can_trade())

    def test_can_open_position(self):
        # Test when position size is within the limit
        self.assertTrue(self.risk_manager.can_open_position(self.symbol, Decimal("0.1"), self.price))

        # Test when position size exceeds the limit
        self.assertFalse(self.risk_manager.can_open_position(self.symbol, Decimal("1000"), self.price))

    def test_register_trade(self):
        # Test when trade type is buy
        self.risk_manager.register_trade(self.symbol, Decimal("0.1"), self.price, "buy")
        self.assertEqual(self.risk_manager.positions[self.symbol], Decimal("0.1"))

        # Test when trade type is sell
        self.risk_manager.register_trade(self.symbol, Decimal("0.05"), self.price, "sell")
        self.assertEqual(self.risk_manager.positions[self.symbol], Decimal("0.05"))

        # Test when position is closed
        self.risk_manager.register_trade(self.symbol, Decimal("0.05"), self.price, "sell")
        self.assertNotIn(self.symbol, self.risk_manager.positions)

    def test_calculate_position_size_fixed_fractional(self):
        # Test fixed-fractional method
        size = self.risk_manager.calculate_position_size(Decimal("10000.0"), 0.01, self.price, method='fixed-fractional')
        self.assertEqual(size, Decimal("0.002"))

    def test_calculate_position_size_volatility_based(self):
        # Test volatility-based method
        data = pd.DataFrame({
            'high': [50000, 51000, 50500, 51500, 52000],
            'low': [49000, 49500, 49800, 50800, 51200],
            'close': [49800, 50500, 50200, 51200, 51800]
        })
        atr_indicator = ta.volatility.AverageTrueRange(data['high'], data['low'], data['close'], window=3)
        atr = atr_indicator.average_true_range().iloc[-1]
        size = self.risk_manager.calculate_position_size(Decimal("10000.0"), 0.02, Decimal("51800.0"), method='volatility-based', data=data, atr_period=3)
        expected_size = (Decimal("10000.0") * Decimal("0.02")) / (Decimal(str(atr)) * Decimal("51800.0"))
        self.assertAlmostEqual(size, expected_size, places=9)

if __name__ == '__main__':
    unittest.main()
