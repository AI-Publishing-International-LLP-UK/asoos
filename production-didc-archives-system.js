#!/usr/bin/env node
/**
 * 🕊️ DIDC Archives System - Production Implementation
 * Data Intentional Dewey Classification System for the Book of Light Project
 * Authority: Diamond SAO Command Center
 * Version: 1.0.0-production-restore
 *
 * Core DIDC System Components:
 * - DIDCArchivesCore: Main archive management system
 * - DeweyDataClassifier: Advanced classification using Dewey Decimal + AI
 * - IntentionalDataProcessor: Intent analysis and metadata enrichment
 *
 * This system bridges the Genesis conversations with systematic archival
 * for the Sacred Digital Library and Book of Light creation.
 */

const express = require('express');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { MongoClient } = require('mongodb');
const { Firestore } = require('@google-cloud/firestore');
const { Pinecone } = require('@pinecone-database/pinecone');
const axios = require('axios');
const crypto = require('crypto');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

/**
 * 🏛️ DIDC Archives Core - Main Archive Management System
 * Handles CRUD operations, retention policies, and archival workflows
 */
class DIDCArchivesCore {
  constructor(config = {}) {
    this.gcpProjectId = config.gcpProjectId || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.mongoClient = null;
    this.firestore = new Firestore({ projectId: this.gcpProjectId });
    this.secretManager = new SecretManagerServiceClient();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({ filename: './logs/didc-archives-core.log' }),
        new winston.transports.Console({ format: winston.format.simple() }),
      ],
    });

    // Archive configuration
    this.archiveConfig = {
      retentionPeriods: {
        genesis: 'permanent',
        conversation: '7_years',
        research: '5_years',
        temporary: '1_year',
      },
      classifications: {
        maxDepth: 5,
        confidenceThreashold: 0.7,
        requireReview: true,
      },
    };

    console.log('🏛️ DIDC Archives Core initialized');
  }

  /**
   * Initialize the core archival system
   */
  async initialize() {
    try {
      await this.initializeMongoConnection();
      await this.createRequiredCollections();

      this.logger.info('✅ DIDC Archives Core initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('❌ DIDC Archives Core initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize MongoDB Atlas connection
   */
  async initializeMongoConnection() {
    try {
      const mongoUri = await this.getSecretValue('MONGODB_ATLAS_URI');
      if (!mongoUri) {
        throw new Error('MongoDB URI not found in Secret Manager');
      }

      this.mongoClient = new MongoClient(mongoUri);
      await this.mongoClient.connect();

      this.logger.info('✅ MongoDB Atlas connection established for DIDC Archives');
    } catch (error) {
      this.logger.error('❌ MongoDB connection failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create required MongoDB collections with proper indexes
   */
  async createRequiredCollections() {
    const db = this.mongoClient.db('didc-archives');

    // Archives collection
    const archivesCollection = db.collection('archives');
    await archivesCollection.createIndex({ archiveId: 1 }, { unique: true });
    await archivesCollection.createIndex({ deweyCode: 1 });
    await archivesCollection.createIndex({ careerCluster: 1 });
    await archivesCollection.createIndex({ createdAt: -1 });
    await archivesCollection.createIndex({ 'metadata.source': 1 });

    // Career clusters collection
    const clustersCollection = db.collection('career-clusters');
    await clustersCollection.createIndex({ clusterId: 1 }, { unique: true });

    this.logger.info('✅ DIDC Archives collections and indexes created');
  }

  /**
   * Process data for archival with full classification
   */
  async processDataForArchival(data, metadata = {}) {
    try {
      const archiveId = crypto.randomUUID();

      // Create archive package
      const archivePackage = {
        archiveId,
        data,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          source: metadata.source || 'unknown',
          priority: metadata.priority || 'medium',
          confidentiality: metadata.confidentiality || 'internal',
        },
        location: `archives/${archiveId}`,
        retrievalCode: this.generateRetrievalCode(archiveId),
        status: 'processed',
        retentionPolicy: this.determineRetentionPolicy(data, metadata),
      };

      // Store in MongoDB
      const db = this.mongoClient.db('didc-archives');
      await db.collection('archives').insertOne(archivePackage);

      // Store metadata in Firestore for quick access
      await this.firestore
        .collection('didc-archive-index')
        .doc(archiveId)
        .set({
          archiveId,
          source: metadata.source,
          processedAt: new Date(),
          deweyCode: metadata.deweyCode || '000',
          careerCluster: metadata.careerCluster,
        });

      this.logger.info('📦 Data processed for archival', { archiveId, source: metadata.source });

      return archivePackage;
    } catch (error) {
      this.logger.error('❌ Failed to process data for archival', { error: error.message });
      throw error;
    }
  }

  /**
   * Search archives by various criteria
   */
  async searchArchives(criteria = {}) {
    try {
      const db = this.mongoClient.db('didc-archives');
      const query = {};

      if (criteria.deweyCode) {
        query.deweyCode = criteria.deweyCode;
      }
      if (criteria.careerCluster) {
        query.careerCluster = criteria.careerCluster;
      }
      if (criteria.source) {
        query['metadata.source'] = criteria.source;
      }
      if (criteria.dateRange) {
        query.createdAt = {
          $gte: new Date(criteria.dateRange.start),
          $lte: new Date(criteria.dateRange.end),
        };
      }

      const results = await db
        .collection('archives')
        .find(query)
        .limit(criteria.limit || 50)
        .sort({ createdAt: -1 })
        .toArray();

      this.logger.info('🔍 Archive search completed', {
        criteriaUsed: Object.keys(criteria),
        resultsCount: results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('❌ Archive search failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  async getSecretValue(secretName) {
    try {
      const name = `projects/${this.gcpProjectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });
      return version.payload.data.toString();
    } catch (error) {
      this.logger.warn(`⚠️ Could not get secret ${secretName}:`, error.message);
      return null;
    }
  }

  generateRetrievalCode(archiveId) {
    return crypto
      .createHash('sha256')
      .update(archiveId)
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();
  }

  determineRetentionPolicy(data, metadata) {
    if (metadata.intent === 'genesis' || metadata.source === 'book_of_light') {
      return this.archiveConfig.retentionPeriods.genesis;
    }
    if (metadata.source === 'conversation') {
      return this.archiveConfig.retentionPeriods.conversation;
    }
    return this.archiveConfig.retentionPeriods.research;
  }
}

/**
 * 📚 Dewey Data Classifier - Advanced Classification System
 * Combines traditional Dewey Decimal System with AI-powered classification
 */
class DeweyDataClassifier {
  constructor(config = {}) {
    this.gcpProjectId = config.gcpProjectId || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.secretManager = new SecretManagerServiceClient();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({ filename: './logs/didc-dewey-classifier.log' }),
        new winston.transports.Console({ format: winston.format.simple() }),
      ],
    });

    // Dewey classification mappings (extensible to 99,000 categories)
    this.deweyMap = {
      '000': {
        description: 'Computer Science, Knowledge & General Works',
        keywords: ['information', 'data', 'general'],
      },
      100: {
        description: 'Philosophy & Psychology',
        keywords: ['philosophy', 'psychology', 'mind'],
      },
      200: { description: 'Religion & Theology', keywords: ['religion', 'theology', 'spiritual'] },
      300: { description: 'Social Sciences', keywords: ['sociology', 'politics', 'economics'] },
      400: { description: 'Language', keywords: ['language', 'linguistics', 'communication'] },
      500: { description: 'Pure Sciences', keywords: ['mathematics', 'physics', 'chemistry'] },
      600: {
        description: 'Technology & Applied Sciences',
        keywords: ['technology', 'engineering', 'medicine'],
      },
      700: { description: 'Arts & Recreation', keywords: ['art', 'music', 'sports'] },
      800: { description: 'Literature', keywords: ['literature', 'poetry', 'writing'] },
      900: { description: 'History & Geography', keywords: ['history', 'geography', 'biography'] },
    };

    // Career cluster mappings (33 clusters)
    this.careerClusters = {
      1: 'Agriculture, Food & Natural Resources',
      2: 'Architecture & Construction',
      3: 'Arts, Audio/Video Technology & Communications',
      4: 'Business Management & Administration',
      5: 'Education & Training',
      6: 'Finance',
      7: 'Government & Public Administration',
      8: 'Health Science',
      9: 'Hospitality & Tourism',
      10: 'Human Services',
      11: 'Information Technology',
      12: 'Law, Public Safety, Corrections & Security',
      13: 'Manufacturing',
      14: 'Marketing',
      15: 'Science, Technology, Engineering & Mathematics',
      16: 'Transportation, Distribution & Logistics',
      // ... (extends to 33 total clusters)
    };

    console.log('📚 Dewey Data Classifier initialized with AI fallback');
  }

  /**
   * Initialize the classification system
   */
  async initialize() {
    try {
      // Load OpenAI API key for AI-powered classification fallback
      this.openaiApiKey = await this.getSecretValue('OPENAI_API_KEY');

      if (!this.openaiApiKey) {
        this.logger.warn(
          '⚠️ OpenAI API key not found - falling back to rule-based classification only'
        );
      }

      this.logger.info('✅ Dewey Data Classifier initialized');
      return true;
    } catch (error) {
      this.logger.error('❌ Dewey classifier initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Classify data using Dewey Decimal System + AI
   */
  async classifyData(content, context = {}) {
    try {
      // Step 1: Rule-based classification
      const ruleBasedResult = this.performRuleBasedClassification(content);

      // Step 2: AI-powered classification (if API key available)
      let aiClassification = null;
      if (this.openaiApiKey && ruleBasedResult.confidence < 0.8) {
        aiClassification = await this.performAIClassification(content, context);
      }

      // Step 3: Combine results
      const finalClassification = this.combineClassifications(ruleBasedResult, aiClassification);

      this.logger.info('📊 Data classification completed', {
        deweyCode: finalClassification.deweyCode,
        confidence: finalClassification.confidence,
        method: finalClassification.method,
      });

      return finalClassification;
    } catch (error) {
      this.logger.error('❌ Data classification failed', { error: error.message });

      // Return default classification
      return {
        deweyCode: '000',
        description: 'General Works',
        confidence: 0.3,
        method: 'fallback',
        error: error.message,
      };
    }
  }

  /**
   * Rule-based classification using keyword matching
   */
  performRuleBasedClassification(content) {
    const contentLower = content.toLowerCase();
    let bestMatch = { deweyCode: '000', score: 0, description: 'General Works' };

    for (const [deweyCode, info] of Object.entries(this.deweyMap)) {
      let score = 0;

      for (const keyword of info.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches * 2; // Weight keyword matches
      }

      if (score > bestMatch.score) {
        bestMatch = {
          deweyCode,
          score,
          description: info.description,
        };
      }
    }

    return {
      deweyCode: bestMatch.deweyCode,
      description: bestMatch.description,
      confidence: Math.min(bestMatch.score * 0.1, 0.95),
      method: 'rule-based',
    };
  }

  /**
   * AI-powered classification using OpenAI
   */
  async performAIClassification(content, context = {}) {
    try {
      const prompt = `Classify the following content according to the Dewey Decimal System. 
Content: "${content.substring(0, 500)}..."
Context: ${JSON.stringify(context)}

Provide classification in this format:
- Dewey Code: [3-digit code]
- Description: [brief description]
- Confidence: [0-1 score]`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.choices[0].message.content;

      // Parse AI response (simplified - would need more robust parsing)
      const deweyMatch = result.match(/Dewey Code:\s*(\d{3})/);
      const confidenceMatch = result.match(/Confidence:\s*(0\.\d+|1\.0)/);

      return {
        deweyCode: deweyMatch ? deweyMatch[1] : '000',
        description: 'AI Classification',
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
        method: 'ai-powered',
        rawResponse: result,
      };
    } catch (error) {
      this.logger.error('❌ AI classification failed', { error: error.message });
      return null;
    }
  }

  /**
   * Combine rule-based and AI classifications
   */
  combineClassifications(ruleBased, aiResult) {
    if (!aiResult) {
      return ruleBased;
    }

    // Use AI result if significantly more confident
    if (aiResult.confidence > ruleBased.confidence + 0.2) {
      return {
        ...aiResult,
        method: 'ai-enhanced',
      };
    }

    // Use rule-based if more confident
    if (ruleBased.confidence > aiResult.confidence) {
      return {
        ...ruleBased,
        method: 'rule-based-verified',
      };
    }

    // Average if similar confidence
    return {
      deweyCode: ruleBased.deweyCode, // Prefer rule-based for ties
      description: ruleBased.description,
      confidence: (ruleBased.confidence + aiResult.confidence) / 2,
      method: 'hybrid',
    };
  }

  /**
   * Utility method to get secret values
   */
  async getSecretValue(secretName) {
    try {
      const name = `projects/${this.gcpProjectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretManager.accessSecretVersion({ name });
      return version.payload.data.toString();
    } catch (error) {
      return null;
    }
  }
}

/**
 * 🎯 Intentional Data Processor - Intent Analysis & Metadata Enrichment
 * Analyzes the purpose and intent behind data for better archival organization
 */
class IntentionalDataProcessor {
  constructor(config = {}) {
    this.gcpProjectId = config.gcpProjectId || process.env.GCP_PROJECT_ID || 'api-for-warp-drive';
    this.secretManager = new SecretManagerServiceClient();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({ filename: './logs/didc-intent-processor.log' }),
        new winston.transports.Console({ format: winston.format.simple() }),
      ],
    });

    // Intent classification patterns
    this.intentPatterns = {
      genesis: {
        keywords: ['genesis', 'book of light', 'sacred', 'divine', 'creation'],
        importance: 'critical',
        priority: 1,
      },
      research_and_analysis: {
        keywords: ['research', 'analysis', 'study', 'investigation', 'findings'],
        importance: 'high',
        priority: 2,
      },
      conversation: {
        keywords: ['conversation', 'dialogue', 'discussion', 'chat', 'communication'],
        importance: 'medium',
        priority: 3,
      },
      documentation: {
        keywords: ['documentation', 'manual', 'guide', 'instructions', 'reference'],
        importance: 'medium',
        priority: 4,
      },
      general_information: {
        keywords: ['information', 'data', 'content', 'material'],
        importance: 'low',
        priority: 5,
      },
    };

    console.log('🎯 Intentional Data Processor initialized');
  }

  /**
   * Initialize the intent processing system
   */
  async initialize() {
    try {
      this.logger.info('✅ Intentional Data Processor initialized');
      return true;
    } catch (error) {
      this.logger.error('❌ Intent processor initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze intent and enrich metadata
   */
  async analyzeIntent(content, context = {}) {
    try {
      // Detect primary intent
      const detectedIntent = this.detectIntent(content, context);

      // Analyze importance and priority
      const importanceAnalysis = this.analyzeImportance(content, detectedIntent);

      // Extract metadata
      const extractedMetadata = this.extractMetadata(content, context);

      // Apply HR flags if applicable
      const hrFlags = this.applyHRFlags(content, context);

      const analysis = {
        detectedPurpose: detectedIntent.intent,
        confidence: detectedIntent.confidence,
        importance: importanceAnalysis.importance,
        priority: importanceAnalysis.priority,
        metadata: extractedMetadata,
        hrFlags,
        processedAt: new Date().toISOString(),
      };

      this.logger.info('🎯 Intent analysis completed', {
        intent: detectedIntent.intent,
        confidence: detectedIntent.confidence,
        importance: importanceAnalysis.importance,
      });

      return analysis;
    } catch (error) {
      this.logger.error('❌ Intent analysis failed', { error: error.message });

      // Return default analysis
      return {
        detectedPurpose: 'general_information',
        confidence: 0.3,
        importance: 'medium',
        priority: 5,
        metadata: {},
        hrFlags: [],
        error: error.message,
      };
    }
  }

  /**
   * Detect intent from content and context
   */
  detectIntent(content, context) {
    const contentLower = content.toLowerCase();
    let bestMatch = { intent: 'general_information', score: 0 };

    for (const [intentKey, intentInfo] of Object.entries(this.intentPatterns)) {
      let score = 0;

      // Check keywords in content
      for (const keyword of intentInfo.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches;
      }

      // Context boosting
      if (context.source === 'book_of_light' && intentKey === 'genesis') {
        score += 10;
      }
      if (context.searchType === 'research' && intentKey === 'research_and_analysis') {
        score += 5;
      }

      if (score > bestMatch.score) {
        bestMatch = {
          intent: intentKey,
          score,
        };
      }
    }

    return {
      intent: bestMatch.intent,
      confidence: Math.min(bestMatch.score * 0.15, 0.95),
    };
  }

  /**
   * Analyze importance level
   */
  analyzeImportance(content, detectedIntent) {
    const intentInfo =
      this.intentPatterns[detectedIntent.intent] || this.intentPatterns.general_information;

    return {
      importance: intentInfo.importance,
      priority: intentInfo.priority,
      reasoning: `Classified as ${detectedIntent.intent} with ${intentInfo.importance} importance`,
    };
  }

  /**
   * Extract metadata from content and context
   */
  extractMetadata(content, context) {
    const metadata = {
      contentLength: content.length,
      estimatedReadTime: Math.ceil(content.split(' ').length / 200), // minutes
      extractedAt: new Date().toISOString(),
    };

    // Add context metadata
    if (context.companyId) metadata.companyId = context.companyId;
    if (context.searchType) metadata.searchType = context.searchType;
    if (context.source) metadata.source = context.source;

    return metadata;
  }

  /**
   * Apply HR flags based on content analysis
   */
  applyHRFlags(content, context) {
    const flags = [];
    const contentLower = content.toLowerCase();

    // Check for HR classifications mentioned in rules
    if (contentLower.includes('.hr1') || context.hrClassification === '.hr1') {
      flags.push('.hr1'); // LLP members working as full-time contractors
    }
    if (contentLower.includes('.hr2') || context.hrClassification === '.hr2') {
      flags.push('.hr2'); // LLP members working as employees
    }
    if (contentLower.includes('.hr3') || context.hrClassification === '.hr3') {
      flags.push('.hr3'); // Non-members working as employees or contractors
    }
    if (contentLower.includes('.hr4') || context.hrClassification === '.hr4') {
      flags.push('.hr4'); // LLP members not working for the LLP
    }

    return flags;
  }
}

// Export all components
module.exports = {
  DIDCArchivesCore,
  DeweyDataClassifier,
  IntentionalDataProcessor,
};

console.log('🕊️ DIDC Archives System - Production Implementation Loaded');
console.log('📚 Book of Light Foundation: Ready for Sacred Archival');
