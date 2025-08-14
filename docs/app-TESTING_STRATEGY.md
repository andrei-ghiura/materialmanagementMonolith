
# App Testing Strategy

This document describes the testing strategy for the frontend app, including unit, integration, and end-to-end tests.

## Overview
Testing is performed using Cypress (E2E/component) and Vitest (unit).

## E2E Testing
- Located in `cypress/e2e/`
- Simulates real user interactions
- Covers navigation, material creation, API integration, form validation, processing workflow, accessibility

## Component Testing
- Located in `src/**/*.cy.{js,jsx,ts,tsx}`
- Uses Cypress component runner

## Unit Testing
- Uses Vitest
- Run with `npm run test.unit`

## Running Tests
- E2E: `npm run test.e2e`
- Component: `npm run test.component`
- Unit: `npm run test.unit`
- All: `npm run test.all`

## Configuration
- See `cypress.config.ts` and `vite.config.ts` for setup

---
For more details, see [App Wiki](./app-README.md).
