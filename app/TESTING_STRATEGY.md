# Cypress Testing Strategy for Material Management App

## Overview

This document outlines the comprehensive testing strategy implemented for the Material Management Ionic React application using Cypress for both E2E and component testing.

## Testing Architecture

### 1. E2E Testing (`cypress/e2e/`)
End-to-end tests that simulate real user interactions with the complete application.

#### Test Categories:

**Navigation & Layout** (`navigation.cy.ts`)
- Tests basic navigation between pages
- Validates responsive design across different screen sizes
- Ensures layout elements are properly displayed

**Material Creation** (`material-create.cy.ts`)
- Tests the complete material creation workflow
- Validates form interactions for different material types
- Tests dynamic form field visibility based on material type

**API Integration** (`api-integration.cy.ts`)
- Tests API communication and error handling
- Validates offline scenarios
- Tests API response handling and loading states

**Form Validation** (`form-validation.cy.ts`)
- Tests all form validation rules
- Validates required fields, data types, and ranges
- Tests coordinate validation and field length limits

**Processing Workflow** (`processing-workflow.cy.ts`)
- Tests material processing workflows
- Validates processing history display
- Tests filtering and status management

**Accessibility** (`accessibility.cy.ts`)
- Tests keyboard navigation
- Validates ARIA labels and roles
- Tests focus management and screen reader support

**Performance** (`performance.cy.ts`)
- Tests page load times
- Validates large dataset handling
- Tests memory usage and optimization

### 2. Component Testing (`src/components/*.cy.tsx`)
Isolated testing of individual React components.

#### Components Tested:

**MaterialItem Component** (`MaterialItem.cy.tsx`)
- Tests material data display
- Validates click events and delete functionality
- Tests conditional field rendering

**MaterialTable Component** (`MaterialTable.cy.tsx`)
- Tests table data rendering
- Validates row interactions and column settings
- Tests empty state handling

**FormSection Component** (`FormSection.cy.tsx`)
- Tests form section layout and styling
- Validates title/subtitle rendering
- Tests grid layout functionality

## Custom Commands (`cypress/support/commands.ts`)

### UI Interaction Commands:
- `cy.selectMaterialType(typeLabel)` - Selects material type from dropdown
- `cy.selectMaterialSpecie(specieLabel?)` - Selects material species
- `cy.fillMaterialForm(formData)` - Fills material form with data
- `cy.cleanupTestData()` - Cleans up test materials via API

## Configuration

### Cypress Config (`cypress.config.ts`)
```typescript
{
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000
  },
  component: {
    devServer: { framework: "react", bundler: "vite" },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}"
  }
}
```

## Test Data Management

### Fixtures (`cypress/fixtures/`)
- `materials.json` - Sample material data for API mocking
- `processings.json` - Sample processing data

### Test Data Strategy:
1. **Isolation**: Each test creates its own test data
2. **Cleanup**: Automated cleanup after each test
3. **Realistic Data**: Test data mirrors production scenarios
4. **Dynamic Generation**: Tests generate unique data to avoid conflicts

## Running Tests

### Development:
```bash
# Open Cypress UI for E2E tests
npm run test.e2e:open

# Open Cypress UI for component tests
npm run test.component:open

# Run all tests in headless mode
npm run test.all
```

### CI/CD:
```bash
# Run all tests for continuous integration
npm run test.ci
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic

### 2. Selectors
- Use `data-cy` attributes for test selectors
- Avoid relying on CSS classes or implementation details
- Use semantic selectors when possible

### 3. Assertions
- Use specific assertions (`should('be.visible')` vs `should('exist')`)
- Test user-facing behavior, not implementation
- Include both positive and negative test cases

### 4. Test Data
- Use factories for generating test data
- Clean up test data after each test
- Use realistic data that matches production scenarios

### 5. Error Handling
- Test error scenarios and edge cases
- Validate error messages and user feedback
- Test API failure scenarios

## Coverage Areas

### ✅ Covered
- Material CRUD operations
- Form validation and interactions
- Navigation and routing
- API integration and error handling
- Component rendering and interactions
- Accessibility features
- Performance metrics

### 🔄 Future Enhancements
- Visual regression testing
- Mobile-specific testing (Capacitor)
- Internationalization testing
- Database integration testing
- Advanced performance monitoring

## Maintenance

### Regular Tasks:
1. Update test data when new fields are added
2. Review and update selectors when UI changes
3. Add tests for new features
4. Review and optimize slow tests
5. Update custom commands as needed

### Monitoring:
- Track test execution time
- Monitor test flakiness
- Review coverage reports
- Update browser/device matrix

## Troubleshooting

### Common Issues:
1. **Timing Issues**: Use proper waits and assertions
2. **Selector Changes**: Update data-cy attributes when UI changes
3. **Test Data Conflicts**: Ensure proper test isolation
4. **API Dependencies**: Mock external dependencies

### Debug Tips:
- Use `cy.debug()` to pause test execution
- Enable video recording for failed tests
- Use browser dev tools during test development
- Check Cypress dashboard for CI failures

## Integration with Development Workflow

### Pre-commit Hooks:
- Run component tests before commits
- Lint test files
- Validate test data

### CI Pipeline:
1. Unit tests (Vitest)
2. Component tests (Cypress)
3. E2E tests (Cypress)
4. Build and deployment

This testing strategy ensures comprehensive coverage of the Material Management application, providing confidence in releases and enabling rapid development iterations.
