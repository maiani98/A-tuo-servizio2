import React, { useState } from 'react';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
// import styles from './OnboardingStep2Descrizione.module.css'; // Optional: if specific styles are needed

interface OnboardingStep2Props {
  onNext: (data: Step2Data) => void;
  initialData?: Partial<Step2Data>;
}

export interface Step2Data {
  fotoProfilo?: File | null; // Opzionale come da design, ma qui lo tratteremo
  descrizioneBreve: string;
  descrizioneDettagliata: string;
  areeCompetenza: string[]; // Placeholder: idealmente un array di stringhe selezionate
}

const OnboardingStep2Descrizione: React.FC<OnboardingStep2Props> = ({ onNext, initialData }) => {
  const [fotoProfilo, setFotoProfilo] = useState<File | null>(initialData?.fotoProfilo || null);
  const [descrizioneBreve, setDescrizioneBreve] = useState(initialData?.descrizioneBreve || '');
  const [descrizioneDettagliata, setDescrizioneDettagliata] = useState(initialData?.descrizioneDettagliata || '');
  // Per Aree di Competenza (selezione multipla), usiamo un input testuale semplice per ora.
  // In una implementazione reale, si userebbe un componente multi-select o checkboxes.
  const [areeCompetenzaInput, setAreeCompetenzaInput] = useState((initialData?.areeCompetenza || []).join(', '));
  const [errore, setErrore] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFotoProfilo(event.target.files[0]);
    } else {
      setFotoProfilo(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrore(null);

    if (!descrizioneBreve || !descrizioneDettagliata) {
      setErrore('Le descrizioni sono obbligatorie.');
      return;
    }
    // Validazione aggiuntiva (es. lunghezza massima) potrebbe essere aggiunta qui

    const areeCompetenzaArray = areeCompetenzaInput.split(',').map(s => s.trim()).filter(s => s !== '');

    onNext({
      fotoProfilo,
      descrizioneBreve,
      descrizioneDettagliata,
      areeCompetenza: areeCompetenzaArray,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Descrizione e Aree di Competenza</h2>
      {errore && <p style={{ color: 'red' }}>{errore}</p>}

      <CampoTesto
        etichetta="Foto Profilo (Opzionale)"
        type="file"
        name="fotoProfilo"
        accept="image/*"
        onChange={handleFileChange}
      />
      {fotoProfilo && <p>File selezionato: {fotoProfilo.name}</p>}

      {/* Textarea per Descrizione Breve */}
      <div>
        <label htmlFor="descrizioneBreve">Descrizione Breve (max 150 caratteri)</label>
        <textarea
          id="descrizioneBreve"
          name="descrizioneBreve"
          value={descrizioneBreve}
          onChange={(e) => setDescrizioneBreve(e.target.value)}
          required
          maxLength={150}
          rows={3}
          // className={styles.textareaInput} // se si usa un CSS module specifico
        />
      </div>
      
      {/* Textarea per Descrizione Dettagliata */}
      <div>
        <label htmlFor="descrizioneDettagliata">Descrizione Dettagliata</label>
        <textarea
          id="descrizioneDettagliata"
          name="descrizioneDettagliata"
          value={descrizioneDettagliata}
          onChange={(e) => setDescrizioneDettagliata(e.target.value)}
          required
          rows={6}
          // className={styles.textareaInput} // se si usa un CSS module specifico
        />
      </div>

      <CampoTesto
        etichetta="Aree di Competenza (separate da virgola)"
        type="text"
        name="areeCompetenza"
        value={areeCompetenzaInput}
        onChange={(e) => setAreeCompetenzaInput(e.target.value)}
        placeholder="Es. Riparazioni Idrauliche, Installazione Sanitari, Progettazione Impianti"
        // Nota: questo dovrebbe essere un componente multi-select
      />
      
      <Bottone type="submit" variante="primario">
        Salva e Continua
      </Bottone>
    </form>
  );
};

export default OnboardingStep2Descrizione;
