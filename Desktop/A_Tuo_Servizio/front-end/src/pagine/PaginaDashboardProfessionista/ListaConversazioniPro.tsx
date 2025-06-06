import React from 'react';
import styles from './ListaConversazioniPro.module.css';
import { Paragrafo, Titolo } from '../../componenti/comuni/TestiTipografici/TestiTipografici'; // Assumendo che Titolo sia disponibile

export interface ConversazionePreview {
  id: string;
  nomeCliente: string;
  fotoCliente?: string; // URL
  anteprimaMessaggio: string;
  dataUltimoMessaggio: Date;
  nonLetti: number;
}

interface ListaConversazioniProProps {
  conversazioni: ConversazionePreview[];
  onSelectConversazione: (id: string) => void;
  conversazioneAttivaId: string | null;
}

const ListaConversazioniPro: React.FC<ListaConversazioniProProps> = ({ 
  conversazioni, 
  onSelectConversazione,
  conversazioneAttivaId 
}) => {
  
  // Ordina le conversazioni per dataUltimoMessaggio (più recenti prima)
  const conversazioniOrdinate = [...conversazioni].sort(
    (a, b) => b.dataUltimoMessaggio.getTime() - a.dataUltimoMessaggio.getTime()
  );

  return (
    <div className={styles.listaContainer}>
      <div className={styles.headerLista}>
        <Titolo livello={3} className={styles.titoloHeader}>Conversazioni</Titolo>
        {/* Qui potrebbero esserci filtri o un campo di ricerca */}
      </div>
      {conversazioniOrdinate.length === 0 && (
        <Paragrafo className={styles.noConversazioni}>Nessuna conversazione presente.</Paragrafo>
      )}
      {conversazioniOrdinate.map(conv => (
        <div 
          key={conv.id} 
          className={`${styles.conversazioneItem} ${conv.id === conversazioneAttivaId ? styles.attiva : ''} ${conv.nonLetti > 0 ? styles.nonLetta : ''}`}
          onClick={() => onSelectConversazione(conv.id)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onSelectConversazione(conv.id)}
        >
          <div className={styles.fotoContainer}>
            <img 
              src={conv.fotoCliente || 'https://via.placeholder.com/50/6c757d/FFFFFF?text=?'} 
              alt={`Foto profilo ${conv.nomeCliente}`} 
              className={styles.fotoProfilo}
            />
          </div>
          <div className={styles.contenutoConversazione}>
            <div className={styles.headerContenuto}>
              <span className={styles.nomeCliente}>{conv.nomeCliente}</span>
              <span className={styles.dataMessaggio}>
                {conv.dataUltimoMessaggio.toLocaleDateString() === new Date().toLocaleDateString()
                  ? conv.dataUltimoMessaggio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : conv.dataUltimoMessaggio.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <Paragrafo className={styles.anteprimaMessaggio} truncateLines={1}>
              {conv.anteprimaMessaggio}
            </Paragrafo>
          </div>
          {conv.nonLetti > 0 && (
            <div className={styles.badgeNonLettiContainer}>
              <span className={styles.badgeNonLetti}>{conv.nonLetti}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListaConversazioniPro;
