import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { dynamicEnhancement } from './upgrades/package1-dynamic-enhancement'
import { advancedOperations } from './upgrades/package2-advanced-operations'
import { giftShopOffers } from './integrations/giftshop-offers'
import { crossPlatformDeployment } from './integrations/cross-platform-deployment'

interface Env {
  // Authentication
  OAUTH2_CLIENT_ID: string;
  OAUTH2_CLIENT_SECRET: string;
  SALLYPORT_PUBLIC_KEY: string;
  SYMPHONY_API_KEY: string;
  GCP_SERVICE_ACCOUNT_KEY: string;
  
  // Platform
  GCP_PROJECT_ID: string;
  REGION: string;
  ENVIRONMENT: string;
  
  // Services
  CUSTOMER_DB: D1Database;
  TEMPLATE_CACHE: KVNamespace;
  OPERATIONS_CACHE: KVNamespace;
  OFFERS_CACHE: KVNamespace;
  PLATFORM_REGISTRY: KVNamespace;
  
  // Queues
  SYNDICATION_QUEUE: Queue;
  ACTIVATION_QUEUE: Queue;
  SYNC_QUEUE: Queue;
  
  // Payment
  STRIPE_SECRET_KEY: string;
  OPENAI_API_KEY: string;
  DEPLOYMENT_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>()

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: [
    'https://sallyport.2100.cool',
    'https://coaching.2100.cool',
    'https://coach.2100.cool', 
    'https://einsteinwells.2100.cool',
    'https://mcp.asoos.2100.cool',
    'https://giftshop.2100.cool'
  ],
  allowHeaders: ['Content-Type', 'Authorization', 'X-SAO-Token', 'X-SallyPort-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'AI Publishing International Upgrade System',
    environment: c.env.ENVIRONMENT,
    platforms: ['sallyport', 'coaching', 'coach', 'einsteinwells'],
    timestamp: new Date().toISOString()
  })
})

// Root endpoint - Upgrade System Portal
app.get('/', (c) => {
  return c.json({
    service: 'AI Publishing International Business Enhancement System',
    version: '2.0.0',
    description: 'Cross-platform upgrade packages for the entire AI Publishing ecosystem',
    platforms: {
      sallyport: 'Security & Control Center - sallyport.2100.cool',
      coaching: 'Primary Coaching Platform - coaching.2100.cool', 
      coach: 'Executive Coaching - coach.2100.cool',
      einsteinwells: 'Energy & Investment - einsteinwells.2100.cool'
    },
    upgradePackages: {
      'dynamic-business-enhancement': 'AI-powered automation and optimization',
      'advanced-operations-suite': 'Enterprise-grade operations and syndication'
    },
    access: 'Sapphire+ SAO customers only',
    integration: 'Automatic deployment across all platforms'
  })
})

// Upgrade Package Routes
app.route('/upgrades/dynamic-enhancement', dynamicEnhancement)
app.route('/upgrades/advanced-operations', advancedOperations)

// Gift Shop Integration (Special Offers)
app.route('/giftshop', giftShopOffers)

// Cross-Platform Deployment
app.route('/platform', crossPlatformDeployment)

// Platform-Specific Endpoints for Integration

// SallyPort Security Center Integration
app.get('/sallyport/upgrades', async (c) => {
  const customerId = c.req.query('customer_id')
  if (!customerId) {
    return c.json({ error: 'Customer ID required' }, 400)
  }
  
  // Get customer's SAO level and available upgrades
  const customer = await c.env.CUSTOMER_DB.prepare(
    'SELECT sao_level, active_upgrades FROM customers WHERE customer_id = ?'
  ).bind(customerId).first()
  
  if (!customer || !['Diamond', 'Emerald'].includes(customer.sao_level)) {
    return c.json({
      error: 'Access restricted to Diamond/Emerald SAO levels'
    }, 403)
  }
  
  return c.json({
    platform: 'SallyPort Security Center',
    availableUpgrades: {
      securityEnhancement: {
        name: 'Enhanced Security Automation',
        pricing: { monthly: 596, annually: 5964 }, // 1.2x multiplier
        features: ['Real-time Threat Response', 'Intelligent Access Control', 'Automated Compliance']
      },
      securityOperations: {
        name: 'Multi-Tenant Security Orchestration', 
        pricing: { monthly: 1196, annually: 11964 }, // 1.2x multiplier
        features: ['Advanced Threat Intelligence', 'Security Analytics', 'Incident Response']
      }
    },
    integration: {
      location: 'Diamond SAO Dashboard',
      displayMode: 'integrated_tiles'
    }
  })
})

