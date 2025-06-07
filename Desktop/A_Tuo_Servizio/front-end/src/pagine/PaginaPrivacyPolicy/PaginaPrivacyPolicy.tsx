import React from 'react';
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import styles from './PaginaPrivacyPolicy.module.css';

const PaginaPrivacyPolicy: React.FC = () => {
  return (
    <Contenitore className={styles.paginaPrivacyPolicy}>
      <Titolo livello={1} className={styles.titolo}>Informativa sulla Privacy</Titolo>
      <Paragrafo className={styles.dataAggiornamento}>Ultimo aggiornamento: Giugno 2025</Paragrafo>
      <Paragrafo>
        Questa pagina è un placeholder per l'informativa sulla privacy di "A Tuo Servizio". Dovrà essere sostituita con un testo conforme al GDPR e alle normative vigenti.
      </Paragrafo>
      <Paragrafo>
        Si consiglia di includere dettagli su trattamento dati, cookie e diritti degli utenti.
      </Paragrafo>
    </Contenitore>
  );
};

export default PaginaPrivacyPolicy;
