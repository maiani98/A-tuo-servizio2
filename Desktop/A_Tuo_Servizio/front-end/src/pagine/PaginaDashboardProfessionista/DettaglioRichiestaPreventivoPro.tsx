import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './DettaglioRichiestaPreventivoPro.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

// Mock data - In a real app, this would come from a fetch based on `id`
const mockRichieste = [
  { 
    id: 'prev001', 
    dataRichiesta: '2024-07-20', 
    nomeCliente: 'Mario Rossi', 
    emailCliente: 'mario.rossi@example.com',
    telefonoCliente: '3331234567',
    tipoServizio: 'Riparazione Idraulica Urgente', 
    descrizioneProblema: 'Perdita d\'acqua dal rubinetto della cucina, sembra provenire dalla base. Richiedo intervento il prima possibile.',
    indirizzo: 'Via Roma 1, 00100 Roma (RM)',
    dataPreferita: 'ASAP',
    orarioPreferito: 'Mattina',
    allegati: [{ nome: 'foto_perdita.jpg', url: '#' }],
    stato: 'Nuova', 
    urgenza: 'Alta' 
  },
  { 
    id: 'prev002', 
    dataRichiesta: '2024-07-19', 
    nomeCliente: 'Laura Bianchi', 
    emailCliente: 'laura.bianchi@example.com',
    telefonoCliente: '3347654321',
    tipoServizio: 'Installazione Condizionatore', 
    descrizioneProblema: 'Installazione di un condizionatore monosplit in camera da letto. Muri in laterizio. Preventivo per modello da 12000 BTU.',
    indirizzo: 'Corso Umberto 50, 20121 Milano (MI)',
    dataPreferita: 'Prossima settimana',
    orarioPreferito: 'Pomeriggio',
    allegati: [],
    stato: 'Inviato', 
    urgenza: 'Media' 
  },
  // Add more mock requests if needed to match IDs from the list view
];

const DettaglioRichiestaPreventivoPro: React.FC = () => {
  const { idRichiesta } = useParams<{ idRichiesta: string }>();
  const navigate = useNavigate();

  // Find the request by ID from mock data
  const richiesta = mockRichieste.find(r => r.id === idRichiesta);

  if (!richiesta) {
    return (
      <div className={styles.container}>
        <Titolo livello={2}>Richiesta non trovata</Titolo>
        <Paragrafo>La richiesta di preventivo con ID "{idRichiesta}" non è stata trovata.</Paragrafo>
        <Link to="/dashboard/professionista/richieste">
          <Bottone variante="secondario">Torna alle Richieste</Bottone>
        </Link>
      </div>
    );
  }

  const handleCreaPreventivo = () => {
    console.log(`Navigating to create quote for request ${idRichiesta}`);
    navigate(`/dashboard/professionista/preventivi/crea/${idRichiesta}`);
  };

  const handleContattaCliente = () => {
    console.log(`Contatta cliente per richiesta ${idRichiesta}`);
    alert(`Azione "Contatta Cliente" per ${idRichiesta} (simulazione).`);
    // Potrebbe aprire una modale di chat o reindirizzare a una pagina di messaggistica
    // navigate(`/dashboard/professionista/messaggi/nuovo?utente=${richiesta.emailCliente}&richiesta=${idRichiesta}`);
  };

  const handleRifiutaRichiesta = () => {
    console.log(`Rifiuta richiesta ${idRichiesta}`);
    // Logica per aggiornare lo stato della richiesta, magari con una modale per la motivazione
    alert(`Azione "Rifiuta Richiesta" per ${idRichiesta} (simulazione).`);
    // Dopo il rifiuto, potrebbe reindirizzare alla lista o aggiornare lo stato in-loco
    // Per ora, simuliamo un aggiornamento e torniamo indietro
    // richiesta.stato = 'Rifiutato'; // This won't persist in mock data like this
    navigate('/dashboard/professionista/richieste');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Titolo livello={2} className={styles.titoloPagina}>Dettaglio Richiesta: {richiesta.id}</Titolo>
        <span className={`${styles.statoBadge} ${styles[`stato${richiesta.stato.replace(/\s+/g, '')}`]}`}>{richiesta.stato}</span>
      </div>

      <div className={styles.dettagliGrid}>
        <div className={styles.dettaglioItem}>
          <strong>Cliente:</strong> {richiesta.nomeCliente}
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Email:</strong> <a href={`mailto:${richiesta.emailCliente}`}>{richiesta.emailCliente}</a>
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Telefono:</strong> <a href={`tel:${richiesta.telefonoCliente}`}>{richiesta.telefonoCliente}</a>
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Data Richiesta:</strong> {richiesta.dataRichiesta}
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Tipo Servizio:</strong> {richiesta.tipoServizio}
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Urgenza:</strong> {richiesta.urgenza || 'Non specificata'}
        </div>
        <div className={`${styles.dettaglioItem} ${styles.fullWidth}`}>
          <strong>Indirizzo:</strong> {richiesta.indirizzo}
        </div>
        <div className={`${styles.dettaglioItem} ${styles.fullWidth}`}>
          <strong>Descrizione del Problema/Richiesta:</strong>
          <Paragrafo className={styles.descrizione}>{richiesta.descrizioneProblema}</Paragrafo>
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Data Preferita:</strong> {richiesta.dataPreferita || 'Non specificata'}
        </div>
        <div className={styles.dettaglioItem}>
          <strong>Orario Preferito:</strong> {richiesta.orarioPreferito || 'Non specificato'}
        </div>
        {richiesta.allegati && richiesta.allegati.length > 0 && (
          <div className={`${styles.dettaglioItem} ${styles.fullWidth}`}>
            <strong>Allegati:</strong>
            <ul className={styles.listaAllegati}>
              {richiesta.allegati.map(file => (
                <li key={file.nome}><a href={file.url} target="_blank" rel="noopener noreferrer">{file.nome}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.azioniContainer}>
        <Bottone onClick={handleCreaPreventivo} variante="primario">
          Crea Preventivo
        </Bottone>
        <Bottone onClick={handleContattaCliente} variante="secondario">
          Contatta Cliente
        </Bottone>
        {richiesta.stato === 'Nuova' && ( // Mostra "Rifiuta" solo se è nuova, per esempio
            <Bottone onClick={handleRifiutaRichiesta} variante="pericolo" outline>
             Rifiuta Richiesta
            </Bottone>
        )}
      </div>

      <Link to="/dashboard/professionista/richieste" className={styles.linkIndietro}>
        <Bottone variante="terziario">Torna alle Richieste</Bottone>
      </Link>
    </div>
  );
};

export default DettaglioRichiestaPreventivoPro;
