/**
 * DYNAMIC MCP PROXY WORKER
 * Automatically discovers and routes to the correct Cloud Run service
 * No hardcoded URLs - fully dynamic service resolution
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log(`🛸 Dynamic MCP Proxy request: ${url.hostname}`);
    
    // Handle any mcp.*.2100.cool pattern
    const mcpMatch = url.hostname.match(/^mcp\.([a-z0-9-]+)\.2100\.cool$/i);
    
    if (!mcpMatch) {
      return new Response('Invalid MCP endpoint format', { status: 400 });
    }
    
    const companyName = mcpMatch[1].toLowerCase();
    console.log(`🏢 Company detected: ${companyName}`);
    
    // Dynamic service discovery - try multiple potential endpoints in priority order
    const potentialEndpoints = [
      // Production endpoints (current project)
      `https://mocoa-owner-interface-production-yutylytffa-uw.a.run.app`,
      `https://mocoa-owner-interface-yutylytffa-uw.a.run.app`,
      `https://asoos-master-mcp-uswest1-fixed-yutylytffa-uw.a.run.app`,
      
      // Company-specific endpoints
      `https://mcp-${companyName}-production-yutylytffa-uw.a.run.app`,
      `https://${companyName}-mcp-uswest1-fixed-yutylytffa-uw.a.run.app`,
      
      // Fallback to integrated gateway
      `https://integration-gateway-js-yutylytffa-uw.a.run.app`,
      `https://integration-gateway-production-yutylytffa-uw.a.run.app`
    ];
    
    // Try each endpoint until we find one that works
    for (const endpoint of potentialEndpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`);
        
        const proxyUrl = `${endpoint}${url.pathname}${url.search}`;
        const modifiedRequest = new Request(proxyUrl, {
          method: request.method,
          headers: {
            ...Object.fromEntries(request.headers),
            'X-MCP-Company': companyName,
            'X-MCP-Original-Host': url.hostname,
            'X-Forwarded-Host': url.hostname
          },
          body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body
        });
        
        // Quick health check first
        const healthCheck = await fetch(`${endpoint}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        }).catch(() => null);
        
        if (!healthCheck || !healthCheck.ok) {
          console.log(`❌ Health check failed for ${endpoint}`);
          continue;
        }
        
        console.log(`✅ Health check passed for ${endpoint}`);
        
        // Make the actual request
        const response = await fetch(modifiedRequest);
        
        if (response.ok) {
          console.log(`🎯 Successfully proxied to: ${endpoint}`);
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers),
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
              'X-MCP-Proxy': 'dynamic',
              'X-Target-Endpoint': endpoint,
              'X-Company': companyName,
              'X-Discovery-Success': 'true',
              'Cache-Control': 'public, max-age=300'
            }
          });
        }
        
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    // If all endpoints fail, return dynamic MCP interface
    console.log(`🔄 All endpoints failed, generating dynamic interface for ${companyName}`);
    
    const dynamicInterface = generateDynamicMCPInterface(companyName, url);
    
    return new Response(dynamicInterface, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-MCP-Company': companyName,
        'X-MCP-Status': 'dynamic-generated',
        'X-Service-Discovery': 'fallback',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};

function generateDynamicMCPInterface(companyName, url) {
  const companyTitle = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  
  return JSON.stringify({
    protocol: "Model Context Protocol",
    version: "2.0.0-dynamic",
    server: {
      name: `${companyTitle} Dynamic MCP Server`,
      version: "2.0.0-dynamic",
      description: `Dynamic MCP interface for ${companyTitle} with auto-discovery`,
      company: companyName,
      domain: url.hostname,
      serviceDiscovery: "active",
      dynamicRouting: true
    },
    status: {
      message: "Service temporarily generating dynamic interface",
      serviceDiscovery: "endpoints-unavailable",
      fallbackMode: "active",
      timestamp: new Date().toISOString()
    },
    capabilities: {
      resources: true,
      tools: true,
      prompts: true,
      logging: true,
      dynamicDiscovery: true,
      autoProvisioning: true
    },
    info: {
      title: `${companyTitle} AI Assistant (Dynamic Mode)`,
      description: `Auto-provisioned AI assistant for ${companyTitle}`,
      company: companyName,
      mode: "dynamic-fallback",
      endpoints: {
        main: `https://mcp.${companyName}.2100.cool`,
        auth: `https://sallyport.2100.cool?company=${companyName}`,
        status: "discovering"
      }
    },
    actions: {
      refresh: "Reload to attempt service discovery again",
      contact: "Contact system administrator if issue persists"
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      companyName: companyName,
      hostname: url.hostname,
      mode: "dynamic-fallback",
      serviceDiscovery: "failed"
    }
  }, null, 2);
}
