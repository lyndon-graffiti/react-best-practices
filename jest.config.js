/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  // default node, you can use a browser-like environment through jsdom instead
  testEnvironment: "node",
  testTimeout: 20 * 1000,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  transform: { "^.+\\.(j|t)sx?$": "ts-jest" },
};
