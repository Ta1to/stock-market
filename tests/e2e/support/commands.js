// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Simple login command without session functionality
 * Handles authentication for tests by stubbing Firebase
 */
Cypress.Commands.add('login', (email, password) => {
  // Stub Firebase authentication
  cy.stubFirebase();
  
  // Navigate to login page
  cy.visit('/login');
  
  // Fill form fields
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  
  // Click login button
  cy.contains('button', 'Sign In').click();
  
  // Wait for successful redirect
  cy.url().should('not.include', '/login', { timeout: 10000 });
  
  // Ensure homepage has loaded
  cy.get('img[src="/stockpoker.png"]', { timeout: 5000 }).should('be.visible');
})

/**
 * Logout command
 * Handles user logout process
 */
Cypress.Commands.add('logout', () => {
  cy.visit('/');
  cy.get('.logout-button').click();
  cy.url().should('include', '/login');
})

/**
 * Firebase API stubbing
 * Creates mocks for Firebase authentication and database calls
 */
Cypress.Commands.add('stubFirebase', () => {
  // Mock authentication endpoint
  cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*', {
    body: {
      idToken: 'fake-token',
      email: 'tester@gmail.com',
      localId: 'test-user-id',
      registered: true
    }
  }).as('loginRequest');
  
  // Mock Firestore database calls
  cy.intercept('GET', '**/firestore.googleapis.com/**', {
    body: { documents: [] }
  }).as('firestoreRequest');
  
  // Set authentication data in local storage
  cy.window().then(win => {
    win.localStorage.setItem('firebase_token', 'fake-token');
    win.localStorage.setItem('user_email', 'tester@gmail.com');
    win.localStorage.setItem('user_id', 'test-user-id');
  });
})
