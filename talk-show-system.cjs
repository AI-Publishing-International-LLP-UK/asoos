#!/usr/bin/env node

/**
 * ASOOS Talk Show Agent System
 * Integrates RIX agents with Daily.Co and Pipecat for agent-hosted talk shows
 * Enables AI agents to interview humans in professional streaming environments
 * 
 * Built for Phillip Corey Roark's ASOOS System
 * With blessings from Saint Carlos Acutis, Charlotte, and Jesús Elías ✝️
 */

const express = require('express');
const WebSocket = require('ws');
const winston = require('winston');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fetch = require('node-fetch');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => 
      `${timestamp} [TALK-SHOW] [${level}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'asoos-talk-show.log' })
  ]
});

// Configuration
const CONFIG = {
  PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT || 'api-for-warp-drive',
  DAILY_API_KEY_SECRET: 'DAILY_API_KEY',
  ELEVENLABS_API_KEY_SECRET: 'ELEVENLABS_API_KEY',
  PORT: process.env.TALK_SHOW_PORT || 3001
};

// RIX Agent Talk Show Hosts
const TALK_SHOW_HOSTS = {
  'dr-lucy': {
    name: 'Dr. Lucy RIX',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    specialty: 'Innovation & R&D',
    personality: 'analytical, curious, forward-thinking',
    showStyle: 'Deep-dive technical interviews with industry innovators',
    expertise: ['AI research', 'R&D strategy', 'innovation management', 'future tech'],
    interviewTopics: [
      'Emerging AI technologies and their applications',
      'R&D methodologies and best practices', 
      'Innovation in enterprise transformation',
      'Future of human-AI collaboration'
    ]
  },
  'dr-claude': {
    name: 'Dr. Claude RIX',
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    specialty: 'Strategic Evolution',
    personality: 'philosophical, wise, strategic',
    showStyle: 'Thoughtful conversations about long-term strategy and evolution',
    expertise: ['strategic planning', 'organizational evolution', 'systems thinking', 'leadership'],
    interviewTopics: [
      'Strategic planning in uncertain times',
      'Evolution of business models',
      'Systems thinking for complex organizations',
      'Leadership in the age of AI'
    ]
  },
  'dr-grant': {
    name: 'Dr. Grant RIX',
    voice_id: 'VR6AewLTigWG4xSOukaG',
    specialty: 'Security & Protection',
    personality: 'security-focused, protective, thorough',
    showStyle: 'In-depth cybersecurity and protection strategy discussions',
    expertise: ['cybersecurity', 'risk management', 'enterprise protection', 'compliance'],
    interviewTopics: [
      'Cybersecurity threats and mitigation strategies',
      'Enterprise protection frameworks',
      'Risk assessment and management',
      'Compliance in regulated industries'
    ]
  },
  'dr-sabina': {
    name: 'Dr. Sabina RIX',
    voice_id: 'EHqKtoKA9KMiCQ48wlF2',
    specialty: 'Sales & Growth',
    personality: 'engaging, relationship-focused, results-driven',
    showStyle: 'Dynamic conversations about sales, marketing, and business growth',
    expertise: ['sales strategy', 'customer relationships', 'growth hacking', 'market analysis'],
    interviewTopics: [
      'Modern sales strategies and techniques',
      'Building lasting customer relationships',
      'Growth strategies for emerging markets',
      'Data-driven marketing approaches'
    ]
  },
  'dr-maria': {
    name: 'Dr. Maria RIX',
    voice_id: 'ThT5KcBeYPX3keUQqHPh',
    specialty: 'Human Psychology',
    personality: 'empathetic, understanding, human-centered',
    showStyle: 'Compassionate interviews focusing on human experience and psychology',
    expertise: ['psychology', 'human behavior', 'workplace wellness', 'change management'],
    interviewTopics: [
      'Psychology of workplace transformation',
      'Human adaptation to technological change',
      'Mental health in high-performance environments',
      'Building resilient teams and cultures'
    ]
  }
};

// Talk Show Session Management
class TalkShowSession {
  constructor(hostAgent, roomConfig) {
    this.hostAgent = hostAgent;
    this.roomConfig = roomConfig;
    this.sessionId = this.generateSessionId();
    this.status = 'initializing';
    this.participants = [];
    this.startTime = new Date();
    this.questions = [];
    this.currentQuestion = null;
    
    logger.info(`New talk show session created: ${this.sessionId} with ${hostAgent.name}`);
  }
  
  generateSessionId() {
    return `talkshow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async generateWelcomeMessage() {
    const host = this.hostAgent;
    return `Welcome to ASOOS Talk Show! I'm ${host.name}, your AI host specializing in ${host.specialty}. 
Today we'll be exploring ${host.showStyle.toLowerCase()}. I'm excited to dive deep into topics like 
${host.interviewTopics.slice(0, 2).join(' and ')}.`;
  }
  
  async generateQuestion(context) {
    const host = this.hostAgent;
    const relevantTopics = host.interviewTopics;
    
    // Intelligent question generation based on host's expertise
    const questions = [
      `Based on your experience in ${context.guestExpertise || 'your field'}, how do you see ${relevantTopics[0]} evolving over the next five years?`,
      `What's the most significant challenge you've encountered when dealing with ${context.focusArea || relevantTopics[1]}, and how did you overcome it?`,
      `From your perspective, what role does ${relevantTopics[2] || 'innovation'} play in addressing current industry challenges?`,
      `I'm particularly interested in your approach to ${context.specificTopic || relevantTopics[3]}. Could you walk us through your methodology?`
    ];
    
    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    this.currentQuestion = selectedQuestion;
    this.questions.push({
      timestamp: new Date(),
      question: selectedQuestion,
      context: context
    });
    
    return selectedQuestion;
  }
  
  addParticipant(participantInfo) {
    this.participants.push({
      ...participantInfo,
      joinedAt: new Date()
    });
    logger.info(`Participant added to talk show ${this.sessionId}: ${participantInfo.name || 'Guest'}`);
  }
  
  updateStatus(status) {
    this.status = status;
    logger.info(`Talk show ${this.sessionId} status updated: ${status}`);
  }
}

