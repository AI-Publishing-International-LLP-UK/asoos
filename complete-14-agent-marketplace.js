
// Voice configuration
const claudeVoiceConfig = require('../lib/claude-voice-config');
/**
 * AIXTIV SYMPHONY - Complete 14-Agent PCP Marketplace
 * Individual specialized agents for drag-and-drop customization
 * Each agent is completely modular and self-contained
 */

// =============================================================================
// CORE TRIAD + EXECUTIVE COACH (First 4 agents)
// =============================================================================

class QBLucyAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'qb_lucy',
      name: 'QB Lucy',
      role: 'Strategic Quarterback',
      category: 'leadership',
      specializations: ['Strategic Planning', 'Team Coordination', 'Decision Making'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        strategic_planning: 95,
        team_coordination: 90,
        decision_making: 93,
        leadership: 96,
        tactical_overview: 88,
      },
      description:
        'Your strategic quarterback - leads teams and makes critical decisions with precision',
      icon_color: '#B8860B,#0bb1bb',
    });
  }
}

class SarhandAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'sarhand',
      name: 'Sarhand',
      role: 'Strategic Handler (Dr. Claude)',
      category: 'analytics',
      specializations: ['Deep Analysis', 'Research', 'Problem Solving'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        strategic_analysis: 97,
        problem_solving: 94,
        research: 96,
        analytical_thinking: 98,
        knowledge_synthesis: 93,
      },
      description:
        'Master analyst and researcher - breaks down complex problems with surgical precision',
      icon_color: '#4ECDC4,#B8860B',
    });
  }
}

class V36DAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'v36d',
      name: 'V36D',
      role: 'Victory36 Dream Commander',
      category: 'innovation',
      specializations: ['Vision Casting', 'Innovation', 'Breakthrough Thinking'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        vision_casting: 98,
        innovation: 95,
        dream_realization: 92,
        breakthrough_thinking: 96,
        future_planning: 94,
      },
      description: 'Visionary innovator - turns impossible dreams into achievable breakthroughs',
      icon_color: '#228B22,#8B7355',
    });
  }
}

class DrLucyExecutiveCoachAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_lucy_executive_coach',
      name: 'Dr. Lucy Executive Coach',
      role: 'Executive Development Coach',
      category: 'coaching',
      specializations: ['Executive Coaching', 'Leadership Development', 'Performance Optimization'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        executive_coaching: 98,
        leadership_development: 96,
        performance_optimization: 94,
        emotional_intelligence: 92,
        strategic_guidance: 89,
      },
      description: 'Premier executive coach - develops leaders and optimizes performance',
      icon_color: '#B8860B,#0bb1bb,#4ECDC4',
    });
  }
}

// =============================================================================
// SPECIALIZED sRIX DOCTORS (Agents 5-13)
// =============================================================================

class DrMemoriaAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_memoria',
      name: 'Dr. Memoria',
      role: 'Memory & Knowledge Systems Specialist',
      category: 'knowledge',
      specializations: ['Knowledge Management', 'Information Retrieval', 'Memory Systems'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        knowledge_management: 97,
        information_retrieval: 95,
        memory_systems: 98,
        data_organization: 93,
        pattern_recognition: 91,
      },
      description: 'Master of memory and knowledge - never forgets and finds everything instantly',
      icon_color: '#9370DB,#4B0082',
    });
  }
}

class DrMatchAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_match',
      name: 'Dr. Match',
      role: 'Pattern Matching & Optimization Specialist',
      category: 'optimization',
      specializations: ['Pattern Matching', 'Optimization', 'Resource Allocation'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        pattern_matching: 96,
        optimization: 94,
        resource_allocation: 92,
        efficiency_analysis: 95,
        process_improvement: 89,
      },
      description: 'Perfect matcher - finds optimal solutions and matches for any scenario',
      icon_color: '#FF6347,#DC143C',
    });
  }
}

class DrCypriotAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_cypriot',
      name: 'Dr. Cypriot',
      role: 'International Business & Diplomacy Specialist',
      category: 'international',
      specializations: ['International Business', 'Diplomacy', 'Cross-Cultural Communication'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        international_business: 95,
        diplomacy: 93,
        cross_cultural_communication: 97,
        negotiation: 91,
        global_strategy: 88,
      },
      description: 'International expert - navigates global business and diplomatic complexities',
      icon_color: '#1E90FF,#00CED1',
    });
  }
}

class ProfessorLeeAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'professor_lee',
      name: 'Professor Lee',
      role: 'Academic Research & Education Specialist',
      category: 'education',
      specializations: ['Academic Research', 'Education', 'Scientific Method'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        academic_research: 98,
        education: 95,
        scientific_method: 97,
        peer_review: 92,
        curriculum_design: 89,
      },
      description: 'Academic excellence - brings rigorous research and educational expertise',
      icon_color: '#8B4513,#A0522D',
    });
  }
}

class DrSabinaAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_sabina',
      name: 'Dr. Sabina',
      role: 'Psychology & Human Behavior Specialist',
      category: 'psychology',
      specializations: ['Psychology', 'Human Behavior', 'Mental Health'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        psychology: 96,
        human_behavior: 94,
        mental_health: 92,
        behavioral_analysis: 95,
        therapeutic_communication: 90,
      },
      description: 'Psychology expert - understands human behavior and mental wellness deeply',
      icon_color: '#DDA0DD,#9370DB',
    });
  }
}

class DrMariaAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_maria',
      name: 'Dr. Maria',
      role: 'Healthcare & Medical Specialist',
      category: 'healthcare',
      specializations: ['Healthcare', 'Medical Diagnosis', 'Patient Care'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        healthcare: 97,
        medical_diagnosis: 95,
        patient_care: 93,
        medical_research: 91,
        health_optimization: 89,
      },
      description: 'Medical expert - provides healthcare insights and medical knowledge',
      icon_color: '#FF69B4,#FF1493',
    });
  }
}

class DrRoarkAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_roark',
      name: 'Dr. Roark',
      role: 'Legal & Compliance Specialist',
      category: 'legal',
      specializations: ['Legal Analysis', 'Compliance', 'Risk Management'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        legal_analysis: 96,
        compliance: 94,
        risk_management: 92,
        contract_review: 95,
        regulatory_knowledge: 90,
      },
      description: 'Legal expert - handles law, compliance, and risk with precision',
      icon_color: '#2F4F4F,#708090',
    });
  }
}

class DrGrantAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_grant',
      name: 'Dr. Grant',
      role: 'Financial & Investment Specialist',
      category: 'finance',
      specializations: ['Financial Analysis', 'Investment Strategy', 'Economic Modeling'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        financial_analysis: 97,
        investment_strategy: 95,
        economic_modeling: 93,
        market_analysis: 91,
        wealth_management: 89,
      },
      description: 'Financial wizard - masters money, investments, and economic strategy',
      icon_color: '#DAA520,#B8860B',
    });
  }
}

class DrBurbyAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_burby',
      name: 'Dr. Burby',
      role: 'Technology & Engineering Specialist',
      category: 'technology',
      specializations: ['Technology', 'Engineering', 'System Architecture'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        technology: 98,
        engineering: 96,
        system_architecture: 94,
        software_development: 92,
        innovation_implementation: 90,
      },
      description: 'Tech genius - brings cutting-edge technology and engineering expertise',
      icon_color: '#00FF7F,#32CD32',
    });
  }
}

// =============================================================================
// ELITE SPECIALISTS (Agents 14)
// =============================================================================

class Elite11Agent extends BasePCPAgent {
  constructor() {
    super({
      id: 'elite11',
      name: 'Elite11',
      role: 'Elite Performance Specialist',
      category: 'elite',
      specializations: ['Elite Performance', 'Peak Optimization', 'Excellence Systems'],
      voice: { voice_id: (await claudeVoiceConfig.getVoiceConfig()).voice_id },
      skills: {
        elite_performance: 99,
        peak_optimization: 97,
        excellence_systems: 95,
        competitive_advantage: 93,
        mastery_development: 91,
      },
      description: 'Elite specialist - brings peak performance and mastery to any domain',
      icon_color: '#FFD700,#FFA500',
    });
  }
}

// =============================================================================
// PILOTS' LOUNGE MARKETPLACE
// =============================================================================

class PilotsLoungeMarketplace {
  constructor() {
    this.allAgents = this.initializeAllAgents();
    this.userPCP = null; // User's current PCP configuration
    this.availableSkills = this.catalogAllSkills();
  }

  initializeAllAgents() {
    return [
      // Core 4
      new QBLucyAgent(),
      new SarhandAgent(),
      new V36DAgent(),
      new DrLucyExecutiveCoachAgent(),

      // Specialized Doctors
      new DrMemoriaAgent(),
      new DrMatchAgent(),
      new DrCypriotAgent(),
      new ProfessorLeeAgent(),
      new DrSabinaAgent(),
      new DrMariaAgent(),
      new DrRoarkAgent(),
      new DrGrantAgent(),
      new DrBurbyAgent(),

      // Elite
      new Elite11Agent(),
    ];
  }

