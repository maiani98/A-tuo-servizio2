import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // useLocation per l'email opzionale
import styles from './PaginaAttesaVerificaEmail.module.css';
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

// Placeholder per icona
const IconaEmailAttesa = () => <div className={styles.iconaPagina}>📧</div>;

const PaginaAttesaVerificaEmail: React.FC = () => {
  const location = useLocation();
  // Prova a ottenere l'email dallo stato della navigazione o usa un placeholder
  const emailUtente = location.state?.email || '[indirizzo_email_utente_placeholder]';

  const handleReinviaEmail = () => {
    // Logica mock per il reinvio dell'email
    console.log('Richiesta reinvio email a:', emailUtente);
    alert(`Email di verifica reinviata a ${emailUtente} (mock).`);
    // Qui in un'app reale ci sarebbe una chiamata API e gestione del cooldown.
  };

  return (
    <Contenitore className={styles.paginaContenitore}>
      <IconaEmailAttesa />
      <Titolo livello={1} className={styles.titoloPagina}>
        Verifica il Tuo Indirizzo Email
      </Titolo>
      <Paragrafo className={styles.testoInformativo}>
        Ti abbiamo inviato un'email di conferma a <strong>{emailUtente}</strong>.
        <br />
        Clicca sul link contenuto nell'email per attivare il tuo account.
      </Paragrafo>

      <div className={styles.azioniWrapper}>
        <Bottone
          onClick={handleReinviaEmail}
          variante="secondario"
          className={styles.bottoneAzione}
        >
          Non hai ricevuto l'email? Reinvia
        </Bottone>
        {/* 
          Il link per modificare l'email potrebbe puntare alla pagina di registrazione 
          o a una pagina specifica di gestione account/profilo se l'utente fosse parzialmente loggato.
          Per semplicità, ora punta a registrazione.
        */}
        <Link to="/registrazione" className={styles.linkAzione}>
          Modifica indirizzo email
        </Link>
      </div>

      <Paragrafo className={styles.linkTornaLogin}>
        <Link to="/login">Torna al Login</Link>
      </Paragrafo>
    </Contenitore>
  );
};

export default PaginaAttesaVerificaEmail;
