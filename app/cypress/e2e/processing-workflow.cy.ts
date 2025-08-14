describe('Material Management - Processing Workflow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create and process materials through workflow', () => {
        // Create a material first
        cy.get('[data-cy=fab-button], [data-cy=add-material-btn]').first().click();
        cy.get('[data-cy=add-material-btn]').click();

        cy.selectMaterialType('Buștean');
        cy.selectMaterialSpecie();

        const materialData = {
            cod_unic_aviz: 'WORKFLOW-' + Date.now(),
            data: '2025-08-14',
            apv: 'APV-WORKFLOW',
            lat: '45.123',
            log: '25.456',
            nr_placuta_rosie: '100',
            lungime: '5',
            diametru: '30',
            volum_placuta_rosie: '1.5',
            volum_total: '2.0',
            observatii: 'Workflow test material'
        };

        cy.fillMaterialForm(materialData);
        cy.get('[data-cy=save-material-btn]').click();

        cy.contains(/success|succes/i).should('exist');
        cy.get('ion-alert button, .alert-button').contains(/ok/i).click();

        // Navigate to processing
        cy.visit('/processing');

        // Select the created material for processing
        cy.contains(materialData.cod_unic_aviz).should('exist');
        cy.contains(materialData.cod_unic_aviz).click();

        // Add processing step
        cy.get('[data-cy=add-processing-btn]').click();

        // Fill processing form
        cy.get('[data-cy=processing-type-select]').click();
        cy.get('[data-cy=processing-type-option]').first().click();

        cy.get('[data-cy=processing-date]').type('2025-08-15');
        cy.get('[data-cy=processing-notes]').type('Test processing step');

        cy.get('[data-cy=save-processing-btn]').click();

        // Verify processing was added
        cy.contains('Test processing step').should('exist');
    });

    it('should display processing history', () => {
        cy.visit('/processing');

        // Should show processing timeline or history
        cy.get('[data-cy=processing-history], .processing-timeline').should('exist');
    });

    it('should filter materials by processing status', () => {
        cy.visit('/processing');

        // Test filtering options
        cy.get('[data-cy=filter-processed], [data-cy=filter-unprocessed]').should('exist');

        cy.get('[data-cy=filter-processed]').click();
        // Verify filtered results

        cy.get('[data-cy=filter-unprocessed]').click();
        // Verify filtered results
    });
});

describe('Material Management - Combined Workflow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create a material and process it in a single workflow', () => {
        // Step 1: Create a material
        cy.get('[data-cy=add-material-btn]').click();

        const materialData = {
            cod_unic_aviz: 'COMBINED-' + Date.now(),
            data: '2025-08-14',
            apv: 'APV-COMBINED',
            lat: '45.123',
            log: '25.456',
            nr_placuta_rosie: '100',
            lungime: '5.2',
            diametru: '30',
            volum_placuta_rosie: '1.5',
            volum_total: '2.5',
            observatii: 'Combined workflow test material'
        };

        cy.fillMaterialForm(materialData);
        cy.get('[data-cy=save-material-btn]').click();
        cy.contains('Material creat cu succes').should('be.visible');

        // Step 2: Process the created material
        cy.visit('/processing');
        cy.contains(materialData.cod_unic_aviz).should('exist');
        cy.contains(materialData.cod_unic_aviz).click();

        cy.get('[data-cy=add-processing-btn]').click();
        cy.get('[data-cy=processing-type-select]').click();
        cy.get('[data-cy=processing-type-option]').first().click();
        cy.get('[data-cy=processing-date]').type('2025-08-15');
        cy.get('[data-cy=processing-notes]').type('Test processing step');
        cy.get('[data-cy=save-processing-btn]').click();

        // Verify processing was added
        cy.contains('Test processing step').should('exist');
    });
});
