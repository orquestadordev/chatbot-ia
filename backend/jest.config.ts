import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json"
    }
  }
};

export default config;
