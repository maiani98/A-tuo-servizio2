import React from 'react';
import styles from './PaginaChiSiamo.module.css';
import { Titolo, Paragrafo } from '../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../componenti/comuni/Bottone/Bottone';
import { Link } from 'react-router-dom';
import { Contenitore } from '../componenti/layout/Layout'; // Assuming a general container component

const PaginaChiSiamo: React.FC = () => {
  return (
    <Contenitore className={styles.paginaChiSiamoContainer}>
      <header className={styles.headerPagina}>
        <Titolo livello={1} className={styles.titoloPrincipale}>Chi Siamo</Titolo>
        <Paragrafo className={styles.sottotitoloHeader}>
          Connettiamo professionisti qualificati con clienti che cercano servizi di qualità. Scopri la nostra storia, i nostri valori e perché siamo la scelta giusta per te.
        </Paragrafo>
      </header>

      <section className={styles.sezione}>
        <Titolo livello={2} className={styles.titoloSezione}>La Nostra Missione</Titolo>
        <Paragrafo>
          La nostra missione è semplificare la ricerca e l'ingaggio di professionisti affidabili e competenti, fornendo una piattaforma intuitiva, trasparente e sicura che valorizzi il lavoro di qualità e soddisfi le esigenze dei clienti. Vogliamo costruire ponti di fiducia e opportunità nel mondo dei servizi.
        </Paragrafo>
        <img src="https://via.placeholder.com/800x300/007bff/FFFFFF?text=Immagine+Missione" alt="La nostra missione" className={styles.immagineSezione} />
      </section>

      <section className={styles.sezioneAlternata}>
        <Titolo livello={2} className={styles.titoloSezione}>La Nostra Visione</Titolo>
        <Paragrafo>
          Aspiriamo a diventare il punto di riferimento nazionale per l'incontro tra domanda e offerta di servizi professionali, promuovendo un ecosistema in cui ogni interazione sia basata sull'eccellenza, l'integrità e la crescita reciproca. Immaginiamo un futuro in cui trovare il professionista giusto sia facile come un click.
        </Paragrafo>
      </section>

      <section className={styles.sezione}>
        <Titolo livello={2} className={styles.titoloSezione}>I Nostri Valori</Titolo>
        <div className={styles.valoriGrid}>
          <div className={styles.valoreCard}>
            <Titolo livello={3} className={styles.titoloValore}>Affidabilità</Titolo>
            <Paragrafo>Garantiamo connessioni con professionisti verificati e competenti.</Paragrafo>
          </div>
          <div className={styles.valoreCard}>
            <Titolo livello={3} className={styles.titoloValore}>Trasparenza</Titolo>
            <Paragrafo>Promuoviamo chiarezza nei preventivi, nelle recensioni e nelle comunicazioni.</Paragrafo>
          </div>
          <div className={styles.valoreCard}>
            <Titolo livello={3} className={styles.titoloValore}>Qualità</Titolo>
            <Paragrafo>Ci impegniamo a mantenere alti standard per i servizi offerti sulla nostra piattaforma.</Paragrafo>
          </div>
          <div className={styles.valoreCard}>
            <Titolo livello={3} className={styles.titoloValore}>Innovazione</Titolo>
            <Paragrafo>Sviluppiamo costantemente la nostra piattaforma per offrire la migliore esperienza utente.</Paragrafo>
          </div>
        </div>
      </section>
      
      {/* Sezione Storia (Opzionale) */}
      <section className={styles.sezioneAlternata}>
        <Titolo livello={2} className={styles.titoloSezione}>La Nostra Storia (Opzionale)</Titolo>
        <Paragrafo>
          Nati nel [Anno di Fondazione Placeholder], abbiamo iniziato con l'obiettivo di [Obiettivo Iniziale Placeholder]. Da allora, siamo cresciuti fino a diventare [Risultato Attuale Placeholder], aiutando migliaia di utenti e professionisti.
          Questo testo è un placeholder e può essere espanso o rimosso.
        </Paragrafo>
      </section>

      {/* Sezione Team (Opzionale Placeholder) */}
      <section className={styles.sezione}>
        <Titolo livello={2} className={styles.titoloSezione}>Il Nostro Team (Opzionale)</Titolo>
        <Paragrafo>
          Siamo un gruppo di persone appassionate e dedicate a [Descrizione Scopo Team Placeholder].
          Attualmente, questa sezione è un placeholder. Potrebbe includere foto e brevi biografie dei membri chiave del team.
        </Paragrafo>
        <div className={styles.teamPlaceholderGrid}>
            <div className={styles.membroTeamCardPlaceholder}><Paragrafo>Membro Team 1 (Placeholder)</Paragrafo><img src="https://via.placeholder.com/150/cccccc/FFFFFF?text=Team" alt="Team Placeholder" /></div>
            <div className={styles.membroTeamCardPlaceholder}><Paragrafo>Membro Team 2 (Placeholder)</Paragrafo><img src="https://via.placeholder.com/150/cccccc/FFFFFF?text=Team" alt="Team Placeholder" /></div>
            <div className={styles.membroTeamCardPlaceholder}><Paragrafo>Membro Team 3 (Placeholder)</Paragrafo><img src="https://via.placeholder.com/150/cccccc/FFFFFF?text=Team" alt="Team Placeholder" /></div>
        </div>
      </section>

      <section className={styles.sezioneAlternata}>
        <Titolo livello={2} className={styles.titoloSezione}>Perché Sceglierci?</Titolo>
        <ul>
          <li>Vasta rete di professionisti qualificati e verificati.</li>
          <li>Piattaforma facile da usare per trovare e confrontare servizi.</li>
          <li>Sistema di recensioni trasparente per aiutarti a scegliere.</li>
          <li>Supporto clienti dedicato e reattivo.</li>
          <li>Sicurezza e affidabilità nelle transazioni e nei dati.</li>
        </ul>
        <img src="https://via.placeholder.com/800x300/28a745/FFFFFF?text=Perch%C3%A9+Sceglierci" alt="Perché Sceglierci" className={styles.immagineSezione} />
      </section>

      <section className={styles.sezioneCTA}>
        <Titolo livello={2} className={styles.titoloSezione}>Pronto a Iniziare?</Titolo>
        <Paragrafo>
          Che tu sia un professionista in cerca di nuovi clienti o un utente alla ricerca del servizio perfetto, sei nel posto giusto.
        </Paragrafo>
        <div className={styles.containerBottoniCTA}>
          <Link to="/">
            <Bottone variante="primario" dimensione="grande">Torna alla Homepage</Bottone>
          </Link>
          <Link to="/registrazione">
            <Bottone variante="secondario" dimensione="grande">Registrati Ora</Bottone>
          </Link>
        </div>
      </section>
    </Contenitore>
  );
};

export default PaginaChiSiamo;
