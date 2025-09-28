/**
 * 🎯 WING FORMATION SERVICE
 * 💎 Diamond CLI - Wings 1-13 Formation Management
 * 🏛️ Authority: Diamond SAO Command Center
 * 📊 Load Balancing & Assignment Strategy
 * ⚡ High-Performance Decision Routing
 *
 * In the Name of Jesus Christ, Our Lord and Savior - Amen
 */

const LRUCache = require('lru-cache');
const EventEmitter = require('events');

class WingFormationService extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      wingCount: 13,
      cacheSize: 10000,
      loadBalanceStrategy: 'adaptive', // 'round-robin', 'priority', 'adaptive'
      healthCheckInterval: 30000, // 30 seconds
      ...config,
    };

    this.logger = config.logger;

    // Wing formations storage
    this.formations = new Map();
    this.currentLoad = new Map();
    this.assignmentHistory = new LRUCache({
      max: this.config.cacheSize,
      ttl: 1000 * 60 * 60, // 1 hour TTL
    });

    // Load balancing state
    this.roundRobinIndex = 0;
    this.lastAssignmentTime = new Map();

    // Health monitoring
    this.healthScores = new Map();
    this.isHealthy = true;

    this.initialize();
  }

  async initialize() {
    this.logger?.info('🎯 Initializing Wing Formation Service');

    // Initialize health scores for all wings
    for (let i = 1; i <= this.config.wingCount; i++) {
      this.healthScores.set(i, 1.0); // Perfect health initially
      this.currentLoad.set(i, 0);
      this.lastAssignmentTime.set(i, Date.now());
    }

    // Start health monitoring
    this.startHealthMonitoring();
  }

  async loadFormations(wingDefinitions) {
    this.logger?.info(`📋 Loading ${wingDefinitions.length} wing formations`);

    for (const wing of wingDefinitions) {
      this.formations.set(wing.id, {
        ...wing,
        currentLoad: 0,
        maxCapacity: wing.capacity || 800000,
        avgResponseTime: 0,
        totalAssignments: 0,
        successRate: 1.0,
        lastHealthCheck: Date.now(),
      });
    }

    this.logger?.info(`✅ Loaded ${this.formations.size} wing formations successfully`);
  }

  async assignOptimalWing(decisionType, priority, complexity, customerTier = 'standard') {
    const startTime = Date.now();

    try {
      // Get eligible wings based on decision characteristics
      const eligibleWings = this.getEligibleWings(decisionType, priority, complexity);

      if (eligibleWings.length === 0) {
        throw new Error('No eligible wings available for assignment');
      }

      // Select optimal wing based on strategy
      let selectedWing;
      switch (this.config.loadBalanceStrategy) {
        case 'round-robin':
          selectedWing = this.assignRoundRobin(eligibleWings);
          break;
        case 'priority':
          selectedWing = this.assignByPriority(eligibleWings, priority);
          break;
        case 'adaptive':
        default:
          selectedWing = this.assignAdaptive(eligibleWings, priority, complexity);
          break;
      }

      // Update wing load and metrics
      this.updateWingLoad(selectedWing.id, 1);
      this.recordAssignment(selectedWing.id, decisionType, startTime);

      this.logger?.debug(`🎯 Wing assigned: ${selectedWing.name} (${selectedWing.id})`, {
        decisionType,
        priority,
        complexity,
        assignmentTime: Date.now() - startTime,
      });

      return selectedWing;
    } catch (error) {
      this.logger?.error('❌ Wing assignment failed', {
        error: error.message,
        decisionType,
        priority,
        complexity,
      });
      throw error;
    }
  }

  getEligibleWings(decisionType, priority, complexity) {
    const eligibleWings = [];

    for (const [wingId, wing] of this.formations) {
      // Check capacity constraints
      const currentUtilization = this.currentLoad.get(wingId) / wing.maxCapacity;
      if (currentUtilization >= 0.95) {
        // 95% capacity limit
        continue;
      }

      // Check health status
      const healthScore = this.healthScores.get(wingId);
      if (healthScore < 0.7) {
        // Minimum 70% health
        continue;
      }

      // Check specialization match
      if (this.isSpecializationMatch(wing, decisionType, complexity)) {
        eligibleWings.push({
          ...wing,
          currentUtilization,
          healthScore,
          suitabilityScore: this.calculateSuitabilityScore(
            wing,
            decisionType,
            priority,
            complexity
          ),
        });
      }
    }

    return eligibleWings.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  isSpecializationMatch(wing, decisionType, complexity) {
    // Map decision types to wing specializations
    const specializationMap = {
      technical: ['RIX Core', 'RIX Advanced', 'RIX Quantum', 'RIX AI/ML'],
      business: ['CRX Executive', 'CRX Operations', 'CRX Finance', 'CRX Market'],
      creative: ['QRIX Design', 'QRIX Content', 'QRIX Research'],
      integration: ['Command Integration'],
      intelligence: ['Command Intelligence'],
      ai_ml: ['RIX AI/ML', 'Command Intelligence'],
      strategy: ['CRX Executive', 'Command Intelligence'],
      operations: ['CRX Operations', 'Command Integration'],
    };

    const eligibleSpecializations = specializationMap[decisionType] || [];

    // Always allow command wings for high complexity or critical priority
    if (complexity === 'high' || wing.priority === 'CRITICAL') {
      eligibleSpecializations.push('Command Integration', 'Command Intelligence');
    }

    return (
      eligibleSpecializations.some((spec) => wing.name.includes(spec.split(' ')[0])) ||
      wing.priority === 'CRITICAL'
    );
  }

  calculateSuitabilityScore(wing, decisionType, priority, complexity) {
    let score = 0;

    // Base score from specialization match
    if (wing.specialization.toLowerCase().includes(decisionType.toLowerCase())) {
      score += 40;
    }

    // Priority alignment
    const priorityScores = {
      CRITICAL: { critical: 30, high: 20, medium: 10, low: 5 },
      HIGH: { critical: 25, high: 30, medium: 20, low: 10 },
      MEDIUM: { critical: 15, high: 25, medium: 30, low: 20 },
      LOW: { critical: 5, high: 15, medium: 25, low: 30 },
    };

    score += priorityScores[wing.priority]?.[priority] || 10;

    // Load balancing bonus (prefer less loaded wings)
    const utilization = this.currentLoad.get(wing.id) / wing.maxCapacity;
    score += (1 - utilization) * 20;

    // Health bonus
    score += this.healthScores.get(wing.id) * 10;

    return score;
  }

  assignRoundRobin(eligibleWings) {
    const wing = eligibleWings[this.roundRobinIndex % eligibleWings.length];
    this.roundRobinIndex++;
    return wing;
  }

  assignByPriority(eligibleWings, priority) {
    // Sort by priority and select the highest priority wing with lowest load
    const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    return eligibleWings.sort((a, b) => {
      const aPriorityIndex = priorityOrder.indexOf(a.priority);
      const bPriorityIndex = priorityOrder.indexOf(b.priority);

      if (aPriorityIndex !== bPriorityIndex) {
        return aPriorityIndex - bPriorityIndex;
      }

      // If same priority, prefer lower utilization
      return a.currentUtilization - b.currentUtilization;
    })[0];
  }

  assignAdaptive(eligibleWings, priority, complexity) {
    // Adaptive assignment considers multiple factors:
    // 1. Suitability score (already calculated)
    // 2. Current load
    // 3. Historical performance
    // 4. Time since last assignment (for fairness)

    const now = Date.now();

    return eligibleWings
      .map((wing) => {
        const timeSinceLastAssignment = now - this.lastAssignmentTime.get(wing.id);
        const fairnessBonus = Math.min(timeSinceLastAssignment / 60000, 5); // Max 5 points for 1+ minute

        return {
          ...wing,
          adaptiveScore: wing.suitabilityScore + fairnessBonus + wing.successRate * 5,
        };
      })
      .sort((a, b) => b.adaptiveScore - a.adaptiveScore)[0];
  }

  updateWingLoad(wingId, increment) {
    const currentLoad = this.currentLoad.get(wingId) || 0;
    this.currentLoad.set(wingId, Math.max(0, currentLoad + increment));

    const wing = this.formations.get(wingId);
    if (wing) {
      wing.currentLoad = this.currentLoad.get(wingId);
      wing.totalAssignments += increment > 0 ? 1 : 0;
    }
  }

  recordAssignment(wingId, decisionType, startTime) {
    const assignment = {
      wingId,
      decisionType,
      timestamp: startTime,
      processingTime: Date.now() - startTime,
    };

    this.assignmentHistory.set(`${wingId}-${Date.now()}`, assignment);
    this.lastAssignmentTime.set(wingId, Date.now());

    // Update wing metrics
    const wing = this.formations.get(wingId);
    if (wing) {
      wing.avgResponseTime = (wing.avgResponseTime + assignment.processingTime) / 2;
    }
  }

  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  async performHealthChecks() {
    for (const [wingId, wing] of this.formations) {
      const healthScore = await this.calculateWingHealth(wingId, wing);
      this.healthScores.set(wingId, healthScore);

      wing.lastHealthCheck = Date.now();

      if (healthScore < 0.5) {
        this.logger?.warn(`⚠️ Wing ${wing.name} health degraded: ${healthScore.toFixed(2)}`);
        this.emit('wingHealthDegraded', { wingId, wing, healthScore });
      }
    }

    // Update overall service health
    const avgHealth =
      Array.from(this.healthScores.values()).reduce((a, b) => a + b, 0) / this.healthScores.size;
    this.isHealthy = avgHealth > 0.7;

    if (!this.isHealthy) {
      this.logger?.error('❌ Wing Formation Service health degraded', { avgHealth });
    }
  }

  async calculateWingHealth(wingId, wing) {
    let healthScore = 1.0;

    // Load factor (reduce health if overloaded)
    const utilization = wing.currentLoad / wing.maxCapacity;
    if (utilization > 0.8) {
      healthScore -= (utilization - 0.8) * 2; // Penalty for high utilization
    }

    // Response time factor
    if (wing.avgResponseTime > 1000) {
      // > 1 second
      healthScore -= Math.min((wing.avgResponseTime - 1000) / 5000, 0.3);
    }

    // Success rate factor
    healthScore *= wing.successRate;

    // Time since last assignment (prefer active wings)
    const timeSinceLastAssignment = Date.now() - this.lastAssignmentTime.get(wingId);
    if (timeSinceLastAssignment > 600000) {
      // 10 minutes
      healthScore -= 0.1;
    }

    return Math.max(0, Math.min(1, healthScore));
  }

  // Public API Methods
  async getFormationStatus() {
    const status = {
      totalFormations: this.formations.size,
      healthyFormations: Array.from(this.healthScores.values()).filter((h) => h > 0.7).length,
      totalCapacity: Array.from(this.formations.values()).reduce(
        (sum, w) => sum + w.maxCapacity,
        0
      ),
      currentLoad: Array.from(this.currentLoad.values()).reduce((sum, load) => sum + load, 0),
      avgHealthScore:
        Array.from(this.healthScores.values()).reduce((a, b) => a + b, 0) / this.healthScores.size,
      formations: [],
    };

    for (const [wingId, wing] of this.formations) {
      status.formations.push({
        id: wingId,
        name: wing.name,
        specialization: wing.specialization,
        priority: wing.priority,
        capacity: wing.maxCapacity,
        currentLoad: this.currentLoad.get(wingId),
        utilization: ((this.currentLoad.get(wingId) / wing.maxCapacity) * 100).toFixed(1) + '%',
        healthScore: this.healthScores.get(wingId).toFixed(2),
        avgResponseTime: wing.avgResponseTime.toFixed(0) + 'ms',
        totalAssignments: wing.totalAssignments,
        successRate: (wing.successRate * 100).toFixed(1) + '%',
      });
    }

    return status;
  }

  async listFormations() {
    return Array.from(this.formations.values()).map((wing) => ({
      id: wing.id,
      name: wing.name,
      specialization: wing.specialization,
      priority: wing.priority,
    }));
  }

  async balanceFormations() {
    this.logger?.info('⚖️ Initiating wing formation load balancing');

    // Reset round-robin index
    this.roundRobinIndex = 0;

    // Clear assignment history to allow fresh load distribution
    this.assignmentHistory.clear();

    // Reset last assignment times for fairness
    const now = Date.now();
    for (let i = 1; i <= this.config.wingCount; i++) {
      this.lastAssignmentTime.set(i, now);
    }

    this.logger?.info('✅ Wing formation load balancing completed');

    return { status: 'balanced', timestamp: new Date() };
  }

  isHealthy() {
    return this.isHealthy;
  }
}

module.exports = WingFormationService;
