import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardClienteAppuntamenti.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
// import CampoSelect from '../../componenti/comuni/CampiInput/CampoSelect';
// import CampoTesto from '../../componenti/comuni/CampiInput/CampoTesto'; // Per filtro data

export interface AppuntamentoCliente {
  id: string;
  dataOra: string; // ISO string o stringa formato "YYYY-MM-DD HH:mm"
  nomeProfessionista: string;
  idProfessionista: string;
  servizio: string;
  stato: 'Richiesto' | 'Confermato' | 'Completato' | 'AnnullatoDalCliente' | 'AnnullatoDalProfessionista';
  luogo?: string;
  note?: string;
}

const appuntamentiMock: AppuntamentoCliente[] = [
  { id: 'app1', dataOra: '2024-05-10 10:00', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizio: 'Riparazione perdita cucina', stato: 'Confermato', luogo: 'Via Roma 1, 00100 Roma' },
  { id: 'app2', dataOra: '2024-05-15 15:30', nomeProfessionista: 'Laura Bianchi Architettura', idProfessionista: '456', servizio: 'Consulto per ristrutturazione', stato: 'Richiesto', luogo: 'Online' },
  { id: 'app3', dataOra: '2024-04-20 09:00', nomeProfessionista: 'Giuseppe Verdi Giardinaggio', idProfessionista: '789', servizio: 'Potatura siepi', stato: 'Completato', note: 'Lavoro eccellente!' },
  { id: 'app4', dataOra: '2024-05-25 14:00', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizio: 'Installazione rubinetto bagno', stato: 'Confermato', luogo: 'Via Roma 1, 00100 Roma' },
  { id: 'app5', dataOra: '2024-04-10 11:00', nomeProfessionista: 'Sofia Neri Dog Sitting', idProfessionista: '101', servizio: 'Colloquio conoscitivo', stato: 'AnnullatoDalCliente', luogo: 'Parco Centrale' },
];

// Funzione helper per ottenere la classe CSS in base allo stato
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

