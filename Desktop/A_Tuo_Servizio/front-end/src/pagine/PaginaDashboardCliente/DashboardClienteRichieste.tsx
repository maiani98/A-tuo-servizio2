import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardClienteRichieste.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
// import CampoSelect from '../../componenti/comuni/CampiInput/CampoSelect'; // Se disponibile
// import CampoTesto from '../../componenti/comuni/CampiInput/CampoTesto'; // Per filtro data

export interface RichiestaPreventivoCliente {
  id: string;
  dataInvio: string; // Formato YYYY-MM-DD o stringa leggibile
  nomeProfessionista: string;
  idProfessionista: string;
  servizioRichiesto: string;
  stato: 'Inviata' | 'Visualizzata' | 'Preventivo Ricevuto' | 'Accettato' | 'Rifiutato' | 'Completato' | 'Annullata';
  ultimoAggiornamento: string; // Formato YYYY-MM-DD o stringa leggibile
}

const richiesteMock: RichiestaPreventivoCliente[] = [
  { id: 'rq1', dataInvio: '2024-04-10', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizioRichiesto: 'Riparazione perdita cucina', stato: 'Preventivo Ricevuto', ultimoAggiornamento: '2024-04-12' },
  { id: 'rq2', dataInvio: '2024-04-05', nomeProfessionista: 'Laura Bianchi Architettura', idProfessionista: '456', servizioRichiesto: 'Progettazione nuovo layout appartamento', stato: 'Accettato', ultimoAggiornamento: '2024-04-15' },
  { id: 'rq3', dataInvio: '2024-03-20', nomeProfessionista: 'Giuseppe Verdi Giardinaggio', idProfessionista: '789', servizioRichiesto: 'Manutenzione giardino condominiale', stato: 'Completato', ultimoAggiornamento: '2024-04-01' },
  { id: 'rq4', dataInvio: '2024-04-18', nomeProfessionista: 'Sofia Neri Dog Sitting', idProfessionista: '101', servizioRichiesto: 'Dog sitting per weekend', stato: 'Inviata', ultimoAggiornamento: '2024-04-18' },
  { id: 'rq5', dataInvio: '2024-02-10', nomeProfessionista: 'Mario Rossi Idraulica', idProfessionista: '123', servizioRichiesto: 'Installazione box doccia', stato: 'Rifiutato', ultimoAggiornamento: '2024-02-15' },
];

// Funzione helper per ottenere la classe CSS in base allo stato
const getClasseStato = (stato: RichiestaPreventivoCliente['stato']): string => {
  switch (stato) {
    case 'Inviata': return styles.statoInviata;
    case 'Visualizzata': return styles.statoVisualizzata;
    case 'Preventivo Ricevuto': return styles.statoPreventivoRicevuto;
    case 'Accettato': return styles.statoAccettato;
    case 'Rifiutato':
    case 'Annullata':
      return styles.statoRifiutato; // Stesso stile per Rifiutato e Annullata
    case 'Completato': return styles.statoCompletato;
    default: return '';
  }
};


const DashboardClienteRichieste: React.FC = () => {
  const [richiesteVisualizzate, setRichiesteVisualizzate] = useState<RichiestaPreventivoCliente[]>(richiesteMock);
  const [filtroStato, setFiltroStato] = useState<string>('Tutti');
  const [filtroData, setFiltroData] = useState<string>(''); // Formato YYYY-MM-DD

  useEffect(() => {
    let richiesteFiltrate = [...richiesteMock];
    if (filtroStato !== 'Tutti') {
      richiesteFiltrate = richiesteFiltrate.filter(r => r.stato === filtroStato);
    }
    if (filtroData) {
      // Questo è un filtro semplice sulla data di invio. In un'app reale, potrebbe essere più complesso.
      richiesteFiltrate = richiesteFiltrate.filter(r => r.dataInvio >= filtroData);
    }
    setRichiesteVisualizzate(richiesteFiltrate);
  }, [filtroStato, filtroData]);

  const handleStatoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroStato(event.target.value);
  };

  const handleDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroData(event.target.value);
  };
  
  const resetFiltri = () => {
    setFiltroStato('Tutti');
    setFiltroData('');
  };

  return (
    <div className={styles.containerRichieste}>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        Le Mie Richieste di Preventivo
      </Titolo>

      <div className={styles.filtriRichieste}>
        <div className={styles.filtroGruppo}>
          <label htmlFor="filtro-stato">Filtra per stato:</label>
          <select id="filtro-stato" value={filtroStato} onChange={handleStatoChange}>
            <option value="Tutti">Tutti gli stati</option>
            <option value="Inviata">Inviata</option>
            <option value="Visualizzata">Visualizzata</option>
            <option value="Preventivo Ricevuto">Preventivo Ricevuto</option>
            <option value="Accettato">Accettato</option>
            <option value="Rifiutato">Rifiutato</option>
            <option value="Annullata">Annullata</option>
            <option value="Completato">Completato</option>
          </select>
        </div>
        <div className={styles.filtroGruppo}>
          <label htmlFor="filtro-data">A partire dal:</label>
          <input type="date" id="filtro-data" value={filtroData} onChange={handleDataChange} />
        </div>
        <Bottone onClick={resetFiltri} variante="outline" size="medium">Resetta Filtri</Bottone>
      </div>

      {richiesteVisualizzate.length > 0 ? (
        <div className={styles.tabellaRichiesteContainer}>
          <table className={styles.tabellaRichieste}>
            <thead>
              <tr>
                <th>Data Invio</th>
                <th>Professionista</th>
                <th>Servizio Richiesto</th>
                <th>Stato</th>
                <th>Ultimo Aggior.</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {richiesteVisualizzate.map((richiesta) => (
                <tr key={richiesta.id}>
                  <td>{new Date(richiesta.dataInvio).toLocaleDateString('it-IT')}</td>
                  <td>
                    <Link to={`/profilo/${richiesta.idProfessionista}`} className={styles.linkProfiloProfessionista}>
                      {richiesta.nomeProfessionista}
                    </Link>
                  </td>
                  <td>{richiesta.servizioRichiesto}</td>
                  <td>
                    <span className={`${styles.statoRichiesta} ${getClasseStato(richiesta.stato)}`}>
                      {richiesta.stato}
                    </span>
                  </td>
                  <td>{new Date(richiesta.ultimoAggiornamento).toLocaleDateString('it-IT')}</td>
                  <td className={styles.azioniRichiesta}>
                    {/* La route effettiva per il dettaglio richiesta sarà definita in un task futuro */}
                    <Link to={`/dashboard-cliente/richieste/${richiesta.id}`}>
                      <Bottone size="small" variante="outline">Visualizza</Bottone>
                    </Link>
                    {/* Altre azioni potrebbero essere: Annulla, Contatta Professionista, etc. */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Paragrafo className={styles.messaggioNessunaRichiesta}>
          Non hai ancora inviato richieste di preventivo, oppure nessuna richiesta corrisponde ai filtri selezionati.
        </Paragrafo>
      )}
      
      <Link to="/" className={styles.bottoneNuovaRicerca}>
        <Bottone variante="primario">Cerca un Nuovo Professionista</Bottone>
      </Link>
    </div>
  );
};

export default DashboardClienteRichieste;
