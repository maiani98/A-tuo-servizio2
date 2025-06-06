import React, { useState } from 'react';
import styles from './LeMieRecensioni.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

// Mock data structure for a review
interface Recensione {
  id: string;
  dataRecensione: Date;
  nomeCliente: string;
  fotoCliente?: string;
  valutazione: number; // 1 to 5
  titolo?: string;
  testo: string;
  rispostaProfessionista?: string;
  dataRisposta?: Date;
}

// Mock data
const mockRecensioniData: Recensione[] = [
  { id: 'rec001', dataRecensione: new Date('2024-07-25'), nomeCliente: 'Mario Rossi', valutazione: 5, titolo: 'Ottimo Lavoro!', testo: 'Professionista serio e competente, ha risolto il problema rapidamente. Consigliatissimo!', fotoCliente: 'https://via.placeholder.com/50/007bff/FFFFFF?text=MR' },
  { id: 'rec002', dataRecensione: new Date('2024-07-20'), nomeCliente: 'Laura Bianchi', valutazione: 4, titolo: 'Buon servizio, ma un po\' in ritardo', testo: 'Il lavoro è stato eseguito bene, ma l\'appuntamento è iniziato con 30 minuti di ritardo.', fotoCliente: 'https://via.placeholder.com/50/28a745/FFFFFF?text=LB', rispostaProfessionista: 'Ci scusiamo per il ritardo, faremo più attenzione in futuro. Grazie per il feedback!', dataRisposta: new Date('2024-07-21')},
  { id: 'rec003', dataRecensione: new Date('2024-07-15'), nomeCliente: 'Giuseppe Verdi', valutazione: 5, titolo: 'Fantastico!', testo: 'Preventivo chiaro e servizio impeccabile. Molto soddisfatto.', fotoCliente: 'https://via.placeholder.com/50/ffc107/000000?text=GV' },
  { id: 'rec004', dataRecensione: new Date('2024-07-10'), nomeCliente: 'Anna Neri', valutazione: 3, titolo: 'Sufficiente', testo: 'Il risultato finale è ok, ma la comunicazione potrebbe migliorare.', fotoCliente: 'https://via.placeholder.com/50/dc3545/FFFFFF?text=AN' },
  { id: 'rec005', dataRecensione: new Date('2024-06-28'), nomeCliente: 'Luca Gialli', valutazione: 2, titolo: 'Non soddisfatto', testo: 'Il problema non è stato risolto completamente e ho dovuto richiamare.', fotoCliente: 'https://via.placeholder.com/50/6f42c1/FFFFFF?text=LG', rispostaProfessionista: 'Siamo spiacenti per l\'inconveniente. La ricontatteremo per risolvere definitivamente.', dataRisposta: new Date('2024-06-29')},
];

// Helper component for Star Rating
const StarRating: React.FC<{ rating: number, maxStars?: number }> = ({ rating, maxStars = 5 }) => (
  <div className={styles.starRating}>
    {[...Array(maxStars)].map((_, index) => (
      <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
        &#9733; {/* Filled star */}
      </span>
    ))}
  </div>
);