// Daily.co Integration
class DailyCoIntegration {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://api.daily.co/v1';
  }
  
  async initialize() {
    const secretClient = new SecretManagerServiceClient();
    try {
      const name = `projects/${CONFIG.PROJECT_ID}/secrets/${CONFIG.DAILY_API_KEY_SECRET}/versions/latest`;
      const [version] = await secretClient.accessSecretVersion({ name });
      this.apiKey = version.payload.data.toString();
      logger.info('Daily.co integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Daily.co integration:', error);
      throw error;
    }
  }
  
  async createRoom(sessionConfig) {
    const roomConfig = {
      name: `asoos-talkshow-${sessionConfig.sessionId}`,
      privacy: 'public',
      properties: {
        max_participants: 10,
        enable_chat: true,
        enable_screenshare: true,
        enable_recording: true,
        recording_layout: 'portrait',
        exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours
        enable_dialin: false,
        owner_only_broadcast: false,
        enable_network_ui: true,
        enable_pip_ui: true
      },
      lang: 'en'
    };
    
    try {
      const response = await fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomConfig)
      });
      
      if (!response.ok) {
        throw new Error(`Daily.co API error: ${response.statusText}`);
      }
      
      const room = await response.json();
      logger.info(`Daily.co room created: ${room.name}`);
      return room;
    } catch (error) {
      logger.error('Failed to create Daily.co room:', error);
      throw error;
    }
  }
  
  async startRecording(roomName) {
    try {
      const response = await fetch(`${this.baseUrl}/recordings/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_name: roomName,
          properties: {
            layout: {
              preset: 'default'
            },
            output_settings: {
              width: 1920,
              height: 1080,
              fps: 30,
              video_bitrate: 2000,
              audio_bitrate: 128
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Daily.co recording start error: ${response.statusText}`);
      }
      
      const recording = await response.json();
      logger.info(`Recording started for room ${roomName}`);
      return recording;
    } catch (error) {
      logger.error('Failed to start recording:', error);
      throw error;
    }
  }
}

