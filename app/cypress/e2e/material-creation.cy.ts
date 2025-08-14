describe('Material Management - Create Materials', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get('[data-cy=add-material-btn]').should('exist').click();
    });


    it('should add a BSTN material', () => {
        cy.selectMaterialType('Buștean');
        cy.selectMaterialSpecie('Stejar');

        cy.get('[data-cy=input-cod_unic_aviz]').type('AVZ-12345');
        cy.get('[data-cy=input-data]').type('2025-08-14');
        cy.get('[data-cy=input-apv]').type('APV-67890');
        cy.get('[data-cy=input-lat]').type('45.123');
        cy.get('[data-cy=input-log]').type('25.456');
        cy.get('[data-cy=input-nr_placuta_rosie]').type('100');
        cy.get('[data-cy=input-lungime]').type('5.2');
        cy.get('[data-cy=input-diametru]').type('30');
        cy.get('[data-cy=input-volum_placuta_rosie]').type('1.5');
        cy.get('[data-cy=input-volum_total]').type('2.5');
        cy.get('[data-cy=input-observatii]').type('Test material for BSTN');

        cy.get('[data-cy=save-material-btn]').click();

        cy.contains('Material creat cu succes').should('be.visible');
    });

    it('should add a CHN material', () => {
        cy.selectMaterialType('Cherestea Netivită');
        cy.selectMaterialSpecie('Fag');

        cy.get('[data-cy=input-cod_unic_aviz]').type('AVZ-54321');
        cy.get('[data-cy=input-data]').type('2025-08-13');
        cy.get('[data-cy=input-apv]').type('APV-09876');
        cy.get('[data-cy=input-lat]').type('46.321');
        cy.get('[data-cy=input-log]').type('26.654');
        cy.get('[data-cy=input-volum_total]').type('1.8');
        cy.get('[data-cy=input-nr_bucati]').type('120');
        cy.get('[data-cy=input-volum_net_paletizat]').type('1.6');
        cy.get('[data-cy=input-volum_brut_paletizat]').type('1.9');
        cy.get('[data-cy=input-observatii]').type('Test material for CHN');

        cy.get('[data-cy=save-material-btn]').click();

        cy.contains('Material creat cu succes').should('be.visible');
    });
});