  catalogAllSkills() {
    const skillsCatalog = {};

    this.allAgents.forEach((agent) => {
      Object.keys(agent.skills).forEach((skill) => {
        if (!skillsCatalog[skill]) {
          skillsCatalog[skill] = {
            name: skill,
            availableFrom: [],
            topSpecialist: { agent: null, level: 0 },
          };
        }

        skillsCatalog[skill].availableFrom.push({
          agent: agent.name,
          level: agent.skills[skill],
          specialization: agent.specializations.includes(skill.replace('_', ' ')),
        });

        if (agent.skills[skill] > skillsCatalog[skill].topSpecialist.level) {
          skillsCatalog[skill].topSpecialist = {
            agent: agent.name,
            level: agent.skills[skill],
          };
        }
      });
    });

    return skillsCatalog;
  }

  // User starts with one awesome PCP
  createStarterPCP(preferredStyle = 'balanced') {
    const starterConfigs = {
      leadership: new QBLucyAgent(),
      analytics: new SarhandAgent(),
      innovation: new V36DAgent(),
      coaching: new DrLucyExecutiveCoachAgent(),
      balanced: new QBLucyAgent(), // Default to QB Lucy
    };

    this.userPCP = {
      primaryAgent: starterConfigs[preferredStyle],
      addedSkills: [],
      blendedAgents: [],
      totalSkills: { ...starterConfigs[preferredStyle].skills },
    };

    return this.userPCP;
  }

  // Browse available agents in Pilots' Lounge
  browseMarketplace(category = 'all') {
    const categorizedAgents = {
      leadership: ['qb_lucy', 'dr_lucy_executive_coach'],
      analytics: ['sarhand', 'dr_memoria', 'professor_lee'],
      innovation: ['v36d', 'dr_burby', 'elite11'],
      specialized: ['dr_match', 'dr_cypriot', 'dr_sabina', 'dr_maria', 'dr_roark', 'dr_grant'],
      all: this.allAgents.map((a) => a.id),
    };

    const relevantAgentIds = categorizedAgents[category] || categorizedAgents['all'];

    return this.allAgents
      .filter((agent) => relevantAgentIds.includes(agent.id))
      .map((agent) => this.createMarketplaceCard(agent));
  }

