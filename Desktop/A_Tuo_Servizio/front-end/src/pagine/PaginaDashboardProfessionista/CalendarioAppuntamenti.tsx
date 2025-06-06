import React, { useState } from 'react';
import styles from './CalendarioAppuntamenti.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { Link } from 'react-router-dom';

// Mock data structure
interface Appuntamento {
  id: string;
  dataOra: Date;
  tipo: 'Richiesta' | 'Confermato' | 'Completato' | 'Annullato';
  nomeCliente: string;
  servizio: string;
  indirizzo?: string;
  note?: string;
}

const mockAppuntamenti: Appuntamento[] = [
  { id: 'app001', dataOra: new Date('2024-08-01T10:00:00'), tipo: 'Confermato', nomeCliente: 'Mario Rossi', servizio: 'Riparazione Idraulica', indirizzo: 'Via Roma 1' },
  { id: 'app002', dataOra: new Date('2024-08-01T14:00:00'), tipo: 'Richiesta', nomeCliente: 'Laura Bianchi', servizio: 'Installazione Condizionatore', note: 'Verificare misure' },
  { id: 'app003', dataOra: new Date('2024-08-02T11:30:00'), tipo: 'Confermato', nomeCliente: 'Giuseppe Verdi', servizio: 'Consulenza Web Design', indirizzo: 'Online Meeting' },
  { id: 'app004', dataOra: new Date('2024-08-03T09:00:00'), tipo: 'Richiesta', nomeCliente: 'Anna Neri', servizio: 'Manutenzione Caldaia' },
  { id: 'app005', dataOra: new Date('2024-08-03T16:00:00'), tipo: 'Completato', nomeCliente: 'Luca Gialli', servizio: 'Creazione Logo' },
  { id: 'app006', dataOra: new Date('2024-08-04T10:00:00'), tipo: 'Annullato', nomeCliente: 'Franco Azzurro', servizio: 'Lezione Chitarra' },
];

// Placeholder for a basic calendar view component
const CalendarViewMock: React.FC<{ appointments: Appuntamento[] }> = ({ appointments }) => {
  // This would typically be a library like React Big Calendar, FullCalendar, etc.
  // For now, just a simple list of dates with appointments for mock purposes.
  const appointmentsByDate: { [key: string]: Appuntamento[] } = {};
  appointments.forEach(app => {
    const dateKey = app.dataOra.toLocaleDateString();
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(app);
  });

  return (
    <div className={styles.calendarViewMock}>
      <Titolo livello={4} className={styles.calendarTitle}>Vista Calendario (Mock)</Titolo>
      {Object.keys(appointmentsByDate).sort((a,b) => new Date(a).getTime() - new Date(b).getTime() ).map(dateKey => (
        <div key={dateKey} className={styles.calendarDateBlock}>
          <h5 className={styles.calendarDate}>{dateKey}</h5>
          <ul>
            {appointmentsByDate[dateKey].map(app => (
              <li key={app.id} className={`${styles.calendarEvent} ${styles[app.tipo.toLowerCase()]}`}>
                {app.dataOra.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {app.nomeCliente} ({app.servizio}) - <Link to={`/dashboard/professionista/appuntamenti/${app.id}`}>Dettagli</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {Object.keys(appointmentsByDate).length === 0 && <Paragrafo>Nessun appuntamento nel calendario.</Paragrafo>}
    </div>
  );
};


const CalendarioAppuntamenti: React.FC = () => {
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>(mockAppuntamenti);

  const richiestePendenti = appuntamenti.filter(app => app.tipo === 'Richiesta');
  const appuntamentiConfermati = appuntamenti.filter(app => app.tipo === 'Confermato');

  const handleAccettaRichiesta = (id: string) => {
    alert(`Richiesta ${id} accettata (simulazione).`);
    setAppuntamenti(prev => prev.map(app => app.id === id ? { ...app, tipo: 'Confermato' } : app));
  };

  const handleRifiutaRichiesta = (id: string) => {
    alert(`Richiesta ${id} rifiutata (simulazione).`);
    setAppuntamenti(prev => prev.map(app => app.id === id ? { ...app, tipo: 'Annullato' } : app));
  };
  
  const handleModificaAppuntamento = (id: string) => {
    alert(`Modifica appuntamento ${id} (simulazione).`);
    // Navigate to detail/edit page
  };

  const handleAnnullaAppuntamento = (id: string) => {
    alert(`Annulla appuntamento ${id} (simulazione).`);
    setAppuntamenti(prev => prev.map(app => app.id === id ? { ...app, tipo: 'Annullato' } : app));
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Titolo livello={2} className={styles.titoloPagina}>Calendario e Appuntamenti</Titolo>
        <Link to="/dashboard/professionista/impostazioni/disponibilita"> 
          {/* Assuming a route like this for availability settings */}
          <Bottone variante="secondario">Impostazioni Disponibilità</Bottone>
        </Link>
      </div>

      <CalendarViewMock appointments={appuntamenti.filter(a => a.tipo === 'Confermato' || a.tipo === 'Completato')} />

      <div className={styles.listeContainer}>
        <div className={styles.listaAppuntamenti}>
          <Titolo livello={3} className={styles.titoloLista}>Richieste di Appuntamento Pendenti ({richiestePendenti.length})</Titolo>
          {richiestePendenti.length > 0 ? (
            <ul>
              {richiestePendenti.map(app => (
                <li key={app.id} className={styles.appuntamentoItem}>
                  <span>{app.dataOra.toLocaleString()} - {app.nomeCliente} ({app.servizio})</span>
                  <div className={styles.azioniLista}>
                    <Bottone onClick={() => handleAccettaRichiesta(app.id)} piccola variante="successo">Accetta</Bottone>
                    <Bottone onClick={() => handleRifiutaRichiesta(app.id)} piccola variante="pericolo" outline>Rifiuta</Bottone>
                    <Link to={`/dashboard/professionista/appuntamenti/${app.id}`}>
                        <Bottone piccola variante="primario" outline>Dettagli</Bottone>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Paragrafo>Nessuna richiesta di appuntamento pendente.</Paragrafo>
          )}
        </div>

        <div className={styles.listaAppuntamenti}>
          <Titolo livello={3} className={styles.titoloLista}>Appuntamenti Confermati ({appuntamentiConfermati.length})</Titolo>
          {appuntamentiConfermati.length > 0 ? (
            <ul>
              {appuntamentiConfermati.map(app => (
                <li key={app.id} className={styles.appuntamentoItem}>
                  <span>{app.dataOra.toLocaleString()} - {app.nomeCliente} ({app.servizio})</span>
                  <div className={styles.azioniLista}>
                    <Bottone onClick={() => handleAnnullaAppuntamento(app.id)} piccola variante="pericolo" outline>Annulla</Bottone>
                     <Link to={`/dashboard/professionista/appuntamenti/${app.id}`}>
                        <Bottone piccola variante="primario" outline>Dettagli/Modifica</Bottone>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Paragrafo>Nessun appuntamento confermato.</Paragrafo>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioAppuntamenti;
