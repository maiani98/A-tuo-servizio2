import React, { useState } from 'react';
import styles from './StatisticheProfessionista.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
// Immagina di avere un componente Icona o di usare una libreria (es. react-icons)
// import { FaEye, FaFileAlt, FaPercentage, FaChartLine, FaChartBar, FaSearch } from 'react-icons/fa';

// Placeholder per un generico Widget Card per le statistiche
interface StatWidgetCardProps {
  titolo: string;
  valore: string | number;
  icona?: React.ReactNode; // Potrebbe essere un SVG, un componente Icona, o un carattere
  trend?: string; // Es. "+5% vs mese precedente"
  coloreIcona?: string;
}

const StatWidgetCard: React.FC<StatWidgetCardProps> = ({ titolo, valore, icona, trend, coloreIcona }) => (
  <div className={styles.statWidgetCard}>
    {icona && <div className={styles.iconaWidget} style={{ backgroundColor: coloreIcona || '#007bff' }}>{icona}</div>}
    <div className={styles.contenutoWidget}>
      <Paragrafo className={styles.titoloWidget}>{titolo}</Paragrafo>
      <Titolo livello={3} className={styles.valoreWidget}>{valore}</Titolo>
      {trend && <Paragrafo className={styles.trendWidget}>{trend}</Paragrafo>}
    </div>
  </div>
);

// Placeholder per un contenitore di Grafico
const GraficoPlaceholder: React.FC<{ titolo: string, tipoGrafico: 'linee' | 'barre' }> = ({ titolo, tipoGrafico }) => (
  <div className={styles.graficoPlaceholderCard}>
    <Titolo livello={4} className={styles.titoloGrafico}>{titolo}</Titolo>
    <div className={styles.graficoContenuto}>
      {/* <img src={`https://via.placeholder.com/400x200/${tipoGrafico === 'linee' ? '007bff' : '28a745'}/FFFFFF?text=Grafico+${tipoGrafico.charAt(0).toUpperCase() + tipoGrafico.slice(1)}`} alt={`Placeholder Grafico ${titolo}`} /> */}
      <Paragrafo>Placeholder per grafico a {tipoGrafico}. In un'applicazione reale, qui verrebbe renderizzato un grafico (es. usando Chart.js, Recharts, Nivo).</Paragrafo>
      <div className={styles.mockChart}>
        {tipoGrafico === 'linee' ? (
          <svg viewBox="0 0 100 50" preserveAspectRatio="none"><polyline fill="none" stroke="#007bff" strokeWidth="1" points="0,45 10,30 20,35 30,20 40,25 50,10 60,15 70,5 80,10 90,20 100,25" /></svg>
        ) : (
          <svg viewBox="0 0 100 50" preserveAspectRatio="none">
            <rect x="5" y="30" width="10" height="20" fill="#28a745" />
            <rect x="20" y="15" width="10" height="35" fill="#28a745" />
            <rect x="35" y="25" width="10" height="25" fill="#28a745" />
            <rect x="50" y="10" width="10" height="40" fill="#28a745" />
            <rect x="65" y="35" width="10" height="15" fill="#28a745" />
            <rect x="80" y="20" width="10" height="30" fill="#28a745" />
          </svg>
        )}
      </div>
    </div>
  </div>
);


const StatisticheProfessionista: React.FC = () => {
  const [periodo, setPeriodo] = useState('ultimo_mese'); // es. 'ultima_settimana', 'ultimo_mese', 'ultimo_trimestre'

  // Mock data per le statistiche
  const visualizzazioniProfilo = 1250;
  const numeroRichieste = 85;
  const tassoConversione = '15%'; // (Preventivi inviati / Richieste) o (Lavori confermati / Preventivi)

  const mockKeywordRicerca = [
    { keyword: 'idraulico urgente milano', visualizzazioni: 150, posizioneMedia: 3 },
    { keyword: 'riparazione perdita cucina', visualizzazioni: 95, posizioneMedia: 2 },
    { keyword: 'preventivo sito ecommerce', visualizzazioni: 70, posizioneMedia: 5 },
    { keyword: 'miglior web designer firenze', visualizzazioni: 45, posizioneMedia: 8 },
  ];

  return (
    <div className={styles.containerStatistiche}>
      <div className={styles.headerPaginaStatistiche}>
        <Titolo livello={2} className={styles.titoloPagina}>Statistiche e Andamento</Titolo>
        <div className={styles.selettorePeriodoContainer}>
          <label htmlFor="selettorePeriodo" className={styles.labelSelettore}>Periodo:</label>
          <select 
            id="selettorePeriodo" 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className={styles.selectPeriodo}
          >
            <option value="ultima_settimana">Ultima Settimana</option>
            <option value="ultimo_mese">Ultimo Mese</option>
            <option value="ultimo_trimestre">Ultimo Trimestre</option>
            <option value="ultimo_anno">Ultimo Anno</option>
          </select>
        </div>
      </div>

      {/* Widget/Card Metriche Chiave */}
      <div className={styles.widgetsContainer}>
        <StatWidgetCard titolo="Visualizzazioni Profilo" valore={visualizzazioniProfilo} icona={"👁️"} trend="+12% vs periodo prec." coloreIcona="#17a2b8" />
        <StatWidgetCard titolo="Richieste di Preventivo Ricevute" valore={numeroRichieste} icona={"📄"} trend="-5% vs periodo prec." coloreIcona="#ffc107" />
        <StatWidgetCard titolo="Tasso di Conversione (Richieste > Preventivi)" valore={tassoConversione} icona={"%"} trend="+2% vs periodo prec." coloreIcona="#28a745" />
        {/* Aggiungere altri widget se necessario */}
      </div>

      {/* Placeholder Grafici */}
      <div className={styles.graficiContainer}>
        <GraficoPlaceholder titolo="Andamento Visualizzazioni Profilo" tipoGrafico="linee" />
        <GraficoPlaceholder titolo="Richieste per Tipo di Servizio" tipoGrafico="barre" />
      </div>

      {/* Tabella Keyword di Ricerca */}
      <div className={styles.tabellaContainer}>
        <Titolo livello={4} className={styles.titoloTabella}><span role="img" aria-label="search icon">🔍</span> Keyword di Ricerca Principali</Titolo>
        <table className={styles.tabellaKeyword}>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Visualizzazioni Generate</th>
              <th>Posizione Media (Appross.)</th>
            </tr>
          </thead>
          <tbody>
            {mockKeywordRicerca.map(kw => (
              <tr key={kw.keyword}>
                <td>{kw.keyword}</td>
                <td>{kw.visualizzazioni}</td>
                <td>{kw.posizioneMedia}</td>
              </tr>
            ))}
            {mockKeywordRicerca.length === 0 && (
              <tr><td colSpan={3}>Nessun dato sulle keyword disponibile per il periodo selezionato.</td></tr>
            )}
          </tbody>
        </table>
        <Paragrafo className={styles.notaTabella}>I dati sulla posizione media sono indicativi e possono variare.</Paragrafo>
      </div>
      
    </div>
  );
};

export default StatisticheProfessionista;
