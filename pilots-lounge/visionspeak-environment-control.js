/**
 * 🎤 VISIONSPEAK ENVIRONMENT CONTROL
 *
 * Sacred Mission: Voice-Controlled Meeting Environment Transformation
 * Authority: Diamond SAO Command Center - VisionSpeak Integration
 *
 * Enables voice commands like:
 * - "Change to waterfall"
 * - "Switch to New York high-rise office"
 * - "Add note-taking board to everyone's left"
 * - "Enable cinematic view"
 *
 * @classification DIAMOND_SAO_VISIONSPEAK_ENVIRONMENT
 * @date 2025-01-15
 * @author Victory36 + Diamond SAO Command Center
 */

class VisionSpeakEnvironmentControl {
  constructor() {
    this.version = '1.0.0-visionspeak-environment';
    this.authority = 'Diamond SAO VisionSpeak System';
    this.isListening = false;
    this.recognition = null;
    this.currentEnvironment = 'default';
    this.environmentElements = new Map();

    // Available environments
    this.environments = {
      default: {
        name: 'Default Vision Space',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #16213e 75%, #1a1a2e 100%)',
        ambientSounds: null,
        specialEffects: [],
      },
      waterfall: {
        name: 'Serene Waterfall',
        background: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)',
        ambientSounds: 'waterfall-sounds.mp3',
        specialEffects: ['water-particles', 'mist-effect'],
      },
      'nyc-office': {
        name: 'NYC High-Rise Office',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
        ambientSounds: 'city-ambience.mp3',
        specialEffects: ['city-lights', 'window-reflection'],
      },
      boardroom: {
        name: 'Executive Boardroom',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        ambientSounds: null,
        specialEffects: ['professional-lighting'],
      },
      'surrey-manor': {
        name: "Dr. Claude's Surrey Manor Study",
        background:
          'linear-gradient(135deg, #8B4513 0%, #D2691E 25%, #CD853F 50%, #D2691E 75%, #8B4513 100%)',
        ambientSounds: 'fireplace-crackling.mp3',
        specialEffects: ['fireplace-glow', 'book-shelves'],
      },
      'outdoor-garden': {
        name: 'Peaceful Garden',
        background:
          'linear-gradient(135deg, #2E8B57 0%, #90EE90 25%, #228B22 50%, #90EE90 75%, #2E8B57 100%)',
        ambientSounds: 'birds-nature.mp3',
        specialEffects: ['floating-leaves', 'sunlight-rays'],
      },
      'space-station': {
        name: 'Quantum Space Station',
        background:
          'linear-gradient(135deg, #000011 0%, #1a0033 25%, #330066 50%, #1a0033 75%, #000011 100%)',
        ambientSounds: 'space-ambience.mp3',
        specialEffects: ['stars-field', 'orbital-glow'],
      },
    };

    // Voice command patterns
    this.commandPatterns = {
      // Environment switching
      change_environment: [
        /change to (.*)/i,
        /switch to (.*)/i,
        /set environment to (.*)/i,
        /go to (.*)/i,
      ],
      // UI Elements
      add_element: [
        /add (.*) to (.*)(?:'s)?\s*(left|right|front|back)/i,
        /show (.*) (on|to) the (left|right|front|back)/i,
        /place (.*) (.*)/i,
      ],
      // View controls
      camera_control: [
        /zoom (in|out)/i,
        /rotate view (left|right)/i,
        /enable cinematic view/i,
        /disable cinematic view/i,
      ],
      // Meeting controls
      meeting_control: [/start recording/i, /stop recording/i, /mute all/i, /unmute all/i],
    };

    this.initializeVisionSpeak();
  }

