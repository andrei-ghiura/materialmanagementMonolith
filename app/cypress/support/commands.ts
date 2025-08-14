/// <reference types="cypress" />

// Custom commands for Material Management App

// UI interaction commands for material forms
Cypress.Commands.add('selectMaterialType', (typeLabel: string) => {
    cy.get('[data-cy=material-type-select]').select(typeLabel);
});

Cypress.Commands.add('selectMaterialSpecie', (specieLabel?: string) => {
    if (specieLabel) {
        cy.get('[data-cy=material-specie-select]').select(specieLabel);
    }
});

Cypress.Commands.add('fillMaterialForm', (formData: Record<string, string>) => {
    Object.entries(formData).forEach(([field, value]) => {
        if (field === 'data') {
            cy.get(`[data-cy=input-${field}]`).type(value);
        } else {
            cy.get(`[data-cy=input-${field}]`).clear().type(value);
        }
    });
});

// Data cleanup command
Cypress.Commands.add('cleanupTestData', () => {
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/materials`,
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status === 200 && response.body) {
            response.body.forEach((material: any) => {
                if (material.cod_unic_aviz?.includes('TEST-') || material.observatii?.includes('Test')) {
                    cy.request({
                        method: 'DELETE',
                        url: `${Cypress.env('apiUrl')}/api/materials/${material._id}`,
                        failOnStatusCode: false,
                    });
                }
            });
        }
    });
});