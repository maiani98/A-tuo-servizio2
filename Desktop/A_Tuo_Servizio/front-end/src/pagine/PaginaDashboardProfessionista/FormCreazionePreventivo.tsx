import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './FormCreazionePreventivo.module.css';
import { Titolo, Paragrafo } from '../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../componenti/comuni/Bottone/Bottone';
import { CampoTesto } from '../../componenti/comuni/CampiInput/CampiInput'; // Assuming this can be used for various input types

// Mock data for the request (simulating fetching based on idRichiesta)
const mockRichieste = [
  { 
    id: 'prev001', 
    tipoServizio: 'Riparazione Idraulica Urgente', 
    descrizioneProblema: 'Perdita d\'acqua dal rubinetto della cucina...',
    nomeCliente: 'Mario Rossi',
  },
  // Add other requests if needed
];

interface VoceCosto {
  id: string;
  descrizione: string;
  quantita: number;
  prezzoUnitario: number;
  totaleVoce: number;
}

const FormCreazionePreventivo: React.FC = () => {
  const { idRichiesta } = useParams<{ idRichiesta: string }>();
  const navigate = useNavigate();

  const [richiestaOriginale, setRichiestaOriginale] = useState<any>(null);
  
  // Form fields
  const [descrizioneLavoro, setDescrizioneLavoro] = useState('');
  const [vociCosto, setVociCosto] = useState<VoceCosto[]>([]);
  const [scontoPercentuale, setScontoPercentuale] = useState<number>(0);
  const [validitaPreventivo, setValiditaPreventivo] = useState(''); // e.g., "30 giorni"
  const [tempiRealizzazione, setTempiRealizzazione] = useState(''); // e.g., "5 giorni lavorativi"
  const [terminiPagamento, setTerminiPagamento] = useState(''); // e.g., "Bonifico bancario 30gg data fattura"
  const [allegati, setAllegati] = useState<File[]>([]);
  
  // Calculated fields
  const [subtotale, setSubtotale] = useState<number>(0);
  const [importoSconto, setImportoSconto] = useState<number>(0);
  const [totalePreventivo, setTotalePreventivo] = useState<number>(0);

  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching request details
    const req = mockRichieste.find(r => r.id === idRichiesta);
    if (req) {
      setRichiestaOriginale(req);
      // Pre-fill some fields if desired
      // setDescrizioneLavoro(`Intervento per ${req.tipoServizio}.`);
    } else {
      setErrore('Richiesta originale non trovata.');
    }
  }, [idRichiesta]);

  const calcolaTotali = useCallback(() => {
    const currentSubtotale = vociCosto.reduce((sum, voce) => sum + voce.totaleVoce, 0);
    setSubtotale(currentSubtotale);
    
    const currentImportoSconto = (currentSubtotale * scontoPercentuale) / 100;
    setImportoSconto(currentImportoSconto);
    
    setTotalePreventivo(currentSubtotale - currentImportoSconto);
  }, [vociCosto, scontoPercentuale]);

  useEffect(() => {
    calcolaTotali();
  }, [vociCosto, scontoPercentuale, calcolaTotali]);

  const aggiungiVoceCosto = () => {
    setVociCosto([
      ...vociCosto,
      { id: `voce-${Date.now()}`, descrizione: '', quantita: 1, prezzoUnitario: 0, totaleVoce: 0 }
    ]);
  };

  const rimuoviVoceCosto = (idVoce: string) => {
    setVociCosto(vociCosto.filter(voce => voce.id !== idVoce));
  };

  const handleVoceCostoChange = (idVoce: string, campo: keyof VoceCosto, valore: string | number) => {
    setVociCosto(vociCosto.map(voce => {
      if (voce.id === idVoce) {
        const updatedVoce = { ...voce, [campo]: valore };
        if (campo === 'quantita' || campo === 'prezzoUnitario') {
          updatedVoce.totaleVoce = Number(updatedVoce.quantita) * Number(updatedVoce.prezzoUnitario);
        }
        return updatedVoce;
      }
      return voce;
    }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAllegati(Array.from(event.target.files));
    }
  };

  const handleInviaPreventivo = (event: React.FormEvent) => {
    event.preventDefault();
    setErrore(null);
    if (!descrizioneLavoro || vociCosto.length === 0 || !validitaPreventivo || !tempiRealizzazione || !terminiPagamento) {
      setErrore('Compilare tutti i campi obbligatori (Descrizione, Voci di costo, Validità, Tempi, Termini).');
      return;
    }
    // Logica di invio (mock)
    console.log('Preventivo da inviare:', {
      idRichiesta,
      descrizioneLavoro,
      vociCosto,
      subtotale,
      scontoPercentuale,
      importoSconto,
      totalePreventivo,
      validitaPreventivo,
      tempiRealizzazione,
      terminiPagamento,
      allegatiNames: allegati.map(f => f.name),
    });
    alert(`Preventivo per richiesta ${idRichiesta} inviato (simulazione). Totale: ${totalePreventivo.toFixed(2)}€`);
    navigate(`/dashboard/professionista/richieste/${idRichiesta}`);
  };

  const handleSalvaBozza = () => {
    // Logica di salvataggio bozza (mock)
    console.log('Bozza preventivo salvata:', { idRichiesta, descrizioneLavoro /* ...altri dati */ });
    alert(`Bozza del preventivo per ${idRichiesta} salvata (simulazione).`);
    // Potrebbe rimanere sulla pagina o navigare altrove
  };

  if (errore && !richiestaOriginale) {
    return <div className={styles.container}><Paragrafo className={styles.errore}>{errore}</Paragrafo></div>;
  }
  
  return (
    <div className={styles.container}>
      <Titolo livello={2} className={styles.titoloPagina}>
        Crea Preventivo per Richiesta {idRichiesta}
      </Titolo>
      
      {richiestaOriginale && (
        <div className={styles.riepilogoRichiesta}>
          <Titolo livello={4}>Riepilogo Richiesta Cliente ({richiestaOriginale.nomeCliente})</Titolo>
          <Paragrafo><strong>Servizio:</strong> {richiestaOriginale.tipoServizio}</Paragrafo>
          <Paragrafo><strong>Descrizione:</strong> {richiestaOriginale.descrizioneProblema}</Paragrafo>
        </div>
      )}

      <form onSubmit={handleInviaPreventivo} className={styles.formPreventivo}>
        <div className={styles.sezioneForm}>
          <label htmlFor="descrizioneLavoro" className={styles.label}>Descrizione Lavoro Dettagliata *</label>
          <textarea
            id="descrizioneLavoro"
            value={descrizioneLavoro}
            onChange={(e) => setDescrizioneLavoro(e.target.value)}
            rows={5}
            className={styles.textarea}
            required
          />
        </div>

        <div className={styles.sezioneForm}>
          <Titolo livello={4} className={styles.sottotitoloSezione}>Voci di Costo *</Titolo>
          {vociCosto.map((voce, index) => (
            <div key={voce.id} className={styles.rigaVoceCosto}>
              <CampoTesto
                etichetta={`Descrizione Voce ${index + 1}`}
                name={`descVoce-${voce.id}`}
                value={voce.descrizione}
                onChange={(e) => handleVoceCostoChange(voce.id, 'descrizione', e.target.value)}
                placeholder="Es. Materiale, Manodopera, Consulenza"
                className={styles.inputVoceDesc}
                required
              />
              <CampoTesto
                etichetta="Qtà"
                type="number"
                name={`qtaVoce-${voce.id}`}
                value={voce.quantita.toString()}
                onChange={(e) => handleVoceCostoChange(voce.id, 'quantita', parseFloat(e.target.value) || 0)}
                min="0"
                step="any"
                className={styles.inputVoceNum}
                required
              />
              <CampoTesto
                etichetta="€/Unità"
                type="number"
                name={`prezzoVoce-${voce.id}`}
                value={voce.prezzoUnitario.toString()}
                onChange={(e) => handleVoceCostoChange(voce.id, 'prezzoUnitario', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={styles.inputVoceNum}
                required
              />
              <div className={styles.totaleVoceRiga}>
                Subtotale: {voce.totaleVoce.toFixed(2)} €
              </div>
              <Bottone type="button" onClick={() => rimuoviVoceCosto(voce.id)} variante="pericolo" piccola outline className={styles.bottoneRemoveVoce}>
                Rimuovi
              </Bottone>
            </div>
          ))}
          <Bottone type="button" onClick={aggiungiVoceCosto} variante="secondario" className={styles.bottoneAddVoce}>
            Aggiungi Voce di Costo
          </Bottone>
        </div>

        <div className={styles.sezioneCalcoli}>
          <div className={styles.rigaCalcolo}>
            <Paragrafo>Subtotale: <strong>{subtotale.toFixed(2)} €</strong></Paragrafo>
          </div>
          <div className={styles.rigaCalcolo}>
            <label htmlFor="scontoPercentuale" className={styles.label}>Sconto (%):</label>
            <CampoTesto
              type="number"
              id="scontoPercentuale"
              value={scontoPercentuale.toString()}
              onChange={(e) => setScontoPercentuale(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              className={styles.inputSconto}
            />
            <Paragrafo>Importo Sconto: <strong>{importoSconto.toFixed(2)} €</strong></Paragrafo>
          </div>
          <div className={styles.rigaCalcoloTotale}>
            <Titolo livello={3}>Totale Preventivo: <strong>{totalePreventivo.toFixed(2)} €</strong></Titolo>
          </div>
        </div>

        <div className={styles.sezioneForm}>
          <CampoTesto
            etichetta="Validità Preventivo (es. 30 giorni) *"
            name="validitaPreventivo"
            value={validitaPreventivo}
            onChange={(e) => setValiditaPreventivo(e.target.value)}
            required
          />
        </div>
        <div className={styles.sezioneForm}>
          <CampoTesto
            etichetta="Tempi di Realizzazione Stimati *"
            name="tempiRealizzazione"
            value={tempiRealizzazione}
            onChange={(e) => setTempiRealizzazione(e.target.value)}
            placeholder="Es. 5-7 giorni lavorativi dall'accettazione"
            required
          />
        </div>
        <div className={styles.sezioneForm}>
          <label htmlFor="terminiPagamento" className={styles.label}>Termini e Condizioni di Pagamento *</label>
          <textarea
            id="terminiPagamento"
            value={terminiPagamento}
            onChange={(e) => setTerminiPagamento(e.target.value)}
            rows={4}
            className={styles.textarea}
            placeholder="Es. 50% acconto, saldo alla consegna. Bonifico bancario."
            required
          />
        </div>
        
        <div className={styles.sezioneForm}>
          <label htmlFor="allegati" className={styles.label}>Allegati (Opzionale)</label>
          <input 
            type="file" 
            id="allegati" 
            multiple 
            onChange={handleFileChange} 
            className={styles.inputFile}
          />
          {allegati.length > 0 && (
            <ul className={styles.listaAllegatiFiles}>
              {allegati.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
            </ul>
          )}
        </div>

        {errore && <Paragrafo className={styles.errore}>{errore}</Paragrafo>}

        <div className={styles.azioniFinali}>
          <Bottone type="submit" variante="primario">
            Invia Preventivo
          </Bottone>
          <Bottone type="button" onClick={handleSalvaBozza} variante="secondario">
            Salva Bozza
          </Bottone>
          <Link to={`/dashboard/professionista/richieste/${idRichiesta || ''}`} className={styles.linkAnnulla}>
            <Bottone variante="terziario">Annulla</Bottone>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default FormCreazionePreventivo;
