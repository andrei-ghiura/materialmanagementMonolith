# Material Management App Wiki

## Overview
This is a monolithic Material Management application built with Ionic React, Vite, TypeScript, and Capacitor. It supports material tracking, processing workflows, barcode scanning, and internationalization.

## Features
- Material creation, listing, and detail views
- Processing workflows and history
- Barcode scanning (Capacitor MLKit, HTML5 QR)
- Responsive UI (Bootstrap, React)
- Internationalization (i18next)
- Dark/light theme support
- End-to-end, component, and unit testing (Cypress, Vitest)

## Project Structure
- `src/` - Main source code
  - `pages/` - App pages (MaterialListView, MaterialView, ProcessingView, etc.)
  - `components/` - Reusable UI components
  - `api/` - API clients for materials and processing
  - `hooks/` - Custom React hooks
  - `theme/` - CSS and theme files
  - `i18n/` - Internationalization config and translations
- `public/` - Static assets
- `cypress/` - E2E and component tests

## Setup & Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Run tests:
   - Unit: `npm run test.unit`
   - Component: `npm run test.component`
   - E2E: `npm run test.e2e`

## Configuration
- Environment variables: see `vite.config.ts` and `cypress.config.ts`
- Tailwind CSS: see `tailwind.config.js`
- TypeScript: see `tsconfig.json`

## Testing
- Cypress for E2E/component tests (`cypress/`)
- Vitest for unit tests
- See `TESTING_STRATEGY.md` for details

## Internationalization
- i18next and react-i18next
- Language switcher in settings and I18nTestPage

## Theming
- Dark/light mode toggle in settings
- Custom themes in `theme/`

## API
- Axios-based clients in `src/api/`
- Backend API URL: see `cypress.config.ts` (`env.apiUrl`)

## Deployment
- Build: `npm run build`
- Preview: `npm run preview`
- Docker support for production

## Useful Links
- [TESTING_STRATEGY.md](./app-TESTING_STRATEGY.md)
- [Configuration](./app-config-README.md)

---
For more details, see individual docs in this wiki.
