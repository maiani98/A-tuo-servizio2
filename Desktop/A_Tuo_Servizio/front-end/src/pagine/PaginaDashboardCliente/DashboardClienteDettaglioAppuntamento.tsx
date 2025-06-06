import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './DashboardClienteDettaglioAppuntamento.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

// Interfaccia AppuntamentoCliente (copiata da B8 per riferimento)
export interface AppuntamentoCliente {
  id: string;
  dataOra: string; 
  nomeProfessionista: string;
  idProfessionista: string;
  servizio: string;
  stato: 'Richiesto' | 'Confermato' | 'Completato' | 'AnnullatoDalCliente' | 'AnnullatoDalProfessionista';
  luogo?: string;
  note?: string;
}

// Dati Mock (copiati da B8 per riferimento, in un'app reale verrebbero da uno store/API)
const appuntamentiMockDb: AppuntamentoCliente[] = [
  { id: 'app1', dataOra: '2024-05-10 10:00', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizio: 'Riparazione perdita cucina', stato: 'Confermato', luogo: 'Via Roma 1, 00100 Roma', note: 'Controllare anche rubinetto bagno se possibile.' },
  { id: 'app2', dataOra: '2024-05-15 15:30', nomeProfessionista: 'Laura Bianchi Architettura', idProfessionista: '456', servizio: 'Consulto per ristrutturazione', stato: 'Richiesto', luogo: 'Online' },
  { id: 'app3', dataOra: '2024-04-20 09:00', nomeProfessionista: 'Giuseppe Verdi Giardinaggio', idProfessionista: '789', servizio: 'Potatura siepi', stato: 'Completato', note: 'Lavoro eccellente!' },
  { id: 'app4', dataOra: '2024-05-25 14:00', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizio: 'Installazione rubinetto bagno', stato: 'Confermato', luogo: 'Via Roma 1, 00100 Roma' },
  { id: 'app5', dataOra: '2024-04-10 11:00', nomeProfessionista: 'Sofia Neri Dog Sitting', idProfessionista: '101', servizio: 'Colloquio conoscitivo', stato: 'AnnullatoDalCliente', luogo: 'Parco Centrale' },
];

// Funzione helper per ottenere la classe CSS in base allo stato (copiata da B8)
const getClasseStatoAppuntamento = (stato: AppuntamentoCliente['stato']): string => {
  switch (stato) {
    case 'Richiesto': return styles.statoRichiesto;
    case 'Confermato': return styles.statoConfermato;
    case 'Completato': return styles.statoCompletato;
    case 'AnnullatoDalCliente': return styles.statoAnnullatoDalCliente;
    case 'AnnullatoDalProfessionista': return styles.statoAnnullatoDalProfessionista;
    default: return '';
  }
};

