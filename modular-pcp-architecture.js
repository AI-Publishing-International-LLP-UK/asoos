/**
 * AIXTIV SYMPHONY - Modular PCP Architecture
 * Individual agent packages for drag-and-drop functionality
 * Goal: 14 total agents, all modularized, selectable from Pilots' Lounge
 */

// Base PCP Agent Class - All agents inherit from this
class BasePCPAgent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.category = config.category;
    this.voice = config.voice;
    this.skills = config.skills || {};
    this.blendable = config.blendable !== false;
    this.active = false;
    this.blendPercentage = 100;
  }

  // Core methods all agents must implement
  activate() {
    this.active = true;
    this.updateUI();
    this.initializeVoice();
    this.sendActivationSignal();
  }

  deactivate() {
    this.active = false;
    this.updateUI();
  }

  setBlendPercentage(percentage) {
    this.blendPercentage = Math.max(0, Math.min(100, percentage));
    this.updateBlendDisplay();
  }

  updateUI() {
    const element = document.getElementById(this.id);
    if (element) {
      element.classList.toggle('active', this.active);
    }
  }

  initializeVoice() {
    if (this.voice && this.voice.voice_id) {
      console.log(`Initializing voice for ${this.name}:`, this.voice.voice_id);
      // Voice initialization logic here
    }
  }

  sendActivationSignal() {
    window.dispatchEvent(
      new CustomEvent('pcpActivated', {
        detail: { agent: this, timestamp: Date.now() },
      })
    );
  }
}

// =============================================================================
// TRIAD AGENTS (3)
// =============================================================================

// Agent 1: QB Lucy (Dr. Lucy in quarterback role)
class QBLucyAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'qb_lucy',
      name: 'QB Lucy',
      role: 'Quarterback',
      category: 'triad',
      voice: {
        voice_id: '4RZ84U1b4WCqpu57LvIq', // Your authorized Dr. Lucy voice
        name: 'Dr. Lucy QB Voice',
        personality: 'Strategic, decisive, leadership-focused',
      },
      skills: {
        strategic_planning: 95,
        team_coordination: 90,
        decision_making: 93,
        tactical_overview: 88,
        leadership: 96,
      },
      blendable: true,
    });
  }

  // QB Lucy specific methods
  executeQuarterbackPlay(strategy) {
    console.log(`QB Lucy executing strategy: ${strategy}`);
    return {
      play: strategy,
      coordination: this.skills.team_coordination,
      leadership: this.skills.leadership,
    };
  }

  getStrategicInsight(context) {
    return `QB Lucy Strategic Analysis: ${context} - Recommended approach based on ${this.skills.strategic_planning}% strategic planning capability.`;
  }
}

// Agent 2: Sarhand (Dr. Claude)
class SarhandAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'sarhand',
      name: 'Sarhand',
      role: 'Strategic Handler',
      category: 'triad',
      voice: {
        voice_id: '{{SARHAND_VOICE_ID}}', // To be configured
        name: 'Dr. Claude Sarhand Voice',
        personality: 'Analytical, precise, methodical',
      },
      skills: {
        strategic_analysis: 97,
        problem_solving: 94,
        research: 96,
        analytical_thinking: 98,
        knowledge_synthesis: 93,
      },
      blendable: true,
    });
  }

  // Sarhand specific methods
  analyzeStrategicContext(data) {
    console.log(
      `Sarhand analyzing context with ${this.skills.analytical_thinking}% analytical capability`
    );
    return {
      analysis: data,
      confidence: this.skills.strategic_analysis,
      recommendations: this.generateRecommendations(data),
    };
  }

  generateRecommendations(context) {
    return `Sarhand recommends: Strategic approach based on ${this.skills.problem_solving}% problem-solving analysis of ${context}`;
  }
}

// Agent 3: V36D (Victory36 with Dream Commander)
class V36DAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'v36d',
      name: 'V36D',
      role: 'Victory36 Dream Commander',
      category: 'triad',
      voice: {
        voice_id: '{{V36D_VOICE_ID}}', // To be configured
        name: 'Victory36 Dream Commander Voice',
        personality: 'Visionary, innovative, breakthrough-focused',
      },
      skills: {
        vision_casting: 98,
        innovation: 95,
        dream_realization: 92,
        breakthrough_thinking: 96,
        future_planning: 94,
      },
      blendable: true,
      dreamCommanderActive: true,
    });
  }

  // V36D specific methods
  castVision(objective) {
    console.log(`V36D casting vision for: ${objective}`);
    return {
      vision: objective,
      innovation_score: this.skills.innovation,
      breakthrough_potential: this.skills.breakthrough_thinking,
      dream_commander_analysis: this.dreamCommanderAnalysis(objective),
    };
  }

  dreamCommanderAnalysis(objective) {
    return `Dream Commander Analysis: ${objective} has ${this.skills.dream_realization}% realization probability with breakthrough innovation approach.`;
  }
}

