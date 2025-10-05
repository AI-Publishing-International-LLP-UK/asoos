/**
 * GIFT SHOP SPECIAL OFFERS INTEGRATION
 * Integrated into giftshop.2100.cool
 * Only visible to Sapphire+ SAO level paying customers
 */

import { Hono } from 'hono'

interface GiftShopEnv {
  STRIPE_SECRET_KEY: string;
  CUSTOMER_DB: D1Database;
  OFFERS_CACHE: KVNamespace;
  ACTIVATION_QUEUE: Queue;
}

const giftShopOffers = new Hono<{ Bindings: GiftShopEnv }>()

// Special Offers Catalog (Sapphire+ SAO Only)
giftShopOffers.get('/special-offers/:customerId', async (c) => {
  const customerId = c.req.param('customerId')
  
  // Verify customer SAO level
  const customer = await c.env.CUSTOMER_DB.prepare(
    'SELECT sao_level, subscription_status, industry FROM customers WHERE customer_id = ?'
  ).bind(customerId).first()
  
  if (!customer || !['Sapphire', 'Opal', 'Onyx'].includes(customer.sao_level)) {
    return c.json({
      error: 'Access denied',
      message: 'Special offers are exclusively available to Sapphire+ SAO level customers'
    }, 403)
  }
  
  const offers = {
    exclusiveOffers: {
      title: "🚀 EXCLUSIVE BUSINESS ENHANCEMENT UPGRADES",
      description: "Transform your ASOOS instance with cutting-edge capabilities",
      available: true,
      customerLevel: customer.sao_level
    },
    packages: [
      {
        id: "dynamic-business-enhancement",
        name: "Dynamic Business Enhancement",
        category: "System Upgrade",
        description: "AI-powered automation that adapts to your business needs in real-time",
        features: [
          "✨ AI-Powered Customer Provisioning",
          "⚡ Real-Time Template Updates", 
          "🧠 Smart Workflow Generation",
          "🎯 Dynamic Content Customization",
          "🔄 Template Inheritance System"
        ],
        benefits: [
          "15-25% ROI increase within 90 days",
          "20-40 hours/week time savings",
          "Automatic system optimization",
          "Zero configuration maintenance"
        ],
        pricing: {
          monthly: 497,
          annually: 4970,
          setup: 197,
          currency: "USD"
        },
        availability: "Immediate activation",
        supportLevel: "Priority support included",
        customization: `Optimized for ${customer.industry} industry`
      },
      {
        id: "advanced-operations-suite", 
        name: "Advanced Operations Suite",
        category: "Premium Upgrade",
        description: "Enterprise-grade operations with multi-platform syndication and advanced orchestration",
        features: [
          "🌐 Multi-Platform Syndication",
          "🤖 Intelligent Content Management",
          "👥 Advanced Team Operations", 
          "🎼 Symphony API Integration",
          "🔐 Cross-Platform Authentication"
        ],
        benefits: [
          "250K+ monthly reach expansion",
          "35-50% team efficiency increase",
          "300% scalability improvement",
          "Enterprise-grade security"
        ],
        pricing: {
          monthly: 997,
          annually: 9970,
          setup: 497,
          currency: "USD"
        },
        availability: "24-hour activation",
        supportLevel: "White-glove implementation",
        customization: "Fully tailored to your organization"
      }
    ],
    bundleOffer: {
      id: "complete-transformation",
      name: "🎯 Complete Business Transformation Bundle",
      description: "Both upgrade packages with exclusive bonuses",
      savings: {
        monthly: 300,
        annually: 3000,
        percentage: "20%"
      },
      bundlePricing: {
        monthly: 1194, // Instead of 1494
        annually: 11940, // Instead of 14940
        setup: 497, // Combined setup
        currency: "USD"
      },
      exclusiveBonuses: [
        "🎁 Priority feature development requests",
        "📞 Monthly strategy consultation calls",
        "🏆 Early access to new capabilities",
        "📊 Advanced analytics dashboard",
        "🔧 Custom integration development"
      ],
      limitedTime: "Available until end of month",
      guarantee: "60-day money-back guarantee"
    },
    testimonials: [
      {
        customer: "Sarah M., CEO Tech Startup",
        feedback: "The Dynamic Enhancement package transformed our operations. We're saving 30+ hours per week.",
        results: "40% productivity increase, 25% cost reduction"
      },
      {
        customer: "Marcus R., Operations Director",  
        feedback: "Advanced Operations Suite gave us enterprise capabilities at a fraction of the cost.",
        results: "Expanded to 5 new markets, 200K new monthly impressions"
      }
    ]
  }
  
  return c.json({
    success: true,
    offers,
    customerEligible: true,
    exclusiveAccess: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  })
})

