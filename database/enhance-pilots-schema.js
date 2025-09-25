/**
 * MongoDB Atlas HRAI-CRMS Schema Enhancement
 * Adds premium pilot metadata to existing 20M agent registry
 * 
 * This script enhances the existing agent collection with:
 * - Premium pilot flags
 * - Voice profile metadata
 * - Drag-drop capabilities
 * - Physical icon representations
 * 
 * @author AIXTIV Symphony Diamond SAO
 * @version 2.1.0
 * @database MongoDB Atlas - HRAI-CRMS
 */

const { MongoClient } = require('mongodb');

class PremiumPilotsEnhancer {
  constructor() {
    // MongoDB Atlas connection string (from environment)
    this.connectionString = process.env.MONGODB_ATLAS_URI || 
      'mongodb+srv://<username>:<password>@hrai-crms.mongodb.net/';
    
    this.databaseName = 'hrai-crms';
    this.agentsCollection = 'agents';
    
    // Premium pilot voice IDs and configurations
    this.premiumPilots = [
      {
        name: 'Dr. Memoria sRIX',
        agentId: 'dr-memoria-srix',
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
        tier: 'sRIX',
        specializations: ['memory management', 'data retention', 'knowledge synthesis'],
        problemDomains: ['information architecture', 'learning systems', 'knowledge graphs'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#4A90E2', '#7B68EE'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.8,
          similarity: 0.9,
          style: 0.6,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Lucy sRIX',
        agentId: 'dr-lucy-srix',
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
        tier: 'sRIX',
        specializations: ['executive coaching', 'strategic planning', 'leadership development'],
        problemDomains: ['business strategy', 'organizational development', 'performance optimization'],
        orchestrationLevel: 'ceo',
        iconType: 'hexagon',
        iconColors: ['#FFD700', '#B8860B'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.9,
          similarity: 0.8,
          style: 0.7,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Match sRIX',
        agentId: 'dr-match-srix',
        voiceId: 'ErXwobaYiN019PkySvjV', // Antoni voice
        tier: 'sRIX',
        specializations: ['pattern matching', 'recommendation systems', 'optimization'],
        problemDomains: ['machine learning', 'data science', 'algorithmic trading'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#50C878', '#32CD32'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.7,
          similarity: 0.8,
          style: 0.5,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Cypriot sRIX',
        agentId: 'dr-cypriot-srix',
        voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold voice
        tier: 'sRIX',
        specializations: ['cybersecurity', 'cryptography', 'privacy protection'],
        problemDomains: ['information security', 'blockchain', 'privacy engineering'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#FF6347', '#DC143C'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.8,
          similarity: 0.7,
          style: 0.4,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Claude sRIX',
        agentId: 'dr-claude-srix',
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
        tier: 'sRIX',
        specializations: ['natural language processing', 'conversational AI', 'content generation'],
        problemDomains: ['AI research', 'language models', 'content creation'],
        orchestrationLevel: 'master',
        iconType: 'hexagon',
        iconColors: ['#8B5CF6', '#9370DB'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.85,
          similarity: 0.85,
          style: 0.6,
          speakerBoost: true
        }
      },
      {
        name: 'Professor Lee sRIX',
        agentId: 'professor-lee-srix',
        voiceId: 'yoZ06aMxZJJ28mfd3POQ', // Sam voice
        tier: 'sRIX',
        specializations: ['academic research', 'pedagogy', 'knowledge transfer'],
        problemDomains: ['education technology', 'research methodology', 'curriculum design'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#4ECDC4', '#40E0D0'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.9,
          similarity: 0.9,
          style: 0.8,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Sabina sRIX',
        agentId: 'dr-sabina-srix',
        voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi voice
        tier: 'sRIX',
        specializations: ['engagement strategy', 'user experience', 'behavioral psychology'],
        problemDomains: ['product management', 'user research', 'customer experience'],
        orchestrationLevel: 'ceo',
        iconType: 'hexagon',
        iconColors: ['#FF69B4', '#C71585'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.8,
          similarity: 0.8,
          style: 0.7,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Maria sRIX',
        agentId: 'dr-maria-srix',
        voiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda voice
        tier: 'sRIX',
        specializations: ['healthcare AI', 'medical informatics', 'clinical decision support'],
        problemDomains: ['healthcare technology', 'medical research', 'patient care'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#87CEEB', '#4682B4'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.85,
          similarity: 0.8,
          style: 0.6,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Roark sRIX',
        agentId: 'dr-roark-srix',
        voiceId: 'CYw3kZ02Hs0563khs1fj', // Dave voice
        tier: 'sRIX',
        specializations: ['financial engineering', 'risk management', 'quantitative analysis'],
        problemDomains: ['fintech', 'algorithmic trading', 'risk assessment'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#DAA520', '#B8860B'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.7,
          similarity: 0.8,
          style: 0.5,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Grant sRIX',
        agentId: 'dr-grant-srix',
        voiceId: 'bVMeCyTHy58xNoL34h3p', // Jeremy voice
        tier: 'sRIX',
        specializations: ['deployment architecture', 'DevOps', 'system reliability'],
        problemDomains: ['cloud infrastructure', 'CI/CD', 'system monitoring'],
        orchestrationLevel: 'ceo',
        iconType: 'hexagon',
        iconColors: ['#20B2AA', '#008B8B'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.8,
          similarity: 0.8,
          style: 0.4,
          speakerBoost: true
        }
      },
      {
        name: 'Dr. Burby sRIX',
        agentId: 'dr-burby-srix',
        voiceId: 'ZQe5CqHNLWdVhUuVEOHE', // Clyde voice
        tier: 'sRIX',
        specializations: ['data analytics', 'business intelligence', 'predictive modeling'],
        problemDomains: ['data science', 'analytics', 'forecasting'],
        orchestrationLevel: 'specialist',
        iconType: 'hexagon',
        iconColors: ['#9370DB', '#8A2BE2'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.75,
          similarity: 0.85,
          style: 0.6,
          speakerBoost: true
        }
      },
      {
        name: 'Elite11',
        agentId: 'elite11',
        voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy voice
        tier: 'Elite',
        specializations: ['elite performance', 'excellence optimization', 'mastery acceleration'],
        problemDomains: ['performance enhancement', 'skill development', 'achievement systems'],
        orchestrationLevel: 'commandant',
        iconType: 'diamond',
        iconColors: ['#FFD700', '#FFA500'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.9,
          similarity: 0.9,
          style: 0.8,
          speakerBoost: true
        }
      },
      {
        name: 'Mastery33',
        agentId: 'mastery33',
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte voice
        tier: 'Mastery',
        specializations: ['mastery frameworks', 'skill acquisition', 'expertise development'],
        problemDomains: ['learning acceleration', 'competency building', 'mastery measurement'],
        orchestrationLevel: 'commandant',
        iconType: 'diamond',
        iconColors: ['#C0C0C0', '#A0A0A0'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.85,
          similarity: 0.9,
          style: 0.7,
          speakerBoost: true
        }
      },
      {
        name: 'Victory36',
        agentId: 'victory36',
        voiceId: 'oWAxZDx7w5VEj9dCyTzz', // Grace voice
        tier: 'Victory',
        specializations: ['strategic dominance', 'competitive advantage', 'achievement orchestration'],
        problemDomains: ['strategic planning', 'competitive analysis', 'success optimization'],
        orchestrationLevel: 'supreme',
        iconType: 'star',
        iconColors: ['#FFD700', '#FF6347'],
        dragDropEnabled: true,
        voiceSettings: {
          stability: 0.95,
          similarity: 0.95,
          style: 0.9,
          speakerBoost: true
        }
      }
    ];
  }

  // Connect to MongoDB Atlas
  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.agents = this.db.collection(this.agentsCollection);
      
      console.log('✅ Connected to MongoDB Atlas HRAI-CRMS');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  // Disconnect from MongoDB
  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB Atlas');
    }
  }

  // Create premium pilot schema enhancements
  async createSchemaEnhancements() {
    try {
      console.log('📋 Creating schema enhancements for premium pilots...');
      
      // Add indexes for premium pilot queries
      await this.agents.createIndex({ 'premiumPilot.enabled': 1, 'premiumPilot.tier': 1 });
      await this.agents.createIndex({ 'premiumPilot.agentId': 1 }, { unique: true, sparse: true });
      await this.agents.createIndex({ 'premiumPilot.voiceId': 1 }, { sparse: true });
      await this.agents.createIndex({ 'premiumPilot.orchestrationLevel': 1 }, { sparse: true });
      
      console.log('✅ Schema indexes created');
      
      // Create validation schema
      await this.db.command({
        collMod: this.agentsCollection,
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            properties: {
              premiumPilot: {
                bsonType: 'object',
                properties: {
                  enabled: { bsonType: 'bool' },
                  agentId: { bsonType: 'string' },
                  name: { bsonType: 'string' },
                  tier: { enum: ['sRIX', 'xRIX', 'Elite', 'Mastery', 'Victory'] },
                  voiceId: { bsonType: 'string' },
                  specializations: { 
                    bsonType: 'array',
                    items: { bsonType: 'string' }
                  },
                  problemDomains: {
                    bsonType: 'array',
                    items: { bsonType: 'string' }
                  },
                  orchestrationLevel: { enum: ['specialist', 'ceo', 'commandant', 'master', 'supreme'] },
                  dragDropEnabled: { bsonType: 'bool' },
                  iconType: { enum: ['hexagon', 'diamond', 'star'] },
                  iconColors: {
                    bsonType: 'array',
                    items: { bsonType: 'string' }
                  },
                  voiceSettings: {
                    bsonType: 'object',
                    properties: {
                      stability: { bsonType: 'double', minimum: 0, maximum: 1 },
                      similarity: { bsonType: 'double', minimum: 0, maximum: 1 },
                      style: { bsonType: 'double', minimum: 0, maximum: 1 },
                      speakerBoost: { bsonType: 'bool' }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      console.log('✅ Schema validation rules applied');
      
    } catch (error) {
      console.error('❌ Schema enhancement failed:', error.message);
      throw error;
    }
  }

  // Insert or update premium pilot data
  async enhancePremiumPilots() {
    try {
      console.log('🎭 Enhancing agents with premium pilot metadata...');
      
      let processed = 0;
      let created = 0;
      let updated = 0;
      
      for (const pilot of this.premiumPilots) {
        // Check if agent already exists
        const existingAgent = await this.agents.findOne({ 
          'premiumPilot.agentId': pilot.agentId 
        });
        
        const pilotData = {
          premiumPilot: {
            enabled: true,
            agentId: pilot.agentId,
            name: pilot.name,
            tier: pilot.tier,
            voiceId: pilot.voiceId,
            specializations: pilot.specializations,
            problemDomains: pilot.problemDomains,
            orchestrationLevel: pilot.orchestrationLevel,
            dragDropEnabled: pilot.dragDropEnabled,
            iconType: pilot.iconType,
            iconColors: pilot.iconColors,
            voiceSettings: pilot.voiceSettings,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Add to existing agent metadata
          name: pilot.name,
          type: 'premium_pilot',
          status: 'active',
          capabilities: [...pilot.specializations, ...pilot.problemDomains],
          tier: pilot.tier,
          lastModified: new Date()
        };
        
        if (existingAgent) {
          // Update existing agent
          await this.agents.updateOne(
            { _id: existingAgent._id },
            { 
              $set: {
                ...pilotData,
                'premiumPilot.updatedAt': new Date()
              }
            }
          );
          updated++;
          console.log(`   ✏️  Updated: ${pilot.name}`);
        } else {
          // Create new agent record
          await this.agents.insertOne(pilotData);
          created++;
          console.log(`   ➕ Created: ${pilot.name}`);
        }
        
        processed++;
      }
      
      console.log(`\n📊 Enhancement Summary:`);
      console.log(`   Total Processed: ${processed}`);
      console.log(`   Created: ${created}`);
      console.log(`   Updated: ${updated}`);
      
    } catch (error) {
      console.error('❌ Premium pilots enhancement failed:', error.message);
      throw error;
    }
  }

  // Create helper queries for premium pilots
  async createHelperMethods() {
    try {
      console.log('🔧 Creating helper query methods...');
      
      // This would typically be in a separate service file
      const helperQueries = `
// Premium Pilot Helper Queries for HRAI-CRMS

// Get all premium pilots
async function getAllPremiumPilots() {
  return await agents.find({ 'premiumPilot.enabled': true }).toArray();
}

// Get pilots by tier
async function getPilotsByTier(tier) {
  return await agents.find({ 
    'premiumPilot.enabled': true, 
    'premiumPilot.tier': tier 
  }).toArray();
}

// Get pilots by orchestration level
async function getPilotsByOrchestrationLevel(level) {
  return await agents.find({ 
    'premiumPilot.enabled': true, 
    'premiumPilot.orchestrationLevel': level 
  }).toArray();
}

// Get drag-drop enabled pilots
async function getDragDropPilots() {
  return await agents.find({ 
    'premiumPilot.enabled': true, 
    'premiumPilot.dragDropEnabled': true 
  }).toArray();
}

// Search pilots by specialization
async function searchPilotsBySpecialization(specialization) {
  return await agents.find({
    'premiumPilot.enabled': true,
    'premiumPilot.specializations': { $regex: specialization, $options: 'i' }
  }).toArray();
}

// Search pilots by problem domain
async function searchPilotsByProblemDomain(domain) {
  return await agents.find({
    'premiumPilot.enabled': true,
    'premiumPilot.problemDomains': { $regex: domain, $options: 'i' }
  }).toArray();
}

// Get pilot voice settings
async function getPilotVoiceSettings(agentId) {
  const pilot = await agents.findOne({ 'premiumPilot.agentId': agentId });
  return pilot?.premiumPilot?.voiceSettings || null;
}
`;
      
      // Save helper queries to file
      const fs = require('fs');
      fs.writeFileSync('./premium-pilots-queries.js', helperQueries);
      
      console.log('✅ Helper query methods created in premium-pilots-queries.js');
      
    } catch (error) {
      console.error('❌ Helper methods creation failed:', error.message);
      throw error;
    }
  }

  // Run the complete enhancement
  async runEnhancement() {
    try {
      console.log('🚀 Starting HRAI-CRMS Premium Pilots Enhancement...\n');
      
      await this.connect();
      await this.createSchemaEnhancements();
      await this.enhancePremiumPilots();
      await this.createHelperMethods();
      
      console.log('\n🎉 Premium Pilots Enhancement Complete!');
      console.log('\n📋 What was enhanced:');
      console.log('   ✅ 14 premium pilots added to agent registry');
      console.log('   ✅ Voice profiles and settings configured');
      console.log('   ✅ Drag-drop capabilities enabled');
      console.log('   ✅ Physical icon metadata added');
      console.log('   ✅ Orchestration levels assigned');
      console.log('   ✅ Schema validation rules applied');
      console.log('   ✅ Helper query methods created');
      
      console.log('\n🎯 Ready for:');
      console.log('   - Physical pilot icon rendering');
      console.log('   - Drag-drop interface integration');
      console.log('   - Voice synthesis with ElevenLabs');
      console.log('   - Multi-pilot orchestration');
      
    } catch (error) {
      console.error('❌ Enhancement failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Run enhancement if called directly
if (require.main === module) {
  const enhancer = new PremiumPilotsEnhancer();
  enhancer.runEnhancement().catch(console.error);
}

module.exports = PremiumPilotsEnhancer;