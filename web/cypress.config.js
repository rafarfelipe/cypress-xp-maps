const path = require('path');

// When Cypress is launched from `web/`, dotenv would otherwise look for `.env` in `web/`.
// Load the workspace root `.env` (one level up) so test env vars are available.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { defineConfig } = require("cypress");
const { configurePlugin } = require('cypress-mongodb');

const { configureAllureAdapterPlugins } = require('@mmisty/cypress-allure-adapter/plugins');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      configureAllureAdapterPlugins(on, config);
      configurePlugin(on);

      return config;
    },
    specPattern: [
      './cypress/support/hooks/index.cy.js',
      './cypress/e2e/**'
    ],
    baseUrl: process.env.BASE_URL,
    env: {
      allure: true,
      baseApi: process.env.BASE_API,
      mongodb: {
        uri: process.env.MONGO_URI,
        database: process.env.DATABASE_NAME,
      }
    },
    viewportWidth: 1440,
    viewportHeight: 900
  },
})