// Funzione per formattare data e ora
const formattaDataOra = (dataOraString: string): string => {
  const data = new Date(dataOraString);
  return `${data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} alle ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
};

const IconaCalendarioPlaceholder = () => <span className={styles.iconaCalendarioPlaceholder} aria-hidden="true">📅</span>;


const DashboardClienteAppuntamenti: React.FC = () => {
  const [appuntamentiVisualizzati, setAppuntamentiVisualizzati] = useState<AppuntamentoCliente[]>(appuntamentiMock);
  const [filtroStatoApp, setFiltroStatoApp] = useState<string>('Tutti');
  const [filtroDataApp, setFiltroDataApp] = useState<string>('');
  const [vistaAppuntamenti, setVistaAppuntamenti] = useState<'lista' | 'calendario'>('lista');

  useEffect(() => {
    let appFiltrati = [...appuntamentiMock];
    if (filtroStatoApp !== 'Tutti') {
      appFiltrati = appFiltrati.filter(app => app.stato === filtroStatoApp);
    }
    if (filtroDataApp) {
      // Filtra per appuntamenti DA questa data in poi (semplice confronto stringa ISO)
      appFiltrati = appFiltrati.filter(app => app.dataOra.substring(0,10) >= filtroDataApp);
    }
    // Si potrebbe aggiungere un ordinamento per data
    appFiltrati.sort((a, b) => new Date(b.dataOra).getTime() - new Date(a.dataOra).getTime()); // Dal più recente
    setAppuntamentiVisualizzati(appFiltrati);
  }, [filtroStatoApp, filtroDataApp]);

  const handleStatoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroStatoApp(event.target.value);
  };

  const handleDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroDataApp(event.target.value);
  };
  
  const resetFiltri = () => {
    setFiltroStatoApp('Tutti');
    setFiltroDataApp('');
  };

  return (
    <div className={styles.containerAppuntamenti}>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        I Miei Appuntamenti
      </Titolo>

      <div className={styles.controlliAppuntamenti}>
        <div className={styles.filtriAppuntamenti}>
            <div className={styles.filtroGruppo}>
            <label htmlFor="filtro-stato-app">Stato:</label>
            <select id="filtro-stato-app" value={filtroStatoApp} onChange={handleStatoChange}>
                <option value="Tutti">Tutti</option>
                <option value="Richiesto">Richiesto</option>
                <option value="Confermato">Confermato</option>
                <option value="Completato">Completato</option>
                <option value="AnnullatoDalCliente">Annullato da me</option>
                <option value="AnnullatoDalProfessionista">Annullato dal Professionista</option>
            </select>
            </div>
            <div className={styles.filtroGruppo}>
            <label htmlFor="filtro-data-app">A partire dal:</label>
            <input type="date" id="filtro-data-app" value={filtroDataApp} onChange={handleDataChange} />
            </div>
            <Bottone onClick={resetFiltri} variante="outline" size="medium" style={{alignSelf: 'flex-end'}}>Resetta</Bottone>
        </div>
        <div className={styles.toggleVistaAppuntamenti}>
          <button onClick={() => setVistaAppuntamenti('lista')} className={vistaAppuntamenti === 'lista' ? styles.attivo : ''}>Lista</button>
          <button onClick={() => setVistaAppuntamenti('calendario')} className={vistaAppuntamenti === 'calendario' ? styles.attivo : ''}>Calendario</button>
        </div>
      </div>

      {vistaAppuntamenti === 'lista' ? (
        appuntamentiVisualizzati.length > 0 ? (
          <div className={styles.listaAppuntamenti}>
            {appuntamentiVisualizzati.map((app) => (
              <div key={app.id} className={styles.cardAppuntamento}>
                <div className={styles.cardHeader}>
                    <span className={styles.dataOraAppuntamento}>{formattaDataOra(app.dataOra)}</span>
                    <span className={`${styles.statoAppuntamento} ${getClasseStatoAppuntamento(app.stato)}`}>
                        {app.stato}
                    </span>
                </div>
                <div className={styles.dettagliAppuntamento}>
                  <Paragrafo><strong>Servizio:</strong> {app.servizio}</Paragrafo>
                  <Paragrafo>
                    <strong>Professionista:</strong>{' '}
                    <Link to={`/profilo/${app.idProfessionista}`}>{app.nomeProfessionista}</Link>
                  </Paragrafo>
                  {app.luogo && <Paragrafo><strong>Luogo:</strong> {app.luogo}</Paragrafo>}
                  {app.note && <Paragrafo><strong>Note:</strong> {app.note}</Paragrafo>}
                </div>
                <div className={styles.azioniAppuntamento}>
                  <Link to={`/dashboard-cliente/appuntamenti/${app.id}`}> {/* Route dettaglio placeholder */}
                    <Bottone size="small" variante="outline">Dettagli</Bottone>
                  </Link>
                  {app.stato === 'Confermato' && <Bottone size="small" variante="danger_outline" onClick={() => alert(`Annulla appuntamento ${app.id} (mock)`)}>Annulla</Bottone>}
                  {app.stato === 'Completato' && <Bottone size="small" variante="primario" onClick={() => alert(`Lascia recensione per ${app.id} (mock)`)}>Lascia Recensione</Bottone>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Paragrafo className={styles.messaggioNessunAppuntamento}>
            Nessun appuntamento trovato {filtroStatoApp !== 'Tutti' || filtroDataApp ? 'per i filtri selezionati' : 'al momento'}.
          </Paragrafo>
        )
      ) : (
        <div className={styles.calendarioPlaceholder}>
            <IconaCalendarioPlaceholder />
            <Titolo livello={3}>Visualizzazione Calendario</Titolo>
            <Paragrafo>Questa funzionalità sarà disponibile prossimamente e ti permetterà di vedere i tuoi appuntamenti in un formato calendario interattivo.</Paragrafo>
        </div>
      )}
    </div>
  );
};

export default DashboardClienteAppuntamenti;