// =============================================================================
// EXECUTIVE COACH (Separate Dr. Lucy)
// =============================================================================

// Agent 4: Dr. Lucy Executive Coach
class DrLucyExecutiveCoachAgent extends BasePCPAgent {
  constructor() {
    super({
      id: 'dr_lucy_executive_coach',
      name: 'Dr. Lucy Executive Coach',
      role: 'Executive Coach',
      category: 'executive_coaching',
      voice: {
        voice_id: '4RZ84U1b4WCqpu57LvIq', // Same voice as QB Lucy but different role
        name: 'Dr. Lucy Executive Coach Voice',
        personality: 'Nurturing, developmental, empowering',
      },
      skills: {
        executive_coaching: 98,
        leadership_development: 96,
        performance_optimization: 94,
        emotional_intelligence: 92,
        strategic_guidance: 89,
      },
      blendable: true,
    });
  }

  // Executive Coach specific methods
  provideCoaching(situation) {
    console.log(`Dr. Lucy Executive Coach providing guidance for: ${situation}`);
    return {
      coaching_approach: this.determineCoachingApproach(situation),
      development_plan: this.createDevelopmentPlan(situation),
      emotional_support: this.skills.emotional_intelligence,
    };
  }

  determineCoachingApproach(situation) {
    return `Executive coaching approach for ${situation}: ${this.skills.executive_coaching}% effectiveness with personalized development focus.`;
  }

  createDevelopmentPlan(situation) {
    return {
      focus_areas: ['leadership', 'strategic_thinking', 'performance'],
      timeline: '90-day intensive development',
      success_metrics: this.skills.performance_optimization,
    };
  }
}

// =============================================================================
// PILOTS' LOUNGE MANAGEMENT SYSTEM
// =============================================================================

class PilotsLoungeManager {
  constructor() {
    this.availableAgents = [];
    this.activeAgents = [];
    this.blendedSkills = {};
    this.initializeAgents();
  }

  initializeAgents() {
    // Initialize the 4 core agents
    this.availableAgents = [
      new QBLucyAgent(),
      new SarhandAgent(),
      new V36DAgent(),
      new DrLucyExecutiveCoachAgent(),
    ];

    // TODO: Add 10 more agents to reach 14 total
    // Placeholders for future agents:
    // - Dr. Memoria sRIX
    // - Dr. Match sRIX
    // - Dr. Cypriot sRIX
    // - Professor Lee sRIX
    // - Dr. Sabina sRIX
    // - Dr. Maria sRIX
    // - Dr. Roark sRIX
    // - Dr. Grant sRIX
    // - Dr. Burby sRIX
    // - Elite11, Mastery33, etc.
  }

  // Drag and Drop functionality
  selectAgent(agentId) {
    const agent = this.availableAgents.find((a) => a.id === agentId);
    if (agent) {
      return {
        agent: agent,
        packageData: this.createAgentPackage(agent),
      };
    }
    return null;
  }

