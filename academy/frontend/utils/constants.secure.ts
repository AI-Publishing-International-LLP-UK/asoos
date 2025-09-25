import { getSecret } from '../../../src/utils/secrets.js';

/**
 * Secure Academy Frontend Constants
 * Uses Google Secret Manager instead of hardcoded secrets
 * Part of PR #9 secret removal initiative
 */

// Get authentication header from Secret Manager
export const getHeaderSecret = async () => {
  try {
    const token = await getSecret('academy/production/bearer-token');
    return `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to retrieve academy bearer token:', error);
    throw new Error('Authentication token not available');
  }
};

// Get API key for academy services
export const getAcademyApiKey = async () => {
  try {
    return await getSecret('academy/production/api-key');
  } catch (error) {
    console.error('Failed to retrieve academy API key:', error);
    throw new Error('Academy API key not available');
  }
};

// Get JWT secret for academy authentication
export const getJwtSecret = async () => {
  try {
    return await getSecret('academy/production/jwt-secret');
  } catch (error) {
    console.error('Failed to retrieve JWT secret:', error);
    throw new Error('JWT secret not available');
  }
};

// Environment configuration
export const ACADEMY_CONFIG = {
  environment: process.env.NODE_ENV || 'production',
  apiUrl: process.env.ACADEMY_API_URL || 'https://academy-api.2100.cool',
  wsUrl: process.env.ACADEMY_WS_URL || 'wss://academy-ws.2100.cool'
};

// Legacy support - will be removed after migration
export const HEADER_SECRET = 'DEPRECATED_USE_getHeaderSecret_FUNCTION';