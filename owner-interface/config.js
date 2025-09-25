/**
 * Global Configuration and Constants
 */

// OAuth2 SallyPort Configuration
export const SALLYPORT_AUTH_URL = 'https://sallyport.2100.cool/api/validate';
export const SALLYPORT_OAUTH_URL = 'https://sallyport.2100.cool/oauth/authorize';

// Initial State (can be moved to a state management file later)
export const initialState = {
    activeRIX: 'QB',
    activeMode: 'terminal',
    rightPanelState: 'normal', // normal, expanded, full-width, hidden
    isPanelLocked: false,
    isResizing: false,
    userRole: 'owner', // owner, admin, diamond-sao, team-member, individual
    userLevel: 'enterprise', // individual, team-member, team-leader, practitioner, enterprise
    cliMode: 'terminal', // terminal, code, chat
    apiConnected: false,
    selectedModel: 'claude-code',
    authLevel: 3, // V99 Progressive Authentication Level
    oauthToken: null,
};