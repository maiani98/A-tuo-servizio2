import React, { useState, useEffect } from 'react';
import styles from './GestioneInfoBaseDescrizione.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface InfoBaseData {
  nomeAttivita: string;
  tipoAttivita: string; // Es. Libero Professionista, Ditta Individuale, SRL
  pIvaCf: string;
  anniEsperienza: number | '';
  mottoTagline: string;
  descrizioneDettagliata: string;
}

// Mock existing data (simulating data fetched from backend)
const mockDatiEsistenti: InfoBaseData = {
  nomeAttivita: 'Mario Rossi - Idraulico Esperto',
  tipoAttivita: 'Ditta Individuale',
  pIvaCf: 'RSSMRA80A01H501X',
  anniEsperienza: 15,
  mottoTagline: 'Soluzioni idrauliche rapide e affidabili!',
  descrizioneDettagliata: 'Sono un idraulico con oltre 15 anni di esperienza specializzato in riparazioni urgenti, installazione di impianti termoidraulici e manutenzione. Offro un servizio professionale e tempestivo per privati e aziende.\n\nUtilizzo solo materiali di alta qualità e garantisco tutti i miei interventi. Contattami per un preventivo gratuito!',
};

const GestioneInfoBaseDescrizione: React.FC = () => {
  const [formData, setFormData] = useState<InfoBaseData>(mockDatiEsistenti);
  const [fileImmagineProfilo, setFileImmagineProfilo] = useState<File | null>(null);
  const [previewImmagineProfilo, setPreviewImmagineProfilo] = useState<string | null>('https://via.placeholder.com/150/007bff/FFFFFF?text=Logo/Foto');
  const [fileImmagineCopertina, setFileImmagineCopertina] = useState<File | null>(null);
  const [previewImmagineCopertina, setPreviewImmagineCopertina] = useState<string | null>('https://via.placeholder.com/800x200/6c757d/FFFFFF?text=Copertina');
  const [feedbackSalvataggio, setFeedbackSalvataggio] = useState<string>('');

  useEffect(() => {
    // In un'app reale, qui si farebbe una chiamata API per caricare i dati del professionista
    setFormData(mockDatiEsistenti);
    // Simula URL esistenti per le immagini
    // setPreviewImmagineProfilo(mockDatiEsistenti.urlImmagineProfilo || 'https://via.placeholder.com/150/007bff/FFFFFF?text=Logo/Foto');
    // setPreviewImmagineCopertina(mockDatiEsistenti.urlImmagineCopertina || 'https://via.placeholder.com/800x200/6c757d/FFFFFF?text=Copertina');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'anniEsperienza' ? (value === '' ? '' : parseInt(value, 10)) : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'profilo' | 'copertina') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (tipo === 'profilo') {
          setFileImmagineProfilo(file);
          setPreviewImmagineProfilo(reader.result as string);
        } else {
          setFileImmagineCopertina(file);
          setPreviewImmagineCopertina(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackSalvataggio('');
    // Simulazione salvataggio dati
    console.log('Dati da salvare:', {
      ...formData,
      immagineProfilo: fileImmagineProfilo ? fileImmagineProfilo.name : 'Nessuna nuova immagine',
      immagineCopertina: fileImmagineCopertina ? fileImmagineCopertina.name : 'Nessuna nuova immagine',
    });
    // Qui ci sarebbe la chiamata API
    // Esempio di feedback:
    setFeedbackSalvataggio('Modifiche salvate con successo! (Simulazione)');
    setTimeout(() => setFeedbackSalvataggio(''), 3000);
  };

  return (
    <div className={styles.containerForm}>
      <Titolo livello={3} className={styles.titoloSezione}>Informazioni Base e Descrizione</Titolo>
      <Paragrafo className={styles.sottotitoloSezione}>
        Aggiorna i dettagli principali della tua attività e come ti presenti ai clienti.
      </Paragrafo>

      <form onSubmit={handleSubmit} className={styles.formModifica}>
        <CampoTesto
          etichetta="Nome Attività/Professionista"
          name="nomeAttivita"
          value={formData.nomeAttivita}
          onChange={handleChange}
          required
        />
        
        <div className={styles.row}>
            <div className={styles.col}>
                <label htmlFor="tipoAttivita" className={styles.label}>Tipo Attività</label>
                <select name="tipoAttivita" id="tipoAttivita" value={formData.tipoAttivita} onChange={handleChange} className={styles.selectInput} required>
                    <option value="">Seleziona tipo attività...</option>
                    <option value="Libero Professionista">Libero Professionista</option>
                    <option value="Ditta Individuale">Ditta Individuale</option>
                    <option value="SRL">SRL</option>
                    <option value="SAS">SAS</option>
                    <option value="Altro">Altro</option>
                </select>
            </div>
            <div className={styles.col}>
                 <CampoTesto
                    etichetta="P.IVA / Codice Fiscale"
                    name="pIvaCf"
                    value={formData.pIvaCf}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>


        <CampoTesto
          etichetta="Anni di Esperienza"
          type="number"
          name="anniEsperienza"
          value={formData.anniEsperienza.toString()}
          onChange={handleChange}
          min="0"
        />

        <div className={styles.uploadImmagineContainer}>
          <label className={styles.label}>Immagine Profilo/Logo</label>
          {previewImmagineProfilo && <img src={previewImmagineProfilo} alt="Anteprima Profilo" className={styles.immaginePreview} />}
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilo')} className={styles.inputFile} />
          <Paragrafo className={styles.suggerimentoUpload}>Consigliato: .jpg o .png, max 2MB, preferibilmente quadrata.</Paragrafo>
        </div>
        
        <div className={styles.uploadImmagineContainer}>
          <label className={styles.label}>Immagine di Copertina</label>
          {previewImmagineCopertina && <img src={previewImmagineCopertina} alt="Anteprima Copertina" className={styles.immaginePreviewCopertina} />}
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'copertina')} className={styles.inputFile} />
          <Paragrafo className={styles.suggerimentoUpload}>Consigliato: .jpg o .png, max 5MB, formato 16:9 (es. 1200x675px).</Paragrafo>
        </div>

        <CampoTesto
          etichetta="Motto / Tagline (max 100 caratteri)"
          name="mottoTagline"
          value={formData.mottoTagline}
          onChange={handleChange}
          maxLength={100}
        />

        <div>
          <label htmlFor="descrizioneDettagliata" className={styles.label}>Descrizione Dettagliata</label>
          <textarea
            id="descrizioneDettagliata"
            name="descrizioneDettagliata"
            value={formData.descrizioneDettagliata}
            onChange={handleChange}
            rows={8}
            className={styles.textareaInput}
            placeholder="Descrivi la tua attività, la tua esperienza, i tuoi punti di forza..."
          />
        </div>
        
        {feedbackSalvataggio && <Paragrafo className={styles.feedbackPositivo}>{feedbackSalvataggio}</Paragrafo>}

        <div className={styles.azioniForm}>
          <Bottone type="submit" variante="primario">Salva Modifiche</Bottone>
        </div>
      </form>
    </div>
  );
};

export default GestioneInfoBaseDescrizione;
