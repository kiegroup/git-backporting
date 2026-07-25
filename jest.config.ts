import type { Config } from "@jest/types";
// Sync object
const jestConfig: Config.InitialOptions = {
  verbose: true,
  transform: {
    // Transpile TS sources and the ESM-only deps whitelisted below (e.g. @octokit/*)
    // down to CommonJS so they can run under jest's CJS runtime.
    "^.+\\.[tj]sx?$": ["ts-jest", { isolatedModules: true, allowJs: true }],
  },
  // By default jest does not transform node_modules. @octokit/rest (and its deps)
  // are ESM-only, so whitelist them to be transformed by ts-jest above.
  transformIgnorePatterns: [
    "node_modules/(?!(@octokit|before-after-hook|universal-user-agent)/)",
  ],
  moduleNameMapper: {
    "^@bp/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
  restoreMocks: false,
  resetMocks: false,
  modulePathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/dist/"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/", "<rootDir>/build/", "<rootDir>/dist/"]
};
export default jestConfig;
