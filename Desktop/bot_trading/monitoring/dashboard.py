"""Modulo per la dashboard web di monitoraggio."""
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from loguru import logger
import json
import asyncio
from typing import Dict, Any

# TODO: Integrare con i dati in tempo reale del bot (portafoglio, P&L, metriche)

app = FastAPI()

# Esempio di dati di monitoraggio (sostituire con dati reali dal bot)
monitoring_data: Dict[str, Any] = {
    "status": "Initializing",
    "portfolio_value": 0.0,
    "daily_pnl": 0.0,
    "total_pnl": 0.0,
    "positions": {},
    "metrics": {},
    "alerts": []
}

# HTML di base per la dashboard (molto semplice, da migliorare con React)
html = """
<!DOCTYPE html>
<html>
<head>
    <title>Bot Trading Dashboard</title>
</head>
<body>
    <h1>Bot Trading Dashboard</h1>
    <div id="status">Status: Initializing</div>
    <div id="portfolio">Portfolio Value: 0.0</div>
    <div id="daily_pnl">Daily P&L: 0.0</div>
    <div id="total_pnl">Total P&L: 0.0</div>
    <h2>Positions</h2>
    <ul id="positions"></ul>
    <h2>Alerts</h2>
    <ul id="alerts"></ul>

    <script>
        var ws = new WebSocket("ws://localhost:8000/ws");

        ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            document.getElementById('status').innerText = 'Status: ' + data.status;
            document.getElementById('portfolio').innerText = 'Portfolio Value: ' + data.portfolio_value.toFixed(2);
            document.getElementById('daily_pnl').innerText = 'Daily P&L: ' + data.daily_pnl.toFixed(2);
            document.getElementById('total_pnl').innerText = 'Total P&L: ' + data.total_pnl.toFixed(2);

            // Aggiorna posizioni
            var positionsList = document.getElementById('positions');
            positionsList.innerHTML = '';
            for (const [symbol, volume] of Object.entries(data.positions)) {
                const li = document.createElement('li');
                li.innerText = `${symbol}: ${volume.toFixed(4)}`;
                positionsList.appendChild(li);
            }

             // Aggiorna alerts
            var alertsList = document.getElementById('alerts');
            alertsList.innerHTML = '';
            data.alerts.forEach(alert => {
                const li = document.createElement('li');
                li.innerText = alert;
                alertsList.appendChild(li);
            });
        };

        ws.onopen = function(event) {
            console.log("WebSocket connection opened");
        };

        ws.onclose = function(event) {
            console.log("WebSocket connection closed");
        };

        ws.onerror = function(event) {
            console.error("WebSocket error observed:", event);
        };
    </script>
</body>
</html>
"""

@app.get("/")
async def get():
    return HTMLResponse(html)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")
    while True:
        # Invia i dati di monitoraggio aggiornati al client
        # TODO: Ottenere i dati reali dal bot in modo asincrono
        monitoring_data["portfolio_value"] += 1 # Esempio di aggiornamento dati
        monitoring_data["daily_pnl"] = monitoring_data["portfolio_value"] * 0.01 # Esempio
        monitoring_data["total_pnl"] = monitoring_data["portfolio_value"] - 10000 # Esempio
        monitoring_data["positions"]["BTC/USDT"] = (monitoring_data["portfolio_value"] / 50000) # Esempio
        monitoring_data["status"] = "Running" if monitoring_data["portfolio_value"] < 11000 else "Warning" # Esempio
        if monitoring_data["status"] == "Warning" and "Drawdown alert" not in monitoring_data["alerts"]:
             monitoring_data["alerts"].append("Drawdown alert")


        await websocket.send_json(monitoring_data)
        await asyncio.sleep(1) # Aggiorna ogni secondo

# Per eseguire l'applicazione FastAPI, usa un server ASGI come uvicorn:
# uvicorn monitoring.dashboard:app --reload