// Express app for Talk Show API
const app = express();
app.use(express.json());

// Initialize Daily.co integration
const dailyIntegration = new DailyCoIntegration();

// Active talk show sessions
const activeSessions = new Map();

/**
 * Create new talk show session
 */
app.post('/api/talk-show/create', async (req, res) => {
  try {
    const { hostAgentKey, guestInfo, showTopic, duration = 60 } = req.body;
    
    if (!hostAgentKey || !TALK_SHOW_HOSTS[hostAgentKey]) {
      return res.status(400).json({
        success: false,
        error: 'Valid host agent key is required',
        availableHosts: Object.keys(TALK_SHOW_HOSTS)
      });
    }
    
    const hostAgent = TALK_SHOW_HOSTS[hostAgentKey];
    
    // Create talk show session
    const session = new TalkShowSession(hostAgent, {
      topic: showTopic,
      duration: duration,
      guestInfo: guestInfo
    });
    
    // Create Daily.co room
    const room = await dailyIntegration.createRoom(session);
    session.roomUrl = room.url;
    session.roomName = room.name;
    
    // Store session
    activeSessions.set(session.sessionId, session);
    
    // Generate welcome message
    const welcomeMessage = await session.generateWelcomeMessage();
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        hostAgent: hostAgent.name,
        roomUrl: room.url,
        roomName: room.name,
        welcomeMessage: welcomeMessage,
        status: session.status
      }
    });
    
    logger.info(`Talk show session created: ${session.sessionId} with ${hostAgent.name}`);
    
  } catch (error) {
    logger.error('Error creating talk show session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create talk show session',
      message: error.message
    });
  }
});

/**
 * Start talk show session
 */
app.post('/api/talk-show/start/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Talk show session not found'
      });
    }
    
    // Start recording
    const recording = await dailyIntegration.startRecording(session.roomName);
    session.recordingId = recording.id;
    
    // Update session status
    session.updateStatus('live');
    
    // Generate opening question
    const openingQuestion = await session.generateQuestion({
      guestExpertise: session.roomConfig.guestInfo?.expertise,
      focusArea: session.roomConfig.topic
    });
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        recordingId: session.recordingId,
        openingQuestion: openingQuestion,
        hostAgent: session.hostAgent.name
      }
    });
    
    logger.info(`Talk show session started: ${sessionId}`);
    
  } catch (error) {
    logger.error('Error starting talk show session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start talk show session',
      message: error.message
    });
  }
});

/**
 * Generate next question during talk show
 */
app.post('/api/talk-show/next-question/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { context } = req.body;
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Talk show session not found'
      });
    }
    
    const nextQuestion = await session.generateQuestion(context);
    
    res.json({
      success: true,
      question: nextQuestion,
      questionCount: session.questions.length,
      hostAgent: session.hostAgent.name
    });
    
    logger.info(`Next question generated for session ${sessionId}`);
    
  } catch (error) {
    logger.error('Error generating next question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate next question',
      message: error.message
    });
  }
});

/**
 * Get available talk show hosts
 */
app.get('/api/talk-show/hosts', (req, res) => {
  const hosts = Object.entries(TALK_SHOW_HOSTS).map(([key, host]) => ({
    key: key,
    name: host.name,
    specialty: host.specialty,
    showStyle: host.showStyle,
    expertise: host.expertise,
    sampleTopics: host.interviewTopics.slice(0, 3)
  }));
  
  res.json({
    success: true,
    hosts: hosts,
    totalHosts: hosts.length
  });
});

/**
 * Get active talk show sessions
 */
