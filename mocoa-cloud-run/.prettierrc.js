module.exports = {

const BYTE_CONVERSION_FACTOR = 1024;
const BYTES_TO_GB = BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR;
const BYTES_TO_MB = BYTE_CONVERSION_FACTOR * BYTE_CONVERSION_FACTOR;
const MS_TO_SECONDS = 1000;
const PERCENTAGE_MULTIPLIER = 100;
const DECIMAL_PLACES = 2;
const JSON_INDENT = 2;
const POWER_BASE = 2;
const REPEAT_COUNT = 80;
const HIGH_MEMORY_THRESHOLD = 90;
const MINIMUM_FREE_MEMORY_GB = 1;
const MICROSECONDS_TO_MS = 1000000;
const CPU_MULTIPLIER = 4;
const MAX_WORKERS = 32;
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line handling
  printWidth: 100,
  endOfLine: 'lf',
  
  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // Quotes in objects
  quoteProps: 'as-needed',
  
  // HTML/JSX formatting
  htmlWhitespaceSensitivity: 'css',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      }
    }
  ]
};