import json # Per parsare altri_filtri
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ....app.core.config import settings
from ....app.schemas import search_schemas # Importa tutti gli schemi necessari
from ....app.services.search_service import SearchClient

router = APIRouter()

# Dipendenza per ottenere SearchClient
async def get_search_client(request: Request) -> SearchClient:
    # Assumendo che il client sia memorizzato in app.state come configurato in main.py
    if not hasattr(request.app.state, 'search_client') or request.app.state.search_client is None:
        # Questo non dovrebbe accadere se startup_event in main.py funziona correttamente.
        # Potrebbe essere utile loggare un errore qui.
        raise HTTPException(status_code=503, detail="Servizio di ricerca non inizializzato correttamente.")
    return request.app.state.search_client

@router.get(
    "/professionisti/", 
    response_model=search_schemas.SearchResponse,
    summary="Ricerca professionisti nell'indice",
    description="Effettua una ricerca full-text e filtrata sull'indice dei professionisti."
)
async def search_professionisti_endpoint(
    q: Optional[str] = Query(None, description="Termine di ricerca full-text."),
    localita: Optional[str] = Query(None, description="Filtra per località (es. città)."),
    categorie: Optional[List[str]] = Query(None, description="Lista di categorie per filtrare."),
    skip: int = Query(0, alias="from", ge=0, description="Numero di risultati da saltare (paginazione)."),
    limit: int = Query(10, alias="size", ge=1, le=100, description="Numero massimo di risultati da restituire."),
    sort_by: Optional[str] = Query(None, description="Criterio di ordinamento (es. 'rilevanza', 'nome_asc', 'nome_desc')."),
    altri_filtri_str: Optional[str] = Query(None, alias="altri_filtri", description="Filtri aggiuntivi in formato stringa JSON (es. {\"campo\":\"valore\"})."),
    search_client: SearchClient = Depends(get_search_client)
):
    altri_filtri_dict: Optional[Dict[str, Any]] = None
    if altri_filtri_str:
        try:
            altri_filtri_dict = json.loads(altri_filtri_str)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Formato JSON non valido per 'altri_filtri'.")

    try:
        opensearch_response = await search_client.search_professionals(
            index_name=settings.PROFILI_INDEX_NAME,
            q=q,
            localita=localita,
            categorie=categorie,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            altri_filtri=altri_filtri_dict
        )
    except Exception as e: # Cattura eccezioni più generiche dal client OpenSearch
        # Log dell'eccezione e
        # print(f"Errore durante la ricerca: {e}") # Per debug
        raise HTTPException(status_code=503, detail="Servizio di ricerca non disponibile o errore interno.")

    total_hits = opensearch_response.get('hits', {}).get('total', {}).get('value', 0)
    items_list: List[search_schemas.SearchResultItem] = []

    for hit in opensearch_response.get('hits', {}).get('hits', []):
        source = hit.get('_source', {})
        score = hit.get('_score')

        portfolio_highlights_data = []
        raw_portfolio = source.get('progetti_portfolio', [])
        if isinstance(raw_portfolio, list): # Assicurati che sia una lista
            for proj_data in raw_portfolio[:2]: # Prendi solo i primi 2 per highlights
                if isinstance(proj_data, dict): # Assicurati che ogni progetto sia un dict
                    portfolio_highlights_data.append(
                        search_schemas.ProgettoPortfolioInSearch(
                            titolo_progetto=proj_data.get('titolo_progetto'),
                            descrizione_progetto=proj_data.get('descrizione_progetto', '')[:100] # Snippet
                        )
                    )
        
        localita_principale = source.get('localita_principale', {})
        citta = localita_principale.get('citta')
        provincia = localita_principale.get('provincia')
        localita_display = None
        if citta and provincia:
            localita_display = f"{citta} ({provincia})"
        elif citta:
            localita_display = citta
        
        # Placeholder per descrizione snippet, l'highlighting è più complesso
        desc_snippet = source.get('descrizione_estesa', '')
        if len(desc_snippet) > 200:
            desc_snippet = desc_snippet[:197] + "..."


        item = search_schemas.SearchResultItem(
            profilo_id=source.get('profilo_id'), # Assumendo che 'profilo_id' sia l'ID univoco indicizzato
            score=score,
            ragione_sociale=source.get('ragione_sociale'),
            descrizione_estesa_snippet=desc_snippet, # Sostituire con highlighting se implementato
            localita_principale_display=localita_display,
            competenze_tags=source.get('competenze_tags', []),
            foto_profilo_url=source.get('foto_profilo_url') if source.get('foto_profilo_url') else None,
            portfolio_highlights=portfolio_highlights_data
        )
        items_list.append(item)

    # Per debug o per passare al frontend come la query è stata interpretata
    query_ricevuta_debug = {
        "q": q, "localita": localita, "categorie": categorie, "skip": skip, 
        "limit": limit, "sort_by": sort_by, "altri_filtri": altri_filtri_dict
    }

    return search_schemas.SearchResponse(
        total=total_hits, 
        items=items_list,
        skip=skip,
        limit=limit,
        query_ricevuta=query_ricevuta_debug
    )


