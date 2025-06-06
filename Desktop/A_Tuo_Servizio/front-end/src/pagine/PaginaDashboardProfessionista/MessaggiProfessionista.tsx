import React, { useState, useCallback } from 'react';
import styles from './MessaggiProfessionista.module.css';
import ListaConversazioniPro, { ConversazionePreview } from './ListaConversazioniPro';
import ChatAttivaProfessionista, { Messaggio } from './ChatAttivaProfessionista';
import { Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';

// Mock data for conversations and messages
const mockConversazioniData: ConversazionePreview[] = [
  { id: 'conv001', nomeCliente: 'Mario Rossi', anteprimaMessaggio: 'Grazie per il preventivo, lo valuto.', dataUltimoMessaggio: new Date('2024-07-28T10:30:00'), nonLetti: 0, fotoCliente: 'https://via.placeholder.com/50/007bff/FFFFFF?text=MR' },
  { id: 'conv002', nomeCliente: 'Laura Bianchi', anteprimaMessaggio: 'Avrei bisogno di alcune modifiche...', dataUltimoMessaggio: new Date('2024-07-29T11:00:00'), nonLetti: 2, fotoCliente: 'https://via.placeholder.com/50/28a745/FFFFFF?text=LB' },
  { id: 'conv003', nomeCliente: 'Giuseppe Verdi', anteprimaMessaggio: 'Perfetto, procediamo!', dataUltimoMessaggio: new Date('2024-07-27T15:00:00'), nonLetti: 0, fotoCliente: 'https://via.placeholder.com/50/ffc107/000000?text=GV' },
  { id: 'conv004', nomeCliente: 'Anna Neri', anteprimaMessaggio: 'Quando sarebbe disponibile per un sopralluogo?', dataUltimoMessaggio: new Date(), nonLetti: 1, fotoCliente: 'https://via.placeholder.com/50/dc3545/FFFFFF?text=AN' },
];

const mockMessaggiPerConversazione: { [key: string]: Messaggio[] } = {
  'conv001': [
    { id: 'msg001', idAutore: 'cliente001', testo: 'Buongiorno, ho ricevuto il preventivo per la riparazione idraulica.', timestamp: new Date('2024-07-28T10:00:00'), tipo: 'ricevuto' },
    { id: 'msg002', idAutore: 'professionista', testo: 'Ottimo! Resto a disposizione per chiarimenti.', timestamp: new Date('2024-07-28T10:05:00'), tipo: 'inviato' },
    { id: 'msg003', idAutore: 'cliente001', testo: 'Grazie per il preventivo, lo valuto.', timestamp: new Date('2024-07-28T10:30:00'), tipo: 'ricevuto' },
  ],
  'conv002': [
    { id: 'msg004', idAutore: 'cliente002', testo: 'Salve, riguardo al progetto del logo...', timestamp: new Date('2024-07-29T10:55:00'), tipo: 'ricevuto' },
    { id: 'msg005', idAutore: 'cliente002', testo: 'Avrei bisogno di alcune modifiche ai colori proposti.', timestamp: new Date('2024-07-29T11:00:00'), tipo: 'ricevuto' },
  ],
  'conv003': [
    { id: 'msg006', idAutore: 'professionista', testo: 'Il sito web è quasi pronto, ecco un\'anteprima.', timestamp: new Date('2024-07-27T14:55:00'), tipo: 'inviato' },
    { id: 'msg007', idAutore: 'cliente003', testo: 'Perfetto, procediamo!', timestamp: new Date('2024-07-27T15:00:00'), tipo: 'ricevuto' },
  ],
   'conv004': [
    { id: 'msg008', idAutore: 'cliente004', testo: 'Quando sarebbe disponibile per un sopralluogo?', timestamp: new Date(), tipo: 'ricevuto' },
  ]
};


const MessaggiProfessionista: React.FC = () => {
  const [conversazioni, setConversazioni] = useState<ConversazionePreview[]>(mockConversazioniData);
  const [conversazioneAttivaId, setConversazioneAttivaId] = useState<string | null>(mockConversazioniData.length > 0 ? mockConversazioniData[0].id : null);
  const [messaggiAttivi, setMessaggiAttivi] = useState<Messaggio[]>([]);

  useEffect(() => {
    if (conversazioneAttivaId) {
      setMessaggiAttivi(mockMessaggiPerConversazione[conversazioneAttivaId] || []);
      // Marcare come letti (simulazione)
      setConversazioni(prev => 
        prev.map(c => c.id === conversazioneAttivaId ? {...c, nonLetti: 0} : c)
      );
    } else {
      setMessaggiAttivi([]);
    }
  }, [conversazioneAttivaId]);

  const handleSelectConversazione = useCallback((idConv: string) => {
    setConversazioneAttivaId(idConv);
  }, []);

  const handleInviaMessaggio = useCallback((testo: string) => {
    if (!conversazioneAttivaId) return;

    const nuovoMessaggio: Messaggio = {
      id: `msg-${Date.now()}`,
      idAutore: 'professionista', // 'professionista' o l'ID effettivo del professionista loggato
      testo,
      timestamp: new Date(),
      tipo: 'inviato',
    };
    
    // Aggiorna mock globale (simulazione backend)
    mockMessaggiPerConversazione[conversazioneAttivaId] = [...(mockMessaggiPerConversazione[conversazioneAttivaId] || []), nuovoMessaggio];
    setMessaggiAttivi(prev => [...prev, nuovoMessaggio]);

    // Aggiorna anteprima e data nell'elenco conversazioni
    setConversazioni(prevConvs => prevConvs.map(conv => 
      conv.id === conversazioneAttivaId 
      ? { ...conv, anteprimaMessaggio: testo, dataUltimoMessaggio: new Date() } 
      : conv
    ).sort((a, b) => b.dataUltimoMessaggio.getTime() - a.dataUltimoMessaggio.getTime()));

  }, [conversazioneAttivaId]);
  
  const conversazioneAttivaDettagli = conversazioni.find(c => c.id === conversazioneAttivaId);

  return (
    <div className={styles.messaggiLayout}>
      <div className={styles.colonnaListaConversazioni}>
        <ListaConversazioniPro 
          conversazioni={conversazioni}
          onSelectConversazione={handleSelectConversazione}
          conversazioneAttivaId={conversazioneAttivaId}
        />
      </div>
      <div className={styles.colonnaChatAttiva}>
        {conversazioneAttivaDettagli ? (
          <ChatAttivaProfessionista
            key={conversazioneAttivaId} // Per forzare il remount quando cambia la chat
            conversazione={conversazioneAttivaDettagli}
            messaggi={messaggiAttivi}
            onInviaMessaggio={handleInviaMessaggio}
          />
        ) : (
          <div className={styles.noChatSelected}>
            <Titolo livello={3}>Nessuna conversazione selezionata</Titolo>
            <Paragrafo>Scegli una conversazione dalla lista per visualizzare i messaggi.</Paragrafo>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessaggiProfessionista;
