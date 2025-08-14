import MaterialItem from './MaterialItem';
import { Material } from '../types';

describe('MaterialItem Component', () => {
    const mockMaterial: Material = {
        _id: 'test-123',
        humanId: 'MAT-001',
        type: 'Buștean',
        specie: 'Stejar',
        cod_unic_aviz: 'AVZ-12345',
        data: '2025-08-14',
        apv: 'APV-67890',
        lat: '45.123',
        log: '25.456',
        volum_total: '2.5',
        observatii: 'Test material'
    };

    it('should render material information correctly', () => {
        cy.mount(<MaterialItem material={mockMaterial} />);

        // Check if material type and species are displayed
        cy.contains('Buștean').should('be.visible');
        cy.contains('Stejar').should('be.visible');

        // Check if human ID and date are displayed
        cy.contains('MAT-001').should('be.visible');
        cy.contains('2025-08-14').should('be.visible');

        // Check if volume is displayed
        cy.contains('2.5 m³').should('be.visible');
    });

    it('should handle click events', () => {
        const onClickSpy = cy.stub().as('onClickSpy');

        cy.mount(<MaterialItem material={mockMaterial} onItemClick={onClickSpy} />);

        cy.get('.card').click();
        cy.get('@onClickSpy').should('have.been.called');
    });

    it('should show delete button when enabled', () => {
        const onDeleteSpy = cy.stub().as('onDeleteSpy');

        cy.mount(
            <MaterialItem
                material={mockMaterial}
                showDeleteButton={true}
                onDelete={onDeleteSpy}
            />
        );

        cy.get('button').contains('svg').should('be.visible');
        cy.get('button').click();
        cy.get('@onDeleteSpy').should('have.been.called');
    });

    it('should hide delete button when not enabled', () => {
        cy.mount(<MaterialItem material={mockMaterial} showDeleteButton={false} />);

        cy.get('button').should('not.exist');
    });

    it('should handle disabled state', () => {
        cy.mount(<MaterialItem material={mockMaterial} disabled={true} />);

        cy.get('.card').should('have.css', 'opacity').and('match', /0\.6/);
        cy.get('.card').should('have.css', 'cursor', 'default');
    });

    it('should display conditional fields', () => {
        const materialWithAllFields: Material = {
            ...mockMaterial,
            volum_net_paletizat: '2.0',
            volum_brut_paletizat: '2.3',
            nr_bucati: '150'
        };

        cy.mount(<MaterialItem material={materialWithAllFields} />);

        cy.contains('V. net paletizat').should('be.visible');
        cy.contains('2.0 m³').should('be.visible');
        cy.contains('V. brut paletizat').should('be.visible');
        cy.contains('2.3 m³').should('be.visible');
        cy.contains('Bucăți').should('be.visible');
        cy.contains('150').should('be.visible');
    });

    it('should render extra content when provided', () => {
        const extraContent = <div data-cy="extra-content">Extra Content</div>;

        cy.mount(
            <MaterialItem
                material={mockMaterial}
                extraContent={extraContent}
            />
        );

        cy.get('[data-cy="extra-content"]').should('be.visible');
        cy.contains('Extra Content').should('be.visible');
    });
});
