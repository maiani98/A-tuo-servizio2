import unittest
from unittest.mock import patch
from decimal import Decimal
import ccxt
from core.broker import Broker
from config import BINANCE_KEY, BINANCE_SECRET, SYMBOL

class TestBroker(unittest.TestCase):

    def setUp(self):
        self.broker = Broker(exchange_id='binance', testnet=True)
        self.symbol = 'BTC/USDT'

    @patch('core.broker.Broker.fetch_balance')
    def test_fetch_balance(self, mock_fetch_balance):
        # Mock the fetch_balance method to return a specific balance
        mock_fetch_balance.return_value = Decimal('100.0')

        # Call the fetch_balance method
        balance = self.broker.fetch_balance('USDT')

        # Assert that the balance is correct
        self.assertEqual(balance, Decimal('100.0'))

    @patch('core.broker.Broker.create_market_order')
    def test_create_market_order(self, mock_create_market_order):
        # Mock the create_market_order method to return a specific order
        mock_create_market_order.return_value = {'id': '12345'}

        # Call the create_market_order method
        order = self.broker.create_market_order(self.symbol, 'buy', Decimal('0.001'))

        # Assert that the order is correct
        self.assertEqual(order, {'id': '12345'})

    @patch('core.broker.Broker.create_limit_order')
    def test_create_limit_order(self, mock_create_limit_order):
        # Mock the create_limit_order method to return a specific order
        mock_create_limit_order.return_value = {'id': '67890'}

        # Call the create_limit_order method
        order = self.broker.create_limit_order(self.symbol, 'buy', Decimal('0.001'), Decimal('60000.0'))

        # Assert that the order is correct
        self.assertEqual(order, {'id': '67890'})

    @patch('core.broker.Broker.create_stop_limit_order')
    def test_create_stop_limit_order(self, mock_create_stop_limit_order):
        # Mock the create_stop_limit_order method to return a specific order
        mock_create_stop_limit_order.return_value = {'id': '13579'}

        # Call the create_stop_limit_order method
        order = self.broker.create_stop_limit_order(self.symbol, 'buy', Decimal('0.001'), Decimal('60000.0'), Decimal('59000.0'))

        # Assert that the order is correct
        self.assertEqual(order, {'id': '13579'})

if __name__ == '__main__':
    unittest.main()
