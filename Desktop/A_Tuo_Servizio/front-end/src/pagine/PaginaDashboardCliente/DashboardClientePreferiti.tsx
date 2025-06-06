import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './DashboardClientePreferiti.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import ProfessionalCard, { ProfessionalCardProps } from '../../componenti/specifici/ProfessionalCard/ProfessionalCard'; // Assumendo questo percorso

// Dati Mock per Professionisti Preferiti
// Utilizziamo la stessa interfaccia ProfessionalCardProps se i dati richiesti sono gli stessi.
// Altrimenti, definire un'interfaccia specifica per i preferiti.
const professionistiPreferitiMockData: ProfessionalCardProps[] = [
  {
    id: '123', // Deve essere stringa come da ProfessionalCardProps
    nome: 'Mario Rossi Idraulica',
    servizio: 'Idraulico', // Potrebbe essere la specializzazione principale
    localita: 'Roma, RM',
    immagineUrl: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Mario+R.',
    rating: 4.7,
    numeroRecensioni: 132,
    // linkProfilo: `/profilo/123` // ProfessionalCard potrebbe gestire il link internamente
  },
  {
    id: '456',
    nome: 'Laura Bianchi Architettura',
    servizio: 'Architetto',
    localita: 'Milano, MI',
    immagineUrl: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Laura+B.',
    rating: 4.9,
    numeroRecensioni: 85,
    // linkProfilo: `/profilo/456`
  },
  {
    id: '101',
    nome: 'Sofia Neri Dog Sitting',
    servizio: 'Dog Sitter',
    localita: 'Torino, TO',
    immagineUrl: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Sofia+N.',
    rating: 5.0,
    numeroRecensioni: 210,
    // linkProfilo: `/profilo/101`
  },
];


const DashboardClientePreferiti: React.FC = () => {
  const [preferiti, setPreferiti] = useState<ProfessionalCardProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simula caricamento dati dei preferiti
    setPreferiti(professionistiPreferitiMockData);
  }, []);

  const handleRimuoviPreferito = (idProfessionista: string | number) => {
    if (window.confirm("Sei sicuro di voler rimuovere questo professionista dai preferiti?")) {
        console.log(`Rimozione professionista ${idProfessionista} dai preferiti (mock).`);
        setPreferiti(prevPreferiti => prevPreferiti.filter(p => p.id !== idProfessionista));
        // In un'app reale: chiamata API per rimuovere il preferito
        alert("Professionista rimosso dai preferiti (mock).");
    }
  };

  const handleContattaPreferito = (idProfessionista: string | number, nomeProfessionista: string) => {
    // Simula la creazione o navigazione a una chat esistente.
    // L'ID conversazione potrebbe essere derivato dagli ID utente/professionista o fetchato.
    // Per ora, usiamo un ID conversazione mock o passiamo l'ID professionista.
    console.log(`Contatta professionista ${idProfessionista} (mock).`);
    navigate(`/dashboard-cliente/messaggi/conv-mock-${idProfessionista}?profId=${idProfessionista}&profNome=${encodeURIComponent(nomeProfessionista)}`);
  };

  return (
    <div className={styles.containerPreferiti}>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        I Miei Professionisti Preferiti
      </Titolo>

      {preferiti.length === 0 ? (
        <Paragrafo className={styles.messaggioNessunPreferito}>
          Non hai ancora salvato nessun professionista tra i preferiti.
          <br />
          <Link to="/">Inizia la tua ricerca!</Link>
        </Paragrafo>
      ) : (
        <div className={styles.grigliaPreferiti}>
          {preferiti.map((prof) => (
            <div key={prof.id} className={styles.preferitoItemWrapper}>
              <ProfessionalCard {...prof} />
              <div className={styles.azioniPreferitoCard}>
                <Bottone 
                  variante="secondario" 
                  size="small"
                  onClick={() => handleContattaPreferito(prof.id, prof.nome)}
                >
                  Contatta
                </Bottone>
                <Bottone 
                  variante="danger_outline" 
                  size="small"
                  onClick={() => handleRimuoviPreferito(prof.id)}
                >
                  Rimuovi
                </Bottone>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardClientePreferiti;
