from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl

# --- Schemi per la Ricerca Professionisti ---

class ProgettoPortfolioInSearch(BaseModel):
    """Rappresentazione semplificata di un progetto portfolio nei risultati di ricerca."""
    titolo_progetto: Optional[str] = None
    descrizione_progetto: Optional[str] = None # Snippet o descrizione breve
    # media_principale_url: Optional[HttpUrl] = None # Se si indicizza l'URL dell'immagine principale

class LocalitaPrincipaleInSearch(BaseModel):
    citta: Optional[str] = None
    provincia: Optional[str] = None
    # regione: Optional[str] = None # Se indicizzato

class SearchResultItem(BaseModel):
    """Singolo item nei risultati della ricerca professionisti."""
    profilo_id: int # Corrisponde a user_id nel Servizio Utenti, o a profilo_id in Servizio Profili
    score: Optional[float] = None # Punteggio di rilevanza da OpenSearch

    ragione_sociale: Optional[str] = None
    descrizione_estesa_snippet: Optional[str] = None # Snippet o breve descrizione
    
    # Campi per visualizzazione e filtri
    localita_principale_display: Optional[str] = None # Es. "Milano (MI)"
    competenze_tags: Optional[List[str]] = [] # Lista di competenze/tag
    foto_profilo_url: Optional[HttpUrl] = None
    
    # Dettagli aggiuntivi (opzionali, in base a cosa si indicizza e si vuole esporre)
    # media_recensioni_avg: Optional[float] = None
    # numero_recensioni: Optional[int] = 0
    # tipo_utente: Optional[str] = "professionista" # Generalmente fisso in questo indice

    # Portfolio highlights (esempi di progetti)
    portfolio_highlights: List[ProgettoPortfolioInSearch] = []

class SearchResponse(BaseModel):
    """Risposta completa della ricerca professionisti."""
    total: int
    items: List[SearchResultItem]
    
    # Info sulla query per debug o frontend
    query_ricevuta: Optional[Dict[str, Any]] = None 
    skip: Optional[int] = None
    limit: Optional[int] = None


# --- Schemi per i Suggerimenti di Ricerca ---

class SuggestionItem(BaseModel):
    """Singolo item nei suggerimenti di ricerca."""
    text: str # Il testo del suggerimento
    type: Optional[str] = None # Es. "ragione_sociale", "competenza", "localita"
    # additional_info: Optional[Dict[str, Any]] = None # Eventuali info aggiuntive

class SuggestResponse(BaseModel):
    """Risposta completa per i suggerimenti di ricerca."""
    suggerimenti: List[SuggestionItem]


# --- Schema per l'Input della Query (non strettamente necessario se si usano Query params) ---
# Ma utile se si volesse passare un body JSON per la ricerca
class SearchQueryInput(BaseModel):
    q: Optional[str] = None
    localita: Optional[str] = None
    categorie: Optional[List[str]] = None
    skip: int = 0
    limit: int = 10
    sort_by: Optional[str] = None
    altri_filtri: Optional[Dict[str, Any]] = None
