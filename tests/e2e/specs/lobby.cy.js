// https://docs.cypress.io/api/introduction/api.html

describe('Lobby Tests', () => {
  beforeEach(() => {
    // Login - normally we would use a specific test user
    cy.login('tester@gmail.com', '123456');
    
    // Click create game button
    cy.contains('Create Game').click()
  });

  afterEach(() => {
    // Delete game after each test
    cy.contains('Spiel löschen').click()
  });

  // We need to create a function that creates a lobby with a mock
  // and simulates the necessary Firebase data
  it('should display the lobby page with all elements when joining a game', () => {
   
    // Since we don't have a real Firebase connection in tests,
    // we need to check the DOM based on the expected state
    cy.get('.lobby-title').should('contain', 'Lobby');
    cy.get('.join-code').should('exist');
    
    // Player list should exist
    cy.get('.players-container').should('exist');
    
    // Check if action buttons are present
    cy.get('.action-buttons').should('exist');
  });

  it('should display creator-specific elements when user is creator', () => {   
    // Check for creator-specific elements
    cy.get('.visibility-toggle').should('exist');
    cy.get('.start-button').should('be.visible').and('contain', 'Spiel starten');
    cy.get('.delete-button').should('be.visible').and('contain', 'Spiel löschen');
    cy.get('.leave-button').should('not.exist');
  });

  it('should toggle game visibility when changing the public/private switch', () => {
    // Check if the toggle switch exists
    cy.get('.toggle-switch').should('exist');
    
    // Initially, Privat should not be active and Öffentlich should be active
    cy.contains('.visibility-toggle span:not(.active)', 'Privat').should('exist');
    cy.contains('.visibility-toggle span.active', 'Öffentlich').should('exist');
    
    // Click on the toggle switch
    cy.get('.toggle-switch').click();
    
    // After click, Privat should be active and Öffentlich should not be active
    cy.contains('.visibility-toggle span.active', 'Privat').should('exist');
    cy.contains('.visibility-toggle span:not(.active)', 'Öffentlich').should('exist');
  });

  it('should show warning when trying to start game with less than 2 players', () => {    
    // Click on start button
    cy.get('.start-button').click();
    
    // Check if the warning is displayed
    cy.contains('Nicht genügend Spieler').should('be.visible');
    cy.contains('Es müssen mindestens 2 Spieler im Spiel sein').should('be.visible');

    // Click on "Okay" button
    cy.contains('Okay').click();
  });
});