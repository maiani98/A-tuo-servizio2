import React, { useState } from 'react';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
// Assumendo che lo stile per i form sia globale o definito nel CSS module del genitore
// import styles from './OnboardingStep1InfoBase.module.css'; 

interface OnboardingStep1Props {
  onNext: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>; 
}

export interface Step1Data {
  nome: string;
  cognome: string;
  email: string;
  // password and confirmPassword will be handled internally and not passed up for now
  specializzazione: string;
  anniEsperienza: number;
}

const OnboardingStep1InfoBase: React.FC<OnboardingStep1Props> = ({ onNext, initialData }) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [cognome, setCognome] = useState(initialData?.cognome || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specializzazione, setSpecializzazione] = useState(initialData?.specializzazione || '');
  const [anniEsperienza, setAnniEsperienza] = useState<number | ''>(initialData?.anniEsperienza || '');
  const [errore, setErrore] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrore(null);

    if (!nome || !cognome || !email || !password || !confirmPassword || !specializzazione || anniEsperienza === '') {
      setErrore('Tutti i campi sono obbligatori.');
      return;
    }
    if (password !== confirmPassword) {
      setErrore('Le password non coincidono.');
      return;
    }
    if (anniEsperienza < 0) {
      setErrore('Gli anni di esperienza non possono essere negativi.');
      return;
    }
    // TODO: Add more specific validation (e.g., email format)

    onNext({
      nome,
      cognome,
      email,
      specializzazione,
      anniEsperienza: Number(anniEsperienza),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Informazioni di Base</h2>
      {errore && <p style={{ color: 'red' }}>{errore}</p>}
      
      <CampoTesto
        etichetta="Nome"
        type="text"
        name="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <CampoTesto
        etichetta="Cognome"
        type="text"
        name="cognome"
        value={cognome}
        onChange={(e) => setCognome(e.target.value)}
        required
      />
      <CampoTesto
        etichetta="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <CampoTesto
        etichetta="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <CampoTesto
        etichetta="Conferma Password"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <CampoTesto // Potrebbe essere un Select in futuro
        etichetta="Specializzazione Principale"
        type="text"
        name="specializzazione"
        value={specializzazione}
        onChange={(e) => setSpecializzazione(e.target.value)}
        required
        placeholder="Es. Idraulico, Elettricista, Web Designer"
      />
      <CampoTesto
        etichetta="Anni di Esperienza"
        type="number"
        name="anniEsperienza"
        value={anniEsperienza.toString()}
        onChange={(e) => setAnniEsperienza(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        required
        min="0"
      />
      
      {/* Il bottone di navigazione "Avanti" è gestito dal componente genitore 
          PaginaOnboardingProfessionista.tsx, ma qui serve un bottone di submit
          per attivare la validazione e la raccolta dati di questo step.
          Si potrebbe passare il testo del bottone come prop se necessario.
      */}
      <Bottone type="submit" variante="primario">
        Avanti
      </Bottone>
    </form>
  );
};

export default OnboardingStep1InfoBase;
