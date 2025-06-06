import React, { useState } from 'react';
import styles from './RichiestePreventivoRicevute.module.css';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { Link } from 'react-router-dom';

// Mock data structure for a quote request
interface RichiestaPreventivo {
  id: string;
  dataRichiesta: string;
  nomeCliente: string;
  tipoServizio: string;
  stato: 'Nuova' | 'Inviato' | 'Accettato' | 'Rifiutato' | 'Archiviata';
  urgenza?: string; 
}

// Mock data
const mockRichieste: RichiestaPreventivo[] = [
  { id: 'prev001', dataRichiesta: '2024-07-20', nomeCliente: 'Mario Rossi', tipoServizio: 'Riparazione Idraulica', stato: 'Nuova', urgenza: 'Alta' },
  { id: 'prev002', dataRichiesta: '2024-07-19', nomeCliente: 'Laura Bianchi', tipoServizio: 'Installazione Condizionatore', stato: 'Inviato' },
  { id: 'prev003', dataRichiesta: '2024-07-18', nomeCliente: 'Giuseppe Verdi', tipoServizio: 'Consulenza Web Design', stato: 'Accettato' },
  { id: 'prev004', dataRichiesta: '2024-07-17', nomeCliente: 'Anna Neri', tipoServizio: 'Manutenzione Caldaia', stato: 'Nuova', urgenza: 'Media' },
  { id: 'prev005', dataRichiesta: '2024-07-15', nomeCliente: 'Luca Gialli', tipoServizio: 'Creazione Logo', stato: 'Rifiutato' },
];

const RichiestePreventivoRicevute: React.FC = () => {
  const [filtroStato, setFiltroStato] = useState<string>('Tutte');
  // Add more filters if needed (e.g., date range, urgency)

  const handleFiltroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroStato(event.target.value);
  };

  const richiesteFiltrate = mockRichieste.filter(r => 
    filtroStato === 'Tutte' || r.stato === filtroStato
  );

  return (
    <div className={styles.container}>
      <Titolo livello={2} className={styles.titoloPagina}>Richieste di Preventivo Ricevute</Titolo>

      {/* Filtri Mock */}
      <div className={styles.filtriContainer}>
        <label htmlFor="filtroStato">Filtra per stato: </label>
        <select id="filtroStato" value={filtroStato} onChange={handleFiltroChange} className={styles.selectFiltro}>
          <option value="Tutte">Tutte</option>
          <option value="Nuova">Nuova</option>
          <option value="Inviato">Inviato</option>
          <option value="Accettato">Accettato</option>
          <option value="Rifiutato">Rifiutato</option>
          <option value="Archiviata">Archiviata</option>
        </select>
        {/* Add more filter controls here */}
      </div>

      <table className={styles.tabellaRichieste}>
        <thead>
          <tr>
            <th>ID Richiesta</th>
            <th>Data Richiesta</th>
            <th>Nome Cliente</th>
            <th>Tipo Servizio</th>
            <th>Urgenza</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {richiesteFiltrate.length > 0 ? (
            richiesteFiltrate.map(richiesta => (
              <tr key={richiesta.id}>
                <td>{richiesta.id}</td>
                <td>{richiesta.dataRichiesta}</td>
                <td>{richiesta.nomeCliente}</td>
                <td>{richiesta.tipoServizio}</td>
                <td>{richiesta.urgenza || 'N/D'}</td>
                <td><span className={`${styles.statoBadge} ${styles[`stato${richiesta.stato.replace(/\s+/g, '')}`]}`}>{richiesta.stato}</span></td>
                <td>
                  <Link to={`/dashboard/professionista/richieste/${richiesta.id}`} className={styles.linkDettaglio}>
                    <Bottone tag="span" variante="primario" piccola>Visualizza</Bottone>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={styles.nessunaRichiesta}>Nessuna richiesta trovata con i filtri selezionati.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RichiestePreventivoRicevute;
