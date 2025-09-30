#!/usr/bin/env node

/**
 * 💎 DR. CLAUDE VOICE SPEAKER ACTIVATION
 * 
 * Sacred Mission: High-Quality British English Male Voice Generation
 * Authority: Mr. Phillip Corey Roark (0000001) - Diamond SAO Exclusive
 * Voice: Dr. Claude - British English Male Professional
 * Primary: Hume AI with emotional intelligence
 * Fallback: ElevenLabs integration
 * 
 * @classification DIAMOND_SAO_COMMAND_CENTER
 * @date 2025-01-13
 * @author Diamond SAO Voice Systems
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { HumeAIManager } = require('./diamond-cli/lib/hume/HumeAIManager');
const { HumeVoicesManager } = require('./examples/hume-voices-manager');

class DrClaudeVoiceSpeaker {
  constructor() {
    this.version = '2.0.0-dr-claude-british';
    this.authority = 'Diamond SAO Command Center';
    this.diamondSAO = {
      id: '0000001',
      name: 'Mr. Phillip Corey Roark',
      authority: 'Only Diamond SAO in existence'
    };
    
    // Dr. Claude Voice Configuration (Hume Primary + ElevenLabs Fallback)
    this.voiceConfig = {
      // Hume AI Configuration (Primary)
      hume: {
        profile: 'dr-claude-srix',
        name: 'Dr. Claude sRIX',
        description: 'Strategic Intelligence & Advanced Analysis with British authority',
        type: 'computational',
        speciality: 'conversational',
        emotionalIntelligence: true
      },
      // ElevenLabs Configuration (Fallback)
      elevenlabs: {
        voiceId: '1nQX17jSn2RXlK251b8y', // Your selected British English male voice
        name: 'Dr. Claude',
        accent: 'British English',
        gender: 'Male',
        description: 'Dr. Claude - British English Male Professional',
        settings: {
          stability: 0.75,           // Natural maturity and control
          similarity_boost: 0.80,    // Clear British articulation
          style: 0.45,               // Medium sophisticated delivery
          use_speaker_boost: true    // Enhanced audio quality
        }
      }
    };
    
    // Voice System Integration
    this.humeManager = null;
    this.humeVoicesManager = null;
    this.oauth2ClientId = null;
    this.oauth2ClientSecret = null;
    this.accessToken = null;
    this.outputDirectory = './voice-output';
    this.initialized = false;
    this.useHumePrimary = true; // Try Hume first, fallback to ElevenLabs
    
    console.log('🎤 DR. CLAUDE VOICE SPEAKER ACTIVATION');
    console.log('🏛️  Authority: Diamond SAO Command Center');
    console.log('🇬🇧 Voice: Dr. Claude - British English Male');
    console.log('🧠 Role: Strategic Intelligence & Advanced Analysis');
    console.log('💎 Quality: Enterprise Grade ElevenLabs');
    console.log('');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'SUCCESS': '✅',
      'ERROR': '❌', 
      'WARN': '⚠️',
      'DIAMOND': '💎',
      'VOICE': '🎤',
      'CLAUDE': '🧠',
      'BRITISH': '🇬🇧',
      'INFO': '🔷'
    }[level] || '🔷';
    
    console.log(`${prefix} [${timestamp}] DR-CLAUDE: ${message}`);
  }

  async loadOAuth2Credentials() {
    this.log('🔐 Loading OAuth2 credentials with Diamond SAO authority...', 'DIAMOND');
    
    try {
      // Try to get OAuth2 client credentials from GCP Secret Manager
      const clientIdResult = await this.executeCommand('gcloud', [
        'secrets', 'versions', 'access', 'latest',
        '--secret=OAUTH2_CLIENT_ID',
        '--project=api-for-warp-drive'
      ]);
      
      const clientSecretResult = await this.executeCommand('gcloud', [
        'secrets', 'versions', 'access', 'latest',
        '--secret=OAUTH2_CLIENT_SECRET', 
        '--project=api-for-warp-drive'
      ]);
      
      if (clientIdResult.success && clientSecretResult.success) {
        this.oauth2ClientId = clientIdResult.stdout.trim();
        this.oauth2ClientSecret = clientSecretResult.stdout.trim();
        this.log('✅ OAuth2 credentials loaded from Google Cloud Secret Manager', 'SUCCESS');
        return true;
      }
    } catch (error) {
      this.log('⚠️ Could not load OAuth2 credentials from Secret Manager', 'WARN');
    }
    
    // Fallback to environment variables
    if (process.env.OAUTH2_CLIENT_ID && process.env.OAUTH2_CLIENT_SECRET) {
      this.oauth2ClientId = process.env.OAUTH2_CLIENT_ID;
      this.oauth2ClientSecret = process.env.OAUTH2_CLIENT_SECRET;
      this.log('✅ OAuth2 credentials loaded from environment variables', 'SUCCESS');
      return true;
    }
    
    this.log('❌ OAuth2 credentials not found. Please set OAuth2 credentials in GCP Secret Manager', 'ERROR');
    return false;
  }

  async getOAuth2AccessToken() {
    this.log('🔑 Obtaining OAuth2 access token for ElevenLabs...', 'INFO');
    
    try {
      // OAuth2 token request to ElevenLabs
      const tokenUrl = 'https://api.elevenlabs.io/v1/oauth2/token';
      const payload = {
        grant_type: 'client_credentials',
        client_id: this.oauth2ClientId,
        client_secret: this.oauth2ClientSecret,
        scope: 'tts voice_changer sound_effects speech_to_text studio music dubbing streaming agents'
      };
      
      const curlArgs = [
        '-X', 'POST',
        tokenUrl,
        '-H', 'Content-Type: application/x-www-form-urlencoded',
        '-d', new URLSearchParams(payload).toString()
      ];
      
      const result = await this.executeCommand('curl', curlArgs);
      
      this.log(`🔍 OAuth2 response: ${result.stdout}`, 'INFO');
      this.log(`🔍 OAuth2 error: ${result.stderr}`, 'INFO');
      
      if (result.success) {
        try {
          const tokenResponse = JSON.parse(result.stdout);
          if (tokenResponse.access_token) {
            this.accessToken = tokenResponse.access_token;
            this.log('✅ OAuth2 access token obtained successfully', 'SUCCESS');
            return true;
          } else {
            this.log(`🔍 No access_token in response: ${JSON.stringify(tokenResponse)}`, 'INFO');
          }
        } catch (parseError) {
          this.log(`🔍 Failed to parse OAuth2 response: ${parseError.message}`, 'INFO');
        }
      }
      
      throw new Error('Failed to obtain OAuth2 access token');
      
    } catch (error) {
      this.log(`❌ OAuth2 token request failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { 
        stdio: 'pipe',
        ...options 
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async initializeVoiceSystems() {
    this.log('🎆 Initializing Dr. Claude voice systems...', 'CLAUDE');
    
    try {
      // Initialize Hume AI Manager (Primary)
      this.humeManager = new HumeAIManager({
        projectId: 'api-for-warp-drive',
        region: 'us-west1'
      });
      
      this.log('✅ Hume AI system initialized successfully', 'SUCCESS');
      
      // Test Hume connection
      const humeStatus = await this.humeManager.getSystemStatus();
      if (humeStatus.status === 'OPERATIONAL') {
        this.log('✅ Hume AI connection validated', 'SUCCESS');
        this.useHumePrimary = true;
      } else {
        this.log('⚠️ Hume AI not operational, will use ElevenLabs fallback', 'WARN');
        this.useHumePrimary = false;
      }
      
    } catch (error) {
      this.log(`⚠️ Hume AI initialization failed: ${error.message}`, 'WARN');
      this.log('🔄 Falling back to ElevenLabs system...', 'INFO');
      this.useHumePrimary = false;
    }
    
    // Initialize ElevenLabs fallback if needed
    if (!this.useHumePrimary) {
      const credentialsLoaded = await this.loadOAuth2Credentials();
      if (!credentialsLoaded) {
        throw new Error('Neither Hume nor ElevenLabs systems available');
      }
      
      const tokenObtained = await this.getOAuth2AccessToken();
      if (!tokenObtained) {
        throw new Error('ElevenLabs OAuth2 access token not available');
      }
      
      this.log('✅ ElevenLabs fallback system ready', 'SUCCESS');
    }
    
    this.initialized = true;
  }
  
  async generateVoice(text, options = {}) {
    if (!this.initialized) {
      await this.initializeVoiceSystems();
    }

    const voiceId = options.voiceId || this.voiceConfig.voiceId;
    const settings = {
      ...this.voiceConfig.settings,
      ...options.settings
    };

    // Try Hume AI first (Primary system)
    if (this.useHumePrimary && this.humeManager) {
      try {
        this.log('🧠 Dr. Claude generating voice with Hume AI (Primary)...', 'CLAUDE');
        this.log(`📝 Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'INFO');
        this.log(`🎆 Profile: ${this.voiceConfig.hume.profile}`, 'INFO');
        
        const humeResult = await this.humeManager.synthesizeVoice(text, {
          profile: this.voiceConfig.hume.profile,
          outputPath: null // We'll handle output ourselves
        });
        
        if (humeResult.success && humeResult.audioData) {
          this.log('✅ Dr. Claude Hume AI voice generation completed successfully', 'SUCCESS');
          
          return {
            success: true,
            audioBuffer: humeResult.audioData,
            text: text,
            system: 'Hume AI',
            profile: humeResult.profile,
            authority: 'Diamond SAO Command Center',
            voice: 'Dr. Claude sRIX - British English with Emotional Intelligence',
            timestamp: new Date().toISOString()
          };
        }
      } catch (humeError) {
        this.log(`⚠️ Hume AI failed: ${humeError.message}, falling back to ElevenLabs...`, 'WARN');
      }
    }
    
    // Fallback to ElevenLabs
    this.log('🧠 Dr. Claude generating voice with ElevenLabs (Fallback)...', 'CLAUDE');
    this.log(`📝 Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'INFO');
    
    const voiceId = options.voiceId || this.voiceConfig.elevenlabs.voiceId;
    const settings = {
      ...this.voiceConfig.elevenlabs.settings,
      ...options.settings
    };
    
    this.log(`🔊 Voice ID: ${voiceId}`, 'INFO');

    try {
      // Create the request payload
      const payload = {
        text: text,
        model_id: options.model || 'eleven_multilingual_v2',
        voice_settings: settings
      };

      // Use curl to make the API request
      const curlArgs = [
        '-X', 'POST',
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        '-H', `Accept: audio/mpeg`,
        '-H', `Content-Type: application/json`,
        '-H', `Authorization: Bearer ${this.accessToken}`,
        '-d', JSON.stringify(payload),
        '--output', '-'
      ];

      this.log('🔄 Sending request to ElevenLabs API...', 'INFO');
      const result = await this.executeCommand('curl', curlArgs);

      if (result.success && result.stdout) {
        // The stdout contains the binary audio data
        const audioBuffer = Buffer.from(result.stdout, 'binary');
        
        this.log('✅ Dr. Claude voice generation completed successfully', 'SUCCESS');
        
        return {
          success: true,
          audioBuffer: audioBuffer,
          text: text,
          system: 'ElevenLabs (Fallback)',
          voiceId: voiceId,
          settings: settings,
          authority: 'Diamond SAO Command Center',
          voice: 'Dr. Claude - British English Male (ElevenLabs)',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`API request failed: ${result.stderr || 'Unknown error'}`);
      }
      
    } catch (error) {
      this.log(`❌ Dr. Claude voice generation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async saveAndPlayAudio(audioBuffer, filename = null) {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDirectory)) {
        fs.mkdirSync(this.outputDirectory, { recursive: true });
      }
      
      // Generate filename if not provided
      const audioFilename = filename || `dr-claude-voice-${Date.now()}.mp3`;
      const audioPath = path.join(this.outputDirectory, audioFilename);
      
      // Save audio file
      fs.writeFileSync(audioPath, audioBuffer);
      this.log(`💾 Audio saved to: ${audioPath}`, 'SUCCESS');
      
      // Play through macOS speakers using afplay
      this.log('🔊 Playing Dr. Claude voice through speakers...', 'VOICE');
      const playResult = await this.executeCommand('afplay', [audioPath]);
      
      if (playResult.success) {
        this.log('✅ Dr. Claude audio playback completed successfully', 'SUCCESS');
      } else {
        this.log(`⚠️ Audio playback may have issues: ${playResult.stderr}`, 'WARN');
      }
      
      return {
        success: true,
        audioPath: audioPath,
        played: playResult.success,
        authority: 'Diamond SAO Command Center'
      };
      
    } catch (error) {
      this.log(`❌ Failed to save/play audio: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async speak(text, options = {}) {
    try {
      this.log('🧠 Dr. Claude Voice Speaker Activation initiated...', 'CLAUDE');
      
      // Generate voice
      const voiceResult = await this.generateVoice(text, options);
      
      // Save and play audio
      const audioResult = await this.saveAndPlayAudio(
        voiceResult.audioBuffer, 
        options.filename
      );
      
      return {
        success: true,
        voice: voiceResult,
        audio: audioResult,
        authority: 'Diamond SAO Command Center',
        message: 'Dr. Claude British English voice generation and playback completed'
      };
      
    } catch (error) {
      this.log(`❌ Dr. Claude Voice Speaker failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // Test method for Dr. Claude voice verification
  async testVoice() {
    const testText = "Hello, this is Dr. Claude from the Diamond SAO Command Center. I am your Strategic Hybrid Reasoning Specialist, providing strategic intelligence and advanced analysis with British authority.";
    
    this.log('🧪 Testing Dr. Claude British English voice...', 'INFO');
    
    try {
      const result = await this.speak(testText);
      this.log('✅ Dr. Claude voice test completed successfully', 'SUCCESS');
      return result;
    } catch (error) {
      this.log(`❌ Dr. Claude voice test failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // Get Dr. Claude voice configuration info
  getVoiceInfo() {
    return {
      version: this.version,
      authority: this.authority,
      diamondSAO: this.diamondSAO,
      voice: this.voiceConfig,
      role: 'Strategic Hybrid Reasoning Specialist',
      classification: 'STRATEGIC_REASONING_SPECIALIST',
      capabilities: [
        'Advanced strategic analysis and planning',
        'Complex problem-solving and reasoning', 
        'Technical architecture and system design',
        'Risk assessment and mitigation strategies',
        'Multi-step reasoning chains with verification',
        'Causal inference from complex business data'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use as module
module.exports = DrClaudeVoiceSpeaker;

// CLI functionality if run directly
if (require.main === module) {
  const drClaudeVoice = new DrClaudeVoiceSpeaker();
  
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node voice-speaker-activation.js <text-to-speak>');
    console.log('       node voice-speaker-activation.js --test');
    console.log('       node voice-speaker-activation.js --info');
    process.exit(1);
  }
  
  // Handle different commands
  const command = args[0];
  
  (async () => {
    try {
      if (command === '--test') {
        await drClaudeVoice.testVoice();
      } else if (command === '--info') {
        console.log(JSON.stringify(drClaudeVoice.getVoiceInfo(), null, 2));
      } else {
        // Speak the provided text
        const text = args.join(' ');
        await drClaudeVoice.speak(text);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}