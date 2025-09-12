import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      // Add your custom rules here
      'no-unused-vars': 'warn',
      'no-console': 'off', // Allow console.log for development
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
  {
    // Configuration for TypeScript files if needed
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
  },
  {
    // Ignore patterns
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.min.js',
    ],
  },
];
