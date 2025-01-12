import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        useESM: true,
      },
    ],
  },

  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  
  // Updated moduleNameMapper
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^(\\.{1,2}/.*)\\.ts$": "$1",
    "^(\\.{1,2}/.*)\\.tsx$": "$1"
  },

  resolver: "ts-jest-resolver",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__test__/**/*.test.ts",
    "**/*.test.ts",
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/__tests__/",
    "/__mocks__/",
  ],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;