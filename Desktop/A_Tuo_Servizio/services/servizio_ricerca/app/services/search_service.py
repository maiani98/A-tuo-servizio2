from typing import Optional, List, Dict, Any
from opensearchpy import AsyncOpenSearch, OpenSearch # Import OpenSearch for type hinting if client is passed
from ..core.config import settings

class SearchClient:
    def __init__(self, client: Optional[AsyncOpenSearch] = None):
        if client:
            self.client = client
        else:
            # Fallback to creating a client if one is not provided
            # This is useful for standalone use or tests, but in FastAPI app, client should be managed globally.
            self.client = AsyncOpenSearch(
                hosts=[{'host': settings.OPENSEARCH_URL.split('//')[-1].split(':')[0], 
                        'port': int(settings.OPENSEARCH_URL.split(':')[-1]) if ':' in settings.OPENSEARCH_URL.split('//')[-1] else 9200}],
                http_auth=None, # Add auth if OpenSearch requires it, e.g., ('user', 'password')
                use_ssl='https' in settings.OPENSEARCH_URL.lower(),
                verify_certs=True if 'https' in settings.OPENSEARCH_URL.lower() else False, # Adjust as needed for your SSL setup
                ssl_assert_hostname=False, # Adjust as needed
                ssl_show_warn=False, # Adjust as needed
            )
            # A more robust way to parse URL:
            # from urllib.parse import urlparse
            # parsed_url = urlparse(settings.OPENSEARCH_URL)
            # self.client = AsyncOpenSearch(
            #     hosts=[{'host': parsed_url.hostname, 'port': parsed_url.port or (443 if parsed_url.scheme == 'https' else 80)}],
            #     http_auth= (parsed_url.username, parsed_url.password) if parsed_url.username and parsed_url.password else None,
            #     use_ssl=parsed_url.scheme == 'https',
            #     # ... other SSL options
            # )


    async def close(self):
        if self.client:
            await self.client.close()

    async def search_professionals(
        self, 
        index_name: str, 
        q: Optional[str] = None, 
        localita: Optional[str] = None, 
        categorie: Optional[List[str]] = None, 
        skip: int = 0, 
        limit: int = 10, 
        sort_by: Optional[str] = None,
        altri_filtri: Optional[Dict[str, Any]] = None
    ) -> dict:
        
        query_body: Dict[str, Any] = {"query": {}}
        bool_query: Dict[str, List[Dict[str, Any]]] = {"must": [], "filter": [], "should": []}

        # Query Principale
        if q:
            bool_query["must"].append({
                "multi_match": {
                    "query": q,
                    "fields": [
                        "ragione_sociale^3", 
                        "descrizione_estesa", 
                        "competenze_tags^2", 
                        "testo_portfolio_aggregato",
                        "aree_operativita_testo",
                        "certificazioni_nomi",
                        "progetti_portfolio.titolo_progetto",
                        "progetti_portfolio.descrizione_progetto",
                        "progetti_portfolio.categoria_lavoro_progetto"
                    ],
                    "fuzziness": "AUTO" # Optional: to allow for typos
                }
            })
        else:
            bool_query["must"].append({"match_all": {}})

        # Filtri
        if localita:
            # Assuming localita_principale.citta.keyword is the correct field for exact match
            # or indirizzo_sede_testo for a more general text match
            bool_query["filter"].append({
                "match": {"localita_principale.citta.keyword": localita} 
                # Or use "term" for exact keyword match: {"term": {"localita_principale.citta.keyword": localita}}
                # Or more broadly: {"match": {"indirizzo_sede_testo": localita}}
            })
        
        if categorie:
            bool_query["filter"].append({
                "terms": {"competenze_tags.keyword": categorie} # Assuming competenze_tags is indexed as keyword for exact match
                # Or "progetti_portfolio.categoria_lavoro_progetto.keyword"
            })

        if altri_filtri:
            for field, value in altri_filtri.items():
                # Simple term filter, adjust if match or other types are needed
                bool_query["filter"].append({"term": {f"{field}.keyword": value}}) # Assuming keyword subfield for exact match

        query_body["query"]["bool"] = bool_query
        
        # Paginazione
        query_body["from"] = skip
        query_body["size"] = limit

        # Ordinamento
        if sort_by:
            if sort_by == "nome_asc":
                query_body["sort"] = [{"ragione_sociale.keyword": "asc"}, "_score"]
            elif sort_by == "nome_desc":
                query_body["sort"] = [{"ragione_sociale.keyword": "desc"}, "_score"]
            # Add other sort options as needed, e.g., by data_aggiornamento
            # elif sort_by == "data_aggiornamento_desc":
            #     query_body["sort"] = [{"data_aggiornamento": "desc"}, "_score"]
            else: # Default to relevance if sort_by is unknown or "rilevanza"
                query_body["sort"] = ["_score"]
        else: # Default to relevance
            query_body["sort"] = ["_score"]
            
        # Rimuovi parti vuote di bool_query per pulizia (OpenSearch le gestisce comunque)
        if not bool_query["must"]: del bool_query["must"]
        if not bool_query["filter"]: del bool_query["filter"]
        if not bool_query["should"]: del bool_query["should"]
        if not bool_query: del query_body["query"]["bool"] # Se bool è vuoto, rimuovilo (es. match_all senza filtri)


        # Esecuzione
        # print(f"Query DSL: {query_body}") # For debugging
        try:
            response = await self.client.search(
                index=index_name, 
                body=query_body
            )
            return response
        except Exception as e:
            # Log the error e
            # print(f"OpenSearch search error: {e}")
            raise # Re-raise or handle appropriately

    async def get_suggestions(
        self, 
        index_name: str, 
        prefix: str, 
        limit: int = 5, 
        tipi: Optional[List[str]] = None # E.g., "ragione_sociale", "competenza"
    ) -> dict:
        
        # This is a simplified suggestion query.
        # For better suggestions, consider dedicated suggesters (completion, phrase)
        # or more fine-tuned multi_match with edge n-grams or search_as_you_type fields.
        
        fields_to_search = []
        if tipi:
            if "ragione_sociale" in tipi:
                fields_to_search.extend(["ragione_sociale", "ragione_sociale._2gram", "ragione_sociale._3gram"])
            if "competenza" in tipi:
                fields_to_search.extend(["competenze_tags", "competenze_tags._2gram", "competenze_tags._3gram"])
            # Add other types as needed
        
        if not fields_to_search: # Default if no tipi specified or unknown tipi
            fields_to_search = [
                "ragione_sociale", "ragione_sociale._2gram", "ragione_sociale._3gram",
                "competenze_tags", "competenze_tags._2gram", "competenze_tags._3gram"
            ]
        # Remove duplicates just in case
        fields_to_search = list(set(fields_to_search))


        query_dsl_suggerimenti = {
            "query": {
                "multi_match": {
                    "query": prefix,
                    "type": "bool_prefix", # Good for "search as you type" if fields are indexed appropriately
                    "fields": fields_to_search
                }
            },
            "size": limit,
            "_source": ["ragione_sociale", "competenze_tags"] # Restrict source fields to relevant ones for suggestions
        }
        
        # print(f"Suggestion Query DSL: {query_dsl_suggerimenti}") # For debugging
        try:
            response = await self.client.search(
                index=index_name, 
                body=query_dsl_suggerimenti
            )
            return response
        except Exception as e:
            # print(f"OpenSearch suggestion error: {e}")
            raise

# Esempio di come potrebbe essere inizializzato e usato globalmente in FastAPI (in main.py)
# search_client_instance = SearchClient()
# def get_search_client_instance():
#     return search_client_instance
# Poi nelle dipendenze FastAPI:
# from .services.search_service import get_search_client_instance, SearchClient
# search_client: SearchClient = Depends(get_search_client_instance)
