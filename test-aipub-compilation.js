#!/usr/bin/env node

import CRX01BrandingCompiler from './Aixtiv-Symphony/scripts/crx01-branding-compiler.js';

const compiler = new CRX01BrandingCompiler();

// AI Publishing International (AIPUB) branding configuration
const aipubCompany = {
  name: 'AI Publishing International LLP',
  domain: 'aipub.2100.cool',
  branding: {
    primaryColor: '#8B5CF6',     // Purple from Diamond SAO branding
    secondaryColor: '#EC4899',   // Pink accent
    accentColor: '#F59E0B',      // Gold accent
    backgroundColor: '#1a1a2e',  // Dark background
    textColor: '#E2E8F0',       // Light text
    companyName: 'AI Publishing International LLP',
    companyTagline: 'AI Publishing International LLP - Intelligent Content Creation & Distribution',
    logo: null,
    customCSS: `
      .logo {
        background: linear-gradient(135deg, #8B5CF6, #EC4899, #F59E0B);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
      }
      .feature-card:hover {
        border-color: #EC4899;
        box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
      }
    `,
    brandVoice: {
      tone: 'innovative',
      style: 'contemporary', 
      personality: 'creative-publisher'
    }
  }
};

async function generateAIPUBInterface() {
  try {
    console.log('🎨 Generating AIPUB branded interface...');
    const brandedInterface = await compiler.generateBrandedInterface(aipubCompany);
    console.log('✅ Generated interface with ID:', brandedInterface.id);
    
    console.log('📦 Deploying and writing files...');
    const deployment = await compiler.deployBrandedInterface(brandedInterface);
    console.log('🎉 SUCCESS: AIPUB interface deployed!');
    console.log('📁 Files written to:', deployment.compiledPath);
    console.log('🌐 URL:', deployment.url);
    
    return deployment;
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  }
}

generateAIPUBInterface();