// Coaching Platform Integration
app.get('/coaching/upgrades', async (c) => {
  const customerId = c.req.query('customer_id')
  if (!customerId) {
    return c.json({ error: 'Customer ID required' }, 400)
  }
  
  return c.json({
    platform: 'Primary Coaching Platform',
    availableUpgrades: {
      coachingEnhancement: {
        name: 'AI-Powered Coaching Enhancement',
        pricing: { monthly: 497, annually: 4970 }, // 1.0x multiplier 
        features: ['Coaching Personalization', 'Learning Path Generation', 'Progress Optimization']
      },
      coachingOperations: {
        name: 'Multi-Client Coaching Orchestration',
        pricing: { monthly: 997, annually: 9970 }, // 1.0x multiplier
        features: ['Performance Analytics', 'Client Syndication', 'Coaching Workflows']  
      }
    },
    integration: {
      location: 'Coach Dashboard > Premium Features',
      displayMode: 'service_upgrades'
    }
  })
})

// Executive Coaching Integration  
app.get('/coach/upgrades', async (c) => {
  const customerId = c.req.query('customer_id')
  if (!customerId) {
    return c.json({ error: 'Customer ID required' }, 400)
  }
  
  return c.json({
    platform: 'Executive Coaching Specialization',
    availableUpgrades: {
      executiveEnhancement: {
        name: 'Executive AI Strategy Assistant',
        pricing: { monthly: 745, annually: 7455 }, // 1.5x multiplier
        features: ['Strategy Assistant', 'Leadership Decision Optimization', 'Strategic Workflows']
      },
      executiveOperations: {
        name: 'C-Suite Communication Syndication',
        pricing: { monthly: 1495, annually: 14955 }, // 1.5x multiplier
        features: ['Content Distribution', 'Team Coordination', 'Leadership Insights']
      }
    },
    integration: {
      location: 'Executive Suite > Advanced Tools',
      displayMode: 'premium_suite'
    }
  })
})

// Einstein Wells Energy & Investment Integration
app.get('/einsteinwells/upgrades', async (c) => {
  const customerId = c.req.query('customer_id')
  if (!customerId) {
    return c.json({ error: 'Customer ID required' }, 400)
  }
  
  return c.json({
    platform: 'Einstein Wells Energy & Investment',
    availableUpgrades: {
      investmentEnhancement: {
        name: 'Investment Opportunity AI Analysis',
        pricing: { monthly: 646, annually: 6461 }, // 1.3x multiplier
        features: ['AI Analysis', 'Market Trend Prediction', 'Portfolio Optimization']
      },
      investmentOperations: {
        name: 'Multi-Platform Investment Syndication',
        pricing: { monthly: 1296, annually: 12961 }, // 1.3x multiplier
        features: ['Investment Syndication', 'Energy Analytics', 'Partnership Orchestration']
      }
    },
    integration: {
      location: 'Investment Dashboard > Advanced Analytics',
      displayMode: 'analytical_tools'
    }
  })
})

// Global deployment trigger (Diamond SAO only)
app.post('/deploy-all-platforms', async (c) => {
  const authHeader = c.req.header('Authorization')
  const saoLevel = c.req.header('X-SAO-Level')
  
  if (!authHeader || !['Diamond', 'Emerald'].includes(saoLevel)) {
    return c.json({
      error: 'Deployment restricted to Diamond/Emerald SAO levels'
    }, 403)
  }
  
  // Trigger cross-platform deployment
  const deploymentResponse = await fetch(`${c.req.url}/platform/deploy-upgrades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify({
      initiatedBy: saoLevel,
      timestamp: new Date().toISOString(),
      deploymentType: 'full_ecosystem'
    })
  })
  
  const result = await deploymentResponse.json()
  
  return c.json({
    success: true,
    message: 'Ecosystem-wide deployment initiated',
    deployment: result,
    estimatedCompletion: '30-45 minutes',
    affectedPlatforms: 4
  })
})

export default app