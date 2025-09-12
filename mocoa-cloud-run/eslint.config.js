const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.env*',
      '*.log',
      'logs/',
      '**/.next/',
      '**/.cache/',
      '**/coverage/',
      '**/.nyc_output/',
      '.vscode/',
      '.idea/',
      '**/.DS_Store',
      '**/Thumbs.db',
      // Problematic directories with spaces and special characters
      'integration-gateway/.workspace/',
      'integration-gateway/vls/solutions/solutions/dr.*',
      '**/dr.*',
      '**/.workspace/',
      '**/staging-extras/',
      // Data files that don't need linting
      '**/*.json',
      '**/*.md',
      '**/*.txt',
      '**/*.csv',
      // Backup and temporary files
      '**/*.backup',
      '**/*.bak',
      '**/.*.swp',
      '**/.*.swo',
      '**/*.tmp',
      '**/*.temp',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1, 200, 404, 500, 1000, 1024, 3000, 8080, 10000, 20000000, 30],
          ignoreArrayIndexes: true,
          enforceConst: true,
        },
      ],
    },
  },
  {
    files: ['*.js'],
    rules: {
      'no-process-exit': 'off',
    },
  },
  {
    files: ['*-worker.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        crypto: 'readonly',
      },
    },
  },
];