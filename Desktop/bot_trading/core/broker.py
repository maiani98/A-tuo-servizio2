"""Wrapper ccxt per ordini spot in produzione o testnet."""
from __future__ import annotations
import ccxt
from loguru import logger
from decimal import Decimal
from config import BINANCE_KEY, BINANCE_SECRET, SYMBOL  # TODO: Rendere le chiavi e il simbolo configurabili per exchange multipli
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, RetryError
import random
from typing import Dict, Any


class Broker:
    def __init__(self, exchange_id: str = 'binance', testnet: bool = False) -> None:
        self.exchange_id = exchange_id
        self.testnet = testnet
        self.exchange = self._create_exchange_instance(exchange_id, testnet)
        self.exchange.enableRateLimit = True  # Abilita la gestione automatica del rate limit di CCXT

    def _create_exchange_instance(self, exchange_id: str, testnet: bool):
        """Crea e configura l'istanza dell'exchange."""
        try:
            exchange_class = getattr(ccxt, exchange_id)
            opts = {
                # TODO: Gestire le chiavi API in modo sicuro e configurabile per ogni exchange
                'apiKey': BINANCE_KEY if exchange_id == 'binance' else 'YOUR_API_KEY',
                'secret': BINANCE_SECRET if exchange_id == 'binance' else 'YOUR_SECRET',
                # Aggiungere altre opzioni specifiche dell'exchange se necessario
            }

            if exchange_id == 'binance':
                exchange_class = ccxt.binance
            elif exchange_id == 'coinbasepro':
                exchange_class = ccxt.coinbasepro
            else:
                logger.error(
                    f"Exchange '{{exchange_id}}' non supportato. Impossibile configurare l'URL della testnet.")
                raise ValueError(f"Exchange '{{exchange_id}}' non supportato.")

            exchange_descriptor = exchange_class().describe()

            if testnet:
                # Configura l'URL della testnet si supportata dall'exchange
                if 'urls' in exchange_descriptor and 'test' in exchange_descriptor['urls']:
                    opts['urls'] = {'api': exchange_descriptor['urls']['test']}

            # else:
            #     # Configura l'URL della mainnet (lascia che CCXT usi i default)
            #     pass

            exchange = exchange_class(opts)

            # Carica i mercati per ottenere informazioni sui simboli e le precisioni
            exchange.load_markets()

            logger.info(f"Istanza exchange {exchange_id} creata con successo (Testnet: {testnet}).")
            return exchange

        except AttributeError:
            logger.error(f"Exchange '{exchange_id}' non trovato in CCXT.")
            raise
        except Exception as e:
            logger.error(f"Errore nella creazione dell'istanza exchange {exchange_id}: {e}")
            raise

    def _handle_exchange_exception(self, e: Exception, order_type: str, symbol: str, side: str, amount: Decimal, price: Decimal | None = None):
        """Gestisce le eccezioni specifiche dell'exchange e tenta il failover se applicabile."""
        logger.error(f"Errore durante l'esecuzione dell'ordine ({order_type} {side} {amount} {symbol} @ {price}): {e}")
        raise

    # --------------------------------------------------------------- #
    #                         Account                                #
    # --------------------------------------------------------------- #
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=5), retry=retry_if_exception_type(Exception))
    def fetch_balance(self, currency: str = 'USDT') -> Decimal:
        """Recupera il saldo disponibile di una valuta."""
        try:
            bal = self.exchange.fetch_balance()
            # Cerca il saldo nella struttura di risposta di CCXT
            if currency in bal['free']:
                balance = Decimal(str(bal['free'][currency]))
                logger.debug(f"Saldo disponibile {currency}: {balance:.4f}")
                return balance
            else:
                logger.warning(f"Valuta {currency} non trovata nel saldo.")
                return Decimal("0")
        except Exception as e:
            logger.error(f"Errore nel recupero saldo {currency}: {e}")
            self._handle_exchange_exception(e, 'fetch_balance', currency, '', Decimal("0"))  # Tipo di operazione fittizio
            return Decimal("0")  # Ritorna 0 in caso di errore dopo i retry

    # --------------------------------------------------------------- #
    #                          Orders                                #
    # --------------------------------------------------------------- #

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(Exception))
    def create_market_order(self, symbol: str, side: str, amount: Decimal) -> dict:
        """Crea un ordine di mercato."""
        logger.info(f"Invio ordine MARKET {side} {amount:.8f} {symbol}")
        try:
            # Assicurati che l'amount rispetti la precisione dell'exchange
            market = self.exchange.market(symbol)
            amount_formatted = self.exchange.amount_to_precision(symbol, float(amount))
            logger.debug(f"Amount formattato per {symbol}: {amount_formatted}")

            ord_data = self.exchange.create_market_order(symbol, side, float(amount_formatted))
            logger.info(f"Ordine MARKET eseguito: {ord_data}")
            return ord_data
        except Exception as e:
            self._handle_exchange_exception(e, 'MARKET', symbol, side, amount)

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(Exception))
    def create_limit_order(self, symbol: str, side: str, amount: Decimal, price: Decimal) -> dict:
        """Crea un ordine limite."""
        logger.info(f"Invio ordine LIMIT {side} {amount:.8f} {symbol} @ {price:.8f}")
        try:
            # Assicurati che amount e price rispettino la precisione dell'exchange
            market = self.exchange.market(symbol)
            amount_formatted = self.exchange.amount_to_precision(symbol, float(amount))
            price_formatted = self.exchange.price_to_precision(symbol, float(price))
            logger.debug(f"Amount formattato: {amount_formatted}, Price formattato: {price_formatted}")

            ord_data = self.exchange.create_limit_order(symbol, side, float(amount_formatted), float(price_formatted))
            logger.info(f"Ordine LIMIT eseguito: {ord_data}")
            return ord_data
        except Exception as e:
            self._handle_exchange_exception(e, 'LIMIT', symbol, side, amount, price)

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(Exception))
    def create_stop_limit_order(self, symbol: str, side: str, amount: Decimal, price: Decimal, stop_price: Decimal) -> dict:
        """Crea un ordine stop-limit."""
        logger.info(f"Invio ordine STOP-LIMIT {side} {amount:.8f} {symbol} @ {price:.8f} stop={stop_price:.8f}")
        try:
            # Assicurati che amount, price e stop_price rispettino la precisione
            market = self.exchange.market(symbol)
            amount_formatted = self.exchange.amount_to_precision(symbol, float(amount))
            price_formatted = self.exchange.price_to_precision(symbol, float(price))
            stop_price_formatted = self.exchange.amount_to_precision(symbol, float(stop_price))
            logger.debug(f"Amount: {amount_formatted}, Price: {price_formatted}, Stop Price: {stop_price_formatted}")

            # Alcuni exchange richiedono parametri aggiuntivi o nomi diversi per gli ordini stop-limit
            # CCXT cerca di unificare, ma potrebbe essere necessario personalizzare per exchange specifici.
            params = {
                'stopPrice': float(stop_price_formatted),
                # Aggiungere altri parametri specifici se necessario (es. timeInForce)
            }

            ord_data = self.exchange.create_order(symbol, 'stop_limit', side, float(amount_formatted), float(price_formatted), params)
            logger.info(f"Ordine STOP-LIMIT eseguito: {ord_data}")
            return ord_data
        except Exception as e:
            self._handle_exchange_exception(e, 'STOP-LIMIT', symbol, side, amount, price)

    # TODO: Implementare create_iceberg_order se necessario e supportato dall'exchange

    # TODO: Implementare logica di Smart Order Routing (split, TWAP, VWAP)
    # Questo potrebbe richiedere una classe OrderRouter separata che utilizzi i metodi di Broker.
    def execute_smart_order(self, symbol: str, side: str, total_amount: Decimal, order_type: str = 'market', **kwargs):
        """Esegue un ordine utilizzando logica di smart routing (placeholder)."""
        logger.warning(f"Smart order execution non ancora implementata. Eseguo ordine semplice {order_type}.")
        if order_type == 'market':
            return self.create_market_order(symbol, side, total_amount)
        elif order_type == 'limit':
            price = kwargs.get('price')
            if price is None:
                logger.error("Prezzo richiesto per ordine limite.")
                return None
            return self.create_limit_order(symbol, side, total_amount, Decimal(str(price)))
        # TODO: Aggiungere altri tipi di ordine e logica di split/TWAP/VWAP

    # TODO: Implementare metodi per cancellare ordini, fetchare ordini aperti, fetchare ordini eseguiti, ecc.

