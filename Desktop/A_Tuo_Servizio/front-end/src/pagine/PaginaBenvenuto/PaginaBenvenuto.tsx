import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaginaBenvenuto.module.css';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';

const PaginaBenvenuto: React.FC = () => {
  return (
    <div className={styles.schermoBenvenuto}>
      <div className={styles.contenutoSovrapposto}>
        <div className={styles.logoBenvenuto}>A Tuo Servizio</div>
        <Titolo livello={1} className={styles.titoloBenvenuto}>
          A Tuo Servizio: Trova Professionisti Qualificati Vicino a Te
        </Titolo>
        <Paragrafo className={styles.taglineBenvenuto}>
          La piattaforma che connette le tue esigenze con i migliori esperti del settore.
        </Paragrafo>
        <div className={styles.ctaWrapperPrimario}>
          <Link to="/">
            <Bottone variante="primario" className={styles.bottoneBenvenuto}>
              Inizia la Ricerca
            </Bottone>
          </Link>
          <Link to="/registrazione">
            <Bottone variante="secondario" className={styles.bottoneBenvenuto}>
              Sei un Professionista? Iscriviti Ora
            </Bottone>
          </Link>
        </div>
        <div className={styles.linkSecondarioWrapper}>
          <Link to="/login" className={styles.linkAccedi}>
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaginaBenvenuto;
