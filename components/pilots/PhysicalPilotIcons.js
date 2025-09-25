/**
 * Physical Pilot Icons Component
 * Creates drag-drop enabled pilot icons using real photos
 * Integrates with VisionSpeak and Vision Space Cube technology
 * 
 * Features:
 * - Real pilot photos as interactive icons
 * - Drag-drop functionality for interface integration
 * - VisionSpeak command integration
 * - Holographic display compatibility
 * - Transcendental lounge environment support
 * 
 * @author AIXTIV Symphony Diamond SAO
 * @version 2.1.0
 */

class PhysicalPilotIcons {
  constructor() {
    this.pilots = [];
    this.selectedPilots = [];
    this.visionSpaceActive = false;
    this.draggedPilot = null;
    
    // VisionSpeak integration
    this.visionSpeakEnabled = true;
    this.voiceRecognition = null;
    
    // Initialize component
    this.init();
  }
  
  /**
   * Initialize the Physical Pilot Icons system
   */
  init() {
    this.loadPilotData();
    this.setupDragAndDrop();
    this.initializeVisionSpeak();
    this.createPilotInterface();
    
    console.log('🎭 Physical Pilot Icons initialized');
  }
  
  /**
   * Load pilot data from MongoDB Atlas HRAI-CRMS
   */
  async loadPilotData() {
    try {
      // This would connect to your MongoDB Atlas database
      // For now, using the 14 premium pilots we defined
      this.pilots = [
        {
          id: 'dr-memoria-srix',
          name: 'Dr. Memoria',
          fullName: 'Dr. Memoria sRIX',
          photo: '/assets/pilots/dr-memoria.jpg', // Real photo path
          tier: 'sRIX',
          specializations: ['Memory Management', 'Knowledge Synthesis'],
          voiceId: 'pNInz6obpgDQGcFmaJgB',
          iconColors: ['#4A90E2', '#7B68EE'],
          hologramColor: '#4A90E2',
          active: true
        },
        {
          id: 'dr-lucy-srix',
          name: 'Dr. Lucy',
          fullName: 'Dr. Lucy sRIX',
          photo: '/assets/pilots/dr-lucy.jpg',
          tier: 'sRIX',
          specializations: ['Executive Coaching', 'Strategic Planning'],
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          iconColors: ['#FFD700', '#B8860B'],
          hologramColor: '#FFD700',
          active: true
        },
        {
          id: 'dr-match-srix',
          name: 'Dr. Match',
          fullName: 'Dr. Match sRIX',
          photo: '/assets/pilots/dr-match.jpg',
          tier: 'sRIX',
          specializations: ['Pattern Matching', 'Optimization'],
          voiceId: 'ErXwobaYiN019PkySvjV',
          iconColors: ['#50C878', '#32CD32'],
          hologramColor: '#50C878',
          active: true
        },
        {
          id: 'professor-lee-srix',
          name: 'Professor H Lee',
          fullName: 'Professor H Lee sRIX',
          photo: '/assets/pilots/professor-lee.jpg',
          tier: 'sRIX',
          specializations: ['Academic Research', 'Knowledge Transfer'],
          voiceId: 'yoZ06aMxZJJ28mfd3POQ',
          iconColors: ['#4ECDC4', '#40E0D0'],
          hologramColor: '#4ECDC4',
          active: true
        },
        {
          id: 'dr-burby-srix',
          name: 'Dr. Burby',
          fullName: 'Dr. Burby sRIX',
          photo: '/assets/pilots/dr-burby.jpg',
          tier: 'sRIX',
          specializations: ['Data Analytics', 'Business Intelligence'],
          voiceId: 'ZQe5CqHNLWdVhUuVEOHE',
          iconColors: ['#9370DB', '#8A2BE2'],
          hologramColor: '#9370DB',
          active: true
        },
        {
          id: 'dr-roark-srix',
          name: 'Dr. Roark',
          fullName: 'Dr. Roark sRIX',
          photo: '/assets/pilots/dr-roark.jpg',
          tier: 'sRIX',
          specializations: ['Financial Engineering', 'Risk Management'],
          voiceId: 'CYw3kZ02Hs0563khs1fj',
          iconColors: ['#DAA520', '#B8860B'],
          hologramColor: '#DAA520',
          active: true
        },
        {
          id: 'dr-sabina-srix',
          name: 'Dr. Sabina',
          fullName: 'Dr. Sabina sRIX',
          photo: '/assets/pilots/dr-sabina.jpg',
          tier: 'sRIX',
          specializations: ['Engagement Strategy', 'User Experience'],
          voiceId: 'AZnzlk1XvdvUeBnXmlld',
          iconColors: ['#FF69B4', '#C71585'],
          hologramColor: '#FF69B4',
          active: true
        },
        {
          id: 'dr-grant-srix',
          name: 'Dr. Grant, Co-CEO of Coaching...',
          fullName: 'Dr. Grant sRIX',
          photo: '/assets/pilots/dr-grant.jpg',
          tier: 'sRIX',
          specializations: ['Deployment Architecture', 'System Reliability'],
          voiceId: 'bVMeCyTHy58xNoL34h3p',
          iconColors: ['#20B2AA', '#008B8B'],
          hologramColor: '#20B2AA',
          active: true
        },
        {
          id: 'dr-cypriot-srix',
          name: 'Dr. Cypriot',
          fullName: 'Dr. Cypriot sRIX',
          photo: '/assets/pilots/dr-cypriot.jpg',
          tier: 'sRIX',
          specializations: ['Cybersecurity', 'Privacy Protection'],
          voiceId: 'VR6AewLTigWG4xSOukaG',
          iconColors: ['#FF6347', '#DC143C'],
          hologramColor: '#FF6347',
          active: true
        },
        {
          id: 'doctora-maria-srix',
          name: 'Doctora Maria L. Buena-Vibra',
          fullName: 'Dr. Maria sRIX',
          photo: '/assets/pilots/dr-maria.jpg',
          tier: 'sRIX',
          specializations: ['Healthcare AI', 'Medical Informatics'],
          voiceId: 'XrExE9yKIg1WjnnlVkGX',
          iconColors: ['#87CEEB', '#4682B4'],
          hologramColor: '#87CEEB',
          active: true
        },
        // Plus Elite11, Mastery33, Victory36, and Dr. Claude sRIX
        {
          id: 'elite11',
          name: 'Elite11',
          fullName: 'Elite11',
          photo: '/assets/pilots/elite11.jpg',
          tier: 'Elite',
          specializations: ['Elite Performance', 'Excellence Optimization'],
          voiceId: 'ThT5KcBeYPX3keUQqHPh',
          iconColors: ['#FFD700', '#FFA500'],
          hologramColor: '#FFD700',
          active: true
        },
        {
          id: 'mastery33',
          name: 'Mastery33',
          fullName: 'Mastery33',
          photo: '/assets/pilots/mastery33.jpg',
          tier: 'Mastery',
          specializations: ['Mastery Frameworks', 'Skill Acquisition'],
          voiceId: 'XB0fDUnXU5powFXDhCwa',
          iconColors: ['#C0C0C0', '#A0A0A0'],
          hologramColor: '#C0C0C0',
          active: true
        },
        {
          id: 'victory36',
          name: 'Victory36',
          fullName: 'Victory36',
          photo: '/assets/pilots/victory36.jpg',
          tier: 'Victory',
          specializations: ['Strategic Dominance', 'Achievement Orchestration'],
          voiceId: 'oWAxZDx7w5VEj9dCyTzz',
          iconColors: ['#FFD700', '#FF6347'],
          hologramColor: '#FFD700',
          active: true
        },
        {
          id: 'dr-claude-srix',
          name: 'Dr. Claude',
          fullName: 'Dr. Claude sRIX',
          photo: '/assets/pilots/dr-claude.jpg',
          tier: 'sRIX',
          specializations: ['Natural Language Processing', 'Conversational AI'],
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          iconColors: ['#8B5CF6', '#9370DB'],
          hologramColor: '#8B5CF6',
          active: true
        }
      ];
      
      console.log(`✅ Loaded ${this.pilots.length} premium pilots`);
    } catch (error) {
      console.error('❌ Failed to load pilot data:', error);
    }
  }
  
