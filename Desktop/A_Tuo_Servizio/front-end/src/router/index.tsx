import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PaginaHomepage from '../pagine/PaginaHomepage/PaginaHomepage'; // Rinominato e spostato
import PaginaRisultatiRicerca from '../pagine/PaginaRisultatiRicerca/PaginaRisultatiRicerca'; // Spostato
import PaginaProfiloProfessionista from '../pagine/PaginaProfiloProfessionista/PaginaProfiloProfessionista';
import PaginaLogin from '../pagine/PaginaLogin/PaginaLogin'; // Aggiornato percorso
import PaginaRegistrazione from '../pagine/PaginaRegistrazione/PaginaRegistrazione'; // Aggiornato percorso
import PaginaDashboardProfessionista from '../pagine/PaginaDashboardProfessionista/PaginaDashboardProfessionista'; // Assicurati che il percorso sia corretto
import PaginaOnboardingProfessionista from '../pagine/PaginaOnboardingProfessionista/PaginaOnboardingProfessionista';
import PaginaGestionePortfolio from '../pagine/PaginaDashboardProfessionista/PaginaGestionePortfolio'; // Nuova importazione
import PaginaDashboardCliente from '../pagine/PaginaDashboardCliente/PaginaDashboardCliente'; // Importazione per Dashboard Cliente
import DashboardClienteSezionePlaceholder from '../pagine/PaginaDashboardCliente/DashboardClienteSezionePlaceholder'; // Importazione Placeholder
import DashboardClientePanoramica from '../pagine/PaginaDashboardCliente/DashboardClientePanoramica'; // Importazione per Panoramica Dashboard Cliente
import DashboardClienteRichieste from '../pagine/PaginaDashboardCliente/DashboardClienteRichieste'; // Importazione per Richieste Dashboard Cliente
import DashboardClienteDettaglioRichiesta from '../pagine/PaginaDashboardCliente/DashboardClienteDettaglioRichiesta'; // Importazione per Dettaglio Richiesta
import DashboardClienteAppuntamenti from '../pagine/PaginaDashboardCliente/DashboardClienteAppuntamenti'; // Importazione per Appuntamenti Dashboard Cliente
import DashboardClienteDettaglioAppuntamento from '../pagine/PaginaDashboardCliente/DashboardClienteDettaglioAppuntamento'; // Importazione per Dettaglio Appuntamento
import DashboardClienteMessaggi from '../pagine/PaginaDashboardCliente/DashboardClienteMessaggi'; // Importazione per Messaggi Dashboard Cliente
// import PaginaChatPlaceholder from '../pagine/PaginaChat/PaginaChatPlaceholder'; // Rimosso Placeholder
import ChatAttiva from '../pagine/PaginaDashboardCliente/ChatAttiva'; // Importazione per ChatAttiva
import DashboardClientePreferiti from '../pagine/PaginaDashboardCliente/DashboardClientePreferiti'; // Importazione per Preferiti Dashboard Cliente
import DashboardClienteImpostazioni from '../pagine/PaginaDashboardCliente/DashboardClienteImpostazioni'; // Importazione per Impostazioni Dashboard Cliente
import PaginaInvioRecensione from '../pagine/PaginaInvioRecensione/PaginaInvioRecensione'; // Importazione per PaginaInvioRecensione
import PaginaBenvenuto from '../pagine/PaginaBenvenuto/PaginaBenvenuto'; // Importazione per la nuova pagina
import PaginaOpzioniAccesso from '../pagine/PaginaOpzioniAccesso/PaginaOpzioniAccesso'; // Importazione per PaginaOpzioniAccesso
import PaginaSelezioneRuolo from '../pagine/PaginaSelezioneRuolo/PaginaSelezioneRuolo'; // Importazione per PaginaSelezioneRuolo
import PaginaAttesaVerificaEmail from '../pagine/PaginaAttesaVerificaEmail/PaginaAttesaVerificaEmail'; // Importazione per PaginaAttesaVerificaEmail
import PaginaEmailVerificata from '../pagine/PaginaEmailVerificata/PaginaEmailVerificata'; // Importazione per PaginaEmailVerificata
import PaginaRichiestaResetPassword from '../pagine/PaginaRichiestaResetPassword/PaginaRichiestaResetPassword'; // Importazione per PaginaRichiestaResetPassword
import PaginaResetPassword from '../pagine/PaginaResetPassword/PaginaResetPassword'; // Importazione per PaginaResetPassword

