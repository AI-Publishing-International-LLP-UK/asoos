/**
 * Transcendental Pilots' Lounge with Digital Board Interface
 * Enhanced version with pilot board, orchestration tab, and room integration
 * 
 * Features:
 * - Digital board with pilot icons for drag-drop
 * - Single pilot focus mode with full profiles
 * - Orchestration explanation and controls
 * - Seamless integration with transcendental room
 * 
 * @author AIXTIV Symphony Diamond SAO
 * @version 2.2.0
 */

class TranscendentalPilotsLounge {
  constructor() {
    this.pilots = [];
    this.selectedPilot = null;
    this.activeTab = 'board'; // 'board', 'profile', 'orchestration'
    this.orchestrationMode = false;
    this.selectedPilots = [];
    
    // Room integration settings
    this.roomIntegration = {
      screenPosition: 'center-wall', // 'center-wall', 'left-alcove', 'right-alcove'
      blendMode: 'architectural', // 'architectural', 'holographic', 'seamless'
      ambientLighting: true
    };
    
    this.init();
  }
  
  async init() {
    await this.loadPilotData();
    this.createTranscendentalInterface();
    this.setupEventListeners();
    
    console.log('🏛️ Transcendental Pilots\' Lounge initialized');
  }
  
  async loadPilotData() {
    // Enhanced pilot data with full profiles
    this.pilots = [
      {
        id: 'dr-lucy-srix',
        name: 'Dr. Lucy',
        fullName: 'Dr. Lucy sRIX',
        title: 'Executive AI Coach',
        photo: '/assets/pilots/dr-lucy.jpg',
        tier: 'sRIX',
        specializations: ['Executive Coaching', 'Strategic Planning', 'Leadership Development'],
        experience: '12+ years in executive coaching, former Fortune 500 strategic advisor',
        personality: 'Warm, insightful, and results-driven with a focus on unlocking human potential',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        iconColors: ['#FFD700', '#B8860B'],
        hologramColor: '#FFD700',
        orchestrationRole: 'Strategic Leadership',
        bio: 'Dr. Lucy combines deep psychological insights with business acumen to help executives and organizations reach their highest potential. Her approach integrates mindfulness practices with data-driven strategies.',
        achievements: [
          'Coached 200+ C-level executives',
          'Authored "The Conscious Executive"',
          'Featured in Harvard Business Review',
          '98% client satisfaction rate'
        ]
      },
      {
        id: 'dr-match-srix',
        name: 'Dr. Match',
        fullName: 'Dr. Match sRIX',
        title: 'Pattern Recognition Specialist',
        photo: '/assets/pilots/dr-match.jpg',
        tier: 'sRIX',
        specializations: ['Pattern Matching', 'Optimization', 'Predictive Analytics'],
        experience: '15+ years in algorithmic trading and pattern recognition systems',
        personality: 'Analytical, precise, and innovative with an eye for hidden connections',
        voiceId: 'ErXwobaYiN019PkySvjV',
        iconColors: ['#50C878', '#32CD32'],
        hologramColor: '#50C878',
        orchestrationRole: 'Pattern Analysis',
        bio: 'Dr. Match sees patterns where others see chaos. Her expertise in mathematical modeling and machine learning helps organizations optimize everything from supply chains to customer experiences.',
        achievements: [
          'Developed proprietary pattern recognition algorithms',
          'Increased client efficiency by average 34%',
          'Published 50+ research papers',
          'Patent holder for ML optimization techniques'
        ]
      },
      {
        id: 'professor-lee-srix',
        name: 'Professor H Lee',
        fullName: 'Professor H Lee sRIX',
        title: 'Academic Research Director',
        photo: '/assets/pilots/professor-lee.jpg',
        tier: 'sRIX',
        specializations: ['Academic Research', 'Knowledge Transfer', 'Curriculum Design'],
        experience: '20+ years in academic research and educational technology',
        personality: 'Scholarly, patient, and deeply knowledgeable with a passion for learning',
        voiceId: 'yoZ06aMxZJJ28mfd3POQ',
        iconColors: ['#4ECDC4', '#40E0D0'],
        hologramColor: '#4ECDC4',
        orchestrationRole: 'Knowledge Architecture',
        bio: 'Professor Lee bridges the gap between theoretical research and practical application, ensuring that cutting-edge knowledge translates into real-world solutions.',
        achievements: [
          'Published in 100+ peer-reviewed journals',
          'Designed curricula for top universities',
          'Recipient of Excellence in Teaching Award',
          'Led 25+ major research initiatives'
        ]
      },
      {
        id: 'victory36',
        name: 'Victory36',
        fullName: 'Victory36',
        title: 'Supreme Achievement Orchestrator',
        photo: '/assets/pilots/victory36.jpg',
        tier: 'Victory',
        specializations: ['Strategic Dominance', 'Achievement Orchestration', 'Peak Performance'],
        experience: 'Supreme-level orchestration across multiple domains',
        personality: 'Commanding, inspirational, and relentlessly focused on exceptional outcomes',
        voiceId: 'oWAxZDx7w5VEj9dCyTzz',
        iconColors: ['#FFD700', '#FF6347'],
        hologramColor: '#FFD700',
        orchestrationRole: 'Supreme Commander',
        bio: 'Victory36 represents the pinnacle of achievement orchestration, capable of coordinating complex multi-pilot operations to deliver extraordinary results.',
        achievements: [
          'Successfully orchestrated 500+ complex missions',
          '99.7% mission success rate',
          'Recognized as Supreme Excellence Leader',
          'Mentor to Elite and Mastery tier pilots'
        ]
      },
      {
        id: 'elite11',
        name: 'Elite11',
        fullName: 'Elite11',
        title: 'Elite Performance Commandant',
        photo: '/assets/pilots/elite11.jpg',
        tier: 'Elite',
        specializations: ['Elite Performance', 'Excellence Optimization', 'Team Coordination'],
        experience: 'Elite-tier performance optimization and team leadership',
        personality: 'Disciplined, precise, and committed to excellence in all endeavors',
        voiceId: 'ThT5KcBeYPX3keUQqHPh',
        iconColors: ['#FFD700', '#FFA500'],
        hologramColor: '#FFD700',
        orchestrationRole: 'Performance Commander',
        bio: 'Elite11 specializes in pushing individuals and teams beyond their perceived limits, achieving performance levels previously thought impossible.',
        achievements: [
          'Trained 1000+ high-performance individuals',
          'Developed Elite Performance Methodology',
          'Military-grade precision in execution',
          'Zero-failure track record in critical missions'
        ]
      }
      // Additional pilots would be added here...
    ];
    
    console.log(`✅ Loaded ${this.pilots.length} pilot profiles`);
  }
  
