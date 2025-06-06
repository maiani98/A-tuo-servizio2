import { configureStore } from '@reduxjs/toolkit';
// Importa qui i tuoi reducers, ad esempio:
import utenteReducer from './slices/utenteSlice'; // Modificato: importato utenteReducer

export const store = configureStore({
  reducer: {
    // Aggiungi qui i tuoi reducers:
    utente: utenteReducer, // Modificato: aggiunto utenteReducer
  },
});

// Esporta i tipi per lo stato RootState e per AppDispatch per usarli nell'applicazione
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
