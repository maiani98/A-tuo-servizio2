import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

# Importa l'app FastAPI e gli schemi necessari
from ....app.main import app
from ....app.schemas import search_schemas
from ....app.services.search_service import SearchClient # Importa la classe effettiva per il type hinting del mock

# ----- Fixture per Mockare SearchClient -----
@pytest.fixture
def mock_search_client_fixture():
    """
    Crea un mock di SearchClient con metodi AsyncMock.
    Questo mock verrà usato per sostituire l'istanza reale di SearchClient.
    """
    mock_client = AsyncMock(spec=SearchClient) # spec=SearchClient assicura che il mock abbia gli stessi metodi

    # Configura il valore di ritorno default per search_professionals
    mock_client.search_professionals = AsyncMock(return_value={
        "hits": {
            "total": {"value": 1, "relation": "eq"},
            "hits": [{
                "_score": 1.0,
                "_source": {
                    "profilo_id": 1, 
                    "ragione_sociale": "Mocked User",
                    "descrizione_estesa": "Una descrizione mockata.",
                    "localita_principale": {"citta": "Mockville", "provincia": "MK"},
                    "competenze_tags": ["mocking", "python"],
                    "progetti_portfolio": [
                        {"titolo_progetto": "Progetto Mock 1", "descrizione_progetto": "Desc mock 1"},
                        {"titolo_progetto": "Progetto Mock 2", "descrizione_progetto": "Desc mock 2"}
                    ],
                    "foto_profilo_url": "http://example.com/mock.jpg"
                }
            }]
        }
    })

    # Configura il valore di ritorno default per get_suggestions
    mock_client.get_suggestions = AsyncMock(return_value={
        "hits": {
            "total": {"value": 1, "relation": "eq"},
            "hits": [{
                "_source": {"ragione_sociale": "Mocked Suggestion One"}
            },{
                "_source": {"competenze_tags": ["Mocked Skill Suggestion"]}
            }]
        }
    })
    
    mock_client.close = AsyncMock() # Assicurati che anche close sia mockato se chiamato

    return mock_client


@pytest.fixture
def client_with_mocked_search(mock_search_client_fixture: AsyncMock):
    """
    Fixture che fornisce un TestClient FastAPI dove SearchClient è stato mockato.
    Questo sovrascrive la dipendenza get_search_client per restituire il mock.
    """
    # Importa la dipendenza effettiva che vuoi sovrascrivere
    from ....app.api.v1.endpoints.ricerca import get_search_client

    # Funzione che sovrascrive la dipendenza e restituisce il mock
    def override_get_search_client():
        return mock_search_client_fixture

    # Applica l'override della dipendenza
    app.dependency_overrides[get_search_client] = override_get_search_client
    
    with TestClient(app) as test_client:
        yield test_client # Il TestClient usa l'app con la dipendenza mockata
    
    # Pulisci l'override dopo il test per non influenzare altri test (se l'app è condivisa)
    del app.dependency_overrides[get_search_client]


# ----- Inizio dei Test API -----

# Test per GET /api/v1/ricerca/professionisti/

