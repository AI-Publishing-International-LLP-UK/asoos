# OAuth2 API Migration Plan - Claude and OpenAI

## 🎯 Objective
Migrate Claude (Anthropic) and OpenAI APIs from API key authentication to OAuth2, aligning with your enterprise security standards and existing OAuth2 infrastructure.

## 📊 Current State Analysis

### ✅ OAuth2 Infrastructure Already in Place
- **SallyPort OAuth2 Provider**: Multi-tenant OAuth2 server deployed
- **Universal AI Key Manager**: Supports OAuth2 patterns
- **OAuth2 Client Library**: Complete implementation at `/lib/oauth2/client.js`
- **Enterprise OAuth2 Integrations**: Stripe, Xero, PandaDoc, QMM, Monzo

### ⚠️ Services Still Using API Keys
- **Claude API (Anthropic)**: Using `x-api-key` header
- **OpenAI API**: Using `Authorization: Bearer` with API key
- **ElevenLabs API**: Using `xi-api-key` header
- **Hume AI**: Using `X-Hume-Api-Key` header

## 🚀 Migration Strategy

### Phase 1: Claude API OAuth2 Implementation

#### 1.1 Update Universal AI Key Manager
Modify `/lib/universal-ai-key-manager.js`:

```javascript
anthropic: {
    name: 'Anthropic Claude',
    secretPrefix: 'anthropic-oauth2',
    managementAPI: 'https://console.anthropic.com/api/v1',
    tokenEndpoint: 'https://auth.anthropic.com/oauth2/token',
    authEndpoint: 'https://auth.anthropic.com/oauth2/authorize', 
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    headerName: 'Authorization', // Bearer token
    bearerToken: true,
    scopes: ['messages:write', 'messages:read', 'models:read'],
    supportsCustomerKeys: false,
    supportsProvisioning: true,
    authType: 'oauth2' // NEW: Specify OAuth2
}
```

#### 1.2 Update Claude Integration Points
Files to modify:
- `/commands/claude/code/generate.js`
- `/cloud-functions/dr-claude/index.js`
- `/tests/test-claude-api.sh`

Pattern:
```javascript
// Replace API key authentication
const response = await anthropicOAuth.fetchWithToken(functionUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
});
```

### Phase 2: OpenAI API OAuth2 Implementation

#### 2.1 Update OpenAI Configuration
```javascript
openai: {
    name: 'OpenAI',
    secretPrefix: 'openai-oauth2',
    tokenEndpoint: 'https://auth.openai.com/oauth2/token',
    authEndpoint: 'https://auth.openai.com/oauth2/authorize',
    testEndpoint: 'https://api.openai.com/v1/models',
    headerName: 'Authorization',
    bearerToken: true,
    scopes: ['api.read', 'api.write', 'models.read'],
    authType: 'oauth2'
}
```

#### 2.2 Update OpenAI Integration Points
Files to modify:
- All `/data/openai-*/conversations.json` processing
- OpenAI API calls in conversation scrapers
- Multi-account conversation fetchers

### Phase 3: ElevenLabs OAuth2 Implementation

#### 3.1 ElevenLabs OAuth2 Configuration
Since ElevenLabs may not support OAuth2 yet, implement through your enterprise OAuth2 proxy:

```javascript
elevenlabs: {
    name: 'ElevenLabs',
    secretPrefix: 'elevenlabs-oauth2-proxy',
    tokenEndpoint: 'https://oauth2-server-multi-tenant.run.app/api/proxy/elevenlabs/token',
    authEndpoint: 'https://oauth2-server-multi-tenant.run.app/api/proxy/elevenlabs/authorize',
    testEndpoint: 'https://api.elevenlabs.io/v1/voices',
    headerName: 'Authorization',
    bearerToken: true,
    authType: 'oauth2-proxy' // Custom proxy implementation
}
```

## 🔧 Implementation Steps

### Step 1: Update OAuth2 Client Library
Enhance `/lib/oauth2/client.js` with AI-specific providers:

