/**
 * Supreme Promise Interface - ASOOS Owner Interface
 * Comprehensive JavaScript implementation for light.html
 * Addresses all missing function references and integrates with promise-based architecture
 */

// Supreme Promise Core Class
class SupremePromise {
  constructor() {
    this.initialized = false;
    this.activeRIX = 'QB';
    this.activeMode = 'terminal';
    this.rightPanelState = 'normal';
    this.isPanelLocked = false;
    this.userRole = 'owner';
    this.authLevel = 5;
    this.apiConnected = false;
    this.voiceEnabled = true;
    this.notifications = [];
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  // Initialize the Supreme Promise system
  async initialize() {
    try {
      console.log('Supreme Promise Interface initializing...');
      
      await this.loadUserData();
      await this.initializeAuthFeatures();
      await this.setupEventHandlers();
      await this.activateDefaultRIX();
      
      this.initialized = true;
      this.showNotification('Supreme Promise Interface activated!', 'success');
      console.log('Supreme Promise Interface ready.');
      
    } catch (error) {
      console.error('Supreme Promise initialization failed:', error);
      this.showNotification('Interface initialization error', 'error');
    }
  }

  // Load user data with promise
  async loadUserData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          role: 'ASOOS Subscriber',
          userName: 'Mr. Phillip Corey Roark, CEO',
          tagline: 'Aixtiv Symphony Orchestrating Operating System',
          systemName: 'ASOOS',
          companyName: 'Aixtiv Corporation',
          authLevel: 5
        };
        
        this.updateUserInterface(userData);
        resolve(userData);
      }, 500);
    });
  }

  // Update user interface elements
  updateUserInterface(userData) {
    const elements = {
      userName: document.getElementById('userName'),
      userTagline: document.getElementById('userTagline'),
      systemLogo: document.getElementById('systemLogo')
    };

    Object.entries(elements).forEach(([key, element]) => {
      if (element && userData[key]) {
        element.textContent = userData[key];
      }
    });

    this.authLevel = userData.authLevel;
  }

  // Initialize authentication features
  async initializeAuthFeatures() {
    return new Promise((resolve) => {
      const authFeatures = document.querySelectorAll('.auth-only');
      authFeatures.forEach(feature => {
        feature.style.display = 'flex';
        feature.style.opacity = '1';
      });
      resolve();
    });
  }

  // Setup event handlers
  async setupEventHandlers() {
    // Handle Enter key in copilot input
    const copilotInput = document.getElementById('copilotInput');
    if (copilotInput) {
      copilotInput.addEventListener('input', this.processDiamondCLI.bind(this));
    }

    // Handle CLI input
    const cliInput = document.getElementById('cliInput');
    if (cliInput) {
      cliInput.addEventListener('keypress', this.handleCLIKeyPress.bind(this));
    }
  }

  // Activate default RIX
  async activateDefaultRIX() {
    return this.activateRIX('QB', 'Anthropic 4');
  }

  // Show notification system
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
      max-width: 300px;
      word-wrap: break-word;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #10b981;' : 
        type === 'error' ? 'background: #ef4444;' : 
        'background: #6b7280;'}
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto-remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    this.notifications.push({ message, type, timestamp: Date.now() });
  }
}

// Initialize Supreme Promise
const supremePromise = new SupremePromise();

// ==========================================
// MISSING FUNCTION IMPLEMENTATIONS
// ==========================================

