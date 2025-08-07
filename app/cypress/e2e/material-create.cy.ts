/* eslint-disable */
// @ts-nocheck

// Helper to fill fields for isRaw types
function fillRawFields(prefix) {
    cy.get('[data-cy=input-cod_unic_aviz]').get('#ion-input-0').focus().type(`${prefix}-1234`);
    cy.get('[data-cy=input-data]').type('2025-08-07');
    cy.get('[data-cy=input-apv]').type(`${prefix}-APV`);
    cy.get('[data-cy=input-lat]').type('45.123');
    cy.get('[data-cy=input-log]').type('25.456');
    cy.get('[data-cy=input-nr_placuta_rosie]').type('100');
    cy.get('[data-cy=input-lungime]').type('5');
    cy.get('[data-cy=input-diametru]').type('30');
    cy.get('[data-cy=input-volum_placuta_rosie]').type('1.5');
    cy.get('[data-cy=input-volum_total]').type('2.0');
    cy.get('[data-cy=input-observatii]').type(`Test observații ${prefix}`);
}

// Helper to fill fields for non-isRaw types
function fillNonRawFields(prefix) {
    cy.get('[data-cy=input-cod_unic_aviz]').get('#ion-input-0').focus().type(`${prefix}-1234`);
    cy.get('[data-cy=input-data]').type('2025-08-08');
    cy.get('[data-cy=input-apv]').type(`${prefix}-APV`);
    cy.get('[data-cy=input-lat]').type('46.321');
    cy.get('[data-cy=input-log]').type('26.654');
    cy.get('[data-cy=input-volum_total]').type('3.0');
    cy.get('[data-cy=input-nr_bucati]').type('20');
    cy.get('[data-cy=input-volum_net_paletizat]').type('2.2');
    cy.get('[data-cy=input-volum_brut_paletizat]').type('2.3');
    cy.get('[data-cy=input-observatii]').type(`Test observații ${prefix}`);
}

const materialTypes = [
    { label: 'Buștean', isRaw: true },
    { label: 'Buștean Fasonat', isRaw: true },
    { label: 'Palet', isRaw: false },
    { label: 'Cherestea', isRaw: false },
    { label: 'Resturi', isRaw: false },
];

materialTypes.forEach((type, idx) => {
    describe(`Material Creation - ${type.label}`, () => {
        it(`should create a new ${type.label} material`, () => {
            cy.visit('/');
            cy.get('ion-fab-button').first().click();
            cy.get('[data-cy=add-material-btn]').click();

            // Select type by index
            cy.get('[data-cy=material-type-select]').click();
            cy.get('.cy-material-type-alert').should('exist');
            cy.get('.cy-material-type-alert').within(() => {
                cy.get('button.select-interface-option').eq(idx).click();
                cy.get('button.alert-button').contains(/ok|select|done/i).click();
            });

            // Select species (first option)
            cy.get('[data-cy=material-specie-select]').click();
            cy.get('.cy-material-specie-alert').should('exist');
            cy.get('.cy-material-specie-alert').within(() => {
                cy.get('button.select-interface-option').first().click();
                cy.get('button.alert-button').contains(/ok|select|done/i).click();
            });

            // Fill fields
            if (type.isRaw) {
                fillRawFields(type.label);
            } else {
                fillNonRawFields(type.label);
            }

            cy.get('ion-backdrop, .select-popover, ion-alert, .alert-wrapper').should('not.exist');
            cy.get('[data-cy=save-material-btn]').click();

            cy.contains('Succes').should('exist');
            cy.get('ion-alert button, .alert-button, .alert-wrapper button').contains(/ok/i).click();

            cy.url().should('eq', Cypress.config().baseUrl + '/');
            cy.get('ion-item, [data-cy^=component-list-item-]').contains(type.label).should('exist');
        });
    });
});
describe('Material Creation - Buștean/Buștean Fasonat', () => {
    it('should create a new Buștean/Buștean Fasonat material', () => {
        cy.visit('/');
        cy.get('ion-fab-button').first().click();
        cy.get('[data-cy=add-material-btn]').click();

        // Select type: Buștean (assume first option is Buștean)
        cy.get('[data-cy=material-type-select]').click();
        cy.get('.cy-material-type-alert').should('exist');
        cy.get('.cy-material-type-alert').within(() => {
            cy.get('button.select-interface-option').first().click();
            cy.get('button.alert-button').contains(/ok|select|done/i).click();
        });

        // Select species (first option)
        cy.get('[data-cy=material-specie-select]').click();
        cy.get('.cy-material-specie-alert').should('exist');
        cy.get('.cy-material-specie-alert').within(() => {
            cy.get('button.select-interface-option').first().click();
            cy.get('button.alert-button').contains(/ok|select|done/i).click();
        });

        // Fill only fields visible for isRaw (Buștean/Buștean Fasonat)
        cy.get('[data-cy=input-cod_unic_aviz]').get('#ion-input-0').focus().type('AVZ-1234');
        cy.get('[data-cy=input-data]').type('2025-08-07');
        cy.get('[data-cy=input-apv]').type('APV-5678');
        cy.get('[data-cy=input-lat]').type('45.123');
        cy.get('[data-cy=input-log]').type('25.456');
        cy.get('[data-cy=input-nr_placuta_rosie]').type('100');
        cy.get('[data-cy=input-lungime]').type('5');
        cy.get('[data-cy=input-diametru]').type('30');
        cy.get('[data-cy=input-volum_placuta_rosie]').type('1.5');
        cy.get('[data-cy=input-volum_total]').type('2.0');
        cy.get('[data-cy=input-observatii]').type('Test observații');

        cy.get('ion-backdrop, .select-popover, ion-alert, .alert-wrapper').should('not.exist');
        cy.get('[data-cy=save-material-btn]').click();

        cy.contains('Succes').should('exist');
        cy.get('ion-alert button, .alert-button, .alert-wrapper button').contains(/ok/i).click();

        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.get('ion-item, [data-cy^=component-list-item-]').contains('Buștean').should('exist');
    });
});
