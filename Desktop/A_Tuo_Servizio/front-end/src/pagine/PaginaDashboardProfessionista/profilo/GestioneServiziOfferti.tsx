import React, { useState } from 'react';
import styles from './GestioneServiziOfferti.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface ServizioOfferto {
  id: string;
  nome: string;
  categoria: string; // Es. 'Riparazioni Idrauliche', 'Sviluppo Web', 'Consulenza Legale'
  descrizione: string;
  prezzoIndicativo?: string; // Es. 'Da 50€/ora', 'Su preventivo', 'A partire da 300€'
}

const mockCategorieServizi = [
  'Riparazioni Idrauliche',
  'Installazioni',
  'Manutenzione',
  'Sviluppo Web Frontend',
  'Sviluppo Web Backend',
  'Design Grafico',
  'Consulenza Fiscale',
  'Altro',
];

const mockServiziIniziali: ServizioOfferto[] = [
  { id: 'serv1', nome: 'Riparazione Perdite Acqua', categoria: 'Riparazioni Idrauliche', descrizione: 'Individuazione e riparazione rapida di perdite d\'acqua per rubinetti, tubature, scarichi.', prezzoIndicativo: 'Da 60€' },
  { id: 'serv2', nome: 'Sviluppo Sito Web Vetrina', categoria: 'Sviluppo Web Frontend', descrizione: 'Creazione di siti web statici o dinamici per presentare la tua attività online.', prezzoIndicativo: 'A partire da 500€' },
  { id: 'serv3', nome: 'Installazione Sanitari', categoria: 'Installazioni', descrizione: 'Montaggio professionale di WC, bidet, lavandini, piatti doccia e box doccia.', prezzoIndicativo: 'Su preventivo' },
];

const FormServizio: React.FC<{
  servizioEsistente?: ServizioOfferto;
  onSave: (servizio: ServizioOfferto) => void;
  onCancel: () => void;
  categorieDisponibili: string[];
}> = ({ servizioEsistente, onSave, onCancel, categorieDisponibili }) => {
  const [nome, setNome] = useState(servizioEsistente?.nome || '');
  const [categoria, setCategoria] = useState(servizioEsistente?.categoria || '');
  const [descrizione, setDescrizione] = useState(servizioEsistente?.descrizione || '');
  const [prezzoIndicativo, setPrezzoIndicativo] = useState(servizioEsistente?.prezzoIndicativo || '');
  const [errore, setErrore] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');
    if (!nome || !categoria || !descrizione) {
      setErrore('Nome, categoria e descrizione sono campi obbligatori.');
      return;
    }
    onSave({
      id: servizioEsistente?.id || `serv-${Date.now()}`,
      nome,
      categoria,
      descrizione,
      prezzoIndicativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formServizio}>
      <Titolo livello={4} className={styles.titoloForm}>{servizioEsistente ? 'Modifica Servizio' : 'Aggiungi Nuovo Servizio'}</Titolo>
      {errore && <Paragrafo className={styles.messaggioErrore}>{errore}</Paragrafo>}
      <CampoTesto etichetta="Nome Servizio" value={nome} onChange={e => setNome(e.target.value)} required />
      <div>
        <label htmlFor="categoriaServizio" className={styles.labelForm}>Categoria</label>
        <select id="categoriaServizio" value={categoria} onChange={e => setCategoria(e.target.value)} required className={styles.selectForm}>
          <option value="">Seleziona una categoria...</option>
          {categorieDisponibili.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="descrizioneServizio" className={styles.labelForm}>Descrizione</label>
        <textarea id="descrizioneServizio" value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={4} required className={styles.textareaForm} />
      </div>
      <CampoTesto etichetta="Prezzo Indicativo (Opzionale)" value={prezzoIndicativo} onChange={e => setPrezzoIndicativo(e.target.value)} placeholder="Es. Da 50€/ora, Su preventivo" />
      <div className={styles.azioniFormServizio}>
        <Bottone type="submit" variante="primario">{servizioEsistente ? 'Salva Modifiche' : 'Aggiungi Servizio'}</Bottone>
        <Bottone type="button" onClick={onCancel} variante="secondario">Annulla</Bottone>
      </div>
    </form>
  );
};

const GestioneServiziOfferti: React.FC = () => {
  const [servizi, setServizi] = useState<ServizioOfferto[]>(mockServiziIniziali);
  const [showForm, setShowForm] = useState(false);
  const [servizioInModifica, setServizioInModifica] = useState<ServizioOfferto | undefined>(undefined);

  const handleAggiungiClick = () => {
    setServizioInModifica(undefined);
    setShowForm(true);
  };

  const handleModificaClick = (servizio: ServizioOfferto) => {
    setServizioInModifica(servizio);
    setShowForm(true);
  };

  const handleEliminaClick = (idServizio: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo servizio?')) {
      setServizi(prev => prev.filter(s => s.id !== idServizio));
      console.log(`Servizio ${idServizio} eliminato (simulazione)`);
    }
  };

  const handleSaveServizio = (servizio: ServizioOfferto) => {
    setServizi(prev => {
      const index = prev.findIndex(s => s.id === servizio.id);
      if (index > -1) { // Modifica
        const updated = [...prev];
        updated[index] = servizio;
        return updated;
      } else { // Aggiunta
        return [...prev, servizio];
      }
    });
    console.log('Servizio salvato (simulazione):', servizio);
    setShowForm(false);
    setServizioInModifica(undefined);
  };

  return (
    <div className={styles.containerServizi}>
      <div className={styles.headerSezioneServizi}>
        <Titolo livello={3} className={styles.titoloSezione}>Gestisci i Tuoi Servizi</Titolo>
        {!showForm && (
          <Bottone onClick={handleAggiungiClick} variante="primario">Aggiungi Servizio</Bottone>
        )}
      </div>

      {showForm ? (
        <FormServizio
          servizioEsistente={servizioInModifica}
          onSave={handleSaveServizio}
          onCancel={() => { setShowForm(false); setServizioInModifica(undefined); }}
          categorieDisponibili={mockCategorieServizi}
        />
      ) : (
        <div className={styles.listaServizi}>
          {servizi.length === 0 && <Paragrafo>Nessun servizio offerto. Inizia aggiungendone uno!</Paragrafo>}
          {servizi.map(servizio => (
            <div key={servizio.id} className={styles.cardServizio}>
              <div className={styles.cardHeaderServizio}>
                <Titolo livello={5} className={styles.nomeServizioCard}>{servizio.nome}</Titolo>
                <span className={styles.categoriaServizioBadge}>{servizio.categoria}</span>
              </div>
              <Paragrafo className={styles.descrizioneServizioCard} truncateLines={3}>{servizio.descrizione}</Paragrafo>
              {servizio.prezzoIndicativo && <Paragrafo className={styles.prezzoServizioCard}><strong>Prezzo:</strong> {servizio.prezzoIndicativo}</Paragrafo>}
              <div className={styles.azioniCardServizio}>
                <Bottone onClick={() => handleModificaClick(servizio)} piccola variante="secondario">Modifica</Bottone>
                <Bottone onClick={() => handleEliminaClick(servizio.id)} piccola variante="pericolo" outline>Elimina</Bottone>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestioneServiziOfferti;
