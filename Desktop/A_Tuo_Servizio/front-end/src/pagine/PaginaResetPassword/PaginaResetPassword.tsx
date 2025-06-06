import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaginaResetPassword.module.css';
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import CampoTesto from '../../componenti/comuni/CampiInput/CampiInput';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

const PaginaResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [nuovaPassword, setNuovaPassword] = useState('');
  const [confermaNuovaPassword, setConfermaNuovaPassword] = useState('');
  const [messaggioFeedback, setMessaggioFeedback] = useState<string | null>(null);
  const [erroreInput, setErroreInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null); // null = non verificato, true = valido, false = non valido
  const [robustezzaPassword, setRobustezzaPassword] = useState<string | null>(null);


  useEffect(() => {
    const token = searchParams.get('token');
    // Simula validazione token: in un'app reale, chiameresti un API.
    // Per ora, consideriamo il token valido se è presente e non è "invalidtoken".
    if (token && token !== 'invalidtoken') {
      console.log('Token (fittizio) ricevuto:', token);
      setTokenValido(true);
    } else if (token === 'invalidtoken') {
      setTokenValido(false);
      setMessaggioFeedback('Il link per il reset della password non è valido o è scaduto. Richiedine uno nuovo.');
    } else {
        setTokenValido(false);
        setMessaggioFeedback('Token di reset password mancante. Assicurati di aver seguito il link corretto.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Logica placeholder per la robustezza della password
    if (nuovaPassword.length === 0) {
      setRobustezzaPassword(null);
    } else if (nuovaPassword.length < 6) {
      setRobustezzaPassword('Debole');
    } else if (nuovaPassword.length < 10) {
      setRobustezzaPassword('Media');
    } else {
      // Potrebbe includere controllo per numeri, maiuscole/minuscole, simboli
      setRobustezzaPassword('Forte');
    }
  }, [nuovaPassword]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroreInput(null);
    setMessaggioFeedback(null); // Pulisce feedback precedenti tranne quelli del token

    if (!nuovaPassword || !confermaNuovaPassword) {
      setErroreInput('Entrambi i campi password sono obbligatori.');
      return;
    }
    if (nuovaPassword !== confermaNuovaPassword) {
      setErroreInput('Le password non coincidono.');
      return;
    }
    if ((robustezzaPassword === 'Debole' || !robustezzaPassword) && nuovaPassword.length > 0) {
        setErroreInput('La password è troppo debole. Assicurati che sia lunga almeno 6 caratteri.');
        return;
    }


    setIsSubmitting(true);
    // Simula invio richiesta API
    console.log('Nuova password inviata (mock):', nuovaPassword);

    setTimeout(() => {
      setMessaggioFeedback('Password reimpostata con successo! Ora puoi accedere con la tua nuova password.');
      setIsSubmitting(false);
      // Non reindirizzare subito, lascia che l'utente legga il messaggio e clicchi sul bottone Login
    }, 1500);
  };

  if (tokenValido === null) {
    return (
      <Contenitore className={styles.paginaContenitore}>
        <Paragrafo>Verifica del token in corso...</Paragrafo>
      </Contenitore>
    );
  }

  if (!tokenValido) {
    return (
      <Contenitore className={styles.paginaContenitore}>
        <Titolo livello={1} className={styles.titoloPagina}>Errore Reset Password</Titolo>
        <div className={styles.messaggioErroreInput} style={{textAlign: 'center', fontSize: '1rem'}}>
            {messaggioFeedback || 'Si è verificato un errore con il link di reset.'}
        </div>
        <Link to="/richiesta-reset-password" className={styles.linkSupporto}>
          Richiedi un nuovo link
        </Link>
        <br/>
        <Link to="/login" className={styles.linkSupporto}>
          Torna al Login
        </Link>
      </Contenitore>
    );
  }


  return (
    <Contenitore className={styles.paginaContenitore}>
      <Titolo livello={1} className={styles.titoloPagina}>
        Imposta la Tua Nuova Password
      </Titolo>
      {!messaggioFeedback && ( // Nasconde testo informativo se c'è già un feedback di successo
         <Paragrafo className={styles.testoInformativo}>
            Crea una nuova password sicura per il tuo account. Assicurati che sia robusta e facile da ricordare per te.
         </Paragrafo>
      )}


      {messaggioFeedback && (
        <div className={styles.messaggioFeedbackPositivo}>{messaggioFeedback}</div>
      )}
      
      {!messaggioFeedback && ( // Nasconde il form se c'è un messaggio di successo
        <form onSubmit={handleSubmit} className={styles.formReset} noValidate>
          <div className={styles.campoInputWrapper}>
            <CampoTesto
              id="nuovaPassword"
              nome="nuovaPassword"
              label="Nuova Password"
              tipo="password"
              valore={nuovaPassword}
              onChange={(e) => setNuovaPassword(e.target.value)}
              placeholder="Inserisci la nuova password"
              richiesto
              disabled={isSubmitting}
            />
            {nuovaPassword && robustezzaPassword && (
              <div className={styles.indicatoreRobustezza}>
                Robustezza: {robustezzaPassword}
              </div>
            )}
          </div>

          <CampoTesto
            id="confermaNuovaPassword"
            nome="confermaNuovaPassword"
            label="Conferma Nuova Password"
            tipo="password"
            valore={confermaNuovaPassword}
            onChange={(e) => setConfermaNuovaPassword(e.target.value)}
            placeholder="Conferma la nuova password"
            richiesto
            disabled={isSubmitting}
          />

          {erroreInput && (
            <div className={styles.messaggioErroreInput}>{erroreInput}</div>
          )}

          <Bottone
            type="submit"
            variante="primario"
            className={styles.bottoneSubmitLargo}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvataggio in corso...' : 'Salva Nuova Password'}
          </Bottone>
        </form>
      )}

      {messaggioFeedback && (
        <Link to="/login" style={{ textDecoration: 'none', marginTop: '1rem' }}>
          <Bottone variante="secondario" className={styles.bottoneVaiAlLogin}>
            Vai al Login
          </Bottone>
        </Link>
      )}
    </Contenitore>
  );
};

export default PaginaResetPassword;
