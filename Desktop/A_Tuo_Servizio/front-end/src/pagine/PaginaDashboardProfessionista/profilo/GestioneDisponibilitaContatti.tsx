import React, { useState, useEffect } from 'react';
import styles from './GestioneDisponibilitaContatti.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface ContattiData {
  telefonoPubblico: string;
  emailPubblica: string;
  sitoWeb?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkLinkedIn?: string;
  altriSocial?: string; // Per social non specificati
}

interface OrarioLavorativo {
  attivo: boolean;
  inizio: string; // HH:mm
  fine: string; // HH:mm
}

interface DisponibilitaData {
  giorniLavorativi: { [key: string]: OrarioLavorativo }; // Es. 'lun', 'mar', ...
  tempoMinimoPreavviso: string; // Es. '1g', '2h', 'nessuno'
  noteDisponibilita?: string;
}

const giorniSettimana = [
  { key: 'lun', label: 'Lunedì' },
  { key: 'mar', label: 'Martedì' },
  { key: 'mer', label: 'Mercoledì' },
  { key: 'gio', label: 'Giovedì' },
  { key: 'ven', label: 'Venerdì' },
  { key: 'sab', label: 'Sabato' },
  { key: 'dom', label: 'Domenica' },
];

const initialOrariDefault: OrarioLavorativo = { attivo: false, inizio: '09:00', fine: '18:00' };
const initialGiorniLavorativi = giorniSettimana.reduce((acc, giorno) => {
    acc[giorno.key] = { ...initialOrariDefault, attivo: ['sab', 'dom'].includes(giorno.key) ? false : true };
    return acc;
}, {} as { [key: string]: OrarioLavorativo });


const mockDatiContattiEsistenti: ContattiData = {
  telefonoPubblico: '012 3456789',
  emailPubblica: 'info@mariorossi-idraulico.it',
  sitoWeb: 'https://www.mariorossi-idraulico.it',
  linkLinkedIn: 'https://linkedin.com/in/mariorossi-idraulico',
};

const mockDatiDisponibilitaEsistenti: DisponibilitaData = {
  giorniLavorativi: initialGiorniLavorativi,
  tempoMinimoPreavviso: '24h', // Es. 1 ora, 2 ore, 1 giorno, 2 giorni
  noteDisponibilita: 'Per urgenze fuori orario, contattare telefonicamente. Disponibile per trasferte brevi con preavviso.',
};


