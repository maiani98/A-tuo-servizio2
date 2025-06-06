import React from 'react';
// Usiamo gli stessi stili del modal cliente se il layout è identico, 
// altrimenti si possono creare stili specifici in OnboardingProfessionistaModal.module.css
// Per questo esempio, assumiamo che il layout generale sia simile e riutilizziamo gli stili.
import styles from './OnboardingClienteModal.module.css'; 
// Se si creano stili specifici, cambiare l'import in:
// import styles from './OnboardingProfessionistaModal.module.css';
import Modale from '../Modale/Modale';
import Bottone from '../Bottone/Bottone';
import Titolo from '../Titolo/Titolo';
import Paragrafo from '../Paragrafo/Paragrafo';
import { useNavigate } from 'react-router-dom'; // Per il bottone "Vai alla Dashboard"

export interface OnboardingModalProps { // Stessa interfaccia del Cliente Modal
  aperto: boolean;
  onChiudi: () => void;
}

const OnboardingProfessionistaModal: React.FC<OnboardingModalProps> = ({ aperto, onChiudi }) => {
  const navigate = useNavigate();

  const handleVaiAllaDashboard = () => {
    onChiudi(); // Chiude il modale
    navigate('/dashboard-professionista'); // Naviga alla dashboard
  };

  return (
    <Modale
      aperto={aperto}
      onChiudi={onChiudi}
      titolo="Benvenuto Professionista!"
      larghezza='550px'
    >
      <div className={styles.contenutoOnboarding}>
        <div className={styles.sezioneTesto}>
          <Paragrafo className={styles.sottotitoloModale}>
            Completa il tuo profilo per iniziare a ricevere richieste dai clienti e far crescere la tua attività!
          </Paragrafo>
          
          {/* Immagine specifica per professionisti, se diversa, altrimenti riusa .immagineTourCliente */}
          <div className={styles.immagineTourCliente}> 
            {/* <div className={styles.immagineTourProfessionista}> se si usa stile diverso */}
            <span className={styles.testoPlaceholderImmagine}>Illustrazione Guida Professionista</span>
          </div>

          <Titolo livello={4} className={styles.titoloElenco}>Prepara il tuo profilo al successo:</Titolo>
          <ul className={styles.elencoFunzionalita}>
            <li>Vai alla tua <strong>Dashboard</strong> per gestire il profilo, i servizi offerti e il tuo portfolio.</li>
            <li>Carica immagini di qualità nel tuo portfolio per mostrare i tuoi lavori migliori.</li>
            <li>Rispondi prontamente ai messaggi e alle richieste di preventivo per costruire fiducia.</li>
            <li>Mantieni aggiornate le tue disponibilità e i prezzi dei servizi.</li>
          </ul>
        </div>

        <div className={styles.azioniOnboarding}>
          <Bottone 
            variante="primario" 
            onClick={handleVaiAllaDashboard} 
            className={styles.bottoneAzioneOnboarding}
          >
            Vai alla Dashboard
          </Bottone>
          <Bottone 
            variante="link" 
            onClick={onChiudi} 
            className={styles.bottoneSaltaTour}
          >
            Salta Tour
          </Bottone>
        </div>
      </div>
    </Modale>
  );
};

export default OnboardingProfessionistaModal;
