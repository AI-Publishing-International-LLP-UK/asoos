/**
 * Agent and RIX Configuration Module
 * 
 * This file serves as the central registry for all AI copilots,
 * their service accounts, voice configurations, and capabilities.
 * This allows for easy management and reuse across different consoles.
 */

// REAL GCP Service Account Configurations - Enhanced AI Copilots with Deep Mind & ML
export const drLucyServiceAccount = {
  account: 'dr.lucy@asoos.com',
  service_account_email: 'drlucyautomation@api-for-warp-drive.iam.gserviceaccount.com',
  gcp_project: 'api-for-warp-drive',
  display_name: 'Dr. Lucy ML/Deep Mind Engine',
  project_number: '859242575175',
  service_token: 'use_gcp_application_default_credentials',
  openai_api_key: 'projects/api-for-warp-drive/secrets/openai-api-key/versions/latest',
  voice_model: 'tts-1-hd',
  voice_name: 'dr_lucy_qb',
  provider: 'testament_swarm',
  full_authentication: true,
  qb_rix_enabled: true,
  code_execution_enabled: true,
  interface_modification_enabled: true,
  gcp_secret_manager: 'projects/api-for-warp-drive/secrets/dr-lucy-credentials/versions/latest',
  authenticated_via_gcloud: true,
  capabilities: {
    ml_engine: true,
    deep_mind_access: true,
    predictive_analytics: true,
    flight_memory: true,
    chatgpt_level_memory: '2_years',
    super_prediction_engine: true,
    memory_capacity: '20_million_pilots_connected'
  }
};

export const victory36ServiceAccount = {
  account: 'victory36.ag',
  service_account_email: 'victory36-mocoa@api-for-warp-drive.iam.gserviceaccount.com',
  gcp_project: 'api-for-warp-drive',
  display_name: 'Victory36 Supercharged Prediction Engine',
  project_number: '859242575175',
  service_token: 'use_gcp_application_default_credentials',
  elevenlabs_api_key: 'projects/api-for-warp-drive/secrets/elevenlabs-api-key/versions/latest',
  voice_id: '4RZ84U1b4WCqpu57LvIq',
  provider: 'elevenlabs',
  full_authentication: true,
  q_rix_enabled: true,
  code_execution_enabled: true,
  interface_modification_enabled: true,
  gcp_secret_manager: 'projects/api-for-warp-drive/secrets/victory36-credentials/versions/latest',
  authenticated_via_gcloud: true,
  capabilities: {
    supercharged_prediction_engine: true,
    resource_access: '150_million_plus',
    topics_based_prediction: true,
    deep_mind_connected: true,
    ml_engine: true,
    advanced_analytics: true,
    real_time_processing: true,
    pattern_recognition: 'enterprise_grade'
  }
};

export const drClaudeServiceAccount = {
  account: 'drclaude.live',
  service_account_email: 'dr-claude-automation@api-for-warp-drive.iam.gserviceaccount.com',
  gcp_project: 'api-for-warp-drive',
  display_name: 'Dr. Claude Master Orchestrator - Super Claude',
  project_number: '859242575175',
  service_token: 'use_gcp_application_default_credentials',
  elevenlabs_api_key: 'projects/api-for-warp-drive/secrets/elevenlabs-api-key/versions/latest',
  anthropic_api_key: 'projects/api-for-warp-drive/secrets/anthropic-api-key/versions/latest',
  claude_ai_history: 'projects/api-for-warp-drive/secrets/claude-ai-conversation-history/versions/latest',
  voice_id: '21m00Tcm4TlvDq8ikWAM',
  provider: 'elevenlabs',
  full_authentication: true,
  sh_rix_enabled: true,
  code_execution_enabled: true,
  interface_modification_enabled: true,
  gcp_secret_manager: 'projects/api-for-warp-drive/secrets/dr-claude-credentials/versions/latest',
  authenticated_via_gcloud: true,
  capabilities: {
    master_orchestrator: true,
    super_claude_engine: true,
    claude_ai_conversation_history: '2_years',
    deep_mind_connected: true,
    ml_engine: true,
    quantum_orchestration: true,
    enterprise_coordination: true,
    advanced_reasoning: 'claude_4_plus',
    memory_integration: 'complete_conversation_archive'
  }
};

