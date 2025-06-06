import React from 'react';
import styles from './CampiInput.module.css';

interface CampoTestoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etichetta?: string;
  errore?: string; // Per messaggi di errore
  classNameContenitore?: string; // Per stile al wrapper
}

export const CampoTesto: React.FC<CampoTestoProps> = ({
  etichetta,
  id,
  errore,
  classNameContenitore = '',
  className = '',
  ...props
}) => {
  const inputId = id || props.name; // Usa name se id non fornito
  return (
    <div className={`${styles.contenitoreCampo} ${classNameContenitore}`}>
      {etichetta && <label htmlFor={inputId} className={styles.etichetta}>{etichetta}</label>}
      <input
        id={inputId}
        className={`${styles.inputBase} ${errore ? styles.inputErrore : ''} ${className}`}
        {...props}
      />
      {errore && <small className={styles.messaggioErrore}>{errore}</small>}
    </div>
  );
};

// Nuove interfacce e componente CampoSelect
export interface OpzioneSelect {
  valore: string | number;
  etichetta: string;
}

export interface CampoSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  etichetta?: string;
  opzioni: OpzioneSelect[];
  errore?: string;
  classNameContenitore?: string;
  // id?: string; // Già incluso in React.SelectHTMLAttributes
}

export const CampoSelect: React.FC<CampoSelectProps> = ({
  etichetta,
  opzioni,
  id,
  errore,
  classNameContenitore = '',
  className = '', // Per lo stile del select stesso
  name, // Per l'associazione con la label
  placeholder, // Aggiunto per gestire il placeholder
  ...props
}) => {
  const selectId = id || name; // Usa name per htmlFor se id non fornito

  return (
    <div className={`${styles.contenitoreCampo} ${classNameContenitore}`}>
      {etichetta && <label htmlFor={selectId} className={styles.etichetta}>{etichetta}</label>}
      <div className={styles.contenitoreSelectConIcona}> {/* Wrapper per select e icona */}
        <select
          id={selectId}
          name={name}
          className={`${styles.selectBase} ${errore ? styles.inputErrore : ''} ${className}`}
          {...props}
        >
          {/* Opzione placeholder se specificata */}
          {placeholder && <option value="">{placeholder}</option>}
          {opzioni.map((opzione) => (
            <option key={opzione.valore} value={opzione.valore}>
              {opzione.etichetta}
            </option>
          ))}
        </select>
        {/* L'icona sarà gestita via CSS tramite ::after su contenitoreSelectConIcona */}
      </div>
      {errore && <small className={styles.messaggioErrore}>{errore}</small>}
    </div>
  );
};
