import React, { useState } from 'react';
import styles from './GestionePortfolioPro.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface MediaItem {
  id: string;
  type: 'image' | 'video'; // Video just as placeholder type, actual handling might differ
  url: string; // For existing images/videos or preview
  file?: File; // For new uploads
  caption: string;
}

interface ProgettoPortfolio {
  id: string;
  titolo: string;
  descrizione: string;
  media: MediaItem[];
  dataCompletamento: string; // YYYY-MM-DD
  categoria: string;
}

const mockProgettiIniziali: ProgettoPortfolio[] = [
  {
    id: 'proj1',
    titolo: 'Ristrutturazione Bagno Chiavi in Mano',
    descrizione: 'Completa ristrutturazione di un bagno padronale, inclusa sostituzione sanitari, piastrelle e impianto idraulico.',
    media: [
      { id: 'media1-1', type: 'image', url: 'https://via.placeholder.com/300x200/007bff/FFFFFF?text=Bagno+Prima', caption: 'Bagno prima dei lavori' },
      { id: 'media1-2', type: 'image', url: 'https://via.placeholder.com/300x200/28a745/FFFFFF?text=Bagno+Dopo', caption: 'Bagno completato' },
    ],
    dataCompletamento: '2024-05-15',
    categoria: 'Ristrutturazioni Edili',
  },
  {
    id: 'proj2',
    titolo: 'Creazione Sito E-commerce per Negozio Locale',
    descrizione: 'Sviluppo di una piattaforma e-commerce completa con gestione catalogo, carrello e pagamenti online sicuri.',
    media: [
      { id: 'media2-1', type: 'image', url: 'https://via.placeholder.com/300x200/ffc107/000000?text=E-commerce+Home', caption: 'Homepage del sito' },
    ],
    dataCompletamento: '2024-06-20',
    categoria: 'Sviluppo Web',
  },
];