```javascript
// Add AI provider configurations
const AI_PROVIDERS = {
    anthropic: {
        tokenEndpoint: 'https://auth.anthropic.com/oauth2/token',
        authEndpoint: 'https://auth.anthropic.com/oauth2/authorize',
        scopes: ['messages:write', 'messages:read', 'models:read']
    },
    openai: {
        tokenEndpoint: 'https://auth.openai.com/oauth2/token', 
        authEndpoint: 'https://auth.openai.com/oauth2/authorize',
        scopes: ['api.read', 'api.write', 'models.read']
    }
};
```

### Step 2: Environment Variables Update
Add to your GCP Secret Manager:

```bash
# Claude OAuth2
CLAUDE_OAUTH_CLIENT_ID
CLAUDE_OAUTH_CLIENT_SECRET
CLAUDE_OAUTH_REDIRECT_URI

# OpenAI OAuth2  
OPENAI_OAUTH_CLIENT_ID
OPENAI_OAUTH_CLIENT_SECRET
OPENAI_OAUTH_REDIRECT_URI
```

### Step 3: Update Service Configurations
Modify these configuration files:
- `/config/oauth2-config.json`
- `/cloudbuild-oauth2.yaml`
- `/Dockerfile.oauth2`

### Step 4: Deploy OAuth2-Enabled Services
Use existing deployment scripts:
- `/deploy-oauth2-elevenlabs-fixed.sh`
- `/deploy-oauth2-minimal.sh`

## 🛡️ Security Enhancements

### Enhanced Security with OAuth2
- **Token Rotation**: Automatic refresh token rotation
- **Scope Limitation**: Restrict API access to required scopes only
- **Audit Trail**: Complete OAuth2 authentication logging
- **Multi-Tenant Isolation**: Customer-specific OAuth2 tokens

### Integration with SallyPort
Route all AI API OAuth2 through your SallyPort security center:
```
AI API Request → SallyPort OAuth2 Validation → AI Service OAuth2 → API Response
```

## 📈 Benefits After Migration

### Immediate Benefits
- ✅ **Unified Authentication**: All APIs use OAuth2
- ✅ **Enhanced Security**: Token-based vs. static API keys
- ✅ **Better Monitoring**: Centralized OAuth2 analytics
- ✅ **Compliance**: Enterprise-grade authentication

### Long-term Benefits
- 🔄 **Automatic Token Rotation**
- 📊 **Granular Access Control**
- 🛡️ **Reduced Credential Exposure**
- 📈 **Scalable Authentication Architecture**

## 🚀 Deployment Timeline

### Week 1: Claude API OAuth2
- Day 1-2: Update OAuth2 configurations
- Day 3-4: Modify Claude integration points
- Day 5: Deploy and test

### Week 2: OpenAI API OAuth2
- Day 1-2: Update OpenAI configurations
- Day 3-4: Modify OpenAI integration points
- Day 5: Deploy and test

### Week 3: ElevenLabs OAuth2 Proxy
- Day 1-3: Build OAuth2 proxy service
- Day 4-5: Deploy and integrate

### Week 4: Testing & Validation
- Comprehensive testing across all 20M agents
- Performance validation
- Security audit

## 🔍 Success Metrics

- [ ] **100% OAuth2 Coverage**: All AI APIs use OAuth2
- [ ] **Zero API Key Exposure**: No static keys in code
- [ ] **Performance Maintained**: No degradation in API response times
- [ ] **Security Enhanced**: Complete audit trail for all API calls
- [ ] **Customer Isolation**: OAuth2 tokens per customer/tenant

## 🎯 Next Actions

1. **Review and approve** this migration plan
2. **Set up OAuth2 applications** with Claude and OpenAI
3. **Begin Phase 1** with Claude API migration
4. **Test incrementally** with a subset of the 20M agents
5. **Roll out progressively** across all customer MCP instances

This migration will align your entire AI API infrastructure with OAuth2 enterprise security standards while maintaining the excellent MCP RESTful architecture you've already built.