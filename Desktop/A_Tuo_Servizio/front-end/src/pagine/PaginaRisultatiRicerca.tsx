import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './PaginaRisultatiRicerca.module.css';
import { Contenitore } from '../componenti/layout/Layout';
import { CampoTesto, CampoSelect, OpzioneSelect } from '../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../componenti/comuni/Bottone/Bottone';
import ProfessionalCard, { ProfessionalCardProps } from '../componenti/specifici/ProfessionalCard/ProfessionalCard';
import { Titolo, Paragrafo } from '../componenti/comuni/TestiTipografici/TestiTipografici';

const PaginaRisultatiRicerca: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [servizioRicerca, setServizioRicerca] = useState(searchParams.get('servizio') || '');
  const [localitaRicerca, setLocalitaRicerca] = useState(searchParams.get('localita') || '');
  
  const [mostraFiltri, setMostraFiltri] = useState(false);
  const [ordinamentoScelta, setOrdinamentoScelta] = useState('rilevanza');

  // Dati Mock per ProfessionalCard
  const risultatiMock: ProfessionalCardProps[] = [
    {
      idProfessionista: '101',
      nome: 'Elena Rossi',
      specializzazione: 'Idraulica Esperta',
      valutazioneMedia: 4.7,
      numeroRecensioni: 88,
      localita: 'Milano - Centro',
      distanza: '1.2km',
      tagline: 'Riparazioni idrauliche rapide e affidabili. Interventi urgenti 24/7.',
      badges: ['Pronto Intervento', 'Verificata'],
      onVediProfilo: (id) => navigate(`/profilo/${id}`),
    },
    {
      idProfessionista: '102',
      nome: 'Marco Verdi',
      specializzazione: 'Elettricista Qualificato',
      valutazioneMedia: 4.9,
      numeroRecensioni: 152,
      localita: 'Milano - Isola',
      tagline: 'Impianti elettrici civili e industriali. Massima sicurezza e certificazione.',
      badges: ['Certificato', 'Preventivo Gratuito'],
      onVediProfilo: (id) => navigate(`/profilo/${id}`),
    },
    {
      idProfessionista: '103',
      nome: 'Sofia Neri',
      specializzazione: 'Imbianchina Creativa',
      valutazioneMedia: 4.5,
      numeroRecensioni: 67,
      localita: 'Milano - Navigli',
      distanza: '3.5km',
      tagline: 'Decorazioni d\'interni, tinteggiature e stucchi. Consulenza personalizzata.',
      onVediProfilo: (id) => navigate(`/profilo/${id}`),
    },
     {
      idProfessionista: '104',
      nome: 'Giovanni Gialli',
      specializzazione: 'Idraulico',
      valutazioneMedia: 4.2,
      numeroRecensioni: 45,
      localita: 'Milano - Città Studi',
      distanza: '2.8km',
      tagline: 'Manutenzione impianti idraulici e riparazioni perdite. Prezzi competitivi.',
      badges: ['Preventivo Gratuito'],
      onVediProfilo: (id) => navigate(`/profilo/${id}`),
    },
  ];
  
  // Aggiorna i campi di ricerca se i searchParams cambiano (es. navigazione avanti/indietro del browser)
  useEffect(() => {
    setServizioRicerca(searchParams.get('servizio') || '');
    setLocalitaRicerca(searchParams.get('localita') || '');
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams({ servizio: servizioRicerca, localita: localitaRicerca });
    // La navigazione effettiva o il refetch dei dati avverrebbe qui o in un useEffect che ascolta i searchParams
  };

  const opzioniOrdinamento: OpzioneSelect[] = [
    { valore: 'rilevanza', etichetta: 'Rilevanza' },
    { valore: 'valutazione', etichetta: 'Valutazione (dal migliore)' },
    { valore: 'distanza', etichetta: 'Distanza (dal più vicino)' },
  ];

  return (
    <Contenitore className={styles.paginaRisultatiWrapper} padding="1rem"> {/* Padding ridotto per la pagina */}
      {/* Barra di Ricerca Modificabile */}
      <form className={styles.searchBarPagina} onSubmit={handleSearchSubmit}>
        <CampoTesto
          name="servizioPagina"
          placeholder="Servizio o professionista..."
          value={servizioRicerca}
          onChange={(e) => setServizioRicerca(e.target.value)}
          className={styles.campoRicercaServizioPagina}
        />
        <CampoTesto
          name="localitaPagina"
          placeholder="Località (es. CAP, città)"
          value={localitaRicerca}
          onChange={(e) => setLocalitaRicerca(e.target.value)}
          className={styles.campoRicercaLocalitaPagina}
        />
        <Bottone type="submit" variante="primario" className={styles.bottoneRicercaPagina}>
          Cerca
        </Bottone>
      </form>

      {/* Area Titolo Risultati e Controlli */}
      <div className={styles.controlliRicerca}>
        <Paragrafo className={styles.infoRisultati}>
          {risultatiMock.length} professionisti trovati 
          {servizioRicerca && <> per "<strong>{servizioRicerca}</strong>"</>}
          {localitaRicerca && <> in "<strong>{localitaRicerca}</strong>"</>}
        </Paragrafo>
        <div className={styles.azioniControlli}>
          <Bottone variante="secondario" onClick={() => setMostraFiltri(!mostraFiltri)}>
            {mostraFiltri ? 'Nascondi Filtri' : 'Mostra Filtri'} ({/* Placeholder per numero filtri attivi */ 0})
          </Bottone>
          <CampoSelect
            name="ordinamento"
            opzioni={opzioniOrdinamento}
            value={ordinamentoScelta}
            onChange={(e) => setOrdinamentoScelta(e.target.value)}
            className={styles.selectOrdinamento}
          />
          {/* Placeholder per Toggle Lista/Mappa */}
          {/* <div className={styles.toggleVista}>[Toggle Lista/Mappa]</div> */}
        </div>
      </div>

      {/* Layout Principale */}
      <div className={styles.layoutContenuto}>
        {/* Pannello Filtri */}
        {mostraFiltri && (
          <aside className={styles.pannelloFiltri}>
            <Titolo livello={3} className={styles.titoloFiltri}>Filtri</Titolo>
            <Paragrafo>Opzioni filtro qui...</Paragrafo>
            {/* Esempio di filtri (da implementare) */}
            <div className={styles.gruppoFiltro}>
              <Titolo livello={3} className={styles.titoloGruppoFiltro}>Distanza Massima</Titolo>
              {/* Range slider o select */}
            </div>
            <div className={styles.gruppoFiltro}>
              <Titolo livello={3} className={styles.titoloGruppoFiltro}>Valutazione Minima</Titolo>
              {/* Stelle selezionabili o select */}
            </div>
            <div className={styles.gruppoFiltro}>
              <Titolo livello={3} className={styles.titoloGruppoFiltro}>Disponibilità</Titolo>
              {/* Checkbox (es. "Weekend", "Urgente") */}
            </div>
            <Bottone variante="primario" className={styles.bottoneApplicaFiltri}>
              Applica Filtri
            </Bottone>
          </aside>
        )}

        {/* Area Risultati */}
        <section className={styles.areaRisultati}>
          {risultatiMock.length === 0 ? (
            <Paragrafo className={styles.nessunRisultato}>
              Nessun risultato trovato per la tua ricerca. Prova a modificare i criteri.
            </Paragrafo>
          ) : (
            <div className={styles.listaCards}>
              {risultatiMock.map((professionista) => (
                <ProfessionalCard key={professionista.idProfessionista} {...professionista} />
              ))}
            </div>
          )}
          {risultatiMock.length > 0 && ( /* Mostra solo se ci sono risultati */
            <Bottone variante="secondario" className={styles.bottoneCaricaAltro}>
              Carica altri risultati
            </Bottone>
          )}
        </section>
      </div>
    </Contenitore>
  );
};

export default PaginaRisultatiRicerca;
