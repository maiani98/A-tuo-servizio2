import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaginaSelezioneRuolo.module.css';
import Contenitore from '../../componenti/comuni/Contenitore/Contenitore';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import Bottone from '../../componenti/comuni/Bottone/Bottone';

// Placeholder per icone - idealmente SVG o da una libreria
const IconaCliente = () => <div className={styles.iconaRuolo}>🏠</div>;
const IconaProfessionista = () => <div className={styles.iconaRuolo}>🛠️</div>;

const PaginaSelezioneRuolo: React.FC = () => {
  const navigate = useNavigate();

  const handleSelezioneRuolo = (ruolo: 'cliente' | 'professionista') => {
    if (ruolo === 'cliente') {
      navigate('/'); // Homepage Cliente
    } else if (ruolo === 'professionista') {
      navigate('/onboarding-professionista'); // Pagina Onboarding Professionista
    }
  };

  return (
    <Contenitore className={styles.paginaContenitore}>
      <Titolo livello={1} className={styles.titoloPagina}>
        Come Vuoi Usare A Tuo Servizio?
      </Titolo>
      <Paragrafo className={styles.sottotitoloPagina}>
        Scegli il ruolo che meglio descrive come utilizzerai la nostra piattaforma.
      </Paragrafo>

      <div className={styles.opzioniRuoloWrapper}>
        <div className={styles.opzioneCard} onClick={() => handleSelezioneRuolo('cliente')}>
          <IconaCliente />
          <Titolo livello={3} className={styles.titoloOpzioneCard}>
            Sono un Cliente
          </Titolo>
          <Paragrafo className={styles.descrizioneOpzioneCard}>
            Sto cercando un professionista qualificato per realizzare un mio progetto o risolvere un'esigenza.
          </Paragrafo>
          <Bottone
            variante="primario"
            className={styles.bottoneSelezioneRuolo}
            onClick={(e) => {
              e.stopPropagation(); // Evita che il click sulla card si propaghi due volte
              handleSelezioneRuolo('cliente');
            }}
          >
            Continua come Cliente
          </Bottone>
        </div>

        <div className={styles.opzioneCard} onClick={() => handleSelezioneRuolo('professionista')}>
          <IconaProfessionista />
          <Titolo livello={3} className={styles.titoloOpzioneCard}>
            Sono un Professionista
          </Titolo>
          <Paragrafo className={styles.descrizioneOpzioneCard}>
            Voglio offrire i miei servizi, aumentare la mia visibilità e trovare nuovi clienti interessati.
          </Paragrafo>
          <Bottone
            variante="primario" // Potrebbe essere 'secondario' per differenziare se necessario
            className={styles.bottoneSelezioneRuolo}
            onClick={(e) => {
              e.stopPropagation();
              handleSelezioneRuolo('professionista');
            }}
          >
            Continua come Professionista
          </Bottone>
        </div>
      </div>
    </Contenitore>
  );
};

export default PaginaSelezioneRuolo;
