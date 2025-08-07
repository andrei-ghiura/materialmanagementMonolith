describe('Material Creation', () => {
    it('should create a new material from the list view', () => {

        cy.visit('/');
        cy.get('ion-fab-button').first().click(); // Open the fab menu
        cy.get('[data-cy=add-material-btn]').click();

        // Fill required fields (update selectors/values as needed)
        cy.get('ion-select').first().click();
        cy.get('ion-select-option').first().click(); // Select first type
        cy.get('ion-select').eq(1).click();
        cy.get('ion-select-option').first().click(); // Select first species

        // Save
        cy.get('[data-cy=save-material-btn]').click();

        // Should show success alert or redirect
        cy.contains('Succes').should('exist');
        // Optionally, check for redirect to list or details
        // cy.url().should('include', '/material/');
    });
});
