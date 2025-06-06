import React, { useState, useEffect } from 'react';
import styles from './GestioneAreeOperativita.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface AreaOperativa {
  id: string;
  localita: string; // Città o CAP
}

interface DatiAreeOperativita {
  localitaTags: AreaOperativa[];
  localitaBase: string;
  raggioAzioneKm: number | ''; // Raggio in km dalla località base
}

const mockDatiEsistenti: DatiAreeOperativita = {
  localitaTags: [
    { id: 'loc1', localita: 'Milano, 20121' },
    { id: 'loc2', localita: 'Roma, 00184' },
    { id: 'loc3', localita: 'Monza' },
  ],
  localitaBase: 'Milano, MI',
  raggioAzioneKm: 50,
};

const GestioneAreeOperativita: React.FC = () => {
  const [localitaTags, setLocalitaTags] = useState<AreaOperativa[]>(mockDatiEsistenti.localitaTags);
  const [inputTag, setInputTag] = useState('');
  const [localitaBase, setLocalitaBase] = useState(mockDatiEsistenti.localitaBase);
  const [raggioAzioneKm, setRaggioAzioneKm] = useState<number | ''>(mockDatiEsistenti.raggioAzioneKm);
  const [feedbackSalvataggio, setFeedbackSalvataggio] = useState<string>('');

  useEffect(() => {
    // In un'app reale, caricare i dati esistenti
    setLocalitaTags(mockDatiEsistenti.localitaTags);
    setLocalitaBase(mockDatiEsistenti.localitaBase);
    setRaggioAzioneKm(mockDatiEsistenti.raggioAzioneKm);
  }, []);

  const handleAddTag = () => {
    if (inputTag.trim() && !localitaTags.find(t => t.localita === inputTag.trim())) {
      setLocalitaTags([...localitaTags, { id: `loc-${Date.now()}`, localita: inputTag.trim() }]);
      setInputTag('');
    } else if (inputTag.trim() !== '') {
      alert('Località già presente o input non valido.');
    }
  };

  const handleRemoveTag = (idToRemove: string) => {
    setLocalitaTags(localitaTags.filter(tag => tag.id !== idToRemove));
  };
  
  const handleKeyDownAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Previene submit del form o inserimento della virgola
      handleAddTag();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackSalvataggio('');
    // Simulazione salvataggio dati
    console.log('Dati Aree Operatività da salvare:', {
      localitaTags,
      localitaBase,
      raggioAzioneKm,
    });
    setFeedbackSalvataggio('Aree di operatività salvate con successo! (Simulazione)');
    setTimeout(() => setFeedbackSalvataggio(''), 3000);
  };

  return (
    <div className={styles.containerAree}>
      <Titolo livello={3} className={styles.titoloSezione}>Gestisci le Tue Aree di Operatività</Titolo>
      <Paragrafo className={styles.sottotitoloSezione}>
        Definisci le aree geografiche specifiche in cui offri i tuoi servizi e/o un raggio d'azione da una località base.
      </Paragrafo>

      <form onSubmit={handleSubmit} className={styles.formAree}>
        <div className={styles.sezioneFormTags}>
          <label htmlFor="inputTagLocalita" className={styles.labelForm}>Aggiungi Città o CAP specifici</label>
          <div className={styles.inputTagContainer}>
            <CampoTesto
              name="inputTagLocalita"
              id="inputTagLocalita"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={handleKeyDownAddTag}
              placeholder="Es. Roma, 00150, Napoli Centro"
              className={styles.inputTag} 
            />
            <Bottone type="button" onClick={handleAddTag} variante="secondario" className={styles.bottoneAddTag}>Aggiungi</Bottone>
          </div>
          <div className={styles.tagsContainer}>
            {localitaTags.map(tag => (
              <span key={tag.id} className={styles.tagItem}>
                {tag.localita}
                <button type="button" onClick={() => handleRemoveTag(tag.id)} className={styles.removeTagButton}>&times;</button>
              </span>
            ))}
          </div>
          {localitaTags.length === 0 && <Paragrafo className={styles.noTags}>Nessuna località specifica aggiunta.</Paragrafo>}
        </div>

        <div className={styles.sezioneFormRaggio}>
          <Titolo livello={4} className={styles.titoloSottoSezione}>Operatività basata su Raggio</Titolo>
          <CampoTesto
            etichetta="La tua Località Base (per calcolo raggio)"
            name="localitaBase"
            value={localitaBase}
            onChange={(e) => setLocalitaBase(e.target.value)}
            placeholder="Es. Milano, Via Rossi 1"
          />
          <CampoTesto
            etichetta="Raggio d'Azione (in Km)"
            type="number"
            name="raggioAzioneKm"
            value={raggioAzioneKm.toString()}
            onChange={(e) => setRaggioAzioneKm(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            min="0"
            placeholder="Es. 50"
          />
        </div>

        {/* Placeholder per la mappa */}
        <div className={styles.sezioneMappa}>
            <Titolo livello={4} className={styles.titoloSottoSezione}>Anteprima Mappa (Placeholder)</Titolo>
            <div className={styles.mappaPlaceholder}>
                <Paragrafo>Qui verrebbe visualizzata una mappa statica o interattiva che mostra le aree di operatività definite (es. Google Maps, Leaflet).</Paragrafo>
                <img src="https://via.placeholder.com/600x300/e0e0e0/999999?text=Mappa+Placeholder" alt="Mappa Placeholder" style={{maxWidth: '100%', borderRadius: '4px'}} />
            </div>
        </div>
        
        {feedbackSalvataggio && <Paragrafo className={styles.feedbackPositivo}>{feedbackSalvataggio}</Paragrafo>}

        <div className={styles.azioniForm}>
          <Bottone type="submit" variante="primario">Salva Aree di Operatività</Bottone>
        </div>
      </form>
    </div>
  );
};

export default GestioneAreeOperativita;
