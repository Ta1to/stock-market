const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:8080',
    supportFile: 'tests/e2e/support/index.js',
    // Beschleunige Tests durch Deaktivierung der Videoaufzeichnung in der Entwicklung
    video: false,
    // Reduziere die Verzögerung zwischen Befehlen
    defaultCommandTimeout: 4000,
    // Schnelleres Polling für Assertions
    retries: {
      runMode: 1,
      openMode: 0
    },
    // Parallelisiere Tests im CI
    numTestsKeptInMemory: 5,
    // Verbesserte Testgeschwindigkeit durch Vermeidung unnötiger Wartezeiten
    experimentalMemoryManagement: true,
    // Füge Experimentelle Cypress-Funktionen hinzu, die die Testgeschwindigkeit verbessern
    experimentalModifyObstructiveThirdPartyCode: true
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'webpack',
    },
    specPattern: 'tests/components/**/*.cy.{js,jsx,ts,tsx}'
  }
})