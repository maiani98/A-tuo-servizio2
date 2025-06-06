import React, { useState } from 'react';
import styles from './ImpostazioniAccountPro.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';

// Mock Data Interfaces
interface DatiAnagraficiFiscali {
  ragioneSociale?: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  codiceFiscale: string;
  partitaIva?: string;
  indirizzoFatturazione: string;
  cittaFatturazione: string;
  capFatturazione: string;
  provinciaFatturazione: string;
  pec?: string;
  codiceDestinatarioSdi?: string;
}

interface ImpostazioniNotifiche {
  nuovaRichiestaPreventivoEmail: boolean;
  nuovaRichiestaPreventivoPush: boolean;
  nuovoMessaggioEmail: boolean;
  nuovoMessaggioPush: boolean;
  promemoriaAppuntamentoEmail: boolean;
  promemoriaAppuntamentoPush: boolean;
  newsletterOfferte: boolean;
}

// Mock Initial Data
const mockDatiAnagrafici: DatiAnagraficiFiscali = {
  ragioneSociale: 'Mario Rossi Impianti Idraulici',
  nomeTitolare: 'Mario',
  cognomeTitolare: 'Rossi',
  codiceFiscale: 'RSSMRA80A01H501X',
  partitaIva: '01234567890',
  indirizzoFatturazione: 'Via Garibaldi 10',
  cittaFatturazione: 'Milano',
  capFatturazione: '20121',
  provinciaFatturazione: 'MI',
  pec: 'mario.rossi.idraulico@pec.it',
  codiceDestinatarioSdi: 'SUBM70N',
};

const mockImpostazioniNotifiche: ImpostazioniNotifiche = {
  nuovaRichiestaPreventivoEmail: true,
  nuovaRichiestaPreventivoPush: true,
  nuovoMessaggioEmail: true,
  nuovoMessaggioPush: false,
  promemoriaAppuntamentoEmail: true,
  promemoriaAppuntamentoPush: true,
  newsletterOfferte: false,
};

type ActiveTab = 'anagrafica' | 'notifiche' | 'abbonamento' | 'password' | 'privacy';

