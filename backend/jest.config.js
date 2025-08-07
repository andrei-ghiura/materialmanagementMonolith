module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFilesAfterEnv: ["./jest.setup.js"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000, // Increase timeout for MongoDB Memory Server operations
  collectCoverageFrom: [
    "*.js",
    "!jest.config.js",
    "!jest.setup.js",
    "!coverage/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
