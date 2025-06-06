import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store'; // Assumendo che RootState sia definito nello store principale

// Definisci Interfaccia per lo Stato Utente
interface Utente {
  id: string | null;
  nome: string | null;
  email: string | null;
}

interface StatoUtente {
  utente: Utente | null;
  token: string | null;
  isAuthenticated: boolean;
  caricamento: boolean;
  errore: string | null;
}

// Definisci Stato Iniziale
const statoIniziale: StatoUtente = {
  utente: null,
  token: null,
  isAuthenticated: false,
  caricamento: false,
  errore: null,
};

export const utenteSlice = createSlice({
  name: 'utente',
  initialState: statoIniziale,
  reducers: {
    loginRichiesta: (state) => {
      state.caricamento = true;
      state.errore = null;
      state.isAuthenticated = false; // Assicura che non sia autenticato durante la richiesta
      state.utente = null;
      state.token = null;
    },
    loginSuccesso: (state, action: PayloadAction<{ utente: Utente, token: string }>) => {
      state.utente = action.payload.utente;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.caricamento = false;
      state.errore = null;
      // In un'app reale, potresti salvare il token in localStorage qui
      // localStorage.setItem('token', action.payload.token);
    },
    loginFallito: (state, action: PayloadAction<string>) => {
      state.utente = null;
      state.token = null;
      state.isAuthenticated = false;
      state.caricamento = false;
      state.errore = action.payload;
      // In un'app reale, potresti rimuovere il token da localStorage qui
      // localStorage.removeItem('token');
    },
    registrazioneRichiesta: (state) => {
      state.caricamento = true;
      state.errore = null;
    },
    registrazioneSuccesso: (state) => { // Potrebbe non modificare lo stato direttamente se seguita da login
      state.caricamento = false;
      // In genere, dopo la registrazione, si fa il login, quindi loginSuccesso gestirà lo stato.
      // Se si vuole un messaggio di successo specifico per la registrazione, si può aggiungere uno stato apposito.
    },
    registrazioneFallita: (state, action: PayloadAction<string>) => {
      state.caricamento = false;
      state.errore = action.payload;
    },
    logout: (state) => {
      state.utente = null;
      state.token = null;
      state.isAuthenticated = false;
      state.caricamento = false;
      state.errore = null;
      // In un'app reale, potresti rimuovere il token da localStorage qui
      // localStorage.removeItem('token');
    },
  },
});

// Esporta le Azioni e il Reducer
export const {
  loginRichiesta,
  loginSuccesso,
  loginFallito,
  registrazioneRichiesta,
  registrazioneSuccesso,
  registrazioneFallita,
  logout
} = utenteSlice.actions;

export default utenteSlice.reducer;

// Selettori (Opzionale ma raccomandato)
// Nota: L'import di RootState è già presente all'inizio del file.
export const selectUtenteCorrente = (state: RootState) => state.utente.utente;
export const selectIsAuthenticated = (state: RootState) => state.utente.isAuthenticated;
export const selectTokenUtente = (state: RootState) => state.utente.token;
export const selectCaricamentoUtente = (state: RootState) => state.utente.caricamento;
export const selectErroreUtente = (state: RootState) => state.utente.errore;
