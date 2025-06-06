import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { Contenitore, Griglia } from '../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../componenti/comuni/Bottone/Bottone';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [servizio, setServizio] = useState('');
  const [localita, setLocalita] = useState('');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (servizio || localita) {
      navigate(`/risultati-ricerca?servizio=${encodeURIComponent(servizio)}&localita=${encodeURIComponent(localita)}`);
    } else {
      // Opzionale: mostra un messaggio se entrambi i campi sono vuoti
      alert('Inserisci almeno un criterio di ricerca.');
    }
  };

  const categoriePopolari = [
    { nome: 'Idraulici', icona: '🔧' },
    { nome: 'Elettricisti', icona: '💡' },
    { nome: 'Muratori', icona: '🧱' },
    { nome: 'Imbianchini', icona: '🖌️' },
    { nome: 'Giardinieri', icona: '🌳' },
    { nome: 'Falegnami', icona: '🪚' },
    { nome: 'Fabbri', icona: '🔩' },
    { nome: 'Tecnici PC', icona: '💻' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Contenitore className={styles.contenitoreHero}>
          <Titolo livello={1} className={styles.titoloHero}>
            Trova il professionista giusto per te.
          </Titolo>
          <Paragrafo className={styles.sottotitoloHero}>
            Confronta preventivi, leggi recensioni e scegli l'esperto più adatto alle tue esigenze.
          </Paragrafo>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <CampoTesto
              name="servizio"
              placeholder="Es. Idraulico, Elettricista, Imbianchino..."
              value={servizio}
              onChange={(e) => setServizio(e.target.value)}
              aria-label="Servizio cercato"
              className={styles.campoRicercaServizio}
            />
            <div className={styles.campoLocalitaWrapper}>
              <CampoTesto
                name="localita"
                placeholder="Es. Milano, Roma, Napoli..."
                value={localita}
                onChange={(e) => setLocalita(e.target.value)}
                aria-label="Località"
                className={styles.campoRicercaLocalita}
              />
              <span className={styles.iconaGeolocalizzazione}>📍</span>
            </div>
            <Bottone type="submit" variante="primario" className={styles.bottoneRicerca}>
              Cerca
            </Bottone>
          </form>
        </Contenitore>
      </section>

      {/* Sezione Categorie Popolari */}
      <section className={styles.categorieSection}>
        <Contenitore>
          <Titolo livello={2} className={styles.titoloSezione}>Le categorie più richieste</Titolo>
          <Griglia colonne={4} gap="1.5rem" className={styles.grigliaCategorie}>
            {categoriePopolari.map((categoria) => (
              <div key={categoria.nome} className={styles.categoriaCard}>
                <div className={styles.iconaCategoriaPlaceholder}>{categoria.icona}</div>
                <Paragrafo className={styles.nomeCategoria}>{categoria.nome}</Paragrafo>
              </div>
            ))}
          </Griglia>
        </Contenitore>
      </section>

      {/* Sezione Come Funziona (Placeholder) */}
      <section className={styles.comeFunzionaSection}>
        <Contenitore>
          <Titolo livello={2} className={styles.titoloSezione}>Come funziona</Titolo>
          <Griglia colonne={3} gap="2rem" className={styles.grigliaComeFunziona}>
            <div className={styles.stepCard}>
              <div className={styles.iconaStep}>1</div>
              <Titolo livello={3} className={styles.titoloStep}>Descrivi la tua richiesta</Titolo>
              <Paragrafo>Spiega di cosa hai bisogno in pochi semplici passaggi.</Paragrafo>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.iconaStep}>2</div>
              <Titolo livello={3} className={styles.titoloStep}>Ricevi preventivi</Titolo>
              <Paragrafo>Confronta le offerte dei migliori professionisti della tua zona.</Paragrafo>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.iconaStep}>3</div>
              <Titolo livello={3} className={styles.titoloStep}>Scegli l'esperto</Titolo>
              <Paragrafo>Affidati al professionista con le migliori recensioni e il giusto prezzo.</Paragrafo>
            </div>
          </Griglia>
        </Contenitore>
      </section>

      {/* Sezione Testimonianze (Placeholder) */}
      <section className={styles.testimonianzeSection}>
        <Contenitore>
          <Titolo livello={2} className={styles.titoloSezione}>Dicono di noi</Titolo>
          <Griglia colonne={3} gap="1.5rem" className={styles.grigliaTestimonianze}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.cardTestimonianza}>
                <Paragrafo className={styles.testoTestimonianza}>
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum."
                </Paragrafo>
                <Paragrafo className={styles.autoreTestimonianza}>- Utente {i}</Paragrafo>
              </div>
            ))}
          </Griglia>
        </Contenitore>
      </section>
    </>
  );
};

export default HomePage;
