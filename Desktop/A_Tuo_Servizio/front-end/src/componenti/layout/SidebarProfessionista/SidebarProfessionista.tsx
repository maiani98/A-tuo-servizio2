import React from 'react';
import styles from './SidebarProfessionista.module.css';
import { Link, useNavigate } from 'react-router-dom'; // Assuming React Router for navigation

interface SidebarProfessionistaProps {
  // setActiveView: (view: string) => void; // Pre-routing approach
  // For a routing approach, setActiveView might not be needed if NavLink handles active states
}

const SidebarProfessionista: React.FC<SidebarProfessionistaProps> = (/*{ setActiveView }*/) => {
  const navigate = useNavigate();

  // In a routing setup, these would be NavLink components or similar
  // For now, using divs and navigate function
  const navItems = [
    { label: 'Panoramica', path: '/dashboard/professionista/panoramica' },
    { label: 'Richieste di Preventivo', path: '/dashboard/professionista/richieste' },
    { label: 'Calendario', path: '/dashboard/professionista/calendario' },
    { label: 'Messaggi', path: '/dashboard/professionista/messaggi' },
    { label: 'Recensioni', path: '/dashboard/professionista/recensioni' },
    { label: 'Gestione Profilo', path: '/dashboard/professionista/profilo' },
    { label: 'Statistiche', path: '/dashboard/professionista/statistiche' },
    { label: 'Impostazioni', path: '/dashboard/professionista/impostazioni' },
  ];

  const handleLogout = () => {
    // Implement actual logout logic here
    console.log('Logout clicked');
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Dashboard</h3>
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              {/* Replace with NavLink for active styling if using React Router */}
              <Link to={item.path} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Esci
        </button>
      </div>
    </aside>
  );
};

export default SidebarProfessionista;
