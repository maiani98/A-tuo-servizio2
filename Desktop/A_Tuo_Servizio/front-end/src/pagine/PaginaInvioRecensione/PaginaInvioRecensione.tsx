import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import styles from './PaginaInvioRecensione.module.css';
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import CampoTesto from '../../componenti/comuni/CampiInput/CampiInput';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

// Componente per Input Stelle Interattivo
interface InputStelleRatingProps {
  valore: number; // da 0 a 5
  onChange: (nuovoValore: number) => void;
  dimensione?: string; // es. '2rem'
  coloreAttivo?: string;
  coloreInattivo?: string;
}

const InputStelleRating: React.FC<InputStelleRatingProps> = ({
  valore,
  onChange,
  dimensione = '2.2rem',
  coloreAttivo = 'var(--colore-valutazione-stella, #ffc107)',
  coloreInattivo = 'var(--colore-grigio-placeholder-avatar, #ccc)',
}) => {
  const [hoverValore, setHoverValore] = useState<number | null>(null);

  return (
    <div className={styles.inputStelleContainer}>
      {[1, 2, 3, 4, 5].map((stellaNum) => (
        <button
          key={stellaNum}
          type="button" // importante per non fare submit del form
          className={styles.stellaInput}
          style={{
            fontSize: dimensione,
            color: (hoverValore || valore) >= stellaNum ? coloreAttivo : coloreInattivo,
          }}
          onClick={() => onChange(stellaNum)}
          onMouseEnter={() => setHoverValore(stellaNum)}
          onMouseLeave={() => setHoverValore(null)}
          aria-label={`Valuta ${stellaNum} stelle`}
        >
          ★
        </button>
      ))}
    </div>
  );
};


const PaginaInvioRecensione: React.FC = () => {
  const { idProfessionista } = useParams<{ idProfessionista: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const servizioIdParam = searchParams.get('servizioId') || searchParams.get('appuntamentoId'); // Per compatibilità

  // Stati mock per nome professionista/servizio (da fetchare in un'app reale)
  const [nomeProfessionistaRecensito, setNomeProfessionistaRecensito] = useState<string>('');
  const [nomeServizioRecensito, setNomeServizioRecensito] = useState<string>('');

  // Stati del Form
  const [valutazioneStelle, setValutazioneStelle] = useState<number>(0);
  const [titoloRecensione, setTitoloRecensione] = useState('');
  const [testoRecensione, setTestoRecensione] = useState('');
  const [pubblicaAnonima, setPubblicaAnonima] = useState(false);
  const [erroreForm, setErroreForm] = useState<string | null>(null);
  const [messaggioConferma, setMessaggioConferma] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simula fetch dati professionista/servizio
    if (idProfessionista) {
      // Trova il nome del professionista da un mock o API
      // Esempio:
      const mockNomiProf = { '123': 'Mario Rossi Idraulica', '456': 'Laura Bianchi Architettura' };
      setNomeProfessionistaRecensito((mockNomiProf as any)[idProfessionista] || `Professionista ID ${idProfessionista}`);
    }
    if (servizioIdParam) {
      // Trova nome servizio da un mock o API
      setNomeServizioRecensito(`Servizio ID ${servizioIdParam}`); // Placeholder
    } else {
        setNomeServizioRecensito("Generico");
    }
  }, [idProfessionista, servizioIdParam]);

  const handleSubmitRecensione = (e: React.FormEvent) => {
    e.preventDefault();
    setErroreForm(null);
    setMessaggioConferma(null);

    if (valutazioneStelle === 0) {
      setErroreForm('Per favore, fornisci una valutazione a stelle (da 1 a 5).');
      return;
    }
    if (testoRecensione.trim().length < 10) {
      setErroreForm('Il testo della recensione deve contenere almeno 10 caratteri.');
      return;
    }

    setIsSubmitting(true);
    console.log('Recensione inviata (mock):', {
      idProfessionista,
      servizioId: servizioIdParam,
      valutazioneStelle,
      titoloRecensione,
      testoRecensione,
      pubblicaAnonima,
    });

    setTimeout(() => { // Simula chiamata API
      setIsSubmitting(false);
      setMessaggioConferma('Grazie! La tua recensione è stata inviata con successo e sarà pubblicata dopo una breve verifica.');
      // Non resettare il form qui, così l'utente vede cosa ha inviato.
      // Il reindirizzamento o il bottone "Torna al profilo" gestiranno l'uscita.
    }, 1500);
  };

  if (!idProfessionista) {
    return (
      <Contenitore className={styles.paginaContenitore}>
        <Paragrafo>ID Professionista mancante. Impossibile lasciare una recensione.</Paragrafo>
        <Link to="/"><Bottone>Torna alla Home</Bottone></Link>
      </Contenitore>
    );
  }
  
  return (
    <Contenitore className={styles.paginaContenitore}>
      <Titolo livello={1} className={styles.titoloPagina}>
        Lascia una Recensione per {nomeProfessionistaRecensito || 'il Professionista'}
      </Titolo>
      <Paragrafo className={styles.sottotitoloServizio}>
        Servizio relativo a: {nomeServizioRecensito || 'Non specificato'}
      </Paragrafo>

      {messaggioConferma ? (
        <div className={`${styles.feedbackMessaggio} ${styles.successoRecensione} ${styles.containerPostInvio}`}>
          <Paragrafo>{messaggioConferma}</Paragrafo>
          <Link to={`/profilo/${idProfessionista}`} className={styles.linkTornaProfilo}>
            <Bottone variante="primario">Torna al Profilo del Professionista</Bottone>
          </Link>
          <Link to="/dashboard-cliente/appuntamenti" className={styles.linkTornaProfilo} style={{marginLeft: '1rem'}}>
            <Bottone variante="secondario">Vedi i Tuoi Appuntamenti</Bottone>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitRecensione} className={styles.formRecensione}>
          {erroreForm && <div className={`${styles.feedbackMessaggio} ${styles.erroreRecensione}`}>{erroreForm}</div>}

          <div className={styles.campoValutazione}>
            <label>La tua valutazione complessiva:</label>
            <InputStelleRating valore={valutazioneStelle} onChange={setValutazioneStelle} />
          </div>

          <CampoTesto
            id="titoloRecensione"
            nome="titoloRecensione"
            label="Titolo della Recensione (opzionale)"
            valore={titoloRecensione}
            onChange={(e) => setTitoloRecensione(e.target.value)}
            placeholder="Es. Ottimo servizio, Professionista consigliato!"
          />

          <CampoTesto
            id="testoRecensione"
            nome="testoRecensione"
            label="La tua Recensione (min. 10 caratteri)"
            tipo="textarea"
            valore={testoRecensione}
            onChange={(e) => setTestoRecensione(e.target.value)}
            placeholder="Descrivi la tua esperienza con questo professionista: cosa ti è piaciuto? C'è qualcosa che potrebbe migliorare? La tua opinione è importante!"
            righe={6}
            richiesto
          />

          <div className={styles.checkboxWrapperRecensione}>
            <input
              type="checkbox"
              id="pubblicaAnonima"
              name="pubblicaAnonima"
              checked={pubblicaAnonima}
              onChange={(e) => setPubblicaAnonima(e.target.checked)}
            />
            <label htmlFor="pubblicaAnonima">Pubblica la recensione in forma anonima</label>
          </div>

          <Bottone type="submit" variante="primario" disabled={isSubmitting}>
            {isSubmitting ? 'Invio in corso...' : 'Invia Recensione'}
          </Bottone>
        </form>
      )}
    </Contenitore>
  );
};

export default PaginaInvioRecensione;
