import React from 'react';
import styles from './PanoramicaDashboard.module.css'; // CSS module for this component
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';

// Placeholder for a generic Widget Card component
interface WidgetCardProps {
  title: string;
  value: string | number;
  details?: string;
  icon?: string; // Placeholder for an icon class or component
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, value, details, icon }) => (
  <div className={styles.widgetCard}>
    {icon && <span className={styles.widgetIcon}>{icon}</span>}
    <div className={styles.widgetContent}>
      <h4 className={styles.widgetTitle}>{title}</h4>
      <p className={styles.widgetValue}>{value}</p>
      {details && <p className={styles.widgetDetails}>{details}</p>}
    </div>
  </div>
);

const PanoramicaDashboard: React.FC = () => {
  // Mock data for the widgets
  const overviewData = {
    nuoveRichieste: 5,
    nuoviMessaggi: 3,
    prossimiAppuntamenti: 2,
    recensioniRecenti: 4, // Could be an array of recent reviews
    visualizzazioniProfilo: 150,
    tassoRisposta: '95%',
    valutazioneMedia: 4.8,
  };

  return (
    <div className={styles.panoramicaContainer}>
      <Titolo livello={2} className={styles.headerTitle}>Panoramica Dashboard</Titolo>
      
      <div className={styles.widgetsGrid}>
        <WidgetCard 
          title="Nuove Richieste di Preventivo" 
          value={overviewData.nuoveRichieste} 
          details="Da revisionare" 
        />
        <WidgetCard 
          title="Nuovi Messaggi" 
          value={overviewData.nuoviMessaggi} 
          details="Non letti" 
        />
        <WidgetCard 
          title="Prossimi Appuntamenti" 
          value={overviewData.prossimiAppuntamenti} 
          details="Oggi/Domani" 
        />
        <WidgetCard 
          title="Recensioni Recenti" 
          value={overviewData.recensioniRecenti} 
          details="Ultime 7gg" 
        />
        <WidgetCard 
          title="Visualizzazioni Profilo" 
          value={overviewData.visualizzazioniProfilo} 
          details="Ultimi 30gg" 
        />
        <WidgetCard 
          title="Tasso di Risposta" 
          value={overviewData.tassoRisposta} 
          details="Media" 
        />
        <WidgetCard 
          title="Valutazione Media" 
          value={`${overviewData.valutazioneMedia} / 5`} 
          details="Basata su tutte le recensioni" 
        />
        {/* Potentially more widgets or charts here */}
      </div>

      {/* Placeholder for recent activity or other sections */}
      <div className={styles.recentActivitySection}>
        <Titolo livello={3}>Attività Recenti</Titolo>
        <Paragrafo>Nessuna attività recente da mostrare (placeholder).</Paragrafo>
        {/* Here you could list recent messages, reviews, bookings etc. */}
      </div>
    </div>
  );
};

export default PanoramicaDashboard;
