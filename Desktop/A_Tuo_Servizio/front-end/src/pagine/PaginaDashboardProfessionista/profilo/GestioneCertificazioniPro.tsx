import React, { useState } from 'react';
import styles from './GestioneCertificazioniPro.module.css';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';

interface Certificazione {
  id: string;
  nome: string;
  enteRilascio: string;
  dataRilascio: string; // YYYY-MM-DD
  dataScadenza?: string; // YYYY-MM-DD, opzionale
  numeroIscrizioneAlbo?: string; // Opzionale
  nomeFileAllegato?: string; // Nome del file caricato (mock)
  fileAllegato?: File; // Per il nuovo upload
  urlAllegatoPreview?: string; // Per l'anteprima o file esistente
}

const mockCertificazioniIniziali: Certificazione[] = [
  { id: 'cert1', nome: 'Certificazione Idraulico Avanzato', enteRilascio: 'Istituto Nazionale Idraulici', dataRilascio: '2020-03-10', dataScadenza: '2025-03-09', nomeFileAllegato: 'cert_idraulico.pdf' },
  { id: 'cert2', nome: 'Patentino Frigoristi (F-Gas)', enteRilascio: 'Ministero Ambiente', dataRilascio: '2019-07-22', numeroIscrizioneAlbo: 'ABC12345', nomeFileAllegato: 'f-gas.pdf' },
  { id: 'cert3', nome: 'Corso Sicurezza Lavoro Art. 37', enteRilascio: 'Ente Formazione XYZ', dataRilascio: '2023-01-15', nomeFileAllegato: 'sicurezza_art37.pdf' },
];

const FormCertificazione: React.FC<{
  certificazioneEsistente?: Certificazione;
  onSave: (cert: Certificazione) => void;
  onCancel: () => void;
}> = ({ certificazioneEsistente, onSave, onCancel }) => {
  const [nome, setNome] = useState(certificazioneEsistente?.nome || '');
  const [enteRilascio, setEnteRilascio] = useState(certificazioneEsistente?.enteRilascio || '');
  const [dataRilascio, setDataRilascio] = useState(certificazioneEsistente?.dataRilascio || '');
  const [dataScadenza, setDataScadenza] = useState(certificazioneEsistente?.dataScadenza || '');
  const [numeroIscrizioneAlbo, setNumeroIscrizioneAlbo] = useState(certificazioneEsistente?.numeroIscrizioneAlbo || '');
  const [fileAllegato, setFileAllegato] = useState<File | undefined>(undefined);
  const [nomeFileEsistente, setNomeFileEsistente] = useState(certificazioneEsistente?.nomeFileAllegato || '');
  const [errore, setErrore] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileAllegato(event.target.files[0]);
      setNomeFileEsistente(''); // Rimuove il nome del file esistente se se ne carica uno nuovo
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');
    if (!nome || !enteRilascio || !dataRilascio) {
      setErrore('Nome certificazione, ente di rilascio e data di rilascio sono obbligatori.');
      return;
    }
    onSave({
      id: certificazioneEsistente?.id || `cert-${Date.now()}`,
      nome,
      enteRilascio,
      dataRilascio,
      dataScadenza,
      numeroIscrizioneAlbo,
      fileAllegato: fileAllegato, // Passa il File object
      nomeFileAllegato: fileAllegato ? fileAllegato.name : nomeFileEsistente,
      // urlAllegatoPreview non gestito in questo mock save, si presume venga generato al save reale
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCertificazione}>
      <Titolo livello={4} className={styles.titoloForm}>{certificazioneEsistente ? 'Modifica Certificazione' : 'Aggiungi Nuova Certificazione/Qualifica'}</Titolo>
      {errore && <Paragrafo className={styles.messaggioErrore}>{errore}</Paragrafo>}
      <CampoTesto etichetta="Nome Certificazione/Qualifica" value={nome} onChange={e => setNome(e.target.value)} required />
      <CampoTesto etichetta="Ente di Rilascio" value={enteRilascio} onChange={e => setEnteRilascio(e.target.value)} required />
      <div className={styles.dateRow}>
        <CampoTesto etichetta="Data Rilascio" type="date" value={dataRilascio} onChange={e => setDataRilascio(e.target.value)} required />
        <CampoTesto etichetta="Data Scadenza (Opzionale)" type="date" value={dataScadenza} onChange={e => setDataScadenza(e.target.value)} />
      </div>
      <CampoTesto etichetta="Numero Iscrizione Albo (Opzionale)" value={numeroIscrizioneAlbo} onChange={e => setNumeroIscrizioneAlbo(e.target.value)} />
      <div>
        <label htmlFor="fileAllegatoCert" className={styles.labelForm}>Allega Documento (Opzionale)</label>
        <input type="file" id="fileAllegatoCert" onChange={handleFileChange} className={styles.inputFile} />
        {(fileAllegato || nomeFileEsistente) && (
          <Paragrafo className={styles.infoFile}>
            File attuale: {fileAllegato ? fileAllegato.name : nomeFileEsistente}
          </Paragrafo>
        )}
      </div>
      <div className={styles.azioniFormCertificazione}>
        <Bottone type="submit" variante="primario">{certificazioneEsistente ? 'Salva Modifiche' : 'Aggiungi Certificazione'}</Bottone>
        <Bottone type="button" onClick={onCancel} variante="secondario">Annulla</Bottone>
      </div>
    </form>
  );
};