# Esempio di utilizzo (da rimuovere o spostare in script di test/esecuzione)
if __name__ == '__main__':
    # Assicurati di avere BINANCE_KEY e BINANCE_SECRET configurati nel tuo .env o config.py
    # e di avere un saldo sulla testnet di Binance se usi testnet=True

    # Esempio con Binance Testnet
    try:
        broker_testnet = Broker('binance', testnet=True)
        symbol_test = 'BTC/USDT'  # Simbolo sulla testnet

        # Recupera saldo USDT sulla testnet
        usdt_balance = broker_testnet.fetch_balance('USDT')
        print(f"Saldo USDT sulla testnet: {usdt_balance}")

        # Esempio di ordine di mercato (richiede saldo e rispettare i limiti minimi dell'exchange)
        # amount_to_buy = Decimal("0.0001") # Esempio di importo
        # if usdt_balance > 10: # Esempio di controllo saldo minimo
        #     try:
        #         market_order_result = broker_testnet.create_market_order(symbol_test, 'buy', amount_to_buy)
        #         print(f"Risultato ordine di mercato: {market_order_result}")
        #     except RetryError as e:
        #         print(f"Errore persistente nell'invio dell'ordine di mercato: {e}")
        # else:
        #     print("Saldo USDT insufficiente sulla testnet per l'esempio di ordine di mercato.")

        # Esempio di ordine limite (richiede di specificare un prezzo)
        # amount_to_sell = Decimal("0.0001") # Esempio di importo
        # limit_price = Decimal("60000.0") # Esempio di prezzo limite (sostituire con un prezzo realistico per la testnet)
        # try:
        #     limit_order_result = broker_testnet.create_limit_order(symbol_test, 'sell', amount_to_sell, limit_price)
        #     print(f"Risultato ordine limite: {limit_order_result}")
        # except RetryError as e:
        #     print(f"Errore persistente nell'invio dell'ordine limite: {e}")

        # Esempio di ordine stop-limit (richiede prezzo e stop_price)
        # amount_to_buy_stop = Decimal("0.0001")
        # price_stop = Decimal("55000.0") # Prezzo limite quando lo stop è raggiunto
        # stop_price_stop = Decimal("54900.0") # Prezzo che attiva l'ordine limite
        # try:
        #     stop_limit_order_result = broker_testnet.create_stop_limit_order(symbol_test, 'buy', amount_to_buy_stop, price_stop, stop_price_stop)
        #     print(f"Risultato ordine stop-limit: {stop_limit_order_result}")
        # except RetryError as e:
        #     print(f"Errore persistente nell'invio dell'ordine stop-limit: {e}")

    except Exception as e:
        logger.error(f"Errore durante l'esecuzione degli esempi sulla testnet: {e}")

    # Esempio con un altro exchange (richiede chiavi API configurate e testnet supportata da CCXT)
    # try:
    #     broker_coinbase = Broker('binance', testnet=True) # O testnet=False per produzione
    #     coinbase_balance = broker_coinbase.fetch_balance('USD')
    #     print(f"Saldo USD su Coinbase Pro: {coinbase_balance}")
    # except Exception as e:
    #     logger.error(f"Errore durante l'esecuzione degli esempi con Coinbase Pro: {e}")
