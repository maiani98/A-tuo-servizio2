import React, { useState, useEffect } from 'react';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { CampoTesto } from '../../../componenti/comuni/CampiInput/CampiInput';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import styles from './PaginaGestioneServizi.module.css'; // Creeremo questo file

// Interfaccia per i dati di un singolo servizio offerto
// Idealmente, questa interfaccia sarebbe importata da un file di tipi condiviso
export interface ServizioDati {
  id: string;
  nome: string;
  descrizione: string;
  prezzoIndicativo?: string;
}

const PaginaGestioneServizi: React.FC = () => {
  const [servizi, setServizi] = useState<ServizioDati[]>([]);
  const [mostraFormServizio, setMostraFormServizio] = useState(false);
  const [servizioInModifica, setServizioInModifica] = useState<ServizioDati | null>(null);

  // Stati per i campi del form
  const [nomeServizio, setNomeServizio] = useState('');
  const [descrizioneServizio, setDescrizioneServizio] = useState('');
  const [prezzoServizio, setPrezzoServizio] = useState('');
  const [erroreForm, setErroreForm] = useState<string | null>(null);

  // Dati mock iniziali (simula caricamento da API)
  useEffect(() => {
    setServizi([
      { id: 's101', nome: 'Consulenza Idraulica Base', descrizione: 'Valutazione impianto e preventivo dettagliato.', prezzoIndicativo: 'Gratuita' },
      { id: 's102', nome: 'Riparazione Perdite Minori', descrizione: 'Riparazione di piccole perdite su rubinetti e sifoni.', prezzoIndicativo: 'Da 50€' },
      { id: 's103', nome: 'Installazione Box Doccia', descrizione: 'Montaggio completo di box doccia standard.', prezzoIndicativo: 'Da 150€' },
    ]);
  }, []);

  const handleOpenForm = (servizio?: ServizioDati) => {
    setErroreForm(null);
    if (servizio) {
      setServizioInModifica(servizio);
      setNomeServizio(servizio.nome);
      setDescrizioneServizio(servizio.descrizione);
      setPrezzoServizio(servizio.prezzoIndicativo || '');
    } else {
      setServizioInModifica(null);
      setNomeServizio('');
      setDescrizioneServizio('');
      setPrezzoServizio('');
    }
    setMostraFormServizio(true);
  };

  const handleCloseForm = () => {
    setMostraFormServizio(false);
    setServizioInModifica(null);
    setNomeServizio('');
    setDescrizioneServizio('');
    setPrezzoServizio('');
    setErroreForm(null);
  };

  const handleSubmitServizio = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroreForm(null);

    if (!nomeServizio || !descrizioneServizio) {
      setErroreForm('Nome e descrizione del servizio sono obbligatori.');
      return;
    }

    const datiServizioCorrente: ServizioDati = {
      id: servizioInModifica ? servizioInModifica.id : Date.now().toString(),
      nome: nomeServizio,
      descrizione: descrizioneServizio,
      prezzoIndicativo: prezzoServizio || undefined,
    };

    if (servizioInModifica) {
      setServizi(servizi.map(s => s.id === datiServizioCorrente.id ? datiServizioCorrente : s));
      console.log('Servizio aggiornato:', datiServizioCorrente);
    } else {
      setServizi([...servizi, datiServizioCorrente]);
      console.log('Nuovo servizio aggiunto:', datiServizioCorrente);
    }
    handleCloseForm();
  };

  const handleEliminaServizio = (idServizio: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo servizio?')) {
      setServizi(servizi.filter(s => s.id !== idServizio));
      console.log('Servizio eliminato:', idServizio);
    }
  };

  return (
    <div className={styles.contenitoreGestione}>
      <div className={styles.headerSezione}>
        <Titolo livello={2}>Gestisci i Tuoi Servizi</Titolo>
        <Bottone onClick={() => handleOpenForm()}>Aggiungi Nuovo Servizio</Bottone>
      </div>

      {mostraFormServizio && (
        <div className={styles.formServizioContenitore}> {/* Potrebbe essere un modale in futuro */}
          <Titolo livello={3} className={styles.titoloForm}>
            {servizioInModifica ? 'Modifica Servizio' : 'Aggiungi Nuovo Servizio'}
          </Titolo>
          <form onSubmit={handleSubmitServizio} className={styles.formServizio}>
            {erroreForm && <Paragrafo className={styles.messaggioErroreForm}>{erroreForm}</Paragrafo>}
            <CampoTesto
              etichetta="Nome Servizio"
              name="nomeServizio"
              value={nomeServizio}
              onChange={(e) => setNomeServizio(e.target.value)}
              required
              placeholder="Es. Riparazione Rubinetto"
            />
             <div> {/* Wrapper per textarea e label, simile a PaginaGestionePortfolio */}
                <label htmlFor="descrizioneServizio" className={styles.etichettaTextarea}>Descrizione Servizio</label>
                <textarea
                    id="descrizioneServizio"
                    name="descrizioneServizio"
                    value={descrizioneServizio}
                    onChange={(e) => setDescrizioneServizio(e.target.value)}
                    required
                    rows={4}
                    placeholder="Descrivi cosa include il servizio..."
                    className={styles.textareaInput} 
                />
            </div>
            <CampoTesto
              etichetta="Prezzo Indicativo (Opzionale)"
              name="prezzoServizio"
              value={prezzoServizio}
              onChange={(e) => setPrezzoServizio(e.target.value)}
              placeholder="Es. A partire da €X, €X/ora"
            />
            <div className={styles.bottoniFormServizio}>
              <Bottone type="submit" variante="primario">
                {servizioInModifica ? 'Salva Modifiche' : 'Aggiungi Servizio'}
              </Bottone>
              <Bottone type="button" variante="secondario" onClick={handleCloseForm}>
                Annulla
              </Bottone>
            </div>
          </form>
        </div>
      )}

      <div className={styles.elencoServizi}>
        {servizi.length === 0 && !mostraFormServizio ? (
          <Paragrafo className={styles.messaggioNessunServizio}>
            Nessun servizio ancora aggiunto. Clicca su "Aggiungi Nuovo Servizio" per iniziare.
          </Paragrafo>
        ) : (
          servizi.map((servizio) => (
            <div key={servizio.id} className={styles.cardServizio}>
              <div className={styles.infoServizio}>
                <h5 className={styles.nomeServizioCard}>{servizio.nome}</h5>
                <Paragrafo className={styles.descrizioneServizioCard}>{servizio.descrizione}</Paragrafo>
                {servizio.prezzoIndicativo && (
                  <Paragrafo className={styles.prezzoServizioCard}>Prezzo: {servizio.prezzoIndicativo}</Paragrafo>
                )}
              </div>
              <div className={styles.azioniCardServizio}>
                <Bottone variante="secondario" onClick={() => handleOpenForm(servizio)}>Modifica</Bottone>
                <Bottone variante="distruttivo" onClick={() => handleEliminaServizio(servizio.id)}>Elimina</Bottone>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaginaGestioneServizi;