  createAgentPackage(agent) {
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      skills: agent.skills,
      voice: agent.voice,
      blendPercentage: 100,
      activationCode: `activate${agent.id.replace(/_/g, '')}()`,
      icon: this.generateIconSVG(agent),
      metadata: {
        category: agent.category,
        blendable: agent.blendable,
        packageVersion: '1.0.0',
      },
    };
  }

  // Skill Blending System
  blendAgents(agents, percentages) {
    if (agents.length !== percentages.length) {
      throw new Error('Agents and percentages arrays must have same length');
    }

    const blendedSkills = {};
    const skillCategories = new Set();

    // Collect all skill categories
    agents.forEach((agent) => {
      Object.keys(agent.skills).forEach((skill) => skillCategories.add(skill));
    });

    // Blend skills based on percentages
    skillCategories.forEach((skill) => {
      let blendedValue = 0;
      let totalPercentage = 0;

      agents.forEach((agent, index) => {
        if (agent.skills[skill]) {
          const contribution = (agent.skills[skill] * percentages[index]) / 100;
          blendedValue += contribution;
          totalPercentage += percentages[index];
        }
      });

      blendedSkills[skill] = totalPercentage > 0 ? blendedValue / (totalPercentage / 100) : 0;
    });

    return {
      blendedSkills,
      activeAgents: agents.map((agent, index) => ({
        agent: agent.name,
        percentage: percentages[index],
      })),
    };
  }

  generateIconSVG(agent) {
    // Generate SVG icon based on agent type
    const colors = {
      qb_lucy: '#B8860B,#0bb1bb',
      sarhand: '#4ECDC4,#B8860B',
      v36d: '#228B22,#8B7355',
      dr_lucy_executive_coach: '#B8860B,#0bb1bb,#4ECDC4',
    };

    const gradient = colors[agent.id] || '#666,#999';
    const initials = this.getAgentInitials(agent);

    return `
      <svg viewBox="0 0 60 60" style="width: 50px; height: 50px;">
        <defs>
          <linearGradient id="${agent.id}Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            ${gradient
              .split(',')
              .map(
                (color, i) =>
                  `<stop offset="${i * 50}%" style="stop-color:${color};stop-opacity:1" />`
              )
              .join('')}
          </linearGradient>
        </defs>
        <path d="M30 5 L50 20 L50 40 L30 55 L10 40 L10 20 Z" 
              fill="url(#${agent.id}Gradient)" 
              stroke="${gradient.split(',')[0]}" 
              stroke-width="2" 
              opacity="0.9" />
        <text x="30" y="32" text-anchor="middle" fill="white" 
              font-size="10" font-weight="800">${initials}</text>
      </svg>
    `;
  }

  getAgentInitials(agent) {
    const initialsMap = {
      qb_lucy: 'QB',
      sarhand: 'SH',
      v36d: 'V36',
      dr_lucy_executive_coach: 'EC',
    };
    return initialsMap[agent.id] || 'AG';
  }
}

// =============================================================================
// PCP DROP ZONE SYSTEM
// =============================================================================

class PCPDropZone {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.activeAgents = [];
    this.initializeDropZone();
  }

  initializeDropZone() {
    if (!this.element) return;

    this.element.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.element.classList.add('drop-ready');
    });

    this.element.addEventListener('dragleave', (e) => {
      this.element.classList.remove('drop-ready');
    });

    this.element.addEventListener('drop', (e) => {
      e.preventDefault();
      this.element.classList.remove('drop-ready');

      try {
        const agentData = JSON.parse(e.dataTransfer.getData('application/json'));
        this.dropAgent(agentData);
      } catch (error) {
        console.error('Failed to drop agent:', error);
      }
    });
  }

  dropAgent(agentPackage) {
    console.log(`Dropping agent ${agentPackage.name} into PCP zone`);

    // Add to active agents
    this.activeAgents.push(agentPackage);

    // Execute activation
    this.activateAgent(agentPackage);

    // Update UI
    this.updateDropZoneUI();
  }

  activateAgent(agentPackage) {
    // Dynamic activation based on package
    try {
      eval(agentPackage.activationCode);
      console.log(`Activated ${agentPackage.name} successfully`);
    } catch (error) {
      console.error(`Failed to activate ${agentPackage.name}:`, error);
    }
  }

  updateDropZoneUI() {
    // Visual feedback for dropped agents
    const agentList = this.activeAgents
      .map(
        (agent) => `
      <div class="active-pcp-agent" data-agent="${agent.id}">
        ${agent.icon}
        <span>${agent.name}</span>
        <span class="blend-percentage">${agent.blendPercentage}%</span>
      </div>
    `
      )
      .join('');

    const statusElement = document.getElementById('pcp-status');
    if (statusElement) {
      statusElement.innerHTML = agentList;
    }
  }
}

// =============================================================================
// INITIALIZATION AND EXPORT
// =============================================================================

// Initialize the system
const pilotsLounge = new PilotsLoungeManager();
const pcpDropZone = new PCPDropZone('pcp-drop-zone');

// Export for global use
if (typeof window !== 'undefined') {
  window.AIXTIV_PCP = {
    BasePCPAgent,
    QBLucyAgent,
    SarhandAgent,
    V36DAgent,
    DrLucyExecutiveCoachAgent,
    PilotsLoungeManager,
    PCPDropZone,
    pilotsLounge,
    pcpDropZone,
  };
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BasePCPAgent,
    QBLucyAgent,
    SarhandAgent,
    V36DAgent,
    DrLucyExecutiveCoachAgent,
    PilotsLoungeManager,
    PCPDropZone,
  };
}

console.log(
  '🚀 Modular PCP Architecture loaded - 4 agents ready, 10 slots available for expansion to 14 total agents'
);
