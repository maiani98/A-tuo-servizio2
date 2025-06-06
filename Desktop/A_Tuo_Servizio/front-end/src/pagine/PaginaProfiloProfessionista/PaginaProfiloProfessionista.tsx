import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PaginaProfiloProfessionista.module.css';
import { Contenitore, Griglia } from '../../componenti/layout/Layout';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Modale } from '../../componenti/comuni/Modale/Modale';

// Funzione Helper per renderizzare le stelle (ricreata per semplicità)
const RenderStelle: React.FC<{ valutazione: number, dimensione?: string }> = ({ valutazione, dimensione = '1.2em' }) => {
  const stellePiene = Math.floor(valutazione);
  const mezzaStella = valutazione % 1 >= 0.5;
  const stelleVuote = 5 - stellePiene - (mezzaStella ? 1 : 0);
  const stelleArray = [];

  const stileStella = { fontSize: dimensione, color: '#FFC107', marginRight: '2px' };
  const stileStellaVuota = { ...stileStella, color: '#E0E0E0' };

  for (let i = 0; i < stellePiene; i++) {
    stelleArray.push(<span key={`piena-${i}`} style={stileStella}>★</span>);
  }
  if (mezzaStella) {
    stelleArray.push(<span key="mezza" style={stileStella}>★</span>); // Semplificato
  }
  for (let i = 0; i < stelleVuote; i++) {
    stelleArray.push(<span key={`vuota-${i}`} style={stileStellaVuota}>☆</span>);
  }
  return <>{stelleArray}</>;
};

// Interfaccia per i dati di un singolo progetto del portfolio
export interface ProgettoPortfolioDati {
  id: string;
  titolo: string;
  immagineUrl: string;
  categoria?: string;
  descrizioneBreve?: string;
  descrizioneDettagliata?: string;
  immaginiDettaglio?: string[];
}

// Interfaccia per i dati di un singolo servizio offerto
export interface ServizioDati {
  id: string;
  nome: string;
  descrizione: string;
  prezzoIndicativo?: string;
}

// Interfaccia per i dati del profilo mock (aggiornata)
interface ProfiloProfessionistaDati {
  id: string;
  nome: string;
  urlFotoProfilo?: string;
  urlImmagineCopertina?: string;
  specializzazione: string;
  valutazioneMedia: number;
  numeroRecensioni: number;
  localita: string;
  descrizioneLunga: string;
  portfolio?: ProgettoPortfolioDati[];
  serviziOfferti?: ServizioDati[]; // Aggiunto array serviziOfferti
}