@router.get(
    "/suggerimenti/", 
    response_model=search_schemas.SuggestResponse,
    summary="Ottieni suggerimenti per la ricerca",
    description="Fornisce suggerimenti di ricerca basati su un prefisso e tipi opzionali."
)
async def get_search_suggestions(
    prefix: str = Query(..., min_length=2, max_length=50, description="Prefisso per cui ottenere suggerimenti."),
    limit_suggerimenti: int = Query(5, alias="limit", ge=1, le=10, description="Numero massimo di suggerimenti."),
    tipi: Optional[List[str]] = Query(None, alias="type", description="Tipi di suggerimenti (es. 'ragione_sociale', 'competenza')."),
    search_client: SearchClient = Depends(get_search_client)
):
    try:
        opensearch_response = await search_client.get_suggestions(
            index_name=settings.PROFILI_INDEX_NAME,
            prefix=prefix,
            limit=limit_suggerimenti,
            tipi=tipi
        )
    except Exception as e:
        # Log dell'eccezione e
        # print(f"Errore durante i suggerimenti: {e}") # Per debug
        raise HTTPException(status_code=503, detail="Servizio di suggerimenti non disponibile o errore interno.")

    suggerimenti_list: List[search_schemas.SuggestionItem] = []
    
    # La logica di estrazione dei suggerimenti dipende da come get_suggestions e OpenSearch sono configurati.
    # Se get_suggestions usa _source e restituisce hits standard:
    for hit in opensearch_response.get('hits', {}).get('hits', []):
        source = hit.get('_source', {})
        text_suggestion = None
        suggestion_type = "generico" # Default type

        # Determina il testo e il tipo del suggerimento in base ai campi presenti
        # Questa logica potrebbe essere migliorata se l'indice ha un campo dedicato ai suggerimenti
        if 'ragione_sociale' in source and prefix.lower() in source['ragione_sociale'].lower():
            text_suggestion = source['ragione_sociale']
            suggestion_type = "professionista"
        elif 'competenze_tags' in source:
            # Cerca il tag che matcha il prefisso (semplificato)
            matching_tag = next((tag for tag in source['competenze_tags'] if prefix.lower() in tag.lower()), None)
            if matching_tag:
                text_suggestion = matching_tag
                suggestion_type = "competenza"
        
        if text_suggestion and not any(s.text == text_suggestion for s in suggerimenti_list): # Evita duplicati semplici
             suggerimenti_list.append(search_schemas.SuggestionItem(text=text_suggestion, type=suggestion_type))

    # Se non ci sono suggerimenti specifici dai campi, ma ci sono hits,
    # potremmo usare un approccio più generico o non aggiungere nulla.
    # Per ora, ci si basa sull'estrazione sopra.

    # Limita il numero di suggerimenti se la logica sopra ne produce troppi (improbabile con _source limitato)
    suggerimenti_list = suggerimenti_list[:limit_suggerimenti]

    return search_schemas.SuggestResponse(suggerimenti=suggerimenti_list)
