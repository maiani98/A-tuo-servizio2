import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest'; // Importa vi da vitest
import { Bottone } from './Bottone'; 
import styles from './Bottone.module.css'; 

const mockOnClick = vi.fn(); 

describe('Componente Bottone', () => {
  afterEach(() => {
    vi.clearAllMocks(); 
  });

  test('dovrebbe renderizzare il testo corretto', () => {
    render(<Bottone>Cliccami</Bottone>);
    expect(screen.getByText('Cliccami')).toBeInTheDocument();
  });

  test('dovrebbe chiamare onClick quando cliccato', () => {
    render(<Bottone onClick={mockOnClick}>Test Click</Bottone>);
    fireEvent.click(screen.getByText('Test Click'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('dovrebbe essere disabilitato se la prop disabled è true', () => {
    render(<Bottone disabled>Test Disabled</Bottone>);
    expect(screen.getByText('Test Disabled')).toBeDisabled();
  });

  test('non dovrebbe chiamare onClick se disabilitato', () => {
    render(<Bottone onClick={mockOnClick} disabled>Test Disabled Click</Bottone>);
    fireEvent.click(screen.getByText('Test Disabled Click'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('dovrebbe applicare la classe della variante primaria di default', () => {
    const { container } = render(<Bottone>Test Primario</Bottone>);
    // L'elemento button è il primo figlio del fragment reso da React.
    // Se Bottone rendesse un div wrapper, container.firstChild sarebbe quel div.
    // Assumiamo che Bottone renda direttamente <button> o un wrapper stretto.
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles.primario);
  });

  test('dovrebbe applicare la classe della variante secondaria', () => {
    const { container } = render(<Bottone variante="secondario">Test Secondario</Bottone>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(styles.secondario);
  });
});
