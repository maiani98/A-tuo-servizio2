import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // Importa Outlet e Link
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import styles from './PaginaDashboardProfessionista.module.css'; // Creeremo questo file

const PaginaDashboardProfessionista: React.FC = () => {
  return (
    <Contenitore className={styles.dashboardContenitore}>
      <Titolo livello={1} className={styles.titoloDashboard}>Dashboard Professionista</Titolo>
      <nav className={styles.navDashboard}>
        <Link to="profilo">Gestisci Profilo</Link> {/* Esempio di altre sezioni */}
        <Link to="portfolio">Gestisci Portfolio</Link>
        <Link to="servizi">Gestisci Servizi</Link>
        <Link to="recensioni">Visualizza Recensioni</Link>
      </nav>
      <div className={styles.contenutoDashboard}>
        <Outlet /> {/* Qui verranno renderizzate le route figlie come PaginaGestionePortfolio */}
      </div>
    </Contenitore>
  );
};

export default PaginaDashboardProfessionista;
