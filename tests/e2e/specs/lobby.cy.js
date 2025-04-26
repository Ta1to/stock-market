// https://docs.cypress.io/api/introduction/api.html

/**
 * E2E Tests for Lobby View
 * Tests game lobby functionality after creating or joining a game
 */
describe('Lobby Tests', () => {
  beforeEach(() => {
    // Authentication with improved login
    cy.login('tester@gmail.com', '123456');
    
    // Set up intercepts for Firebase calls when creating game
    cy.intercept('POST', '**/firestore.googleapis.com/**', {
      statusCode: 200,
      body: { 
        name: 'projects/mock/databases/(default)/documents/games/game123',
        fields: {
          creator: { stringValue: 'test-user-id' },
          joinCode: { stringValue: 'ABC123' },
          isPublic: { booleanValue: true },
          players: { arrayValue: { values: [{ mapValue: { fields: { 
            id: { stringValue: 'test-user-id' },
            name: { stringValue: 'Test User' }
          }}}]}}
        }
      }
    }).as('createGame');
    
    // Create game and wait for redirect to lobby
    cy.contains('Create Game').click();
    cy.url().should('include', '/lobby/', { timeout: 10000 });
  });

  afterEach(() => {
    // Set up intercept for game deletion
    cy.intercept('DELETE', '**/firestore.googleapis.com/**', {
      statusCode: 200,
      body: {}
    }).as('deleteGame');
    
    // Clean up by deleting game after each test
    cy.contains('Delete Game').click();
    cy.url().should('not.include', '/lobby/', { timeout: 5000 });
  });

  /**
   * Test to verify all lobby UI elements
   */
  it('should display the lobby page with all elements when joining a game', () => {
    // Check essential UI elements without Firebase connection
    cy.get('.lobby-title').should('contain', 'Lobby');
    cy.get('.join-code').should('exist');
    
    // Check player list
    cy.get('.players-container').should('exist');
    
    // Check action buttons
    cy.get('.action-buttons').should('exist');
  });

  /**
   * Test to verify creator-specific UI elements
   */
  it('should display creator-specific elements when user is creator', () => {   
    // Check for creator-only controls
    cy.get('.visibility-toggle').should('exist');
    cy.get('.start-button').should('be.visible').and('contain', 'Start Game');
    cy.get('.delete-button').should('be.visible').and('contain', 'Delete Game');
    cy.get('.leave-button').should('not.exist');
  });

  /**
   * Test to verify game visibility toggle functionality
   */
  it('should toggle game visibility when changing the public/private switch', () => {
    // Set up intercept for visibility update
    cy.intercept('PATCH', '**/firestore.googleapis.com/**', {
      statusCode: 200,
      body: {}
    }).as('updateVisibility');
    
    // Check if toggle exists
    cy.get('.toggle-switch').should('exist');
    
    // Check initial state (Public active)
    cy.contains('.visibility-toggle span:not(.active)', 'Private').should('exist');
    cy.contains('.visibility-toggle span.active', 'Public').should('exist');
    
    // Toggle to Private
    cy.get('.toggle-switch').click();
    
    // Check toggled state (Private active)
    cy.contains('.visibility-toggle span.active', 'Private').should('exist');
    cy.contains('.visibility-toggle span:not(.active)', 'Public').should('exist');
  });

  /**
   * Test to verify player requirement warning
   */
  it('should show warning when trying to start game with less than 2 players', () => {
    // Set up intercept for failed start attempt
    cy.intercept('POST', '**/firestore.googleapis.com/**', {
      statusCode: 400,
      body: { error: 'Not enough players' }
    }).as('startGameAttempt');
    
    // Click start button
    cy.get('.start-button').click();
    
    // Verify warning message
    cy.contains('Not enough players').should('be.visible');
    cy.contains('At least 2 players are required to start the game').should('be.visible');

    // Dismiss warning
    cy.contains('Okay').click();
  });
});