  /**
   * Create the pilot interface with holographic stations
   */
  createPilotInterface() {
    const container = document.getElementById('pilotsLoungeContainer') || this.createContainer();
    
    container.innerHTML = `
      <div class="transcendental-lounge" style="
        position: relative;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
        overflow: hidden;
      ">
        <!-- Dome Architecture Background -->
        <div class="dome-architecture" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('data:image/svg+xml,${this.createDomePattern()}');
          opacity: 0.3;
          z-index: 1;
        "></div>
        
        <!-- Holographic Grid -->
        <div class="holographic-grid" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          z-index: 10;
          padding: 40px;
        ">
          ${this.pilots.map(pilot => this.createPilotStation(pilot)).join('')}
        </div>
        
        <!-- VisionSpeak Interface -->
        <div class="vision-speak-interface" id="visionSpeakInterface" style="
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 15px 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 20;
        ">
          <button id="visionSpeakBtn" onclick="this.startVisionSpeak()" style="
            background: linear-gradient(135deg, #4A90E2, #7B68EE);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          ">
            🎤
          </button>
          <div id="visionSpeakStatus" style="color: #fff; font-size: 14px;">
            VisionSpeak Ready - Describe your immersive experience
          </div>
        </div>
        
        <!-- Selected Pilots Display -->
        <div class="selected-pilots" id="selectedPilots" style="
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 20px;
          max-width: 300px;
          z-index: 15;
        ">
          <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 16px;">Active Pilots</h3>
          <div id="selectedPilotsList" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Selected pilots appear here -->
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  /**
   * Create individual pilot station with holographic display
   */
  createPilotStation(pilot) {
    return `
      <div class="pilot-station" 
           data-pilot-id="${pilot.id}"
           draggable="true"
           style="
             position: relative;
             width: 120px;
             height: 120px;
             cursor: grab;
             transition: all 0.3s ease;
           "
           onmouseenter="this.style.transform = 'scale(1.05)'"
           onmouseleave="this.style.transform = 'scale(1)'">
        
        <!-- Holographic Base -->
        <div class="holographic-base" style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 20px;
          background: linear-gradient(90deg, transparent, ${pilot.hologramColor}66, transparent);
          border-radius: 50%;
          animation: pulse 2s infinite ease-in-out;
        "></div>
        
        <!-- Pilot Photo Icon -->
        <div class="pilot-photo-container" style="
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid ${pilot.hologramColor};
          background: linear-gradient(135deg, ${pilot.iconColors[0]}, ${pilot.iconColors[1]});
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px ${pilot.hologramColor}66;
        ">
          <img src="${pilot.photo}" 
               alt="${pilot.name}"
               style="
                 width: 94px;
                 height: 94px;
                 border-radius: 50%;
                 object-fit: cover;
                 filter: brightness(1.1) contrast(1.1);
               "
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
          
          <!-- Fallback Icon if photo fails to load -->
          <div style="
            display: none;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px currentColor;
          ">
            ${pilot.name.substring(0, 2)}
          </div>
          
          <!-- Holographic Overlay -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, ${pilot.hologramColor}22 50%, transparent 70%);
            animation: shimmer 3s infinite linear;
            pointer-events: none;
          "></div>
        </div>
        