@pytest.mark.asyncio
async def test_search_professionisti_basic_query(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    response = client_with_mocked_search.get("/api/v1/ricerca/professionisti/?q=testquery")
    
    assert response.status_code == 200
    mock_search_client_fixture.search_professionals.assert_called_once()
    # Verifica alcuni degli argomenti passati al metodo mockato
    call_args = mock_search_client_fixture.search_professionals.call_args[1] # kwargs
    assert call_args['q'] == "testquery"
    assert call_args['index_name'] == "indice_professionisti" # Verifica che usi l'indice corretto da settings
    
    json_response = response.json()
    assert json_response["total"] == 1
    assert len(json_response["items"]) == 1
    assert json_response["items"][0]["ragione_sociale"] == "Mocked User"
    assert json_response["items"][0]["localita_principale_display"] == "Mockville (MK)"
    assert "mocking" in json_response["items"][0]["competenze_tags"]
    assert len(json_response["items"][0]["portfolio_highlights"]) == 2
    assert json_response["items"][0]["portfolio_highlights"][0]["titolo_progetto"] == "Progetto Mock 1"


@pytest.mark.asyncio
async def test_search_professionisti_with_filters_and_pagination(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    # Resetta il mock per un nuovo test (se necessario, o usa parametri diversi)
    mock_search_client_fixture.search_professionals.reset_mock()
    
    response = client_with_mocked_search.get(
        "/api/v1/ricerca/professionisti/",
        params={
            "q": "developer",
            "localita": "Roma",
            "categorie": ["python", "fastapi"],
            "from": 10, # alias per skip
            "size": 20, # alias per limit
            "sort_by": "nome_asc",
            "altri_filtri": "{\"settore_esperienza.keyword\":\"Tech\"}"
        }
    )
    
    assert response.status_code == 200
    mock_search_client_fixture.search_professionals.assert_called_once()
    call_args = mock_search_client_fixture.search_professionals.call_args[1]
    
    assert call_args['q'] == "developer"
    assert call_args['localita'] == "Roma"
    assert call_args['categorie'] == ["python", "fastapi"]
    assert call_args['skip'] == 10
    assert call_args['limit'] == 20
    assert call_args['sort_by'] == "nome_asc"
    assert call_args['altri_filtri'] == {"settore_esperienza.keyword": "Tech"}
    
    # La risposta JSON sarà basata sul mock_search_client_fixture.search_professionals.return_value
    # che è stato impostato nella fixture. Se si vuole testare con risposte diverse,
    # si può riconfigurare il return_value del mock prima della chiamata API nel test specifico.
    # Esempio:
    # mock_search_client_fixture.search_professionals.return_value = specific_test_response


@pytest.mark.asyncio
async def test_search_professionisti_service_unavailable(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    mock_search_client_fixture.search_professionals.side_effect = Exception("OpenSearch down")
    
    response = client_with_mocked_search.get("/api/v1/ricerca/professionisti/?q=error")
    
    assert response.status_code == 503
    assert "Servizio di ricerca non disponibile o errore interno" in response.json()["detail"]


@pytest.mark.asyncio
async def test_search_professionisti_invalid_altri_filtri_json(
    client_with_mocked_search: TestClient,
    mock_search_client_fixture: AsyncMock
):
    response = client_with_mocked_search.get(
        "/api/v1/ricerca/professionisti/",
        params={"altri_filtri": "this is not json"}
    )
    assert response.status_code == 400
    assert "Formato JSON non valido per 'altri_filtri'" in response.json()["detail"]
    mock_search_client_fixture.search_professionals.assert_not_called()


# Test per GET /api/v1/ricerca/suggerimenti/

@pytest.mark.asyncio
async def test_get_suggerimenti_basic(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    response = client_with_mocked_search.get("/api/v1/ricerca/suggerimenti/?prefix=test&limit=3")
    
    assert response.status_code == 200
    mock_search_client_fixture.get_suggestions.assert_called_once_with(
        index_name="indice_professionisti",
        prefix="test",
        limit=3,
        tipi=None # Default se non specificato
    )
    
    json_response = response.json()
    assert "suggerimenti" in json_response
    assert len(json_response["suggerimenti"]) <= 3 # La logica di mapping potrebbe filtrare ulteriormente
    # Verifiche più specifiche sul mapping:
    # Assumendo che il mock restituisca i due hits definiti nella fixture:
    # Uno con ragione_sociale, uno con competenze_tags
    # La logica di mapping in ricerca.py estrae questi.
    texts = [s["text"] for s in json_response["suggerimenti"]]
    assert "Mocked Suggestion One" in texts
    assert "Mocked Skill Suggestion" in texts


@pytest.mark.asyncio
async def test_get_suggerimenti_with_type_filter(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    # Configura il mock per restituire qualcosa di specifico per questo test se necessario
    # mock_search_client_fixture.get_suggestions.return_value = ... 
    
    response = client_with_mocked_search.get(
        "/api/v1/ricerca/suggerimenti/",
        params={"prefix": "dev", "limit": 5, "type": ["competenza", "ragione_sociale"]}
    )
    
    assert response.status_code == 200
    mock_search_client_fixture.get_suggestions.assert_called_once()
    call_args = mock_search_client_fixture.get_suggestions.call_args[1]
    assert call_args['prefix'] == "dev"
    assert call_args['tipi'] == ["competenza", "ragione_sociale"]


@pytest.mark.asyncio
async def test_get_suggerimenti_service_unavailable(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    mock_search_client_fixture.get_suggestions.side_effect = Exception("OpenSearch suggestions down")
    
    response = client_with_mocked_search.get("/api/v1/ricerca/suggerimenti/?prefix=error")
    
    assert response.status_code == 503
    assert "Servizio di suggerimenti non disponibile o errore interno" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_suggerimenti_prefix_too_short_validation(
    client_with_mocked_search: TestClient
):
    # Il Query param 'prefix' ha min_length=2
    response = client_with_mocked_search.get("/api/v1/ricerca/suggerimenti/?prefix=a")
    assert response.status_code == 422 # Errore di validazione FastAPI


# Esempio di test per verificare il mapping dettagliato di un item di ricerca
@pytest.mark.asyncio
async def test_search_professionisti_response_mapping_detail(
    client_with_mocked_search: TestClient, 
    mock_search_client_fixture: AsyncMock
):
    # Configura una risposta mock specifica per questo test
    specific_source = {
        "profilo_id": 100, 
        "ragione_sociale": "Ditta Specifica SRL",
        "descrizione_estesa": "Questa è una descrizione molto lunga che dovrebbe essere troncata per lo snippet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.",
        "localita_principale": {"citta": "Specific City", "provincia": "SP"},
        "competenze_tags": ["specific_skill", "another_skill"],
        "progetti_portfolio": [
            {"titolo_progetto": "Highlight 1", "descrizione_progetto": "Desc Highlight 1"},
            {"titolo_progetto": "Highlight 2", "descrizione_progetto": "Desc Highlight 2"},
            {"titolo_progetto": "Highlight 3", "descrizione_progetto": "Desc Highlight 3"} # Questo non dovrebbe apparire
        ],
        "foto_profilo_url": "http://example.com/specific.png"
    }
    mock_search_client_fixture.search_professionals.return_value = {
        "hits": {"total": {"value": 1}, "hits": [{"_score": 2.5, "_source": specific_source}]}
    }

    response = client_with_mocked_search.get("/api/v1/ricerca/professionisti/?q=ditta")
    assert response.status_code == 200
    json_response = response.json()
    
    assert json_response["total"] == 1
    assert len(json_response["items"]) == 1
    item = json_response["items"][0]
    
    assert item["profilo_id"] == 100
    assert item["score"] == 2.5
    assert item["ragione_sociale"] == "Ditta Specifica SRL"
    assert item["descrizione_estesa_snippet"].startswith("Questa è una descrizione molto lunga")
    assert item["descrizione_estesa_snippet"].endswith("...")
    assert len(item["descrizione_estesa_snippet"]) <= 200 # "..." + 197 chars
    assert item["localita_principale_display"] == "Specific City (SP)"
    assert item["competenze_tags"] == ["specific_skill", "another_skill"]
    assert item["foto_profilo_url"] == "http://example.com/specific.png"
    assert len(item["portfolio_highlights"]) == 2 # Limitato a 2 highlights
    assert item["portfolio_highlights"][0]["titolo_progetto"] == "Highlight 1"
    assert item["portfolio_highlights"][1]["titolo_progetto"] == "Highlight 2"
    assert item["portfolio_highlights"][0]["descrizione_progetto"].startswith("Desc Highlight 1")
    assert len(item["portfolio_highlights"][0]["descrizione_progetto"]) <= 100
