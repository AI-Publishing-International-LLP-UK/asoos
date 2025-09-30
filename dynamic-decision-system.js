// Dynamic Decision Trigger System
// Manages S2D (Scan-to-Approve) and contextual decision buttons across all 7 icon tools

class DynamicDecisionSystem {
  constructor() {
    this.activeDecisions = new Map();
    this.decisionQueue = [];
    this.currentDecisionId = null;
    this.decisionTypes = {
      S2D: 'scan-to-approve',
      QUICK: 'quick-approve', 
      BLOCKCHAIN: 'blockchain-approve',
      BUDGET: 'budget-approve',
      SECURITY: 'security-approve',
      WORKFLOW: 'workflow-approve'
    };
    this.init();
  }

  init() {
    this.setupDecisionContainer();
    this.bindEventListeners();
    this.startDecisionMonitoring();
  }

  setupDecisionContainer() {
    // Create dynamic decision container that appears when needed
    const decisionContainer = document.createElement('div');
    decisionContainer.id = 'dynamicDecisionContainer';
    decisionContainer.className = 'dynamic-decision-container hidden';
    decisionContainer.innerHTML = `
      <div class="decision-overlay">
        <div class="decision-panel">
          <div class="decision-header">
            <div class="decision-icon"></div>
            <div class="decision-title"></div>
            <button class="decision-close" onclick="DecisionSystem.cancelDecision()">×</button>
          </div>
          <div class="decision-content">
            <div class="decision-description"></div>
            <div class="decision-details"></div>
          </div>
          <div class="decision-actions">
            <div class="decision-buttons"></div>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const styles = document.createElement('style');
    styles.textContent = `
      .dynamic-decision-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10000;
        transition: all 0.3s ease;
      }

      .dynamic-decision-container.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .decision-overlay {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .decision-panel {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 0;
        max-width: 500px;
        width: 90vw;
        max-height: 70vh;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }

      .decision-header {
        background: linear-gradient(90deg, #0bb1bb, #4ECDC4);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
      }

      .decision-icon {
        font-size: 24px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .decision-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }

      .decision-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
      }

      .decision-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .decision-content {
        padding: 20px;
        color: #fff;
      }

      .decision-description {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      .decision-details {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        color: #aaa;
        line-height: 1.4;
      }

      .decision-actions {
        padding: 0 20px 20px 20px;
      }

      .decision-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .decision-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .decision-btn.primary {
        background: linear-gradient(135deg, #0bb1bb, #4ECDC4);
        color: white;
      }

      .decision-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(11, 177, 187, 0.4);
      }

      .decision-btn.secondary {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .decision-btn.secondary:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .decision-btn.danger {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
      }

      .decision-btn.danger:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
      }

      /* S2D Button Enhancement in Right Panel */
      .scan-approve-btn.decision-pending {
        animation: pulse-decision 2s ease-in-out infinite;
        background: linear-gradient(135deg, #FFD700, #FFA500) !important;
      }

      @keyframes pulse-decision {
        0%, 100% { 
          transform: scale(1);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        50% { 
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }
      }

      /* Notification Badge for Decision Count */
      .decision-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff6b6b;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounce 0.5s ease-out;
      }

      @keyframes bounce {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styles);
    document.body.appendChild(decisionContainer);

    // Make globally accessible
    window.DecisionSystem = this;
  }

  bindEventListeners() {
    // Listen for decision triggers from PCP and Dream Commander
    document.addEventListener('pcpDecisionTrigger', (event) => {
      this.handleDecisionTrigger(event.detail);
    });

    // Listen for tool-specific decision events
    document.addEventListener('toolDecisionRequired', (event) => {
      this.handleToolDecision(event.detail);
    });

    // Enhance existing S2D button
    const existingS2DBtn = document.querySelector('.scan-approve-btn');
    if (existingS2DBtn) {
      existingS2DBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleS2DClick();
      });
    }
  }

  startDecisionMonitoring() {
    // Monitor for decision points across all 7 icon tools
    setInterval(() => {
      this.checkForPendingDecisions();
    }, 2000);
  }

  handleDecisionTrigger(decisionData) {
    const decision = {
      id: this.generateDecisionId(),
      type: decisionData.type || this.decisionTypes.QUICK,
      title: decisionData.title,
      description: decisionData.description,
      details: decisionData.details,
      toolSource: decisionData.toolSource,
      data: decisionData.data,
      actions: decisionData.actions || this.getDefaultActions(decisionData.type),
      priority: decisionData.priority || 'normal',
      timestamp: new Date(),
      timeout: decisionData.timeout || 300000 // 5 minutes default
    };

    this.activeDecisions.set(decision.id, decision);
    this.decisionQueue.push(decision.id);

    this.updateS2DButtonState();
    
    if (decisionData.immediate || this.decisionQueue.length === 1) {
      this.showNextDecision();
    }
  }

