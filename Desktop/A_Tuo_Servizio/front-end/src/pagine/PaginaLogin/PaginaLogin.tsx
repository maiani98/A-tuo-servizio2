import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './PaginaLogin.module.css';
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { loginSuccesso } from '../../store/slices/utenteSlice'; // Assumendo che l'azione sia definita così

const PaginaLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState<string | null>(null);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore(null); // Resetta errori precedenti

    if (!email || !password) {
      setErrore('Per favore, inserisci email e password.');
      return;
    }

    // Simula chiamata API
    console.log('Tentativo di login con:', { email, password });

    // Simula successo e dispatch dell'azione
    // In un'app reale, questi dati verrebbero dalla risposta dell'API
    const utenteFittizio = { id: '1', nome: email.split('@')[0], email: email };
    const tokenFittizio = 'fake-jwt-token-' + Date.now();

    dispatch(loginSuccesso({ utente: utenteFittizio, token: tokenFittizio }));

    // Naviga alla homepage o a una dashboard
    // Per ora, navighiamo alla homepage
    navigate('/'); 
  };

  return (
    <Contenitore className={styles.paginaAuthContenitore}>
      <Titolo livello={1} className={styles.titoloAuth}>Accedi</Titolo>
      {errore && <p className={styles.messaggioErroreGlobale}>{errore}</p>}
      <form onSubmit={handleLogin} className={styles.formAuth}>
        <CampoTesto
          etichetta="Indirizzo Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="iltuoindirizzo@esempio.com"
        />
        <CampoTesto
          etichetta="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="La tua password"
        />
        <Bottone type="submit" variante="primario">
          Accedi
        </Bottone>
      </form>
      <p className={styles.linkAlternativo}>
        Non hai un account? <Link to="/registrazione">Registrati</Link>
      </p>
    </Contenitore>
  );
};

export default PaginaLogin;