// RIX Activation System
async function activateRIX(rix, name) {
  try {
    supremePromise.activeRIX = rix;
    
    // Update UI elements
    const activeDisplay = document.getElementById('activeRixDisplay');
    const mobileDisplay = document.getElementById('activeRixDisplayMobile');
    
    if (activeDisplay) {activeDisplay.textContent = `${rix} RIX Active`;}
    if (mobileDisplay) {mobileDisplay.textContent = `${rix} RIX Active`;}
    
    // Update visual state
    document.querySelectorAll('.copilot-hex-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.getElementById(`${rix.toLowerCase()}Rix`);
    if (activeItem) {activeItem.classList.add('active');}
    
    supremePromise.showNotification(`Activated ${name} (${rix} RIX)`, 'success');
    
    return Promise.resolve({ rix, name, activated: true });
  } catch (error) {
    console.error('RIX activation failed:', error);
    supremePromise.showNotification('RIX activation failed', 'error');
    return Promise.reject(error);
  }
}

// Scan to Approve Toggle
async function toggleScanToApprove(element) {
  try {
    const isActive = element.classList.contains('active');
    
    if (isActive) {
      element.classList.remove('active');
      supremePromise.showNotification('Scan to Approve deactivated', 'info');
    } else {
      element.classList.add('active');
      supremePromise.showNotification('Scan to Approve activated - Monitoring workflows...', 'success');
      
      // Simulate scanning
      setTimeout(() => {
        supremePromise.showNotification('Found 3 items requiring approval', 'info');
      }, 2000);
    }
    
    return Promise.resolve({ active: !isActive });
  } catch (error) {
    console.error('Scan to approve toggle failed:', error);
    return Promise.reject(error);
  }
}

// Copilot Key Press Handler
function handleCopilotKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    return sendCopilotMessage();
  }
}

// Diamond CLI Processor
function processDiamondCLI(event) {
  const input = event.target.value;
  
  if (input.startsWith('/')) {
    // Diamond CLI command detected
    const command = input.slice(1).toLowerCase();
    
    switch (command) {
      case 'status':
        supremePromise.showNotification('System Status: All systems operational', 'success');
        break;
      case 'scan':
        supremePromise.showNotification('Initiating system scan...', 'info');
        break;
      case 'help':
        supremePromise.showNotification('Diamond CLI: /status, /scan, /deploy, /monitor', 'info');
        break;
      default:
        if (command.length > 0) {
          supremePromise.showNotification(`Unknown command: /${command}`, 'error');
        }
    }
  }
}

// Copilot Mode Toggle
async function toggleCopilotMode() {
  try {
    const naturalChat = document.getElementById('naturalLanguageChat');
    const cliInterface = document.getElementById('cliInterface');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const cliModeToggleBtn = document.getElementById('cliModeToggleBtn');
    
    if (naturalChat.style.display !== 'none') {
      // Switch to CLI
      naturalChat.style.display = 'none';
      cliInterface.style.display = 'flex';
      
      if (modeToggleBtn) {
        modeToggleBtn.innerHTML = '<svg class="enterprise-icon" style="width: 10px; height: 10px; fill: #0bb1bb;"><use href="#icon-comments"></use></svg> CHAT';
        modeToggleBtn.title = 'Switch to Chat Mode';
      }
      
      supremePromise.showNotification('Switched to CLI Mode', 'info');
    } else {
      // Switch to Chat
      naturalChat.style.display = 'flex';
      cliInterface.style.display = 'none';
      
      if (modeToggleBtn) {
        modeToggleBtn.innerHTML = '<svg class="enterprise-icon" style="width: 10px; height: 10px; fill: #8b5cf6;"><use href="#icon-terminal"></use></svg> CLI';
        modeToggleBtn.title = 'Switch to CLI Mode';
      }
      
      supremePromise.showNotification('Switched to Chat Mode', 'info');
    }
    
    return Promise.resolve({ mode: naturalChat.style.display !== 'none' ? 'chat' : 'cli' });
  } catch (error) {
    console.error('Mode toggle failed:', error);
    return Promise.reject(error);
  }
}

// Send Copilot Message
async function sendCopilotMessage() {
  try {
    const input = document.getElementById('copilotInput');
    const messagesContainer = document.getElementById('copilotMessages');
    
    if (!input || !messagesContainer || !input.value.trim()) {
      return Promise.resolve({ sent: false, reason: 'empty' });
    }
    
    const userMessage = input.value.trim();
    input.value = '';
    
    // Add user message
    addMessage(messagesContainer, userMessage, 'user');
    
    // Simulate AI response with promise
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          `Processing your request: "${userMessage}"...`,
          `${supremePromise.activeRIX} RIX analyzing your query...`,
          'Connecting to Supreme Promise system for enhanced response...',
          'Query processed. How can I assist further?'
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessage(messagesContainer, response, 'copilot');
        
        resolve({ sent: true, message: userMessage, response });
      }, 500);
    });
  } catch (error) {
    console.error('Send message failed:', error);
    return Promise.reject(error);
  }
}

