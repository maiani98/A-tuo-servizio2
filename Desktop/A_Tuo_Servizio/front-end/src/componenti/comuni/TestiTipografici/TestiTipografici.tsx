import React from 'react';
import styles from './TestiTipografici.module.css';

interface TitoloProps {
  children: React.ReactNode;
  livello?: 1 | 2 | 3;
  className?: string;
}

export const Titolo: React.FC<TitoloProps> = ({ livello = 1, children, className = '' }) => {
  const Tag = `h${livello}` as keyof JSX.IntrinsicElements;
  const styleName = `titolo${livello}` as keyof typeof styles; // Aggiunto per tipizzazione corretta
  return <Tag className={`${styles[styleName]} ${className}`}>{children}</Tag>;
};

interface ParagrafoProps {
  children: React.ReactNode;
  className?: string;
}

export const Paragrafo: React.FC<ParagrafoProps> = ({ children, className = '' }) => {
  return <p className={`${styles.paragrafo} ${className}`}>{children}</p>;
};

interface TestoPiccoloProps {
  children: React.ReactNode;
  className?: string;
}

export const TestoPiccolo: React.FC<TestoPiccoloProps> = ({ children, className = '' }) => {
  return <small className={`${styles.testoPiccolo} ${className}`}>{children}</small>;
};
