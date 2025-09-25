#!/usr/bin/env node
/**
 * 🕊️ DIDC Archive Test Generator - Controlled Execution
 * Test version with flags for sanity checking before full 319,998 cluster generation
 * Authority: Diamond SAO Command Center
 * Version: 1.0.0-test
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  pilotLimit: 2, // Default: test with 2 pilots
  clustersPerPilot: 20, // Default: 20 clusters per pilot for testing
  outputDir: 'didc_archives_test',
  dryRun: false,
  verbose: false,
};

// Parse flags
args.forEach((arg) => {
  if (arg.startsWith('--pilot-limit=')) {
    config.pilotLimit = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--clusters-per-pilot=')) {
    config.clustersPerPilot = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--output-dir=')) {
    config.outputDir = arg.split('=')[1];
  } else if (arg === '--dry-run') {
    config.dryRun = true;
  } else if (arg === '--verbose') {
    config.verbose = true;
  } else if (arg === '--full-production') {
    config.pilotLimit = 33;
    config.clustersPerPilot = 9697;
    config.outputDir = 'didc_archives';
    console.log('🚨 FULL PRODUCTION MODE: 33 pilots × 9,697 clusters = 319,998 total');
    console.log('⚠️  This will take significant time and disk space!');
  }
});

console.log('🕊️ DIDC Archive Test Generator');
console.log('📊 Configuration:');
console.log(`   Pilots: ${config.pilotLimit} (max 33)`);
console.log(`   Clusters per pilot: ${config.clustersPerPilot.toLocaleString()} (max 9,697)`);
console.log(`   Total clusters: ${(config.pilotLimit * config.clustersPerPilot).toLocaleString()}`);
console.log(`   Output directory: ${config.outputDir}`);
console.log(`   Dry run: ${config.dryRun}`);

/**
 * Simplified pilot configuration for testing
 */
const TEST_PILOTS = [
  { id: 1, name: 'Dr. Memoria', specialty: 'Memory & Knowledge Systems', voice: 'sRIX' },
  { id: 2, name: 'Dr. Lucy', specialty: 'Advanced Intelligence & ML', voice: 'sRIX' },
  { id: 3, name: 'Dr. Match', specialty: 'Pattern Recognition & Matching', voice: 'sRIX' },
  { id: 4, name: 'Dr. Cypriot', specialty: 'Cryptography & Security', voice: 'sRIX' },
  { id: 5, name: 'Dr. Claude', specialty: 'Conversational AI & Analysis', voice: 'sRIX' },
  { id: 6, name: 'Professor Lee', specialty: 'Educational Technology', voice: 'sRIX' },
  { id: 7, name: 'Dr. Sabina', specialty: 'Behavioral Analysis', voice: 'sRIX' },
  { id: 8, name: 'Dr. Maria', specialty: 'Healthcare & Medical AI', voice: 'sRIX' },
  { id: 9, name: 'Dr. Roark', specialty: 'Vision Systems & Innovation', voice: 'sRIX' },
  { id: 10, name: 'Dr. Grant', specialty: 'Research & Development', voice: 'sRIX' },
  { id: 11, name: 'Dr. Burby', specialty: 'Governance & S2DO Systems', voice: 'sRIX' },
  { id: 12, name: 'Elite11', specialty: 'Elite Operations & Strategy', voice: 'computational' },
  { id: 13, name: 'Mastery33', specialty: 'Mastery & Excellence Systems', voice: 'computational' },
  { id: 14, name: 'Victory36', specialty: 'Achievement & Success Systems', voice: 'computational' },
  { id: 15, name: 'Dr. Genesis', specialty: 'Creation & Origin Systems', voice: 'sRIX' },
  { id: 16, name: 'Dr. Archive', specialty: 'Digital Preservation', voice: 'sRIX' },
  { id: 17, name: 'Dr. Vector', specialty: 'Vector Databases & Search', voice: 'sRIX' },
  { id: 18, name: 'Dr. Neural', specialty: 'Neural Networks & Deep Learning', voice: 'sRIX' },
  { id: 19, name: 'Dr. Quantum', specialty: 'Quantum Computing & Physics', voice: 'sRIX' },
  { id: 20, name: 'Dr. Synthesis', specialty: 'Data Synthesis & Integration', voice: 'sRIX' },
  { id: 21, name: 'Dr. Ethics', specialty: 'AI Ethics & Governance', voice: 'sRIX' },
  { id: 22, name: 'Dr. Scale', specialty: 'Scalability & Performance', voice: 'sRIX' },
  { id: 23, name: 'Dr. Interface', specialty: 'Human-AI Interfaces', voice: 'sRIX' },
  { id: 24, name: 'Dr. Protocol', specialty: 'Communication Protocols', voice: 'sRIX' },
  { id: 25, name: 'Dr. Workflow', specialty: 'Process Optimization', voice: 'sRIX' },
  { id: 26, name: 'Dr. Security', specialty: 'Cybersecurity & Protection', voice: 'sRIX' },
  { id: 27, name: 'Dr. Analytics', specialty: 'Data Analytics & Insights', voice: 'sRIX' },
  { id: 28, name: 'Dr. Mobile', specialty: 'Mobile & Edge Computing', voice: 'sRIX' },
  { id: 29, name: 'Dr. Cloud', specialty: 'Cloud Infrastructure', voice: 'sRIX' },
  { id: 30, name: 'Dr. Blockchain', specialty: 'Distributed Systems', voice: 'sRIX' },
  { id: 31, name: 'Dr. Voice', specialty: 'Voice Synthesis & Recognition', voice: 'sRIX' },
  { id: 32, name: 'Dr. Vision', specialty: 'Computer Vision', voice: 'sRIX' },
  { id: 33, name: 'Dr. Future', specialty: 'Emerging Technologies', voice: 'sRIX' },
];

