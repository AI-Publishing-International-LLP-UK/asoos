/**
 * 🌌 VISION SPACE CONNECTION SYSTEM
 *
 * Sacred Mission: Link Multiple Vision Spaces for Collaborative AI Meetings
 * Authority: Diamond SAO Command Center - Multi-Space Orchestration
 *
 * Enables users to connect their vision spaces together for:
 * - Distributed webinars with multiple AI teams
 * - Digital twin collaboration environments
 * - Multi-space pilot coordination
 *
 * @classification DIAMOND_SAO_VISION_SPACE_CONNECTOR
 * @date 2025-01-15
 * @author Victory36 + Diamond SAO Command Center
 */

class VisionSpaceConnector {
  constructor() {
    this.version = '1.0.0-vision-space-connector';
    this.authority = 'Diamond SAO Vision Space Network';
    this.connectedSpaces = new Map();
    this.localSpaceId = this.generateSpaceId();
    this.isHost = false;
    this.subscription = null;
    this.maxConnections = 0;

    // WebSocket connection for real-time space synchronization
    this.ws = null;
    this.serverUrl = 'wss://vision-spaces.2100.cool/connect';

    // Subscription tiers - Quantum Swarm VoIP advantage pricing
    this.subscriptionTiers = {
      basic: {
        name: 'Basic',
        price: 2,
        maxConnections: 5,
        features: [
          'Link up to 5 vision spaces',
          'VoIP-powered connections',
          'AI pilot sharing',
          '1 month free trial',
        ],
      },
      professional: {
        name: 'Professional',
        price: 5,
        maxConnections: 50,
        features: [
          'Link up to 50 vision spaces',
          'Advanced pilot coordination',
          'Meeting recording',
          'Quantum Swarm VoIP',
          '1 month free trial',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        price: 15,
        maxConnections: 10000,
        features: [
          'Unlimited vision spaces',
          'Webinar mode (10K+ participants)',
          'Analytics dashboard',
          'Priority support',
          'Quantum Swarm Infrastructure',
          '1 month free trial',
        ],
      },
    };

    this.initializeConnector();
  }

  initializeConnector() {
    console.log('🌌 VISION SPACE CONNECTOR SYSTEM');
    console.log('════════════════════════════════════');
    console.log('🏛️  Authority: Diamond SAO Command Center');
    console.log('🔗 Capability: Multi-Space Collaboration');
    console.log('🚀 Integration: WebSocket + AI Pilot Sync');
    console.log('💎 Purpose: Connected Digital Twin Environments');
    console.log('');
    console.log('🌐 CONNECTION CAPABILITIES:');
    console.log('   • Link multiple vision spaces');
    console.log('   • Real-time pilot synchronization');
    console.log('   • Distributed webinar hosting');
    console.log('   • Digital twin collaboration');
    console.log('   • Cloudflare-style subscriptions');
    console.log('');

    this.loadSubscriptionStatus();
  }

  generateSpaceId() {
    return 'vision-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async loadSubscriptionStatus() {
    // Check if user has active subscription
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (data.subscription) {
        this.subscription = data.subscription;
        const tier = this.subscriptionTiers[data.subscription.tier];
        this.maxConnections = tier ? tier.maxConnections : 0;

        console.log(`✅ Active subscription: ${tier.name} (${this.maxConnections} connections)`);
      } else {
        console.log('💡 No active subscription - free trial available');
      }
    } catch (error) {
      console.log('💡 Subscription check failed - operating in demo mode');
    }
  }

  async createMeeting(meetingName = 'Vision Space Collaboration') {
    // Check subscription limits
    if (!this.subscription && this.connectedSpaces.size > 0) {
      return this.showSubscriptionPopup('create');
    }

    try {
      const meetingId = 'meeting-' + Date.now();
      this.isHost = true;

      // Connect to WebSocket server
      await this.connectToServer(meetingId);

      // Create meeting room
      const meetingData = {
        id: meetingId,
        name: meetingName,
        host: this.localSpaceId,
        created: new Date().toISOString(),
        participants: [this.localSpaceId],
        maxParticipants: this.maxConnections,
      };

      this.sendMessage({
        type: 'create_meeting',
        data: meetingData,
      });

      console.log('🌌 Created Vision Space Meeting:');
      console.log(`📋 Name: ${meetingName}`);
      console.log(`🆔 Meeting ID: ${meetingId}`);
      console.log(`🔗 Invitation Link: https://vision-spaces.2100.cool/join/${meetingId}`);
      console.log(`👥 Max Participants: ${this.maxConnections}`);

      return {
        success: true,
        meetingId: meetingId,
        inviteLink: `https://vision-spaces.2100.cool/join/${meetingId}`,
        maxParticipants: this.maxConnections,
      };
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      return { success: false, error: error.message };
    }
  }

  async joinMeeting(meetingId) {
    // Check subscription limits
    if (!this.subscription && this.connectedSpaces.size >= 1) {
      return this.showSubscriptionPopup('join');
    }

    try {
      await this.connectToServer(meetingId);

      this.sendMessage({
        type: 'join_meeting',
        data: {
          meetingId: meetingId,
          spaceId: this.localSpaceId,
          pilots: this.getCurrentPilots(),
        },
      });

      console.log(`🌌 Joining Vision Space Meeting: ${meetingId}`);
      return { success: true, meetingId: meetingId };
    } catch (error) {
      console.error('❌ Failed to join meeting:', error);
      return { success: false, error: error.message };
    }
  }

