import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './PaginaRisultatiRicerca.module.css';
import { Contenitore } from '../../componenti/layout/Layout';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import ProfessionalCard, { ProfessionalCardProps } from '../../componenti/specifici/ProfessionalCard/ProfessionalCard';

const PaginaRisultatiRicerca: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  interface ProfessionalCardPropsConFiltri extends ProfessionalCardProps {
    // Tutte le proprietà di ProfessionalCardProps sono incluse
    // onVediProfilo è già string | number in ProfessionalCardProps
    // idProfessionista è già string | number in ProfessionalCardProps
  }
  
  // Dati Mock Completi per i Professionisti
  const datiMockCompleti: ProfessionalCardPropsConFiltri[] = [
    {
      idProfessionista: '1',
      nome: 'Mario Rossi',
      specializzazione: 'Idraulico Esperto',
      localita: 'Roma, RM',
      urlFotoProfilo: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Mario+Rossi',
      valutazioneMedia: 4.8,
      numeroRecensioni: 120,
      tagline: "Soluzioni rapide ed efficaci per ogni problema idraulico. Specializzato in riparazioni urgenti e installazioni.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
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
      tagline: "Design innovativi e sostenibili per spazi unici. Esperta in ristrutturazioni e nuove costruzioni.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
      id: '2',
      haPortfolio: false,
      disponibilita: ['Urgenze 24/7'],
      servizio: 'Architetto',
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
      tagline: "Trasformo i tuoi spazi esterni in oasi di bellezza e relax. Progettazione e manutenzione giardini.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
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
      tagline: "Cura e divertimento assicurati per il tuo amico a quattro zampe. Servizio di dog sitting personalizzato.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
      id: '4',
      haPortfolio: false,
      disponibilita: [],
      servizio: 'Dog Sitter',
      rating: 5.0,
    },
    {
      idProfessionista: '5',
      nome: 'Marco Gialli',
      specializzazione: 'Falegname Artigiano',
      localita: 'Firenze, FI',
      urlFotoProfilo: 'https://via.placeholder.com/300x200/6c757d/ffffff?text=Marco+Gialli',
      valutazioneMedia: 4.6,
      numeroRecensioni: 60,
      tagline: "Realizzo mobili su misura e restauri con passione e precisione. L'arte del legno al tuo servizio.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
      id: '5',
      haPortfolio: true,
      disponibilita: ['Mattina'],
      servizio: 'Falegname',
      rating: 4.6,
    },
    {
      idProfessionista: '6',
      nome: 'Anna Azzurri',
      specializzazione: 'Insegnante di Yoga',
      localita: 'Bologna, BO',
      urlFotoProfilo: 'https://via.placeholder.com/300x200/17a2b8/ffffff?text=Anna+Azzurri',
      valutazioneMedia: 4.9,
      numeroRecensioni: 150,
      tagline: "Lezioni di yoga personalizzate per tutti i livelli. Ritrova equilibrio e benessere nel tuo corpo e mente.",
      onVediProfilo: (idProfessionista: string | number) => console.log(`Vedi profilo di ${idProfessionista}`),
      id: '6',
      haPortfolio: false,
      disponibilita: ['Sera', 'Weekend'],
      servizio: 'Insegnante di Yoga',
      rating: 4.9,
    },
  ];

  // Stati per i parametri di ricerca dalla URL (per la barra modificabile)
  const [servizioInput, setServizioInput] = useState(searchParams.get('servizio') || '');
  const [localitaInput, setLocalitaInput] = useState(searchParams.get('localita') || '');

  // Stati per i filtri effettivi usati nella logica
  const [filtroServizio, setFiltroServizio] = useState(searchParams.get('servizio') || '');
  const [filtroLocalita, setFiltroLocalita] = useState(searchParams.get('localita') || '');

  const [risultatiVisualizzati, setRisultatiVisualizzati] = useState<ProfessionalCardPropsConFiltri[]>([]);
  const [vistaAttiva, setVistaAttiva] = useState<'lista' | 'mappa'>('lista');
  
  // Stati dei filtri del pannello
  const [ordinamento, setOrdinamento] = useState<string>('pertinenza');
  const [filtroDistanza, setFiltroDistanza] = useState(''); // Non usato attivamente nella logica mock
  const [filtroValutazione, setFiltroValutazione] = useState<number>(0); // 0 per 'Qualsiasi'
  const [filtroDisponibilita, setFiltroDisponibilita] = useState<string[]>([]);
  const [filtroPortfolio, setFiltroPortfolio] = useState(false);

  // Callback per applicare filtri e ordinamento
  const applicaFiltriEOrdinamento = useCallback(() => {
    let risultatiFiltrati = [...datiMockCompleti];

    // 1. Filtro base per servizio e località dai searchParams (o stati derivati)
    if (filtroServizio && filtroServizio !== 'Servizio non specificato') {
      risultatiFiltrati = risultatiFiltrati.filter(p => p.servizio.toLowerCase().includes(filtroServizio.toLowerCase()));
    }
    if (filtroLocalita && filtroLocalita !== 'tutta Italia') {
      risultatiFiltrati = risultatiFiltrati.filter(p => p.localita.toLowerCase().includes(filtroLocalita.toLowerCase()));
    }

    // 2. Applica filtri del pannello
    if (filtroPortfolio) {
      risultatiFiltrati = risultatiFiltrati.filter(p => p.haPortfolio);
    }
    if (filtroValutazione > 0) {
      risultatiFiltrati = risultatiFiltrati.filter(p => p.rating >= filtroValutazione);
    }
    if (filtroDisponibilita.length > 0) {
      risultatiFiltrati = risultatiFiltrati.filter(p => 
        filtroDisponibilita.every(disp => p.disponibilita.includes(disp))
      );
    }
    
    // 3. Applica ordinamento
    switch (ordinamento) {
      case 'valutazione':
        risultatiFiltrati.sort((a, b) => b.rating - a.rating);
        break;
      case 'recensioni':
        risultatiFiltrati.sort((a, b) => b.numeroRecensioni - a.numeroRecensioni);
        break;
      case 'nome_asc':
        risultatiFiltrati.sort((a,b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome_desc':
        risultatiFiltrati.sort((a,b) => b.nome.localeCompare(a.nome));
        break;
      // 'pertinenza' è il default, non necessita sort o usa un futuro algoritmo
      default:
        // Nessun ordinamento specifico o mantieni l'ordine "pertinente" (attuale)
        break;
    }
    setRisultatiVisualizzati(risultatiFiltrati);
  }, [filtroServizio, filtroLocalita, filtroPortfolio, filtroValutazione, filtroDisponibilita, ordinamento]);


  // Effetto per aggiornare i risultati quando i filtri o i searchParams cambiano
  useEffect(() => {
    // Aggiorna gli stati dei filtri base quando i searchParams cambiano
    setFiltroServizio(searchParams.get('servizio') || 'Servizio non specificato');
    setFiltroLocalita(searchParams.get('localita') || 'tutta Italia');
    
    // Aggiorna anche i campi input della barra di ricerca modificabile
    setServizioInput(searchParams.get('servizio') || '');
    setLocalitaInput(searchParams.get('localita') || '');

  }, [searchParams]);

  useEffect(() => {
    applicaFiltriEOrdinamento();
  }, [applicaFiltriEOrdinamento]); // Questo useEffect ora dipende dalla callback memoizzata


  const handleSearchModificata = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ servizio: servizioInput, localita: localitaInput });
  };
  
  // Non più necessario se l'useEffect gestisce l'applicazione dei filtri
  // const handleApplicaFiltri = () => {
  //   applicaFiltriEOrdinamento(); 
  //   console.log("Filtri applicati (mock):", { filtroDistanza, filtroValutazione, filtroDisponibilita, filtroPortfolio });
  // };

  const handleResettaFiltri = () => {
    setFiltroDistanza(''); // Non usato nella logica, ma resettalo per UI
    setFiltroValutazione(0);
    setFiltroDisponibilita([]);
    setFiltroPortfolio(false);
    setOrdinamento('pertinenza'); // Resetta anche l'ordinamento
    // I searchParams non vengono resettati qui, l'utente può farlo dalla barra di ricerca
    // La chiamata a applicaFiltriEOrdinamento() verrà triggerata dall'useEffect
  };

  const numeroRisultati = risultatiVisualizzati.length;
  const servizioDisplay = filtroServizio === 'Servizio non specificato' ? 'professionista' : filtroServizio;
  const localitaDisplay = filtroLocalita === 'tutta Italia' ? '' : `a ${filtroLocalita}`;
  const titoloH1 = `${numeroRisultati} ${servizioDisplay}${numeroRisultati !== 1 ? 'i' : ''} trovat${numeroRisultati !== 1 ? 'i' : 'o'} ${localitaDisplay}`;

  return (
    <div className={styles.paginaWrapper}>
      <Contenitore className={styles.mainContent}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <Link to="/servizi-placeholder">Servizi</Link> 
          <span>&gt;</span>
          <Link to={`/servizi-placeholder/${(filtroServizio !== 'Servizio non specificato' ? filtroServizio : 'ricerca').toLowerCase().replace(/\s+/g, '-')}`}>
            {filtroServizio !== 'Servizio non specificato' ? filtroServizio : 'Ricerca'}
          </Link>
          {filtroLocalita !== 'tutta Italia' && (
            <>
              <span>&gt;</span>
              <span>{filtroLocalita}</span>
            </>
          )}
        </nav>

        <Titolo livello={1} className={styles.titoloRisultati}>
          {titoloH1}
        </Titolo>

        <form onSubmit={handleSearchModificata} className={styles.searchBarModificabile}>
            <CampoTesto
              id="servizio-risultati"
              name="servizio" // Assicurati che 'name' sia riconosciuto
              placeholder="Quale servizio cerchi?"
              value={servizioInput}
              onChange={(e) => setServizioInput(e.target.value)}
            />
            <CampoTesto
              id="localita-risultati"
              name="localita" // Assicurati che 'name' sia riconosciuto
              placeholder="Dove?"
              value={localitaInput}
              onChange={(e) => setLocalitaInput(e.target.value)}
            />
            <Bottone type="submit" variante="primario">Modifica Ricerca</Bottone>
        </form>

        <div className={styles.layoutContenuto}>
          <aside className={styles.colonnaFiltri}>
            <Titolo livello={2} className={styles.titoloFiltri}>Filtra Risultati</Titolo>
            
            {/* Sotto-categorie (UI statica per ora) */}
            <div className={styles.gruppoOpzioniFiltro}>
              <h3 className={styles.titoloGruppoFiltro}>Sotto-categorie</h3>
              {['Riparazioni urgenti', 'Installazioni', 'Manutenzione'].map(subCat => (
                <div key={subCat} className={styles.opzioneFiltro}>
                  <input type="checkbox" id={`subcat-${subCat}`} name="subcategoria" value={subCat} />
                  <label htmlFor={`subcat-${subCat}`}>{subCat}</label>
                </div>
              ))}
            </div>

            {/* Distanza (UI statica, non implementata nella logica) */}
            <div className={styles.gruppoOpzioniFiltro}>
              <h3 className={styles.titoloGruppoFiltro}>Distanza</h3>
              <select value={filtroDistanza} onChange={e => setFiltroDistanza(e.target.value)} style={{width: '100%', padding: '8px', fontSize: '15px'}}>
                <option value="">Entro...</option>
                <option value="5km">5 km</option>
                <option value="10km">10 km</option>
              </select>
            </div>

            {/* Valutazione media */}
            <div className={styles.gruppoOpzioniFiltro}>
              <h3 className={styles.titoloGruppoFiltro}>Valutazione media</h3>
              <select value={filtroValutazione} onChange={e => setFiltroValutazione(parseFloat(e.target.value))} style={{width: '100%', padding: '8px', fontSize: '15px'}}>
                <option value="0">Qualsiasi</option>
                <option value="4.5">4.5 stelle o più</option>
                <option value="4">4 stelle o più</option>
                <option value="3">3 stelle o più</option>
              </select>
            </div>
            
            {/* Disponibilità */}
            <div className={styles.gruppoOpzioniFiltro}>
              <h3 className={styles.titoloGruppoFiltro}>Disponibilità</h3>
              {['Weekend', 'Sera', 'Urgenze 24/7'].map(disp => (
                <div key={disp} className={styles.opzioneFiltro}>
                  <input type="checkbox" id={`disp-${disp}`} name="disponibilita" value={disp} 
                         checked={filtroDisponibilita.includes(disp)}
                         onChange={e => {
                           const {checked, value} = e.target;
                           setFiltroDisponibilita(prev => 
                             checked ? [...prev, value] : prev.filter(item => item !== value)
                           );
                         }}
                  />
                  <label htmlFor={`disp-${disp}`}>{disp}</label>
                </div>
              ))}
            </div>
            
            {/* Solo con portfolio */}
            <div className={styles.gruppoOpzioniFiltro}>
              <div className={styles.opzioneFiltro}>
                <input type="checkbox" id="solo-portfolio" checked={filtroPortfolio} onChange={e => setFiltroPortfolio(e.target.checked)} />
                <label htmlFor="solo-portfolio">Solo con portfolio</label>
              </div>
            </div>

            {/* Rimozione Bottone Applica Filtri se i filtri si applicano onChange */}
            {/* <Bottone onClick={handleApplicaFiltri} variante="primario" className={styles.bottoneApplicaFiltri}>Applica Filtri</Bottone> */}
            <Bottone onClick={handleResettaFiltri} variante="secondario" className={styles.bottoneResettaFiltri}>Resetta Filtri</Bottone>
          </aside>

          <main className={styles.colonnaRisultati}>
            <div className={styles.intestazioneRisultati}>
              <Paragrafo className={styles.numeroRisultatiInfo}>
                {numeroRisultati} {servizioDisplay}{numeroRisultati !== 1 ? 'i' : ''} trovat{numeroRisultati !== 1 ? 'i' : 'o'} {localitaDisplay}
              </Paragrafo>
              <div className={styles.controlliOrdinamentoEVista}>
                <select value={ordinamento} onChange={e => setOrdinamento(e.target.value)} style={{padding: '8px', fontSize: '15px'}}>
                  <option value="pertinenza">Ordina per: Pertinenza</option>
                  <option value="valutazione">Valutazione (dal più alto)</option>
                  <option value="recensioni">N. Recensioni (dal più alto)</option>
                  <option value="nome_asc">Nome (A-Z)</option>
                  <option value="nome_desc">Nome (Z-A)</option>
                </select>
                <div className={styles.toggleVista}>
                  <button onClick={() => setVistaAttiva('lista')} className={vistaAttiva === 'lista' ? styles.attivo : ''}>Lista</button>
                  <button onClick={() => setVistaAttiva('mappa')} className={vistaAttiva === 'mappa' ? styles.attivo : ''}>Mappa</button>
                </div>
              </div>
            </div>

            {vistaAttiva === 'lista' ? (
              risultatiVisualizzati.length > 0 ? (
                <div className={styles.professionistiGridRisultati}>
                  {risultatiVisualizzati.map(prof => (
                    <ProfessionalCard key={prof.id} {...prof} />
                  ))}
                </div>
              ) : (
                <Paragrafo>Nessun professionista trovato per i criteri selezionati. Prova ad allargare la ricerca o modificare i filtri.</Paragrafo>
              )
            ) : (
              <div className={styles.boxMappaPlaceholder}>
                <span className={styles.iconaMappaPlaceholder} aria-hidden="true">&#128205;</span> {/* Icona puntina mappa Unicode */}
                <Titolo livello={3} className={styles.titoloMappaPlaceholder}>Visualizzazione Mappa</Titolo>
                <Paragrafo className={styles.testoMappaPlaceholder}>
                  La funzionalità di mappa interattiva sarà disponibile prossimamente!
                </Paragrafo>
                <Paragrafo className={styles.testoMappaPlaceholderSub}>
                  Potrai vedere i professionisti localizzati direttamente qui e navigare nella tua zona.
                </Paragrafo>
              </div>
            )}

            {vistaAttiva === 'lista' && risultatiVisualizzati.length > 5 && ( 
              <div className={styles.paginazioneWrapper}>
                <Bottone variante="secondario">Carica Altri Risultati (mock)</Bottone>
              </div>
            )}
          </main>
        </div>
      </Contenitore>
    </div>
  );
};

export default PaginaRisultatiRicerca;
