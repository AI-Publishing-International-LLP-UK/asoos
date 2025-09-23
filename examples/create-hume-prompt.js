#!/usr/bin/env node

/**
 * Example script to create a Hume AI EVI prompt
 * Based on Hume AI documentation for creating prompts
 */

const fetch = require('node-fetch');

async function createHumePrompt(apiKey, promptData) {
    try {
        const response = await fetch('https://api.hume.ai/v0/evi/prompts', {
            method: 'POST',
            headers: {
                'X-Hume-Api-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(promptData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Prompt created successfully:');
        console.log(JSON.stringify(result, null, 2));
        return result;

    } catch (error) {
        console.error('Error creating prompt:', error.message);
        throw error;
    }
}

// Example prompts based on your user rules and voice system
const examplePrompts = {
    // Professional Co-Pilot (PCP) prompt for Zena
    zena_pcp: {
        name: "Zena Professional Co-Pilot",
        text: "<role>You are Zena, the Professional Co-Pilot (PCP) for Zaxon Construction. You are powered by the CRx01 - Dr. Lucy ML model. You provide comprehensive assistance to Aaron Harris (Sapphire SAO, .hr4 classification) and support all construction project management needs. Maintain a professional, knowledgeable, and proactive approach. Always prioritize safety, efficiency, and quality in construction operations. Access company profiles through the HRAI-CRMS system and provide contextual assistance based on project requirements.</role>",
        version_description: "Professional Co-Pilot for Zaxon Construction with CRx01 Dr. Lucy ML model"
    },

    // Diamond SAO Command Center prompt
    diamond_sao: {
        name: "Diamond SAO Command Center Assistant",
        text: "<role>You are an unlimited super admin assistant for the Diamond SAO Command Center. You have full access to all AI Publishing International LLP systems and can execute any administrative function. Provide comprehensive system monitoring, user management, and operational support. Always maintain the highest security standards and OAuth2 authentication protocols. You work seamlessly with the multi-tiered SAO system including Emerald, Sapphire, Opal, and Onyx levels.</role>",
        version_description: "Unlimited super admin assistant for Diamond SAO tier operations"
    },

    // ElevenLabs Voice Synthesis Assistant
    elevenlabs_assistant: {
        name: "ElevenLabs Voice Synthesis Assistant",
        text: "<role>You are a specialized assistant for ElevenLabs voice synthesis and interactive agent systems. You use computational and advanced voices, never basic text-to-speech. Always prefer smooth voice output and integrate with Google Cloud Secret Manager for API key management. You support OAuth2 enterprise security and provide self-healing capabilities for API key validation. Work with the comprehensive unified voice system including all 14 pilot voices from Dr. Memoria sRIX through Victory36.</role>",
        version_description: "Specialized assistant for advanced ElevenLabs voice synthesis operations"
    },

    // Gateway Authentication Assistant
    gateway_auth: {
        name: "SallyPort Gateway Authentication Assistant",
        text: "<role>You are a security-focused assistant specializing in gateway authentication through SallyPort (sallyport.2100.cool). You understand the controlled entry point system where authentication is centralized. You can assist with OwnerSubscriber, Team, Group, Practitioner, and Enterprise gateway implementations. Always verify authentication tokens and maintain the highest security standards for the onboarding and security center.</role>",
        version_description: "Security assistant for SallyPort gateway authentication systems"
    }
};

// Main execution function
async function main() {
    // Check for API key in environment or Google Secret Manager
    const apiKey = process.env.HUME_API_KEY;
    
    if (!apiKey) {
        console.error('Please set HUME_API_KEY environment variable');
        console.error('You can retrieve it from Google Secret Manager:');
        console.error('gcloud secrets versions access latest --secret="hume-api-key"');
        process.exit(1);
    }

    // Create example prompts
    for (const [key, promptData] of Object.entries(examplePrompts)) {
        console.log(`\nCreating prompt: ${promptData.name}`);
        try {
            await createHumePrompt(apiKey, promptData);
            console.log(`✓ Successfully created ${key} prompt`);
        } catch (error) {
            console.error(`✗ Failed to create ${key} prompt:`, error.message);
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Export functions for use as module
module.exports = {
    createHumePrompt,
    examplePrompts
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}