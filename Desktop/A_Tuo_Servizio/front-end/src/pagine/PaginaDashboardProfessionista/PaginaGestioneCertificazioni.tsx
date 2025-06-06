import React, { useState, useEffect } from 'react';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import styles from './PaginaGestioneCertificazioni.module.css'; // Verrà creato nel prossimo passo

export interface CertificazioneDati {
  id: string;
  nomeCertificazione: string;
  enteRilasciante: string;
  annoConseguimento?: number | string;
  linkVerifica?: string;
  fileCertificato?: File | null;
  nomeFileCertificato?: string;
  urlFileEsistente?: string; 
}

const PaginaGestioneCertificazioni: React.FC = () => {
  const [certificazioni, setCertificazioni] = useState<CertificazioneDati[]>([]);
  const [mostraFormCertificazione, setMostraFormCertificazione] = useState(false);
  const [certificazioneInModifica, setCertificazioneInModifica] = useState<CertificazioneDati | null>(null);

  // Stati per i campi del form
  const [nomeCert, setNomeCert] = useState('');
  const [enteRil, setEnteRil] = useState('');
  const [annoCons, setAnnoCons] = useState<number | string>('');
  const [linkVer, setLinkVer] = useState('');
  const [fileCert, setFileCert] = useState<File | null>(null);
  const [nomeFileCert, setNomeFileCert] = useState('');
  const [erroreForm, setErroreForm] = useState<string | null>(null);

  // Dati mock iniziali
  useEffect(() => {
    setCertificazioni([
      { 
        id: 'cert1', 
        nomeCertificazione: 'Certificazione Gas Livello Avanzato', 
        enteRilasciante: 'Istituto Nazionale Gas Tecnici', 
        annoConseguimento: 2022,
        linkVerifica: 'https://esempio.com/verifica/cert123',
        urlFileEsistente: '/placeholder-certificato.pdf' // Simula un file già caricato
      },
      { 
        id: 'cert2', 
        nomeCertificazione: 'Abilitazione Impianti Elettrici DM37/08', 
        enteRilasciante: 'Camera di Commercio Milano', 
        annoConseguimento: '2020',
        nomeFileCertificato: 'abilitazione_dm37.pdf' // Simula un file caricato senza URL diretto
      },
    ]);
  }, []);

  const handleFileChangeCertificato = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileCert(e.target.files[0]);
      setNomeFileCert(e.target.files[0].name);
    } else {
      setFileCert(null);
      setNomeFileCert('');
    }
  };

  const resetForm = () => {
    setNomeCert('');
    setEnteRil('');
    setAnnoCons('');
    setLinkVer('');
    setFileCert(null);
    setNomeFileCert('');
    setCertificazioneInModifica(null);
    setErroreForm(null);
  };

  const handleOpenForm = (cert?: CertificazioneDati) => {
    setErroreForm(null);
    if (cert) {
      setCertificazioneInModifica(cert);
      setNomeCert(cert.nomeCertificazione);
      setEnteRil(cert.enteRilasciante);
      setAnnoCons(cert.annoConseguimento || '');
      setLinkVer(cert.linkVerifica || '');
      // Per il file, la gestione è più complessa: non possiamo pre-popolare un input file.
      // Mostreremo il nome del file esistente o l'URL.
      setFileCert(null); // Resetta sempre il file input
      setNomeFileCert(cert.nomeFileCertificato || (cert.urlFileEsistente ? 'File esistente' : ''));
    } else {
      resetForm();
    }
    setMostraFormCertificazione(true);
  };
  
  const handleCloseForm = () => {
    setMostraFormCertificazione(false);
    resetForm();
  };

  const handleSubmitCertificazione = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroreForm(null);

    if (!nomeCert || !enteRil) {
      setErroreForm('Nome certificazione ed ente rilasciante sono obbligatori.');
      return;
    }
    if (annoCons && isNaN(Number(annoCons))) {
      setErroreForm('L\'anno di conseguimento deve essere un numero valido.');
      return;
    }


    const datiCertificazioneCorrente: CertificazioneDati = {
      id: certificazioneInModifica ? certificazioneInModifica.id : Date.now().toString(),
      nomeCertificazione: nomeCert,
      enteRilasciante: enteRil,
      annoConseguimento: annoCons ? Number(annoCons) : undefined,
      linkVerifica: linkVer || undefined,
      fileCertificato: fileCert, // Manteniamo il File object
      nomeFileCertificato: fileCert ? nomeFileCert : certificazioneInModifica?.nomeFileCertificato,
      urlFileEsistente: !fileCert ? certificazioneInModifica?.urlFileEsistente : (fileCert ? URL.createObjectURL(fileCert) : undefined), // Simula URL se nuovo file
    };

    if (certificazioneInModifica) {
      setCertificazioni(certificazioni.map(c => c.id === datiCertificazioneCorrente.id ? datiCertificazioneCorrente : c));
      console.log('Certificazione aggiornata:', datiCertificazioneCorrente);
    } else {
      setCertificazioni([...certificazioni, datiCertificazioneCorrente]);
      console.log('Nuova certificazione aggiunta:', datiCertificazioneCorrente);
    }
    handleCloseForm();
  };

  const handleEliminaCertificazione = (idCert: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa certificazione?')) {
      setCertificazioni(certificazioni.filter(c => c.id !== idCert));
      console.log('Certificazione eliminata:', idCert);
    }
  };

  return (
    <div className={styles.contenitoreGestione}>
      <div className={styles.headerSezione}>
        <Titolo livello={2}>Gestisci Certificazioni e Qualifiche</Titolo>
        <Bottone onClick={() => handleOpenForm()}>Aggiungi Nuova Certificazione</Bottone>
      </div>

      {mostraFormCertificazione && (
        <div className={styles.formContenitore}> {/* Riutilizzo stile se definito e appropriato */}
          <Titolo livello={3} className={styles.titoloForm}>
            {certificazioneInModifica ? 'Modifica Certificazione' : 'Aggiungi Nuova Certificazione'}
          </Titolo>
          <form onSubmit={handleSubmitCertificazione} className={styles.formServizio}> {/* Riutilizzo stile se definito e appropriato */}
            {erroreForm && <Paragrafo className={styles.messaggioErroreForm}>{erroreForm}</Paragrafo>}
            <CampoTesto
              etichetta="Nome Certificazione/Qualifica"
              name="nomeCert"
              value={nomeCert}
              onChange={(e) => setNomeCert(e.target.value)}
              required
            />
            <CampoTesto
              etichetta="Ente Rilasciante"
              name="enteRil"
              value={enteRil}
              onChange={(e) => setEnteRil(e.target.value)}
              required
            />
            <CampoTesto
              etichetta="Anno Conseguimento (Opzionale)"
              type="number"
              name="annoCons"
              value={annoCons.toString()}
              onChange={(e) => setAnnoCons(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Es. 2023"
            />
            <CampoTesto
              etichetta="Link di Verifica (Opzionale)"
              type="url"
              name="linkVer"
              value={linkVer}
              onChange={(e) => setLinkVer(e.target.value)}
              placeholder="https://..."
            />
            <CampoTesto
              etichetta="Carica Certificato (PDF/Immagine, Opzionale)"
              type="file"
              name="fileCert"
              accept=".pdf,image/*"
              onChange={handleFileChangeCertificato}
            />
            {nomeFileCert && <Paragrafo className={styles.infoFile}>Selezionato: {nomeFileCert}</Paragrafo>}
            {!fileCert && certificazioneInModifica?.urlFileEsistente && (
              <Paragrafo className={styles.infoFile}>
                File esistente: <a href={certificazioneInModifica.urlFileEsistente} target="_blank" rel="noopener noreferrer">Visualizza</a>
              </Paragrafo>
            )}
             {!fileCert && certificazioneInModifica?.nomeFileCertificato && !certificazioneInModifica.urlFileEsistente && (
              <Paragrafo className={styles.infoFile}>File caricato: {certificazioneInModifica.nomeFileCertificato}</Paragrafo>
            )}


            <div className={styles.bottoniForm}> {/* Riutilizzo stile se definito e appropriato */}
              <Bottone type="submit" variante="primario">
                {certificazioneInModifica ? 'Salva Modifiche' : 'Aggiungi Certificazione'}
              </Bottone>
              <Bottone type="button" variante="secondario" onClick={handleCloseForm}>
                Annulla
              </Bottone>
            </div>
          </form>
        </div>
      )}

      <div className={styles.elencoItems}> {/* Riutilizzo stile se definito e appropriato */}
        {certificazioni.length === 0 && !mostraFormCertificazione ? (
          <Paragrafo className={styles.messaggioNessunItem}>
            Nessuna certificazione o qualifica ancora aggiunta.
          </Paragrafo>
        ) : (
          certificazioni.map((cert) => (
            <div key={cert.id} className={styles.cardItem}> {/* Riutilizzo stile se definito e appropriato */}
              <div className={styles.infoItem}> {/* Riutilizzo stile se definito e appropriato */}
                <h5 className={styles.nomeItemCard}>{cert.nomeCertificazione}</h5>
                <Paragrafo className={styles.dettaglioItemCard}>Ente: {cert.enteRilasciante}</Paragrafo>
                {cert.annoConseguimento && <Paragrafo className={styles.dettaglioItemCard}>Anno: {cert.annoConseguimento}</Paragrafo>}
                {cert.linkVerifica && (
                  <Paragrafo className={styles.dettaglioItemCard}>
                    Verifica: <a href={cert.linkVerifica} target="_blank" rel="noopener noreferrer">Link</a>
                  </Paragrafo>
                )}
                {cert.nomeFileCertificato && (
                  <Paragrafo className={styles.dettaglioItemCard}>
                    File: {cert.nomeFileCertificato} 
                    {cert.urlFileEsistente && !cert.fileCertificato && <small> (<a href={cert.urlFileEsistente} target="_blank" rel="noopener noreferrer">Visualizza esistente</a>)</small>}
                    {cert.fileCertificato && <small> (Nuovo file pronto per l'upload)</small>}
                  </Paragrafo>
                )}
              </div>
              <div className={styles.azioniCardItem}> {/* Riutilizzo stile se definito e appropriato */}
                <Bottone variante="secondario" onClick={() => handleOpenForm(cert)}>Modifica</Bottone>
                <Bottone variante="distruttivo" onClick={() => handleEliminaCertificazione(cert.id)}>Elimina</Bottone>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaginaGestioneCertificazioni;
