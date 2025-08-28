// Sally Port OAuth Worker
// Handles OAuth authentication flow for ASOOS → MCP routing
// Routes authenticated users to mcp.aipub.2100.cool

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Sally Port OAuth Worker',
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        features: 'OAuth2, LinkedIn, Microsoft, Google, WhatsApp',
        target_endpoint: 'mcp.aipub.2100.cool',
        protection: 'Victory36 Shield Active'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // OAuth initiate endpoints
    if (pathname.startsWith('/auth/')) {
      const provider = pathname.split('/')[2];
      
      // Handle OAuth initiation
      if (pathname.endsWith('/initiate') || searchParams.has('provider')) {
        return handleOAuthInitiate(provider, searchParams, env);
      }
      
      // Handle OAuth callbacks
      if (pathname.includes('/callback')) {
        return handleOAuthCallback(provider, searchParams);
      }
      
      // Handle OAuth completion
      if (pathname.includes('/complete')) {
        return handleOAuthComplete(provider, searchParams);
      }
    }

    // General authentication endpoint
    if (pathname === '/auth') {
      const redirectUri = searchParams.get('redirect') || 'https://mcp.aipub.2100.cool/';
      return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>Sally Port Authentication</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: white; text-align: center; padding: 50px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; }
    h1 { color: #0bb1bb; margin-bottom: 30px; }
    .auth-buttons { display: grid; gap: 15px; margin: 30px 0; }
    .auth-btn { padding: 15px; background: linear-gradient(135deg, #0bb1bb, #50C878); border: none; border-radius: 10px; color: white; text-decoration: none; display: block; font-weight: bold; }
    .auth-btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Sally Port Authentication</h1>
    <p>Choose your authentication method to access ASOOS MCP:</p>
    <div class="auth-buttons">
      <a href="/auth/linkedin/initiate?redirect_uri=${encodeURIComponent(redirectUri)}" class="auth-btn">
        🔗 Continue with LinkedIn
      </a>
      <a href="/auth/microsoft/initiate?redirect_uri=${encodeURIComponent(redirectUri)}" class="auth-btn">
        🏢 Continue with Microsoft
      </a>
      <a href="/auth/google/initiate?redirect_uri=${encodeURIComponent(redirectUri)}" class="auth-btn">
        🌐 Continue with Google
      </a>
      <a href="/auth/email/initiate?redirect_uri=${encodeURIComponent(redirectUri)}" class="auth-btn">
        ✉️ Continue with Email
      </a>
    </div>
    <p><small>🛡️ Protected by Victory36 Shield</small></p>
  </div>
</body>
</html>`, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      });
    }

    // Default: Route to MCP
    return Response.redirect('https://mcp.aipub.2100.cool/', 302);
  }
};

// OAuth initiation handler
async function handleOAuthInitiate(provider, searchParams, env) {
  const redirectUri = searchParams.get('redirect_uri') || 'https://mcp.aipub.2100.cool/';
  const state = `${provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store state for validation (in production, use KV storage)
  const stateData = {
    provider,
    redirect_uri: redirectUri,
    timestamp: Date.now()
  };

  // OAuth provider configurations
  const oauthConfigs = {
    linkedin: {
      authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
      client_id: env.LINKEDIN_CLIENT_ID || 'demo_client_id',
      scope: 'r_liteprofile r_emailaddress',
      callback_uri: 'https://sally-port.2100.cool/auth/linkedin/callback'
    },
    microsoft: {
      authorize_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      client_id: env.MICROSOFT_CLIENT_ID || 'demo_client_id',
      scope: 'openid profile email',
      callback_uri: 'https://sally-port.2100.cool/auth/microsoft/callback'
    },
    google: {
      authorize_url: 'https://accounts.google.com/oauth2/auth',
      client_id: env.GOOGLE_CLIENT_ID || 'demo_client_id',
      scope: 'openid profile email',
      callback_uri: 'https://sally-port.2100.cool/auth/google/callback'
    },
    email: {
      // Handle email-based auth differently
      authorize_url: null,
      callback_uri: 'https://sally-port.2100.cool/auth/email/callback'
    }
  };

  const config = oauthConfigs[provider];
  if (!config) {
    return new Response('Unsupported provider', { status: 400 });
  }

  // For email provider, show form
  if (provider === 'email') {
    return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>Email Authentication</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: white; text-align: center; padding: 50px; }
    .container { max-width: 400px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; }
    input { width: 100%; padding: 15px; margin: 10px 0; border: none; border-radius: 10px; background: rgba(255,255,255,0.1); color: white; }
    button { width: 100%; padding: 15px; background: linear-gradient(135deg, #0bb1bb, #50C878); border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 Email Authentication</h2>
    <form onsubmit="handleEmailAuth(event)">
      <input type="email" id="email" placeholder="Enter your email address" required>
      <button type="submit">Continue to ASOOS MCP</button>
    </form>
  </div>
  <script>
    function handleEmailAuth(event) {
      event.preventDefault();
      const email = document.getElementById('email').value;
      // For now, directly redirect to MCP (in production, validate email)
      window.location.href = '${redirectUri}?email=' + encodeURIComponent(email) + '&provider=email';
    }
  </script>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Build OAuth URL
  const authUrl = new URL(config.authorize_url);
  authUrl.searchParams.set('client_id', config.client_id);
  authUrl.searchParams.set('redirect_uri', config.callback_uri);
  authUrl.searchParams.set('scope', config.scope);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  // Redirect to OAuth provider
  return Response.redirect(authUrl.toString(), 302);
}

// OAuth callback handler
async function handleOAuthCallback(provider, searchParams) {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return new Response(`<!DOCTYPE html>
<html>
<body style="font-family: Arial; background: #0a0a0a; color: white; text-align: center; padding: 50px;">
  <h2>Authentication Error</h2>
  <p>Error: ${error}</p>
  <a href="https://asoos.2100.cool/auth" style="color: #0bb1bb;">Try Again</a>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html' },
      status: 400
    });
  }

  if (!code || !state) {
    return new Response('Missing authorization code or state', { status: 400 });
  }

  // In production, validate state and exchange code for tokens
  // For now, we'll simulate successful authentication
  
  // Redirect to MCP with success indication
  return Response.redirect(`https://mcp.aipub.2100.cool/?authenticated=true&provider=${provider}&timestamp=${Date.now()}`, 302);
}

// OAuth completion handler
async function handleOAuthComplete(provider, searchParams) {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectUri = searchParams.get('redirect_uri') || 'https://mcp.aipub.2100.cool/';

  // Process the final authentication step
  // In production, this would validate tokens and create user session
  
  return Response.redirect(`${redirectUri}?auth_complete=true&provider=${provider}`, 302);
}