  async connectToServer(meetingId) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.serverUrl}?meeting=${meetingId}&space=${this.localSpaceId}`);

      this.ws.onopen = () => {
        console.log('🔗 Connected to Vision Space Network');
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from Vision Space Network');
        this.connectedSpaces.clear();
        this.updateUI();
      };
    });
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'space_joined':
        this.addConnectedSpace(message.data);
        break;
      case 'space_left':
        this.removeConnectedSpace(message.data.spaceId);
        break;
      case 'pilot_update':
        this.syncPilotUpdate(message.data);
        break;
      case 'meeting_info':
        this.updateMeetingInfo(message.data);
        break;
      case 'subscription_required':
        this.showSubscriptionPopup('limit_reached');
        break;
    }
  }

  addConnectedSpace(spaceData) {
    this.connectedSpaces.set(spaceData.spaceId, spaceData);
    console.log(`🌌 Vision space connected: ${spaceData.spaceId}`);
    console.log(`👥 Pilots in their space: ${spaceData.pilots.length}`);

    this.updateUI();
    this.renderConnectedSpace(spaceData);
  }

  removeConnectedSpace(spaceId) {
    this.connectedSpaces.delete(spaceId);
    console.log(`🌌 Vision space disconnected: ${spaceId}`);

    this.updateUI();
    this.removeConnectedSpaceFromUI(spaceId);
  }

  getCurrentPilots() {
    // Get current pilots from the main vision space
    if (window.visionSpace && window.visionSpace.pilots) {
      return Array.from(window.visionSpace.pilots.values()).map((pilot) => ({
        id: pilot.id,
        type: pilot.type,
        position: {
          x: pilot.element.style.left,
          y: pilot.element.style.top,
        },
        state: pilot.speaking ? 'speaking' : 'idle',
      }));
    }
    return [];
  }

  syncPilotUpdate(updateData) {
    // Sync pilot movements and states across connected spaces
    console.log(`🔄 Syncing pilot update from space: ${updateData.fromSpace}`);

    // Update UI to show pilot activity in connected spaces
    this.updateConnectedSpacePilot(updateData);
  }

  renderConnectedSpace(spaceData) {
    const connectedSpacesContainer = document.getElementById('connected-spaces');
    if (!connectedSpacesContainer) return;

    const spaceElement = document.createElement('div');
    spaceElement.className = 'connected-space';
    spaceElement.id = `connected-space-${spaceData.spaceId}`;
    spaceElement.innerHTML = `
            <div class="connected-space-header">
                <h4>🌌 Vision Space</h4>
                <span class="space-id">${spaceData.spaceId.substr(-8)}</span>
            </div>
            <div class="connected-space-pilots">
                ${spaceData.pilots
                  .map(
                    (pilot) => `
                    <div class="remote-pilot" data-pilot-id="${pilot.id}">
                        <div class="remote-pilot-avatar">${pilot.type.replace('dr-', 'Dr. ')}</div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;

    connectedSpacesContainer.appendChild(spaceElement);
  }

  showSubscriptionPopup(context) {
    const popup = document.createElement('div');
    popup.className = 'subscription-popup';
    popup.innerHTML = `
            <div class="subscription-modal">
                <div class="subscription-header">
                    <h3>🌌 Connect Vision Spaces</h3>
                    <p>Choose your collaboration level</p>
                </div>
                <div class="subscription-tiers">
                    ${Object.entries(this.subscriptionTiers)
                      .map(
                        ([key, tier]) => `
                        <div class="subscription-tier" data-tier="${key}">
                            <h4>${tier.name}</h4>
                            <div class="tier-price">$${tier.price}/month</div>
                            <div class="tier-connections">${tier.maxConnections} connections</div>
                            <ul class="tier-features">
                                ${tier.features.map((feature) => `<li>${feature}</li>`).join('')}
                            </ul>
                            <button class="subscribe-btn" onclick="visionConnector.subscribe('${key}')">
                                Start Free Trial
                            </button>
                        </div>
                    `
                      )
                      .join('')}
                </div>
                <button class="close-popup" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    document.body.appendChild(popup);
    return { success: false, reason: 'subscription_required' };
  }

  async subscribe(tier) {
    const tierData = this.subscriptionTiers[tier];

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier,
          price: tierData.price,
          trial_days: 30,
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      alert('Subscription error. Please try again.');
    }
  }

  updateUI() {
    const connectionCount = document.getElementById('connection-count');
    if (connectionCount) {
      connectionCount.textContent = this.connectedSpaces.size;
    }

    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
      connectionStatus.textContent = this.connectedSpaces.size > 0 ? 'Connected' : 'Solo Mode';
      connectionStatus.className = this.connectedSpaces.size > 0 ? 'connected' : 'solo';
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connectedSpaces.clear();
    this.updateUI();
    console.log('🔌 Disconnected from all vision spaces');
  }
}

// Global instance
let visionConnector = null;

// Initialize when page loads
window.addEventListener('load', () => {
  visionConnector = new VisionSpaceConnector();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisionSpaceConnector;
}