const FormProgettoPortfolio: React.FC<{
  progettoEsistente?: ProgettoPortfolio;
  onSave: (progetto: ProgettoPortfolio) => void;
  onCancel: () => void;
}> = ({ progettoEsistente, onSave, onCancel }) => {
  const [titolo, setTitolo] = useState(progettoEsistente?.titolo || '');
  const [descrizione, setDescrizione] = useState(progettoEsistente?.descrizione || '');
  const [dataCompletamento, setDataCompletamento] = useState(progettoEsistente?.dataCompletamento || '');
  const [categoria, setCategoria] = useState(progettoEsistente?.categoria || '');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(progettoEsistente?.media || []);
  // For handling new file uploads for media
  const [nuoviFileMedia, setNuoviFileMedia] = useState<File[]>([]);


  const handleAddMediaFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setNuoviFileMedia(prev => [...prev, ...filesArray]); // Store the File objects

      // Create previews (temporary)
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaItems(prevMedia => [
            ...prevMedia,
            { 
              id: `new-${Date.now()}-${Math.random()}`, // Temporary ID
              type: file.type.startsWith('image/') ? 'image' : 'video', 
              url: reader.result as string, // This is the data URL for preview
              file: file, // Keep the actual file
              caption: file.name, // Default caption
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleMediaCaptionChange = (mediaId: string, caption: string) => {
    setMediaItems(prevMedia => prevMedia.map(m => m.id === mediaId ? { ...m, caption } : m));
  };

  const handleRemoveMediaItem = (mediaId: string) => {
    setMediaItems(prevMedia => prevMedia.filter(m => m.id !== mediaId));
    // If it was a newly added file, also remove from nuoviFileMedia if needed (more complex sync)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo || !descrizione || !dataCompletamento || !categoria) {
      alert('Tutti i campi testuali sono obbligatori.');
      return;
    }
    // In a real app, new files would be uploaded here and URLs updated.
    // For mock, we'll just pass the file names or use the data URLs.
    const progettoSalvato: ProgettoPortfolio = {
      id: progettoEsistente?.id || `proj-${Date.now()}`,
      titolo,
      descrizione,
      media: mediaItems.map(m => ({ // Ensure `file` property is not passed if it's not needed for "saved" state
          id: m.id.startsWith('new-') && progettoEsistente ? `media-${Date.now()}-${Math.random()}` : m.id, // Generate new ID if it's a new item for an existing project
          type: m.type,
          url: m.file ? m.url : m.url, // if m.file exists, m.url is dataURL, else it's existing URL
          caption: m.caption,
          // file property is omitted intentionally for the "saved" state
      })),
      dataCompletamento,
      categoria,
    };
    onSave(progettoSalvato);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formProgetto}>
      <Titolo livello={4}>{progettoEsistente ? 'Modifica Progetto' : 'Aggiungi Nuovo Progetto'}</Titolo>
      <CampoTesto etichetta="Titolo Progetto" value={titolo} onChange={e => setTitolo(e.target.value)} required />
      <div>
        <label htmlFor="descrizioneProgetto" className={styles.labelForm}>Descrizione</label>
        <textarea id="descrizioneProgetto" value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={4} required className={styles.textareaForm} />
      </div>
      <CampoTesto etichetta="Data Completamento" type="date" value={dataCompletamento} onChange={e => setDataCompletamento(e.target.value)} required />
      <CampoTesto etichetta="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Es. Ristrutturazioni, Sviluppo Web, Design Grafico" required />
      
      <div className={styles.sezioneMedia}>
        <label className={styles.labelForm}>Immagini/Video del Progetto</label>
        <input type="file" multiple accept="image/*,video/*" onChange={handleAddMediaFile} className={styles.inputFile} />
        <div className={styles.galleriaPreview}>
          {mediaItems.map(item => (
            <div key={item.id} className={styles.mediaItemPreview}>
              {item.type === 'image' ? (
                <img src={item.url} alt={item.caption || 'Anteprima media'} />
              ) : (
                <video src={item.url} controls width="150" /> // Basic video preview
              )}
              <input 
                type="text" 
                value={item.caption} 
                onChange={(e) => handleMediaCaptionChange(item.id, e.target.value)}
                placeholder="Didascalia (opzionale)"
                className={styles.didascaliaInput}
              />
              <Bottone type="button" onClick={() => handleRemoveMediaItem(item.id)} piccola variante="pericolo" outline>Rimuovi</Bottone>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.azioniFormProgetto}>
        <Bottone type="submit" variante="primario">{progettoEsistente ? 'Salva Modifiche' : 'Aggiungi Progetto'}</Bottone>
        <Bottone type="button" onClick={onCancel} variante="secondario">Annulla</Bottone>
      </div>
    </form>
  );
};


const GestionePortfolioPro: React.FC = () => {
  const [progetti, setProgetti] = useState<ProgettoPortfolio[]>(mockProgettiIniziali);
  const [showForm, setShowForm] = useState(false);
  const [progettoInModifica, setProgettoInModifica] = useState<ProgettoPortfolio | undefined>(undefined);

  const handleAggiungiClick = () => {
    setProgettoInModifica(undefined);
    setShowForm(true);
  };

  const handleModificaClick = (progetto: ProgettoPortfolio) => {
    setProgettoInModifica(progetto);
    setShowForm(true);
  };

  const handleEliminaClick = (idProgetto: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto dal portfolio?')) {
      setProgetti(prev => prev.filter(p => p.id !== idProgetto));
      console.log(`Progetto ${idProgetto} eliminato (simulazione)`);
    }
  };

  const handleSaveProgetto = (progetto: ProgettoPortfolio) => {
    setProgetti(prev => {
      const index = prev.findIndex(p => p.id === progetto.id);
      if (index > -1) { // Modifica
        const updated = [...prev];
        updated[index] = progetto;
        return updated;
      } else { // Aggiunta
        return [...prev, progetto];
      }
    });
    console.log('Progetto salvato (simulazione):', progetto);
    setShowForm(false);
    setProgettoInModifica(undefined);
  };

  return (
    <div className={styles.containerPortfolio}>
      <div className={styles.headerSezionePortfolio}>
        <Titolo livello={3} className={styles.titoloSezione}>Gestisci il Tuo Portfolio</Titolo>
        {!showForm && (
          <Bottone onClick={handleAggiungiClick} variante="primario">Aggiungi Progetto</Bottone>
        )}
      </div>

      {showForm ? (
        <FormProgettoPortfolio 
          progettoEsistente={progettoInModifica}
          onSave={handleSaveProgetto}
          onCancel={() => { setShowForm(false); setProgettoInModifica(undefined); }}
        />
      ) : (
        <div className={styles.listaProgetti}>
          {progetti.length === 0 && <Paragrafo>Nessun progetto nel tuo portfolio. Inizia aggiungendone uno!</Paragrafo>}
          {progetti.map(progetto => (
            <div key={progetto.id} className={styles.cardProgetto}>
              <Titolo livello={5} className={styles.titoloCardProgetto}>{progetto.titolo}</Titolo>
              {progetto.media.length > 0 && (
                <img src={progetto.media[0].url} alt={progetto.media[0].caption || progetto.titolo} className={styles.immagineCardProgetto} />
              )}
              <Paragrafo className={styles.descrizioneCardProgetto} truncateLines={3}>{progetto.descrizione}</Paragrafo>
              <Paragrafo className={styles.infoCardProgetto}><strong>Categoria:</strong> {progetto.categoria}</Paragrafo>
              <Paragrafo className={styles.infoCardProgetto}><strong>Completato il:</strong> {new Date(progetto.dataCompletamento).toLocaleDateString()}</Paragrafo>
              <div className={styles.azioniCardProgetto}>
                <Bottone onClick={() => handleModificaClick(progetto)} piccola variante="secondario">Modifica</Bottone>
                <Bottone onClick={() => handleEliminaClick(progetto.id)} piccola variante="pericolo" outline>Elimina</Bottone>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionePortfolioPro;