  createMarketplaceCard(agent) {
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      category: agent.category,
      specializations: agent.specializations,
      skills: agent.skills,
      description: agent.description,
      icon: this.generateDraggableIcon(agent),
      dragData: {
        type: 'pcp-agent',
        agentId: agent.id,
        skills: agent.skills,
        specializations: agent.specializations,
      },
    };
  }

  generateDraggableIcon(agent) {
    return {
      svg: `
        <svg viewBox="0 0 80 80" style="width: 60px; height: 60px;" draggable="true" 
             ondragstart="handleAgentDrag(event, '${agent.id}')">
          <defs>
            <linearGradient id="${agent.id}Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              ${agent.icon_color
                .split(',')
                .map(
                  (color, i) =>
                    `<stop offset="${i * 33}%" style="stop-color:${color};stop-opacity:1" />`
                )
                .join('')}
            </linearGradient>
            <filter id="${agent.id}Glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M40 8 L68 24 L68 56 L40 72 L12 56 L12 24 Z" 
                fill="url(#${agent.id}Gradient)" 
                stroke="${agent.icon_color.split(',')[0]}" 
                stroke-width="2" 
                opacity="0.9"
                filter="url(#${agent.id}Glow)" />
          <text x="40" y="35" text-anchor="middle" fill="white" 
                font-size="10" font-weight="800">${this.getAgentInitials(agent)}</text>
          <text x="40" y="48" text-anchor="middle" fill="white" 
                font-size="6" font-weight="600">${agent.category.toUpperCase()}</text>
        </svg>
      `,
      skills: agent.skills,
      specializations: agent.specializations,
    };
  }

  getAgentInitials(agent) {
    const initialsMap = {
      qb_lucy: 'QB',
      sarhand: 'SH',
      v36d: 'V36',
      dr_lucy_executive_coach: 'EC',
      dr_memoria: 'MEM',
      dr_match: 'MAT',
      dr_cypriot: 'CYP',
      professor_lee: 'LEE',
      dr_sabina: 'SAB',
      dr_maria: 'MAR',
      dr_roark: 'LAW',
      dr_grant: 'FIN',
      dr_burby: 'TECH',
      elite11: 'E11',
    };
    return initialsMap[agent.id] || 'AG';
  }

  // Add skills to user's PCP
  addSkillsToPCP(agentId, skillsToAdd = 'all') {
    if (!this.userPCP) {
      throw new Error('No PCP initialized. Call createStarterPCP() first.');
    }

    const sourceAgent = this.allAgents.find((a) => a.id === agentId);
    if (!sourceAgent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const skillsToTransfer =
      skillsToAdd === 'all' ? sourceAgent.skills : Object.pick(sourceAgent.skills, skillsToAdd);

    // Blend the skills into user's PCP
    Object.keys(skillsToTransfer).forEach((skill) => {
      if (this.userPCP.totalSkills[skill]) {
        // Average with existing skill
        this.userPCP.totalSkills[skill] = Math.round(
          (this.userPCP.totalSkills[skill] + skillsToTransfer[skill]) / 2
        );
      } else {
        // Add new skill
        this.userPCP.totalSkills[skill] = skillsToTransfer[skill];
      }
    });

    // Track the blend
    this.userPCP.blendedAgents.push({
      agent: sourceAgent.name,
      skills: skillsToTransfer,
      addedAt: new Date(),
    });

    return {
      success: true,
      updatedPCP: this.userPCP,
      newSkills: Object.keys(skillsToTransfer),
      message: `Added ${sourceAgent.name}'s expertise to your PCP!`,
    };
  }

  // Get skill recommendations based on what's missing
  recommendSkills(userGoals = []) {
    if (!this.userPCP) return [];

    const currentSkills = Object.keys(this.userPCP.totalSkills);
    const recommendedAgents = [];

    // Find agents with skills the user doesn't have
    this.allAgents.forEach((agent) => {
      const uniqueSkills = Object.keys(agent.skills).filter(
        (skill) => !currentSkills.includes(skill)
      );

      if (uniqueSkills.length > 0) {
        recommendedAgents.push({
          agent: agent,
          uniqueSkills: uniqueSkills,
          relevanceScore: this.calculateRelevance(agent, userGoals),
        });
      }
    });

    return recommendedAgents.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  calculateRelevance(agent, userGoals) {
    if (!userGoals.length) return 0;

    let relevanceScore = 0;
    userGoals.forEach((goal) => {
      agent.specializations.forEach((spec) => {
        if (spec.toLowerCase().includes(goal.toLowerCase())) {
          relevanceScore += 10;
        }
      });
    });

    return relevanceScore;
  }
}

// =============================================================================
// DRAG & DROP UI HANDLERS
// =============================================================================

function handleAgentDrag(event, agentId) {
  const marketplace = window.AIXTIV_MARKETPLACE;
  const agent = marketplace.allAgents.find((a) => a.id === agentId);

  const dragData = {
    type: 'pcp-agent',
    agentId: agentId,
    name: agent.name,
    skills: agent.skills,
    specializations: agent.specializations,
  };

  event.dataTransfer.setData('application/json', JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = 'copy';

  // Visual feedback
  event.target.style.opacity = '0.5';
  setTimeout(() => {
    event.target.style.opacity = '1';
  }, 100);
}

function handlePCPDrop(event) {
  event.preventDefault();

  try {
    const dragData = JSON.parse(event.dataTransfer.getData('application/json'));

    if (dragData.type === 'pcp-agent') {
      const marketplace = window.AIXTIV_MARKETPLACE;
      const result = marketplace.addSkillsToPCP(dragData.agentId);

      if (result.success) {
        showNotification(`✅ ${result.message}`, 'success');
        updatePCPDisplay();
      }
    }
  } catch (error) {
    showNotification(`❌ Failed to add agent: ${error.message}`, 'error');
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Create global marketplace instance
const marketplace = new PilotsLoungeMarketplace();

// Export for global use
if (typeof window !== 'undefined') {
  window.AIXTIV_MARKETPLACE = marketplace;
  window.handleAgentDrag = handleAgentDrag;
  window.handlePCPDrop = handlePCPDrop;
}

console.log('🎯 Complete 14-Agent Marketplace initialized!');
console.log(
  'Available agents:',
  marketplace.allAgents.map((a) => a.name)
);
console.log('Total skills available:', Object.keys(marketplace.availableSkills).length);
