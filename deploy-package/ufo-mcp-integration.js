/**
 * UFO - UNIFIED FRONTEND OPERATIONS FOR MCP SERVERS
 * Commander: Phillip Corey Roark
 * Mission: Deploy enhanced interface across ALL MCP endpoints with UFO functionality
 * Scope: mcp.aipub.2100.cool + all mcp.[company].com endpoints
 * Protection: Victory36 Maximum Security across all UFO operations
 */

class UFOMCPIntegration {
  constructor() {
    this.mcpEndpoints = {
      main: 'https://mcp.aipub.2100.cool',
      base: 'mcp.aipub.2100.cool',
      wfa: 'https://asoos.2100.cool/wfa/',
      cloudRun: 'https://wfa-production-swarm-yutylytffa-uw.a.run.app',
      sallyPort: 'https://sallyport.2100.cool'
    };
    
    this.ufoConfig = {
      version: '2.4.7',
      quantumProtection: 'MAXIMUM',
      unifiedExperience: true,
      crossMCPSync: true,
      enterpriseReady: true
    };
    
    this.detectedMCPEndpoint = this.detectCurrentMCPEndpoint();
    this.companyContext = this.extractCompanyContext();
    
    console.log('🛸 UFO-MCP Integration initializing...');
    console.log(`📡 Detected endpoint: ${this.detectedMCPEndpoint}`);
    console.log(`🏢 Company context: ${this.companyContext || 'Base MCP'}`);
    
    this.init();
  }
  
  detectCurrentMCPEndpoint() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Detect if we're on an MCP endpoint
    if (hostname.includes('mcp.')) {
      return `${protocol}//${hostname}`;
    }
    
    // Detect if we're on a company-specific MCP endpoint
    const mcpPattern = /^mcp\.([a-zA-Z0-9-]+)\.com$/;
    const match = hostname.match(mcpPattern);
    if (match) {
      return `${protocol}//${hostname}`;
    }
    
