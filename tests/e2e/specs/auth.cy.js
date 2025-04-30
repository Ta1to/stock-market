// https://docs.cypress.io/api/introduction/api.html

describe('Authentication Tests', () => {
  describe('Login Flow', () => {
    beforeEach(() => {
      // Visit the login page before each test
      cy.visit('/login')
      // Verify we are on the login page
      cy.contains('Welcome Back').should('be.visible')
    })

    it('should display the login page with all elements', () => {
      // Check if all expected elements are present on the login page
      cy.get('img[src="/stockpoker.png"]').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.contains('button', 'Sign In').should('be.visible')
      cy.contains("Don't have an account?").should('be.visible')
    })
    
    it('should validate email input', () => {
      // Test empty email
      cy.get('input[type="email"]').focus().blur()
      cy.contains('Email is required').should('be.visible')
      
      // Test invalid email
      cy.get('input[type="email"]').type('invalid-email')
      cy.contains('Email must be valid').should('be.visible')
      
      // Test valid email
      cy.get('input[type="email"]').clear().type('test@example.com')
      cy.contains('Email is required').should('not.exist')
      cy.contains('Email must be valid').should('not.exist')
    })

    it('should validate password input', () => {
      // Test empty password
      cy.get('input[type="password"]').focus().blur()
      cy.contains('Password is required').should('be.visible')
      
      // Test password too short
      cy.get('input[type="password"]').type('12345')
      cy.contains('Password must be at least 6 characters').should('be.visible')
      
      // Test valid password
      cy.get('input[type="password"]').clear().type('123456')
      cy.contains('Password is required').should('not.exist')
      cy.contains('Password must be at least 6 characters').should('not.exist')
    })

    it('should show error message for wrong credentials', () => {
      // Enter wrong credentials
      cy.get('input[type="email"]').type('wrong@example.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.contains('button', 'Sign In').click()
      
      // Check if error message is displayed
      cy.contains('An error occurred during sign in').should('be.visible')
    })

    it('should toggle password visibility', () => {
      // Check if password is hidden by default
      cy.get('input[type="password"]').should('exist')
      
      // Click on eye icon to make password visible
      cy.get('.fa-eye-slash').click()
      cy.get('input[type="text"]').should('exist')
      
      // Click again to hide password
      cy.get('.fa-eye').click()
      cy.get('input[type="password"]').should('exist')
    })

    it('should navigate to register page', () => {
      // Click on "Sign up" link
      cy.contains('Sign up').click()
      
      // Check if we are redirected to registration page
      cy.url().should('include', '/register')
      cy.contains('Create Account').should('be.visible')
    })
  })

  describe('Registration Flow', () => {
    beforeEach(() => {
      // Visit registration page before each test
      cy.visit('/login')
      cy.contains('Sign up').click()
      
      // Check if we are redirected to registration page
      cy.url().should('include', '/register')
      cy.contains('Create Account').should('be.visible')
    })

    it('should display the registration page with all elements', () => {
      // Check if all expected elements are present on the registration page
      cy.get('img[src="/stockpoker.png"]').should('be.visible')
      cy.get('input[placeholder*="Full Name"], input[label="Full Name"]').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.contains('button', 'Create Account').should('be.visible')
      cy.contains('Already have an account?').should('be.visible')
    })
    
    it('should validate name input', () => {
      // Test empty name
      cy.get('input[placeholder*="Full Name"], input[label="Full Name"]').focus().blur()
      cy.contains('Name is required').should('be.visible')
      
      // Test name too short
      cy.get('input[placeholder*="Full Name"], input[label="Full Name"]').type('A')
      cy.contains('Name must be at least 2 characters').should('be.visible')
      
      // Test valid name
      cy.get('input[placeholder*="Full Name"], input[label="Full Name"]').clear().type('John Doe')
      cy.contains('Name is required').should('not.exist')
      cy.contains('Name must be at least 2 characters').should('not.exist')
    })

    it('should validate email input', () => {
      // Test empty email
      cy.get('input[type="email"]').focus().blur()
      cy.contains('Email is required').should('be.visible')
      
      // Test invalid email
      cy.get('input[type="email"]').type('invalid-email')
      cy.contains('Email must be valid').should('be.visible')
      
      // Test valid email
      cy.get('input[type="email"]').clear().type('test@example.com')
      cy.contains('Email is required').should('not.exist')
      cy.contains('Email must be valid').should('not.exist')
    })

    it('should validate password input', () => {
      // Test empty password
      cy.get('input[type="password"]').focus().blur()
      cy.contains('Password is required').should('be.visible')
      
      // Test password too short
      cy.get('input[type="password"]').type('12345')
      cy.contains('Password must be at least 6 characters').should('be.visible')
      
      // Test valid password
      cy.get('input[type="password"]').clear().type('123456')
      cy.contains('Password is required').should('not.exist')
      cy.contains('Password must be at least 6 characters').should('not.exist')
    })

    it('should show error message for already used email', () => {
      // Firebase errors cannot be easily mocked in E2E tests
      // This test mainly serves to check UI elements
      cy.get('input[placeholder*="Full Name"], input[label="Full Name"]').type('Existing User')
      cy.get('input[type="email"]').type('existing@example.com')
      cy.get('input[type="password"]').type('password123')
      cy.contains('button', 'Create Account').click()
      
      // Wait and check if an error is displayed
      cy.contains('This email is already registered', { timeout: 5000 }).should('be.visible')
    })

    it('should toggle password visibility', () => {
      // Check if password is hidden by default
      cy.get('input[type="password"]').should('exist')
      
      // Click on eye icon to make password visible
      cy.get('.fa-eye-slash').click()
      cy.get('input[type="text"]').should('exist')
      
      // Click again to hide password
      cy.get('.fa-eye').click()
      cy.get('input[type="password"]').should('exist')
    })

    it('should navigate to login page', () => {
      // Click on "Sign in" link
      cy.contains('Sign in').click()
      
      // Check if we are redirected to login page
      cy.url().should('include', '/login')
      cy.contains('Welcome Back').should('be.visible')
    })
  })
})