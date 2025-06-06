import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaginaOpzioniAccesso.module.css';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Contenitore } from '../../componenti/layout/Layout';
// Importa qui eventuali icone se le avessi, per ora placeholder testuali
// import { GoogleIcon, FacebookIcon, AppleIcon } from '../../assets/icons';

const PaginaOpzioniAccesso: React.FC = () => {
  return (
    <Contenitore className={styles.paginaContenitore}>
      <div className={styles.logoOpzioni}>A Tuo Servizio</div>
      <Titolo livello={1} className={styles.titoloOpzioni}>
        Accedi o Crea il Tuo Account su A Tuo Servizio
      </Titolo>

      <div className={styles.ctaWrapper}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Bottone variante="primario" className={styles.bottoneOpzione}>
            Accedi
          </Bottone>
        </Link>
        <Link to="/registrazione" style={{ textDecoration: 'none' }}>
          <Bottone variante="secondario" className={styles.bottoneOpzione}>
            Crea un Account
          </Bottone>
        </Link>
      </div>

      <div className={styles.divisoreSocial}>
        <span>Oppure continua con</span>
      </div>

      <div className={styles.socialLoginWrapper}>
        {/* Per ora, i bottoni social sono placeholder. 
            In futuro, potrebbero diventare componenti propri con logica specifica. */}
        <Bottone variante="secondario" className={styles.bottoneSocial}>
          {/* <GoogleIcon className={styles.socialIcon} /> */}
          Continua con Google
        </Bottone>
        <Bottone variante="secondario" className={styles.bottoneSocial}>
          {/* <FacebookIcon className={styles.socialIcon} /> */}
          Continua con Facebook
        </Bottone>
        <Bottone variante="secondario" className={styles.bottoneSocial}>
          {/* <AppleIcon className={styles.socialIcon} /> */}
          Continua con Apple
        </Bottone>
      </div>

      <p className={styles.testoLegale}>
        Cliccando su "Crea un Account" o continuando con i social, accetti i nostri{' '}
        <Link to="/termini-e-condizioni">Termini e Condizioni</Link> e la nostra{' '}
        <Link to="/privacy-policy">Informativa Privacy</Link>.
      </p>
    </Contenitore>
  );
};

export default PaginaOpzioniAccesso;