// Purchase Processing
giftShopOffers.post('/purchase/:customerId', async (c) => {
  const customerId = c.req.param('customerId')
  const purchaseData = await c.req.json()
  
  // Verify customer eligibility
  const customer = await c.env.CUSTOMER_DB.prepare(
    'SELECT * FROM customers WHERE customer_id = ? AND sao_level IN (?, ?, ?)'
  ).bind(customerId, 'Sapphire', 'Opal', 'Onyx').first()
  
  if (!customer) {
    return c.json({
      error: 'Purchase denied',
      message: 'Customer not eligible for special offers'
    }, 403)
  }
  
  // Process Stripe payment
  const stripe = require('stripe')(c.env.STRIPE_SECRET_KEY)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: purchaseData.amount * 100, // Convert to cents
    currency: 'usd',
    customer: customer.stripe_customer_id,
    metadata: {
      customerId: customerId,
      packageId: purchaseData.packageId,
      upgradeType: purchaseData.upgradeType
    }
  })
  
  // Store purchase record
  await c.env.CUSTOMER_DB.prepare(
    'INSERT INTO purchases (customer_id, package_id, amount, status, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(
    customerId,
    purchaseData.packageId,
    purchaseData.amount,
    'processing',
    new Date().toISOString()
  ).run()
  
  // Queue upgrade activation
  await c.env.ACTIVATION_QUEUE.send({
    customerId,
    packageId: purchaseData.packageId,
    paymentIntentId: paymentIntent.id,
    activationType: 'immediate',
    timestamp: new Date().toISOString()
  })
  
  return c.json({
    success: true,
    message: 'Purchase initiated successfully',
    paymentIntent: {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    },
    activationTime: purchaseData.packageId === 'advanced-operations-suite' ? '24 hours' : 'Immediate',
    supportContact: 'upgrades@2100.cool'
  })
})

// Activation Status
giftShopOffers.get('/activation-status/:customerId/:packageId', async (c) => {
  const customerId = c.req.param('customerId')
  const packageId = c.req.param('packageId')
  
  const purchase = await c.env.CUSTOMER_DB.prepare(
    'SELECT * FROM purchases WHERE customer_id = ? AND package_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(customerId, packageId).first()
  
  if (!purchase) {
    return c.json({
      error: 'Purchase not found'
    }, 404)
  }
  
  const activationStatus = {
    purchaseId: purchase.id,
    status: purchase.status,
    packageId: packageId,
    activationProgress: purchase.status === 'completed' ? 100 : 
                       purchase.status === 'activating' ? 75 : 25,
    estimatedCompletion: purchase.status === 'completed' ? 'Complete' : '2-24 hours',
    features: {
      activated: purchase.status === 'completed',
      testing: purchase.status === 'activating',
      pending: purchase.status === 'processing'
    },
    nextSteps: purchase.status === 'completed' ? 
      'Your upgrade is active! Check your dashboard for new features.' :
      'We\'re setting up your upgrade. You\'ll receive an email when ready.'
  }
  
  return c.json({
    success: true,
    activation: activationStatus
  })
})

// ROI Calculator
giftShopOffers.post('/roi-calculator/:customerId', async (c) => {
  const customerId = c.req.param('customerId')
  const businessData = await c.req.json()
  
  const calculations = {
    currentCosts: {
      manualProcesses: businessData.hoursPerWeek * businessData.hourlyRate * 52,
      systemMaintenance: businessData.itCosts * 12,
      contentCreation: businessData.contentHours * businessData.contentRate * 52,
      teamCoordination: businessData.coordinationHours * businessData.hourlyRate * 52
    },
    projectedSavings: {
      automationSavings: businessData.hoursPerWeek * 0.6 * businessData.hourlyRate * 52,
      maintenanceReduction: businessData.itCosts * 12 * 0.4,
      contentEfficiency: businessData.contentHours * 0.8 * businessData.contentRate * 52,
      teamProductivity: businessData.coordinationHours * 0.5 * businessData.hourlyRate * 52
    },
    upgradeCosts: {
      package1Annual: 4970,
      package2Annual: 9970,
      bundleAnnual: 11940
    }
  }
  
  const totalCurrentCosts = Object.values(calculations.currentCosts).reduce((a, b) => a + b, 0)
  const totalSavings = Object.values(calculations.projectedSavings).reduce((a, b) => a + b, 0)
  
  const roi = {
    package1: {
      investment: calculations.upgradeCosts.package1Annual,
      savings: totalSavings * 0.6,
      roi: ((totalSavings * 0.6 - calculations.upgradeCosts.package1Annual) / calculations.upgradeCosts.package1Annual * 100).toFixed(1),
      paybackMonths: Math.ceil(calculations.upgradeCosts.package1Annual / (totalSavings * 0.6 / 12))
    },
    package2: {
      investment: calculations.upgradeCosts.package2Annual,
      savings: totalSavings * 0.9,
      roi: ((totalSavings * 0.9 - calculations.upgradeCosts.package2Annual) / calculations.upgradeCosts.package2Annual * 100).toFixed(1),
      paybackMonths: Math.ceil(calculations.upgradeCosts.package2Annual / (totalSavings * 0.9 / 12))
    },
    bundle: {
      investment: calculations.upgradeCosts.bundleAnnual,
      savings: totalSavings * 1.2,
      roi: ((totalSavings * 1.2 - calculations.upgradeCosts.bundleAnnual) / calculations.upgradeCosts.bundleAnnual * 100).toFixed(1),
      paybackMonths: Math.ceil(calculations.upgradeCosts.bundleAnnual / (totalSavings * 1.2 / 12))
    }
  }
  
  return c.json({
    success: true,
    calculations,
    roi,
    recommendation: roi.bundle.roi > 200 ? 'bundle' : 
                    roi.package2.roi > 150 ? 'package2' : 'package1'
  })
})

export { giftShopOffers }