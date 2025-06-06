import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PaginaHomepage.module.css'; // Aggiornato import
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import ProfessionalCard, { ProfessionalCardProps } from '../../componenti/specifici/ProfessionalCard/ProfessionalCard'; 

// Dati Mock per Professionisti in Evidenza
const professionistiMock: ProfessionalCardProps[] = [
  {
    idProfessionista: '1',
    nome: 'Mario Rossi',
    specializzazione: 'Idraulico Esperto',
    localita: 'Roma, RM',
    urlFotoProfilo: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Mario+Rossi',
    valutazioneMedia: 4.8,
    numeroRecensioni: 120,
    tagline: "Soluzioni rapide ed efficaci per ogni problema idraulico. Specializzato in riparazioni urgenti e installazioni.",
    onVediProfilo: (idProfessionista: string | number) => alert(`Vedi profilo di ${idProfessionista}`),
    id: '1',
    haPortfolio: true,
    disponibilita: ['Weekend', 'Sera'],
    servizio: 'Idraulico',
    rating: 4.8,
  },
  {
    idProfessionista: '2',
    nome: 'Laura Bianchi',
    specializzazione: 'Architetto Creativo',
    localita: 'Milano, MI',
    urlFotoProfilo: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Laura+Bianchi',
    valutazioneMedia: 4.9,
    numeroRecensioni: 85,
    tagline: "Soluzioni rapide ed efficaci per ogni problema idraulico. Specializzato in riparazioni urgenti e installazioni.",
    onVediProfilo: (idProfessionista: string | number) => alert(`Vedi profilo di ${idProfessionista}`),
    id: '2',
    haPortfolio: false,
    disponibilita: ['Urgenze 24/7'],
    servizio: 'Elettricista',
    rating: 4.9,
  },
  {
    idProfessionista: '3',
    nome: 'Giuseppe Verdi',
    specializzazione: 'Giardiniere Paesaggista',
    localita: 'Napoli, NA',
    urlFotoProfilo: 'https://via.placeholder.com/300x200/ffc107/000000?text=Giuseppe+Verdi',
    valutazioneMedia: 4.7,
    numeroRecensioni: 95,
    tagline: "Soluzioni rapide ed efficaci per ogni problema idraulico. Specializzato in riparazioni urgenti e installazioni.",
    onVediProfilo: (idProfessionista: string | number) => alert(`Vedi profilo di ${idProfessionista}`),
    id: '3',
    haPortfolio: true,
    disponibilita: ['Sera'],
    servizio: 'Giardiniere',
    rating: 4.7,
  },
  {
    idProfessionista: '4',
    nome: 'Sofia Neri',
    specializzazione: 'Dog Sitter Affidabile',
    localita: 'Torino, TO',
    urlFotoProfilo: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Sofia+Neri',
    valutazioneMedia: 5.0,
    numeroRecensioni: 210,
    tagline: "Soluzioni rapide ed efficaci per ogni problema idraulico. Specializzato in riparazioni urgenti e installazioni.",
    onVediProfilo: (idProfessionista: string | number) => alert(`Vedi profilo di ${idProfessionista}`),
    id: '4',
    haPortfolio: false,
    disponibilita: [],
    servizio: 'Dog Sitter',
    rating: 5.0,
  }
];