const GestioneCertificazioniPro: React.FC = () => {
  const [certificazioni, setCertificazioni] = useState<Certificazione[]>(mockCertificazioniIniziali);
  const [showForm, setShowForm] = useState(false);
  const [certInModifica, setCertInModifica] = useState<Certificazione | undefined>(undefined);

  const handleAggiungiClick = () => {
    setCertInModifica(undefined);
    setShowForm(true);
  };

  const handleModificaClick = (cert: Certificazione) => {
    setCertInModifica(cert);
    setShowForm(true);
  };

  const handleEliminaClick = (idCert: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa certificazione?')) {
      setCertificazioni(prev => prev.filter(c => c.id !== idCert));
      console.log(`Certificazione ${idCert} eliminata (simulazione)`);
    }
  };

  const handleSaveCertificazione = (cert: Certificazione) => {
    setCertificazioni(prev => {
      const index = prev.findIndex(c => c.id === cert.id);
      // Sovrascrive il fileAllegato con il nome per la visualizzazione, il File object non serve più qui
      const certToSave = { ...cert, nomeFileAllegato: cert.fileAllegato ? cert.fileAllegato.name : cert.nomeFileAllegato };
      delete certToSave.fileAllegato; // Rimuove l'oggetto File dopo aver ottenuto il nome


      if (index > -1) { // Modifica
        const updated = [...prev];
        updated[index] = certToSave;
        return updated;
      } else { // Aggiunta
        return [...prev, certToSave];
      }
    });
    console.log('Certificazione salvata (simulazione):', cert);
    setShowForm(false);
    setCertInModifica(undefined);
  };

  return (
    <div className={styles.containerCertificazioni}>
      <div className={styles.headerSezione}>
        <Titolo livello={3} className={styles.titoloSezione}>Gestisci le Tue Certificazioni e Qualifiche</Titolo>
        {!showForm && (
          <Bottone onClick={handleAggiungiClick} variante="primario">Aggiungi Certificazione</Bottone>
        )}
      </div>

      {showForm ? (
        <FormCertificazione
          certificazioneEsistente={certInModifica}
          onSave={handleSaveCertificazione}
          onCancel={() => { setShowForm(false); setCertInModifica(undefined); }}
        />
      ) : (
        <div className={styles.listaCertificazioni}>
          {certificazioni.length === 0 && <Paragrafo>Nessuna certificazione o qualifica inserita.</Paragrafo>}
          {certificazioni.map(cert => (
            <div key={cert.id} className={styles.cardCertificazione}>
              <Titolo livello={5} className={styles.nomeCertificazioneCard}>{cert.nome}</Titolo>
              <Paragrafo className={styles.infoCertificazione}><strong>Ente:</strong> {cert.enteRilascio}</Paragrafo>
              <Paragrafo className={styles.infoCertificazione}><strong>Rilasciata il:</strong> {new Date(cert.dataRilascio).toLocaleDateString()}</Paragrafo>
              {cert.dataScadenza && <Paragrafo className={styles.infoCertificazione}><strong>Scade il:</strong> {new Date(cert.dataScadenza).toLocaleDateString()}</Paragrafo>}
              {cert.numeroIscrizioneAlbo && <Paragrafo className={styles.infoCertificazione}><strong>N. Iscrizione Albo:</strong> {cert.numeroIscrizioneAlbo}</Paragrafo>}
              {cert.nomeFileAllegato && <Paragrafo className={styles.infoCertificazione}><strong>Allegato:</strong> <a href={cert.urlAllegatoPreview || '#'} target="_blank" rel="noopener noreferrer">{cert.nomeFileAllegato}</a></Paragrafo>}
              <div className={styles.azioniCardCertificazione}>
                <Bottone onClick={() => handleModificaClick(cert)} piccola variante="secondario">Modifica</Bottone>
                <Bottone onClick={() => handleEliminaClick(cert.id)} piccola variante="pericolo" outline>Elimina</Bottone>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestioneCertificazioniPro;
