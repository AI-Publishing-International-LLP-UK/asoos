#!/usr/bin/env node

/**
 * 🎯 VISION SPEAK DEMO - DIAMOND CLI
 * 
 * Demonstrates the Vision Speak "V" command functionality
 * Shows how to create applications using natural language
 * 
 * Usage Examples:
 * node demo-vision-speak.mjs "I want an iOS app for tracking workouts"
 * node demo-vision-speak.mjs "Create a social media campaign for a startup"
 * node demo-vision-speak.mjs "Build a website with login and dashboard"
 * 
 * @module VisionSpeakDemo
 * @author AI Publishing International LLP - Diamond SAO
 */

import { spawn } from 'child_process';

// Demo requests to show Vision Speak capabilities
const demoRequests = [
  'I want an iOS app that tracks fitness workouts with Apple HealthKit integration',
  'Create a social media campaign for a tech startup with automated posting',
  'Build a website with user authentication and dashboard analytics',
  'Make an Android app for ordering food with payment processing',
  'Design a talk show website with video streaming and chat integration',
  'Create an AI-powered blog that generates content automatically',
  'Build a mobile app for real estate listings with map integration',
  'Make a web application for managing customer relationships'
];

async function runVisionSpeakDemo(request = null) {
  console.log('🎯 VISION SPEAK DEMO - DIAMOND CLI');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  // Use provided request or pick a random demo
  const selectedRequest = request || demoRequests[Math.floor(Math.random() * demoRequests.length)];
  
  console.log(`🎤 Vision Speak Request: "${selectedRequest}"`);
  console.log('');
  console.log('⚡ Executing: diamond v ' + selectedRequest);
  console.log('');
  
  try {
    // Execute the Diamond CLI V command
    const diamond = spawn('node', ['bin/diamond-fixed.mjs', 'v', ...selectedRequest.split(' ')], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    diamond.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log('✅ Vision Speak demo completed successfully!');
        console.log('');
        console.log('🎯 Try more examples:');
        console.log('');
        demoRequests.slice(0, 4).forEach((req, i) => {
          console.log(`${i + 1}. diamond v ${req}`);
        });
      } else {
        console.log(`❌ Vision Speak demo failed with exit code ${code}`);
      }
    });
    
    diamond.on('error', (error) => {
      console.error('❌ Failed to start Diamond CLI:', error);
    });
    
  } catch (error) {
    console.error('❌ Demo execution failed:', error);
  }
}

// Run demo with command line argument or random selection
const userRequest = process.argv.slice(2).join(' ');
runVisionSpeakDemo(userRequest || null);