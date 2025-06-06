import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PaginaRichiestaResetPassword.module.css';
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import CampoTesto from '../../componenti/comuni/CampiInput/CampiInput';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

const PaginaRichiestaResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [messaggioFeedback, setMessaggioFeedback] = useState<string | null>(null);
  const [erroreInput, setErroreInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroreInput(null);
    setMessaggioFeedback(null);

    if (!email) {
      setErroreInput('L\'indirizzo email è obbligatorio.');
      return;
    }
    // Semplice validazione formato email (HTML5 type="email" aiuta già)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErroreInput('Inserisci un indirizzo email valido.');
      return;
    }

    setIsSubmitting(true);
    // Simula invio richiesta API
    console.log('Richiesta reset password per email:', email);
    // Mostra un messaggio generico per motivi di privacy
    setTimeout(() => {
      setMessaggioFeedback(
        "Se l'indirizzo email è associato a un account esistente, riceverai a breve un link per reimpostare la tua password."
      );
      setEmail(''); // Pulisce il campo email dopo l'invio
      // setIsSubmitting(false); // Potrebbe non essere necessario se si reindirizza o il form scompare
    }, 1500); // Simula il tempo di una chiamata API
  };

  return (
    <Contenitore className={styles.paginaContenitore}>
      <Titolo livello={1} className={styles.titoloPagina}>
        Recupera la Tua Password
      </Titolo>
      <Paragrafo className={styles.testoInformativo}>
        Inserisci l'indirizzo email associato al tuo account. Ti invieremo un link per reimpostare la password.
      </Paragrafo>

      {messaggioFeedback && (
        <div className={styles.messaggioFeedback}>{messaggioFeedback}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.formRecupero} noValidate>
        <CampoTesto
          id="email-recupero"
          nome="email"
          label="Indirizzo Email"
          tipo="email"
          valore={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="iltuoindirizzo@email.com"
          richiesto
          disabled={isSubmitting || !!messaggioFeedback} // Disabilita se in invio o se feedback mostrato
          classNamePerErrore={erroreInput ? styles.campoConErrore : ''} // Da definire nel CSS se necessario
        />
        {erroreInput && !messaggioFeedback && (
          <div className={styles.messaggioErroreInput}>{erroreInput}</div>
        )}

        {!messaggioFeedback && ( // Nasconde il bottone se il messaggio di feedback è mostrato
          <Bottone
            type="submit"
            variante="primario"
            className={styles.bottoneSubmitLargo}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Invio in corso...' : 'Invia Link di Reset'}
          </Bottone>
        )}
      </form>

      <div className={styles.linkSupportoWrapper}>
        <Link to="/login" className={styles.linkSupporto}>
          Torna al Login
        </Link>
        <Link to="/contatti" className={styles.linkSupporto}> {/* Route placeholder */}
          Contatta Supporto
        </Link>
      </div>
    </Contenitore>
  );
};

export default PaginaRichiestaResetPassword;
