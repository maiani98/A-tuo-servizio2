import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './GestioneProfiloPage.module.css';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

import GestioneInfoBaseDescrizione from './profilo/GestioneInfoBaseDescrizione'; // Import the new component

// Placeholder components for other sub-sections (will be replaced in future tasks)
const PlaceholderProfiloSection: React.FC<{ title: string }> = ({ title }) => (
  <div className={styles.placeholderSection}>
    <Titolo livello={3}>{title}</Titolo>
    <p>Contenuto della sezione "{title}" in costruzione.</p>
  </div>
);

import GestionePortfolioPro from './profilo/GestionePortfolioPro';
import GestioneServiziOfferti from './profilo/GestioneServiziOfferti';
import GestioneCertificazioniPro from './profilo/GestioneCertificazioniPro';
import GestioneAreeOperativita from './profilo/GestioneAreeOperativita';
import GestioneDisponibilitaContatti from './profilo/GestioneDisponibilitaContatti'; // Import the new component

// export const GestioneInfoBaseDescrizione: React.FC = () => <PlaceholderProfiloSection title="Info Base e Descrizione" />;
// export const GestionePortfolioPro: React.FC = () => <PlaceholderProfiloSection title="Portfolio" />;
// export const GestioneServiziOfferti: React.FC = () => <PlaceholderProfiloSection title="Servizi Offerti" />;
// export const GestioneCertificazioniPro: React.FC = () => <PlaceholderProfiloSection title="Certificazioni" />;
// export const GestioneAreeOperativita: React.FC = () => <PlaceholderProfiloSection title="Aree di Operatività" />;
// export const GestioneDisponibilitaContatti: React.FC = () => <PlaceholderProfiloSection title="Disponibilità e Contatti" />;


const GestioneProfiloPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const subNavItems = [
    { path: 'info-base', label: 'Info Base e Descrizione' },
    { path: 'portfolio', label: 'Portfolio' },
    { path: 'servizi', label: 'Servizi Offerti' },
    { path: 'certificazioni', label: 'Certificazioni' },
    { path: 'aree-operativita', label: 'Aree di Operatività' },
    { path: 'disponibilita-contatti', label: 'Disponibilità e Contatti' },
  ];

  // Determina la sotto-sezione attiva basandosi sul path
  // Se nessuna sotto-sezione è attiva (es. /profilo), reindirizza a 'info-base'
  React.useEffect(() => {
    if (location.pathname === '/dashboard/professionista/profilo' || location.pathname === '/dashboard/professionista/profilo/') {
      navigate('info-base', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleAnteprimaProfilo = () => {
    // In un'app reale, questo potrebbe aprire un link al profilo pubblico del professionista
    alert('Anteprima Profilo Pubblico (simulazione)');
    // window.open('/profilo/mio-id-professionista', '_blank');
  };

  return (
    <div className={styles.gestioneProfiloContainer}>
      <div className={styles.headerPagina}>
        <Titolo livello={2} className={styles.titoloPrincipale}>Gestione Profilo Pubblico</Titolo>
        <Bottone onClick={handleAnteprimaProfilo} variante="secondario">
          Anteprima Profilo Pubblico
        </Bottone>
      </div>
      
      <div className={styles.layoutInterno}>
        <nav className={styles.sidebarInterna}>
          <ul>
            {subNavItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={location.pathname.includes(`/profilo/${item.path}`) ? styles.activeLink : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className={styles.contenutoSottoSezione}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default GestioneProfiloPage;