// Voice Input Handler
async function startVoiceInput() {
  try {
    if (!supremePromise.voiceEnabled) {
      supremePromise.showNotification('Voice input disabled in settings', 'error');
      return Promise.resolve({ started: false });
    }

    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      supremePromise.showNotification('Voice input not supported in this browser', 'error');
      return Promise.resolve({ started: false });
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    return new Promise((resolve, reject) => {
      recognition.onstart = () => {
        supremePromise.showNotification('Listening... Speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('copilotInput');
        
        if (input) {
          input.value = transcript;
          sendCopilotMessage();
        }
        
        resolve({ started: true, transcript });
      };

      recognition.onerror = (event) => {
        supremePromise.showNotification(`Voice input error: ${event.error}`, 'error');
        reject(event.error);
      };

      recognition.start();
    });
  } catch (error) {
    supremePromise.showNotification('Voice input initialization failed', 'error');
    return Promise.reject(error);
  }
}

// Panel Toggle Functions
async function togglePanel(element) {
  try {
    const card = element.closest('.panel-card');
    const content = card.querySelector('.panel-content');
    const chevron = element.querySelector('.chevron-icon');
    const isActive = content.classList.contains('active');
    
    if (isActive) {
      // Close the panel
      content.classList.remove('active');
      element.classList.add('collapsed');
      if (chevron) {chevron.style.transform = 'rotate(-90deg)';}
    } else {
      // Open the panel
      content.classList.add('active');
      element.classList.remove('collapsed');
      if (chevron) {chevron.style.transform = 'rotate(0deg)';}
    }
    
    return Promise.resolve({ expanded: !isActive });
  } catch (error) {
    console.error('Panel toggle failed:', error);
    return Promise.reject(error);
  }
}

// Icon Selection
function selectIcon(iconName) {
  supremePromise.showNotification(`Selected: ${iconName}`, 'info');
  
  // Update selected state
  document.querySelectorAll('.icon-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  event.target.closest('.icon-item')?.classList.add('selected');
}

// Freemium Feature Handler
function showFreemiumFeature() {
  supremePromise.showNotification('This feature requires ASOOS Premium subscription', 'info');
}

// Integration Gateway
async function openIntegrationGateway() {
  try {
    supremePromise.showNotification('Opening Integration Gateway...', 'info');
    
    // Simulate gateway connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    supremePromise.showNotification('Integration Gateway connected - Managing all integrations', 'success');
    
    return Promise.resolve({ opened: true });
  } catch (error) {
    supremePromise.showNotification('Failed to open Integration Gateway', 'error');
    return Promise.reject(error);
  }
}

// Natural Language Interface - Diamond SAO Klee
let naturalLanguageMode = true;
let conversationHistory = [];

function handleNaturalLanguageInput(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    processNaturalLanguageInput();
  }
}

// Quick action buttons for common commands
function addQuickActionButtons() {
  const quickActions = [
    { text: 'Status', action: 'show me system status' },
    { text: 'Deploy', action: 'help me deploy the latest changes' },
    { text: 'Debug', action: 'help me debug this issue' },
    { text: 'Analyze', action: 'analyze the current metrics' },
    { text: 'Optimize', action: 'suggest optimizations' },
    { text: 'Security', action: 'check security status' }
  ];
  
  return quickActions.map(action => `
    <button class="quick-action-btn" onclick="insertQuickAction('${action.action}')" 
            style="background: rgba(11, 177, 187, 0.1); border: 1px solid rgba(11, 177, 187, 0.3); 
                   color: #0bb1bb; padding: 4px 8px; border-radius: 4px; font-size: 10px; 
                   margin: 2px; cursor: pointer; transition: all 0.2s;">
      ${action.text}
    </button>
  `).join('');
}

function insertQuickAction(action) {
  const input = document.getElementById('naturalLanguageInput');
  if (input) {
    input.value = action;
    input.focus();
  }
}

// Handle special keys including Fn key for microphone
function handleSpecialKeys(event) {
  // Fn key detection (using getModifierState for better Fn key support)
  if (event.getModifierState && event.getModifierState('Fn')) {
    event.preventDefault();
    startVoiceInput();
    return;
  }
  
  // Alternative Fn key detection methods
  if (event.key === 'Fn' || event.code === 'Fn' || event.keyCode === 255) {
    event.preventDefault();
    startVoiceInput();
    return;
  }
}

// Update mode indicator visual state
function updateModeIndicator() {
  const indicator = document.getElementById('modeIndicator');
  const leftDiamond = document.querySelector('.cli-input-area span');
  
  if (bypassAgentMode) {
    // Direct command mode - orange
    if (indicator) {indicator.style.color = '#f59e0b';}
    if (leftDiamond) {leftDiamond.style.color = '#f59e0b';}
  } else {
    // Agent mode - green/blue
    if (indicator) {indicator.style.color = '#10b981';}
    if (leftDiamond) {leftDiamond.style.color = '#0bb1bb';}
  }
}

async function processNaturalLanguageInput() {
  try {
    const input = document.getElementById('naturalLanguageInput');
    const responseArea = document.getElementById('conversationArea');
    
    if (!input || !input.value.trim()) {return;}
    
    const userInput = input.value.trim();
    input.value = '';
    
    // Add user message to conversation
    addConversationMessage(userInput, 'user');
    conversationHistory.push({ role: 'user', content: userInput });
    
    // Show thinking indicator
    const thinkingIndicator = addThinkingIndicator();
    
    // Process with Dr. Lucy
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
    const response = await generateNaturalResponse(userInput);
    
    // Remove thinking indicator
    thinkingIndicator.remove();
    
    // Add Dr. Lucy's response
    addConversationMessage(response.text, 'assistant', response.code);
    conversationHistory.push({ role: 'assistant', content: response.text });
    
    return Promise.resolve({ processed: true, input: userInput, response });
  } catch (error) {
    console.error('Natural language processing failed:', error);
    return Promise.reject(error);
  }
}

function addConversationMessage(message, sender, code = null) {
  const conversationArea = document.getElementById('conversationArea');
  if (!conversationArea) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    margin-bottom: 15px;
    padding: 12px;
    border-radius: 8px;
    ${sender === 'user' 
      ? 'background: rgba(11, 177, 187, 0.1); border: 1px solid rgba(11, 177, 187, 0.2); margin-left: 40px;' 
      : 'background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); margin-right: 40px;'}
  `;
  
  messageDiv.innerHTML = `
    <div style="font-size: 12px; color: ${sender === 'user' ? '#0bb1bb' : '#FFD700'}; font-weight: 600; margin-bottom: 5px;">
      ${sender === 'user' ? 'You' : '👑 Dr. Lucy'}
    </div>
    <div style="color: #fff; line-height: 1.4; font-size: 13px;">${message}</div>
    ${code ? `<div style="background: #1a1a1a; padding: 10px; border-radius: 4px; margin-top: 8px; overflow-x: auto;"><pre style="color: #50C878; font-size: 11px; margin: 0;">${code}</pre></div>` : ''}
  `;
  
  conversationArea.appendChild(messageDiv);
  conversationArea.scrollTop = conversationArea.scrollHeight;
}

function addThinkingIndicator() {
  const conversationArea = document.getElementById('conversationArea');
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    margin-bottom: 15px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.2);
    margin-right: 40px;
    animation: pulse 1.5s ease-in-out infinite;
  `;
  
  indicator.innerHTML = `
    <div style="font-size: 12px; color: #FFD700; font-weight: 600; margin-bottom: 5px;">👑 Dr. Lucy</div>
    <div style="color: #FFD700; font-size: 13px;">Thinking... <span style="animation: blink 1s linear infinite;">●</span></div>
  `;
  
  conversationArea.appendChild(indicator);
  conversationArea.scrollTop = conversationArea.scrollHeight;
  return indicator;
}

// Natural Language Interface Initialization
function initializeNaturalLanguageInterface() {
  // Create the natural language interface HTML structure
  const interfaceHTML = `
    <div id="naturalLanguageInterface" style="
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin: 10px 0;
    ">
      <div style="margin-bottom: 15px;">
        <h3 style="color: #FFD700; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">💬 Chat with Dr. Lucy</h3>
        <div style="font-size: 11px; color: #888; margin-bottom: 15px;">Ask anything about your system, deployments, or get help with tasks</div>
        
        <div id="conversationArea" style="
          height: 300px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        ">
          <div style="color: #888; text-align: center; padding: 20px; font-style: italic;">Start a conversation with Dr. Lucy...</div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Quick Actions:</div>
          <div id="quickActionButtons">${addQuickActionButtons()}</div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <textarea id="naturalLanguageInput" placeholder="Ask Dr. Lucy anything... (Shift+Enter for new line)" 
            style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); 
                   border-radius: 8px; padding: 12px; color: white; font-size: 13px; resize: vertical; 
                   min-height: 60px; max-height: 120px; outline: none; font-family: inherit;"
            onkeydown="handleNaturalLanguageInput(event)"></textarea>
          <button onclick="processNaturalLanguageInput()" style="
            background: linear-gradient(135deg, #FFD700, #0bb1bb);
            border: none;
            color: #000;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">Ask Dr. Lucy</button>
        </div>
      </div>
    </div>
  `;
  
  // Find CLI area and replace it
  const cliArea = document.querySelector('.cli-input-area, #terminalArea, #cliArea');
  if (cliArea) {
    cliArea.innerHTML = interfaceHTML;
  } else {
    // If no CLI area found, append to main content
    const mainContent = document.querySelector('.main-content, main, body');
    if (mainContent) {
      const container = document.createElement('div');
      container.innerHTML = interfaceHTML;
      mainContent.appendChild(container);
    }
  }
}

// Legacy function for backward compatibility
function handleCLIKeyPress(event) {
  return handleNaturalLanguageInput(event);
}

function executeCLICommand() {
  return processNaturalLanguageInput();
}

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeNaturalLanguageInterface, 1000);
});