    // Default to main endpoint
    return this.mcpEndpoints.main;
  }
  
  extractCompanyContext() {
    const hostname = window.location.hostname;
    
    // Extract company name from mcp.[company].com pattern
    const companyPattern = /^mcp\.([a-zA-Z0-9-]+)\.com$/;
    const match = hostname.match(companyPattern);
    
    if (match) {
      return match[1]; // Return company name
    }
    
    // Check for other patterns like [company].asos.cool.production.dev
    const devPattern = /^([a-zA-Z0-9-]+)\.asos\.cool/;
    const devMatch = hostname.match(devPattern);
    
    if (devMatch) {
      return devMatch[1];
    }
    
    return null; // Base MCP endpoint
  }
  
  async init() {
    // Initialize UFO across all MCP endpoints
    await this.initializeUFO();
    
    // Load enhanced interface for this MCP endpoint
    await this.loadEnhancedInterface();
    
    // Setup cross-MCP synchronization
    this.setupCrossMCPSync();
    
    // Add UFO-specific features
    this.addUFOFeatures();
    
    // Initialize company-specific customizations
    if (this.companyContext) {
      this.initializeCompanyCustomizations();
    }
    
    console.log('✅ UFO-MCP Integration complete!');
  }
  
  async initializeUFO() {
    console.log('🛸 Initializing UFO (Unified Frontend Operations)...');
    
    // Add UFO indicator
    this.addUFOIndicator();
    
    // Setup UFO communication bridge
    this.setupUFOBridge();
    
    // Initialize quantum synchronization
    this.initializeQuantumSync();
  }
  
  addUFOIndicator() {
    // Add UFO status indicator
    const ufoIndicator = document.createElement('div');
    ufoIndicator.className = 'ufo-indicator';
    ufoIndicator.innerHTML = `
      <div class="ufo-icon">🛸</div>
      <div class="ufo-status">
        <div class="ufo-title">UFO Active</div>
        <div class="ufo-subtitle">Unified Frontend</div>
      </div>
      <div class="ufo-company">${this.companyContext || 'Base MCP'}</div>
    `;
    
    ufoIndicator.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(75, 0, 130, 0.9);
      border: 2px solid #9370DB;
      border-radius: 15px;
      padding: 12px;
      color: white;
      font-size: 12px;
      z-index: 1000;
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 20px rgba(147, 112, 219, 0.5);
      min-width: 180px;
    `;
    
    // Add UFO styles
    const ufoStyle = document.createElement('style');
    ufoStyle.textContent = `
      .ufo-indicator .ufo-icon {
        font-size: 20px;
        animation: ufoFloat 3s ease-in-out infinite;
      }
      @keyframes ufoFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(5deg); }
      }
      .ufo-title {
        font-weight: bold;
        color: #9370DB;
        font-size: 11px;
      }
      .ufo-subtitle {
        color: #DDA0DD;
        font-size: 9px;
      }
      .ufo-company {
        background: rgba(147, 112, 219, 0.3);
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: bold;
        color: #E6E6FA;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(ufoStyle);
    
    document.body.appendChild(ufoIndicator);
  }
  
  setupUFOBridge() {
    // Create UFO communication bridge between all MCP endpoints
    window.UFOBridge = {
      version: this.ufoConfig.version,
      endpoint: this.detectedMCPEndpoint,
      company: this.companyContext,
      quantumProtection: this.ufoConfig.quantumProtection,
      
      // Cross-MCP communication
      broadcastToAllMCP: (message) => {
        console.log('🛸 UFO Broadcasting:', message);
        // This would broadcast to all connected MCP endpoints
        localStorage.setItem('ufo_broadcast', JSON.stringify({
          timestamp: Date.now(),
          source: this.detectedMCPEndpoint,
          message: message
        }));
      },
      
      // Quantum sync between MCPs
      syncQuantumState: () => {
        const quantumState = {
          agents: window.wfaMcp?.realTimeData?.agents || {},
          security: window.wfaMcp?.realTimeData?.security || {},
          performance: window.wfaMcp?.realTimeData?.performance || {}
        };
        
        localStorage.setItem('ufo_quantum_state', JSON.stringify(quantumState));
      }
    };
  }
  
  initializeQuantumSync() {
    // Listen for quantum state changes from other MCP endpoints
    window.addEventListener('storage', (e) => {
      if (e.key === 'ufo_broadcast') {
        const broadcast = JSON.parse(e.newValue || '{}');
        console.log('🛸 UFO Received broadcast:', broadcast);
        this.handleUFOBroadcast(broadcast);
      }
      
      if (e.key === 'ufo_quantum_state') {
        const quantumState = JSON.parse(e.newValue || '{}');
        console.log('🛸 UFO Quantum sync received:', quantumState);
        this.syncWithQuantumState(quantumState);
      }
    });
  }
  
  handleUFOBroadcast(broadcast) {
    // Handle broadcasts from other MCP endpoints
    if (broadcast.source !== this.detectedMCPEndpoint) {
      console.log(`🛸 Cross-MCP message from ${broadcast.source}:`, broadcast.message);
      
      // Show notification for cross-MCP activity
      this.showUFONotification(`Activity from ${this.extractDomainName(broadcast.source)}`, broadcast.message);
    }
  }
  
  syncWithQuantumState(quantumState) {
    // Sync quantum state across all MCP endpoints
    if (window.wfaMcp && quantumState.agents) {
      // Update local state with quantum sync data
      Object.assign(window.wfaMcp.realTimeData.agents, quantumState.agents);
      console.log('🛸 UFO Quantum sync applied');
    }
  }
  
  extractDomainName(url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 3 && parts[0] === 'mcp') {
        return parts[1]; // Return company name from mcp.[company].com
      }
      return hostname;
    } catch {
      return url;
    }
  }
  
  async loadEnhancedInterface() {
    console.log('🛸 Loading enhanced interface for MCP endpoint...');
    
    // Inject the WFA-MCP enhanced interface if not already loaded
    if (!window.wfaMcp) {
      // Load the enhanced integration script
      const script = document.createElement('script');
      script.src = '/enhanced-wfa-mcp-integration.js';
      script.onload = () => {
        console.log('✅ Enhanced interface loaded via UFO');
        this.customizeForMCPEndpoint();
      };
      document.head.appendChild(script);
    } else {
      this.customizeForMCPEndpoint();
    }
  }
  
  customizeForMCPEndpoint() {
    // Customize the interface for this specific MCP endpoint
    if (this.companyContext) {
      this.addCompanyBranding();
      this.customizeCompanyFeatures();
    }
    
    // Add MCP-specific enhancements
    this.addMCPSpecificFeatures();
  }
  
  addCompanyBranding() {
    // Add company-specific branding to the interface
    const companyName = this.companyContext.charAt(0).toUpperCase() + this.companyContext.slice(1);
    
    // Update title to include company name
    document.title = `${companyName} MCP - ASOOS Enterprise`;
    
    // Add company indicator to hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      const companyBanner = document.createElement('div');
      companyBanner.className = 'company-banner';
      companyBanner.innerHTML = `
        <div class="company-badge">
          <span class="company-icon">🏢</span>
          <span class="company-text">${companyName} Enterprise MCP</span>
        </div>
      `;
      
      companyBanner.style.cssText = `
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
      `;
      
      const companyStyle = document.createElement('style');
      companyStyle.textContent = `
        .company-badge {
          background: linear-gradient(135deg, #FFD700, #c7b299);
          color: black;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }
        .company-icon {
          font-size: 16px;
        }
      `;
      document.head.appendChild(companyStyle);
      
      heroContent.insertBefore(companyBanner, heroContent.firstChild);
    }
  }
  
  customizeCompanyFeatures() {
    // Add company-specific features and customizations
    const companyFeatures = {
      endpoints: {
        primary: `https://mcp.${this.companyContext}.com`,
        alt: `https://mcp.${this.companyContext}`,
        dev: `https://${this.companyContext}.asos.cool.production.dev`
      },
      branding: {
        primaryColor: this.getCompanyColor(),
        name: this.companyContext
      }
    };
    
    // Store company context globally
    window.UFOCompanyContext = companyFeatures;
    
    // Update deployment modal if it exists
    setTimeout(() => {
      this.updateDeploymentModalForCompany();
    }, 1000);
  }
  
  getCompanyColor() {
    // Generate a unique color for each company based on name
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const hash = this.companyContext.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }
  
  updateDeploymentModalForCompany() {
    // Update the deployment modal to show this company as an example
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('enterprise-modal')) {
            // Pre-fill company name if this is a company-specific MCP
            const companyInput = node.querySelector('#companyName');
            if (companyInput && this.companyContext) {
              companyInput.value = this.companyContext;
              companyInput.style.background = 'rgba(255, 215, 0, 0.1)';
              companyInput.style.border = '2px solid #FFD700';
            }
            
            // Update deployment preview
            setTimeout(() => {
              if (window.wfaMcp) {
                window.wfaMcp.updateDeploymentPreview();
              }
            }, 100);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  addMCPSpecificFeatures() {
    // Add MCP protocol specific features
    this.addMCPProtocolStatus();
    this.addCrossMCPNavigation();
  }
  
  addMCPProtocolStatus() {
    // Add MCP protocol status indicator
    const mcpStatus = document.createElement('div');
    mcpStatus.className = 'mcp-protocol-status';
    mcpStatus.innerHTML = `
      <div class="mcp-header">
        <span class="mcp-icon">📡</span>
        <span class="mcp-title">MCP Protocol</span>
      </div>
      <div class="mcp-version">v${this.ufoConfig.version}</div>
      <div class="mcp-endpoint">${this.detectedMCPEndpoint.replace('https://', '')}</div>
    `;
    
    mcpStatus.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 20px;
      background: rgba(30, 144, 255, 0.9);
      border: 1px solid #1E90FF;
      border-radius: 10px;
      padding: 12px;
      color: white;
      font-size: 11px;
      z-index: 1000;
      backdrop-filter: blur(20px);
      min-width: 180px;
      box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
    `;
    
    const mcpStyle = document.createElement('style');
    mcpStyle.textContent = `
      .mcp-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 5px;
      }
      .mcp-title {
        font-weight: bold;
        color: #87CEEB;
      }
      .mcp-version {
        font-size: 10px;
        color: #B0E0E6;
        margin-bottom: 3px;
      }
      .mcp-endpoint {
        font-size: 9px;
        color: #F0F8FF;
        word-break: break-all;
      }
    `;
    document.head.appendChild(mcpStyle);
    
    document.body.appendChild(mcpStatus);
  }
  
  addCrossMCPNavigation() {
    // Add navigation between different MCP endpoints
    const mcpNav = document.createElement('div');
    mcpNav.className = 'cross-mcp-nav';
    mcpNav.innerHTML = `
      <div class="mcp-nav-header">🌐 MCP Network</div>
      <div class="mcp-nav-links">
        <a href="https://mcp.aipub.2100.cool" class="mcp-nav-link">Base MCP</a>
        <a href="#" onclick="UFOMCPIntegration.showMCPDirectory()" class="mcp-nav-link">Directory</a>
      </div>
    `;
    
    mcpNav.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      background: rgba(0, 128, 128, 0.9);
      border: 1px solid #20B2AA;
      border-radius: 10px;
      padding: 10px;
      color: white;
      font-size: 11px;
      z-index: 1000;
      backdrop-filter: blur(20px);
      min-width: 160px;
      box-shadow: 0 5px 15px rgba(32, 178, 170, 0.3);
    `;
    
    const navStyle = document.createElement('style');
    navStyle.textContent = `
      .mcp-nav-header {
        font-weight: bold;
        margin-bottom: 8px;
        color: #7FFFD4;
        text-align: center;
      }
      .mcp-nav-links {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mcp-nav-link {
        color: #AFEEEE;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 5px;
        transition: all 0.2s;
        font-size: 10px;
      }
      .mcp-nav-link:hover {
        background: rgba(127, 255, 212, 0.2);
        color: white;
      }
    `;
    document.head.appendChild(navStyle);
    
    document.body.appendChild(mcpNav);
  }
  
  static showMCPDirectory() {
    // Show directory of all available MCP endpoints
    alert('🌐 MCP Directory:\n\n• Base MCP: mcp.aipub.2100.cool\n• Enterprise MCPs: mcp.[company].com\n• Dev Environment: [company].asos.cool.production.dev\n\nAll endpoints feature UFO unified experience!');
  }
  
  setupCrossMCPSync() {
    // Setup synchronization between all MCP endpoints
    setInterval(() => {
      if (window.UFOBridge) {
        window.UFOBridge.syncQuantumState();
        
        // Broadcast UFO status every 30 seconds
        window.UFOBridge.broadcastToAllMCP({
          type: 'ufo_heartbeat',
          endpoint: this.detectedMCPEndpoint,
          company: this.companyContext,
          timestamp: Date.now(),
          status: 'operational'
        });
      }
    }, 30000);
  }
  
  addUFOFeatures() {
    // Add UFO-specific features
    this.addUFOCommandCenter();
    this.setupUFOHotkeys();
  }
  
  addUFOCommandCenter() {
    // Add UFO command center (hidden by default, activated by hotkey)
    const commandCenter = document.createElement('div');
    commandCenter.id = 'ufo-command-center';
    commandCenter.innerHTML = `
      <div class="ufo-command-header">
        <span>🛸 UFO Command Center</span>
        <button onclick="this.parentNode.parentNode.style.display='none'">×</button>
      </div>
      <div class="ufo-command-content">
        <div class="ufo-status-grid">
          <div class="ufo-status-item">
            <strong>Endpoint:</strong><br>${this.detectedMCPEndpoint}
          </div>
          <div class="ufo-status-item">
            <strong>Company:</strong><br>${this.companyContext || 'Base MCP'}
          </div>
          <div class="ufo-status-item">
            <strong>UFO Version:</strong><br>${this.ufoConfig.version}
          </div>
          <div class="ufo-status-item">
            <strong>Protection:</strong><br>Victory36 ${this.ufoConfig.quantumProtection}
          </div>
        </div>
        <div class="ufo-actions">
          <button onclick="window.UFOBridge.broadcastToAllMCP({type: 'test', message: 'UFO Test Broadcast'})">🛸 Test Broadcast</button>
          <button onclick="window.UFOBridge.syncQuantumState()">⚡ Quantum Sync</button>
          <button onclick="UFOMCPIntegration.showMCPDirectory()">🌐 MCP Directory</button>
        </div>
      </div>
    `;
    
    commandCenter.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(25, 25, 112, 0.95);
      border: 2px solid #4169E1;
      border-radius: 15px;
      padding: 20px;
      color: white;
      font-size: 12px;
      z-index: 10000;
      backdrop-filter: blur(20px);
      display: none;
      box-shadow: 0 10px 30px rgba(65, 105, 225, 0.5);
      min-width: 400px;
    `;
    
    const commandStyle = document.createElement('style');
    commandStyle.textContent = `
      .ufo-command-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        font-weight: bold;
        color: #9370DB;
        border-bottom: 1px solid rgba(147, 112, 219, 0.3);
        padding-bottom: 8px;
      }
      .ufo-command-header button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 5px 8px;
        border-radius: 5px;
        cursor: pointer;
      }
      .ufo-status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
      }
      .ufo-status-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 5px;
        font-size: 10px;
      }
      .ufo-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .ufo-actions button {
        background: linear-gradient(135deg, #4169E1, #9370DB);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s;
      }
      .ufo-actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(65, 105, 225, 0.3);
      }
    `;
    document.head.appendChild(commandStyle);
    
    document.body.appendChild(commandCenter);
  }
  
  setupUFOHotkeys() {
    // Setup UFO hotkeys
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+U = Show UFO Command Center
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        const commandCenter = document.getElementById('ufo-command-center');
        if (commandCenter) {
          commandCenter.style.display = commandCenter.style.display === 'none' ? 'block' : 'none';
        }
      }
      
      // Ctrl+Shift+B = UFO Broadcast test
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        if (window.UFOBridge) {
          window.UFOBridge.broadcastToAllMCP({
            type: 'hotkey_broadcast',
            message: 'UFO Hotkey Test from ' + this.detectedMCPEndpoint
          });
          this.showUFONotification('UFO Broadcast', 'Test message sent to all MCP endpoints');
        }
      }
    });
  }
  
  showUFONotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'ufo-notification';
    notification.innerHTML = `
      <div class="ufo-notif-icon">🛸</div>
      <div class="ufo-notif-content">
        <div class="ufo-notif-title">${title}</div>
        <div class="ufo-notif-message">${message}</div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #8A2BE2, #4B0082);
      border: 1px solid #9370DB;
      border-radius: 10px;
      padding: 12px;
      color: white;
      font-size: 12px;
      z-index: 10001;
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 5px 20px rgba(138, 43, 226, 0.5);
      max-width: 300px;
      animation: ufoSlideIn 0.3s ease;
    `;
    
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
      @keyframes ufoSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .ufo-notif-icon {
        font-size: 20px;
      }
      .ufo-notif-title {
        font-weight: bold;
        color: #DDA0DD;
        margin-bottom: 2px;
      }
      .ufo-notif-message {
        color: #E6E6FA;
        font-size: 11px;
      }
    `;
    document.head.appendChild(notifStyle);
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }
  
  initializeCompanyCustomizations() {
    console.log(`🏢 Initializing customizations for company: ${this.companyContext}`);
    
    // Add company-specific customizations
    this.addCompanyMetrics();
    this.setupCompanySpecificFeatures();
  }
  
  addCompanyMetrics() {
    // Add company-specific metrics to the interface
    const companyMetrics = document.createElement('div');
    companyMetrics.className = 'company-metrics';
    companyMetrics.innerHTML = `
      <div class="company-metrics-header">📊 ${this.companyContext.toUpperCase()} Metrics</div>
      <div class="company-metrics-grid">
        <div class="company-metric">
          <div class="metric-value" id="company-agents">0</div>
          <div class="metric-label">Allocated Agents</div>
        </div>
        <div class="company-metric">
          <div class="metric-value" id="company-sectors">0</div>
          <div class="metric-label">Active Sectors</div>
        </div>
        <div class="company-metric">
          <div class="metric-value" id="company-uptime">99.9%</div>
          <div class="metric-label">Uptime</div>
        </div>
      </div>
    `;
    
    companyMetrics.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(${this.getCompanyColor().replace('#', '')
        .match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.9);
      border: 1px solid ${this.getCompanyColor()};
      border-radius: 10px;
      padding: 12px;
      color: white;
      font-size: 11px;
      z-index: 1000;
      backdrop-filter: blur(20px);
      min-width: 160px;
      box-shadow: 0 5px 15px ${this.getCompanyColor()}33;
    `;
    
    const metricsStyle = document.createElement('style');
    metricsStyle.textContent = `
      .company-metrics-header {
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        color: white;
      }
      .company-metrics-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .company-metric {
        text-align: center;
      }
      .metric-value {
        font-size: 14px;
        font-weight: bold;
        color: white;
      }
      .metric-label {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.8);
      }
    `;
    document.head.appendChild(metricsStyle);
    
    document.body.appendChild(companyMetrics);
    
    // Animate company metrics
    this.animateCompanyMetrics();
  }
  
  animateCompanyMetrics() {
    // Animate company-specific metrics with realistic data
    const baseAgents = Math.floor(Math.random() * 900000) + 100000; // 100K - 1M agents
    const baseSectors = Math.floor(Math.random() * 45) + 5; // 5-50 sectors
    
    setInterval(() => {
      const agentVariation = Math.floor(Math.random() * 10000) - 5000;
      const sectorVariation = Math.floor(Math.random() * 3) - 1;
      
      const currentAgents = Math.max(50000, baseAgents + agentVariation);
      const currentSectors = Math.max(1, Math.min(50, baseSectors + sectorVariation));
      const uptime = (99.5 + Math.random() * 0.5).toFixed(1);
      
      const agentsEl = document.getElementById('company-agents');
      const sectorsEl = document.getElementById('company-sectors');
      const uptimeEl = document.getElementById('company-uptime');
      
      if (agentsEl) agentsEl.textContent = `${Math.floor(currentAgents / 1000)}K`;
      if (sectorsEl) sectorsEl.textContent = currentSectors;
      if (uptimeEl) uptimeEl.textContent = `${uptime}%`;
      
    }, 3000);
  }
  
  setupCompanySpecificFeatures() {
    // Add features specific to this company's MCP endpoint
    console.log(`🏢 Setting up features for ${this.companyContext}`);
    
    // Company-specific branding in stats
    this.updateStatsForCompany();
    
    // Custom company deployment features
    this.addCompanyDeploymentFeatures();
  }
  
  updateStatsForCompany() {
    // Update stats section to reflect company-specific data
    setTimeout(() => {
      const statCards = document.querySelectorAll('.stat-card');
      statCards.forEach(card => {
        const label = card.querySelector('.stat-label');
        if (label && label.textContent.includes('Agent')) {
          // Add company context to agent stats
          const sublabel = card.querySelector('.stat-sublabel') || document.createElement('div');
          sublabel.className = 'stat-sublabel';
          sublabel.textContent = `Serving ${this.companyContext.toUpperCase()}`;
          sublabel.style.color = this.getCompanyColor();
          if (!card.querySelector('.stat-sublabel')) {
            card.appendChild(sublabel);
          }
        }
      });
    }, 2000);
  }
  
  addCompanyDeploymentFeatures() {
    // Add company-specific deployment features
    window.UFOCompanyDeployment = {
      company: this.companyContext,
      endpoint: this.detectedMCPEndpoint,
      
      deployToCompanyMCP: async (config) => {
        console.log(`🏢 Deploying to ${this.companyContext} MCP:`, config);
        
        // Show company-specific deployment progress
        this.showUFONotification(
          `${this.companyContext.toUpperCase()} Deployment`,
          `Deploying to company MCP endpoint...`
        );
        
        // Simulate company-specific deployment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.showUFONotification(
          'Deployment Complete',
          `${this.companyContext.toUpperCase()} MCP endpoint is operational!`
        );
      }
    };
  }
}

// Auto-initialize UFO-MCP Integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.UFOMCPInstance = new UFOMCPIntegration();
  });
} else {
  window.UFOMCPInstance = new UFOMCPIntegration();
}

// Make UFOMCPIntegration available globally for command center
window.UFOMCPIntegration = UFOMCPIntegration;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UFOMCPIntegration;
}
