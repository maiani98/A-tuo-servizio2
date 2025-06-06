import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // Aggiunto useLocation
import styles from './ChatAttiva.module.css'; // Aggiornato import CSS
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici'; // Per il nome contatto
// Import Titolo se necessario per l'header, o usa Paragrafo stilizzato

interface Messaggio {
  id: string;
  testo: string;
  mittente: 'utente' | 'professionista';
  timestamp: string;
}

// Dati Mock per i messaggi, divisi per conversazione
const messaggiPerConversazioneMock: { [key: string]: Messaggio[] } = {
  'conv1': [
    { id: 'msg1-c1', testo: 'Ciao! Vorrei avere più informazioni sul preventivo per la riparazione della cucina.', mittente: 'utente', timestamp: '10:30' },
    { id: 'msg2-c1', testo: 'Buongiorno! Certamente, cosa vorrebbe sapere nel dettaglio?', mittente: 'professionista', timestamp: '10:31' },
    { id: 'msg3-c1', testo: 'Il prezzo include anche i materiali o solo la manodopera?', mittente: 'utente', timestamp: '10:32' },
  ],
  'conv2': [
    { id: 'msg1-c2', testo: 'Il preventivo è pronto, te lo invio a breve.', mittente: 'professionista', timestamp: 'Ieri ore 18:00' },
    { id: 'msg2-c2', testo: 'Ok, grazie mille, attendo sue notizie allora!', mittente: 'utente', timestamp: 'Ieri ore 18:05' },
  ],
  'conv3': [
    { id: 'msg1-c3', testo: 'Grazie per avermi contattato! Come posso aiutarla?', mittente: 'professionista', timestamp: '02/05 14:00' },
  ],
};

// Dati Mock per i contatti (da DashboardClienteMessaggi)
// In un'app reale, questi potrebbero venire da uno store globale o essere fetchati.
const contattiMock: { [key: string]: { nome: string; urlFoto?: string; online?: boolean } } = {
  '123': { nome: 'Mario Rossi Idraulica', urlFoto: 'https://via.placeholder.com/40/007bff/ffffff?text=MR', online: true },
  '456': { nome: 'Laura Bianchi Architettura', urlFoto: 'https://via.placeholder.com/40/28a745/ffffff?text=LB', online: false },
  '789': { nome: 'Giuseppe Verdi Giardinaggio', urlFoto: 'https://via.placeholder.com/40/ffc107/000000?text=GV', online: true },
};

interface DatiContattoChat {
    nome: string;
    urlFoto?: string;
    online?: boolean;
}

