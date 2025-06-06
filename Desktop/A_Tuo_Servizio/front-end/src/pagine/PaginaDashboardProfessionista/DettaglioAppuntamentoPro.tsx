import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './DettaglioAppuntamentoPro.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

// Mock data - In a real app, this would come from a fetch based on `idAppuntamento`
// Re-using mockAppuntamenti from CalendarioAppuntamenti for consistency
const mockAppuntamenti = [
  { id: 'app001', dataOra: new Date('2024-08-01T10:00:00'), tipo: 'Confermato' as const, nomeCliente: 'Mario Rossi', servizio: 'Riparazione Idraulica', indirizzo: 'Via Roma 1, 00100 Roma', emailCliente: 'mario.rossi@example.com', telefonoCliente: '3331234567', noteInterne: 'Ricordarsi chiave inglese da 12.' },
  { id: 'app002', dataOra: new Date('2024-08-01T14:00:00'), tipo: 'Richiesta' as const, nomeCliente: 'Laura Bianchi', servizio: 'Installazione Condizionatore', note: 'Verificare misure per unità esterna.', emailCliente: 'laura.bianchi@example.com', telefonoCliente: '3347654321' },
  { id: 'app003', dataOra: new Date('2024-08-02T11:30:00'), tipo: 'Confermato' as const, nomeCliente: 'Giuseppe Verdi', servizio: 'Consulenza Web Design', indirizzo: 'Online Meeting via Zoom (link: zoom.us/xxx)', emailCliente: 'g.verdi@example.com', telefonoCliente: '3350000000' },
];

const DettaglioAppuntamentoPro: React.FC = () => {
  const { idAppuntamento } = useParams<{ idAppuntamento: string }>();
  const navigate = useNavigate();

  const appuntamento = mockAppuntamenti.find(app => app.id === idAppuntamento);

  if (!appuntamento) {
    return (
      <div className={styles.container}>
        <Titolo livello={2}>Appuntamento non trovato</Titolo>
        <Paragrafo>L'appuntamento con ID "{idAppuntamento}" non è stato trovato.</Paragrafo>
        <Link to="/dashboard/professionista/calendario">
          <Bottone variante="secondario">Torna al Calendario</Bottone>
        </Link>
      </div>
    );
  }

  const handleModificaAppuntamento = () => {
    alert(`Modifica appuntamento ${idAppuntamento} (simulazione).`);
    // In a real app, this might navigate to an edit form or open a modal
  };

  const handleAnnullaAppuntamento = () => {
    if (window.confirm('Sei sicuro di voler annullare questo appuntamento?')) {
      alert(`Appuntamento ${idAppuntamento} annullato (simulazione).`);
      // Update state/backend, then navigate or update UI
      // appuntamento.tipo = 'Annullato'; // This won't persist in mock data
      navigate('/dashboard/professionista/calendario');
    }
  };
  
  const handleContattaCliente = () => {
    alert(`Contatta ${appuntamento.nomeCliente} (simulazione).`);
    // Navigate to chat or open mail client
  };

  const handleSegnaComeCompletato = () => {
    alert(`Appuntamento ${idAppuntamento} segnato come completato (simulazione).`);
    // Update state/backend
    // appuntamento.tipo = 'Completato';
    navigate('/dashboard/professionista/calendario');
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Titolo livello={2} className={styles.titoloPagina}>Dettaglio Appuntamento: {appuntamento.id}</Titolo>
        <span className={`${styles.statoBadge} ${styles[`stato${appuntamento.tipo}`]}`}>{appuntamento.tipo}</span>
      </div>

      <div className={styles.dettagliGrid}>
        <div className={styles.dettaglioItem}><strong>Cliente:</strong> {appuntamento.nomeCliente}</div>
        <div className={styles.dettaglioItem}><strong>Data e Ora:</strong> {appuntamento.dataOra.toLocaleString()}</div>
        <div className={styles.dettaglioItem}><strong>Servizio:</strong> {appuntamento.servizio}</div>
        {appuntamento.indirizzo && <div className={styles.dettaglioItem}><strong>Indirizzo:</strong> {appuntamento.indirizzo}</div>}
        {appuntamento.emailCliente && <div className={styles.dettaglioItem}><strong>Email Cliente:</strong> <a href={`mailto:${appuntamento.emailCliente}`}>{appuntamento.emailCliente}</a></div>}
        {appuntamento.telefonoCliente && <div className={styles.dettaglioItem}><strong>Telefono Cliente:</strong> <a href={`tel:${appuntamento.telefonoCliente}`}>{appuntamento.telefonoCliente}</a></div>}
        
        {appuntamento.note && 
          <div className={`${styles.dettaglioItem} ${styles.fullWidth}`}><strong>Note Cliente:</strong> <Paragrafo className={styles.noteBlock}>{appuntamento.note}</Paragrafo></div>
        }
        {appuntamento.noteInterne && 
          <div className={`${styles.dettaglioItem} ${styles.fullWidth}`}><strong>Note Interne (Solo Professionista):</strong> <Paragrafo className={styles.noteBlockPrivata}>{appuntamento.noteInterne}</Paragrafo></div>
        }
      </div>

      <div className={styles.azioniContainer}>
        {appuntamento.tipo === 'Richiesta' && (
          <>
            <Bottone onClick={() => alert('Accetta Richiesta (simulazione)')} variante="successo">Accetta Richiesta</Bottone>
            <Bottone onClick={() => alert('Rifiuta Richiesta (simulazione)')} variante="pericolo" outline>Rifiuta Richiesta</Bottone>
          </>
        )}
        {appuntamento.tipo === 'Confermato' && (
          <>
            <Bottone onClick={handleSegnaComeCompletato} variante="successo">Segna come Completato</Bottone>
            <Bottone onClick={handleModificaAppuntamento} variante="primario" outline>Modifica Appuntamento</Bottone>
            <Bottone onClick={handleAnnullaAppuntamento} variante="pericolo" outline>Annulla Appuntamento</Bottone>
          </>
        )}
         {appuntamento.tipo !== 'Annullato' && appuntamento.tipo !== 'Completato' && (
            <Bottone onClick={handleContattaCliente} variante="secondario">Contatta Cliente</Bottone>
         )}
      </div>

      <Link to="/dashboard/professionista/calendario" className={styles.linkIndietro}>
        <Bottone variante="terziario">Torna al Calendario</Bottone>
      </Link>
    </div>
  );
};

export default DettaglioAppuntamentoPro;
