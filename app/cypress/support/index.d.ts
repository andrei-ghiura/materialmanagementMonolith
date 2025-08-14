/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        mount(component: React.ReactElement): Chainable<any>
        selectMaterialType(typeLabel: string): Chainable<JQuery<HTMLElement>>
        selectMaterialSpecie(specieLabel?: string): Chainable<JQuery<HTMLElement>>
        fillMaterialForm(formData: Record<string, string>): Chainable<JQuery<HTMLElement>>
        cleanupTestData(): Chainable<any>
    }
}
