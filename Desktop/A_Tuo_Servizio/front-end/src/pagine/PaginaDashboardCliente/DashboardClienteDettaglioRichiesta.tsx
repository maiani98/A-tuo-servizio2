import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './DashboardClienteDettaglioRichiesta.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
// Assumiamo che le classi di stato siano globali o importate da DashboardClienteRichieste.module.css se necessario
// Per ora, le duplicherò semplificate in DashboardClienteDettaglioRichiesta.module.css

// --- Interfacce Dati ---
interface Allegato {
  nome: string;
  url: string; // URL per il download/visualizzazione
}

interface PreventivoProfessionistaDati {
  dataInvio: string; // YYYY-MM-DD
  prezzoProposto: string; // Es. "€150 - €200", "€180", "Su preventivo dettagliato"
  descrizioneOfferta: string;
  termini?: string; // Es. "Pagamento 50% anticipato, saldo a fine lavori"
  validita?: string; // Es. "Offerta valida per 15 giorni"
  allegatiProfessionista?: Allegato[];
}

export interface RichiestaPreventivoCliente { // Esportata per poterla usare nei mock se necessario
  id: string;
  dataInvio: string;
  nomeProfessionista: string;
  idProfessionista: string;
  servizioRichiesto: string;
  descrizioneDettagliataCliente?: string; // Aggiunta per dettaglio
  allegatiCliente?: Allegato[];
  stato: 'Inviata' | 'Visualizzata' | 'Preventivo Ricevuto' | 'Accettato' | 'Rifiutato' | 'Completato' | 'Annullata';
  ultimoAggiornamento: string;
  preventivoRicevuto?: PreventivoProfessionistaDati;
}

interface CronologiaStatoRichiesta {
  data: string; // YYYY-MM-DD HH:mm
  stato: RichiestaPreventivoCliente['stato']; // Usa lo stesso tipo di stato
  nota?: string;
}

// --- Dati Mock (per la pagina di dettaglio) ---
const richiesteMockDb: RichiestaPreventivoCliente[] = [
  { 
    id: 'rq1', 
    dataInvio: '2024-04-10', 
    nomeProfessionista: 'Mario Rossi Idraulica', 
    idProfessionista: '123', 
    servizioRichiesto: 'Riparazione perdita cucina', 
    descrizioneDettagliataCliente: "C'è una perdita sotto il lavello della cucina, sembra provenire dal sifone. Vorrei un controllo e riparazione.",
    allegatiCliente: [{ nome: 'foto_perdita.jpg', url: '#' }],
    stato: 'Preventivo Ricevuto', 
    ultimoAggiornamento: '2024-04-12',
    preventivoRicevuto: {
      dataInvio: '2024-04-12',
      prezzoProposto: '€70 - €90 (in base al materiale da sostituire)',
      descrizioneOfferta: 'Sostituzione sifone e verifica tenuta guarnizioni. Include manodopera e materiali standard.',
      termini: 'Pagamento alla conclusione del lavoro.',
      validita: 'Offerta valida per 7 giorni.',
      allegatiProfessionista: [{nome: 'dettaglio_costi_materiali.pdf', url: '#'}]
    }
  },
  { 
    id: 'rq2', 
    dataInvio: '2024-04-05', 
    nomeProfessionista: 'Laura Bianchi Architettura', 
    idProfessionista: '456', 
    servizioRichiesto: 'Progettazione nuovo layout appartamento', 
    descrizioneDettagliataCliente: "Vorrei ridisegnare il layout del mio bilocale per ottimizzare gli spazi, in particolare la zona giorno.",
    stato: 'Accettato', 
    ultimoAggiornamento: '2024-04-15',
    preventivoRicevuto: { // Aggiungo un preventivo anche se già accettato per completezza
        dataInvio: '2024-04-08',
        prezzoProposto: '€1200 (Progettazione preliminare e definitiva)',
        descrizioneOfferta: 'Include sopralluogo, 2 proposte di layout, disegni tecnici principali.',
        validita: 'Offerta valida per 30 giorni.'
    }
  },
  { 
    id: 'rq4', 
    dataInvio: '2024-04-18', 
    nomeProfessionista: 'Sofia Neri Dog Sitting', 
    idProfessionista: '101', 
    servizioRichiesto: 'Dog sitting per weekend', 
    descrizioneDettagliataCliente: "Avrei bisogno di qualcuno che si prenda cura del mio cane (taglia media, molto socievole) per il weekend del 10-12 Maggio.",
    stato: 'Inviata', 
    ultimoAggiornamento: '2024-04-18' 
  },
];

