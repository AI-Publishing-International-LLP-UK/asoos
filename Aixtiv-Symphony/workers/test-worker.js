/**
 * 🧪 Simple Test Worker - No Access Protection
 * For quick deployment testing
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers for testing
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const response = {
      status: 'success',
      message: 'Test worker is live and accessible!',
      timestamp: new Date().toISOString(),
      path: url.pathname,
      method: request.method,
      workers: {
        android: {
          url: 'https://mobile-android.asoos.2100.cool',
          status: 'deployed',
          protection: 'cloudflare-access',
        },
        ios: {
          url: 'https://mobile-ios.asoos.2100.cool',
          status: 'deployed',
          protection: 'cloudflare-access',
        },
      },
      note: 'Main workers are protected by Cloudflare Access - authenticate to view them',
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: corsHeaders,
    });
  },
};
