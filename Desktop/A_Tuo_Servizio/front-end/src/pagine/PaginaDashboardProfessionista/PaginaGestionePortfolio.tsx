import React, { useState, useEffect } from 'react'; // Importa useEffect
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import styles from './PaginaGestionePortfolio.module.css'; // Verifica che il file sia nella stessa directory
import apiClient from '../../servizi/apiClient'; // Importa apiClient
import axios from 'axios'; // Importa axios per FormData

// Assumiamo che ProgettoPortfolioDati sia già definito in PaginaProfiloProfessionista.tsx o in un file di tipi globale
// Per ora lo ridefiniamo qui per semplicità, ma andrebbe centralizzato.
export interface ProgettoPortfolioDati {
  id?: number; // Cambiato in number per corrispondere al backend
  titolo: string;
  descrizione_breve: string; // Aggiornato per corrispondere allo schema backend
  descrizione_dettagliata?: string; // Aggiornato per corrispondere allo schema backend
  media?: MediaProgettoDati[]; // Aggiunto campo media
  video_url?: string; // Aggiornato per corrispondere allo schema backend
  categoria?: string;
  tags?: string[]; // Array di stringhe per i tag
}

// Nuovo tipo per i dati media come atteso dal frontend dopo l'upload o dal backend
export interface MediaProgettoDati {
  id?: number; // Opzionale per nuovi media
  url: string; // URL del media caricato
  tipo: 'immagine' | 'video'; // Tipo di media
  ordine: number; // Ordine di visualizzazione
  is_immagine_principale: boolean; // Indica se è l'immagine principale
}