const ImpostazioniAccountPro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('anagrafica');
  
  const [datiAnagrafici, setDatiAnagrafici] = useState<DatiAnagraficiFiscali>(mockDatiAnagrafici);
  const [impostazioniNotifiche, setImpostazioniNotifiche] = useState<ImpostazioniNotifiche>(mockImpostazioniNotifiche);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showModalEliminaAccount, setShowModalEliminaAccount] = useState(false);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({}); // Per messaggi di salvataggio/errore

  const handleAnagraficiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatiAnagrafici(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNotificheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImpostazioniNotifiche(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const showFeedback = (tab: ActiveTab, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(prev => ({ ...prev, [tab]: message, [`${tab}Type`]: type }));
    setTimeout(() => setFeedback(prev => ({ ...prev, [tab]: '', [`${tab}Type`]: '' })), 4000);
  };

  const handleSalvaAnagrafica = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvataggio Dati Anagrafici/Fiscali:', datiAnagrafici);
    showFeedback('anagrafica', 'Dati anagrafici salvati con successo (simulazione).');
  };

  const handleSalvaNotifiche = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvataggio Impostazioni Notifiche:', impostazioniNotifiche);
    showFeedback('notifiche', 'Impostazioni notifiche salvate (simulazione).');
  };

  const handleModificaPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showFeedback('password', 'Le nuove password non coincidono.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showFeedback('password', 'La nuova password deve essere di almeno 8 caratteri.', 'error');
      return;
    }
    console.log('Modifica Password:', { oldPassword, newPassword });
    showFeedback('password', 'Password modificata con successo (simulazione).');
    setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
  };

  const handleEliminaAccount = () => {
    console.log('Eliminazione account confermata (simulazione).');
    setShowModalEliminaAccount(false);
    alert('Account eliminato (simulazione). Verrai reindirizzato alla homepage.');
    // In un'app reale: logout e redirect
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'anagrafica':
        return (
          <form onSubmit={handleSalvaAnagrafica} className={styles.formSezione}>
            <CampoTesto etichetta="Ragione Sociale (se applicabile)" name="ragioneSociale" value={datiAnagrafici.ragioneSociale || ''} onChange={handleAnagraficiChange} />
            <div className={styles.row}>
              <CampoTesto etichetta="Nome Titolare/Referente" name="nomeTitolare" value={datiAnagrafici.nomeTitolare} onChange={handleAnagraficiChange} required className={styles.col} />
              <CampoTesto etichetta="Cognome Titolare/Referente" name="cognomeTitolare" value={datiAnagrafici.cognomeTitolare} onChange={handleAnagraficiChange} required className={styles.col} />
            </div>
            <CampoTesto etichetta="Codice Fiscale" name="codiceFiscale" value={datiAnagrafici.codiceFiscale} onChange={handleAnagraficiChange} required />
            <CampoTesto etichetta="Partita IVA (se applicabile)" name="partitaIva" value={datiAnagrafici.partitaIva || ''} onChange={handleAnagraficiChange} />
            <CampoTesto etichetta="Indirizzo Fatturazione (Via, N civico)" name="indirizzoFatturazione" value={datiAnagrafici.indirizzoFatturazione} onChange={handleAnagraficiChange} required />
            <div className={styles.row}>
              <CampoTesto etichetta="Città Fatt." name="cittaFatturazione" value={datiAnagrafici.cittaFatturazione} onChange={handleAnagraficiChange} required className={styles.col} />
              <CampoTesto etichetta="CAP Fatt." name="capFatturazione" value={datiAnagrafici.capFatturazione} onChange={handleAnagraficiChange} required className={styles.colShort} />
              <CampoTesto etichetta="Prov. Fatt." name="provinciaFatturazione" value={datiAnagrafici.provinciaFatturazione} onChange={handleAnagraficiChange} required className={styles.colShort} />
            </div>
            <CampoTesto etichetta="PEC (Posta Elettronica Certificata)" name="pec" type="email" value={datiAnagrafici.pec || ''} onChange={handleAnagraficiChange} />
            <CampoTesto etichetta="Codice Destinatario SDI (Fatt. Elettronica)" name="codiceDestinatarioSdi" value={datiAnagrafici.codiceDestinatarioSdi || ''} onChange={handleAnagraficiChange} />
            {feedback.anagrafica && <Paragrafo className={`${styles.feedbackMessage} ${feedback.anagraficaType === 'error' ? styles.error : styles.success}`}>{feedback.anagrafica}</Paragrafo>}
            <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Salva Dati Anagrafici</Bottone>
          </form>
        );
      case 'notifiche':
        return (
          <form onSubmit={handleSalvaNotifiche} className={styles.formSezione}>
            <div className={styles.checkboxGroup}>
              <label><input type="checkbox" name="nuovaRichiestaPreventivoEmail" checked={impostazioniNotifiche.nuovaRichiestaPreventivoEmail} onChange={handleNotificheChange} /> Email per nuova richiesta preventivo</label>
              <label><input type="checkbox" name="nuovaRichiestaPreventivoPush" checked={impostazioniNotifiche.nuovaRichiestaPreventivoPush} onChange={handleNotificheChange} /> Notifica Push per nuova richiesta preventivo</label>
            </div>
            <div className={styles.checkboxGroup}>
              <label><input type="checkbox" name="nuovoMessaggioEmail" checked={impostazioniNotifiche.nuovoMessaggioEmail} onChange={handleNotificheChange} /> Email per nuovo messaggio</label>
              <label><input type="checkbox" name="nuovoMessaggioPush" checked={impostazioniNotifiche.nuovoMessaggioPush} onChange={handleNotificheChange} /> Notifica Push per nuovo messaggio</label>
            </div>
             <div className={styles.checkboxGroup}>
              <label><input type="checkbox" name="promemoriaAppuntamentoEmail" checked={impostazioniNotifiche.promemoriaAppuntamentoEmail} onChange={handleNotificheChange} /> Email promemoria appuntamento</label>
              <label><input type="checkbox" name="promemoriaAppuntamentoPush" checked={impostazioniNotifiche.promemoriaAppuntamentoPush} onChange={handleNotificheChange} /> Notifica Push promemoria appuntamento</label>
            </div>
            <div className={styles.checkboxGroup}>
              <label><input type="checkbox" name="newsletterOfferte" checked={impostazioniNotifiche.newsletterOfferte} onChange={handleNotificheChange} /> Newsletter e offerte dalla piattaforma</label>
            </div>
            {feedback.notifiche && <Paragrafo className={`${styles.feedbackMessage} ${feedback.notificheType === 'error' ? styles.error : styles.success}`}>{feedback.notifiche}</Paragrafo>}
            <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Salva Impostazioni Notifiche</Bottone>
          </form>
        );
      case 'abbonamento':
        return (
          <div className={styles.sezioneContenuto}>
            <Titolo livello={4}>Gestione Abbonamento</Titolo>
            <Paragrafo>Tipo Abbonamento: <strong>Premium Pro</strong> (mock)</Paragrafo>
            <Paragrafo>Data Rinnovo: <strong>01/01/2025</strong> (mock)</Paragrafo>
            <Paragrafo>Stato Pagamento: <strong>Attivo</strong> (mock)</Paragrafo>
            <Bottone variante="primario" onClick={() => alert('Navigazione a pagina gestione abbonamento/fatturazione (simulazione).')}>Gestisci Abbonamento e Fatturazione</Bottone>
            <Paragrafo className={styles.notaPiccola}>Sarai reindirizzato al portale del nostro partner di pagamento.</Paragrafo>
          </div>
        );
      case 'password':
        return (
          <form onSubmit={handleModificaPassword} className={styles.formSezione}>
            <CampoTesto etichetta="Vecchia Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            <CampoTesto etichetta="Nuova Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <CampoTesto etichetta="Conferma Nuova Password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
            {feedback.password && <Paragrafo className={`${styles.feedbackMessage} ${feedback.passwordType === 'error' ? styles.error : styles.success}`}>{feedback.password}</Paragrafo>}
            <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Modifica Password</Bottone>
          </form>
        );
      case 'privacy':
        return (
          <div className={styles.sezioneContenuto}>
            <Titolo livello={4}>Privacy e Gestione Dati</Titolo>
            <Paragrafo>Leggi la nostra <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a> e i <a href="/termini-servizio" target="_blank" rel="noopener noreferrer">Termini di Servizio</a>.</Paragrafo>
            <Bottone variante="secondario" onClick={() => alert('Download dati utente (simulazione). Inizierà il download di un file .zip o .json.')} className={styles.bottonePrivacy}>Scarica i tuoi dati</Bottone>
            <hr className={styles.hr}/>
            <Bottone variante="pericolo" onClick={() => setShowModalEliminaAccount(true)} className={styles.bottonePrivacy}>Elimina Account</Bottone>
            <Paragrafo className={styles.notaPiccola}>L'eliminazione dell'account è permanente e non può essere annullata.</Paragrafo>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={styles.containerImpostazioni}>
      <Titolo livello={2} className={styles.titoloPagina}>Impostazioni Account</Titolo>
      <div className={styles.layoutImpostazioni}>
        <nav className={styles.navTabs}>
          {(Object.keys(mockDatiAnagrafici) as Array<keyof typeof mockDatiAnagrafici>).length > 0 && /* Example condition */
            <button onClick={() => setActiveTab('anagrafica')} className={activeTab === 'anagrafica' ? styles.active : ''}>Dati Anagrafici/Fiscali</button>}
          <button onClick={() => setActiveTab('notifiche')} className={activeTab === 'notifiche' ? styles.active : ''}>Impostazioni Notifiche</button>
          <button onClick={() => setActiveTab('abbonamento')} className={activeTab === 'abbonamento' ? styles.active : ''}>Gestione Abbonamento</button>
          <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? styles.active : ''}>Modifica Password</button>
          <button onClick={() => setActiveTab('privacy')} className={activeTab === 'privacy' ? styles.active : ''}>Privacy e Dati</button>
        </nav>
        <div className={styles.contenutoTab}>
          {renderActiveTabContent()}
        </div>
      </div>

      {showModalEliminaAccount && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConferma}>
            <Titolo livello={3}>Conferma Eliminazione Account</Titolo>
            <Paragrafo>Sei assolutamente sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno persi.</Paragrafo>
            <div className={styles.azioniModal}>
              <Bottone variante="pericolo" onClick={handleEliminaAccount}>Sì, Elimina il Mio Account</Bottone>
              <Bottone variante="secondario" onClick={() => setShowModalEliminaAccount(false)}>Annulla</Bottone>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpostazioniAccountPro;