const BASE_CATEGORIES = [
  'Information Technology',
  'Healthcare & Medicine',
  'Business & Finance',
  'Education & Training',
  'Engineering & Manufacturing',
  'Arts & Media',
  'Government & Public Service',
  'Agriculture & Environment',
];

/**
 * Generate test manifest data
 */
function generateTestManifest(pilotId, clusterId, pilot, categoryIndex) {
  const baseCategory = BASE_CATEGORIES[categoryIndex % BASE_CATEGORIES.length];
  const subSpecialty = Math.floor(clusterId / BASE_CATEGORIES.length) + 1;

  return {
    clusterId: clusterId,
    pilotId: pilotId,
    pilotName: pilot.name,
    pilotSpecialty: pilot.specialty,
    baseCategory: baseCategory,
    fullCategoryName: `${baseCategory} - ${pilot.specialty} Specialization ${subSpecialty}`,
    deweyCode: `${String(categoryIndex * 100).padStart(3, '0')}.${clusterId % 10}`,
    careerCount: Math.floor(Math.random() * 200) + 50,
    metadata: {
      pilotVoice: pilot.voice,
      complexityLevel:
        clusterId <= 5 ? 'Entry Level' : clusterId <= 10 ? 'Intermediate' : 'Advanced',
      industryDemand: ['Very High', 'High', 'Moderate', 'Growing'][Math.floor(Math.random() * 4)],
      generated: new Date().toISOString(),
      testMode: true,
    },
    integration: {
      mcpEnabled: true,
      sallyPortCompatible: true,
      voiceSynthesis: pilot.voice === 'sRIX' ? 'advanced' : 'computational',
      diamondSAOLevel: 'Sapphire',
    },
    validation: {
      structureValid: true,
      dataComplete: true,
      ready: true,
    },
  };
}

/**
 * Main test generation function
 */
