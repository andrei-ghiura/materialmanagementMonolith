import MaterialTable from './MaterialTable';
import { Material } from '../types';

describe('MaterialTable Component', () => {
    const mockMaterials: Material[] = [
        {
            _id: 'test-1',
            humanId: 'MAT-001',
            type: 'Buștean',
            specie: 'Stejar',
            cod_unic_aviz: 'AVZ-001',
            data: '2025-08-14',
            volum_total: '2.5'
        },
        {
            _id: 'test-2',
            humanId: 'MAT-002',
            type: 'Cherestea',
            specie: 'Fag',
            cod_unic_aviz: 'AVZ-002',
            data: '2025-08-13',
            volum_total: '1.8'
        },
        {
            _id: 'test-3',
            humanId: 'MAT-003',
            type: 'Palet',
            specie: 'Brad',
            cod_unic_aviz: 'AVZ-003',
            data: '2025-08-12',
            nr_bucati: '50'
        }
    ];

    it('should render all materials in the table', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Check if all materials are rendered
        cy.contains('MAT-001').should('be.visible');
        cy.contains('MAT-002').should('be.visible');
        cy.contains('MAT-003').should('be.visible');

        // Check material types
        cy.contains('Buștean').should('be.visible');
        cy.contains('Cherestea').should('be.visible');
        cy.contains('Palet').should('be.visible');
    });

    it('should handle empty materials list', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={[]}
                onRowClick={onRowClickSpy}
            />
        );

        // Should show table headers but no data rows
        cy.get('table').should('exist');
        cy.get('tbody tr').should('not.exist');
    });

    it('should handle row clicks', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Click on first material row
        cy.get('tbody tr').first().click();
        cy.get('@onRowClickSpy').should('have.been.calledWith', 'test-1');
    });

    it('should show column settings modal', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Open column settings
        cy.get('button').contains(/settings|columns|setări/i).click();

        // Should show modal with column toggles
        cy.get('.modal').should('be.visible');
        cy.contains(/column|coloană/i).should('exist');
    });

    it('should toggle column visibility', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Open column settings
        cy.get('button').contains(/settings|columns|setări/i).click();

        // Toggle a column (e.g., specie)
        cy.get('input[type="checkbox"]').first().uncheck();

        // Close modal
        cy.get('button').contains(/close|închide/i).click();

        // Check if column is hidden
        cy.get('th').should('not.contain', 'Specie');
    });

    it('should display all required columns', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Check that essential columns are present
        const expectedColumns = ['ID', 'Human ID', 'Tip', 'Specie', 'Data'];
        expectedColumns.forEach(column => {
            cy.get('th').contains(column).should('be.visible');
        });
    });

    it('should display material data correctly', () => {
        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={mockMaterials}
                onRowClick={onRowClickSpy}
            />
        );

        // Check specific data points
        cy.get('tbody tr').first().within(() => {
            cy.contains('test-1').should('exist');
            cy.contains('MAT-001').should('exist');
            cy.contains('Buștean').should('exist');
            cy.contains('Stejar').should('exist');
            cy.contains('2025-08-14').should('exist');
        });
    });

    it('should handle materials with missing fields', () => {
        const incompleteeMaterial: Material = {
            _id: 'incomplete-1',
            type: 'Test',
            specie: 'Test'
        };

        const onRowClickSpy = cy.stub().as('onRowClickSpy');

        cy.mount(
            <MaterialTable
                materials={[incompleteeMaterial]}
                onRowClick={onRowClickSpy}
            />
        );

        // Should show dashes for missing fields
        cy.get('tbody tr').first().within(() => {
            cy.contains('-').should('exist');
        });
    });
});