const PaginaHomepage: React.FC = () => { // Rinominato componente
  const navigate = useNavigate();
  const [servizio, setServizio] = useState('');
  const [localita, setLocalita] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logica di ricerca (mock) - naviga a PaginaRisultatiRicerca con parametri
    console.log(`Ricerca servizio: ${servizio}, località: ${localita}`);
    navigate(`/risultati-ricerca?servizio=${encodeURIComponent(servizio)}&localita=${encodeURIComponent(localita)}`);
  };

  // Mock handler per click su categoria
  const handleCategoriaClick = (categoria: string) => {
    console.log(`Navigazione a categoria (mock): ${categoria}`);
    // navigate(`/servizi/${categoria.toLowerCase().replace(/\s+/g, '-')}`);
    alert(`Navigazione a categoria (mock): ${categoria}`);
  };


  return (
    <> {/* Fragment per includere Header/Footer globali che non sono parte di questa pagina */}
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Contenitore>
          <Titolo livello={1} className={styles.titoloHeroHomepage}>
            Cerca e Trova i Migliori Professionisti per la Tua Casa e i Tuoi Bisogni
          </Titolo>
          <Paragrafo className={styles.sottotitoloHeroHomepage}>
            Dall'idraulico all'architetto, dal giardiniere al dog sitter: il professionista giusto è a portata di click.
          </Paragrafo>
          <form onSubmit={handleSearch} className={styles.searchBarWrapper}>
            <CampoTesto
              id="servizio-hero"
              name="servizio"
              placeholder="Quale servizio cerchi? (es. idraulico, elettricista)"
              value={servizio}
              onChange={(e) => setServizio(e.target.value)}
              aria-label="Servizio cercato"
              className={`${styles.campoRicercaHomepage} ${styles.inputServizio}`}
            />
            <CampoTesto
              id="localita-hero"
              name="localita"
              placeholder="Dove? (es. Roma, Milano)"
              value={localita}
              onChange={(e) => setLocalita(e.target.value)}
              aria-label="Località"
              className={styles.campoRicercaHomepage}
            />
            <Bottone type="submit" variante="secondario" className={styles.bottoneRicercaHomepage}>
              Cerca
            </Bottone>
          </form>
        </Contenitore>
      </section>

      {/* Sezione Categorie Popolari */}
      <section className={`${styles.categorieSection} ${styles.sectionPadding}`}>
        <Contenitore>
          <Titolo livello={2} className={styles.sectionTitle}>Esplora le Categorie di Servizi</Titolo>
          <div className={styles.categorieGrid}>
            {/* Esempio di categorie - da rendere dinamiche o più strutturate se necessario */}
            {[
              { nome: 'Casa e Riparazioni', icona: '🏠' }, { nome: 'Lezioni e Formazione', icona: '📚' },
              { nome: 'Benessere e Cura Persona', icona: '💆‍♀️' }, { nome: 'Eventi e Intrattenimento', icona: '🎉' },
              { nome: 'Animali', icona: '🐾' }, { nome: 'Consulenze Professionali', icona: '💼' }
            ].map(cat => (
              <div key={cat.nome} className={styles.categoriaCard} onClick={() => handleCategoriaClick(cat.nome)}>
                <span className={styles.iconaCategoria} aria-hidden="true">{cat.icona}</span>
                <Paragrafo>{cat.nome}</Paragrafo>
              </div>
            ))}
          </div>
        </Contenitore>
      </section>

      {/* Sezione "Come Funziona" */}
      <section className={`${styles.comeFunzionaSection} ${styles.sectionPadding}`}>
        <Contenitore>
          <Titolo livello={2} className={styles.sectionTitle}>Semplice, Veloce, Affidabile</Titolo>
          <div className={styles.comeFunzionaGrid}>
            <div className={styles.stepComeFunziona}>
              <div className={styles.iconaStep}>🔍</div> {/* Icona Placeholder */}
              <Titolo livello={3} className={styles.titoloStep}>1. Cerca</Titolo>
              <Paragrafo>Inserisci il servizio che ti serve e la tua zona.</Paragrafo>
            </div>
            <div className={styles.stepComeFunziona}>
              <div className={styles.iconaStep}>🎯</div> {/* Icona Placeholder */}
              <Titolo livello={3} className={styles.titoloStep}>2. Confronta</Titolo>
              <Paragrafo>Visualizza profili, recensioni e portfolio dei professionisti.</Paragrafo>
            </div>
            <div className={styles.stepComeFunziona}>
              <div className={styles.iconaStep}>💬</div> {/* Icona Placeholder */}
              <Titolo livello={3} className={styles.titoloStep}>3. Contatta</Titolo>
              <Paragrafo>Richiedi preventivi e scegli l'esperto giusto per te.</Paragrafo>
            </div>
          </div>
        </Contenitore>
      </section>

      {/* Sezione "Professionisti in Evidenza" */}
      <section className={`${styles.professionistiEvidenzaSection} ${styles.sectionPadding}`}>
        <Contenitore>
          <Titolo livello={2} className={styles.sectionTitle}>Professionisti del Mese</Titolo>
          <div className={styles.professionistiGrid}>
            {professionistiMock.map(prof => (
              // Se ProfessionalCard non gestisce il Link, wrappare con <Link to={`/profilo/${prof.id}`}>
              <ProfessionalCard key={prof.id} {...prof} />
            ))}
          </div>
        </Contenitore>
      </section>

      {/* Sezione Testimonianze */}
      <section className={`${styles.testimonianzeSection} ${styles.sectionPadding}`}>
        <Contenitore>
          <Titolo livello={2} className={styles.sectionTitle}>Cosa Dicono i Nostri Utenti</Titolo>
          {/* Placeholder per le testimonianze - da implementare con card o carosello */}
          <Paragrafo className={styles.testimonianzeParagrafo}>
            "Ho trovato un idraulico fantastico in meno di un'ora! Servizio eccellente." - Marco P.
          </Paragrafo>
          <Paragrafo className={styles.testimonianzeParagrafo}>
            "Grazie a questa piattaforma ho potuto avviare la mia attività di consulenza con successo." - Elena F.
          </Paragrafo>
        </Contenitore>
      </section>
      
      {/* Sezione CTA per Professionisti */}
      <section className={`${styles.ctaProfessionistiSection} ${styles.sectionPadding}`}>
        <Contenitore className={styles.ctaProfessionistiContenitore}>
          <Titolo livello={2} className={styles.titoloCtaProfessionisti}>Sei un Professionista?</Titolo>
          <Paragrafo className={styles.paragrafoCtaProfessionisti}>
            Unisciti alla nostra piattaforma per raggiungere nuovi clienti e far crescere la tua attività. Registrati oggi stesso!
          </Paragrafo>
          {/* Assumendo che /registrazione gestisca o reindirizzi alla registrazione professionista,
              o creare una route /registrazione-professionista specifica se necessario */}
          <Link to="/registrazione">
            <Bottone variante="secondario" className={styles.bottoneCtaProfessionisti}>
              {/* La variante outline potrebbe funzionare meglio su sfondo scuro, o una custom */}
              Unisciti a Noi!
            </Bottone>
          </Link>
        </Contenitore>
      </section>
    </>
  );
};

export default PaginaHomepage; // Rinominato export
