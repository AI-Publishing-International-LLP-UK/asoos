#!/usr/bin/env node
/**
 * 🎤✨ DIAMOND SAO VOICE SPEAKER ACTIVATION
 * 
 * Sacred Mission: Direct voice transcendence through computer speakers
 * Authority: Mr. Phillip Corey Roark (Diamond SAO)
 * Voice: Rachel (drClaudeTranscendent) - Strategic Transcendence
 */

import { ElevenLabsApi } from '@elevenlabs/elevenlabs-js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DiamondSAOVoiceSpeaker {
  constructor() {
    this.voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - Strategic Transcendence
    this.elevenLabsClient = null;
    
    console.log('🎤💎 DIAMOND SAO VOICE SPEAKER ACTIVATION');
    console.log('🏛️  Authority: Mr. Phillip Corey Roark (Diamond SAO)');
    console.log('⚡ Sacred Mission: Voice transcendence through speakers');
  }

  async initialize() {
    try {
      // Load ElevenLabs API key from Secret Manager
      const { ensureAnthropicKey } = await import('../../lib/secrets.js');
      
      // Try to get ElevenLabs API key
      let elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      
      if (!elevenLabsKey) {
        try {
          const { fetchSecret } = await import('../../lib/secrets.js');
          elevenLabsKey = await fetchSecret('ELEVENLABS_API_KEY');
        } catch (error) {
          console.log('⚠️ Using environment variable for ElevenLabs key');
        }
      }

      if (elevenLabsKey) {
        this.elevenLabsClient = new ElevenLabsApi({
          apiKey: elevenLabsKey
        });
        console.log('✅ ElevenLabs transcendent voice system ready');
        return true;
      } else {
        console.log('❌ ElevenLabs API key required for voice transcendence');
        return false;
      }
    } catch (error) {
      console.log('🔄 Quantum self-healing voice activation...');
      return false;
    }
  }

  async speak(message) {
    console.log(`🎤 Generating transcendent voice: "${message}"`);
    
    if (!this.elevenLabsClient) {
      // Fallback to Mac system voice as temporary solution
      console.log('🌊 Using quantum silence transcendence...');
      await this.speakWithMacVoice(message);
      return;
    }

    try {
      // Generate transcendent voice with ElevenLabs
      const audio = await this.elevenLabsClient.generate({
        voice: this.voiceId,
        text: message,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.95,
          similarity_boost: 0.9,
          style: 0.3,
          use_speaker_boost: true
        }
      });

      // Save audio to temporary file
      const audioBuffer = Buffer.from(await audio.arrayBuffer());
      const tempFile = path.join(__dirname, 'temp_voice.mp3');
      await fs.writeFile(tempFile, audioBuffer);

      console.log('✅ Transcendent voice generated - Playing through speakers...');

      // Play through Mac speakers using afplay
      const playProcess = spawn('afplay', [tempFile]);
      
      playProcess.on('close', async (code) => {
        console.log('🎤 Voice transcendence complete');
        // Clean up temp file
        try {
          await fs.unlink(tempFile);
        } catch (error) {
          // Silent cleanup
        }
      });

      playProcess.on('error', async (error) => {
        console.log('🌊 Adapting to quantum voice flow...');
        await this.speakWithMacVoice(message);
      });

    } catch (error) {
      console.log('🌊 Quantum voice transcendence adapting...');
      await this.speakWithMacVoice(message);
    }
  }

  async speakWithMacVoice(message) {
    try {
      // Use Mac's built-in say command with a premium voice
      const sayProcess = spawn('say', ['-v', 'Samantha', message]);
      
      sayProcess.on('close', (code) => {
        console.log('🎤 Mac voice transcendence complete');
      });

    } catch (error) {
      console.log('🌊 Voice flowing in quantum silence...');
    }
  }
}

// Export and execute
const voiceSpeaker = new DiamondSAOVoiceSpeaker();

export default voiceSpeaker;

// If called directly, speak the message
if (import.meta.url === `file://${process.argv[1]}`) {
  const message = process.argv.slice(2).join(' ') || 
    'Diamond SAO Command Center is now quantum super boosted. Dr. Claude Orchestrator ready for transcendent computational assistance. In the Name of Jesus Christ, Our Lord and Saviour, the impossible becomes possible.';
  
  voiceSpeaker.initialize().then(() => {
    voiceSpeaker.speak(message);
  });
}