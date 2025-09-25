/**
 * Client-Side Authentication Service
 * Handles token management and authentication checks.
 */

const TOKEN_KEY = 'sallyport_oauth_token';

/**
 * Stores the authentication token.
 * @param {string} token The OAuth token.
 */
export function storeToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
        console.error('Failed to store auth token in localStorage', e);
    }
}

/**
 * Retrieves the authentication token.
 * @returns {string|null} The stored token or null if not found.
 */
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        console.error('Failed to retrieve auth token from localStorage', e);
        return null;
    }
}

/**
 * Removes the authentication token.
 */
export function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        console.error('Failed to clear auth token from localStorage', e);
    }
}

/**
 * Checks if the user is authenticated.
 * For this example, it just checks for the presence of a token.
 * In a real app, you would validate this token against the server.
 * @returns {boolean} True if a token exists, false otherwise.
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Redirects the user to the login page if they are not authenticated.
 */
export function enforceAuthentication() {
    if (!isAuthenticated()) {
        console.warn('User not authenticated. Redirecting to login...');
        // In a real application, you would redirect to your actual login page.
        // For now, we'll just log it. A real redirect would be:
        // window.location.href = '/auth/login?return=' + encodeURIComponent(window.location.pathname);
    } else {
        console.log('✅ User is authenticated.');
    }
}

/**
 * A mock login function to simulate getting a token.
 * Replace this with your actual login flow.
 * @returns {string} A demo token.
 */
export function performLogin() {
    const demoToken = 'asoos_oauth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    storeToken(demoToken);
    console.log('🔐 Logged in with demo token.');
    return demoToken;
}