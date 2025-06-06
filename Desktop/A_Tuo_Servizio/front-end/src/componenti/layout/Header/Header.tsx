import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa Link e useNavigate
import { useSelector, useDispatch } from 'react-redux';
import styles from './Header.module.css';
import { Contenitore } from '../Layout'; // Assumendo che Layout.tsx sia in ../Layout
import { Bottone } from '../../comuni/Bottone/Bottone';
import { selectIsAuthenticated, selectUtenteCorrente } from '../../../store/slices/utenteSlice'; // Adattato il percorso
import { logout } from '../../../store/slices/utenteSlice'; // Adattato il percorso

const Header: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const utente = useSelector(selectUtenteCorrente); // Opzionale, per mostrare il nome
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Reindirizza alla homepage dopo il logout
  };

  return (
    <header className={styles.headerFisso}>
      <Contenitore className={styles.contenitoreHeader}>
        <div className={styles.logoPlaceholder}>
          {/* Il link punta alla homepage */}
          <Link to="/" className={styles.logoLink}> {/* Applicata classe per stile logo */}
            A tuo servizio
          </Link>
        </div>
        
        {/* Placeholder per icona Hamburger su mobile - logica di visualizzazione da implementare */}
        {/* <div className={styles.menuIconaMobile}>&#9776;</div> */}

        <nav className={styles.navigazioneDestra}>
          {isAuthenticated ? (
            <>
              {utente && utente.nome && <span className={styles.salutoUtente}>Ciao, {utente.nome}!</span>}
              {/* 
                TODO: Il link per "Il Mio Account" dovrebbe puntare a una pagina dedicata 
                (es. /profilo-utente o /dashboard-utente).
                Per ora, se l'utente è un professionista (logica da implementare), 
                potrebbe puntare a /dashboard-professionista.
                Altrimenti, a una generica /mio-account.
                Usiamo /dashboard-professionista come placeholder.
              */}
              <Link to="/dashboard-professionista" className={styles.linkHeader}>
                Il Mio Account
              </Link>
              <Bottone onClick={handleLogout} variante="secondario" className={styles.bottoneHeader}>
                Logout
              </Bottone>
            </>
          ) : (
            <>
              {/* 
                TODO: Il link per "Sei un professionista?" dovrebbe puntare a una pagina 
                di registrazione specifica per professionisti o a una landing page.
                Per ora, usiamo /registrazione-professionista come placeholder.
              */}
              <Link to="/registrazione-professionista"> 
                <Bottone variante="secondario" className={styles.bottoneHeader}>
                  Sei un professionista?
                </Bottone>
              </Link>
              <Link to="/login">
                <Bottone variante="primario" className={styles.bottoneHeader}>
                  Accedi / Registrati
                </Bottone>
              </Link>
            </>
          )}
        </nav>
      </Contenitore>
    </header>
  );
};

export default Header;
