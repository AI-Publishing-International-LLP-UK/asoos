// MCP DIRECT PROXY - NO COMPLEXITY, JUST WORKS
// Diamond SAO approved simple solution

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // SIMPLE GITHUB-BASED MCP SOLUTION - Diamond SAO Approved
    // Serve actual MCP content from GitHub - no more complexity
    if (url.pathname === '/') {
      const githubMcpUrl = 'https://raw.githubusercontent.com/AI-Publishing-International-LLP-UK/AIXTIV-SYMPHONY/main/mcp-interface/index.html';
      
      try {
        const mcpResponse = await fetch(githubMcpUrl);
        if (mcpResponse.ok) {
          const mcpHtml = await mcpResponse.text();
          return new Response(mcpHtml, {
            status: 200,
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'X-MCP-Source': 'GitHub-Direct',
              'X-Diamond-SAO': 'APPROVED-SIMPLE',
              'X-No-More-Complexity': 'TRUE',
              'Cache-Control': 'public, max-age=300'
            }
          });
        }
      } catch (error) {
        console.log('GitHub fetch failed, using fallback');
      }
    }
    
    // Fallback to existing MOCOA service for API endpoints
    const targetUrl = `https://mocoa-yutylytffa-uw.a.run.app${url.pathname}${url.search}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-MCP-Proxy': 'DIRECT',
          'X-Diamond-SAO': 'APPROVED',
          'X-Simple-Solution': 'TRUE'
        }
      });
    } catch (error) {
      // Simple fallback
      return new Response(JSON.stringify({
        message: 'MCP Direct Access',
        status: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
        diamond_sao: 'approved_simple_solution'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Diamond-SAO': 'FALLBACK'
        }
      });
    }
  }
};