  handleToolDecision(toolData) {
    // Handle decisions from specific tools (Growth, Vision, etc.)
    const decisionType = this.determineDecisionType(toolData.tool, toolData.action);
    
    this.handleDecisionTrigger({
      type: decisionType,
      title: `${toolData.tool} Decision Required`,
      description: toolData.message,
      details: toolData.details,
      toolSource: toolData.tool,
      data: toolData.data,
      immediate: toolData.urgent || false
    });
  }

  handleS2DClick() {
    if (this.decisionQueue.length > 0) {
      this.showNextDecision();
    } else {
      // Show available decisions or create test decision
      this.showDecisionDashboard();
    }
  }

  showNextDecision() {
    if (this.decisionQueue.length === 0) {
      this.hideDecisionPanel();
      return;
    }

    const decisionId = this.decisionQueue[0];
    const decision = this.activeDecisions.get(decisionId);
    
    if (!decision) {
      this.decisionQueue.shift();
      return this.showNextDecision();
    }

    this.currentDecisionId = decisionId;
    this.renderDecisionPanel(decision);
  }

  renderDecisionPanel(decision) {
    const container = document.getElementById('dynamicDecisionContainer');
    const panel = container.querySelector('.decision-panel');
    
    // Update header
    panel.querySelector('.decision-icon').textContent = this.getDecisionIcon(decision.type);
    panel.querySelector('.decision-title').textContent = decision.title;
    
    // Update content
    panel.querySelector('.decision-description').textContent = decision.description;
    panel.querySelector('.decision-details').innerHTML = this.formatDecisionDetails(decision);
    
    // Update actions
    this.renderDecisionActions(panel.querySelector('.decision-buttons'), decision);
    
    // Show panel
    container.classList.remove('hidden');
  }

  renderDecisionActions(container, decision) {
    container.innerHTML = '';
    
    decision.actions.forEach(action => {
      const button = document.createElement('button');
      button.className = `decision-btn ${action.style}`;
      button.innerHTML = `
        ${action.icon ? `<span>${action.icon}</span>` : ''}
        <span>${action.label}</span>
      `;
      
      button.addEventListener('click', () => {
        this.handleDecisionAction(decision.id, action);
      });
      
      container.appendChild(button);
    });
  }

  handleDecisionAction(decisionId, action) {
    const decision = this.activeDecisions.get(decisionId);
    
    if (action.type === 'approve') {
      this.approveDecision(decision, action);
    } else if (action.type === 'reject') {
      this.rejectDecision(decision, action);
    } else if (action.type === 'defer') {
      this.deferDecision(decision, action);
    }
    
    // Remove from queue and active decisions
    this.activeDecisions.delete(decisionId);
    this.decisionQueue = this.decisionQueue.filter(id => id !== decisionId);
    
    this.updateS2DButtonState();
    this.hideDecisionPanel();
    
    // Show next decision if any
    setTimeout(() => {
      if (this.decisionQueue.length > 0) {
        this.showNextDecision();
      }
    }, 500);
  }

  approveDecision(decision, action) {
    console.log(`✅ Decision approved: ${decision.title}`);
    
    // Trigger blockchain recording if S2D type
    if (decision.type === this.decisionTypes.S2D || decision.type === this.decisionTypes.BLOCKCHAIN) {
      this.recordBlockchainApproval(decision, action);
    }
    
    // Execute approval callback
    if (action.callback) {
      action.callback(decision, 'approved');
    }
    
    // Notify tool source
    this.notifyToolSource(decision.toolSource, 'approved', decision.data);
  }

  rejectDecision(decision, action) {
    console.log(`❌ Decision rejected: ${decision.title}`);
    
    if (action.callback) {
      action.callback(decision, 'rejected');
    }
    
    this.notifyToolSource(decision.toolSource, 'rejected', decision.data);
  }

  deferDecision(decision, action) {
    console.log(`⏳ Decision deferred: ${decision.title}`);
    
    // Re-add to queue with lower priority
    setTimeout(() => {
      decision.priority = 'low';
      this.decisionQueue.push(decision.id);
      this.updateS2DButtonState();
    }, action.deferTime || 60000); // 1 minute default
  }

  cancelDecision() {
    if (this.currentDecisionId) {
      const decision = this.activeDecisions.get(this.currentDecisionId);
      if (decision) {
        this.deferDecision(decision, { deferTime: 300000 }); // 5 minutes
      }
    }
    this.hideDecisionPanel();
  }

  hideDecisionPanel() {
    const container = document.getElementById('dynamicDecisionContainer');
    container.classList.add('hidden');
    this.currentDecisionId = null;
  }

  updateS2DButtonState() {
    const s2dBtn = document.querySelector('.scan-approve-btn');
    if (!s2dBtn) return;

    // Remove existing badge
    const existingBadge = s2dBtn.querySelector('.decision-count-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    if (this.decisionQueue.length > 0) {
      s2dBtn.classList.add('decision-pending');
      
      // Add decision count badge
      const badge = document.createElement('div');
      badge.className = 'decision-count-badge';
      badge.textContent = this.decisionQueue.length;
      s2dBtn.style.position = 'relative';
      s2dBtn.appendChild(badge);
      
      // Update text
      const span = s2dBtn.querySelector('span');
      if (span) {
        span.textContent = `${this.decisionQueue.length} DECISION${this.decisionQueue.length > 1 ? 'S' : ''} PENDING`;
      }
    } else {
      s2dBtn.classList.remove('decision-pending');
      
      // Reset text
      const span = s2dBtn.querySelector('span');
      if (span) {
        span.textContent = 'SCAN TO APPROVE';
      }
    }
  }

