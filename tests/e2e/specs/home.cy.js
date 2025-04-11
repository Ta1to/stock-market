// https://docs.cypress.io/api/introduction/api.html

describe('Home View Tests', () => {
  // Use beforeEach to login before each test
  beforeEach(() => {
    // Use the custom login command defined in commands.js
    cy.login('tester@gmail.com', '123456')
    
    // Wait for authentication and redirect to home page
    cy.url().should('include', '/')
    cy.contains('Stock Poker').should('be.visible')
  })

  it('should display home page elements correctly', () => {
    // Check if all expected elements are present
    cy.contains('h1', 'Stock Poker').should('be.visible')
    cy.contains('Create Game').should('be.visible')
    cy.contains('Join Game').should('be.visible')
    cy.contains('Public').should('be.visible')
    cy.contains('Private').should('be.visible')
    cy.contains('Öffentliche Spiele').should('be.visible')
  })

  it('should toggle between public and private game modes', () => {
    // Check default state is public
    cy.contains('span.active', 'Public').should('be.visible')
    cy.contains('span:not(.active)', 'Private').should('be.visible')
    
    // Click toggle to switch to private
    cy.get('.toggle-switch').click()
    cy.contains('span.active', 'Private').should('be.visible')
    cy.contains('span:not(.active)', 'Public').should('be.visible')
    
    // Click toggle again to switch back to public
    cy.get('.toggle-switch').click()
    cy.contains('span.active', 'Public').should('be.visible')
    cy.contains('span:not(.active)', 'Private').should('be.visible')
  })

  it('should open and close join game modal', () => {
    // Modal should not be visible initially
    cy.get('.modal-overlay').should('not.exist')
    
    // Click join game button
    cy.contains('Join Game').click()
    
    // Modal should be visible
    cy.get('.modal-overlay').should('be.visible')
    cy.get('.modal').should('be.visible')
    cy.contains('Join Game').should('be.visible')
    cy.get('input[placeholder="Enter game code"]').should('be.visible')
    
    // Close modal with Cancel button
    cy.contains('Cancel').click()
    cy.get('.modal-overlay').should('not.exist')
  })

  it('should display public games section', () => {
    cy.get('.public-games-container').should('be.visible')
    cy.contains('Öffentliche Spiele').should('be.visible')
    
    // Either game cards or "no games available" message should be visible
    cy.get('body').then(($body) => {
      if ($body.find('.game-card').length > 0) {
        // If there are game cards
        cy.get('.game-card').should('be.visible')
        cy.get('.join-button').should('be.visible')
      } else {
        // If there are no game cards
        cy.contains('Keine öffentlichen Spiele verfügbar').should('be.visible')
      }
    })
  })

  it('should create a new game and redirect to lobby', () => {
    // TODO disable database writes
    // Stub the writeData function to prevent actual database writes
    // cy.window().then((win) => {
    //   cy.stub(win.app.$options.methods, 'writeData').resolves()
    // })
    
    // Click create game button
    cy.contains('Create Game').click()
    
    // Should redirect to lobby
    cy.url().should('include', '/lobby/')
  })

  it('should log out when clicking logout button', () => {
    // Click logout button
    cy.get('.logout-button').click()
    
    // Should redirect to login page
    cy.url().should('include', '/login')
    cy.contains('Welcome Back').should('be.visible')
  })
})