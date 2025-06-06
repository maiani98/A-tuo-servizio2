import React, { useState } from 'react';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
// import styles from './OnboardingStep3Contatti.module.css'; // Optional

interface OnboardingStep3Props {
  onNext: (data: Step3Data) => void; // Typically, onNext would trigger final submission
  initialData?: Partial<Step3Data>;
}

export interface Step3Data {
  telefono: string;
  linkedIn?: string;
  sitoWeb?: string;
  orariDisponibilita: string; // Placeholder for a more structured availability input
}

const OnboardingStep3Contatti: React.FC<OnboardingStep3Props> = ({ onNext, initialData }) => {
  const [telefono, setTelefono] = useState(initialData?.telefono || '');
  const [linkedIn, setLinkedIn] = useState(initialData?.linkedIn || '');
  const [sitoWeb, setSitoWeb] = useState(initialData?.sitoWeb || '');
  const [orariDisponibilita, setOrariDisponibilita] = useState(initialData?.orariDisponibilita || '');
  const [errore, setErrore] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrore(null);

    if (!telefono || !orariDisponibilita) {
      setErrore('Telefono e Orari di Disponibilità sono obbligatori.');
      return;
    }
    // TODO: Add validation for phone, LinkedIn URL, Sito Web URL format

    onNext({
      telefono,
      linkedIn,
      sitoWeb,
      orariDisponibilita,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Contatti e Disponibilità</h2>
      {errore && <p style={{ color: 'red' }}>{errore}</p>}

      <CampoTesto
        etichetta="Numero di Telefono"
        type="tel"
        name="telefono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
        placeholder="Es. 3331234567"
      />
      <CampoTesto
        etichetta="Profilo LinkedIn (Opzionale)"
        type="url"
        name="linkedIn"
        value={linkedIn}
        onChange={(e) => setLinkedIn(e.target.value)}
        placeholder="Es. https://www.linkedin.com/in/tuoprofilo"
      />
      <CampoTesto
        etichetta="Sito Web (Opzionale)"
        type="url"
        name="sitoWeb"
        value={sitoWeb}
        onChange={(e) => setSitoWeb(e.target.value)}
        placeholder="Es. https://www.tuosito.com"
      />
      
      <div>
        <label htmlFor="orariDisponibilita">Orari di Disponibilità</label>
        <textarea
          id="orariDisponibilita"
          name="orariDisponibilita"
          value={orariDisponibilita}
          onChange={(e) => setOrariDisponibilita(e.target.value)}
          required
          rows={4}
          placeholder="Es. Lun-Ven 9:00-18:00, Sabato su appuntamento"
          // className={styles.textareaInput} // se si usa un CSS module specifico
        />
      </div>
      
      <Bottone type="submit" variante="primario">
        Salva e Completa Profilo
      </Bottone>
    </form>
  );
};

export default OnboardingStep3Contatti;
