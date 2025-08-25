// ASOOS.2100.Cool Production Worker - Updated with Full 1608-line Content
// Serves the complete ASOOS 20M+ AI Agents page

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle auth routing  
    if (url.pathname === '/auth') {
      return Response.redirect('https://asoos.2100.cool/cloudflare-pages-deployment/auth.html', 302);
    }
    
    // Handle owner interface redirect
    if (url.pathname === '/owner' || url.pathname === '/dashboard') {
      return Response.redirect('https://owner.2100.cool', 302);
    }
    
    // Handle health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'ASOOS.2100.Cool Production',
        timestamp: new Date().toISOString(),
        version: '1608-line-full',
        agents: '20M+',
        features: 'Complete ASOOS Experience'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle robots.txt
    if (url.pathname === '/robots.txt') {
      return new Response(`User-agent: *\nDisallow: /cdn-cgi/\nAllow: /\n\nSitemap: https://asoos.2100.cool/sitemap.xml`, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Default: Serve the complete 1608-line ASOOS page
    // NOTE: In production, this should fetch from GitHub or use KV storage for the full HTML content
    const fullHtmlResponse = await fetch('https://raw.githubusercontent.com/AI-Publishing-International-LLP-UK/Aixtiv-Symphony-Opus1.0.1/production/cloudflare-pages-deployment/index.html');
    
    if (fullHtmlResponse.ok) {
      const html = await fullHtmlResponse.text();
      return new Response(html, {
        headers: { 
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          'X-ASOOS-Version': '1608-lines',
          'X-ASOOS-Source': 'GitHub-Production'
        }
      });
    } else {
      // Fallback in case GitHub is not accessible
      return new Response('ASOOS.2100.Cool - Temporarily Unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
