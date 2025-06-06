import React from 'react';
import { useLocation } from 'react-router-dom';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';

const DashboardClienteSezionePlaceholder: React.FC = () => {
  const location = useLocation();
  const nomeSezione = location.pathname.split('/').pop() || 'Panoramica';
  const nomeSezioneFormattato = nomeSezione.charAt(0).toUpperCase() + nomeSezione.slice(1).replace(/-/g, ' ');

  return (
    <div>
      <Titolo livello={2} style={{ marginBottom: '1rem' }}>{nomeSezioneFormattato}</Titolo>
      <Paragrafo>Contenuto della sezione "{nomeSezioneFormattato}" del dashboard cliente in arrivo.</Paragrafo>
      <Paragrafo>Percorso: <code>{location.pathname}</code></Paragrafo>
    </div>
  );
};

export default DashboardClienteSezionePlaceholder;
