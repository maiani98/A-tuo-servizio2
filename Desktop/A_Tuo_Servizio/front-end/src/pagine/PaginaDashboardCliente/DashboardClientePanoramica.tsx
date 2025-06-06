import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardClientePanoramica.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
// import Griglia from '../../componenti/comuni/Griglia/Griglia'; // Se si usa un componente Griglia generico

const DashboardClientePanoramica: React.FC = () => {
  // Dati mock (in un'app reale, questi verrebbero da API o stato globale)
  const numeroMessaggiNonLetti = 2;
  const appuntamentiImminenti = 0;
  const richiesteInAttesa = 1;

  return (
    <div className={styles.panoramicaContenitore}>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        Panoramica Attività
      </Titolo>
      
      {/* Utilizzo di una classe per la griglia definita nel CSS module */}
      <div className={styles.grigliaWidget}>
        {/* Widget Ultimi Messaggi Non Letti */}
        <div className={styles.cardWidgetPanoramica}>
          <h4>Ultimi Messaggi</h4>
          {numeroMessaggiNonLetti > 0 ? (
            <Paragrafo>Hai {numeroMessaggiNonLetti} messaggi non letti.</Paragrafo>
          ) : (
            <Paragrafo>Nessun nuovo messaggio.</Paragrafo>
          )}
          <Link to="../messaggi"> {/* Navigazione relativa alla route padre del dashboard */}
            <Bottone variante="secondario" size="small" className={styles.bottoneWidget}>
              Vedi Messaggi
            </Bottone>
          </Link>
        </div>

        {/* Widget Prossimi Appuntamenti */}
        <div className={styles.cardWidgetPanoramica}>
          <h4>Prossimi Appuntamenti</h4>
          {appuntamentiImminenti > 0 ? (
             <Paragrafo>Hai {appuntamentiImminenti} appuntamenti programmati.</Paragrafo>
          ) : (
            <Paragrafo>Nessun appuntamento imminente.</Paragrafo>
          )}
          <Link to="../appuntamenti">
            <Bottone variante="secondario" size="small" className={styles.bottoneWidget}>
              Vedi Appuntamenti
            </Bottone>
          </Link>
        </div>

        {/* Widget Richieste di Preventivo in Attesa */}
        <div className={styles.cardWidgetPanoramica}>
          <h4>Richieste di Preventivo</h4>
          {richiesteInAttesa > 0 ? (
            <Paragrafo>{richiesteInAttesa} richiesta {richiesteInAttesa === 1 ? 'attende' : 'attendono'} risposta.</Paragrafo>
          ) : (
            <Paragrafo>Nessuna richiesta in attesa.</Paragrafo>
          )}
          <Link to="../richieste">
            <Bottone variante="secondario" size="small" className={styles.bottoneWidget}>
              Vedi Richieste
            </Bottone>
          </Link>
        </div>

        {/* Widget Link Rapidi */}
        <div className={`${styles.cardWidgetPanoramica} ${styles.azioniRapideWidget}`}>
          <h4>Azioni Rapide</h4>
          <Paragrafo>Hai bisogno di altro?</Paragrafo> {/* Testo placeholder */}
          <div>
            <Link to="/">
              <Bottone variante="primario" size="small" className={styles.bottoneWidget}>
                Cerca un Professionista
              </Bottone>
            </Link>
            <Link to="../preferiti">
              <Bottone variante="outline" size="small" className={styles.bottoneWidget}>
                Visualizza Preferiti
              </Bottone>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClientePanoramica;
