import React, { useState, useEffect } from 'react';
import styles from './DashboardClienteImpostazioni.module.css';
import Titolo from '../../componenti/comuni/Titolo/Titolo';
import Paragrafo from '../../componenti/comuni/Paragrafo/Paragrafo';
import Bottone from '../../componenti/comuni/Bottone/Bottone';
import CampoTesto from '../../componenti/comuni/CampiInput/CampiInput';
// import CampoCheckbox from '../../componenti/comuni/CampiInput/CampoCheckbox'; // Se disponibile

// Interfacce Dati
interface DatiPersonaliCliente {
  nome: string;
  cognome: string;
  email: string; // Generalmente non modificabile o con verifica
  telefono?: string;
  indirizzoFatturazione?: string; // Esempio di campo aggiuntivo
  codiceFiscale?: string;
}

interface PreferenzeNotificheCliente {
  nuoviMessaggi: boolean;
  aggiornamentiPreventivi: boolean;
  confermeAppuntamenti: boolean;
  promozioniEsclusive: boolean; // Modificato da "newsletter" per coerenza con design
  aggiornamentiServizio: boolean;
}

// Mock Dati Iniziali (in un'app reale, verrebbero da API/store)
const datiPersonaliIniziali: DatiPersonaliCliente = {
  nome: 'Maria',
  cognome: 'Cliente',
  email: 'maria.cliente@example.com',
  telefono: '3331122334',
  indirizzoFatturazione: 'Via Roma 10, 00100 Roma (RM)',
  codiceFiscale: 'CLNMRA80A01H501Z',
};

const preferenzeNotificheIniziali: PreferenzeNotificheCliente = {
  nuoviMessaggi: true,
  aggiornamentiPreventivi: true,
  confermeAppuntamenti: true,
  promozioniEsclusive: false,
  aggiornamentiServizio: true,
};