const PaginaProfiloProfessionista: React.FC = () => {
  const { idProfessionista } = useParams<{ idProfessionista: string }>();
  const [profiloMock, setProfiloMock] = useState<ProfiloProfessionistaDati | null>(null);
  const [tabAttiva, setTabAttiva] = useState<'descrizione' | 'portfolio' | 'servizi' | 'recensioni'>('descrizione');
  const [isPreferito, setIsPreferito] = useState(false);
  const [progettoSelezionato, setProgettoSelezionato] = useState<ProgettoPortfolioDati | null>(null);

  const apriDettaglioProgetto = (progetto: ProgettoPortfolioDati) => setProgettoSelezionato(progetto);
  const chiudiDettaglioProgetto = () => setProgettoSelezionato(null);

  useEffect(() => {
    console.log(`Caricamento profilo per ID: ${idProfessionista}`);
    const datiEsempio: ProfiloProfessionistaDati = {
      id: idProfessionista || '001',
      nome: 'Mario Rossi',
      urlFotoProfilo: `https://i.pravatar.cc/150?u=${idProfessionista || 'mario.rossi'}`,
      specializzazione: 'Idraulico Esperto & Installatore Certificato',
      valutazioneMedia: 4.7,
      numeroRecensioni: 132,
      localita: 'Milano, Lombardia',
      descrizioneLunga: `Sono Mario Rossi, un idraulico professionista con oltre 15 anni di esperienza nel settore... (descrizione completa omessa per brevità)`,
      portfolio: [
        {
          id: 'p1',
          titolo: 'Ristrutturazione Bagno Completa',
          immagineUrl: 'https://via.placeholder.com/300x200/2B4E72/FFFFFF?text=Bagno+Moderno',
          categoria: 'Ristrutturazioni',
          descrizioneBreve: 'Rifacimento completo di un bagno padronale con finiture di pregio.',
          descrizioneDettagliata: 'Questo progetto ha incluso la demolizione del vecchio bagno...',
          immaginiDettaglio: [
            'https://via.placeholder.com/800x600/2B4E72/FFFFFF?text=Bagno+Dettaglio+1',
            'https://via.placeholder.com/800x600/6AC0B2/FFFFFF?text=Bagno+Dettaglio+2',
          ]
        },
        // Altri progetti portfolio...
      ],
      serviziOfferti: [
        {
          id: 's1',
          nome: 'Riparazioni Idrauliche Urgenti',
          descrizione: 'Interventi rapidi entro 1 ora dalla chiamata per perdite, otturazioni, rubinetteria e sanitari. Disponibilità 24/7.',
          prezzoIndicativo: 'A partire da 80€ (diritto di chiamata incluso)'
        },
        {
          id: 's2',
          nome: 'Installazione Impianti Sanitari',
          descrizione: 'Montaggio completo di WC, bidet, lavandini, piatti doccia, vasche da bagno e rubinetteria. Consulenza sulla scelta dei materiali.',
          prezzoIndicativo: 'Su preventivo'
        },
        {
          id: 's3',
          nome: 'Manutenzione Caldaie e Scaldabagni',
          descrizione: 'Controllo periodico, pulizia e verifica fumi per caldaie e scaldabagni a gas. Interventi di riparazione su guasti e malfunzionamenti.',
        },
        {
          id: 's4',
          nome: 'Ristrutturazione Bagno Chiavi in Mano',
          descrizione: 'Progettazione e rifacimento completo del bagno, inclusi impianti, piastrelle, sanitari e finiture. Coordinamento completo dei lavori.',
          prezzoIndicativo: 'Da 3.500€'
        }
      ]
    };
    setProfiloMock(datiEsempio);
  }, [idProfessionista]);

  if (!profiloMock) {
    return <Contenitore><Paragrafo>Caricamento profilo...</Paragrafo></Contenitore>;
  }

  const inizialiNome = profiloMock.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  return (
    <div className={styles.paginaProfiloWrapper}>
      <header className={styles.headerProfilo}>
        <div className={styles.immagineCopertina}></div>
        <Contenitore className={styles.contenitoreIntestazione}>
          <div className={styles.contenutoIntestazioneProfilo}>
            <div className={styles.fotoProfiloWrapper}>
              {profiloMock.urlFotoProfilo ? (
                <img src={profiloMock.urlFotoProfilo} alt={`Foto profilo di ${profiloMock.nome}`} className={styles.fotoProfilo} />
              ) : (
                <div className={`${styles.fotoProfilo} ${styles.fotoPlaceholder}`}>
                  {inizialiNome}
                </div>
              )}
            </div>
            <div className={styles.testataInfo}>
              <Titolo livello={1} className={styles.nomeProfessionista}>{profiloMock.nome}</Titolo>
              <Paragrafo className={styles.specializzazioneProfilo}>{profiloMock.specializzazione}</Paragrafo>
              <div className={styles.valutazioneLocalitaWrapper}>
                <RenderStelle valutazione={profiloMock.valutazioneMedia} />
                <Paragrafo className={styles.valutazioneTesto}>
                  ({profiloMock.numeroRecensioni} recensioni)
                </Paragrafo>
                <span className={styles.separatoreDot}>·</span>
                <Paragrafo className={styles.localitaProfilo}>{profiloMock.localita}</Paragrafo>
              </div>
            </div>
          </div>
        </Contenitore>
      </header>

      <Contenitore>
        <section className={styles.barraAzioni}>
          <Bottone variante="primario" onClick={() => alert('Invia Messaggio (da implementare)')}>Invia Messaggio</Bottone>
          <Bottone variante="secondario" onClick={() => alert('Richiedi Preventivo (da implementare)')}>Richiedi Preventivo</Bottone>
          <Bottone 
            variante={isPreferito ? "primario" : "secondario"}
            onClick={() => setIsPreferito(!isPreferito)}
            className={styles.bottonePreferiti}
            aria-pressed={isPreferito}
          >
            {isPreferito ? '★ Salvato' : '☆ Salva Preferiti'}
          </Bottone>
        </section>

        <nav className={styles.navigazioneTabs}>
          <button
            className={`${styles.tabBottone} ${tabAttiva === 'descrizione' ? styles.tabAttiva : ''}`}
            onClick={() => setTabAttiva('descrizione')}
          >
            Descrizione
          </button>
          <button
            className={`${styles.tabBottone} ${tabAttiva === 'portfolio' ? styles.tabAttiva : ''}`}
            onClick={() => setTabAttiva('portfolio')}
          >
            Portfolio
          </button>
          <button
            className={`${styles.tabBottone} ${tabAttiva === 'servizi' ? styles.tabAttiva : ''}`}
            onClick={() => setTabAttiva('servizi')}
          >
            Servizi
          </button>
          <button
            className={`${styles.tabBottone} ${tabAttiva === 'recensioni' ? styles.tabAttiva : ''}`}
            onClick={() => setTabAttiva('recensioni')}
          >
            Recensioni ({profiloMock.numeroRecensioni})
          </button>
        </nav>

        <section className={styles.contenutoScheda}>
          {tabAttiva === 'descrizione' && (
            <div>
              <Titolo livello={2} className={styles.titoloSezioneScheda}>Chi Sono</Titolo>
              <Paragrafo className={styles.testoDescrizioneLunga}>
                {profiloMock.descrizioneLunga}
              </Paragrafo>
            </div>
          )}
          {tabAttiva === 'portfolio' && (
            // ... (contenuto scheda portfolio come prima) ...
            <div>
              <Titolo livello={2} className={styles.titoloSezioneScheda}>Portfolio Lavori</Titolo>
              {profiloMock.portfolio && profiloMock.portfolio.length > 0 ? (
                <Griglia colonne={3} gap="1.5rem" className={styles.galleriaProgetti}>
                  {profiloMock.portfolio.map((progetto) => (
                    <div 
                      key={progetto.id} 
                      className={styles.cardAnteprimaProgetto}
                      onClick={() => apriDettaglioProgetto(progetto)}
                      role="button" 
                      tabIndex={0} 
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') apriDettaglioProgetto(progetto);}}
                    >
                      <img src={progetto.immagineUrl} alt={progetto.titolo} className={styles.immagineAnteprimaProgetto} />
                      <div className={styles.contenutoTestualeAnteprima}>
                        <h5 className={styles.titoloAnteprimaProgetto}>{progetto.titolo}</h5>
                        {progetto.categoria && (
                          <Paragrafo className={styles.categoriaAnteprimaProgetto}>{progetto.categoria}</Paragrafo>
                        )}
                      </div>
                    </div>
                  ))}
                </Griglia>
              ) : (
                <Paragrafo>Nessun progetto nel portfolio al momento.</Paragrafo>
              )}
            </div>
          )}
          {tabAttiva === 'servizi' && (
            <div>
              <Titolo livello={2} className={styles.titoloSezioneScheda}>Servizi Offerti</Titolo>
              {profiloMock.serviziOfferti && profiloMock.serviziOfferti.length > 0 ? (
                <div className={styles.serviziElenco}> {/* Contenitore per l'elenco dei servizi */}
                  {profiloMock.serviziOfferti.map((servizio) => (
                    <div key={servizio.id} className={styles.servizioItem}>
                      <h4 className={styles.nomeServizio}>{servizio.nome}</h4> {/* Usato h4 direttamente */}
                      <Paragrafo className={styles.descrizioneServizio}>{servizio.descrizione}</Paragrafo>
                      {servizio.prezzoIndicativo && (
                        <Paragrafo className={styles.prezzoServizio}>{servizio.prezzoIndicativo}</Paragrafo>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Paragrafo>Nessun servizio specificato dal professionista.</Paragrafo>
              )}
            </div>
          )}
          {tabAttiva === 'recensioni' && (
            <div>
              <Titolo livello={2} className={styles.titoloSezioneScheda}>Recensioni dei Clienti</Titolo>
              <Paragrafo>Elenco delle recensioni (da implementare)...</Paragrafo>
            </div>
          )}
        </section>
      </Contenitore>

      {progettoSelezionato && (
        <Modale
          aperto={!!progettoSelezionato}
          onChiudi={chiudiDettaglioProgetto}
          titolo={progettoSelezionato.titolo}
          larghezza="800px"
        >
          <img 
            src={progettoSelezionato.immagineUrl} 
            alt={progettoSelezionato.titolo} 
            style={{width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem'}} 
          />
          {progettoSelezionato.immaginiDettaglio && progettoSelezionato.immaginiDettaglio.length > 0 && (
            <div className={styles.galleriaImmaginiDettaglio}>
              {progettoSelezionato.immaginiDettaglio.map((imgUrl, index) => (
                <img key={index} src={imgUrl} alt={`${progettoSelezionato.titolo} - dettaglio ${index + 1}`} />
              ))}
            </div>
          )}
          <Titolo livello={3} style={{marginTop: '1rem'}}>{progettoSelezionato.titolo}</Titolo>
          {progettoSelezionato.categoria && <Paragrafo className={styles.categoriaDettaglioProgetto}>Categoria: {progettoSelezionato.categoria}</Paragrafo>}
          <Paragrafo className={styles.descrizioneDettaglioProgetto}>
            {progettoSelezionato.descrizioneDettagliata || progettoSelezionato.descrizioneBreve || "Nessuna descrizione dettagliata disponibile."}
          </Paragrafo>
        </Modale>
      )}
    </div>
  );
};

export default PaginaProfiloProfessionista;
