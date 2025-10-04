/**
 * Claude Voice Configuration Module
 * Integrates Hume emotional processing with ElevenLabs voice synthesis
 * Ensures all Claude agents use voice "Vee" with full computational capabilities
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Voice configuration
// Voice configuration already defined in this file

class ClaudeVoiceConfig {
  constructor() {
    // Initialize voice configuration
    this.initializeVoice();
  }
  
  async initializeVoice() {
    try {
      // Initialize with default config, will be populated by getVoiceConfig
      this.voiceConfig = { voice_id: 'Vee', backup_voice_id: 'Adam' };
    } catch (error) {
      console.error('Failed to initialize voice config:', error);
      this.voiceConfig = { voice_id: 'Vee', backup_voice_id: 'Adam' };
    }
    this.secretClient = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'api-for-warp-drive';
    this.config = null;
    this.lastRefresh = null;
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get voice configuration from Secret Manager
   */
  async getVoiceConfig() {
    try {
      if (this.config && this.lastRefresh && 
          (Date.now() - this.lastRefresh < this.refreshInterval)) {
        return this.config;
      }

      const name = `projects/${this.projectId}/secrets/ELEVENLABS_DEFAULT_VOICE_ID/versions/latest`;
      const [version] = await this.secretClient.accessSecretVersion({ name });
      
      const secretData = version.payload.data.toString();
      const secretConfig = JSON.parse(secretData);

      this.config = {
        // Primary voice configuration
        voice_id: secretConfig.voice_id || 'Vee',
        backup_voice_id: secretConfig.backup_voice_id || 'Adam',
        
        // Synthesis engine configuration
        synthesis_engine: 'hume_elevenlabs_hybrid',
        emotional_processing: true,
        computational_voice: true,
        
        // Hume configuration
        hume_config: {
          model_version: 'latest',
          emotional_analysis: true,
          prosody_adjustment: true,
          empathy_matching: true,
          sentiment_awareness: true
        },
        
        // ElevenLabs configuration
        elevenlabs_config: {
          model: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.65,
            use_speaker_boost: true
          },
          output_format: 'mp3_44100_128'
        },
        
        // Claude-specific settings
        claude_integration: {
          voice_personality: 'professional_computational',
          response_style: 'conversational_intelligent',
          emotional_range: 'adaptive_professional',
          context_awareness: true
        },
        
        // Warp integration
        warp_headers: {
          'x-warp-voice-id': secretConfig.voice_id || 'Vee',
          'x-voice-engine': 'hume_elevenlabs_hybrid',
          'x-emotional-processing': 'enabled'
        },
        
        // Self-healing configuration
        fallback_strategy: {
          primary_failure_retry: 3,
          backup_voice_on_error: true,
          key_rotation_trigger: true,
          health_check_interval: 30000
        },
        
        // Status and metadata
        status: secretConfig.status || 'active',
        last_rotation: secretConfig.last_rotation,
        version: '2.0'
      };

      this.lastRefresh = Date.now();
      return this.config;

    } catch (error) {
      console.error('Failed to fetch voice configuration:', error);
      
      // Fallback configuration
      return {
        voice_id: 'Vee', // Default fallback voice
        backup_voice_id: 'Adam', // Default backup voice
        synthesis_engine: 'hume_elevenlabs_hybrid',
        emotional_processing: true,
        computational_voice: true,
        status: 'fallback'
      };
    }
  }

  /**
   * Get configuration for specific Claude agent
   */
  async getClaudeAgentConfig(agentId, context = {}) {
    const baseConfig = await this.getVoiceConfig();
    
    return {
      ...baseConfig,
      agent_id: agentId,
      context: context,
      
      // Claude-specific voice parameters
      voice_parameters: {
        voice_id: baseConfig.voice_id,
        model: 'eleven_multilingual_v2',
        voice_settings: {
          ...baseConfig.elevenlabs_config.voice_settings,
          // Adjust for Claude's computational nature
          stability: 0.80, // Slightly more stable for technical content
          similarity_boost: 0.90, // Higher similarity for consistency
          style: 0.70 // Balanced style for professional tone
        }
      },
      
      // Hume emotional processing for Claude
      emotional_config: {
        ...baseConfig.hume_config,
        personality_overlay: 'claude_computational',
        response_adaptation: true,
        context_emotional_matching: true
      },
      
      // Integration points
      middleware_config: {
        pre_synthesis_processing: true,
        post_synthesis_enhancement: true,
        real_time_adjustment: true,
        claude_history_integration: true
      }
    };
  }

  /**
   * Validate and test voice configuration
   */
  async validateConfig() {
    try {
      const config = await this.getVoiceConfig();
      
      const validation = {
        voice_id_valid: config.voice_id === 'Vee',
        backup_voice_valid: config.backup_voice_id === 'Adam',
        synthesis_engine_valid: config.synthesis_engine === 'hume_elevenlabs_hybrid',
        emotional_processing_enabled: config.emotional_processing === true,
        computational_voice_enabled: config.computational_voice === true,
        status: config.status === 'active'
      };
      
      validation.overall_valid = Object.values(validation).every(v => v === true);
      
      return validation;
    } catch (error) {
      return {
        overall_valid: false,
        error: error.message
      };
    }
  }

  /**
   * Self-healing mechanism for voice configuration
   */
  async selfHeal(error) {
    console.log('Initiating self-healing for voice configuration...', error);
    
    try {
      // Try to refresh configuration
      this.config = null;
      this.lastRefresh = null;
      
      const newConfig = await this.getVoiceConfig();
      
      if (newConfig.status === 'fallback') {
        // Trigger key rotation if needed
        await this.triggerKeyRotation();
      }
      
      return newConfig;
    } catch (healError) {
      console.error('Self-healing failed:', healError);
      throw healError;
    }
  }

  /**
   * Trigger key rotation in Secret Manager
   */
  async triggerKeyRotation() {
    // This would integrate with your existing key rotation system
    console.log('Triggering key rotation for ElevenLabs configuration...');
    // Implementation would depend on your specific rotation mechanism
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    try {
      const config = await this.getVoiceConfig();
      const validation = await this.validateConfig();
      
      return {
        status: validation.overall_valid ? 'healthy' : 'degraded',
        voice_id: config.voice_id,
        synthesis_engine: config.synthesis_engine,
        emotional_processing: config.emotional_processing,
        last_refresh: this.lastRefresh,
        validation: validation
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

// Singleton instance
let claudeVoiceConfigInstance = null;

module.exports = {
  getInstance: () => {
    if (!claudeVoiceConfigInstance) {
      claudeVoiceConfigInstance = new ClaudeVoiceConfig();
    }
    return claudeVoiceConfigInstance;
  },
  ClaudeVoiceConfig
};
