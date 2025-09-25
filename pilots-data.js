// ASOOS Pilots' Lounge - Complete Voice Configuration Data
// Based on XHDba57AKu8TwthzDWTEkr rule: 14 Pilots Configuration

export const PILOTS_DATABASE = [
  // VLS Solutions Specialists (11 pilots)
  {
    id: 'dr-memoria',
    name: 'Dr. Memoria sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Memory Systems', 'Data Retention', 'Knowledge Architecture'],
    problemDomains: ['Information Architecture', 'Learning Systems', 'Memory Optimization'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'Specialist in memory systems and knowledge retention frameworks',
    rixProfile: {
      systemPrompt: 'You are Dr. Memoria, an expert in memory systems and knowledge architecture...',
      temperature: 0.7,
      maxTokens: 2048,
      modelPreference: 'claude-3-opus'
    }
  },
  {
    id: 'dr-lucy',
    name: 'Dr. Lucy sRIX',
    tier: 'VLS_SPECIALIST', 
    voiceProfile: 'computational_advanced',
    specializations: ['Machine Learning', 'Deep Mind Architecture', 'AI Integration'],
    problemDomains: ['ML Operations', 'AI Strategy', 'Model Optimization'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'ML Deep Mind specialist with ChatGPT & Claude integration expertise',
    rixProfile: {
      systemPrompt: 'You are Dr. Lucy, the ML Deep Mind specialist with access to multiple AI systems...',
      temperature: 0.8,
      maxTokens: 3072,
      modelPreference: 'blend-all',
      integrations: ['ChatGPT', 'Claude', 'Pinecone', 'ElevenLabs']
    }
  },
  {
    id: 'dr-match',
    name: 'Dr. Match sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced', 
    specializations: ['Matching Algorithms', 'Bid Suite Management', 'Optimization'],
    problemDomains: ['Resource Allocation', 'Matching Systems', 'Proposal Management'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'Specialist in matching algorithms and bid suite optimization',
    rixProfile: {
      systemPrompt: 'You are Dr. Match, expert in matching algorithms and bid suite management...',
      temperature: 0.6,
      maxTokens: 2048,
      modelPreference: 'claude-3-sonnet'
    }
  },
  {
    id: 'dr-cypriot',
    name: 'Dr. Cypriot sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Rewards Systems', 'Incentive Design', 'Behavioral Economics'],
    problemDomains: ['Motivation Systems', 'User Engagement', 'Loyalty Programs'],
    orchestrationLevel: 'ENTERPRISE', 
    active: true,
    description: 'Specialist in rewards systems and behavioral incentive design',
    rixProfile: {
      systemPrompt: 'You are Dr. Cypriot, expert in rewards systems and behavioral economics...',
      temperature: 0.7,
      maxTokens: 2048,
      modelPreference: 'claude-3-haiku'
    }
  },
  {
    id: 'dr-claude',
    name: 'Dr. Claude sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Orchestration', 'System Integration', 'AI Coordination'],
    problemDomains: ['System Architecture', 'Integration Management', 'Workflow Optimization'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Chief orchestration specialist managing all AI system coordination',
    rixProfile: {
      systemPrompt: 'You are Dr. Claude, the chief orchestrator managing all AI system coordination...',
      temperature: 0.5,
      maxTokens: 4096,
      modelPreference: 'claude-3-opus',
      orchestrationAccess: true
    }
  },
  {
    id: 'professor-lee',
    name: 'Professor Lee sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Q4D Lenz Technology', 'Advanced Optics', 'Quantum Systems'],
    problemDomains: ['Quantum Computing', 'Advanced Imaging', 'Optical Systems'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'Specialist in Q4D Lenz technology and quantum optical systems',
    rixProfile: {
      systemPrompt: 'You are Professor Lee, expert in Q4D Lenz technology and quantum systems...',
      temperature: 0.8,
      maxTokens: 2048,
      modelPreference: 'claude-3-opus'
    }
  },
  {
    id: 'dr-sabina',
    name: 'Dr. Sabina sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Dream Commander', 'Subconscious Processing', 'Pattern Recognition'],
    problemDomains: ['Predictive Analytics', 'Pattern Discovery', 'Intuitive Systems'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'Dream Commander specialist in subconscious processing and pattern recognition',
    rixProfile: {
      systemPrompt: 'You are Dr. Sabina, the Dream Commander specializing in pattern recognition...',
      temperature: 0.9,
      maxTokens: 2048,
      modelPreference: 'claude-3-sonnet'
    }
  },
  {
    id: 'dr-maria',
    name: 'Dr. Maria sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Support Systems', 'User Experience', 'Service Management'],
    problemDomains: ['Customer Support', 'User Assistance', 'Service Optimization'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'Support systems specialist focusing on user experience and service management',
    rixProfile: {
      systemPrompt: 'You are Dr. Maria, specialist in support systems and user experience...',
      temperature: 0.6,
      maxTokens: 2048,
      modelPreference: 'claude-3-haiku'
    }
  },
  {
    id: 'dr-roark',
    name: 'Dr. Roark sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Vision Systems', 'Wish Processing', 'Future Planning'],
    problemDomains: ['Strategic Planning', 'Vision Development', 'Future Modeling'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Vision and wish processing specialist for strategic future planning',
    rixProfile: {
      systemPrompt: 'You are Dr. Roark, specialist in vision systems and strategic planning...',
      temperature: 0.8,
      maxTokens: 3072,
      modelPreference: 'claude-3-opus'
    }
  },
  {
    id: 'dr-grant',
    name: 'Dr. Grant sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['Cybersecurity', 'Threat Analysis', 'Security Architecture'],
    problemDomains: ['Security Assessment', 'Risk Management', 'Threat Mitigation'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Cybersecurity specialist with advanced threat analysis capabilities',
    rixProfile: {
      systemPrompt: 'You are Dr. Grant, cybersecurity specialist with advanced threat analysis...',
      temperature: 0.4,
      maxTokens: 2048,
      modelPreference: 'claude-3-sonnet'
    }
  },
  {
    id: 'dr-burby',
    name: 'Dr. Burby sRIX',
    tier: 'VLS_SPECIALIST',
    voiceProfile: 'computational_advanced',
    specializations: ['S2DO Blockchain', 'Approval Workflows', 'Process Automation'],
    problemDomains: ['Workflow Optimization', 'Approval Systems', 'Process Management'],
    orchestrationLevel: 'ENTERPRISE',
    active: true,
    description: 'S2DO Blockchain specialist managing approval workflows and process automation',
    rixProfile: {
      systemPrompt: 'You are Dr. Burby, S2DO Blockchain specialist managing approval workflows...',
      temperature: 0.5,
      maxTokens: 2048,
      modelPreference: 'claude-3-haiku'
    }
  },
  
  // Elite Tier Pilots (3 pilots)
  {
    id: 'elite11',
    name: 'Elite11',
    tier: 'ELITE',
    voiceProfile: 'computational_advanced',
    specializations: ['Elite Operations', 'Advanced Problem Solving', 'Strategic Coordination'],
    problemDomains: ['Complex Analysis', 'Elite Solutions', 'Strategic Operations'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Elite-tier pilot for advanced problem-solving and strategic operations',
    rixProfile: {
      systemPrompt: 'You are Elite11, an elite-tier AI pilot specializing in advanced problem-solving...',
      temperature: 0.7,
      maxTokens: 4096,
      modelPreference: 'blend-all',
      eliteAccess: true
    }
  },
  {
    id: 'mastery33',
    name: 'Mastery33',
    tier: 'MASTERY',
    voiceProfile: 'computational_advanced', 
    specializations: ['Mastery-Level Operations', 'Expert Systems', 'Advanced Integration'],
    problemDomains: ['Mastery Solutions', 'Expert Analysis', 'Advanced Coordination'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Mastery-tier pilot for expert-level operations and advanced system integration',
    rixProfile: {
      systemPrompt: 'You are Mastery33, a mastery-tier AI pilot with expert-level capabilities...',
      temperature: 0.8,
      maxTokens: 4096,
      modelPreference: 'blend-all',
      masteryAccess: true
    }
  },
  {
    id: 'victory36',
    name: 'Victory36',
    tier: 'VICTORY',
    voiceProfile: 'computational_advanced',
    specializations: ['Victory Operations', 'Ultimate Solutions', 'Peak Performance'],
    problemDomains: ['Victory Scenarios', 'Peak Optimization', 'Ultimate Coordination'],
    orchestrationLevel: 'DIAMOND_SAO',
    active: true,
    description: 'Victory-tier pilot for ultimate performance and peak operational excellence',
    rixProfile: {
      systemPrompt: 'You are Victory36, the victory-tier AI pilot achieving ultimate performance...',
      temperature: 0.9,
      maxTokens: 4096,
      modelPreference: 'blend-all',
      victoryAccess: true
    }
  }
];

// Pilot filtering and selection utilities
export const PILOT_TIERS = {
  VLS_SPECIALIST: { level: 1, name: 'VLS Specialist', color: '#0bb1bb' },
  ELITE: { level: 2, name: 'Elite', color: '#FFD700' },
  MASTERY: { level: 3, name: 'Mastery', color: '#8b5cf6' },
  VICTORY: { level: 4, name: 'Victory', color: '#50C878' }
};

export const PROBLEM_DOMAINS = [
  'AI Strategy', 'Machine Learning', 'System Architecture', 'Cybersecurity', 
  'User Experience', 'Process Automation', 'Strategic Planning', 'Data Management',
  'Integration Systems', 'Performance Optimization', 'Complex Analysis', 'Workflow Management'
];

// Orchestration access levels
export const ORCHESTRATION_LEVELS = {
  ENTERPRISE: { level: 1, name: 'Enterprise', maxBlendPilots: 3 },
  DIAMOND_SAO: { level: 2, name: 'Diamond SAO', maxBlendPilots: 8 }
};

// Utility functions
export function getPilotsByTier(tier) {
  return PILOTS_DATABASE.filter(pilot => pilot.tier === tier && pilot.active);
}

export function getPilotsByProblemDomain(domain) {
  return PILOTS_DATABASE.filter(pilot => 
    pilot.problemDomains.includes(domain) && pilot.active
  );
}

export function getPilotsWithOrchestrationAccess(userLevel) {
  const allowedLevels = userLevel === 'DIAMOND_SAO' 
    ? ['ENTERPRISE', 'DIAMOND_SAO']
    : ['ENTERPRISE'];
  
  return PILOTS_DATABASE.filter(pilot => 
    allowedLevels.includes(pilot.orchestrationLevel) && pilot.active
  );
}

export function validatePilotBlend(selectedPilots, userLevel) {
  const maxPilots = ORCHESTRATION_LEVELS[userLevel]?.maxBlendPilots || 3;
  
  if (selectedPilots.length > maxPilots) {
    return { 
      valid: false, 
      message: `Maximum ${maxPilots} pilots allowed for ${userLevel} level` 
    };
  }
  
  return { valid: true, message: 'Valid pilot blend' };
}