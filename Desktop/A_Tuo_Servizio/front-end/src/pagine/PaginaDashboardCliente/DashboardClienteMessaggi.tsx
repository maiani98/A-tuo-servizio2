import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './DashboardClienteMessaggi.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
// PaginaChat sarà renderizzata tramite Outlet, quindi non è importata qui direttamente
// a meno che non si scelga l'approccio di rendering condizionale.

export interface ConversazionePreview {
  idConversazione: string;
  idProfessionista: string; // Necessario per costruire il link o passare a PaginaChat
  nomeProfessionista: string;
  urlFotoProfessionista?: string; // URL per l'avatar
  anteprimaUltimoMessaggio: string;
  timestampUltimoMessaggio: string; // ISO string o stringa formato "HH:mm" o "DD/MM"
  messaggiNonLetti: number;
}

const conversazioniMock: ConversazionePreview[] = [
  { idConversazione: 'conv1', idProfessionista: '123', nomeProfessionista: 'Mario Rossi Idraulica', urlFotoProfessionista: 'https://via.placeholder.com/48/007bff/ffffff?text=MR', anteprimaUltimoMessaggio: "Certo, posso passare domani alle 10.", timestampUltimoMessaggio: "10:30", messaggiNonLetti: 1 },
  { idConversazione: 'conv2', idProfessionista: '456', nomeProfessionista: 'Laura Bianchi Architettura', urlFotoProfessionista: 'https://via.placeholder.com/48/28a745/ffffff?text=LB', anteprimaUltimoMessaggio: "Il preventivo è pronto, te lo invio a breve.", timestampUltimoMessaggio: "Ieri", messaggiNonLetti: 0 },
  { idConversazione: 'conv3', idProfessionista: '789', nomeProfessionista: 'Giuseppe Verdi Giardinaggio', urlFotoProfessionista: 'https://via.placeholder.com/48/ffc107/000000?text=GV', anteprimaUltimoMessaggio: "Grazie per avermi contattato!", timestampUltimoMessaggio: "02/05", messaggiNonLetti: 0 },
];

// Placeholder per icona
const IconaPlaceholderChat = () => <span className={styles.iconaPlaceholderChat}>💬</span>;


const DashboardClienteMessaggi: React.FC = () => {
  const [conversazioni, setConversazioni] = useState<ConversazionePreview[]>(conversazioniMock);
  const { idConversazione: idConversazioneAttivaParam } = useParams<{ idConversazione?: string }>(); // Dall'URL
  const navigate = useNavigate();
  const location = useLocation(); // Per controllare se siamo su una chat specifica

  // Determina se una chat è attiva (cioè se l'URL corrisponde a /dashboard-cliente/messaggi/:idConversazione)
  const isChatViewActive = !!idConversazioneAttivaParam;

  // Logica per gestire la query param `nuovo` o `appuntamento` per avviare una nuova chat
  // Questo è un esempio base, potrebbe necessitare di logica più robusta
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idProfPerNuovaChat = queryParams.get('nuovo');
    const idAppuntamentoPerChat = queryParams.get('appuntamento'); // o idRichiesta

    if (idProfPerNuovaChat) {
        // Cerca se esiste già una conversazione con questo professionista
        const convEsistente = conversazioni.find(c => c.idProfessionista === idProfPerNuovaChat);
        if (convEsistente) {
            navigate(`./${convEsistente.idConversazione}${location.search}`); // Mantieni altri query params se utili
        } else {
            // Mock: crea una nuova conversazione (in un'app reale, questo avverrebbe lato server)
            // e poi naviga ad essa. Per ora, simuliamo e basta.
            console.log(`Mock: Avvio nuova chat con professionista ${idProfPerNuovaChat} per appuntamento/richiesta ${idAppuntamentoPerChat || 'non specificato'}`);
            // Potresti creare un ID conversazione fittizio e navigare, ma PaginaChat non saprebbe come gestirlo senza dati reali.
            // Per questo esempio, se la conversazione non esiste, l'utente vedrà il placeholder.
            // Una soluzione più completa creerebbe la conversazione e poi navigarebbe al suo ID.
            // navigate(`./new-${idProfPerNuovaChat}`); // Esempio di navigazione a una "nuova" chat
        }
    }
  }, [location.search, navigate, conversazioni]);


  const getNavLinkClassConversazione = (idConv: string) => {
    return `${styles.cardAnteprimaConversazione} ${idConv === idConversazioneAttivaParam ? styles.conversazioneAttiva : ''}`;
  };
  
  // Formatta timestamp per visualizzazione breve
  const formattaTimestampBreve = (timestamp: string) => {
    // Logica di formattazione semplice, da migliorare per casi reali
    // (es. usando date-fns o moment.js)
    if (timestamp.includes(':')) return timestamp; // Già formato come ora
    if (timestamp.includes('/')) return timestamp; // Già formato come data
    return timestamp; // Lascia com'è (es. "Ieri")
  };


  return (
    <div> {/* Rimosso Contenitore per permettere a layoutMessaggi di gestire l'altezza */}
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        I Miei Messaggi
      </Titolo>
      <div className={styles.layoutMessaggi}>
        <aside className={styles.listaConversazioniColonna}>
          {conversazioni.length > 0 ? (
            conversazioni.map((conv) => (
              <NavLink
                key={conv.idConversazione}
                to={`./${conv.idConversazione}?profId=${conv.idProfessionista}`} // Passa profId se PaginaChat ne ha bisogno
                className={() => getNavLinkClassConversazione(conv.idConversazione)} // Usa una funzione per applicare la classe attiva
              >
                <div className={styles.avatarConversazione}>
                  {conv.urlFotoProfessionista ? (
                    <img src={conv.urlFotoProfessionista} alt={`Avatar di ${conv.nomeProfessionista}`} />
                  ) : (
                    <span>{conv.nomeProfessionista.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.contenutoAnteprima}>
                  <div className={styles.headerAnteprima}>
                    <span className={styles.nomeProfessionistaAnteprima}>{conv.nomeProfessionista}</span>
                    <span className={styles.timestampAnteprima}>{formattaTimestampBreve(conv.timestampUltimoMessaggio)}</span>
                  </div>
                  <Paragrafo className={styles.testoAnteprimaMessaggio}>{conv.anteprimaUltimoMessaggio}</Paragrafo>
                  <div className={styles.footerAnteprima}>
                    {conv.messaggiNonLetti > 0 && (
                      <span className={styles.badgeNonLetti}>{conv.messaggiNonLetti}</span>
                    )}
                  </div>
                </div>
              </NavLink>
            ))
          ) : (
            <Paragrafo className={styles.messaggioNessunaConversazione}>Nessuna conversazione attiva.</Paragrafo>
          )}
        </aside>
        <section className={styles.chatAttivaColonna}>
          {isChatViewActive ? (
            <Outlet /> // PaginaChat sarà renderizzata qui
          ) : (
            <div className={styles.placeholderChat}>
              <IconaPlaceholderChat />
              <Titolo livello={3}>Seleziona una conversazione</Titolo>
              <Paragrafo>Scegli una conversazione dalla lista a sinistra per visualizzare i messaggi o iniziarne una nuova.</Paragrafo>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardClienteMessaggi;
