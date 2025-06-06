import React from 'react';
import styles from './Footer.module.css';
import { Contenitore } from '../Layout'; // Assumendo che Layout.tsx sia in ../Layout
// import { Titolo } from '../../comuni/TestiTipografici/TestiTipografici'; // Se si usa il componente Titolo per i titoli delle colonne

const Footer: React.FC = () => {
  return (
    <footer className={styles.footerPrincipale}>
      <Contenitore className={styles.contenitoreFooter}>
        <div className={styles.linkSezioni}>
          <div className={styles.colonnaLink}>
            <h4>Link Utili</h4> {/* Usando h4 direttamente come da specifiche */}
            <ul className={styles.listaLink}>
              <li><a href="#">Chi Siamo</a></li>
              <li><a href="#">FAQ/Aiuto</a></li>
              <li><a href="#">Termini e Condizioni</a></li>
              <li><a href="#">Informativa Privacy</a></li>
              <li><a href="#">Contatti</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className={styles.colonnaLink}>
            <h4>Seguici su</h4>
            <ul className={styles.listaLink}>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">LinkedIn</a></li>
              {/* Aggiungere altri social se necessario */}
            </ul>
          </div>
        </div>

        <div className={styles.copyrightArea}>
          <p>© {new Date().getFullYear()} A tuo servizio. Tutti i diritti riservati.</p>
          <p>P.IVA: 12345678901</p>
        </div>
      </Contenitore>
    </footer>
  );
};

export default Footer; // Esportazione default
// export { Footer }; // Esportazione nominata se preferita
