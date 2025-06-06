// src/setupTests.ts
import '@testing-library/jest-dom';
// Se si usano altri setup globali per i test, possono essere aggiunti qui.
// Ad esempio, per jest-dom/extend-expect (anche se con globals:true in Vitest non è sempre necessario esplicitarlo qui):
// import '@testing-library/jest-dom/extend-expect';

// Polyfill per TextEncoder e TextDecoder (necessario per jsdom con alcune versioni di React/Testing Library)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder; // Non sempre necessario, ma incluso per completezza

// Polyfill per window.matchMedia (comune per testare componenti che usano media query)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecato ma a volte necessario per librerie più vecchie
    removeListener: jest.fn(), // Deprecato
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
