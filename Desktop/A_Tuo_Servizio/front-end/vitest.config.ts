/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Percorso al file di setup
    css: true, // Abilita il parsing dei CSS (utile se i componenti importano CSS Modules)
  },
});
