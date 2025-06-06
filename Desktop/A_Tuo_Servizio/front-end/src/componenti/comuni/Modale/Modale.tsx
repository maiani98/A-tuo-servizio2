import React, { useEffect } from 'react';
import styles from './Modale.module.css';
import { Titolo } from '../TestiTipografici/TestiTipografici';
import { Bottone } from '../Bottone/Bottone';

interface ModaleProps {
  aperto: boolean;
  onChiudi: () => void;
  titolo?: string;
  children: React.ReactNode;
  larghezza?: string;
  className?: string;
}

export const Modale: React.FC<ModaleProps> = ({
  aperto,
  onChiudi,
  titolo,
  children,
  larghezza = '500px', // Default width
  className = '',
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onChiudi();
      }
    };
    if (aperto) {
      document.body.style.overflow = 'hidden'; // Impedisce lo scroll della pagina dietro il modale
      document.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = ''; // Ripristina lo scroll
    }
    return () => {
      document.body.style.overflow = ''; // Assicura il ripristino allo smontaggio
      document.removeEventListener('keydown', handleEsc);
    };
  }, [aperto, onChiudi]);

  if (!aperto) {
    return null;
  }

  return (
    <div 
      className={styles.overlay} 
      onClick={onChiudi} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={titolo ? 'titolo-modale' : undefined}
      aria-describedby="corpo-modale" // Aggiunto per accessibilità
    >
      <div
        className={`${styles.contenitoreModale} ${className}`}
        style={{ width: larghezza }}
        onClick={(e) => e.stopPropagation()} // Impedisce la chiusura cliccando dentro il modale
      >
        {titolo && (
          <div className={styles.headerModale}>
            <Titolo livello={3} id="titolo-modale" className={styles.titoloModale}>{titolo}</Titolo>
            <Bottone 
              variante="secondario" // O una nuova variante 'icona' o 'trasparente'
              onClick={onChiudi} 
              className={styles.bottoneChiudi} 
              aria-label="Chiudi modale"
            >
              &times; {/* Carattere X per chiusura */}
            </Bottone>
          </div>
        )}
        <div id="corpo-modale" className={styles.corpoModale}> {/* Aggiunto id per aria-describedby */}
          {children}
        </div>
        {/* 
        // Esempio di come potrebbe essere un footer, se necessario in futuro
        <div className={styles.footerModale}>
          <Bottone variante="primario" onClick={() => alert('Azione Eseguita')}>OK</Bottone>
          <Bottone variante="secondario" onClick={onChiudi}>Annulla</Bottone>
        </div> 
        */}
      </div>
    </div>
  );
};
