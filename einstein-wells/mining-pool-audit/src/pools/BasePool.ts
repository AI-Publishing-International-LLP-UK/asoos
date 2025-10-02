/**
 * Abstract BasePool Client with OAuth2/OIDC Authentication
 * Einstein Wells Division - AI Publishing International LLP
 * 
 * Internal-only mining pool access with secure OAuth2 flows
 * No external API sharing - enterprise security focused
 */

import { spawn } from 'child_process';
import { Issuer, Client, TokenSet } from 'openid-client';
import { auditLogger } from '../logger';
import { OAuth2Config, MiningPoolBalance, PayoutRule } from '../types';

export interface PoolApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export abstract class BasePool {
  protected poolName: string;
  protected oauth2Config: OAuth2Config;
  private client: Client | null = null;
  private tokenSet: TokenSet | null = null;
  private tokenRefreshPromise: Promise<TokenSet> | null = null;

  constructor(poolName: string, oauth2Config: OAuth2Config) {
    this.poolName = poolName;
    this.oauth2Config = oauth2Config;
  }

  /**
   * Initialize OAuth2 client and perform authentication
   */
  protected async initializeAuth(): Promise<void> {
    try {
      auditLogger.oauth2Flow(this.poolName, 'initialize', true, { 
        authUrl: this.oauth2Config.authorizationUrl 
      });

      // Discover OIDC issuer
      const issuer = await Issuer.discover(this.oauth2Config.authorizationUrl);
      
      // Create OAuth2 client
      this.client = new issuer.Client({
        client_id: this.oauth2Config.clientId,
        client_secret: this.oauth2Config.clientSecret,
        redirect_uris: [this.oauth2Config.redirectUri],
        response_types: ['code'],
      });

      // Perform client credentials flow for machine-to-machine authentication
      this.tokenSet = await this.client.grant({
        grant_type: 'client_credentials',
        scope: this.oauth2Config.scope.join(' '),
      });

      auditLogger.oauth2Flow(this.poolName, 'token_acquired', true, {
        tokenType: this.tokenSet.token_type,
        expiresIn: this.tokenSet.expires_in,
      });

    } catch (error) {
      auditLogger.oauth2Flow(this.poolName, 'initialize', false, { error });
      throw new Error(`OAuth2 initialization failed for ${this.poolName}: ${error}`);
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  private async getValidToken(): Promise<string> {
    if (!this.tokenSet) {
      await this.initializeAuth();
    }

    // Check if token needs refresh
    if (this.tokenSet!.expired()) {
      // Prevent multiple concurrent refresh attempts
      if (!this.tokenRefreshPromise) {
        this.tokenRefreshPromise = this.refreshToken();
      }
      await this.tokenRefreshPromise;
      this.tokenRefreshPromise = null;
    }

    return this.tokenSet!.access_token!;
  }

  /**
   * Refresh expired access token
   */
  private async refreshToken(): Promise<TokenSet> {
    try {
      auditLogger.oauth2Flow(this.poolName, 'token_refresh', true);
      
      if (!this.client) {
        throw new Error('OAuth2 client not initialized');
      }

      // For client credentials flow, we just re-authenticate
      this.tokenSet = await this.client.grant({
        grant_type: 'client_credentials',
        scope: this.oauth2Config.scope.join(' '),
      });

      auditLogger.oauth2Flow(this.poolName, 'token_refreshed', true);
      return this.tokenSet;
    } catch (error) {
      auditLogger.oauth2Flow(this.poolName, 'token_refresh', false, { error });
      throw error;
    }
  }

  /**
   * Execute authenticated HTTP request using curl
   */
  protected async _request<T = any>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<PoolApiResponse<T>> {
    
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const token = await this.getValidToken();
        
        // Build curl command
        const curlArgs = [
          '-s', // Silent
          '-X', method,
          '-H', `Authorization: Bearer ${token}`,
          '-H', 'Content-Type: application/json',
          '-H', 'User-Agent: EinsteinWells-InternalAudit/1.0',
        ];

        // Add additional headers
        if (additionalHeaders) {
          Object.entries(additionalHeaders).forEach(([key, value]) => {
            curlArgs.push('-H', `${key}: ${value}`);
          });
        }

        // Add request body for POST/PUT
        if (body && (method === 'POST' || method === 'PUT')) {
          curlArgs.push('-d', JSON.stringify(body));
        }

        // Add URL
        curlArgs.push(endpoint);

        auditLogger.debug(`Making ${method} request to ${this.poolName}`, { 
          endpoint: endpoint.replace(/\/[^\/]*$/, '/***'), // Hide sensitive parts of URL
          attempt: attempt + 1 
        });

        const response = await this.executeCurl(curlArgs);
        
        if (response.success) {
          auditLogger.poolOperation(this.poolName, `${method} ${endpoint}`, true);
          return response;
        } else if (response.statusCode === 401 && attempt < maxRetries - 1) {
          // Token might be invalid, force refresh
          this.tokenSet = null;
          attempt++;
          continue;
        } else {
          throw new Error(response.error || 'Request failed');
        }

      } catch (error) {
        attempt++;
        auditLogger.poolOperation(this.poolName, `${method} ${endpoint}`, false, { 
          error: error instanceof Error ? error.message : error,
          attempt 
        });

        if (attempt >= maxRetries) {
          throw new Error(`Request failed after ${maxRetries} attempts: ${error}`);
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Maximum retries exceeded');
  }

  /**
   * Execute curl command and parse response
   */
  private async executeCurl(args: string[]): Promise<PoolApiResponse> {
    return new Promise((resolve) => {
      const curl = spawn('curl', args);
      let stdout = '';
      let stderr = '';

      curl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      curl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      curl.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: `curl exited with code ${code}: ${stderr}`,
            statusCode: code || undefined,
          });
          return;
        }

        try {
          // Try to parse JSON response
          const data = stdout.trim() ? JSON.parse(stdout) : {};
          resolve({
            success: true,
            data,
            statusCode: 200,
          });
        } catch (parseError) {
          // If not JSON, return raw response
          resolve({
            success: true,
            data: stdout.trim(),
            statusCode: 200,
          });
        }
      });

      curl.on('error', (error) => {
        resolve({
          success: false,
          error: `curl error: ${error.message}`,
        });
      });
    });
  }

  // Abstract methods to be implemented by pool-specific clients
  abstract getBalances(): Promise<MiningPoolBalance[]>;
  abstract getPayoutRules(): Promise<PayoutRule[]>;
  
  // Optional method for pool-specific health checks
  async healthCheck(): Promise<boolean> {
    try {
      await this.getValidToken();
      return true;
    } catch (error) {
      auditLogger.error(`Health check failed for ${this.poolName}`, error);
      return false;
    }
  }

  // Get pool name
  getPoolName(): string {
    return this.poolName;
  }
}