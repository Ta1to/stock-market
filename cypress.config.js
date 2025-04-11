const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:8080',
    supportFile: 'tests/e2e/support/index.js'
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'webpack',
    },
    specPattern: 'tests/components/**/*.cy.{js,jsx,ts,tsx}'
  }
})