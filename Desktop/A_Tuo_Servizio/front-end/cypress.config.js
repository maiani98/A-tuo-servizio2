const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Assuming React app runs on port 3000
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Default spec pattern for Cypress 10+
    supportFile: false, // Explicitly disable support file if not creating one for this basic setup
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
