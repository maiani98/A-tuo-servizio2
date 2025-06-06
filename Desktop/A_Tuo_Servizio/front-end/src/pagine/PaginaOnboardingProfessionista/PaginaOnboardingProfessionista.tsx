import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaginaOnboardingProfessionista.module.css'; // Verrà creato nel prossimo passo
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';

interface DatiProfiloBaseProfessionista {
  nomeCompletoORagioneSociale: string;
  numeroTelefono: string;
  localitaPrincipale: string;
  descrizioneAttivita: string;
  fileFotoProfilo: File | null;
}

const PaginaOnboardingProfessionista: React.FC = () => {
  const navigate = useNavigate();

  const [nomeCompletoORagioneSociale, setNomeCompletoORagioneSociale] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [localitaPrincipale, setLocalitaPrincipale] = useState('');
  const [descrizioneAttivita, setDescrizioneAttivita] = useState('');
  const [fileFotoProfilo, setFileFotoProfilo] = useState<File | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileFotoProfilo(event.target.files[0]);
      console.log('File selezionato:', event.target.files[0].name);
    } else {
      setFileFotoProfilo(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrore(null);

    if (!nomeCompletoORagioneSociale || !numeroTelefono || !localitaPrincipale || !descrizioneAttivita) {
      setErrore('Tutti i campi testuali sono obbligatori.');
      return;
    }
    // Validazione aggiuntiva (es. formato numero telefono) potrebbe essere aggiunta qui

    const datiForm: DatiProfiloBaseProfessionista = {
      nomeCompletoORagioneSociale,
      numeroTelefono,
      localitaPrincipale,
      descrizioneAttivita,
      fileFotoProfilo,
    };

    console.log('Dati onboarding professionista:', datiForm);

    // Simula salvataggio e navigazione
    // In un'app reale, qui ci sarebbe una chiamata API
    alert('Dati salvati (simulazione). Verrai reindirizzato al prossimo step.');
    navigate('/onboarding-professionista/portfolio'); // Placeholder per il prossimo step
  };

  return (
    <Contenitore className={styles.paginaContenitore}>
      <Titolo livello={1} className={styles.titoloPagina}>Diventa un Professionista</Titolo>
      <Paragrafo className={styles.sottotitoloPagina}>
        Completa le informazioni base del tuo profilo per iniziare a offrire i tuoi servizi.
      </Paragrafo>
      
      {errore && <Paragrafo className={styles.messaggioErroreForm}>{errore}</Paragrafo>}

      <form onSubmit={handleSubmit} className={styles.formOnboarding}>
        <CampoTesto
          etichetta="Nome completo / Ragione Sociale"
          type="text"
          name="nomeCompletoORagioneSociale"
          value={nomeCompletoORagioneSociale}
          onChange={(e) => setNomeCompletoORagioneSociale(e.target.value)}
          required
          placeholder="Es. Mario Rossi S.R.L."
        />
        <CampoTesto
          etichetta="Numero di Telefono"
          type="tel"
          name="numeroTelefono"
          value={numeroTelefono}
          onChange={(e) => setNumeroTelefono(e.target.value)}
          required
          placeholder="Es. 3331234567"
        />
        <CampoTesto
          etichetta="Località Principale di Operatività"
          type="text"
          name="localitaPrincipale"
          value={localitaPrincipale}
          onChange={(e) => setLocalitaPrincipale(e.target.value)}
          required
          placeholder="Es. Milano, Roma (specifica anche zona se utile)"
        />
        {/* Per il CampoTesto come textarea, assumiamo che CampoTesto possa gestire una prop 'as="textarea"' 
            o che si debba usare un <textarea> standard. Se CampoTesto non lo supporta, 
            si dovrebbe usare un <textarea> e stilizzarlo.
            Per ora, assumiamo che CampoTesto non supporti 'as="textarea"' e usiamo <textarea>.
        */}
        <div className={styles.contenitoreCampo}> {/* Wrapper per coerenza, se CampoTesto lo usa */}
            <label htmlFor="descrizioneAttivita" className={styles.etichettaTextarea}>Breve descrizione della tua attività</label>
            <textarea
                id="descrizioneAttivita"
                name="descrizioneAttivita"
                value={descrizioneAttivita}
                onChange={(e) => setDescrizioneAttivita(e.target.value)}
                required
                placeholder="Descrivi brevemente i servizi che offri, la tua esperienza, ecc. (max 500 caratteri)"
                rows={5}
                maxLength={500}
                className={styles.textareaInput}
            />
        </div>

        <CampoTesto
          etichetta="Foto Profilo (Opzionale)"
          type="file"
          name="fileFotoProfilo"
          accept="image/*"
          onChange={handleFileChange} 
          // Nota: il value non è controllato per input type="file" in React
        />
        {fileFotoProfilo && <Paragrafo className={styles.infoFileSelezionato}>File selezionato: {fileFotoProfilo.name}</Paragrafo>}

        <Bottone type="submit" variante="primario" className={styles.bottoneSubmit}>
          Salva e Continua
        </Bottone>
      </form>
    </Contenitore>
  );
};

export default PaginaOnboardingProfessionista;
