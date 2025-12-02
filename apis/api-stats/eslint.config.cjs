// eslint.config.cjs (ESLint v9+ flat config for CommonJS)
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': ['warn'],
      'prefer-const': ['error'],
      'no-var': ['error'],
      'object-shorthand': ['error'],
      'prefer-template': ['error']
    }
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];