const DashboardClienteImpostazioni: React.FC = () => {
  const [datiPersonali, setDatiPersonali] = useState<DatiPersonaliCliente>(datiPersonaliIniziali);
  const [feedbackDatiPersonali, setFeedbackDatiPersonali] = useState<{ tipo: 'successo' | 'errore'; messaggio: string } | null>(null);

  const [vecchiaPassword, setVecchiaPassword] = useState('');
  const [nuovaPassword, setNuovaPassword] = useState('');
  const [confermaNuovaPassword, setConfermaNuovaPassword] = useState('');
  const [feedbackPassword, setFeedbackPassword] = useState<{ tipo: 'successo' | 'errore'; messaggio: string } | null>(null);

  const [preferenzeNotifiche, setPreferenzeNotifiche] = useState<PreferenzeNotificheCliente>(preferenzeNotificheIniziali);
  const [feedbackNotifiche, setFeedbackNotifiche] = useState<{ tipo: 'successo' | 'errore'; messaggio: string } | null>(null);

  const handleInputChangeDatiPersonali = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatiPersonali(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvaDatiPersonali = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackDatiPersonali(null);
    // Validazione mock
    if (!datiPersonali.nome.trim() || !datiPersonali.cognome.trim()) {
      setFeedbackDatiPersonali({ tipo: 'errore', messaggio: 'Nome e cognome sono obbligatori.' });
      return;
    }
    console.log('Salvataggio dati personali (mock):', datiPersonali);
    setFeedbackDatiPersonali({ tipo: 'successo', messaggio: 'Dati personali aggiornati con successo!' });
    // In un'app reale: chiamata API
  };

  const handleSalvaPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackPassword(null);
    if (!vecchiaPassword || !nuovaPassword || !confermaNuovaPassword) {
      setFeedbackPassword({ tipo: 'errore', messaggio: 'Tutti i campi password sono obbligatori.' });
      return;
    }
    if (nuovaPassword !== confermaNuovaPassword) {
      setFeedbackPassword({ tipo: 'errore', messaggio: 'La nuova password e la conferma non coincidono.' });
      return;
    }
    if (nuovaPassword.length < 8) {
        setFeedbackPassword({ tipo: 'errore', messaggio: 'La nuova password deve essere di almeno 8 caratteri.' });
        return;
    }
    console.log('Salvataggio nuova password (mock)');
    setFeedbackPassword({ tipo: 'successo', messaggio: 'Password modificata con successo!' });
    setVecchiaPassword(''); setNuovaPassword(''); setConfermaNuovaPassword('');
    // In un'app reale: chiamata API
  };

  const handleToggleNotifica = (key: keyof PreferenzeNotificheCliente) => {
    setPreferenzeNotifiche(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSalvaPreferenzeNotifiche = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvataggio preferenze notifiche (mock):', preferenzeNotifiche);
    setFeedbackNotifiche({ tipo: 'successo', messaggio: 'Preferenze notifiche aggiornate!' });
    // In un'app reale: chiamata API
  };

  const handleEliminaAccount = () => {
    if (window.confirm("Sei assolutamente sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno persi.")) {
      if (window.confirm("Conferma ulteriore: sei consapevole che tutti i tuoi dati, richieste, appuntamenti e messaggi verranno eliminati permanentemente?")) {
        console.log("Eliminazione account (mock)");
        alert("Account eliminato con successo (mock). Sarai reindirizzato alla homepage.");
        // In un'app reale: chiamata API per eliminare account, poi logout e redirect.
        // navigate('/');
      }
    }
  };


  return (
    <div className={styles.containerImpostazioni}>
      <Titolo livello={2} className={styles.titoloSezioneDashboard}>
        Impostazioni Account
      </Titolo>

      {/* Sezione Dati Personali */}
      <section className={styles.sezioneImpostazioni}>
        <h3>Dati Personali</h3>
        <form onSubmit={handleSalvaDatiPersonali} className={`${styles.formImpostazioni} ${styles.formDatiPersonali}`}>
          <CampoTesto id="nome" nome="nome" label="Nome" valore={datiPersonali.nome} onChange={handleInputChangeDatiPersonali} richiesto />
          <CampoTesto id="cognome" nome="cognome" label="Cognome" valore={datiPersonali.cognome} onChange={handleInputChangeDatiPersonali} richiesto />
          <div className={styles.campoEmailDisabilitato}> {/* Wrapper per stile disabilitato */}
            <CampoTesto id="email" nome="email" label="Email" valore={datiPersonali.email} onChange={handleInputChangeDatiPersonali} disabilitato />
            <Paragrafo className={styles.avvisoEmail}>L'indirizzo email non può essere modificato da questa sezione.</Paragrafo>
          </div>
          <CampoTesto id="telefono" nome="telefono" label="Telefono (opzionale)" tipo="tel" valore={datiPersonali.telefono || ''} onChange={handleInputChangeDatiPersonali} />
          <div className={styles.campoSpanIntero}> {/* Campo che occupa due colonne su layout grid */}
            <CampoTesto id="indirizzoFatturazione" nome="indirizzoFatturazione" label="Indirizzo di Fatturazione (opzionale)" valore={datiPersonali.indirizzoFatturazione || ''} onChange={handleInputChangeDatiPersonali} />
          </div>
          <div className={styles.campoSpanIntero}>
            <CampoTesto id="codiceFiscale" nome="codiceFiscale" label="Codice Fiscale (opzionale)" valore={datiPersonali.codiceFiscale || ''} onChange={handleInputChangeDatiPersonali} />
          </div>
          
          {feedbackDatiPersonali && <div className={`${styles.feedbackMessaggio} ${feedbackDatiPersonali.tipo === 'successo' ? styles.successo : styles.errore}`}>{feedbackDatiPersonali.messaggio}</div>}
          <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Salva Dati Personali</Bottone>
        </form>
      </section>

      {/* Sezione Password */}
      <section className={styles.sezioneImpostazioni}>
        <h3>Modifica Password</h3>
        <form onSubmit={handleSalvaPassword} className={styles.formImpostazioni}>
          <CampoTesto id="vecchiaPassword" nome="vecchiaPassword" label="Vecchia Password" tipo="password" valore={vecchiaPassword} onChange={(e) => setVecchiaPassword(e.target.value)} richiesto />
          <CampoTesto id="nuovaPassword" nome="nuovaPassword" label="Nuova Password" tipo="password" valore={nuovaPassword} onChange={(e) => setNuovaPassword(e.target.value)} richiesto />
          <CampoTesto id="confermaNuovaPassword" nome="confermaNuovaPassword" label="Conferma Nuova Password" tipo="password" valore={confermaNuovaPassword} onChange={(e) => setConfermaNuovaPassword(e.target.value)} richiesto />
          
          {feedbackPassword && <div className={`${styles.feedbackMessaggio} ${feedbackPassword.tipo === 'successo' ? styles.successo : styles.errore}`}>{feedbackPassword.messaggio}</div>}
          <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Salva Nuova Password</Bottone>
        </form>
      </section>

      {/* Sezione Preferenze Notifiche */}
      <section className={styles.sezioneImpostazioni}>
        <h3>Preferenze Notifiche</h3>
        <form onSubmit={handleSalvaPreferenzeNotifiche} className={styles.formImpostazioni}>
          {Object.keys(preferenzeNotifiche).map((key) => (
            <div key={key} className={styles.checkboxPreferenza}>
              <input
                type="checkbox"
                id={`notifica-${key}`}
                name={key}
                checked={preferenzeNotifiche[key as keyof PreferenzeNotificheCliente]}
                onChange={() => handleToggleNotifica(key as keyof PreferenzeNotificheCliente)}
              />
              <label htmlFor={`notifica-${key}`}>
                {/* Semplice trasformazione del nome chiave in etichetta leggibile */}
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
          {feedbackNotifiche && <div className={`${styles.feedbackMessaggio} ${feedbackNotifiche.tipo === 'successo' ? styles.successo : styles.errore}`}>{feedbackNotifiche.messaggio}</div>}
          <Bottone type="submit" variante="primario" className={styles.bottoneSalva}>Salva Preferenze</Bottone>
        </form>
      </section>

      {/* Sezione Privacy/Dati */}
      <section className={styles.sezioneImpostazioni}>
        <h3>Privacy e Gestione Dati</h3>
        <Paragrafo>Qui potrai gestire i tuoi dati personali o richiedere l'eliminazione dell'account (funzionalità futura).</Paragrafo>
        <Bottone onClick={handleEliminaAccount} variante="danger" className={styles.bottoneEliminaAccount}>
          Elimina Account
        </Bottone>
      </section>
    </div>
  );
};

export default DashboardClienteImpostazioni;