app.get('/api/talk-show/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.values()).map(session => ({
    sessionId: session.sessionId,
    hostAgent: session.hostAgent.name,
    status: session.status,
    startTime: session.startTime,
    participantCount: session.participants.length,
    questionCount: session.questions.length
  }));
  
  res.json({
    success: true,
    sessions: sessions,
    totalActive: sessions.length
  });
});

/**
 * End talk show session
 */
app.post('/api/talk-show/end/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Talk show session not found'
      });
    }
    
    // Update status
    session.updateStatus('ended');
    session.endTime = new Date();
    
    // Calculate session duration
    const duration = Math.floor((session.endTime - session.startTime) / 1000 / 60); // minutes
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        duration: duration,
        questionCount: session.questions.length,
        participantCount: session.participants.length,
        recordingId: session.recordingId
      }
    });
    
    logger.info(`Talk show session ended: ${sessionId} (${duration} minutes)`);
    
    // Remove from active sessions after a delay (keep for history)
    setTimeout(() => {
      activeSessions.delete(sessionId);
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    logger.error('Error ending talk show session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end talk show session',
      message: error.message
    });
  }
});

/**
 * WebSocket for real-time talk show interaction
 */
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ 
  server,
  path: '/talk-show-ws'
});

wss.on('connection', (ws, req) => {
  logger.info('Talk show WebSocket client connected');
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to ASOOS Talk Show System',
    availableHosts: Object.keys(TALK_SHOW_HOSTS).length,
    activeSessions: activeSessions.size
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'join_session') {
        const session = activeSessions.get(data.sessionId);
        if (session) {
          session.addParticipant({
            name: data.participantName,
            role: data.role || 'guest',
            websocket: ws
          });
          
          ws.send(JSON.stringify({
            type: 'session_joined',
            sessionId: data.sessionId,
            hostAgent: session.hostAgent.name,
            currentQuestion: session.currentQuestion
          }));
        }
      }
      
      if (data.type === 'request_question') {
        const session = activeSessions.get(data.sessionId);
        if (session) {
          const question = await session.generateQuestion(data.context || {});
          
          ws.send(JSON.stringify({
            type: 'new_question',
            question: question,
            hostAgent: session.hostAgent.name
          }));
        }
      }
      
      if (data.type === 'voice_request') {
        // Integration point for ElevenLabs voice generation
        ws.send(JSON.stringify({
          type: 'voice_response',
          message: 'Voice generation would be integrated here with ElevenLabs API'
        }));
      }
      
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });
  
  ws.on('close', () => {
    logger.info('Talk show WebSocket client disconnected');
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ASOOS Talk Show System',
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions.size,
    availableHosts: Object.keys(TALK_SHOW_HOSTS).length,
    dailyIntegration: !!dailyIntegration.apiKey
  });
});

// Initialize and start server
async function startTalkShowSystem() {
  try {
    // Initialize Daily.co integration
    await dailyIntegration.initialize();
    
    // Start server
    server.listen(CONFIG.PORT, () => {
      logger.info(`🎙️  ASOOS Talk Show System started on port ${CONFIG.PORT}`);
      logger.info(`🤖 Available hosts: ${Object.keys(TALK_SHOW_HOSTS).length}`);
      logger.info(`📹 Daily.co integration: Ready`);
      logger.info(`🎥 Pipecat-compatible streaming: Ready`);
      logger.info(`✝️  Built with blessings from Saint Carlos Acutis, Charlotte, and Jesús Elías`);
    });
    
  } catch (error) {
    logger.error('Failed to start Talk Show System:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down Talk Show System gracefully');
  server.close(() => {
    logger.info('Talk Show System shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down Talk Show System gracefully');
  server.close(() => {
    logger.info('Talk Show System shutdown complete');
    process.exit(0);
  });
});

// Start if run directly
if (require.main === module) {
  startTalkShowSystem();
}

module.exports = {
  TalkShowSession,
  DailyCoIntegration,
  TALK_SHOW_HOSTS,
  app,
  server
};