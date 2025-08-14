import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "cypress.config.ts",
      "android/**/*",
      "capacitor-cordova-android-plugins/**/*",
      "**/build/**/*",
      "**/node_modules/**/*",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-console":
        (process.env.NODE_ENV || "development") === "production"
          ? "warn"
          : "off",
      "no-debugger":
        (process.env.NODE_ENV || "development") === "production"
          ? "warn"
          : "off",
    },
  },
  // Cypress-specific configuration
  {
    files: ["cypress/**/*.{ts,js}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: "readonly",
        Cypress: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        before: "readonly",
        after: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
