import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './PaginaDashboardCliente.module.css';
import { Contenitore } from '../../componenti/comuni/Contenitore/Contenitore';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

// Helper per classi NavLink (simile a PaginaDashboardProfessionista)
const getNavLinkClass = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }): string => {
  if (isPending) return styles.navLinkPending; // Opzionale: stile per pending
  if (isActive) return `${styles.navLink} ${styles.navLinkActive}`;
  return styles.navLink;
};

// Placeholder per icone (da sostituire con SVG o Font Icons reali)
const IconaPanoramica = () => <span className={styles.navLinkIcona}>📊</span>;
const IconaRichieste = () => <span className={styles.navLinkIcona}>📄</span>;
const IconaAppuntamenti = () => <span className={styles.navLinkIcona}>🗓️</span>;
const IconaMessaggi = () => <span className={styles.navLinkIcona}>💬</span>;
const IconaPreferiti = () => <span className={styles.navLinkIcona}>❤️</span>;
const IconaImpostazioni = () => <span className={styles.navLinkIcona}>⚙️</span>;
const IconaEsci = () => <span className={styles.navLinkIcona}>🚪</span>;


const PaginaDashboardCliente: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In un'app reale: dispatch(logoutAction());
    console.log("Logout cliente (mock)");
    alert("Logout effettuato (mock). Sarai reindirizzato alla homepage.");
    navigate('/');
  };

  return (
    <div className={styles.dashboardLayout}>
      <Contenitore> {/* Contenitore principale per mantenere padding e max-width consistenti */}
        <Titolo livello={1} className={styles.titoloDashboard}>
          Il Mio Account Cliente
        </Titolo>
        <div className={styles.dashboardContenutoWrapper}>
          <nav className={styles.sidebarNavigazione}>
            <ul>
              <li><NavLink to="" end className={getNavLinkClass}><IconaPanoramica /> Panoramica</NavLink></li>
              <li><NavLink to="richieste" className={getNavLinkClass}><IconaRichieste /> Le Mie Richieste</NavLink></li>
              <li><NavLink to="appuntamenti" className={getNavLinkClass}><IconaAppuntamenti /> I Miei Appuntamenti</NavLink></li>
              <li><NavLink to="messaggi" className={getNavLinkClass}><IconaMessaggi /> Messaggi</NavLink></li>
              <li><NavLink to="preferiti" className={getNavLinkClass}><IconaPreferiti /> Professionisti Preferiti</NavLink></li>
              <li><NavLink to="impostazioni" className={getNavLinkClass}><IconaImpostazioni /> Impostazioni Account</NavLink></li>
              <li className={styles.bottoneEsciSidebar}>
                <Bottone onClick={handleLogout} variante="outline" block>
                  <IconaEsci /> Esci
                </Bottone>
              </li>
            </ul>
          </nav>
          <main className={styles.contenutoPrincipaleDashboard}>
            <Outlet />
          </main>
        </div>
      </Contenitore>
    </div>
  );
};

export default PaginaDashboardCliente;