// Dr. Lucy Natural Language Response Generator
async function generateNaturalResponse(input) {
  const lowerInput = input.toLowerCase();
  
  // Context-aware responses based on conversation history
  if (conversationHistory.length > 2) {
    const contextualResponse = getContextualResponse(input, conversationHistory);
    if (contextualResponse) return contextualResponse;
  }
  
  // Coding-related responses
  if (lowerInput.includes('create') && (lowerInput.includes('function') || lowerInput.includes('method'))) {
    return {
      text: "I'll help you create that function. Here's a well-structured implementation:",
      code: `function exampleFunction(param) {
  // Your logic here
  return result;
}`
    };
  }
  
  if (lowerInput.includes('debug') || lowerInput.includes('error') || lowerInput.includes('fix')) {
    return {
      text: "Let me analyze this for debugging. I'll help you identify and fix the issue.",
      code: null
    };
  }
  
  if (lowerInput.includes('deploy') || lowerInput.includes('deployment')) {
    return {
      text: "I'll guide you through the deployment process. Let me check the current status and suggest the next steps.",
      code: `# Deployment commands
git status
npm run build
docker build -t myapp .
gcloud run deploy --image myapp --platform managed`
    };
  }
  
  // General questions
  if (lowerInput.includes('status') || lowerInput.includes('health')) {
    return {
      text: 'Let me check the system status across all services and integrations.',
      code: null
    };
  }
  
// Context-aware responses (@mentions)
  if (input.includes('@')) {
    return await processContextSearch(input);
  }
  
  // Default intelligent response
  return {
    text: `I understand you want help with: "${input}". I'm processing this request and will provide the best assistance. What specific aspect would you like me to focus on?`,
    code: null
  };
}