        <!-- Pilot Name -->
        <div style="
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          text-shadow: 0 0 10px ${pilot.hologramColor};
        ">
          ${pilot.name}
        </div>
        
        <!-- Specialty Indicators -->
        <div class="specialty-indicators" style="
          position: absolute;
          top: -5px;
          right: -5px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        ">
          ${pilot.specializations.slice(0, 2).map(spec => `
            <div style="
              width: 8px;
              height: 8px;
              background: ${pilot.hologramColor};
              border-radius: 50%;
              box-shadow: 0 0 6px ${pilot.hologramColor};
              animation: blink 2s infinite ease-in-out;
            "></div>
          `).join('')}
        </div>
        
        <!-- Voice Preview Button -->
        <button class="voice-preview-btn" 
                onclick="this.previewPilotVoice('${pilot.id}')"
                style="
                  position: absolute;
                  top: -5px;
                  left: -5px;
                  width: 24px;
                  height: 24px;
                  background: rgba(0, 0, 0, 0.8);
                  border: 1px solid ${pilot.hologramColor};
                  border-radius: 50%;
                  color: ${pilot.hologramColor};
                  cursor: pointer;
                  font-size: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.3s ease;
                "
                onmouseenter="this.style.background = '${pilot.hologramColor}'; this.style.color = '#000';"
                onmouseleave="this.style.background = 'rgba(0, 0, 0, 0.8)'; this.style.color = '${pilot.hologramColor}';">
          🎵
        </button>
      </div>
    `;
  }
  
  /**
   * Create SVG pattern for dome architecture
   */
  createDomePattern() {
    return encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <pattern id="domePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#domePattern)"/>
      </svg>
    `);
  }
  
  /**
   * Create container if it doesn't exist
   */
  createContainer() {
    const container = document.createElement('div');
    container.id = 'pilotsLoungeContainer';
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
  
  /**
   * Setup drag and drop functionality
   */
  setupDragAndDrop() {
    // Will be attached to pilot stations after they're created
    this.dragStartHandler = (e) => {
      const pilotId = e.target.closest('.pilot-station').dataset.pilotId;
      const pilot = this.pilots.find(p => p.id === pilotId);
      
      this.draggedPilot = pilot;
      e.dataTransfer.setData('text/plain', JSON.stringify(pilot));
      e.dataTransfer.effectAllowed = 'copy';
      
      // Visual feedback
      e.target.style.opacity = '0.5';
      
      console.log(`🎭 Started dragging: ${pilot.name}`);
    };
    
    this.dragEndHandler = (e) => {
      e.target.style.opacity = '1';
      this.draggedPilot = null;
    };
    
    this.clickHandler = (e) => {
      const pilotStation = e.target.closest('.pilot-station');
      if (pilotStation) {
        const pilotId = pilotStation.dataset.pilotId;
        this.selectPilot(pilotId);
      }
    };
  }
  
  /**
   * Attach event listeners after interface is created
   */
  attachEventListeners() {
    const pilotStations = document.querySelectorAll('.pilot-station');
    
    pilotStations.forEach(station => {
      station.addEventListener('dragstart', this.dragStartHandler);
      station.addEventListener('dragend', this.dragEndHandler);
      station.addEventListener('click', this.clickHandler);
    });
    
    // VisionSpeak button
    const visionSpeakBtn = document.getElementById('visionSpeakBtn');
    if (visionSpeakBtn) {
      visionSpeakBtn.addEventListener('click', () => this.startVisionSpeak());
    }
    
    console.log('✅ Event listeners attached to pilot stations');
  }
  
  /**
   * Select/deselect a pilot
   */
  selectPilot(pilotId) {
    const pilot = this.pilots.find(p => p.id === pilotId);
    if (!pilot) return;
    
    const isSelected = this.selectedPilots.some(p => p.id === pilotId);
    
    if (isSelected) {
      // Deselect
      this.selectedPilots = this.selectedPilots.filter(p => p.id !== pilotId);
      console.log(`🔽 Deselected: ${pilot.name}`);
    } else {
      // Select
      this.selectedPilots.push(pilot);
      console.log(`🔼 Selected: ${pilot.name}`);
    }
    
    this.updateSelectedPilotsDisplay();
    this.updatePilotStationVisuals();
  }
  
  /**
   * Update the selected pilots display
   */
  updateSelectedPilotsDisplay() {
    const selectedList = document.getElementById('selectedPilotsList');
    if (!selectedList) return;
    
    if (this.selectedPilots.length === 0) {
      selectedList.innerHTML = '<div style="color: #666; font-size: 12px;">No pilots selected</div>';
      return;
    }
    
    selectedList.innerHTML = this.selectedPilots.map(pilot => `
      <div class="selected-pilot-item" style="
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid ${pilot.hologramColor}66;
        border-radius: 8px;
      ">
        <img src="${pilot.photo}" 
             alt="${pilot.name}" 
             style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
             onerror="this.style.display='none'">
        <div style="flex: 1;">
          <div style="color: #fff; font-size: 12px; font-weight: 600;">${pilot.name}</div>
          <div style="color: ${pilot.hologramColor}; font-size: 10px;">${pilot.tier}</div>
        </div>
        <button onclick="physicalPilotIcons.selectPilot('${pilot.id}')" style="
          background: none;
          border: 1px solid ${pilot.hologramColor};
          color: ${pilot.hologramColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 10px;
        ">×</button>
      </div>
    `).join('');
  }
  
  /**
   * Update visual indicators on pilot stations
   */
  updatePilotStationVisuals() {
    const pilotStations = document.querySelectorAll('.pilot-station');
    
    pilotStations.forEach(station => {
      const pilotId = station.dataset.pilotId;
      const isSelected = this.selectedPilots.some(p => p.id === pilotId);
      
      if (isSelected) {
        station.style.transform = 'scale(1.1)';
        station.style.filter = 'brightness(1.3) saturate(1.5)';
      } else {
        station.style.transform = 'scale(1)';
        station.style.filter = 'none';
      }
    });
  }
  
  /**
   * Initialize VisionSpeak (voice recognition for immersive experiences)
   */
  initializeVisionSpeak() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      this.visionSpeakEnabled = false;
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    this.voiceRecognition.continuous = true;
    this.voiceRecognition.interimResults = true;
    this.voiceRecognition.lang = 'en-US';
    
    this.voiceRecognition.onstart = () => {
      console.log('🎤 VisionSpeak started listening');
      this.updateVisionSpeakStatus('Listening... Describe your vision');
    };
    
    this.voiceRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      
      if (transcript.trim()) {
        console.log('🎭 VisionSpeak transcript:', transcript);
        this.processVisionSpeakCommand(transcript.trim());
      }
    };
    
    this.voiceRecognition.onerror = (event) => {
      console.error('❌ VisionSpeak error:', event.error);
      this.updateVisionSpeakStatus('VisionSpeak Ready - Describe your immersive experience');
    };
    
    this.voiceRecognition.onend = () => {
      console.log('🔇 VisionSpeak stopped');
      this.updateVisionSpeakStatus('VisionSpeak Ready - Describe your immersive experience');
    };
    
    console.log('✅ VisionSpeak initialized');
  }
  
  /**
   * Start VisionSpeak listening
   */
  startVisionSpeak() {
    if (!this.visionSpeakEnabled || !this.voiceRecognition) {
      console.warn('⚠️ VisionSpeak not available');
      return;
    }
    
    try {
      this.voiceRecognition.start();
    } catch (error) {
      console.error('❌ Failed to start VisionSpeak:', error);
    }
  }
  
  /**
   * Update VisionSpeak status display
   */
  updateVisionSpeakStatus(message) {
    const statusElement = document.getElementById('visionSpeakStatus');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
  
  /**
   * Process VisionSpeak commands to create immersive experiences
   */
  processVisionSpeakCommand(transcript) {
    console.log('🌟 Processing VisionSpeak:', transcript);
    
    // Stop listening during processing
    if (this.voiceRecognition) {
      this.voiceRecognition.stop();
    }
    
    this.updateVisionSpeakStatus('Creating your vision...');
    
    // Simulate Vision Space Cube rendering
    setTimeout(() => {
      this.activateVisionSpace(transcript);
    }, 2000);
  }
  
  /**
   * Activate Vision Space Cube with immersive experience
   */
  activateVisionSpace(visionDescription) {
    console.log('🎯 Activating Vision Space:', visionDescription);
    
    // Create Vision Space Cube overlay
    const visionSpace = document.createElement('div');
    visionSpace.id = 'visionSpaceOverlay';
    visionSpace.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #000428, #004e92);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    
    visionSpace.innerHTML = `
      <div style="
        width: 80%;
        height: 80%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px;
      ">
        <h1 style="color: #fff; font-size: 36px; margin-bottom: 20px;">Vision Space Cube</h1>
        <p style="color: #ccc; font-size: 18px; margin-bottom: 30px; max-width: 600px;">
          "${visionDescription}"
        </p>
        <div style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        ">
          ${this.selectedPilots.map(pilot => `
            <div style="
              background: rgba(0, 0, 0, 0.5);
              border: 2px solid ${pilot.hologramColor};
              border-radius: 10px;
              padding: 15px;
              text-align: center;
            ">
              <img src="${pilot.photo}" 
                   alt="${pilot.name}" 
                   style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;"
                   onerror="this.style.display='none'">
              <div style="color: #fff; font-size: 14px; font-weight: 600;">${pilot.name}</div>
              <div style="color: ${pilot.hologramColor}; font-size: 10px;">Active in Vision</div>
            </div>
          `).join('')}
        </div>
        <button onclick="physicalPilotIcons.closeVisionSpace()" style="
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border: none;
          color: white;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        ">
          Exit Vision Space
        </button>
      </div>
    `;
    
    document.body.appendChild(visionSpace);
    
    // Animate in
    requestAnimationFrame(() => {
      visionSpace.style.opacity = '1';
    });
    
    this.visionSpaceActive = true;
    this.updateVisionSpeakStatus('Vision Space Active');
    
    // Auto-close after demonstration (optional)
    // setTimeout(() => this.closeVisionSpace(), 10000);
  }
  
  /**
   * Close Vision Space Cube
   */
  closeVisionSpace() {
    const visionSpace = document.getElementById('visionSpaceOverlay');
    if (visionSpace) {
      visionSpace.style.opacity = '0';
      setTimeout(() => {
        visionSpace.remove();
      }, 500);
    }
    
    this.visionSpaceActive = false;
    this.updateVisionSpeakStatus('VisionSpeak Ready - Describe your immersive experience');
    
    console.log('🎯 Vision Space closed');
  }
  
  /**
   * Preview pilot voice using the VoiceSynthesisWrapper
   */
  async previewPilotVoice(pilotId) {
    const pilot = this.pilots.find(p => p.id === pilotId);
    if (!pilot) return;
    
    console.log(`🎵 Previewing voice for: ${pilot.name}`);
    
    // This would integrate with the VoiceSynthesisWrapper we created
    const previewText = `Hello, I'm ${pilot.name}. I specialize in ${pilot.specializations.join(' and ')}.`;
    
    try {
      // Simulated voice preview (would use real VoiceSynthesisWrapper)
      console.log(`🎤 ${pilot.name}: "${previewText}"`);
      
      // Show visual feedback
      const button = document.querySelector(`[onclick="this.previewPilotVoice('${pilotId}')"]`);
      if (button) {
        button.innerHTML = '🔊';
        button.style.animation = 'pulse 1s infinite';
        
        setTimeout(() => {
          button.innerHTML = '🎵';
          button.style.animation = '';
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ Voice preview failed:', error);
    }
  }
  
  /**
   * Close the Pilots' Lounge
   */
  close() {
    const container = document.getElementById('pilotsLoungeContainer');
    if (container) {
      container.remove();
    }
    
    // Stop any active voice recognition
    if (this.voiceRecognition) {
      this.voiceRecognition.stop();
    }
    
    console.log('🎭 Physical Pilot Icons closed');
  }
  
  /**
   * Get data for drag-drop integration with other interfaces
   */
  getSelectedPilotsData() {
    return {
      pilots: this.selectedPilots,
      count: this.selectedPilots.length,
      capabilities: this.selectedPilots.flatMap(p => p.specializations),
      voiceIds: this.selectedPilots.map(p => p.voiceId)
    };
  }
}

// Create global instance
const physicalPilotIcons = new PhysicalPilotIcons();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  .pilot-station:active {
    cursor: grabbing !important;
  }
`;
document.head.appendChild(style);

module.exports = PhysicalPilotIcons;