const cronologiaMockDb: { [key: string]: CronologiaStatoRichiesta[] } = {
  'rq1': [
    { data: '2024-04-10 10:30', stato: 'Inviata', nota: 'Richiesta inviata al professionista.' },
    { data: '2024-04-11 09:15', stato: 'Visualizzata', nota: 'Il professionista ha visualizzato la tua richiesta.' },
    { data: '2024-04-12 16:45', stato: 'Preventivo Ricevuto', nota: 'Preventivo disponibile per la revisione.' },
  ],
  'rq2': [
    { data: '2024-04-05 14:00', stato: 'Inviata' },
    { data: '2024-04-08 11:00', stato: 'Preventivo Ricevuto' },
    { data: '2024-04-15 10:00', stato: 'Accettato', nota: 'Preventivo accettato. Lavori in programmazione.' },
  ],
  'rq4': [
    { data: '2024-04-18 09:00', stato: 'Inviata' },
  ]
};

// Funzione helper per ottenere la classe CSS in base allo stato (riutilizzata)
const getClasseStato = (stato: RichiestaPreventivoCliente['stato']): string => {
  switch (stato) {
    case 'Inviata': return styles.statoInviata;
    case 'Visualizzata': return styles.statoVisualizzata;
    case 'Preventivo Ricevuto': return styles.statoPreventivoRicevuto;
    case 'Accettato': return styles.statoAccettato;
    case 'Rifiutato': case 'Annullata': return styles.statoRifiutato;
    case 'Completato': return styles.statoCompletato;
    default: return '';
  }
};

const IconaFile = () => <span aria-hidden="true" style={{marginRight: '0.3em'}}>📄</span>;
const IconaIndietro = () => <span aria-hidden="true" style={{marginRight: '0.3em'}}>‹</span>;


