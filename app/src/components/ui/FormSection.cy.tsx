import FormSection from './FormSection';

describe('FormSection Component', () => {
    it('should render title and children', () => {
        cy.mount(
            <FormSection title="Test Form Section">
                <div data-cy="test-content">Test Content</div>
            </FormSection>
        );

        cy.contains('Test Form Section').should('be.visible');
        cy.get('[data-cy="test-content"]').should('be.visible');
        cy.contains('Test Content').should('be.visible');
    });

    it('should render subtitle when provided', () => {
        cy.mount(
            <FormSection
                title="Test Form Section"
                subtitle="This is a test subtitle"
            >
                <div>Content</div>
            </FormSection>
        );

        cy.contains('Test Form Section').should('be.visible');
        cy.contains('This is a test subtitle').should('be.visible');
    });

    it('should not render subtitle when not provided', () => {
        cy.mount(
            <FormSection title="Test Form Section">
                <div>Content</div>
            </FormSection>
        );

        cy.contains('Test Form Section').should('be.visible');
        cy.get('p').should('not.exist');
    });

    it('should apply custom className', () => {
        cy.mount(
            <FormSection
                title="Test Form Section"
                className="custom-class"
            >
                <div>Content</div>
            </FormSection>
        );

        cy.get('section').should('have.class', 'custom-class');
    });

    it('should have proper grid layout for children', () => {
        cy.mount(
            <FormSection title="Test Form Section">
                <div data-cy="child-1">Child 1</div>
                <div data-cy="child-2">Child 2</div>
                <div data-cy="child-3">Child 3</div>
            </FormSection>
        );

        // Check that children are in grid layout
        cy.get('.grid').should('exist');
        cy.get('.grid').should('have.class', 'grid-cols-1');
        cy.get('.grid').should('have.class', 'md:grid-cols-2');

        cy.get('[data-cy="child-1"]').should('be.visible');
        cy.get('[data-cy="child-2"]').should('be.visible');
        cy.get('[data-cy="child-3"]').should('be.visible');
    });

    it('should have proper styling classes', () => {
        cy.mount(
            <FormSection title="Test Form Section">
                <div>Content</div>
            </FormSection>
        );

        // Check main container styling
        cy.get('section').should('have.class', 'bg-white');
        cy.get('section').should('have.class', 'rounded-xl');
        cy.get('section').should('have.class', 'shadow-lg');
        cy.get('section').should('have.class', 'p-5');
        cy.get('section').should('have.class', 'mb-4');

        // Check title styling
        cy.get('h2').should('have.class', 'text-2xl');
        cy.get('h2').should('have.class', 'font-bold');
        cy.get('h2').should('have.class', 'text-primary-700');
    });
});
