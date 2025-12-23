// cypress/integration/register.spec.js
// E2E Test Template for User Registration Flow

describe('User Registration Flow', () => {
  beforeEach(() => {
    // Replace with your registration page URL
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.get('form').should('be.visible');
    cy.contains('Register').should('exist');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.get('.error').should('exist');
  });

  it('should allow successful registration', () => {
    // Replace selector and test data as needed
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    // Expect a redirect or success message
    cy.url().should('not.include', '/register');
    cy.contains('Welcome, testuser').should('exist');
  });
});
