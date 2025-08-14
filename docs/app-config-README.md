
# App Configuration

## TypeScript
- Strict mode enabled (`tsconfig.json`)
- JSX: React 19
- Module resolution: Node
- Includes `src/`, `apiBAK/`, and `cypress/`

## Vite
- Plugins: React, Legacy
- Dev server: `0.0.0.0:5173`
- Test setup: Vitest, jsdom, `setupTests.ts`

## Tailwind CSS
- Config: `tailwind.config.js`
- Content: `index.html`, all files in `src/`

## Cypress
- E2E base URL: `http://localhost:5173`
- API URL: `http://localhost:3001`
- Component tests: Vite + React
- Video/screenshots enabled

## ESLint
- Config: `eslint.config.js`
- Plugins: React, React Hooks, React Refresh

## Capacitor
- Plugins for barcode scanning, filesystem, notifications, haptics, etc.
- Android support

## Environment Variables
- Set in Vite and Cypress configs
- API URLs, timeouts, etc.

---
See the main [App Wiki](./app-README.md) for more details.