const PaginaGestionePortfolio: React.FC = () => {
  const [progetti, setProgetti] = useState<ProgettoPortfolioDati[]>([]); // Qui verranno caricati i progetti esistenti
  const [mostraForm, setMostraForm] = useState(false);
  const [progettoInModifica, setProgettoInModifica] = useState<ProgettoPortfolioDati | null>(null);
  const [caricamento, setCaricamento] = useState(false); // Stato per indicatore di caricamento
  const [errore, setErrore] = useState<string | null>(null); // Stato per messaggi di errore

  // Stati per il form di aggiunta/modifica progetto
  const [titolo, setTitolo] = useState('');
  const [descrizioneBreve, setDescrizioneBreve] = useState('');
  const [descrizioneDettagliata, setDescrizioneDettagliata] = useState('');
  const [immaginePrincipaleFile, setImmaginePrincipaleFile] = useState<File | null>(null); // File selezionato per upload
  const [immaginePrincipaleUrlEsistente, setImmaginePrincipaleUrlEsistente] = useState<string | null>(null); // URL immagine principale esistente (per modifica)
  const [nomeImmaginePrincipale, setNomeImmaginePrincipale] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tags, setTags] = useState(''); // Stringa di tag separati da virgola

  // TODO: Gestire upload e visualizzazione di immagini aggiuntive

  const handleFileChangeImmaginePrincipale = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImmaginePrincipaleFile(e.target.files[0]);
      setNomeImmaginePrincipale(e.target.files[0].name);
      setImmaginePrincipaleUrlEsistente(null); // Rimuovi URL esistente se ne carichi uno nuovo
    } else {
      setImmaginePrincipaleFile(null);
      setNomeImmaginePrincipale('');
    }
  };

  const resetForm = () => {
    setTitolo('');
    setDescrizioneBreve('');
    setDescrizioneDettagliata('');
    setImmaginePrincipaleFile(null);
    setImmaginePrincipaleUrlEsistente(null);
    setNomeImmaginePrincipale('');
    setVideoUrl('');
    setCategoria('');
    setTags('');
    setProgettoInModifica(null);
    setErrore(null); // Resetta errore
  };

  // Funzione per caricare i progetti esistenti
  const caricaProgetti = async () => {
    setCaricamento(true);
    setErrore(null);
    try {
      // TODO: Ottenere l'ID del profilo professionista autenticato
      // Per ora, assumiamo un placeholder o che l'API gestisca l'utente autenticato
      const response = await apiClient.get<ProgettoPortfolioDati[]>('/api/v1/profili/me/portfolio/progetti/');
      setProgetti(response.data);
    } catch (err) {
      console.error('Errore nel caricamento dei progetti:', err);
      // TODO: Gestire errori specifici (es. 404 se nessun progetto) e mostrare un messaggio più amichevole
      setErrore('Impossibile caricare i progetti. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Carica i progetti all'avvio della pagina
  useEffect(() => {
    caricaProgetti();
  }, []); // Dipendenza vuota per eseguire solo al mount

  // Funzione per gestire l'upload di un singolo file media
  const uploadMedia = async (file: File, progettoId?: number, isImmaginePrincipale: boolean = false): Promise<MediaProgettoDati> => {
    // Crea un FormData per l'upload del file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo_media', file.type.startsWith('image/') ? 'immagine' : 'video');
    formData.append('is_immagine_principale', isImmaginePrincipale.toString());
    formData.append('ordine', isImmaginePrincipale ? '1' : '0');
    
    if (progettoId) {
      // Se abbiamo già un ID progetto (modifica), lo usiamo direttamente
      formData.append('progetto_id', progettoId.toString());
      
      try {
        const response = await apiClient.post('/api/v1/profili/me/portfolio/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data as MediaProgettoDati;
      } catch (error) {
        console.error('Errore durante l\'upload del media:', error);
        throw new Error('Errore durante l\'upload del file.');
      }
    } else {
      // Se non abbiamo un ID progetto (nuovo progetto), dobbiamo simulare l'upload
      // e restituire un oggetto MediaProgettoDati temporaneo che verrà associato al progetto
      // quando verrà creato
      console.log(`Upload temporaneo per nuovo progetto: ${file.name}`);
      
      // Crea un oggetto Blob dall'immagine per creare un URL temporaneo
      const blobUrl = URL.createObjectURL(file);
      
      // Restituisci un oggetto MediaProgettoDati temporaneo
      return {
        url: blobUrl,
        tipo: file.type.startsWith('image/') ? 'immagine' : 'video',
        ordine: isImmaginePrincipale ? 1 : 0,
        is_immagine_principale: isImmaginePrincipale
      };
    }
  };

  const handleSubmitProgetto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCaricamento(true);
    setErrore(null);

    // Validazione base
    if (!titolo || !descrizioneBreve) {
      setErrore('Titolo e descrizione breve sono obbligatori.');
      setCaricamento(false);
      return;
    }

    // Validazione immagine principale
    if (!progettoInModifica && !immaginePrincipaleFile) {
      setErrore("L'immagine principale è obbligatoria per un nuovo progetto.");
      setCaricamento(false);
      return;
    }
    if (progettoInModifica && !immaginePrincipaleUrlEsistente && !immaginePrincipaleFile) {
      setErrore("È richiesta un'immagine principale per salvare le modifiche.");
      setCaricamento(false);
      return;
    }

    let mediaPrincipaleCaricato: MediaProgettoDati | undefined;
    let mediaPayload: MediaProgettoDati[] = [];

    try {
      // Se stiamo modificando un progetto esistente
      if (progettoInModifica) {
        // 1. Gestione e Upload dell'immagine principale (se nuova)
        if (immaginePrincipaleFile) {
          // Carica l'immagine principale e associala al progetto esistente
          mediaPrincipaleCaricato = await uploadMedia(
            immaginePrincipaleFile, 
            progettoInModifica.id, 
            true // È l'immagine principale
          );
          mediaPayload.push(mediaPrincipaleCaricato);
        } else if (immaginePrincipaleUrlEsistente) {
          // Se non carichiamo un nuovo file ma c'è un URL esistente
          if (progettoInModifica?.media) {
            const mediaEsistente = progettoInModifica.media.find(m => m.is_immagine_principale);
            if (mediaEsistente) {
              mediaPayload.push({...mediaEsistente, is_immagine_principale: true, ordine: 1});
            } else if (immaginePrincipaleUrlEsistente) {
              console.warn("Immagine principale esistente non trovata nei media del progetto. Usando placeholder.");
              mediaPayload.push({
                url: immaginePrincipaleUrlEsistente,
                tipo: 'immagine',
                ordine: 1,
                is_immagine_principale: true,
              });
            }
          }
        }

        // Includi i media aggiuntivi esistenti
        if (progettoInModifica?.media) {
          progettoInModifica.media.forEach(m => {
            if (!m.is_immagine_principale && (!mediaPrincipaleCaricato || mediaPrincipaleCaricato.id !== m.id)) {
              mediaPayload.push(m);
            }
          });
        }

        // 2. Costruzione del payload per l'aggiornamento del progetto
        const datiProgettoPerAPI = {
          titolo: titolo,
          descrizione_breve: descrizioneBreve,
          descrizione_dettagliata: descrizioneDettagliata || null,
          video_url: videoUrl || null,
          categoria: categoria || null,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          media: mediaPayload,
        };

        // 3. Aggiornamento del progetto
        const response = await apiClient.put<ProgettoPortfolioDati>(
          `/api/v1/profili/me/portfolio/progetti/${progettoInModifica.id}/`, 
          datiProgettoPerAPI
        );
        console.log('Risposta API aggiornamento progetto:', response.data);
        setProgetti(progetti.map(p => p.id === response.data.id ? response.data : p));
      } else {
        // Nuovo progetto
        // 1. Prepara l'immagine principale (senza caricarla ancora)
        if (immaginePrincipaleFile) {
          // Crea un oggetto MediaProgettoDati temporaneo
          mediaPrincipaleCaricato = await uploadMedia(
            immaginePrincipaleFile, 
            undefined, // Nessun ID progetto ancora
            true // È l'immagine principale
          );
          mediaPayload.push(mediaPrincipaleCaricato);
        }

        // 2. Costruzione del payload per la creazione del progetto
        const datiProgettoPerAPI = {
          titolo: titolo,
          descrizione_breve: descrizioneBreve,
          descrizione_dettagliata: descrizioneDettagliata || null,
          video_url: videoUrl || null,
          categoria: categoria || null,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          // Non includiamo i media qui, li caricheremo dopo aver creato il progetto
        };

        // 3. Creazione del progetto
        const response = await apiClient.post<ProgettoPortfolioDati>(
          '/api/v1/profili/me/portfolio/progetti/', 
          datiProgettoPerAPI
        );
        console.log('Risposta API creazione progetto:', response.data);
        
        // 4. Ora che abbiamo l'ID del progetto, carichiamo l'immagine principale
        if (immaginePrincipaleFile && response.data.id) {
          const formData = new FormData();
          formData.append('file', immaginePrincipaleFile);
          formData.append('progetto_id', response.data.id.toString());
          formData.append('tipo_media', 'immagine');
          formData.append('is_immagine_principale', 'true');
          formData.append('ordine', '1');
          
          const mediaResponse = await apiClient.post(
            '/api/v1/profili/me/portfolio/upload/', 
            formData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          console.log('Media caricato:', mediaResponse.data);
          
          // Aggiorna il progetto con il media caricato
          response.data.media = [mediaResponse.data];
        }
        
        // Aggiungi il nuovo progetto alla lista locale
        setProgetti([...progetti, response.data]);
      }

      // Successo
      resetForm();
      setMostraForm(false);
      // Mostra notifica di successo
      alert(progettoInModifica ? 'Progetto aggiornato con successo!' : 'Nuovo progetto creato con successo!');

    } catch (error) {
      console.error('Errore durante il salvataggio del progetto:', error);
      setErrore('Errore durante il salvataggio del progetto. Riprova.');
    } finally {
      setCaricamento(false);
    }
  };

  // Funzione per gestire la modifica di un progetto esistente
  const handleModifica = (progetto: ProgettoPortfolioDati) => {
    setProgettoInModifica(progetto);
    setTitolo(progetto.titolo);
    setDescrizioneBreve(progetto.descrizione_breve);
    setDescrizioneDettagliata(progetto.descrizione_dettagliata || '');
    // Trova l'URL dell'immagine principale esistente
    const immaginePrincipaleEsistente = progetto.media?.find(m => m.is_immagine_principale);
    setImmaginePrincipaleUrlEsistente(immaginePrincipaleEsistente?.url || null);
    setImmaginePrincipaleFile(null); // Assicurati che il file input sia resettato
    setNomeImmaginePrincipale('');
    setVideoUrl(progetto.video_url || '');
    setCategoria(progetto.categoria || '');
    setTags(progetto.tags?.join(', ') || '');
    setMostraForm(true);
  };

  // Funzione per gestire l'eliminazione di un progetto
  const handleElimina = async (progettoId: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto?')) {
      setCaricamento(true);
      setErrore(null);
      try {
        // TODO: Ottenere l'ID del profilo professionista autenticato
        await apiClient.delete(`/api/v1/profili/me/portfolio/progetti/${progettoId}/`);
        console.log('Progetto eliminato:', progettoId);
        // Rimuovi il progetto dalla lista locale
        setProgetti(progetti.filter(p => p.id !== progettoId));
        // TODO: Mostrare notifica di successo
      } catch (error) {
        console.error("Errore durante l'eliminazione del progetto:", error);
        // TODO: Gestire errori specifici
        setErrore("Errore durante l'eliminazione del progetto. Riprova.");
      } finally {
        setCaricamento(false);
      }
    }
  };

  return (
    <div className={styles.contenitoreGestionePortfolio}>
      <div className={styles.headerPagina}>
        <Titolo livello={2}>Gestione Portfolio</Titolo>
        <Bottone onClick={() => { setMostraForm(true); resetForm(); }}>
          Aggiungi Nuovo Progetto
        </Bottone>
      </div>

      {caricamento && <Paragrafo>Caricamento...</Paragrafo>}
      {errore && <Paragrafo className={styles.messaggioErrore}>{errore}</Paragrafo>}

      {/* Modale/Form per Aggiungere/Modificare Progetto */}
      {mostraForm && (
        <div className={styles.overlayForm}> {/* Simula un modale o un'area form dedicata */}
          <div className={styles.formProgettoContenitore}>
            <Titolo livello={3} className={styles.titoloCardProgetto}>{progetto.titolo}</Titolo>
            <form onSubmit={handleSubmitProgetto}>
              <CampoTesto etichetta="Titolo del Progetto" value={titolo} onChange={e => setTitolo(e.target.value)} required />
              <CampoTesto etichetta="Descrizione Breve (max 150 caratteri)" value={descrizioneBreve} onChange={e => setDescrizioneBreve(e.target.value)} required maxLength={150} />

              <div>
                <label htmlFor="descrizioneDettagliata" className={styles.etichettaTextarea}>Descrizione Dettagliata (Opzionale)</label>
                <textarea id="descrizioneDettagliata" value={descrizioneDettagliata} onChange={e => setDescrizioneDettagliata(e.target.value)} rows={5} className={styles.textareaInput}/>
              </div>

              <CampoTesto
                etichetta="Immagine Principale"
                type="file"
                onChange={handleFileChangeImmaginePrincipale}
                accept="image/*"
                required={!progettoInModifica && !immaginePrincipaleUrlEsistente} // Richiesto solo se è un nuovo progetto E non c'è URL esistente
              />
              {nomeImmaginePrincipale && <Paragrafo className={styles.infoFile}>Selezionato: {nomeImmaginePrincipale}</Paragrafo>}
              {immaginePrincipaleUrlEsistente && !immaginePrincipaleFile && <Paragrafo className={styles.infoFile}>Immagine attuale: <a href={immaginePrincipaleUrlEsistente} target="_blank" rel="noopener noreferrer">{immaginePrincipaleUrlEsistente}</a></Paragrafo>}

              {/* <CampoTesto etichetta="Immagini Aggiuntive (max 4, Opzionale)" type="file" multiple /> */}
              <CampoTesto etichetta="Link Video (YouTube, Vimeo, Opzionale)" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
              <CampoTesto etichetta="Categoria (Opzionale)" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Es. Ristrutturazioni, Impianti Elettrici" />
              <CampoTesto etichetta="Tags (separati da virgola, Opzionale)" value={tags} onChange={e => setTags(e.target.value)} placeholder="Es. bagno, cucina, led, certificato" />

              <div className={styles.bottoniForm}>
                <Bottone type="submit" variante="primario" disabled={caricamento}>{progettoInModifica ? 'Salva Modifiche' : 'Aggiungi Progetto'}</Bottone>
                <Bottone type="button" variante="secondario" onClick={() => { setMostraForm(false); resetForm(); }} disabled={caricamento}>Annulla</Bottone>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elenco dei Progetti Esistenti */}
      <div className={styles.elencoProgetti}>
        {progetti.length === 0 && !mostraForm && !caricamento && !errore && (
          <Paragrafo>Nessun progetto presente nel tuo portfolio. Inizia aggiungendone uno!</Paragrafo>
        )}
        {/* Qui verranno mappati i progetti esistenti in card o righe */}
        {progetti.map(progetto => (
          <div key={progetto.id} className={styles.cardProgetto}>
            {/* TODO: Visualizzare l'immagine principale correttamente */}
            {/* L'immagine principale dovrebbe essere cercata nell'array media del progetto */}
            {progetto.media?.find(m => m.is_immagine_principale)?.url ? (
                <img src={progetto.media.find(m => m.is_immagine_principale)!.url} alt={progetto.titolo} className={styles.immagineCardProgetto} />
            ) : (
                <div className={styles.immagineCardProgettoPlaceholder}>Nessuna immagine</div>
            )}

            <div className={styles.infoCardProgetto}>
              <Titolo livello={4} className={styles.titoloCardProgetto}>{progetto.titolo}</Titolo>
              <Paragrafo className={styles.descrizioneCardProgetto}>{progetto.descrizione_breve}</Paragrafo>
            </div>
            <div className={styles.azioniCardProgetto}>
              <Bottone variante="secondario" onClick={() => handleModifica(progetto)} disabled={caricamento}>Modifica</Bottone>
              <Bottone variante="distruttivo" onClick={() => progetto.id !== undefined && handleElimina(progetto.id)} disabled={caricamento}>Elimina</Bottone>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaginaGestionePortfolio;
