import React from 'react';
import styles from './OnboardingClienteModal.module.css';
import Modale from '../Modale/Modale'; // Assumendo che Modale sia in ../Modale/Modale.tsx
import Bottone from '../Bottone/Bottone';
import Titolo from '../Titolo/Titolo';
import Paragrafo from '../Paragrafo/Paragrafo';

export interface OnboardingModalProps {
  aperto: boolean;
  onChiudi: () => void;
}

const OnboardingClienteModal: React.FC<OnboardingModalProps> = ({ aperto, onChiudi }) => {
  return (
    <Modale
      aperto={aperto}
      onChiudi={onChiudi}
      titolo="Benvenuto su A Tuo Servizio!"
      larghezza='550px' // Larghezza media per il modale
    >
      <div className={styles.contenutoOnboarding}>
        <div className={styles.sezioneTesto}>
          <Paragrafo className={styles.sottotitoloModale}>
            Inizia subito la tua ricerca inserendo il servizio e la località di cui hai bisogno.
          </Paragrafo>
          
          <div className={styles.immagineTourCliente}>
            {/* Placeholder per immagine/illustrazione. Potrebbe essere un tag <img> o un div con background-image */}
            <span className={styles.testoPlaceholderImmagine}>Illustrazione Guida Cliente</span>
          </div>

          <Titolo livello={4} className={styles.titoloElenco}>Scopri come funziona:</Titolo>
          <ul className={styles.elencoFunzionalita}>
            <li>Usa la barra di ricerca in alto per trovare ciò che cerchi.</li>
            <li>Applica filtri specifici per affinare i risultati della tua ricerca.</li>
            <li>Salva i tuoi professionisti preferiti per ritrovarli facilmente in futuro.</li>
            <li>Leggi le recensioni e contatta i professionisti per richiedere preventivi.</li>
          </ul>
        </div>

        <div className={styles.azioniOnboarding}>
          <Bottone variante="primario" onClick={onChiudi} className={styles.bottoneAzioneOnboarding}>
            Inizia Ora
          </Bottone>
          <Bottone variante="link" onClick={onChiudi} className={styles.bottoneSaltaTour}>
            Salta Tour
          </Bottone>
        </div>
      </div>
    </Modale>
  );
};

export default OnboardingClienteModal;
