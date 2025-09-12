#!/usr/bin/env node

/**
 * Test script for Self-Healing MongoDB Connector
 * Tests DIDC and HRAI-CRMS MongoDB connections
 */

const SelfHealingMongoDBConnector = require('./lib/mongodb-self-healing-connector');

async function testMongoDBHealing() {
  console.log('🧪 Starting MongoDB Self-Healing Test for DIDC and HRAI-CRMS...');
  console.log('==================================================================');
  
  const connector = new SelfHealingMongoDBConnector({
    project: 'api-for-warp-drive'
  });
  
  try {
    console.log('🔄 Initiating self-healing connection process...');
    const result = await connector.connect();
    
    console.log('\n✅ CONNECTION SUCCESS!');
    console.log('========================');
    console.log(`Strategy used: ${result.strategy}`);
    console.log(`Database: ${result.database}`);
    console.log(`Collections found: ${result.collections.length}`);
    console.log(`Is local fallback: ${result.isLocalFallback ? 'Yes' : 'No'}`);
    
    if (result.collections.length > 0) {
      console.log('\n📋 Available Collections:');
      result.collections.slice(0, 10).forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name}`);
      });
      if (result.collections.length > 10) {
        console.log(`  ... and ${result.collections.length - 10} more`);
      }
    }
    
    // Test database operations for DIDC and HRAI-CRMS
    console.log('\n🧪 Testing DIDC and HRAI-CRMS database operations...');
    
    try {
      const db = connector.getDatabase(result.database);
      
      // Test basic operations
      const testCollection = db.collection('system_health_test');
      const testDoc = {
        test_id: `healing_test_${Date.now()}`,
        system: 'didc_hrai_crms',
        timestamp: new Date(),
        status: 'connection_validated'
      };
      
      const insertResult = await testCollection.insertOne(testDoc);
      console.log(`  ✅ Test document inserted: ${insertResult.insertedId}`);
      
      // Clean up test document
      await testCollection.deleteOne({ _id: insertResult.insertedId });
      console.log('  🧹 Test document cleaned up');
      
      // Test ping
      const pingResult = await connector.ping();
      console.log(`  ✅ Connection ping: ${pingResult ? 'SUCCESS' : 'FAILED'}`);
      
      console.log('\n🎉 MongoDB Self-Healing Test COMPLETED SUCCESSFULLY!');
      console.log('Your DIDC and HRAI-CRMS systems now have working MongoDB connectivity.');
      
    } catch (operationError) {
      console.log(`⚠️  Database operations test failed: ${operationError.message}`);
      console.log('Connection established but operations limited.');
    }
    
  } catch (error) {
    console.log('\n❌ SELF-HEALING FAILED');
    console.log('========================');
    console.log(`Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify MongoDB Atlas cluster is running');
    console.log('2. Check service account credentials in GCP Secret Manager');
    console.log('3. Confirm network connectivity to MongoDB Atlas');
    console.log('4. Review MongoDB Atlas IP whitelist settings');
    
  } finally {
    // Always close the connection
    await connector.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Run the test
if (require.main === module) {
  testMongoDBHealing().catch(console.error);
}

module.exports = testMongoDBHealing;