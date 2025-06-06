import random
import string
from typing import Dict, Any, Optional, List
from datetime import date

from ...app.schemas import profilo_schemas, area_operativita_schemas, certificazione_schemas, disponibilita_schemas

def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))

def random_http_url() -> str:
    return f"http://{random_string(8)}.com/{random_string(5)}.jpg"

# --- Profilo Professionista ---
def create_profilo_professionista_data(
    ragione_sociale: Optional[str] = None,
    partita_iva: Optional[str] = None
) -> Dict[str, Any]:
    if ragione_sociale is None:
        ragione_sociale = f"Azienda {random_string(5)}"
    if partita_iva is None:
        partita_iva = f"{random.randint(10000000000, 99999999999)}"
        
    return {
        "ragione_sociale": ragione_sociale,
        "partita_iva": partita_iva,
        "descrizione_estesa": f"Descrizione dettagliata per {ragione_sociale}. {random_string(50)}",
        "foto_profilo_url": random_http_url(),
        "immagine_copertina_url": random_http_url(),
        "indirizzo_sede_json": {
            "via": f"Via {random_string(10)} {random.randint(1, 100)}",
            "citta": random.choice(["Milano", "Roma", "Napoli", "Torino"]),
            "cap": str(random.randint(10000, 99999)),
            "provincia": random.choice(["MI", "RM", "NA", "TO"]),
            "paese": "Italia"
        },
        "telefoni_pubblici_json": [str(random.randint(3000000000, 3999999999))],
        "sito_web": f"http://www.{ragione_sociale.lower().replace(' ', '')}.it",
        "link_social_json": {
            "facebook": f"http://facebook.com/{ragione_sociale.lower().replace(' ', '')}",
            "linkedin": f"http://linkedin.com/in/{ragione_sociale.lower().replace(' ', '')}"
        }
    }

def create_profilo_professionista_update_data() -> Dict[str, Any]:
    return {
        "descrizione_estesa": f"Nuova descrizione aggiornata. {random_string(60)}",
        "sito_web": random_http_url(),
        "telefoni_pubblici_json": [str(random.randint(3000000000, 3999999999)), str(random.randint(3000000000, 3999999999))]
    }

# --- Area Operativita ---
def create_area_operativita_data(
    tipo_area: Optional[str] = None,
    valore_area: Optional[str] = None
) -> Dict[str, str]:
    if tipo_area is None:
        tipo_area = random.choice(["Regione", "Provincia", "CAP", "RaggioKm"])
    
    if valore_area is None:
        if tipo_area == "Regione":
            valore_area = random.choice(["Lombardia", "Lazio", "Campania"])
        elif tipo_area == "Provincia":
            valore_area = random.choice(["MI", "RM", "NA"])
        elif tipo_area == "CAP":
            valore_area = str(random.randint(10000, 99999))
        elif tipo_area == "RaggioKm":
            valore_area = str(random.randint(5, 50))
        else:
            valore_area = random_string(10)
            
    return {"tipo_area": tipo_area, "valore_area": valore_area}

def create_area_operativita_update_data() -> Dict[str, str]:
    return {"valore_area": f"NuovoValore-{random_string(5)}"}

# --- Certificazione ---
def create_certificazione_data(
    nome_certificazione: Optional[str] = None
) -> Dict[str, Any]:
    if nome_certificazione is None:
        nome_certificazione = f"Certificazione {random_string(6)}"
    
    return {
        "nome_certificazione": nome_certificazione,
        "ente_rilasciante": f"Ente {random_string(4)}",
        "data_conseguimento": date(random.randint(2015, 2023), random.randint(1, 12), random.randint(1, 28)).isoformat(),
        "documento_url": random_http_url()
    }

def create_certificazione_update_data() -> Dict[str, Any]:
    return {
        "ente_rilasciante": f"Nuovo Ente Aggiornato {random_string(3)}",
        "documento_url": random_http_url()
    }

# --- Disponibilita Generale ---
def create_disponibilita_data() -> Dict[str, Any]:
    giorni = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"]
    return {
        "giorni_lavorativi_json": random.sample(giorni, k=random.randint(3, 5)),
        "orari_json": [
            {"giorno": "Lunedì", "dalle": "09:00", "alle": "13:00"},
            {"giorno": "Lunedì", "dalle": "14:00", "alle": "18:00"},
            {"giorno": "Mercoledì", "dalle": "09:00", "alle": "17:00"}
        ],
        "note": f"Note sulla disponibilità: {random_string(30)}"
    }

def create_disponibilita_update_data() -> Dict[str, Any]:
    return {
        "orari_json": [
            {"giorno": "Sabato", "dalle": "10:00", "alle": "13:00"} # Aggiorna orari
        ],
        "note": f"Disponibilità aggiornata. {random_string(25)}"
    }
