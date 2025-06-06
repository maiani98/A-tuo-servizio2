import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './stili/globale.css' // Modificato: Importa globale.css invece di index.css
import { Provider } from 'react-redux';
import { store } from './store/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
