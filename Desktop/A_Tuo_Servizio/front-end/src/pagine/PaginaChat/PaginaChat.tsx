import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PaginaChat.module.css';
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

export interface MessaggioChat {
  id: string;
  testo: string;
  mittente: 'utente' | 'professionista';
  timestamp: Date;
}

const PaginaChat: React.FC = () => {
  const { idProfessionista } = useParams<{ idProfessionista: string }>();
  const navigate = useNavigate(); // Non usato per ora, ma potrebbe servire per "torna indietro"

  const [messaggi, setMessaggi] = useState<MessaggioChat[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [nomeProfessionistaChat, setNomeProfessionistaChat] = useState('Nome Professionista'); // Mock

  // Simula caricamento messaggi iniziali e nome professionista
  useEffect(() => {
    // In un'app reale, qui si caricherebbero i dati basati su idProfessionista
    console.log(`Inizializzazione chat con professionista ID: ${idProfessionista}`);
    setNomeProfessionistaChat(`Professionista ${idProfessionista}`); // Esempio
    setMessaggi([
      { id: 'msg1', testo: 'Ciao! Sono interessato ai tuoi servizi di idraulica.', mittente: 'utente', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 'msg2', testo: 'Buongiorno! Certo, come posso aiutarti oggi?', mittente: 'professionista', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    ]);
  }, [idProfessionista]);

  const handleInviaMessaggio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nuovoMessaggio.trim()) return;

    const messaggioUtente: MessaggioChat = {
      id: `msg${Date.now()}`,
      testo: nuovoMessaggio.trim(),
      mittente: 'utente',
      timestamp: new Date(),
    };
    setMessaggi(prevMessaggi => [...prevMessaggi, messaggioUtente]);
    setNuovoMessaggio('');

    // Simula risposta automatica del professionista
    setTimeout(() => {
      const rispostaProfessionista: MessaggioChat = {
        id: `msg${Date.now() + 1}`,
        testo: 'Grazie per il tuo messaggio! Ti risponderò il prima possibile.',
        mittente: 'professionista',
        timestamp: new Date(),
      };
      setMessaggi(prevMessaggi => [...prevMessaggi, rispostaProfessionista]);
    }, 1500);
  };

  const formattaTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Contenitore maxWidth="800px" className={styles.paginaChatContenitore}>
      <Titolo livello={2} className={styles.headerChat}>
        Chat con {nomeProfessionistaChat}
      </Titolo>
      
      <div className={styles.areaMessaggi}>
        {messaggi.map(msg => (
          <div 
            key={msg.id} 
            className={`${styles.messaggio} ${msg.mittente === 'utente' ? styles.utente : styles.professionista}`}
          >
            <Paragrafo className={styles.testoMessaggio}>{msg.testo}</Paragrafo>
            <span className={styles.timestampMessaggio}>{formattaTimestamp(msg.timestamp)}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleInviaMessaggio} className={styles.areaInputMessaggio}>
        <CampoTesto
          name="nuovoMessaggio"
          value={nuovoMessaggio}
          onChange={(e) => setNuovoMessaggio(e.target.value)}
          placeholder="Scrivi un messaggio..."
          className={styles.campoInputMessaggio} // Per flex-grow
          autoComplete="off"
        />
        <Bottone type="submit" variante="primario">Invia</Bottone>
      </form>
    </Contenitore>
  );
};

export default PaginaChat;
