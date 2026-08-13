const js = require("@eslint/js");
const parser = require("@typescript-eslint/parser");
const plugin = require("@typescript-eslint/eslint-plugin");
const stylistic = require("@stylistic/eslint-plugin");

module.exports = [
  {
    ignores: ["node_modules", "build", "dist"],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        jest: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": plugin,
      "@stylistic": stylistic,
    },
    rules: {
      "quotes": ["error", "double"],
      "semi": "off",
      "@stylistic/semi": ["error", "always"],
      "@typescript-eslint/no-explicit-any": [
        "error",
        { fixToUnknown: true },
      ],
      "curly": "error",
      "no-empty": "error",
      "no-console": "error",
      "no-alert": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-fallthrough": "off",
      "arrow-parens": ["error", "as-needed"],
    },
  },
];