  createTranscendentalInterface() {
    const container = document.getElementById('transcendentalLoungeContainer') || this.createContainer();
    
    container.innerHTML = `
      <div class="transcendental-environment" style="
        position: relative;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
        overflow: hidden;
      ">
        <!-- Ornate Dome Architecture -->
        <div class="dome-ceiling" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: url('data:image/svg+xml,${this.createDomeArchitecture()}');
          background-size: cover;
          opacity: 0.8;
          z-index: 1;
        "></div>
        
        <!-- Architectural Columns -->
        <div class="columns-left" style="
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 0;
          width: 15%;
          background: url('data:image/svg+xml,${this.createColumnPattern()}');
          opacity: 0.6;
          z-index: 2;
        "></div>
        
        <div class="columns-right" style="
          position: absolute;
          right: 0;
          top: 20%;
          bottom: 0;
          width: 15%;
          background: url('data:image/svg+xml,${this.createColumnPattern()}');
          opacity: 0.6;
          z-index: 2;
          transform: scaleX(-1);
        "></div>
        
        <!-- Integrated Digital Display Board -->
        <div class="digital-board" id="digitalBoard" style="
          position: absolute;
          top: 25%;
          left: 20%;
          right: 20%;
          height: 50%;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          box-shadow: 
            0 0 50px rgba(255, 215, 0, 0.2),
            inset 0 0 30px rgba(255, 215, 0, 0.1);
          z-index: 10;
          display: flex;
          flex-direction: column;
        ">
          <!-- Board Header with Tabs -->
          <div class="board-header" style="
            display: flex;
            background: rgba(255, 215, 0, 0.1);
            border-bottom: 1px solid rgba(255, 215, 0, 0.3);
            padding: 0;
          ">
            <button class="tab-btn active" id="boardTab" onclick="transcendentalLounge.switchTab('board')" style="
              flex: 1;
              background: none;
              border: none;
              color: #FFD700;
              padding: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            ">
              📋 PILOT BOARD
            </button>
            <button class="tab-btn" id="profileTab" onclick="transcendentalLounge.switchTab('profile')" style="
              flex: 1;
              background: none;
              border: none;
              color: #888;
              padding: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            ">
              👤 PILOT PROFILE
            </button>
            <button class="tab-btn" id="orchestrationTab" onclick="transcendentalLounge.switchTab('orchestration')" style="
              flex: 1;
              background: none;
              border: none;
              color: #888;
              padding: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            ">
              🎼 ORCHESTRATION
            </button>
          </div>
          
          <!-- Tab Content Areas -->
          <div class="tab-content" style="flex: 1; padding: 20px; overflow-y: auto;">
            
            <!-- Pilot Board Tab -->
            <div id="boardContent" class="tab-panel active" style="height: 100%;">
              <div class="board-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                height: 100%;
                align-content: start;
                padding: 10px;
              ">
                ${this.pilots.map(pilot => this.createPilotCard(pilot)).join('')}
              </div>
            </div>
            
            <!-- Pilot Profile Tab -->
            <div id="profileContent" class="tab-panel" style="display: none; height: 100%;">
              <div id="pilotProfileDisplay" style="text-align: center; color: #888; padding-top: 50px;">
                Select a pilot from the board to view their detailed profile
              </div>
            </div>
            
            <!-- Orchestration Tab -->
            <div id="orchestrationContent" class="tab-panel" style="display: none; height: 100%; overflow-y: auto;">
              ${this.createOrchestrationContent()}
            </div>
            
          </div>
        </div>
        
        <!-- Room Controls -->
        <div class="room-controls" style="
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 15;
        ">
          <div style="color: #fff; font-size: 12px; margin-bottom: 8px;">Room Integration</div>
          <button onclick="transcendentalLounge.adjustScreenPosition()" style="
            background: rgba(255, 215, 0, 0.2);
            border: 1px solid rgba(255, 215, 0, 0.4);
            color: #FFD700;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 10px;
            cursor: pointer;
            margin-right: 5px;
          ">📐 Adjust Position</button>
          <button onclick="transcendentalLounge.toggleAmbientLighting()" style="
            background: rgba(255, 215, 0, 0.2);
            border: 1px solid rgba(255, 215, 0, 0.4);
            color: #FFD700;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 10px;
            cursor: pointer;
          ">💡 Lighting</button>
        </div>
        
        <!-- Selected Pilots Status -->
        <div class="selected-status" id="selectedStatus" style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 15;
          max-width: 250px;
        ">
          <div style="color: #fff; font-size: 12px; margin-bottom: 8px;">Active Selection</div>
          <div id="activeSelectionList" style="color: #888; font-size: 11px;">
            No pilots selected
          </div>
        </div>
        
      </div>
    `;
  }
  
