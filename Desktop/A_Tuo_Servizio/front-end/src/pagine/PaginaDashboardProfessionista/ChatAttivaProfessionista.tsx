import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatAttivaProfessionista.module.css';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { ConversazionePreview } from './ListaConversazioniPro'; // Per i dettagli della conversazione

export interface Messaggio {
  id: string;
  idAutore: string; // Potrebbe essere 'professionista' o l'ID del cliente
  testo: string;
  timestamp: Date;
  tipo: 'inviato' | 'ricevuto'; // Dal punto di vista del professionista
  allegato?: { nome: string, url: string, tipo: string }; // tipo: 'image', 'pdf', etc.
}

interface ChatAttivaProfessionistaProps {
  conversazione: ConversazionePreview; // Dettagli come nome cliente, foto
  messaggi: Messaggio[];
  onInviaMessaggio: (testo: string, allegato?: File) => void; // Allegato opzionale
}

const ChatAttivaProfessionista: React.FC<ChatAttivaProfessionistaProps> = ({ 
  conversazione, 
  messaggi, 
  onInviaMessaggio 
}) => {
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  // const [fileAllegato, setFileAllegato] = useState<File | null>(null); // Per futuro upload
  const messaggiEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messaggiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messaggi]);

  const handleSubmitMessaggio = (event: React.FormEvent) => {
    event.preventDefault();
    if (nuovoMessaggio.trim() === '') return; // Non inviare messaggi vuoti
    onInviaMessaggio(nuovoMessaggio.trim());
    setNuovoMessaggio('');
    // setFileAllegato(null); // Resetta allegato dopo l'invio
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     setFileAllegato(event.target.files[0]);
  //   } else {
  //     setFileAllegato(null);
  //   }
  // };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <img 
          src={conversazione.fotoCliente || 'https://via.placeholder.com/40/6c757d/FFFFFF?text=?'} 
          alt={`Foto ${conversazione.nomeCliente}`} 
          className={styles.fotoClienteHeader}
        />
        <h3 className={styles.nomeClienteHeader}>{conversazione.nomeCliente}</h3>
        {/* Qui potrebbero esserci altre azioni, come info cliente, chiamata, etc. */}
      </header>

      <div className={styles.areaMessaggi}>
        {messaggi.map(msg => (
          <div key={msg.id} className={`${styles.rigaMessaggio} ${styles[msg.tipo]}`}>
            <div className={styles.bollaMessaggio}>
              <p className={styles.testoMessaggio}>{msg.testo}</p>
              {/* TODO: Gestire visualizzazione allegati */}
              <span className={styles.timestampMessaggio}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messaggiEndRef} /> {/* Anchor per lo scroll automatico */}
      </div>

      <form onSubmit={handleSubmitMessaggio} className={styles.inputArea}>
        {/* 
        Futuro input per allegati:
        <input 
          type="file" 
          id={`file-${conversazione.id}`} 
          style={{display: 'none'}} 
          onChange={handleFileChange} 
        />
        <label htmlFor={`file-${conversazione.id}`} className={styles.bottoneAllegato}>
          <Bottone tag="span" icona="paperclip" piccola aria-label="Allega file" />
        </label> 
        */}
        <input
          type="text"
          value={nuovoMessaggio}
          onChange={(e) => setNuovoMessaggio(e.target.value)}
          placeholder="Scrivi un messaggio..."
          className={styles.campoInputMessaggio}
          aria-label="Nuovo messaggio"
        />
        <Bottone type="submit" variante="primario" className={styles.bottoneInvia}>
          Invia
        </Bottone>
      </form>
      {/* {fileAllegato && <p className={styles.infoFileAllegato}>Allegato: {fileAllegato.name}</p>} */}
    </div>
  );
};

export default ChatAttivaProfessionista;
