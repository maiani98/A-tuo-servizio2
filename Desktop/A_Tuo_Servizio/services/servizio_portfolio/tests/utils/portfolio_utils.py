import random
import string
from typing import Dict, Any, Optional, List
from datetime import date

# Assuming schemas are in app.schemas, adjust path if needed
from ...app.schemas import progetto_schemas, media_schemas # If these exist

def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))

def random_http_url() -> str:
    return f"http://{random_string(8)}.example.com/{random_string(5)}.jpg"

# --- ProgettoPortfolio ---
def create_progetto_portfolio_data(
    titolo: Optional[str] = None,
    profilo_id: Optional[int] = None # Not strictly part of schema, but useful for context
) -> Dict[str, Any]:
    if titolo is None:
        titolo = f"Progetto {random_string(6)}"
    
    data = {
        "titolo": titolo,
        "descrizione": f"Descrizione del {titolo}. {random_string(50)}",
        "data_completamento": date(random.randint(2020, 2023), random.randint(1, 12), random.randint(1, 28)).isoformat(),
        "categoria_lavoro": random.choice(["Sviluppo Web", "Design Grafico", "Consulenza"]),
        "link_esterno": random_http_url(),
        "ordine": random.randint(0, 10)
    }
    # if profilo_id is not None: # Not part of create schema, set by API path/token
    #     data["profilo_professionista_id"] = profilo_id 
    return data

def create_progetto_portfolio_update_data() -> Dict[str, Any]:
    return {
        "descrizione": f"Descrizione aggiornata. {random_string(60)}",
        "link_esterno": random_http_url(),
        "ordine": random.randint(11, 20)
    }

# --- MediaProgetto ---
def create_media_progetto_data(
    progetto_id: Optional[int] = None # Not part of schema, for context
) -> Dict[str, Any]:
    data = {
        "tipo_media": random.choice(["immagine", "video"]),
        "media_url": random_http_url(),
        "didascalia": f"Didascalia {random_string(15)}",
        "is_immagine_principale": random.choice([True, False]),
        "ordine": random.randint(0, 5)
    }
    # if progetto_id is not None: # Not part of create schema, set by API path
    #    data["progetto_portfolio_id"] = progetto_id
    return data

def create_media_progetto_update_data() -> Dict[str, Any]:
    return {
        "didascalia": f"Didascalia aggiornata - {random_string(20)}",
        "is_immagine_principale": random.choice([True, False]), # Toggle or set
        "ordine": random.randint(6, 10)
    }