const GestioneDisponibilitaContatti: React.FC = () => {
  const [contatti, setContatti] = useState<ContattiData>(mockDatiContattiEsistenti);
  const [disponibilita, setDisponibilita] = useState<DisponibilitaData>(mockDatiDisponibilitaEsistenti);
  const [feedbackSalvataggio, setFeedbackSalvataggio] = useState<string>('');

  useEffect(() => {
    // In un'app reale, caricare i dati esistenti
    setContatti(mockDatiContattiEsistenti);
    setDisponibilita(mockDatiDisponibilitaEsistenti);
  }, []);

  const handleContattiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContatti(prev => ({ ...prev, [name]: value }));
  };

  const handleGiornoLavorativoChange = (giornoKey: string, campo: keyof OrarioLavorativo, value: string | boolean) => {
    setDisponibilita(prev => ({
      ...prev,
      giorniLavorativi: {
        ...prev.giorniLavorativi,
        [giornoKey]: {
          ...prev.giorniLavorativi[giornoKey],
          [campo]: value,
        }
      }
    }));
  };
  
  const handleDisponibilitaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setDisponibilita(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackSalvataggio('');
    // Simulazione salvataggio dati
    console.log('Dati Contatti e Disponibilità da salvare:', {
      contatti,
      disponibilita,
    });
    // Validazione orari (esempio base)
    for (const giorno of Object.values(disponibilita.giorniLavorativi)) {
        if (giorno.attivo && giorno.inizio >= giorno.fine) {
            setFeedbackSalvataggio(`Errore: L'orario di inizio per un giorno attivo non può essere uguale o successivo all'orario di fine.`);
            setTimeout(() => setFeedbackSalvataggio(''), 5000);
            return;
        }
    }
    setFeedbackSalvataggio('Disponibilità e contatti salvati con successo! (Simulazione)');
    setTimeout(() => setFeedbackSalvataggio(''), 3000);
  };

  return (
    <div className={styles.containerDisponibilitaContatti}>
      <Titolo livello={3} className={styles.titoloSezione}>Gestisci Disponibilità e Contatti Pubblici</Titolo>
      <Paragrafo className={styles.sottotitoloSezione}>
        Aggiorna come i clienti possono contattarti e quando sei generalmente disponibile.
      </Paragrafo>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sezione Contatti */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Informazioni di Contatto Pubbliche</legend>
          <CampoTesto etichetta="Telefono Pubblico" name="telefonoPubblico" value={contatti.telefonoPubblico} onChange={handleContattiChange} type="tel" placeholder="Es. 012 3456789" />
          <CampoTesto etichetta="Email Pubblica" name="emailPubblica" value={contatti.emailPubblica} onChange={handleContattiChange} type="email" placeholder="Es. info@tuasocieta.com" />
          <CampoTesto etichetta="Sito Web (Opzionale)" name="sitoWeb" value={contatti.sitoWeb || ''} onChange={handleContattiChange} type="url" placeholder="Es. https://www.tuosito.com" />
          <CampoTesto etichetta="Pagina Facebook (Opzionale)" name="linkFacebook" value={contatti.linkFacebook || ''} onChange={handleContattiChange} type="url" placeholder="Es. https://facebook.com/tuapagina" />
          <CampoTesto etichetta="Profilo Instagram (Opzionale)" name="linkInstagram" value={contatti.linkInstagram || ''} onChange={handleContattiChange} type="url" placeholder="Es. https://instagram.com/tuoprofilo" />
          <CampoTesto etichetta="Profilo LinkedIn (Opzionale)" name="linkLinkedIn" value={contatti.linkLinkedIn || ''} onChange={handleContattiChange} type="url" placeholder="Es. https://linkedin.com/in/tuoprofilo" />
          <CampoTesto etichetta="Altro Social (Opzionale)" name="altriSocial" value={contatti.altriSocial || ''} onChange={handleContattiChange} type="url" placeholder="Link a un altro profilo social" />
        </fieldset>

        {/* Sezione Disponibilità Generica */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Disponibilità Generica</legend>
          <div className={styles.containerGiorniLavorativi}>
            {giorniSettimana.map(giorno => (
              <div key={giorno.key} className={styles.rigaGiornoLavorativo}>
                <input 
                  type="checkbox" 
                  id={`attivo-${giorno.key}`} 
                  checked={disponibilita.giorniLavorativi[giorno.key]?.attivo || false}
                  onChange={(e) => handleGiornoLavorativoChange(giorno.key, 'attivo', e.target.checked)}
                  className={styles.checkboxGiorno}
                />
                <label htmlFor={`attivo-${giorno.key}`} className={styles.labelGiorno}>{giorno.label}</label>
                {disponibilita.giorniLavorativi[giorno.key]?.attivo && (
                  <>
                    <CampoTesto type="time" aria-label={`Inizio ${giorno.label}`} value={disponibilita.giorniLavorativi[giorno.key]?.inizio || '09:00'} onChange={(e) => handleGiornoLavorativoChange(giorno.key, 'inizio', e.target.value)} className={styles.timeInput} />
                    <span>-</span>
                    <CampoTesto type="time" aria-label={`Fine ${giorno.label}`} value={disponibilita.giorniLavorativi[giorno.key]?.fine || '18:00'} onChange={(e) => handleGiornoLavorativoChange(giorno.key, 'fine', e.target.value)} className={styles.timeInput} />
                  </>
                )}
                {!disponibilita.giorniLavorativi[giorno.key]?.attivo && <span className={styles.chiusoLabel}>Chiuso</span>}
              </div>
            ))}
          </div>
          
          <div>
            <label htmlFor="tempoMinimoPreavviso" className={styles.labelForm}>Tempo Minimo di Preavviso per Appuntamenti</label>
            <select 
                name="tempoMinimoPreavviso" 
                id="tempoMinimoPreavviso" 
                value={disponibilita.tempoMinimoPreavviso} 
                onChange={handleDisponibilitaChange} 
                className={styles.selectInput}
            >
                <option value="nessuno">Nessun preavviso</option>
                <option value="1h">1 ora</option>
                <option value="2h">2 ore</option>
                <option value="4h">4 ore</option>
                <option value="12h">12 ore</option>
                <option value="24h">24 ore (1 giorno)</option>
                <option value="48h">48 ore (2 giorni)</option>
                <option value="custom">Altro (specificare nelle note)</option>
            </select>
          </div>

          <div>
            <label htmlFor="noteDisponibilita" className={styles.labelForm}>Note sulla Disponibilità (Opzionale)</label>
            <textarea
              id="noteDisponibilita"
              name="noteDisponibilita"
              value={disponibilita.noteDisponibilita || ''}
              onChange={handleDisponibilitaChange}
              rows={4}
              className={styles.textareaInput}
              placeholder="Es. Disponibile per urgenze, flessibilità oraria su richiesta, ecc."
            />
          </div>
        </fieldset>
        
        {feedbackSalvataggio && 
            <Paragrafo className={`${styles.feedback} ${feedbackSalvataggio.startsWith('Errore') ? styles.feedbackErrore : styles.feedbackPositivo}`}>
                {feedbackSalvataggio}
            </Paragrafo>
        }


        <div className={styles.azioniForm}>
          <Bottone type="submit" variante="primario">Salva Disponibilità e Contatti</Bottone>
        </div>
      </form>
    </div>
  );
};

export default GestioneDisponibilitaContatti;
