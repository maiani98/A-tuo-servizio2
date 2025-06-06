import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaginaEmailVerificata.module.css'; // Creerà questo file successivamente
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

// Placeholder per icona
const IconaEmailVerificata = () => <div className={styles.iconaPagina}>✅</div>;

const PaginaEmailVerificata: React.FC = () => {
  return (
    <Contenitore className={styles.paginaContenitore}>
      <IconaEmailVerificata />
      <Titolo livello={1} className={styles.titoloPagina}>
        Email Verificata Correttamente!
      </Titolo>
      <Paragrafo className={styles.testoInformativo}>
        Il tuo account è ora attivo e pronto per essere utilizzato.
        <br />
        Puoi procedere effettuando il login.
      </Paragrafo>
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <Bottone variante="primario" className={styles.bottonePrimarioLargo}>
          Accedi Ora
        </Bottone>
      </Link>
    </Contenitore>
  );
};

export default PaginaEmailVerificata;