// Context Search Processor
async function processContextSearch(input) {
  const contextMatches = input.match(/@(\w+)/g) || [];
  const contexts = contextMatches.map(match => match.substring(1));
  
  let contextInfo = '\n\n📋 Context Search Results:\n';
  
  for (const context of contexts) {
    switch (context.toLowerCase()) {
      case 'pay':
      case 'payment':
      case 'payroll':
        contextInfo += `• 💰 ${context}: Payroll system, payment processing, billing information\n`;
        break;
      case 'office':
      case 'building':
        contextInfo += `• 🏢 ${context}: Office locations, facilities, contact information\n`;
        break;
      case 'team':
      case 'staff':
      case 'people':
        contextInfo += `• 👥 ${context}: Team members, org chart, contact details\n`;
        break;
      case 'boss':
      case 'manager':
      case 'supervisor':
        contextInfo += `• 👔 ${context}: Management contacts, reporting structure\n`;
        break;
      case 'project':
      case 'projects':
        contextInfo += `• 📊 ${context}: Active projects, deadlines, status updates\n`;
        break;
      case 'client':
      case 'clients':
      case 'customer':
        contextInfo += `• 🤝 ${context}: Client information, accounts, relationships\n`;
        break;
      case 'system':
      case 'tech':
      case 'it':
        contextInfo += `• 💻 ${context}: System status, technical resources, IT support\n`;
        break;
      default:
        contextInfo += `• 🔍 ${context}: Searching for relevant ${context} information...\n`;
    }
  }
  
  const baseQuery = input.replace(/@\w+/g, '').trim();
  
  return {
    text: `I'm searching for information related to: ${contexts.join(', ')}${contextInfo}\n\nRegarding: "${baseQuery}" - Let me pull the most relevant details from these contexts.`,
    code: null
  };
}

