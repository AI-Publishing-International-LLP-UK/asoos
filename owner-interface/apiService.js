import { getToken } from './auth.js';

/**
 * Unified API Service
 *
 * This class is the single source of truth for all frontend-to-backend communication.
 * It automatically handles authentication, error handling, and request configuration.
 * No more scattered `fetch` calls!
 */
class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * A wrapper around the native fetch API that adds authentication and error handling.
     * @param {string} endpoint The API endpoint to call (e.g., '/gcp/secrets/my-secret').
     * @param {object} options The standard fetch options object.
     * @returns {Promise<Response>} The fetch Response object.
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Automatically attach the authentication token to every request
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                // Centralized error handling
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error(`API Error: ${response.status} ${url}`, errorData);
                // Here you could trigger a global error notification
                // showNotification(`API Error: ${errorData.message || response.statusText}`, 'error');
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return response;
        } catch (error) {
            console.error(`Network or fetch error for ${url}:`, error);
            // showNotification('Network error. Please check your connection.', 'error');
            throw error;
        }
    }

    /**
     * Helper method for GET requests.
     * @param {string} endpoint The API endpoint.
     * @param {object} options Fetch options.
     * @returns {Promise<any>} The JSON response.
     */
    async get(endpoint, options = {}) {
        const response = await this.request(endpoint, { ...options, method: 'GET' });
        return response.json();
    }

    /**
     * Helper method for POST requests.
     * @param {string} endpoint The API endpoint.
     * @param {object} body The request body.
     * @param {object} options Fetch options.
     * @returns {Promise<any>} The JSON response.
     */
    async post(endpoint, body, options = {}) {
        const response = await this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
        return response.json();
    }

    /**
     * Helper method for semantic search requests to Pinecone.
     * @param {string} query The search query.
     * @param {number} topK The number of results to return.
     * @returns {Promise<any>} The JSON response with search results.
     */
    async search(query, topK = 5) {
        console.log(`🌲 Performing semantic search for: "${query}"`);
        return this.post('/pinecone/search', {
            query,
            topK,
        });
    }
}

// Export a single, ready-to-use instance of the ApiService
export const apiService = new ApiService();