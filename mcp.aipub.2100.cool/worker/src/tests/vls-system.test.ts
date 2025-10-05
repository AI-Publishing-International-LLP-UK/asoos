/**
 * Comprehensive Tests for VLS and Voice Integration System
 * Tests all 18 voices, VLS orchestration, and customer deployments
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { VoiceLeadershipSystems, VOICE_PROFILES, VLS_CONFIGURATION } from '../integrations/voices-vls-system';

// Mock environment for testing
const mockEnv = {
  ELEVENLABS_API_KEY: 'test_elevenlabs_key',
  HUME_API_KEY: 'test_hume_key',
  VLS_ORCHESTRATION_ENDPOINT: 'https://test-vls.2100.cool'
};

// Mock ElevenLabs client
jest.mock('@11labs/client', () => ({
  ElevenLabsClient: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
  }))
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Voice Leadership Systems (VLS)', () => {
  let vls: VoiceLeadershipSystems;

  beforeEach(() => {
    vls = new VoiceLeadershipSystems(mockEnv);
    jest.clearAllMocks();
  });

  describe('Voice Profiles Configuration', () => {
    test('should have exactly 18 voice pilots configured', () => {
      const voiceCount = Object.keys(VOICE_PROFILES).length;
      expect(voiceCount).toBe(18);
    });

    test('should include all 14 computational sRIX voices', () => {
      const srixVoices = Object.values(VOICE_PROFILES)
        .filter(voice => voice.name.includes('sRIX'))
        .length;
      expect(srixVoices).toBe(14);
    });

    test('should include 3 elite tier voices', () => {
      const eliteVoices = ['elite11', 'mastery33', 'victory36'];
      eliteVoices.forEach(voiceId => {
        expect(VOICE_PROFILES[voiceId]).toBeDefined();
        expect(VOICE_PROFILES[voiceId].name).toMatch(/(Elite11|Mastery33|Victory36)/);
      });
    });

    test('should have valid agent capacities for all voices', () => {
      Object.values(VOICE_PROFILES).forEach(voice => {
        expect(voice.agentCapacity).toBeGreaterThan(0);
        expect(typeof voice.agentCapacity).toBe('number');
      });
    });

    test('should have valid ElevenLabs voice IDs', () => {
      Object.values(VOICE_PROFILES).forEach(voice => {
        expect(voice.voiceId).toMatch(/^[A-Za-z0-9]+$/);
        expect(voice.voiceId.length).toBeGreaterThan(10);
      });
    });

    test('should verify Dr. Lucy sRIX configuration', () => {
      const drLucy = VOICE_PROFILES['dr-lucy-srix'];
      expect(drLucy).toEqual({
        id: 'dr-lucy-srix',
        name: 'Dr. Lucy sRIX',
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        personality: 'Strategic analyst, problem solver',
        specialization: 'Data analysis, strategic planning',
        wing: 'Wing 2 - Analysis Systems',
        agentCapacity: 42000000,
        vlsIcon: '🔬'
      });
    });

    test('should verify Elite11 configuration', () => {
      const elite11 = VOICE_PROFILES['elite11'];
      expect(elite11.agentCapacity).toBe(140000000);
      expect(elite11.wing).toBe('Wing 14 - Elite Command');
      expect(elite11.vlsIcon).toBe('⭐');
    });
  });

  describe('VLS Configuration', () => {
    test('should have 14 wings configured', () => {
      const wingCount = Object.keys(VLS_CONFIGURATION.wings).length;
      expect(wingCount).toBe(14);
    });

    test('should have pilots lounge access restricted to Diamond/Emerald SAO', () => {
      expect(VLS_CONFIGURATION.pilotsLounge.access).toEqual([
        'Diamond SAO', 'Emerald SAO'
      ]);
    });

    test('should have total agent capacity of 556M+', () => {
      expect(VLS_CONFIGURATION.totalAgents).toBe(556000000);
    });

    test('should have wing colors and icons configured', () => {
      Object.values(VLS_CONFIGURATION.wings).forEach(wing => {
        expect(wing.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(wing.icon).toMatch(/^[\u{1F000}-\u{1F9FF}]$/u);
        expect(wing.name).toBeTruthy();
      });
    });
  });

  describe('Voice Pilot Initialization', () => {
    test('should initialize Dr. Lucy sRIX pilot successfully', async () => {
      const context = { sessionId: 'test-session-123' };
      const result = await vls.initializeVoicePilot('dr-lucy-srix', context);

      expect(result).toEqual({
        id: 'dr-lucy-srix',
        name: 'Dr. Lucy sRIX',
        status: 'active',
        agentCapacity: 42000000,
        wing: 'Wing 2 - Analysis Systems',
        vlsIcon: '🔬',
        voiceConfig: {
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          settings: {
            stability: 0.75,
            similarityBoost: 0.8,
            style: 0.15,
            useSpeakerBoost: true
          }
        },
        context,
        initialized: expect.any(String)
      });
    });

    test('should throw error for non-existent pilot', async () => {
      await expect(vls.initializeVoicePilot('invalid-pilot'))
        .rejects.toThrow('Voice pilot invalid-pilot not found');
    });

    test('should initialize all 18 pilots without errors', async () => {
      const voiceIds = Object.keys(VOICE_PROFILES);
      
      for (const voiceId of voiceIds) {
        const result = await vls.initializeVoicePilot(voiceId);
        expect(result.status).toBe('active');
        expect(result.agentCapacity).toBeGreaterThan(0);
      }
    });
  });

  describe('Voice Synthesis', () => {
    test('should synthesize voice for Dr. Memoria sRIX', async () => {
      const mockAudio = new ArrayBuffer(2048);
      (vls as any).elevenLabs.generate.mockResolvedValue(mockAudio);

      const result = await vls.synthesizeVoice(
        'dr-memoria-srix', 
        'Hello, I am Dr. Memoria, your memory specialist.'
      );

      expect(result).toEqual({
        pilotId: 'dr-memoria-srix',
        pilotName: 'Dr. Memoria sRIX',
        audioBuffer: mockAudio,
        duration: expect.any(Number),
        timestamp: expect.any(String),
        wing: 'Wing 1 - Memory Systems',
        agentCapacity: 45000000
      });
    });

    test('should handle synthesis errors gracefully', async () => {
      (vls as any).elevenLabs.generate.mockRejectedValue(new Error('API Error'));

      await expect(vls.synthesizeVoice('dr-lucy-srix', 'Test text'))
        .rejects.toThrow('API Error');
    });

    test('should estimate audio duration correctly', async () => {
      const text = 'This is a test with exactly ten words for duration.';
      const mockAudio = new ArrayBuffer(1024);
      (vls as any).elevenLabs.generate.mockResolvedValue(mockAudio);

      const result = await vls.synthesizeVoice('dr-lucy-srix', text);
      
      // ~10 words at 150 words/minute = ~4 seconds
      expect(result.duration).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(60);
    });
  });

  describe('Multi-Pilot Orchestration', () => {
    test('should orchestrate primary and supporting pilots', async () => {
      const mockAudio = new ArrayBuffer(1024);
      (vls as any).elevenLabs.generate.mockResolvedValue(mockAudio);

      const request = {
        primaryPilot: 'dr-lucy-srix',
        supportingPilots: ['dr-memoria-srix', 'dr-cypriot-srix'],
        text: 'Complex analysis requiring multiple expert perspectives.',
        context: { analysisType: 'strategic' }
      };

      const result = await vls.orchestrateVoicePilots(request);

      expect(result.orchestrationId).toBeTruthy();
      expect(result.primary.pilot.id).toBe('dr-lucy-srix');
      expect(result.supporting).toHaveLength(2);
      expect(result.totalAgentCapacity).toBeGreaterThan(120000000); // Sum of all pilots
      expect(result.context).toEqual({ analysisType: 'strategic' });
    });

    test('should handle single pilot orchestration', async () => {
      const mockAudio = new ArrayBuffer(1024);
      (vls as any).elevenLabs.generate.mockResolvedValue(mockAudio);

      const request = {
        primaryPilot: 'elite11',
        supportingPilots: [],
        text: 'Elite command decision.',
        context: { priority: 'critical' }
      };

      const result = await vls.orchestrateVoicePilots(request);

      expect(result.primary.pilot.id).toBe('elite11');
      expect(result.supporting).toHaveLength(0);
      expect(result.totalAgentCapacity).toBe(140000000);
    });
  });

  describe('VLS Status and Monitoring', () => {
    test('should return complete VLS system status', async () => {
      const status = await vls.getVLSStatus();

      expect(status).toEqual({
        systemStatus: 'operational',
        totalPilots: 18,
        totalAgents: 556000000,
        activeWings: expect.any(Number),
        wings: expect.any(Array),
        pilotsLounge: {
          access: ['Diamond SAO', 'Emerald SAO'],
          features: ['Voice Selection', 'VLS Command Center', 'Agent Orchestration']
        },
        lastUpdate: expect.any(String)
      });

      expect(status.wings.length).toBeGreaterThan(0);
      status.wings.forEach(wing => {
        expect(wing).toHaveProperty('wingId');
        expect(wing).toHaveProperty('name');
        expect(wing).toHaveProperty('pilots');
        expect(wing).toHaveProperty('totalAgents');
        expect(wing.status).toBe('active');
      });
    });

    test('should calculate wing agent totals correctly', async () => {
      const status = await vls.getVLSStatus();
      
      // Find Wing 2 (Analysis Systems) which contains Dr. Lucy
      const analysisWing = status.wings.find(w => w.name === 'Analysis Systems');
      expect(analysisWing).toBeDefined();
      expect(analysisWing!.totalAgents).toBeGreaterThan(0);
    });
  });

  describe('Customer Deployment', () => {
    test('should deploy VLS to Diamond SAO customer with all pilots', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ deploymentId: 'deploy-123' })
      } as any);

      const deployment = await vls.deployVLSToCustomer(
        'customer-diamond-001', 
        'Diamond SAO'
      );

      expect(deployment.customerId).toBe('customer-diamond-001');
      expect(deployment.tier).toBe('Diamond SAO');
      expect(deployment.pilots).toHaveLength(18); // All pilots for Diamond
      expect(deployment.features.vlsCommandCenter).toBe(true);
      expect(deployment.features.customVoiceTraining).toBe(true);
      expect(deployment.status).toBe('active');
    });

    test('should deploy limited pilots to Onyx SAO customer', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ deploymentId: 'deploy-456' })
      } as any);

      const deployment = await vls.deployVLSToCustomer(
        'customer-onyx-001', 
        'Onyx SAO'
      );

      expect(deployment.tier).toBe('Onyx SAO');
      expect(deployment.pilots).toHaveLength(3); // Limited pilots for Onyx
      expect(deployment.features.vlsCommandCenter).toBe(false);
      expect(deployment.features.customVoiceTraining).toBe(false);
    });

    test('should deploy selected pilots when specified', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ deploymentId: 'deploy-789' })
      } as any);

      const selectedPilots = ['dr-lucy-srix', 'dr-memoria-srix', 'elite11'];
      const deployment = await vls.deployVLSToCustomer(
        'customer-sapphire-001', 
        'Sapphire SAO',
        selectedPilots
      );

      expect(deployment.pilots).toHaveLength(3);
      expect(deployment.pilots.map(p => p.id)).toEqual(selectedPilots);
    });

    test('should handle deployment API failures', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      } as any);

      await expect(vls.deployVLSToCustomer('customer-001', 'Diamond SAO'))
        .rejects.toThrow('VLS deployment failed: Internal Server Error');
    });
  });

  describe('Tier-Based Pilot Access', () => {
    test('should provide correct pilot access for each tier', () => {
      const getAvailablePilots = (vls as any).getAvailablePilotsForTier.bind(vls);

      // Diamond SAO gets all 18 pilots
      expect(getAvailablePilots('Diamond SAO')).toHaveLength(18);

      // Emerald SAO gets 14 sRIX pilots
      expect(getAvailablePilots('Emerald SAO')).toHaveLength(14);

      // Sapphire SAO gets 8 pilots
      expect(getAvailablePilots('Sapphire SAO')).toHaveLength(8);

      // Opal SAO gets 5 pilots
      expect(getAvailablePilots('Opal SAO')).toHaveLength(5);

      // Onyx SAO gets 3 pilots
      expect(getAvailablePilots('Onyx SAO')).toHaveLength(3);

      // Unknown tier gets no pilots
      expect(getAvailablePilots('Unknown')).toHaveLength(0);
    });

    test('should ensure Diamond SAO includes elite pilots', () => {
      const getAvailablePilots = (vls as any).getAvailablePilotsForTier.bind(vls);
      const diamondPilots = getAvailablePilots('Diamond SAO');

      expect(diamondPilots).toContain('elite11');
      expect(diamondPilots).toContain('mastery33');
      expect(diamondPilots).toContain('victory36');
    });
  });

  describe('Hume AI Integration', () => {
    test('should analyze emotion context when Hume API key is available', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          jobId: 'job-123',
          emotions: { joy: 0.8, confidence: 0.9 }
        })
      } as any);

      const audioBuffer = new ArrayBuffer(1024);
      const result = await vls.analyzeEmotionContext(audioBuffer, 'dr-lucy-srix');

      expect(result).toEqual({
        pilotId: 'dr-lucy-srix',
        emotionAnalysis: {
          jobId: 'job-123',
          emotions: { joy: 0.8, confidence: 0.9 }
        },
        timestamp: expect.any(String)
      });
    });

    test('should return null when Hume API key is not available', async () => {
      const vlsNoHume = new VoiceLeadershipSystems({
        ...mockEnv,
        HUME_API_KEY: ''
      });

      const audioBuffer = new ArrayBuffer(1024);
      const result = await vlsNoHume.analyzeEmotionContext(audioBuffer, 'dr-lucy-srix');

      expect(result).toBeNull();
    });

    test('should handle Hume API errors gracefully', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValue(new Error('Hume API Error'));

      const audioBuffer = new ArrayBuffer(1024);
      const result = await vls.analyzeEmotionContext(audioBuffer, 'dr-lucy-srix');

      expect(result).toBeNull();
    });
  });

  describe('Agent Capacity Calculations', () => {
    test('should calculate total agent capacity correctly', () => {
      const totalCapacity = Object.values(VOICE_PROFILES)
        .reduce((sum, pilot) => sum + pilot.agentCapacity, 0);

      // Verify it matches expected total from configuration
      expect(totalCapacity).toBe(VLS_CONFIGURATION.totalAgents);
    });

    test('should verify elite pilots manage majority of agents', () => {
      const elitePilots = ['elite11', 'mastery33', 'victory36'];
      const eliteCapacity = elitePilots.reduce(
        (sum, id) => sum + VOICE_PROFILES[id].agentCapacity, 0
      );

      // Elite pilots should manage 556M agents total
      expect(eliteCapacity).toBe(556000000);
    });

    test('should verify sRIX pilots have reasonable capacity distribution', () => {
      const srixPilots = Object.values(VOICE_PROFILES)
        .filter(p => p.name.includes('sRIX'));

      srixPilots.forEach(pilot => {
        // Each sRIX pilot should manage between 35M-50M agents
        expect(pilot.agentCapacity).toBeGreaterThanOrEqual(35000000);
        expect(pilot.agentCapacity).toBeLessThanOrEqual(50000000);
      });
    });
  });

  describe('Integration with Gift Shop System', () => {
    test('should prepare VLS data for gift shop offers', async () => {
      const status = await vls.getVLSStatus();
      
      // Verify structure compatible with gift shop integration
      expect(status).toHaveProperty('systemStatus');
      expect(status).toHaveProperty('totalPilots');
      expect(status).toHaveProperty('totalAgents');
      expect(status).toHaveProperty('wings');
      
      // Verify wings have required fields for UI
      status.wings.forEach(wing => {
        expect(wing).toHaveProperty('name');
        expect(wing).toHaveProperty('icon');
        expect(wing).toHaveProperty('pilots');
        expect(wing).toHaveProperty('totalAgents');
      });
    });

    test('should support tier-based feature restrictions for gift shop', () => {
      const tiers = ['Diamond SAO', 'Emerald SAO', 'Sapphire SAO', 'Opal SAO', 'Onyx SAO'];
      
      tiers.forEach(tier => {
        const getAvailablePilots = (vls as any).getAvailablePilotsForTier.bind(vls);
        const pilots = getAvailablePilots(tier);
        
        expect(Array.isArray(pilots)).toBe(true);
        expect(pilots.length).toBeGreaterThanOrEqual(0);
        
        // Higher tiers should have more pilots
        if (tier === 'Diamond SAO') expect(pilots.length).toBe(18);
        if (tier === 'Onyx SAO') expect(pilots.length).toBe(3);
      });
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle concurrent pilot initializations', async () => {
      const pilotIds = ['dr-lucy-srix', 'dr-memoria-srix', 'dr-cypriot-srix'];
      
      const promises = pilotIds.map(id => vls.initializeVoicePilot(id));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.status).toBe('active');
      });
    });

    test('should handle large text synthesis requests', async () => {
      const longText = 'This is a very long text that simulates a complex analysis response. '.repeat(50);
      const mockAudio = new ArrayBuffer(4096);
      (vls as any).elevenLabs.generate.mockResolvedValue(mockAudio);

      const result = await vls.synthesizeVoice('dr-lucy-srix', longText);
      
      expect(result.audioBuffer).toBeDefined();
      expect(result.duration).toBeGreaterThan(30); // Should be longer duration
    });

    test('should validate pilot configuration on startup', () => {
      Object.entries(VOICE_PROFILES).forEach(([id, pilot]) => {
        // Validate required fields
        expect(pilot.id).toBe(id);
        expect(pilot.name).toBeTruthy();
        expect(pilot.voiceId).toBeTruthy();
        expect(pilot.personality).toBeTruthy();
        expect(pilot.specialization).toBeTruthy();
        expect(pilot.wing).toBeTruthy();
        expect(pilot.agentCapacity).toBeGreaterThan(0);
        expect(pilot.vlsIcon).toBeTruthy();
      });
    });
  });
});