// Funzione per formattare data e ora (copiata da B8)
const formattaDataOra = (dataOraString: string): string => {
  const data = new Date(dataOraString);
  return `${data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} alle ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
};

const IconaIndietro = () => <span aria-hidden="true" style={{marginRight: '0.3em'}}>‹</span>;


const DashboardClienteDettaglioAppuntamento: React.FC = () => {
  const { idAppuntamento } = useParams<{ idAppuntamento: string }>();
  const navigate = useNavigate();
  const [dettaglioAppuntamento, setDettaglioAppuntamento] = useState<AppuntamentoCliente | null | undefined>(undefined);

  useEffect(() => {
    console.log("Caricamento dettaglio appuntamento per ID:", idAppuntamento);
    // Simula fetch dati
    const appTrovato = appuntamentiMockDb.find(app => app.id === idAppuntamento);
    
    setTimeout(() => { // Simula ritardo API
        setDettaglioAppuntamento(appTrovato || null);
    }, 300);

  }, [idAppuntamento]);

  const handleAnnullaAppuntamento = () => {
    if (!dettaglioAppuntamento) return;
    if (window.confirm(`Sei sicuro di voler annullare l'appuntamento per "${dettaglioAppuntamento.servizio}" con ${dettaglioAppuntamento.nomeProfessionista}?`)) {
        console.log(`Appuntamento ${dettaglioAppuntamento.id} annullato dal cliente (mock).`);
        alert("Appuntamento annullato (mock).");
        // In un'app reale: chiamata API per annullare, poi aggiorna lo stato locale o rifai il fetch.
        setDettaglioAppuntamento(prev => prev ? { ...prev, stato: 'AnnullatoDalCliente' } : null);
    }
  };
  
  const handleModificaAppuntamento = () => {
      if(!dettaglioAppuntamento) return;
      alert(`Logica per modificare appuntamento ${dettaglioAppuntamento.id} (mock). Potrebbe reindirizzare a una pagina di modifica o aprire un modale.`);
  };

  if (dettaglioAppuntamento === undefined) {
    return <Paragrafo className={styles.messaggioCaricamento}>Caricamento dettagli appuntamento...</Paragrafo>;
  }

  if (!dettaglioAppuntamento) {
    return (
      <div className={styles.dettaglioContainer}>
        <Link to="../appuntamenti" className={styles.tornaAgliAppuntamentiLink}><IconaIndietro />Torna agli appuntamenti</Link>
        <Titolo livello={2} className={styles.titoloSezioneDashboard}>Dettaglio Appuntamento</Titolo>
        <Paragrafo className={styles.messaggioNonTrovato}>Appuntamento non trovato.</Paragrafo>
      </div>
    );
  }

  const puoAnnullare = dettaglioAppuntamento.stato === 'Richiesto' || dettaglioAppuntamento.stato === 'Confermato';
  const puoModificare = dettaglioAppuntamento.stato === 'Richiesto' || dettaglioAppuntamento.stato === 'Confermato';
  const puoRecensire = dettaglioAppuntamento.stato === 'Completato';

  return (
    <div className={styles.dettaglioContainer}>
      <Link to="../appuntamenti" className={styles.tornaAgliAppuntamentiLink}><IconaIndietro />Torna agli appuntamenti</Link>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        Appuntamento per "{dettaglioAppuntamento.servizio}"
      </Titolo>

      <section className={styles.sezioneDettaglioApp}>
        <h3>Dettagli Prenotazione</h3>
        <dl className={styles.infoGridApp}>
          <dt className={styles.labelInfo}>Data e Ora:</dt>
          <dd className={styles.valoreInfo}>{formattaDataOra(dettaglioAppuntamento.dataOra)}</dd>
          
          <dt className={styles.labelInfo}>Professionista:</dt>
          <dd className={styles.valoreInfo}>
            <Link to={`/profilo/${dettaglioAppuntamento.idProfessionista}`}>{dettaglioAppuntamento.nomeProfessionista}</Link>
          </dd>
          
          <dt className={styles.labelInfo}>Servizio:</dt>
          <dd className={styles.valoreInfo}>{dettaglioAppuntamento.servizio}</dd>
          
          {dettaglioAppuntamento.luogo && (
            <>
              <dt className={styles.labelInfo}>Luogo:</dt>
              <dd className={styles.valoreInfo}>{dettaglioAppuntamento.luogo}</dd>
            </>
          )}

          {dettaglioAppuntamento.note && (
            <>
              <dt className={styles.labelInfo}>Note Cliente:</dt>
              <dd className={styles.valoreInfo} style={{whiteSpace: 'pre-wrap'}}>{dettaglioAppuntamento.note}</dd>
            </>
          )}

          <dt className={styles.labelInfo}>Stato Attuale:</dt>
          <dd className={styles.valoreInfo}>
            <span className={`${styles.statoAppuntamento} ${getClasseStatoAppuntamento(dettaglioAppuntamento.stato)}`}>
              {dettaglioAppuntamento.stato}
            </span>
          </dd>
        </dl>
      </section>

      <section className={`${styles.sezioneDettaglioApp} ${styles.azioniAppuntamentoDettaglio}`}>
        <h3>Azioni</h3>
        <Bottone 
            onClick={() => navigate(`/dashboard-cliente/messaggi?nuovo=${dettaglioAppuntamento.idProfessionista}&appuntamento=${dettaglioAppuntamento.id}`)} 
            variante="outline"
        >
            Contatta Professionista
        </Bottone>

        {puoModificare && (
            <Bottone onClick={handleModificaAppuntamento} variante="secondario">
                Modifica Appuntamento
            </Bottone>
        )}

        {puoAnnullare && (
          <Bottone onClick={handleAnnullaAppuntamento} variante="danger_outline">
            Annulla Appuntamento
          </Bottone>
        )}
        
        {puoRecensire && (
          <Link to={`/scrivi-recensione/${dettaglioAppuntamento.idProfessionista}?appuntamentoId=${dettaglioAppuntamento.id}`}>
            <Bottone variante="primario">
              Lascia una Recensione
            </Bottone>
          </Link>
        )}
      </section>
    </div>
  );
};

export default DashboardClienteDettaglioAppuntamento;
