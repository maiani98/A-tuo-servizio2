import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ProfessionalCard, { ProfessionalCardProps } from './ProfessionalCard'; // Assumendo export default

const mockOnVediProfilo = vi.fn();

const datiCardMock: ProfessionalCardProps = {
  idProfessionista: '123',
  nome: 'Giovanni Verdi',
  specializzazione: 'Esperto Giardiniere',
  valutazioneMedia: 4.5,
  numeroRecensioni: 120,
  localita: 'Verona, VR',
  distanza: '(1.5 km)',
  tagline: 'Il tuo giardino, la mia passione. Oltre 10 anni di esperienza.',
  badges: ['Verificato', 'Top Pro'],
  urlFotoProfilo: 'https://via.placeholder.com/80',
  onVediProfilo: mockOnVediProfilo,
};

describe('Componente ProfessionalCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('dovrebbe renderizzare nome, specializzazione, e tagline', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    expect(screen.getByText(datiCardMock.nome)).toBeInTheDocument();
    expect(screen.getByText(datiCardMock.specializzazione)).toBeInTheDocument();
    expect(screen.getByText(datiCardMock.tagline)).toBeInTheDocument();
  });

  test('dovrebbe renderizzare località e numero recensioni', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    // Usare stringContaining per flessibilità nel formato del testo
    expect(screen.getByText(new RegExp(datiCardMock.localita.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(datiCardMock.numeroRecensioni.toString()))).toBeInTheDocument();
  });

  test('dovrebbe renderizzare i badges se forniti', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    expect(screen.getByText('Verificato')).toBeInTheDocument();
    expect(screen.getByText('Top Pro')).toBeInTheDocument();
  });

  test('dovrebbe renderizzare immagine se urlFotoProfilo è fornito', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    // L'alt text è `Foto profilo di ${nome}` come definito in ProfessionalCard.tsx
    const img = screen.getByRole('img', { name: `Foto profilo di ${datiCardMock.nome}` });
    expect(img).toHaveAttribute('src', datiCardMock.urlFotoProfilo);
  });

  test('dovrebbe renderizzare placeholder con iniziali se urlFotoProfilo non è fornito', () => {
    const datiSenzaFoto = { ...datiCardMock, nome: "Anna Bianchi", urlFotoProfilo: undefined };
    render(<ProfessionalCard {...datiSenzaFoto} />);
    expect(screen.getByText('AB')).toBeInTheDocument(); 
  });
  
  test('dovrebbe renderizzare placeholder con una sola iniziale se il nome ha una sola parola', () => {
    const datiNomeSingolo = { ...datiCardMock, nome: "Solonome", urlFotoProfilo: undefined };
    render(<ProfessionalCard {...datiNomeSingolo} />);
    // Il componente prende le prime due lettere, quindi "SO"
    expect(screen.getByText('SO')).toBeInTheDocument();
  });

  test('dovrebbe chiamare onVediProfilo con l\'ID corretto al click del bottone', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'Vedi Profilo' }));
    expect(mockOnVediProfilo).toHaveBeenCalledWith(datiCardMock.idProfessionista);
  });

  test('dovrebbe renderizzare la distanza se fornita', () => {
    render(<ProfessionalCard {...datiCardMock} />);
    expect(screen.getByText(new RegExp(datiCardMock.distanza!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
  });

  test('non dovrebbe renderizzare la distanza se non fornita', () => {
    const datiSenzaDistanza = { ...datiCardMock, distanza: undefined };
    render(<ProfessionalCard {...datiSenzaDistanza} />);
    if (datiCardMock.distanza) { // Solo se distanza era definita nel mock originale
        expect(screen.queryByText(new RegExp(datiCardMock.distanza.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).not.toBeInTheDocument();
    }
  });

  test('non dovrebbe renderizzare i badges se non forniti o array vuoto', () => {
    const datiSenzaBadges = { ...datiCardMock, badges: undefined };
    const { rerender } = render(<ProfessionalCard {...datiSenzaBadges} />);
    // Verifica che nessun elemento con la classe badgeSingolo sia renderizzato
    expect(screen.queryByText('Verificato')).not.toBeInTheDocument(); // Assumendo che questi testi siano unici per i badge
    expect(screen.queryByText('Top Pro')).not.toBeInTheDocument();

    rerender(<ProfessionalCard {...{...datiCardMock, badges: []}} />);
    expect(screen.queryByText('Verificato')).not.toBeInTheDocument();
    expect(screen.queryByText('Top Pro')).not.toBeInTheDocument();
  });

});