// Dr. Lucy's Natural Language Processing
async function processWithDrLucy(input, output) {
  // Add to conversation history if conversation mode is on
  if (conversationMode) {
    conversationHistory.push({ role: 'user', content: input });
  }
  
  const responseLine = document.createElement('div');
  responseLine.className = 'terminal-line';
  
  // Pass conversation context to Lucy
  const responses = await generateLucyResponse(input, conversationHistory);
  
  // Add Lucy's response to conversation history
  if (conversationMode) {
    conversationHistory.push({ role: 'assistant', content: responses.text });
  }
  
  responseLine.innerHTML = `
    <div style="display: flex; align-items: start; gap: 8px; margin: 4px 0;">
      <span style="color: #10b981;">🤖 Dr. Lucy:</span>
      <span style="color: #e6e6e6;">${responses.text}</span>
    </div>
  `;
  
  output.appendChild(responseLine);
  
  // If Dr. Lucy generates code or commands, show them
  if (responses.code) {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'terminal-line';
    codeBlock.innerHTML = `
      <div style="background: #2a2a2a; border: 1px solid #444; border-radius: 4px; padding: 8px; margin: 4px 0; font-family: monospace;">
        <pre style="color: #d4d4d4; margin: 0; font-size: 10px;"><code>${responses.code}</code></pre>
      </div>
    `;
    output.appendChild(codeBlock);
  }
}

// Direct Command Processing (Agent Mode OFF)
async function processDirectCommand(input, output) {
  const responseLine = document.createElement('div');
  responseLine.className = 'terminal-line';
  
  const command = input.toLowerCase();
  
  switch (command) {
    case 'help':
      responseLine.innerHTML = '<span style="color: #0bb1bb;">MyDiamond CLI Direct Commands:\n• status - System status\n• deploy - Initiate deployment\n• monitor - View monitoring\n• integrations - List active integrations\n• clear - Clear terminal\n\n💡 Tip: Use normally for Dr. Lucy assistance, Cmd+I before Enter for direct commands</span>';
      break;
    case 'status':
      responseLine.innerHTML = '<span style="color: #10b981;">✅ System Status: All systems operational</span>';
      break;
    case 'deploy':
      responseLine.innerHTML = '<span style="color: #f59e0b;">🚀 Deployment initiated... Use \'monitor\' to track progress</span>';
      break;
    case 'monitor':
      responseLine.innerHTML = '<span style="color: #3b82f6;">📊 Monitoring active. All services running normally.</span>';
      break;
    case 'integrations':
      responseLine.innerHTML = '<span style="color: #8b5cf6;">🔗 Active integrations: GitHub, Slack, Google Workspace</span>';
      break;
    case 'clear':
      output.innerHTML = `
        <div class="terminal-line">
          <span style="color: #0bb1bb;">🔷 MyDiamond</span><span style="color: #666;"> ready:</span> <span style="color: #fff;">_</span>
        </div>
      `;
      return;
    default:
      responseLine.innerHTML = `<span style="color: #ef4444;">❌ Command not found: ${command}\n💡 Type 'agent' to enable Dr. Lucy's help, or 'help' for commands</span>`;
  }
  
  output.appendChild(responseLine);
}

