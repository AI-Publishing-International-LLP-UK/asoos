import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

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
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      // Prefer arrow functions
      'prefer-arrow-callback': 'error',
      // Disallow use of eval()
      'no-eval': 'error',
      // Disallow use of undefined when initializing variables
      'no-undef-init': 'error',
      // Max line length
      'max-len': [
        'error',
        {
          code: 100,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },
  {
    // Configuration for TypeScript files if needed
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
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
      'vls/**',
      '**/dr.*/**',
      '**/*dr.*/**',
      'aixtiv-backup-*/**',
      '**/solutions/**',
      '*.log',
      '.git/**',
      'opus/**',
      'coverage/**',
      'tmp/**',
      '.DS_Store'
    ],
  },
];
