// https://docs.cypress.io/api/introduction/api.html

describe('Home View Tests', () => {
  // Stub Firebase vor jedem Test
  beforeEach(() => {
    cy.stubFirebase();
    cy.login('tester@gmail.com', '123456');
    
    // Wir müssen nicht mehr auf Umleitungen warten, da wir die Session verwenden
    cy.contains('Stock Poker', { timeout: 3000 }).should('be.visible');
  });

  it('should display home page elements correctly', () => {
    // Prüfe alle erwarteten Elemente mit einer effizienteren Abfrage
    cy.get('body').within(() => {
      cy.get('h1').contains('Stock Poker');
      cy.contains('Create Game');
      cy.contains('Join Game');
      cy.contains('Public');
      cy.contains('Private');
      cy.contains('Öffentliche Spiele');
    });
  });

  it('should toggle between public and private game modes', () => {
    // Optimierte Umschaltprüfung mit weniger Assertions
    cy.contains('span.active', 'Public').should('exist');
    
    // Einmaliger Klick für Umschaltung
    cy.get('.toggle-switch').click();
    cy.contains('span.active', 'Private').should('exist');
    
    // Zweiter Klick für Rückumschaltung
    cy.get('.toggle-switch').click();
    cy.contains('span.active', 'Public').should('exist');
  });

  it('should open and close join game modal', () => {
    // Modal-Test optimiert
    cy.contains('Join Game').click();
    
    // Nur eine Assertion für das Modal
    cy.get('.modal').should('be.visible')
      .within(() => {
        cy.contains('Join Game');
        cy.get('input[placeholder="Enter game code"]');
      });
    
    // Modal schließen
    cy.contains('Cancel').click();
    cy.get('.modal').should('not.exist');
  });

  it('should display public games section', () => {
    cy.get('.public-games-container').should('be.visible');
    
    // Einfachere Prüfung ohne Verzweigung
    cy.get('body').then(($body) => {
      if ($body.find('.game-card').length) {
        cy.get('.game-card').first().should('be.visible');
      } else {
        cy.contains('Keine öffentlichen Spiele verfügbar');
      }
    });
  });

  it('should create a new game and redirect to lobby', () => {
    // Stub für Datenbankaufrufe, um echte Netzwerkanfragen zu vermeiden
    cy.intercept('POST', '**/firestore.googleapis.com/**', { 
      statusCode: 200,
      body: { name: 'projects/mock/databases/(default)/documents/games/game123' }
    }).as('createGame');
    
    // Spiel erstellen
    cy.contains('Create Game').click();
    
    // Auf Weiterleitung warten, ohne auf Netzwerkanfragen zu warten
    cy.url().should('include', '/lobby/');
  });

  it('should log out when clicking logout button', () => {
    // Optimiertes Logout-Testen
    cy.get('.logout-button').click();
    cy.url().should('include', '/login');
  });
});