// https://docs.cypress.io/api/introduction/api.html

/**
 * E2E Tests for Home View
 * Tests user interactions on the main page after login
 */
describe('Home View Tests', () => {
  // Set up authentication before each test
  beforeEach(() => {
    // Use the improved login command
    cy.login('tester@gmail.com', '123456');
    
    // Login now guarantees we're on the home page
    // and the logo is visible, so no additional check needed
  });

  /**
   * Test to verify all essential UI elements are present
   */
  it('should display home page elements correctly', () => {
    // Check all expected elements with an efficient query
    cy.get('body').within(() => {
      cy.contains('Create Game');
      cy.contains('Join Game');
      cy.contains('Public');
      cy.contains('Private');
      cy.contains('Public Games');
    });
  });

  /**
   * Test to verify game mode toggle functionality
   */
  it('should toggle between public and private game modes', () => {
    // Optimized toggle check with fewer assertions
    cy.contains('span.active', 'Public').should('exist');
    
    // First click for toggling
    cy.get('.toggle-switch').click();
    cy.contains('span.active', 'Private').should('exist');
    
    // Second click for toggling back
    cy.get('.toggle-switch').click();
    cy.contains('span.active', 'Public').should('exist');
  });

  /**
   * Test to verify modal behavior for joining games
   */
  it('should open and close join game modal', () => {
    // Open modal
    cy.contains('Join Game').click();
    
    // Single assertion for the modal
    cy.get('.modal').should('be.visible')
      .within(() => {
        cy.contains('Join Game');
        cy.get('input[placeholder="Enter game code"]');
      });
    
    // Close modal
    cy.contains('Cancel').click();
    cy.get('.modal').should('not.exist');
  });

  /**
   * Test to verify public games section display
   */
  it('should display public games section', () => {
    cy.get('.public-games-container').should('be.visible');
    
    // Simpler check without conditional branching
    cy.get('body').then(($body) => {
      if ($body.find('.game-card').length) {
        cy.get('.game-card').first().should('be.visible');
      } else {
        cy.contains('No public games available');
      }
    });
  });

  /**
   * Test to verify game creation and redirection
   */
  it('should create a new game and redirect to lobby', () => {
    // Stub for database calls to avoid real network requests
    cy.intercept('POST', '**/firestore.googleapis.com/**', { 
      statusCode: 200,
      body: { name: 'projects/mock/databases/(default)/documents/games/game123' }
    }).as('createGame');
    
    // Create game
    cy.contains('Create Game').click();
    
    // Wait for redirection without waiting for network requests
    cy.url().should('include', '/lobby/');
  });

  /**
   * Test to verify logout functionality
   */
  it('should log out when clicking logout button', () => {
    // Optimized logout testing
    cy.get('.logout-button').click();
    cy.url().should('include', '/login');
  });
});