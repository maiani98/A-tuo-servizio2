import React from 'react';
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import styles from './PaginaTerminiCondizioni.module.css';

const PaginaTerminiCondizioni: React.FC = () => {
  return (
    <Contenitore className={styles.paginaTerminiCondizioni}>
      <Titolo livello={1} className={styles.titolo}>Termini e Condizioni di Utilizzo</Titolo>
      <Paragrafo className={styles.dataAggiornamento}>Ultimo aggiornamento: Giugno 2025</Paragrafo>
      <Paragrafo>
        Questa pagina contiene i termini e le condizioni che regolano l'uso della piattaforma "A Tuo Servizio". Il testo qui presente è un placeholder e andrà sostituito con i termini completi.
      </Paragrafo>
      <Paragrafo>
        Si consiglia di consultare un professionista legale per redigere i contenuti definitivi di questa sezione.
      </Paragrafo>
    </Contenitore>
  );
};

export default PaginaTerminiCondizioni;