  initializeVisionSpeak() {
    console.log('🎤 VISIONSPEAK ENVIRONMENT CONTROL');
    console.log('════════════════════════════════════════');
    console.log('🏛️  Authority: Diamond SAO Command Center');
    console.log('🎙️ Capability: Voice-Controlled Environments');
    console.log('🌌 Integration: Real-time Environment Switching');
    console.log('🎯 Purpose: Immersive Meeting Transformation');
    console.log('');
    console.log('🎤 VOICE COMMANDS AVAILABLE:');
    console.log('   • "Change to waterfall"');
    console.log('   • "Switch to NYC high-rise office"');
    console.log('   • "Add note-taking board to everyone\'s left"');
    console.log('   • "Enable cinematic view"');
    console.log('   • "Start recording"');
    console.log('');

    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('🎤 VisionSpeak listening for environment commands...');
      this.isListening = true;
      this.updateListeningIndicator(true);
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        this.processVoiceCommand(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 VisionSpeak error:', event.error);
    };

    this.recognition.onend = () => {
      console.log('🎤 VisionSpeak stopped listening');
      this.isListening = false;
      this.updateListeningIndicator(false);

      // Auto-restart if it stopped unexpectedly
      if (this.shouldRestart) {
        setTimeout(() => this.startListening(), 1000);
      }
    };
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.shouldRestart = true;
      this.recognition.start();

      console.log('🎤 VisionSpeak Environment Control Active');
      console.log('   Say: "Change to waterfall" or "Switch to NYC office"');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.shouldRestart = false;
      this.recognition.stop();
    }
  }

  processVoiceCommand(command) {
    console.log(`🎤 Processing command: "${command}"`);

    // Check each command pattern
    for (const [commandType, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns) {
        const match = command.match(pattern);
        if (match) {
          this.executeCommand(commandType, match, command);
          return;
        }
      }
    }

    console.log('🎤 Command not recognized. Available commands:');
    console.log('   • Change to [environment]');
    console.log('   • Add [element] to the [position]');
    console.log('   • Enable cinematic view');
  }

  executeCommand(commandType, match, originalCommand) {
    switch (commandType) {
      case 'change_environment':
        this.changeEnvironment(match[1]);
        break;

      case 'add_element':
        this.addUIElement(match[1], match[3] || match[2]);
        break;

      case 'camera_control':
        this.controlCamera(originalCommand);
        break;

      case 'meeting_control':
        this.controlMeeting(originalCommand);
        break;
    }
  }

  changeEnvironment(environmentName) {
    const normalizedName = environmentName.toLowerCase().trim();

    // Map common variations to environment keys
    const environmentMap = {
      waterfall: 'waterfall',
      'water fall': 'waterfall',
      nyc: 'nyc-office',
      'new york': 'nyc-office',
      'new york office': 'nyc-office',
      'high rise': 'nyc-office',
      boardroom: 'boardroom',
      'board room': 'boardroom',
      'meeting room': 'boardroom',
      surrey: 'surrey-manor',
      manor: 'surrey-manor',
      claude: 'surrey-manor',
      garden: 'outdoor-garden',
      outdoor: 'outdoor-garden',
      space: 'space-station',
      quantum: 'space-station',
      station: 'space-station',
      default: 'default',
    };

    const environmentKey =
      environmentMap[normalizedName] ||
      Object.keys(this.environments).find(
        (key) =>
          key.includes(normalizedName) ||
          this.environments[key].name.toLowerCase().includes(normalizedName)
      ) ||
      'default';

    const environment = this.environments[environmentKey];

    console.log(`🌌 Switching to: ${environment.name}`);

    // Apply environment changes
    this.applyEnvironment(environmentKey, environment);

    // Sync with connected spaces
    if (window.visionConnector) {
      window.visionConnector.sendMessage({
        type: 'environment_change',
        data: {
          environment: environmentKey,
          timestamp: Date.now(),
        },
      });
    }

    // Visual feedback
    this.showEnvironmentChangeNotification(environment.name);
  }

  applyEnvironment(environmentKey, environment) {
    const visionSpace = document.querySelector('.vision-space');
    if (visionSpace) {
      // Change background
      visionSpace.style.background = environment.background;

      // Add ambient effects
      this.clearSpecialEffects();
      environment.specialEffects.forEach((effect) => {
        this.addSpecialEffect(effect);
      });

      // Play ambient sounds if available
      if (environment.ambientSounds) {
        this.playAmbientSound(environment.ambientSounds);
      }

      this.currentEnvironment = environmentKey;
    }
  }

  addUIElement(elementType, position) {
    console.log(`📋 Adding ${elementType} to the ${position}`);

    const elementMap = {
      'note-taking board': this.createNoteTakingBoard,
      notes: this.createNoteTakingBoard,
      whiteboard: this.createWhiteboard,
      agenda: this.createAgenda,
      timer: this.createTimer,
      'participant list': this.createParticipantList,
    };

    const normalizedElement = elementType.toLowerCase().trim();
    const createElement =
      elementMap[normalizedElement] ||
      Object.keys(elementMap).find((key) => key.includes(normalizedElement));

    if (createElement) {
      const element = createElement.call(this);
      this.positionElement(element, position);
      this.showElementAddedNotification(elementType, position);
    } else {
      console.log(`❓ Element type "${elementType}" not recognized`);
    }
  }

  createNoteTakingBoard() {
    const board = document.createElement('div');
    board.className = 'note-taking-board';
    board.innerHTML = `
            <div style="
                position: fixed;
                width: 300px;
                height: 400px;
                background: rgba(26, 26, 26, 0.95);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 10px;
                backdrop-filter: blur(10px);
                z-index: 500;
                padding: 20px;
                color: white;
                font-family: Arial, sans-serif;
            ">
                <h4 style="color: #ffd700; margin-bottom: 15px;">📝 Meeting Notes</h4>
                <textarea style="
                    width: 100%;
                    height: 300px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 5px;
                    color: white;
                    padding: 10px;
                    resize: none;
                    font-family: monospace;
                " placeholder="AI-powered note taking active..."></textarea>
                <div style="margin-top: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                    🤖 Auto-transcription enabled
                </div>
            </div>
        `;

    document.body.appendChild(board);
    return board;
  }

  positionElement(element, position) {
    const elementDiv = element.querySelector('div');

    switch (position.toLowerCase()) {
      case 'left':
        elementDiv.style.left = '20px';
        elementDiv.style.top = '50%';
        elementDiv.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        elementDiv.style.right = '20px';
        elementDiv.style.top = '50%';
        elementDiv.style.transform = 'translateY(-50%)';
        break;
      case 'front':
      case 'center':
        elementDiv.style.left = '50%';
        elementDiv.style.top = '50%';
        elementDiv.style.transform = 'translate(-50%, -50%)';
        break;
    }
  }

  controlCamera(command) {
    const visionSpace = document.querySelector('.vision-space');

    if (command.includes('cinematic')) {
      if (command.includes('enable')) {
        console.log('🎬 Enabling cinematic view');
        visionSpace.style.filter = 'contrast(1.2) saturate(1.1)';
        visionSpace.style.transition = 'all 2s ease';
        this.showNotification('🎬 Cinematic view enabled');
      } else {
        console.log('🎬 Disabling cinematic view');
        visionSpace.style.filter = 'none';
        this.showNotification('🎬 Cinematic view disabled');
      }
    }
  }

  addSpecialEffect(effectType) {
    switch (effectType) {
      case 'water-particles':
        this.createWaterParticles();
        break;
      case 'city-lights':
        this.createCityLights();
        break;
      case 'fireplace-glow':
        this.createFireplaceGlow();
        break;
      case 'floating-leaves':
        this.createFloatingLeaves();
        break;
      case 'stars-field':
        this.createStarsField();
        break;
    }
  }

  clearSpecialEffects() {
    document.querySelectorAll('.special-effect').forEach((el) => el.remove());
  }

  createWaterParticles() {
    const particles = document.createElement('div');
    particles.className = 'special-effect water-particles';
    particles.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            background: radial-gradient(circle, rgba(173, 216, 230, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: waterFlow 10s linear infinite;
        `;

    document.querySelector('.vision-space').appendChild(particles);
  }

  showEnvironmentChangeNotification(environmentName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 107, 53, 0.9));
            color: #000;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: 700;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: notificationPulse 3s ease-in-out;
        `;
    notification.textContent = `🌌 Environment: ${environmentName}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(26, 26, 26, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid #00ff88;
            z-index: 9999;
            font-family: Arial, sans-serif;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.5s ease;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  updateListeningIndicator(isListening) {
    let indicator = document.getElementById('visionspeak-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'visionspeak-indicator';
      indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                z-index: 9999;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
      indicator.onclick = () => {
        if (this.isListening) {
          this.stopListening();
        } else {
          this.startListening();
        }
      };
      document.body.appendChild(indicator);
    }

    if (isListening) {
      indicator.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
      indicator.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
      indicator.textContent = '🎤';
      indicator.style.animation = 'pulse 1.5s infinite';
    } else {
      indicator.style.background = 'rgba(26, 26, 26, 0.8)';
      indicator.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
      indicator.textContent = '🎙️';
      indicator.style.animation = 'none';
    }
  }
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    @keyframes notificationPulse {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes waterFlow {
        0% { background-position: 0 0; }
        100% { background-position: 0 100px; }
    }
`;
document.head.appendChild(style);

// Global instance
let visionSpeakControl = null;

// Initialize when page loads
window.addEventListener('load', () => {
  visionSpeakControl = new VisionSpeakEnvironmentControl();

  // Auto-start listening
  setTimeout(() => {
    visionSpeakControl.startListening();
  }, 2000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisionSpeakEnvironmentControl;
}