// Si assume che App.tsx (o un componente simile) fornisca il layout generale (Header, Footer)
// e contenga un <Outlet /> implicito se queste route sono figlie di una route radice con layout.
// Per come è strutturato attualmente, ogni 'element' di primo livello è una pagina completa.
// Per avere Header e Footer persistenti, la struttura di createBrowserRouter dovrebbe avere una route radice
// con un 'element' che contiene Header, Footer e <Outlet />, e tutte le altre route come 'children'.
// Dato che PaginaDashboardProfessionista.tsx è stato creato con <Outlet />, può avere figli.

const router = createBrowserRouter([
  {
    path: '/',
    // Se si volesse un layout globale (Header/Footer) per tutte le pagine,
    // questo path '/' dovrebbe avere un `element` con <Header />, <Outlet />, <Footer />
    // e tutte le altre route (HomePage, login, etc.) sarebbero children di esso.
    // Per ora, manteniamo la struttura esistente e PaginaDashboardProfessionista gestirà il suo layout interno.
    children: [
      {
        index: true,
        element: <PaginaHomepage />, // Aggiornato qui
      },
      {
        path: 'risultati-ricerca',
        element: <PaginaRisultatiRicerca />,
      },
      {
        path: 'profilo/:idProfessionista',
        element: <PaginaProfiloProfessionista />,
      },
      {
        path: 'login',
        element: <PaginaLogin />,
      },
      {
        path: 'registrazione',
        element: <PaginaRegistrazione />,
      },
      {
        path: 'dashboard-professionista',
        element: <PaginaDashboardProfessionista />, // Questo componente ha <Outlet />
        children: [
          // { index: true, element: <DashboardPanoramica /> }, // Esempio: contenuto default per /dashboard-professionista
          { 
            path: 'portfolio', // Relativo a /dashboard-professionista
            element: <PaginaGestionePortfolio /> 
          },
          // Qui potrebbero essere aggiunte altre route figlie per il dashboard, es:
          // { path: 'profilo', element: <PaginaGestioneProfiloProfessionista /> },
          // { path: 'servizi', element: <PaginaGestioneServizi /> },
        ]
      },
      {
        path: 'onboarding-professionista', 
        element: <PaginaOnboardingProfessionista />,
      },
      {
        path: 'benvenuto', // Nuova route per la Pagina Benvenuto
        element: <PaginaBenvenuto />,
      },
      {
        path: 'opzioni-accesso', // Nuova route per la Pagina Opzioni Accesso
        element: <PaginaOpzioniAccesso />,
      },
      {
        path: 'selezione-ruolo', // Nuova route per la Pagina Selezione Ruolo
        element: <PaginaSelezioneRuolo />,
      },
      {
        path: 'attendi-verifica-email',
        element: <PaginaAttesaVerificaEmail />,
      },
      {
        path: 'email-verificata', // In un'app reale, potrebbe essere /verifica-email/:token
        element: <PaginaEmailVerificata />,
      },
      {
        path: 'richiesta-reset-password',
        element: <PaginaRichiestaResetPassword />,
      },
      {
        path: 'reset-password', // Potrebbe essere anche /reset-password/:token
        element: <PaginaResetPassword />,
      },
      {
        path: 'dashboard-cliente',
        element: <PaginaDashboardCliente />,
        children: [
          { index: true, element: <DashboardClientePanoramica /> }, 
          { 
            path: 'richieste', 
            // element: <DashboardClienteRichieste /> // Questo diventerà un Outlet se richieste ha figli, o rimane così
            children: [
                { index: true, element: <DashboardClienteRichieste /> },
                { path: ':idRichiesta', element: <DashboardClienteDettaglioRichiesta /> }
            ]
          }, 
          { 
            path: 'appuntamenti',
            children: [
              { index: true, element: <DashboardClienteAppuntamenti /> },
              { path: ':idAppuntamento', element: <DashboardClienteDettaglioAppuntamento /> }
            ]
          },
          { 
            path: 'messaggi', 
            element: <DashboardClienteMessaggi />,
            children: [
              // Potrebbe avere una route index per mostrare il placeholder o la prima chat se nessuna è selezionata dall'URL
              // { index: true, element: <ChatAttiva /> }, // Se si vuole una chat di default o un placeholder interno a ChatAttiva
              { path: ':idConversazione', element: <ChatAttiva /> } 
            ]
          },
          { path: 'preferiti', element: <DashboardClientePreferiti /> }, 
          { path: 'impostazioni', element: <DashboardClienteImpostazioni /> }, 
        ]
      },
      {
        path: '/scrivi-recensione/:idProfessionista', // Route di primo livello
        element: <PaginaInvioRecensione />,
      }
    ],
  },
  // Puoi aggiungere qui altre route di primo livello se necessario (es. per una pagina 404)
  // {
  //   path: '*',
  //   element: <PaginaNotFound />, // Componente da creare per la pagina 404
  // },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