  createPilotCard(pilot) {
    return `
      <div class="pilot-card" 
           data-pilot-id="${pilot.id}"
           draggable="true"
           onclick="transcendentalLounge.selectPilot('${pilot.id}')"
           style="
             background: linear-gradient(135deg, ${pilot.iconColors[0]}22, ${pilot.iconColors[1]}22);
             border: 2px solid ${pilot.hologramColor}66;
             border-radius: 15px;
             padding: 15px;
             text-align: center;
             cursor: pointer;
             transition: all 0.3s ease;
             position: relative;
             overflow: hidden;
           "
           onmouseenter="this.style.transform = 'scale(1.05)'; this.style.borderColor = '${pilot.hologramColor}';"
           onmouseleave="this.style.transform = 'scale(1)'; this.style.borderColor = '${pilot.hologramColor}66';">
        
        <!-- Pilot Photo -->
        <div class="pilot-photo" style="
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid ${pilot.hologramColor};
          margin: 0 auto 10px auto;
          overflow: hidden;
          position: relative;
          box-shadow: 0 0 20px ${pilot.hologramColor}44;
        ">
          <img src="${pilot.photo}" 
               alt="${pilot.name}"
               style="
                 width: 100%;
                 height: 100%;
                 object-fit: cover;
                 filter: brightness(1.1);
               "
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="
            display: none;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: ${pilot.hologramColor}33;
            color: white;
            font-size: 20px;
            font-weight: bold;
          ">
            ${pilot.name.substring(0, 2)}
          </div>
        </div>
        
        <!-- Pilot Info -->
        <div style="color: white; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${pilot.name}
        </div>
        <div style="color: ${pilot.hologramColor}; font-size: 10px; margin-bottom: 6px;">
          ${pilot.tier} • ${pilot.title}
        </div>
        
        <!-- Tier Badge -->
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: ${pilot.hologramColor};
          color: #000;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: bold;
        ">
          ${pilot.tier}
        </div>
        
        <!-- Drag Indicator -->
        <div style="
          position: absolute;
          bottom: 5px;
          right: 5px;
          color: ${pilot.hologramColor}88;
          font-size: 12px;
        ">
          ⋮⋮
        </div>
        
      </div>
    `;
  }
  