const LeMieRecensioni: React.FC = () => {
  const [recensioni, setRecensioni] = useState<Recensione[]>(mockRecensioniData);
  const [filtroValutazione, setFiltroValutazione] = useState<string>('Tutte'); // 'Tutte', '5', '4', ...
  const [rispostaInCorso, setRispostaInCorso] = useState<{ [key: string]: string }>({}); // { recId: 'testo risposta' }
  const [mostraFormRisposta, setMostraFormRisposta] = useState<string | null>(null); // recId o null

  const mediaValutazioni = recensioni.length > 0 
    ? (recensioni.reduce((acc, r) => acc + r.valutazione, 0) / recensioni.length)
    : 0;

  const handleFiltroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroValutazione(event.target.value);
  };

  const recensioniFiltrate = recensioni.filter(r => 
    filtroValutazione === 'Tutte' || r.valutazione === parseInt(filtroValutazione)
  ).sort((a, b) => b.dataRecensione.getTime() - a.dataRecensione.getTime());

  const handleToggleRisposta = (recId: string) => {
    setMostraFormRisposta(prevId => prevId === recId ? null : recId);
    if (mostraFormRisposta !== recId && !rispostaInCorso[recId]) { // Pre-fill with existing response if any
        const recensioneEsistente = recensioni.find(r => r.id === recId);
        if(recensioneEsistente?.rispostaProfessionista) {
            setRispostaInCorso(prev => ({...prev, [recId]: recensioneEsistente.rispostaProfessionista || ''}));
        } else {
             setRispostaInCorso(prev => ({...prev, [recId]: ''})); // Clear if no existing response
        }
    }
  };

  const handleInputChangeRisposta = (recId: string, testo: string) => {
    setRispostaInCorso(prev => ({ ...prev, [recId]: testo }));
  };

  const handleInviaRisposta = (recId: string) => {
    if (!rispostaInCorso[recId]?.trim()) {
      alert('La risposta non può essere vuota.');
      return;
    }
    // Simulazione invio/salvataggio risposta
    setRecensioni(prevRecs => prevRecs.map(rec => 
      rec.id === recId 
      ? { ...rec, rispostaProfessionista: rispostaInCorso[recId], dataRisposta: new Date() } 
      : rec
    ));
    alert(`Risposta inviata per recensione ${recId} (simulazione).`);
    setMostraFormRisposta(null); // Chiudi form dopo invio
  };

  return (
    <div className={styles.containerRecensioni}>
      <Titolo livello={2} className={styles.titoloPagina}>Le Mie Recensioni</Titolo>

      <div className={styles.riepilogoValutazioni}>
        <Titolo livello={3}>Valutazione Media Complessiva</Titolo>
        <div className={styles.mediaContainer}>
          <StarRating rating={mediaValutazioni} />
          <span className={styles.mediaNumero}>{mediaValutazioni.toFixed(1)} / 5</span>
          <span className={styles.numeroRecensioniTotali}>({recensioni.length} recensioni)</span>
        </div>
        {/* Qui potrebbero esserci grafici o breakdown per stelle */}
      </div>

      <div className={styles.filtriContainerRecensioni}>
        <label htmlFor="filtroValutazione">Filtra per valutazione: </label>
        <select id="filtroValutazione" value={filtroValutazione} onChange={handleFiltroChange} className={styles.selectFiltroRecensioni}>
          <option value="Tutte">Tutte</option>
          <option value="5">5 Stelle</option>
          <option value="4">4 Stelle</option>
          <option value="3">3 Stelle</option>
          <option value="2">2 Stelle</option>
          <option value="1">1 Stella</option>
        </select>
      </div>

      <div className={styles.listaRecensioni}>
        {recensioniFiltrate.length > 0 ? recensioniFiltrate.map(rec => (
          <div key={rec.id} className={styles.recensioneCard}>
            <div className={styles.recensioneHeader}>
              <img src={rec.fotoCliente || 'https://via.placeholder.com/40/6c757d/FFFFFF?text=?'} alt={rec.nomeCliente} className={styles.fotoClienteRecensione} />
              <div className={styles.headerInfo}>
                <span className={styles.nomeClienteRecensione}>{rec.nomeCliente}</span>
                <span className={styles.dataRecensione}>{rec.dataRecensione.toLocaleDateString()}</span>
              </div>
              <StarRating rating={rec.valutazione} />
            </div>
            {rec.titolo && <Titolo livello={5} className={styles.titoloRecensione}>{rec.titolo}</Titolo>}
            <Paragrafo className={styles.testoRecensione}>{rec.testo}</Paragrafo>
            
            {rec.rispostaProfessionista && (
              <div className={styles.rispostaContainer}>
                <Titolo livello={5} className={styles.titoloRisposta}>La Tua Risposta ({rec.dataRisposta?.toLocaleDateString()})</Titolo>
                <Paragrafo className={styles.testoRisposta}>{rec.rispostaProfessionista}</Paragrafo>
              </div>
            )}

            <div className={styles.azioniRecensione}>
              <Bottone 
                onClick={() => handleToggleRisposta(rec.id)} 
                variante={rec.rispostaProfessionista ? "secondario" : "primario"}
                outline={!!rec.rispostaProfessionista}
                piccola
              >
                {mostraFormRisposta === rec.id ? 'Annulla Risposta' : (rec.rispostaProfessionista ? 'Modifica Risposta' : 'Rispondi Pubblicamente')}
              </Bottone>
            </div>

            {mostraFormRisposta === rec.id && (
              <div className={styles.formRispostaContainer}>
                <textarea
                  value={rispostaInCorso[rec.id] || ''}
                  onChange={(e) => handleInputChangeRisposta(rec.id, e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  rows={3}
                  className={styles.textareaRisposta}
                />
                <Bottone onClick={() => handleInviaRisposta(rec.id)} variante="primario" piccola>
                  Invia Risposta
                </Bottone>
              </div>
            )}
          </div>
        )) : (
          <Paragrafo className={styles.noRecensioni}>Nessuna recensione trovata con i filtri selezionati.</Paragrafo>
        )}
      </div>
    </div>
  );
};

export default LeMieRecensioni;
