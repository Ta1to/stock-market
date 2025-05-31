const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:8080',
    supportFile: 'tests/e2e/support/index.js',    // Speed up tests by disabling video recording in development
    video: false,
    // Reduce delay between commands
    defaultCommandTimeout: 4000,
    // Faster polling for assertions
    retries: {
      runMode: 1,
      openMode: 0
    },
    // Parallelize tests in CI
    numTestsKeptInMemory: 5,
    // Improve test speed by avoiding unnecessary waiting times
    experimentalMemoryManagement: true,
    // Add experimental Cypress features that improve test speed
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