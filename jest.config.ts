import type { Config } from "@jest/types";
// Sync object
const jestConfig: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@bp/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
  resetMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/dist/"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/", "<rootDir>/build/", "<rootDir>/dist/"]
};
export default jestConfig;