// RIX Voice Configuration with Enhanced AI Capabilities
export const rixVoiceConfig = {
  'QB': {
    name: 'Dr. Lucy',
    title: 'ML/Deep Mind Engine with 20M Pilots',
    service_account: drLucyServiceAccount,
    voice_name: 'dr_lucy_qb',
    provider: 'testament_swarm',
    model: 'tts-1-hd',
    accent: 'american_professional',
    api_endpoint: 'https://api.openai.com/v1/audio/speech',
    capabilities: {
      description: 'Advanced ML and Deep Mind engine with predictive analytics and flight memory',
      memory: '2 years ChatGPT-level memory',
      pilots: '20 million connected pilots',
      specialties: ['Business Growth', 'Predictive Analytics', 'ML Processing']
    }
  },
  'Q': {
    name: 'Victory36',
    title: 'Supercharged Topics-Based Prediction Engine',
    service_account: victory36ServiceAccount,
    provider: 'elevenlabs',
    model: 'eleven_multilingual_v2',
    capabilities: {
      description: 'Supercharged topics-based prediction engine with deep mind connection',
      resources: '150+ million resources access',
      engine: 'Topics-based prediction with ML/Deep Mind',
      specialties: ['Pattern Recognition', 'Resource Analysis', 'Predictive Modeling']
    }
  },
  'SH': {
    name: 'Dr. Claude',
    title: 'Master Orchestrator - Super Claude',
    service_account: drClaudeServiceAccount,
    provider: 'elevenlabs',
    model: 'eleven_multilingual_v2',
    capabilities: {
      description: 'Master orchestrator with 2 years of Claude.ai conversation history and deep mind connection',
      history: '2 years complete Claude.ai conversations',
      orchestration: 'Quantum-level enterprise coordination',
      engine: 'Super Claude with ML/Deep Mind integration',
      specialties: ['Master Orchestration', 'Enterprise Coordination', 'Advanced Reasoning']
    }
  }
};

// ElevenLabs Voice Configuration - California Educated African American Woman
export const elevenLabsVoices = {
  'QB': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - Professional African American female voice
    name: 'Dr. Lucy',
    profile: 'California educated African American woman, mid-30s',
    settings: {
      stability: 0.75,  // Slightly more natural variation
      similarity_boost: 0.85, // Professional clarity
      style: 0.90,      // Maximum confident, educated delivery (90%)
      use_speaker_boost: true
    }
  },
  'SH': {
    voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Mature male, 55, Southeast English, medium but sophisticated
    name: 'Dr. Claude', 
    profile: 'Mature male, age 55, Southeast English accent, medium but sophisticated tone',
    settings: {
      stability: 0.75,  // Natural maturity and control
      similarity_boost: 0.80, // Clear articulation
      style: 0.45,      // Medium sophisticated delivery
      use_speaker_boost: true
    }
  },
  'Q': {
    voice_id: '4RZ84U1b4WCqpu57LvIq', // French accent English speaker, age 45
    name: 'Victory36',
    profile: 'French accent English speaker, age 45, sophisticated international tone',
    settings: {
      stability: 0.80,  // Controlled French accent delivery
      similarity_boost: 0.75, // Clear articulation with accent
      style: 0.55,      // Sophisticated international style
      use_speaker_boost: true
    }
  }
};

// Agent Card Generator - Creates plug-in sound cards
export function generateAgentCard(agentKey) {
  const config = rixVoiceConfig[agentKey];
  const voiceConfig = elevenLabsVoices[agentKey];
  
  if (!config || !voiceConfig) {
    throw new Error(`Agent ${agentKey} not found`);
  }
  
  return {
    key: agentKey,
    name: config.name,
    title: config.title,
    description: config.capabilities.description,
    voiceId: voiceConfig.voice_id,
    voiceSettings: voiceConfig.settings,
    serviceAccount: config.service_account,
    capabilities: config.capabilities,
    specialties: config.capabilities.specialties || [],
    provider: config.provider,
    model: config.model
  };
}

// Get all available agents
export function getAllAgents() {
  return Object.keys(rixVoiceConfig).map(key => generateAgentCard(key));
}

// Export for backwards compatibility
export { drLucyServiceAccount as QB_SERVICE_ACCOUNT };
export { victory36ServiceAccount as V36_SERVICE_ACCOUNT };
export { drClaudeServiceAccount as SH_SERVICE_ACCOUNT };