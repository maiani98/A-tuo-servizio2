import React from 'react';
import styles from './ProfessionalCard.module.css';
import { Paragrafo } from '../../comuni/TestiTipografici/TestiTipografici'; // Assumendo Titolo sia h4
import { Bottone } from '../../comuni/Bottone/Bottone';

// Interfaccia BadgeProps (opzionale, usiamo string[] per semplicità ora)
// interface BadgeProps {
//   testo: string;
//   tipo?: string;
// }

export interface ProfessionalCardProps {
  idProfessionista: string | number;
  urlFotoProfilo?: string;
  nome: string;
  specializzazione: string;
  valutazioneMedia: number;
  numeroRecensioni: number;
  localita: string;
  distanza?: string;
  tagline: string;
  badges?: string[];
  onVediProfilo: (id: string | number) => void;
  id: string;
  haPortfolio: boolean;
  disponibilita: string[];
  servizio: string;
  rating: number;
}

// Funzione Helper per renderizzare le stelle
const RenderStelle: React.FC<{ valutazione: number }> = ({ valutazione }) => {
  const stellePiene = Math.floor(valutazione);
  const mezzaStella = valutazione % 1 >= 0.5;
  const stelleVuote = 5 - stellePiene - (mezzaStella ? 1 : 0);
  const stelleArray = [];

  for (let i = 0; i < stellePiene; i++) {
    stelleArray.push(<span key={`piena-${i}`} className={styles.stellaIcona}>★</span>);
  }
  if (mezzaStella) {
    // Per una vera mezza stella, si potrebbe usare un'icona SVG o due span sovrapposti.
    // Per semplicità, usiamo un carattere che assomigli o lo stesso della piena per ora.
    stelleArray.push(<span key="mezza" className={styles.stellaIcona}>★</span>); // Semplificato
  }
  for (let i = 0; i < stelleVuote; i++) {
    stelleArray.push(<span key={`vuota-${i}`} className={`${styles.stellaIcona} ${styles.stellaVuota}`}>☆</span>);
  }
  return <>{stelleArray}</>;
};


export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  idProfessionista,
  urlFotoProfilo,
  nome,
  specializzazione,
  valutazioneMedia,
  numeroRecensioni,
  localita,
  distanza,
  tagline,
  badges = [], // Default a array vuoto
  onVediProfilo,
}) => {
  const inizialiNome = nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  return (
    <div className={styles.cardContenitore}>
      {/* Colonna Sinistra (Foto) */}
      <div className={styles.fotoWrapper}>
        {urlFotoProfilo ? (
          <img src={urlFotoProfilo} alt={`Foto profilo di ${nome}`} className={styles.fotoProfilo} />
        ) : (
          <div className={`${styles.fotoProfilo} ${styles.fotoPlaceholder}`}>
            {inizialiNome}
          </div>
        )}
      </div>

      {/* Colonna Destra (Info) */}
      <div className={styles.infoWrapper}>
        <h4 className={styles.nomeProfessionista}>{nome}</h4>
        <Paragrafo className={styles.specializzazione}>{specializzazione}</Paragrafo>
        
        {badges && badges.length > 0 && (
          <div className={styles.badgesWrapper}>
            {badges.map((badge, index) => (
              <span key={index} className={styles.badgeSingolo}>{badge}</span>
            ))}
          </div>
        )}

        <div className={styles.valutazioneWrapper}>
          <RenderStelle valutazione={valutazioneMedia} />
          <span className={styles.stelleTestoRecensioni}>({numeroRecensioni} recensioni)</span>
        </div>

        <Paragrafo className={styles.localita}>
          {localita} {distanza && <span>{distanza}</span>}
        </Paragrafo>
        
        <Paragrafo className={styles.tagline}>{tagline}</Paragrafo>

        <div className={styles.bottoneVediProfiloWrapper}>
          <Bottone
            variante="secondario"
            onClick={() => onVediProfilo(idProfessionista)}
            className={styles.bottoneVediProfilo} // Per eventuali stili specifici al bottone nella card
          >
            Vedi Profilo
          </Bottone>
        </div>
      </div>
    </div>
  );
};

// Esportazione default per convenzione nel progetto
export default ProfessionalCard;