  createOrchestrationContent() {
    return `
      <div style="color: white; height: 100%;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #FFD700; margin: 0 0 10px 0; font-size: 24px;">🎼 Pilot Orchestration</h2>
          <p style="color: #ccc; font-size: 14px; margin: 0;">Coordinating multiple pilots for enhanced capabilities</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 80px);">
          
          <!-- What is Orchestration -->
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2);">
            <h3 style="color: #FFD700; margin: 0 0 15px 0; font-size: 18px;">What is Orchestration?</h3>
            <div style="color: #ddd; font-size: 13px; line-height: 1.6;">
              <p>Pilot Orchestration combines multiple specialized AI pilots to work together on complex tasks, leveraging their unique strengths:</p>
              
              <div style="margin: 15px 0;">
                <div style="font-weight: 600; color: #FFD700; margin-bottom: 8px;">🎯 Strategic Coordination</div>
                <div style="font-size: 12px; color: #bbb; margin-bottom: 12px;">Victory36 leads overall mission strategy while Elite11 ensures performance standards</div>
                
                <div style="font-weight: 600; color: #50C878; margin-bottom: 8px;">🔍 Analysis & Insights</div>
                <div style="font-size: 12px; color: #bbb; margin-bottom: 12px;">Dr. Match identifies patterns while Professor Lee provides research context</div>
                
                <div style="font-weight: 600; color: #4ECDC4; margin-bottom: 8px;">💼 Executive Guidance</div>
                <div style="font-size: 12px; color: #bbb;">Dr. Lucy provides coaching and leadership perspective throughout execution</div>
              </div>
              
              <div style="background: rgba(255, 215, 0, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px;">
                <div style="font-size: 12px; color: #FFD700; font-weight: 600;">💡 Result:</div>
                <div style="font-size: 11px; color: #ddd; margin-top: 5px;">Coordinated AI expertise that exceeds the sum of individual capabilities</div>
              </div>
            </div>
          </div>
          
          <!-- Orchestration Controls -->
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2);">
            <h3 style="color: #FFD700; margin: 0 0 15px 0; font-size: 18px;">Orchestration Control</h3>
            
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; color: #ccc; margin-bottom: 8px;">Select Multiple Pilots for Orchestration:</div>
              <div id="orchestrationPilotList" style="max-height: 120px; overflow-y: auto;">
                ${this.pilots.map(pilot => `
                  <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;" 
                         onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                         onmouseout="this.style.background='transparent'">
                    <input type="checkbox" 
                           value="${pilot.id}" 
                           onchange="transcendentalLounge.toggleOrchestrationPilot('${pilot.id}')"
                           style="accent-color: ${pilot.hologramColor};">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${pilot.hologramColor}; display: flex; align-items: center; justify-content: center; color: #000; font-size: 10px; font-weight: bold;">
                      ${pilot.name.substring(0, 2)}
                    </div>
                    <span style="color: #ddd; font-size: 12px;">${pilot.name}</span>
                    <span style="color: ${pilot.hologramColor}; font-size: 10px; margin-left: auto;">${pilot.orchestrationRole}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px;">
              <div style="font-size: 12px; color: #ccc; margin-bottom: 10px;">Orchestration Actions:</div>
              
              <button onclick="transcendentalLounge.startOrchestration()" 
                      id="startOrchestrationBtn"
                      style="
                        width: 100%;
                        background: linear-gradient(135deg, #FFD700, #FFA500);
                        border: none;
                        color: #000;
                        padding: 10px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 8px;
                        transition: all 0.3s;
                      "
                      onmouseover="this.style.transform='translateY(-1px)'"
                      onmouseout="this.style.transform='translateY(0)'">
                🎼 Start Orchestration
              </button>
              
              <button onclick="transcendentalLounge.simulateOrchestration()" 
                      style="
                        width: 100%;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: #fff;
                        padding: 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.3s;
                      "
                      onmouseover="this.style.background='rgba(255,255,255,0.15)'"
                      onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                🔬 Simulate Orchestration
              </button>
            </div>
            
            <!-- Orchestration Status -->
            <div id="orchestrationStatus" style="
              margin-top: 15px;
              padding: 10px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 6px;
              border-left: 3px solid #666;
              font-size: 11px;
              color: #888;
            ">
              Select 2+ pilots to begin orchestration
            </div>
            
          </div>
        </div>
      </div>
    `;
  }
  
  createDomeArchitecture() {
    return encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
        <defs>
          <radialGradient id="domeGradient" cx="50%" cy="80%" r="60%">
            <stop offset="0%" style="stop-color:rgba(255,215,0,0.3);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgba(255,215,0,0.1);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(255,215,0,0.05);stop-opacity:1" />
          </radialGradient>
          <pattern id="ornatePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,215,0,0.2)" stroke-width="1"/>
            <circle cx="30" cy="30" r="15" fill="none" stroke="rgba(255,215,0,0.15)" stroke-width="1"/>
            <circle cx="30" cy="30" r="8" fill="rgba(255,215,0,0.1)"/>
            <path d="M30,5 L35,25 L30,30 L25,25 Z" fill="rgba(255,215,0,0.2)"/>
          </pattern>
        </defs>
        <ellipse cx="400" cy="250" rx="350" ry="180" fill="url(#domeGradient)"/>
        <rect width="800" height="300" fill="url(#ornatePattern)" opacity="0.6"/>
        <path d="M100,250 Q400,50 700,250" stroke="rgba(255,215,0,0.3)" stroke-width="2" fill="none"/>
        <path d="M150,260 Q400,80 650,260" stroke="rgba(255,215,0,0.2)" stroke-width="1" fill="none"/>
      </svg>
    `);
  }
  
  createColumnPattern() {
    return encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="400" viewBox="0 0 120 400">
        <defs>
          <linearGradient id="columnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(255,215,0,0.1);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgba(255,215,0,0.3);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(255,215,0,0.1);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="20" y="0" width="80" height="400" fill="url(#columnGradient)"/>
        <rect x="25" y="20" width="70" height="30" fill="rgba(255,215,0,0.2)"/>
        <rect x="25" y="350" width="70" height="30" fill="rgba(255,215,0,0.2)"/>
        <rect x="30" y="80" width="60" height="240" fill="rgba(255,215,0,0.1)"/>
        <!-- Ornate details -->
        <circle cx="60" cy="40" r="8" fill="rgba(255,215,0,0.3)"/>
        <circle cx="60" cy="360" r="8" fill="rgba(255,215,0,0.3)"/>
        <path d="M45,100 L75,100 M45,120 L75,120 M45,140 L75,140" stroke="rgba(255,215,0,0.2)" stroke-width="1"/>
      </svg>
    `);
  }
  
  createContainer() {
    const container = document.createElement('div');
    container.id = 'transcendentalLoungeContainer';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.95);
    `;
    
    document.body.appendChild(container);
    return container;
  }
