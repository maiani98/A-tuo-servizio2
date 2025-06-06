import React, { useState, useEffect } from 'react';
import { Titolo, Paragrafo } from '../../../componenti/comuni/TestiTipografici/TestiTipografici';
import { Bottone } from '../../../componenti/comuni/Bottone/Bottone';
import styles from './PaginaGestioneDescrizione.module.css'; 
// Assumiamo che la slice utente o una slice profilo professionista esista
// import { useDispatch, useSelector } from 'react-redux'; 
// import { selectProfiloProfessionista, aggiornaDescrizioneProfessionista } from '../../../store/slices/profiloProfessionistaSlice';

const PaginaGestioneDescrizione: React.FC = () => {
  // const dispatch = useDispatch();
  // const profilo = useSelector(selectProfiloProfessionista); // Da implementare nello store
  
  // Stato mockato finché non c'è lo store completo
  const [descrizione, setDescrizione] = useState('');
  const [descrizioneOriginale, setDescrizioneOriginale] = useState('Caricamento descrizione...');
  const [messaggioSalvataggio, setMessaggioSalvataggio] = useState<string | null>(null);

  useEffect(() => {
    // Simula il caricamento della descrizione esistente
    // if (profilo && profilo.descrizioneLunga) {
    //   setDescrizione(profilo.descrizioneLunga);
    //   setDescrizioneOriginale(profilo.descrizioneLunga);
    // } else {
      // Dati mock se lo store non è implementato
      const mockDesc = "Sono un professionista con pluriennale esperienza nel mio settore, specializzato in soluzioni innovative e personalizzate per i miei clienti. La mia passione e dedizione mi guidano ogni giorno nel fornire servizi di alta qualità, puntando sempre alla massima soddisfazione del cliente. Contattatemi per scoprire come posso aiutarvi a realizzare i vostri progetti.";
      setDescrizione(mockDesc);
      setDescrizioneOriginale(mockDesc);
    // }
  }, [/* profilo */]); // Dipendenza dallo stato del profilo se si usa lo store

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessaggioSalvataggio(null);
    
    // Validazione (es. lunghezza minima/massima)
    if (descrizione.length < 50) {
      setMessaggioSalvataggio('La descrizione è troppo corta (minimo 50 caratteri).');
      return;
    }
    if (descrizione.length > 2000) {
      setMessaggioSalvataggio('La descrizione è troppo lunga (massimo 2000 caratteri).');
      return;
    }

    // Simula dispatch dell'azione di aggiornamento
    // dispatch(aggiornaDescrizioneProfessionista(descrizione));
    console.log('Descrizione aggiornata:', descrizione);
    setDescrizioneOriginale(descrizione); // Aggiorna il "DB" mock
    setMessaggioSalvataggio('Descrizione salvata con successo!');
    
    // Nasconde il messaggio dopo qualche secondo
    setTimeout(() => setMessaggioSalvataggio(null), 3000);
  };

  return (
    <div className={styles.contenitoreGestione}>
      <Titolo livello={2} className={styles.titoloSezione}>Modifica Descrizione "Chi Sono"</Titolo>
      <Paragrafo className={styles.infoSezione}>
        Questa descrizione apparirà sulla tua pagina profilo pubblica. Rendila accattivante e informativa.
      </Paragrafo>

      <form onSubmit={handleSubmit} className={styles.formDescrizione}>
        <div className={styles.campoForm}>
          <label htmlFor="descrizioneChiSono" className={styles.etichettaForm}>
            La tua descrizione (min 50, max 2000 caratteri):
          </label>
          <textarea
            id="descrizioneChiSono"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={10}
            minLength={50}
            maxLength={2000}
            className={styles.textareaDescrizione}
            aria-describedby="charCountDescrizione"
          />
          <small id="charCountDescrizione" className={styles.charCount}>
            Caratteri: {descrizione.length} / 2000
          </small>
        </div>

        {messaggioSalvataggio && (
          <Paragrafo className={descrizione === descrizioneOriginale ? styles.messaggioSuccesso : styles.messaggioErrore}>
            {messaggioSalvataggio}
          </Paragrafo>
        )}

        <Bottone 
          type="submit" 
          className={styles.bottoneSalva}
          disabled={descrizione === descrizioneOriginale} // Disabilita se non ci sono modifiche
        >
          Salva Descrizione
        </Bottone>
      </form>
    </div>
  );
};

export default PaginaGestioneDescrizione;