const ChatAttiva: React.FC = () => {
  const { idConversazione } = useParams<{ idConversazione?: string }>();
  const location = useLocation(); // Per ottenere query params come profId

  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [datiContatto, setDatiContatto] = useState<DatiContattoChat | null>(null);
  const areaMessaggiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (idConversazione) {
      console.log(`Caricamento messaggi e info contatto per chat ID: ${idConversazione}`);
      setMessaggi(messaggiPerConversazioneMock[idConversazione] || []);
      
      const queryParams = new URLSearchParams(location.search);
      const idProfessionista = queryParams.get('profId'); // profId passato da DashboardClienteMessaggi
      
      if (idProfessionista && contattiMock[idProfessionista]) {
        setDatiContatto(contattiMock[idProfessionista]);
      } else {
        // Fallback se profId non è nei query params o non è nei mock
        // Potrebbe essere utile avere un modo per recuperare il nome del professionista dall'idConversazione
        // se non passato come parametro (es. da una lista di conversazioni in uno store)
        const convPreview = (window as any).conversazioniMock?.find((c: any) => c.idConversazione === idConversazione);
        if (convPreview) {
            setDatiContatto({nome: convPreview.nomeProfessionista, urlFoto: convPreview.urlFotoProfessionista, online: Math.random() > 0.5});
        } else {
            setDatiContatto({ nome: 'Professionista Sconosciuto' });
        }
      }

    } else {
      setMessaggi([]);
      setDatiContatto(null);
    }
  }, [idConversazione, location.search]);

  useEffect(() => {
    if (areaMessaggiRef.current) {
      areaMessaggiRef.current.scrollTop = areaMessaggiRef.current.scrollHeight;
    }
  }, [messaggi]);

  const handleInviaMessaggio = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuovoMessaggio.trim() === '' || !idConversazione) return;

    const messaggioDaInviare: Messaggio = {
      id: `msg${Date.now()}`, // ID più univoco per i mock
      testo: nuovoMessaggio,
      mittente: 'utente', 
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessaggi(prevMessaggi => [...prevMessaggi, messaggioDaInviare]);
    // Aggiorna anche il mock globale per simulazione (non ideale, ma per demo)
    if (messaggiPerConversazioneMock[idConversazione]) {
        messaggiPerConversazioneMock[idConversazione].push(messaggioDaInviare);
    }
    setNuovoMessaggio('');

    // Mock risposta automatica (opzionale)
    setTimeout(() => {
      if (idConversazione) { // Verifica che la conversazione sia ancora attiva
        const rispostaAutomatica: Messaggio = {
          id: `msg${Date.now() + 1}`,
          testo: "Risposta automatica: Grazie per il tuo messaggio!",
          mittente: 'professionista',
          timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessaggi(prevMessaggi => [...prevMessaggi, rispostaAutomatica]);
        if (messaggiPerConversazioneMock[idConversazione]) {
            messaggiPerConversazioneMock[idConversazione].push(rispostaAutomatica);
        }
      }
    }, 1500);
  };

  if (!idConversazione || !datiContatto) {
    // Questo non dovrebbe essere mostrato se DashboardClienteMessaggi gestisce il placeholder
    // quando nessuna chat è selezionata. Ma è un fallback.
    return <div className={styles.paginaChatContainer}><Paragrafo>Seleziona una conversazione.</Paragrafo></div>;
  }

  return (
    <div className={styles.paginaChatContainer}>
      <header className={styles.headerChatInterno}>
        <div className={styles.avatarHeaderChat}>
            {datiContatto.urlFoto ? (
            <img src={datiContatto.urlFoto} alt={`Avatar di ${datiContatto.nome}`} />
            ) : (
            <span>{datiContatto.nome.substring(0, 2).toUpperCase()}</span>
            )}
        </div>
        <div className={styles.infoContattoHeader}>
            <Paragrafo className={styles.nomeContattoHeaderChat}>{datiContatto.nome}</Paragrafo>
            {datiContatto.online !== undefined && (
                <span className={datiContatto.online ? styles.statoOnlineIndicatore : styles.statoOfflineIndicatore}>
                {datiContatto.online ? 'Online' : 'Offline'}
                </span>
            )}
        </div>
        {/* Altre azioni possibili: info contatto, blocca utente etc. */}
      </header>
      
      <div ref={areaMessaggiRef} className={styles.areaMessaggi}>
        {messaggi.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messaggioItem} ${
              msg.mittente === 'utente' ? styles.messaggioUtente : styles.messaggioProfessionista
            }`}
          >
            <div className={styles.corpoMessaggio}>
              <p className={styles.testoMessaggio}>{msg.testo}</p>
              <span className={styles.timestampMessaggio}>{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {messaggi.length === 0 && (
          <p className={styles.nessunMessaggio}>Nessun messaggio in questa conversazione. Inizia tu!</p>
        )}
      </div>

      <form onSubmit={handleInviaMessaggio} className={styles.areaInputMessaggio}>
        <CampoTesto
          id="inputNuovoMessaggio"
          nome="nuovoMessaggio"
          tipo="text"
          valore={nuovoMessaggio}
          onChange={(e) => setNuovoMessaggio(e.target.value)}
          placeholder="Scrivi un messaggio..."
          // className={styles.campoInputChat} // CampoTesto dovrebbe gestire la sua classe base
          classNamePerInput={styles.campoInputChatInterno} // Per lo stile specifico dell'input interno
          autoComplete="off"
        />
        <Bottone type="submit" variante="primario" className={styles.bottoneInviaChat}>
          Invia
        </Bottone>
      </form>
    </div>
  );
};

export default ChatAttiva;
