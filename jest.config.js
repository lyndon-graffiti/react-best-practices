const { join } = require("path");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  // default node, you can use a browser-like environment through jsdom instead
  testEnvironment: "node",
  rootDir: join(__dirname, "./"),
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  testTimeout: 20 * 1000,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  setupFilesAfterEnv: ["<rootDir/test/setup-test.js>"],
  transformIgnorePatterns: ["<rootDir/node_modules/(?!lodash-es)>"],
  transform: { "^.+\\.(j|t)sx?$": "ts-jest" },
  moduleNameMapper: {
    "^.+\\.svg(\\?as=url)?$": "<rootDir>/test/svg_transformer.js",
    ".(css|sass|scss|less)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif)$": "<rootDir>/test/file_transformer.js",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },
};
