// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Schneller Login über Firebase API anstatt durch UI-Interaktion
Cypress.Commands.add('login', (email, password) => {
  // Prüfen ob bereits eingeloggt (Session wiederverwenden)
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.contains('button', 'Sign In').click()
    // Warte auf erfolgreichen Login und Weiterleitung
    cy.url().should('include', '/')
  }, {
    // Session Cache aktivieren für schnellere wiederholte Tests
    cacheAcrossSpecs: true
  })
  
  // Navigiere zur Hauptseite
  cy.visit('/')
})

Cypress.Commands.add('logout', () => {
  cy.visit('/')
  cy.contains('button', 'Logout').click()
})

// Stub für Firebase API-Calls zur Beschleunigung
Cypress.Commands.add('stubFirebase', () => {
  cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*', {
    body: {
      idToken: 'fake-token',
      email: 'tester@gmail.com',
      localId: 'test-user-id'
    }
  })
  cy.intercept('GET', '**/firestore.googleapis.com/**', {
    body: { documents: [] }
  })
})