const DashboardClienteDettaglioRichiesta: React.FC = () => {
  const { idRichiesta } = useParams<{ idRichiesta: string }>();
  const navigate = useNavigate();
  const [dettaglioRichiesta, setDettaglioRichiesta] = useState<RichiestaPreventivoCliente | null | undefined>(undefined); // undefined per stato iniziale di caricamento
  const [cronologiaStati, setCronologiaStati] = useState<CronologiaStatoRichiesta[]>([]);

  useEffect(() => {
    console.log("Caricamento dettaglio richiesta per ID:", idRichiesta);
    // Simula fetch dati
    const richiestaTrovata = richiesteMockDb.find(r => r.id === idRichiesta);
    const cronologiaTrovata = idRichiesta ? cronologiaMockDb[idRichiesta] : [];
    
    setTimeout(() => { // Simula ritardo API
        setDettaglioRichiesta(richiestaTrovata || null); // null se non trovata
        setCronologiaStati(cronologiaTrovata || []);
    }, 500);

  }, [idRichiesta]);

  const handleAzionePreventivo = (azione: 'accetta' | 'rifiuta') => {
    if (!dettaglioRichiesta) return;
    // Logica Mock
    console.log(`Azione: ${azione} preventivo per richiesta ${dettaglioRichiesta.id}`);
    alert(`Preventivo ${azione === 'accetta' ? 'accettato' : 'rifiutato'} (mock). Lo stato della richiesta verrà aggiornato.`);
    // In un'app reale: chiamata API, poi aggiorna stato e cronologia.
    // Esempio di aggiornamento mock:
    const nuovoStato = azione === 'accetta' ? 'Accettato' : 'Rifiutato';
    setDettaglioRichiesta(prev => prev ? {...prev, stato: nuovoStato } : null);
    setCronologiaStati(prev => [
        ...prev,
        { data: new Date().toISOString().slice(0,16).replace('T',' '), stato: nuovoStato, nota: `Preventivo ${azione === 'accetta' ? 'accettato' : 'rifiutato'} dal cliente.`}
    ]);
  };


  if (dettaglioRichiesta === undefined) {
    return <Paragrafo className={styles.messaggioCaricamento}>Caricamento dettagli richiesta...</Paragrafo>;
  }

  if (!dettaglioRichiesta) {
    return (
      <div>
        <Link to="../richieste" className={styles.tornaAlleRichiesteLink}><IconaIndietro />Torna alle richieste</Link>
        <Titolo livello={2} className={styles.titoloSezioneDashboard}>Dettaglio Richiesta</Titolo>
        <Paragrafo className={styles.messaggioCaricamento}>Richiesta non trovata.</Paragrafo>
      </div>
    );
  }

  return (
    <div className={styles.dettaglioRichiestaContainer}>
      <Link to="../richieste" className={styles.tornaAlleRichiesteLink}><IconaIndietro />Torna alle richieste</Link>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        Richiesta per: "{dettaglioRichiesta.servizioRichiesto}"
      </Titolo>

      {/* Riepilogo Richiesta Inviata */}
      <section className={styles.sezioneDettaglio}>
        <h3>Dettagli della Tua Richiesta</h3>
        <dl className={styles.infoGrid}>
          <dt>Data Invio:</dt>
          <dd>{new Date(dettaglioRichiesta.dataInvio).toLocaleDateString('it-IT')}</dd>
          
          <dt>Professionista:</dt>
          <dd><Link to={`/profilo/${dettaglioRichiesta.idProfessionista}`}>{dettaglioRichiesta.nomeProfessionista}</Link></dd>
          
          <dt>Servizio Richiesto:</dt>
          <dd>{dettaglioRichiesta.servizioRichiesto}</dd>
          
          {dettaglioRichiesta.descrizioneDettagliataCliente && (
            <>
              <dt>Descrizione:</dt>
              <dd style={{whiteSpace: 'pre-wrap'}}>{dettaglioRichiesta.descrizioneDettagliataCliente}</dd>
            </>
          )}

          {dettaglioRichiesta.allegatiCliente && dettaglioRichiesta.allegatiCliente.length > 0 && (
            <>
              <dt>Allegati Inviati:</dt>
              <dd>
                <ul className={styles.allegatiLista}>
                  {dettaglioRichiesta.allegatiCliente.map((allegato, index) => (
                    <li key={index}><Link to={allegato.url} target="_blank" rel="noopener noreferrer"><IconaFile />{allegato.nome}</Link></li>
                  ))}
                </ul>
              </dd>
            </>
          )}
           <dt>Stato Attuale:</dt>
           <dd><span className={`${styles.statoRichiesta} ${getClasseStato(dettaglioRichiesta.stato)}`}>{dettaglioRichiesta.stato}</span></dd>
        </dl>
      </section>

      {/* Sezione Preventivo Ricevuto */}
      {dettaglioRichiesta.preventivoRicevuto && (
        <section className={styles.sezioneDettaglio}>
          <h3 className={styles.titoloPreventivo}>Preventivo Ricevuto da {dettaglioRichiesta.nomeProfessionista}</h3>
          <dl className={styles.infoGrid}>
            <dt>Data Preventivo:</dt>
            <dd>{new Date(dettaglioRichiesta.preventivoRicevuto.dataInvio).toLocaleDateString('it-IT')}</dd>

            <dt>Prezzo Proposto:</dt>
            <dd><strong>{dettaglioRichiesta.preventivoRicevuto.prezzoProposto}</strong></dd>

            <dt>Descrizione Offerta:</dt>
            <dd style={{whiteSpace: 'pre-wrap'}}>{dettaglioRichiesta.preventivoRicevuto.descrizioneOfferta}</dd>

            {dettaglioRichiesta.preventivoRicevuto.termini && (
              <>
                <dt>Termini:</dt>
                <dd>{dettaglioRichiesta.preventivoRicevuto.termini}</dd>
              </>
            )}
            {dettaglioRichiesta.preventivoRicevuto.validita && (
              <>
                <dt>Validità Offerta:</dt>
                <dd>{dettaglioRichiesta.preventivoRicevuto.validita}</dd>
              </>
            )}
            {dettaglioRichiesta.preventivoRicevuto.allegatiProfessionista && dettaglioRichiesta.preventivoRicevuto.allegatiProfessionista.length > 0 && (
              <>
                <dt>Allegati Preventivo:</dt>
                <dd>
                  <ul className={styles.allegatiLista}>
                    {dettaglioRichiesta.preventivoRicevuto.allegatiProfessionista.map((allegato, index) => (
                      <li key={index}><Link to={allegato.url} target="_blank" rel="noopener noreferrer"><IconaFile />{allegato.nome}</Link></li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>

          {/* CTA solo se lo stato permette azioni (es. se è 'Preventivo Ricevuto') */}
          {dettaglioRichiesta.stato === 'Preventivo Ricevuto' && (
            <div className={styles.azioniPreventivo}>
              <Bottone variante="primario" onClick={() => handleAzionePreventivo('accetta')}>Accetta Preventivo</Bottone>
              <Bottone variante="secondario" onClick={() => handleAzionePreventivo('rifiuta')}>Rifiuta Preventivo</Bottone>
              <Bottone variante="outline" onClick={() => navigate(`/dashboard-cliente/messaggi?nuovo=${dettaglioRichiesta.idProfessionista}&richiesta=${dettaglioRichiesta.id}`)}>Contatta per Chiarimenti</Bottone>
            </div>
          )}
        </section>
      )}

      {/* Sezione Cronologia Stato */}
      {cronologiaStati.length > 0 && (
        <section className={`${styles.sezioneDettaglio} ${styles.cronologiaStati}`}>
          <h3>Cronologia Stato Richiesta</h3>
          <ul>
            {cronologiaStati.slice().reverse().map((item, index) => ( // .slice().reverse() per mostrare dal più recente
              <li key={index}>
                <div className={styles.infoStato}>
                    <span className={styles.dataStato}>{new Date(item.data).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`${styles.statoRichiesta} ${getClasseStato(item.stato)} ${styles.nomeStato}`}>{item.stato}</span>
                    {item.nota && <Paragrafo className={styles.notaStato}>{item.nota}</Paragrafo>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DashboardClienteDettaglioRichiesta;