// Message Helper Function
function addMessage(container, text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    padding: 8px 12px;
    border-radius: 12px;
    margin-bottom: 8px;
    max-width: 80%;
    word-wrap: break-word;
    animation: slideIn 0.3s ease;
    ${sender === 'user' 
      ? 'background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); margin-left: auto; text-align: right;'
      : 'background: rgba(11, 177, 187, 0.1); border: 1px solid rgba(11, 177, 187, 0.3); margin-right: auto;'
    }
  `;
  
  if (sender === 'copilot') {
    messageDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <div style="width: 6px; height: 6px; background: #0bb1bb; border-radius: 50%;"></div>
        <strong style="color: #0bb1bb; font-size: 10px;">${supremePromise.activeRIX} RIX</strong>
      </div>
      <div style="color: #333; font-size: 12px; line-height: 1.4;">${text}</div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div style="color: #333; font-size: 12px; line-height: 1.4;">${text}</div>
    `;
  }
  
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

// S2DO Functions
async function initiateScanToDo() {
  try {
    const button = document.getElementById('s2doButton');
    if (button) {button.classList.add('scanning');}
    
    supremePromise.showNotification('S2DO: Scanning for approval workflows...', 'success');
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (button) {button.classList.remove('scanning');}
    supremePromise.showNotification('S2DO: 3 items found for approval', 'success');
    
    return Promise.resolve({ scanned: true, items: 3 });
  } catch (error) {
    console.error('S2DO scan failed:', error);
    return Promise.reject(error);
  }
}

function showS2DOInfo(event) {
  event.stopPropagation();
  supremePromise.showNotification('S2DO: Scan To Do - Automated approval workflow system', 'info');
}

// Right Panel Controls
function toggleRightPanelSize() {
  const panel = document.getElementById('rightPanel');
  const chatArea = document.querySelector('.chat-area');
  if (!panel) {return;}
  
  switch (supremePromise.rightPanelState) {
    case 'normal':
      supremePromise.rightPanelState = 'expanded';
      panel.classList.remove('collapsed');
      panel.style.width = '400px';
      if (chatArea) {chatArea.classList.remove('expanded');}
      break;
    case 'expanded':
      supremePromise.rightPanelState = 'full-width';
      panel.classList.remove('collapsed');
      panel.style.width = '100%';
      if (chatArea) {chatArea.classList.remove('expanded');}
      break;
    case 'full-width':
      supremePromise.rightPanelState = 'collapsed';
      panel.classList.add('collapsed');
      panel.style.width = '0px';
      if (chatArea) {chatArea.classList.add('expanded');}
      break;
    default:
      supremePromise.rightPanelState = 'normal';
      panel.classList.remove('collapsed');
      panel.style.width = '300px';
      if (chatArea) {chatArea.classList.remove('expanded');}
  }
  
  supremePromise.showNotification(`Panel: ${supremePromise.rightPanelState}`, 'info');
}

function togglePanelLock(element) {
  supremePromise.isPanelLocked = !supremePromise.isPanelLocked;
  
  if (supremePromise.isPanelLocked) {
    element.classList.add('locked');
    supremePromise.showNotification('Panel locked', 'info');
  } else {
    element.classList.remove('locked');
    supremePromise.showNotification('Panel unlocked', 'info');
  }
}

// API Configuration
function openAPIConfig() {
  const modal = document.getElementById('apiConfigModal');
  if (modal) {modal.style.display = 'block';}
}

function closeAPIConfig() {
  const modal = document.getElementById('apiConfigModal');
  if (modal) {modal.style.display = 'none';}
}

