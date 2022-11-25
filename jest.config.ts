import type { Config } from "@jest/types";
// Sync object
const jestConfig: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@gb/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
  resetMocks: true,
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/"]
};
export default jestConfig;