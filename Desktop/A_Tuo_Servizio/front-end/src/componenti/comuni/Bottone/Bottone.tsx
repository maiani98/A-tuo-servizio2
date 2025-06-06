import React from 'react';
import styles from './Bottone.module.css';

interface BottoneProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secondario' | 'distruttivo';
  // className è già incluso in React.ButtonHTMLAttributes<HTMLButtonElement>
}

export const Bottone: React.FC<BottoneProps> = ({
  children,
  className = '',
  variante = 'primario',
  type = 'button',
  disabled = false,
  ...props
}) => {
  // Applica la classe 'disabilitato' se il bottone è disabled
  const classeDisabilitato = disabled ? styles.disabilitato : '';
  
  return (
    <button
      type={type}
      className={`${styles.bottoneBase} ${styles[variante]} ${classeDisabilitato} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
