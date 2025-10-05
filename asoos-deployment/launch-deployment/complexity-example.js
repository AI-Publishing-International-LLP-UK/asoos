#!/usr/bin/env node

/**
 * Example usage of the ComplexityAnalyzer
 * Demonstrates how to analyze code complexity metrics for your codebase
 */

import { ComplexityAnalyzer, analyzeComplexity } from './complexity-analyzer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runComplexityAnalysis() {
  console.log('🔍 Starting Code Complexity Analysis...\n');
  
  // Path to analyze (current directory by default)
  const codebasePath = process.argv[2] || path.join(__dirname, '../..');
  
  console.log(`📁 Analyzing codebase at: ${codebasePath}\n`);

  try {
    // Option 1: Use the simple function
    const complexityModel = await analyzeComplexity(codebasePath);
    
    // Option 2: Use the class directly for more control
    // const analyzer = new ComplexityAnalyzer({
    //   fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    //   ignorePatterns: ['node_modules', 'dist', 'build', '.backup'],
    //   maxFileSize: 2 * 1024 * 1024 // 2MB max file size
    // });
    // 
    // const complexityModel = {
    //   cyclomaticComplexity: await analyzer.calculateCyclomatic(codebasePath),
    //   cognitiveComplexity: await analyzer.analyzeCognitive(codebasePath),
    //   maintainabilityIndex: await analyzer.calculateMaintainability(codebasePath),
    //   technicalDebtRatio: await analyzer.assessTechnicalDebt(codebasePath)
    // };

    // Display results
    displayResults(complexityModel);
    
    // Generate report
    await generateReport(complexityModel, codebasePath);

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

function displayResults(complexityModel) {
  console.log('📊 CODE COMPLEXITY ANALYSIS RESULTS');
  console.log('=====================================\n');

  // Cyclomatic Complexity
  const cc = complexityModel.cyclomaticComplexity;
  console.log('🔄 CYCLOMATIC COMPLEXITY');
  console.log(`   Total Complexity: ${cc.totalComplexity}`);
  console.log(`   Average Complexity: ${cc.averageComplexity.toFixed(2)}`);
  console.log(`   Files Analyzed: ${cc.fileCount}`);
  console.log(`   High Complexity Files: ${cc.highComplexityFiles.length}`);
  console.log(`   Distribution: Low: ${cc.distribution.low}, Medium: ${cc.distribution.medium}, High: ${cc.distribution.high}, Very High: ${cc.distribution['very-high']}`);
  console.log();

  // Cognitive Complexity
  const cg = complexityModel.cognitiveComplexity;
  console.log('🧠 COGNITIVE COMPLEXITY');
  console.log(`   Total Cognitive Load: ${cg.totalCognitive}`);
  console.log(`   Average Cognitive Load: ${cg.averageCognitive.toFixed(2)}`);
  console.log(`   Overall Readability: ${cg.readabilityScore}`);
  console.log(`   Difficult Files: ${cg.difficultFiles.length}`);
  console.log();

  // Maintainability Index
  const mi = complexityModel.maintainabilityIndex;
  console.log('🔧 MAINTAINABILITY INDEX');
  console.log(`   Average Maintainability: ${mi.averageMaintainability}%`);
  console.log(`   Overall Grade: ${mi.overallGrade}`);
  console.log(`   Low Maintainability Files: ${mi.lowMaintainabilityFiles.length}`);
  console.log(`   Grade Distribution: A: ${mi.distribution.A}, B: ${mi.distribution.B}, C: ${mi.distribution.C}, D: ${mi.distribution.D}, F: ${mi.distribution.F}`);
  console.log();

  // Technical Debt
  const td = complexityModel.technicalDebtRatio;
  console.log('💳 TECHNICAL DEBT ANALYSIS');
  console.log(`   Technical Debt Ratio: ${td.technicalDebtRatio}%`);
  console.log(`   Debt Grade: ${td.debtGrade}`);
  console.log(`   Total Debt: ${Math.round(td.totalDebtMinutes / 60)} hours, ${td.totalDebtMinutes % 60} minutes`);
  console.log(`   Development Time: ${Math.round(td.totalDevelopmentMinutes / 60)} hours, ${td.totalDevelopmentMinutes % 60} minutes`);
  console.log(`   Files with Debt: ${td.filesWithDebt}/${td.fileCount}`);
  console.log();

  // Priority Issues
  if (td.priorityItems.length > 0) {
    console.log('🚨 TOP PRIORITY DEBT ITEMS:');
    td.priorityItems.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.file}`);
      console.log(`      Debt Ratio: ${item.debtRatio.toFixed(1)}%`);
      console.log(`      Issues: ${item.issues.length} (${item.issues.filter(i => i.severity === 'high').length} high priority)`);
    });
    console.log();
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (cc.averageComplexity > 10) {
    console.log('   • Focus on reducing cyclomatic complexity in high-complexity files');
  }
  if (cg.readabilityScore === 'poor' || cg.readabilityScore === 'fair') {
    console.log('   • Improve code readability by simplifying complex logic');
  }
  if (mi.averageMaintainability < 50) {
    console.log('   • Urgent: Address low maintainability files');
  }
  if (td.technicalDebtRatio > 20) {
    console.log('   • High technical debt detected - prioritize refactoring');
  }
  if (td.debtGrade === 'D' || td.debtGrade === 'F') {
    console.log('   • Consider dedicated refactoring sprint');
  }
  console.log();
}

async function generateReport(complexityModel, codebasePath) {
  const reportPath = path.join(__dirname, 'complexity-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    codebasePath,
    summary: {
      averageComplexity: complexityModel.cyclomaticComplexity.averageComplexity,
      readabilityScore: complexityModel.cognitiveComplexity.readabilityScore,
      maintainabilityGrade: complexityModel.maintainabilityIndex.overallGrade,
      technicalDebtGrade: complexityModel.technicalDebtRatio.debtGrade,
      overallHealth: calculateOverallHealth(complexityModel)
    },
    details: complexityModel
  };

  try {
    await import('fs/promises').then(fs => 
      fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    );
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️  Could not save report:', error.message);
  }
}

function calculateOverallHealth(complexityModel) {
  const cc = complexityModel.cyclomaticComplexity;
  const cg = complexityModel.cognitiveComplexity;
  const mi = complexityModel.maintainabilityIndex;
  const td = complexityModel.technicalDebtRatio;

  // Simple scoring system (0-100)
  let score = 100;

  // Deduct points for high complexity
  if (cc.averageComplexity > 10) score -= 20;
  else if (cc.averageComplexity > 5) score -= 10;

  // Deduct points for poor readability
  if (cg.readabilityScore === 'poor') score -= 25;
  else if (cg.readabilityScore === 'fair') score -= 15;

  // Deduct points for low maintainability
  if (mi.averageMaintainability < 25) score -= 30;
  else if (mi.averageMaintainability < 50) score -= 20;
  else if (mi.averageMaintainability < 70) score -= 10;

  // Deduct points for high technical debt
  if (td.technicalDebtRatio > 50) score -= 25;
  else if (td.technicalDebtRatio > 20) score -= 15;
  else if (td.technicalDebtRatio > 10) score -= 10;

  score = Math.max(0, score);

  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

// Run the analysis if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComplexityAnalysis().catch(console.error);
}

export { runComplexityAnalysis, displayResults, generateReport };