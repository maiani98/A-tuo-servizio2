import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './PaginaRegistrazione.module.css'; // Questo file verrà creato nel prossimo subtask
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { loginSuccesso } from '../../store/slices/utenteSlice'; 

const PaginaRegistrazione: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [errore, setErrore] = useState<string | null>(null);

  const handleRegistrazione = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore(null); // Resetta errori precedenti

    if (!nome || !email || !password || !confermaPassword) {
      setErrore('Tutti i campi sono obbligatori.');
      return;
    }

    if (password !== confermaPassword) {
      setErrore('Le password non coincidono.');
      return;
    }

    // Simula chiamata API
    console.log('Dati di registrazione:', { nome, email, password });

    // Simula Login Automatico Post-Registrazione
    // In un'app reale, questi dati verrebbero dalla risposta dell'API
    // e il token sarebbe un vero token JWT.
    const utenteFittizio = { id: Date.now().toString(), nome, email }; // ID generato per l'esempio
    const tokenFittizio = 'token-fittizio-registrazione-' + Date.now();

    dispatch(loginSuccesso({ utente: utenteFittizio, token: tokenFittizio }));

    // Naviga alla homepage o a una dashboard
    navigate('/'); 
  };

  return (
    <Contenitore className={styles.paginaAuthContenitore}> {/* Riutilizzo stile da PaginaLogin, se definito globalmente o copiato */}
      <Titolo livello={1} className={styles.titoloAuth}>Crea un Account</Titolo>
      {errore && <p className={styles.messaggioErroreGlobale}>{errore}</p>}
      <form onSubmit={handleRegistrazione} className={styles.formAuth}>
        <CampoTesto
          etichetta="Nome Completo"
          type="text"
          name="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Il tuo nome completo"
        />
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
          placeholder="Crea una password sicura"
        />
        <CampoTesto
          etichetta="Conferma Password"
          type="password"
          name="confermaPassword"
          value={confermaPassword}
          onChange={(e) => setConfermaPassword(e.target.value)}
          required
          placeholder="Riscrivi la password"
        />
        <Bottone type="submit" variante="primario">
          Registrati
        </Bottone>
      </form>
      <p className={styles.linkAlternativo}>
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>
    </Contenitore>
  );
};

export default PaginaRegistrazione;
