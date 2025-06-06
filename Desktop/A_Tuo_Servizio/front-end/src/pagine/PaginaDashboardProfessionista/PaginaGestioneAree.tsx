import React, { useState, useEffect } from 'react';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import styles from './PaginaGestioneAree.module.css'; // Verrà creato nel prossimo passo

const PaginaGestioneAree: React.FC = () => {
  const [areeOperativita, setAreeOperativita] = useState<string[]>([]);
  const [nuovaArea, setNuovaArea] = useState('');
  const [erroreForm, setErroreForm] = useState<string | null>(null);

  // Dati mock iniziali (simula caricamento da API)
  useEffect(() => {
    setAreeOperativita([
      "Milano - Centro Storico",
      "Roma - Zona Prati",
      "Online - Tutta Italia",
      "Provincia di Varese",
      "00150 (CAP)",
    ]);
  }, []);

  const handleAggiungiArea = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroreForm(null);

    if (!nuovaArea.trim()) {
      setErroreForm('Il nome dell\'area non può essere vuoto.');
      return;
    }
    if (areeOperativita.some(area => area.toLowerCase() === nuovaArea.trim().toLowerCase())) {
      setErroreForm('Quest\'area è già stata aggiunta.');
      return;
    }

    setAreeOperativita([...areeOperativita, nuovaArea.trim()]);
    setNuovaArea(''); // Resetta il campo input
    console.log('Area aggiunta:', nuovaArea.trim());
  };

  const handleEliminaArea = (areaDaEliminare: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'area "${areaDaEliminare}"?`)) {
      setAreeOperativita(areeOperativita.filter(area => area !== areaDaEliminare));
      console.log('Area eliminata:', areaDaEliminare);
    }
  };

  return (
    <div className={styles.contenitoreGestione}>
      <Titolo livello={2} className={styles.titoloSezione}>Gestisci Aree di Operatività</Titolo>
      <Paragrafo className={styles.infoSezione}>
        Aggiungi o rimuovi le località o le zone geografiche in cui offri i tuoi servizi.
        Puoi inserire città, CAP specifici, province, regioni o specificare "Online" se applicabile.
      </Paragrafo>

      <form onSubmit={handleAggiungiArea} className={styles.formAggiungiArea}>
        <CampoTesto
          etichetta="Nuova Area di Operatività"
          name="nuovaArea"
          value={nuovaArea}
          onChange={(e) => setNuovaArea(e.target.value)}
          placeholder="Es. Torino, 00150, Tutta Italia, Online"
          className={styles.campoNuovaArea} // Per flex-grow
        />
        <Bottone type="submit" variante="primario" className={styles.bottoneAggiungi}>
          Aggiungi Area
        </Bottone>
      </form>
      {erroreForm && <Paragrafo className={styles.messaggioErroreForm}>{erroreForm}</Paragrafo>}

      <div className={styles.elencoAree}>
        {areeOperativita.length === 0 ? (
          <Paragrafo className={styles.messaggioNessunaArea}>
            Nessuna area di operatività ancora aggiunta.
          </Paragrafo>
        ) : (
          areeOperativita.map((area, index) => (
            <div key={index} className={styles.chipArea}>
              <span>{area}</span>
              <button 
                onClick={() => handleEliminaArea(area)} 
                className={styles.bottoneEliminaChip}
                aria-label={`Elimina area ${area}`}
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaginaGestioneAree;