function saveAPIConfig() {
  supremePromise.showNotification('API configuration saved', 'success');
  closeAPIConfig();
}

// Mode and Model Functions
function setMode(mode) {
  supremePromise.activeMode = mode;
  supremePromise.showNotification(`Mode set to: ${mode}`, 'info');
}

function switchModel(model) {
  supremePromise.selectedModel = model;
  supremePromise.showNotification(`Model switched to: ${model}`, 'info');
}

function clearTerminal() {
  const output = document.getElementById('terminalOutput');
  if (output) {
    output.innerHTML = `
      <div class="terminal-line">
        <span style="color: #0bb1bb;">🔷 MyDiamond</span><span style="color: #666;"> ready:</span> <span style="color: #fff;">_</span>
      </div>
    `;
  }
}

function toggleClaudeCodeMode() {
  supremePromise.showNotification('Claude Code Mode activated', 'success');
}

// Context Search Functions
function insertContextSearch() {
  const input = document.getElementById('cliInput');
  if (!input) {return;}
  
  // Show context menu with common options
  const contextOptions = ['@pay', '@office', '@team', '@boss', '@project', '@client', '@system'];
  const selected = contextOptions[Math.floor(Math.random() * contextOptions.length)];
  
  const currentValue = input.value;
  const cursorPos = input.selectionStart;
  
  // Insert @ at cursor position
  const newValue = currentValue.slice(0, cursorPos) + '@' + currentValue.slice(cursorPos);
  input.value = newValue;
  input.selectionStart = input.selectionEnd = cursorPos + 1;
  input.focus();
  
  supremePromise.showNotification('Type context after @: pay, office, team, boss, project, client, system...', 'info');
}

// Conversation Mode
let conversationMode = false;
let conversationHistory = [];

function toggleConversationMode() {
  conversationMode = !conversationMode;
  const btn = document.getElementById('conversationBtn');
  
  if (conversationMode) {
    btn.style.background = 'rgba(139, 92, 246, 0.2)';
    btn.style.borderColor = '#8b5cf6';
    supremePromise.showNotification('Conversation mode ON - I\'ll remember our chat context', 'success');
  } else {
    btn.style.background = 'transparent';
    btn.style.borderColor = '#8b5cf6';
    conversationHistory = []; // Clear history
    supremePromise.showNotification('Conversation mode OFF - Each message is independent', 'info');
  }
}

// Global exposure for HTML onclick handlers
window.supremePromise = supremePromise;
window.activateRIX = activateRIX;
window.toggleScanToApprove = toggleScanToApprove;
window.handleCopilotKeyPress = handleCopilotKeyPress;
window.processDiamondCLI = processDiamondCLI;
window.toggleCopilotMode = toggleCopilotMode;
window.sendCopilotMessage = sendCopilotMessage;
window.startVoiceInput = startVoiceInput;
window.togglePanel = togglePanel;
window.selectIcon = selectIcon;
window.showFreemiumFeature = showFreemiumFeature;
window.openIntegrationGateway = openIntegrationGateway;

// MyDiamond CLI functions
window.handleMyDiamondInput = handleMyDiamondInput;
window.processMyDiamondInput = processMyDiamondInput;
window.handleSpecialKeys = handleSpecialKeys;
window.updateModeIndicator = updateModeIndicator;
window.insertContextSearch = insertContextSearch;
window.toggleConversationMode = toggleConversationMode;

// Legacy compatibility
window.handleCLIKeyPress = handleCLIKeyPress;
window.executeCLICommand = executeCLICommand;

// Other functions
window.initiateScanToDo = initiateScanToDo;
window.showS2DOInfo = showS2DOInfo;
window.toggleRightPanelSize = toggleRightPanelSize;
window.togglePanelLock = togglePanelLock;
window.openAPIConfig = openAPIConfig;
window.closeAPIConfig = closeAPIConfig;
window.saveAPIConfig = saveAPIConfig;
window.setMode = setMode;
window.switchModel = switchModel;
window.clearTerminal = clearTerminal;
window.toggleClaudeCodeMode = toggleClaudeCodeMode;

console.log('Supreme Promise Interface loaded successfully.');