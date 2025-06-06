import React from 'react';
import { useParams } from 'react-router-dom';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';

const PaginaChatPlaceholder: React.FC = () => {
  const { idConversazione } = useParams<{ idConversazione?: string }>();
  const queryParams = new URLSearchParams(window.location.search);
  const profId = queryParams.get('profId');

  return (
    <div style={{ padding: '1rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #eee' }}>
      <Titolo livello={3} style={{ marginBottom: '1rem' }}>Chat Attiva</Titolo>
      {idConversazione ? (
        <Paragrafo>
          Interfaccia chat per la conversazione: <strong>{idConversazione}</strong>
          {profId && ` con Professionista ID: ${profId}`}.
          <br />
          (Componente PaginaChat.tsx da implementare)
        </Paragrafo>
      ) : (
        <Paragrafo>Nessuna conversazione selezionata. (Componente PaginaChat.tsx da implementare)</Paragrafo>
      )}
    </div>
  );
};

export default PaginaChatPlaceholder;