  checkForPendingDecisions() {
    // Simulate decision triggers from tools (in production, these come from PCP/Dream Commander)
    if (Math.random() > 0.95 && this.activeDecisions.size < 3) {
      const testDecisions = [
        {
          tool: 'Growth - BidSuite',
          action: 'bid_submission',
          message: 'New bid opportunity identified',
          details: 'Enterprise client RFP for $2.3M project. Confidence score: 87%. Requires approval to submit proposal.',
          data: { amount: 2300000, client: 'TechCorp', deadline: '2025-01-15' },
          urgent: false
        },
        {
          tool: 'Vision - WishVision',
          action: 'vision_implementation',
          message: 'Vision synthesis complete',
          details: 'Strategic vision for Q2 2025 ready for implementation. Requires stakeholder approval.',
          data: { vision: 'Digital Transformation Initiative', impact: 'High' },
          urgent: false
        },
        {
          tool: 'Voice - ElevenLabs',
          action: 'voice_deployment',
          message: 'New voice model ready',
          details: 'Custom voice model training complete. Deploy to production?',
          data: { model: 'Executive-Voice-v3', quality: '95%' },
          urgent: false
        }
      ];

      const randomDecision = testDecisions[Math.floor(Math.random() * testDecisions.length)];
      this.handleToolDecision(randomDecision);
    }
  }

  // Helper methods
  generateDecisionId() {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  determineDecisionType(tool, action) {
    const typeMap = {
      'Growth': this.decisionTypes.BUDGET,
      'Vision': this.decisionTypes.WORKFLOW, 
      'Voice': this.decisionTypes.QUICK,
      'Governance': this.decisionTypes.S2D,
      'Security': this.decisionTypes.SECURITY,
      'Patent': this.decisionTypes.BLOCKCHAIN
    };

    for (const [key, type] of Object.entries(typeMap)) {
      if (tool.includes(key)) {
        return type;
      }
    }

    return this.decisionTypes.QUICK;
  }

  getDecisionIcon(type) {
    const iconMap = {
      [this.decisionTypes.S2D]: '🔍',
      [this.decisionTypes.QUICK]: '⚡',
      [this.decisionTypes.BLOCKCHAIN]: '⛓️',
      [this.decisionTypes.BUDGET]: '💰',
      [this.decisionTypes.SECURITY]: '🔐',
      [this.decisionTypes.WORKFLOW]: '⚙️'
    };
    return iconMap[type] || '📋';
  }

  getDefaultActions(type) {
    const actionMap = {
      [this.decisionTypes.S2D]: [
        { type: 'approve', label: 'Scan & Approve', style: 'primary', icon: '🔍' },
        { type: 'reject', label: 'Reject', style: 'danger', icon: '❌' },
        { type: 'defer', label: 'Review Later', style: 'secondary', icon: '⏳' }
      ],
      [this.decisionTypes.QUICK]: [
        { type: 'approve', label: 'Approve', style: 'primary', icon: '✅' },
        { type: 'reject', label: 'Reject', style: 'danger', icon: '❌' }
      ],
      [this.decisionTypes.BLOCKCHAIN]: [
        { type: 'approve', label: 'Blockchain Approve', style: 'primary', icon: '⛓️' },
        { type: 'reject', label: 'Reject', style: 'danger', icon: '❌' },
        { type: 'defer', label: 'Review Later', style: 'secondary', icon: '⏳' }
      ]
    };
    return actionMap[type] || actionMap[this.decisionTypes.QUICK];
  }

  formatDecisionDetails(decision) {
    if (typeof decision.details === 'string') {
      return decision.details;
    }
    
    let html = '';
    if (decision.data) {
      for (const [key, value] of Object.entries(decision.data)) {
        html += `<div><strong>${key}:</strong> ${value}</div>`;
      }
    }
    return html || decision.details || 'No additional details available.';
  }

  recordBlockchainApproval(decision, action) {
    // Record the approval on blockchain (placeholder for actual blockchain integration)
    console.log('🔗 Recording blockchain approval:', {
      decision_id: decision.id,
      timestamp: new Date().toISOString(),
      approver: 'User',
      decision_type: decision.type,
      tool_source: decision.toolSource
    });
  }

  notifyToolSource(toolSource, status, data) {
    // Notify the originating tool about the decision outcome
    document.dispatchEvent(new CustomEvent('decisionOutcome', {
      detail: {
        toolSource,
        status,
        data
      }
    }));
  }

  showDecisionDashboard() {
    // Show dashboard of all available decisions (future enhancement)
    console.log('📊 Decision Dashboard - No pending decisions');
  }
}

// Initialize the Dynamic Decision System when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DynamicDecisionSystem();
});

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicDecisionSystem;
}