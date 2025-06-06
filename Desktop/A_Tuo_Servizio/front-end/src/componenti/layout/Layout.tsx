import React from 'react';
import styles from './Layout.module.css';

interface ContenitoreProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Contenitore: React.FC<ContenitoreProps> = ({
  children,
  className = '',
  maxWidth,
  padding,
  as: ElementType = 'div',
}) => {
  const stileContenitore: React.CSSProperties = {};
  if (maxWidth) {
    stileContenitore.maxWidth = maxWidth;
  }
  if (padding) {
    stileContenitore.padding = padding;
  }

  return (
    <ElementType className={`${styles.contenitore} ${className}`} style={stileContenitore}>
      {children}
    </ElementType>
  );
};

interface GrigliaProps {
  children: React.ReactNode;
  className?: string;
  colonne?: number; // Per desktop
  gap?: string; // es. '1rem', '20px'
  as?: keyof JSX.IntrinsicElements;
  // stileResponsive?: boolean; // Potremmo implementarlo in futuro
}

export const Griglia: React.FC<GrigliaProps> = ({
  children,
  className = '',
  colonne,
  gap = '1rem', // Default gap
  as: ElementType = 'div',
}) => {
  const stileGriglia: React.CSSProperties = {
    display: 'grid',
    gap: gap,
  };
  if (colonne) {
    stileGriglia.gridTemplateColumns = `repeat(${colonne}, 1fr)`;
  }

  return (
    <ElementType className={`${styles.grigliaBase} ${className}`} style={stileGriglia}>
      {children}
    </ElementType>
  );
};
