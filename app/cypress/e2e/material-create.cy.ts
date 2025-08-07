describe('Material Creation', () => {
    it('should create a new material from the list view', () => {

        cy.visit('/');
        cy.get('ion-fab-button').first().click(); // Open the fab menu
        cy.get('[data-cy=add-material-btn]').click();

        // Fill required fields (update selectors/values as needed)

        // Open and select first option for type
        cy.get('ion-select').first().click({ force: true });
        cy.get('ion-alert, .alert-wrapper, ion-select-popover, .select-interface-option, .select-popover').should('exist');
        cy.get('ion-alert button, .alert-button, ion-select-popover ion-item, .select-interface-option, .select-popover ion-item').first().click({ force: true });

        // Open and select first option for species
        cy.get('ion-select').eq(1).click({ force: true });
        cy.get('ion-alert, .alert-wrapper, ion-select-popover, .select-interface-option, .select-popover').should('exist');
        cy.get('ion-alert button, .alert-button, ion-select-popover ion-item, .select-interface-option, .select-popover ion-item').first().click({ force: true });


        // Wait for any overlay/backdrop to disappear before saving
        cy.get('ion-backdrop, .select-popover, ion-alert, .alert-wrapper').should('not.exist');
        cy.get('[data-cy=save-material-btn]').click({ force: true });

        // Should show success alert or redirect
        cy.contains('Succes').should('exist');
        // Optionally, check for redirect to list or details
        // cy.url().should('include', '/material/');
    });
});