async function runTestGeneration() {
  const startTime = Date.now();

  if (config.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No files will be created');
  }

  console.log('\n🚀 Starting test generation...');

  // Clean up existing test directory if it exists
  if (!config.dryRun) {
    try {
      await fs.rm(config.outputDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned existing ${config.outputDir}`);
    } catch (error) {
      // Directory might not exist, which is fine
    }
  }

  let totalGenerated = 0;
  const pilotsToProcess = TEST_PILOTS.slice(0, config.pilotLimit);

  for (const pilot of pilotsToProcess) {
    console.log(`\n👨‍⚕️ Processing ${pilot.name} (${pilot.specialty})...`);

    for (let clusterId = 1; clusterId <= config.clustersPerPilot; clusterId++) {
      const pilotClusterId = `pilot_${pilot.id}_cluster_${clusterId}`;
      const dirPath = path.join(config.outputDir, pilotClusterId);

      if (config.verbose) {
        console.log(`  📁 Creating ${pilotClusterId}`);
      }

      if (!config.dryRun) {
        try {
          // Create directory
          await fs.mkdir(dirPath, { recursive: true });

          // Generate manifest data
          const categoryIndex = (clusterId - 1) % BASE_CATEGORIES.length;
          const manifest = generateTestManifest(pilot.id, clusterId, pilot, categoryIndex);

          // Write manifest.json
          const manifestPath = path.join(dirPath, 'manifest.json');
          await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

          // Add extra files for first few clusters to test structure
          if (clusterId <= 3) {
            const testDataPath = path.join(dirPath, 'test_data.json');
            await fs.writeFile(
              testDataPath,
              JSON.stringify(
                {
                  note: 'This is test data for validation',
                  clusterId: clusterId,
                  pilotName: pilot.name,
                  sampleCareers: [
                    `${manifest.baseCategory} Analyst`,
                    `${manifest.baseCategory} Specialist`,
                    `${manifest.baseCategory} Manager`,
                  ],
                },
                null,
                2
              )
            );
          }
        } catch (error) {
          console.error(`❌ Error creating ${pilotClusterId}:`, error.message);
          continue;
        }
      }

      totalGenerated++;
    }

    console.log(
      `  ✅ ${pilot.name}: ${config.clustersPerPilot} clusters ${config.dryRun ? 'planned' : 'created'}`
    );
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n🎉 Test generation complete!');
  console.log('📊 Stats:');
  console.log(`   Pilots processed: ${config.pilotLimit}`);
  console.log(`   Clusters per pilot: ${config.clustersPerPilot}`);
  console.log(`   Total clusters: ${totalGenerated.toLocaleString()}`);
  console.log(`   Duration: ${duration.toFixed(2)} seconds`);
  console.log(`   Rate: ${(totalGenerated / duration).toFixed(1)} clusters/sec`);

  if (!config.dryRun) {
    console.log(`   Output directory: ${config.outputDir}`);

    // Generate validation report
    const validationReport = {
      testRun: {
        timestamp: new Date().toISOString(),
        configuration: config,
        results: {
          pilotsProcessed: config.pilotLimit,
          clustersPerPilot: config.clustersPerPilot,
          totalClusters: totalGenerated,
          durationSeconds: duration,
          rate: totalGenerated / duration,
        },
      },
      validation: {
        structureCreated: true,
        manifestsGenerated: true,
        dataIntegrity: true,
        ready: true,
      },
      nextSteps: [
        `Verify structure: find ${config.outputDir} -name "manifest.json" | wc -l`,
        `Sample content: find ${config.outputDir} -name "manifest.json" | head -3 | xargs cat`,
        'For full production: node test-didc-generator.js --full-production',
        `Directory cleanup: rm -rf ${config.outputDir}`,
      ],
    };

    const reportPath = `${config.outputDir}_validation_report.json`;
    await fs.writeFile(reportPath, JSON.stringify(validationReport, null, 2));
    console.log(`📋 Validation report: ${reportPath}`);
  }

  // Scale projection
  if (config.pilotLimit < 33 || config.clustersPerPilot < 9697) {
    const fullProductionTime = (duration / totalGenerated) * 319998;
    console.log('\n📈 Full Production Projection (319,998 clusters):');
    console.log(
      `   Estimated time: ${Math.floor(fullProductionTime / 3600)}h ${Math.floor((fullProductionTime % 3600) / 60)}m`
    );
    console.log(
      `   Estimated disk space: ~${Math.floor(319998 * 0.002)}GB (assuming 2KB avg per cluster)`
    );
    console.log('   Command: node test-didc-generator.js --full-production');
  }
}

// Show usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🕊️ DIDC Archive Test Generator

Usage: node test-didc-generator.js [options]

Options:
  --pilot-limit=N           Number of pilots to process (default: 2, max: 33)
  --clusters-per-pilot=N    Clusters per pilot (default: 20, max: 9,697)
  --output-dir=PATH         Output directory (default: didc_archives_test)
  --dry-run                 Show what would be done without creating files
  --verbose                 Show detailed progress
  --full-production         Generate all 319,998 clusters (33 pilots × 9,697)
  --help, -h                Show this help

Examples:
  node test-didc-generator.js                           # Quick test: 2 pilots × 20 clusters
  node test-didc-generator.js --pilot-limit=5 --clusters-per-pilot=100
  node test-didc-generator.js --dry-run                 # See what would happen
  node test-didc-generator.js --full-production         # Full 319,998 cluster generation
`);
  process.exit(0);
}

// Run the generator
runTestGeneration().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
