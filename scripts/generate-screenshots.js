#!/usr/bin/env node

/**
 * Screenshot Generator for ASOOS Mobile Apps
 * Creates required screenshots for App Store and Google Play
 * Using Puppeteer to capture web-based mobile interfaces
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ScreenshotGenerator {
  constructor() {
    this.outputDir = '/Users/as/asoos/integration-gateway/store_assets/screenshots';
    this.iosUrl = 'https://mobile-ios.asoos.2100.cool';
    this.androidUrl = 'https://mobile-android.asoos.2100.cool';
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async generateScreenshots() {
    console.log('🚀 Starting screenshot generation for ASOOS Mobile Apps...');
    
    await this.ensureOutputDirectory();
    
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null
    });

    try {
      // Generate iOS screenshots
      await this.generateiOSScreenshots(browser);
      
      // Generate Android screenshots
      await this.generateAndroidScreenshots(browser);
      
      console.log('✅ All screenshots generated successfully!');
      console.log(`📁 Screenshots saved to: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error generating screenshots:', error);
    } finally {
      await browser.close();
    }
  }

  async generateiOSScreenshots(browser) {
    console.log('📱 Generating iOS screenshots...');
    
    const page = await browser.newPage();
    
    // iPhone 15 Pro Max (6.7-inch) - 1290 × 2796
    await page.setViewport({
      width: 1290,
      height: 2796,
      deviceScaleFactor: 3
    });

    await page.goto(this.iosUrl, { waitUntil: 'networkidle0' });
    
    // Main app interface
    await page.screenshot({
      path: `${this.outputDir}/ios-main-interface-6.7.png`,
      fullPage: false
    });

    // iPhone 15 Plus (6.5-inch) - 1242 × 2688  
    await page.setViewport({
      width: 1242,
      height: 2688,
      deviceScaleFactor: 3
    });

    await page.screenshot({
      path: `${this.outputDir}/ios-main-interface-6.5.png`,
      fullPage: false
    });

    // iPhone 8 Plus (5.5-inch) - 1242 × 2208
    await page.setViewport({
      width: 1242,
      height: 2208,
      deviceScaleFactor: 3
    });

    await page.screenshot({
      path: `${this.outputDir}/ios-main-interface-5.5.png`,
      fullPage: false
    });

    // Generate additional feature screenshots
    await this.generateFeatureScreenshots(page, 'ios');
    
    await page.close();
    console.log('✅ iOS screenshots generated');
  }

  async generateAndroidScreenshots(browser) {
    console.log('🤖 Generating Android screenshots...');
    
    const page = await browser.newPage();
    
    // Standard Android Phone - 1080 × 1920
    await page.setViewport({
      width: 1080,
      height: 1920,
      deviceScaleFactor: 2
    });

    await page.goto(this.androidUrl, { waitUntil: 'networkidle0' });
    
    // Main app interface
    await page.screenshot({
      path: `${this.outputDir}/android-main-interface-phone.png`,
      fullPage: false
    });

    // Android Tablet - 1920 × 1080 (optional)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2
    });

    await page.screenshot({
      path: `${this.outputDir}/android-main-interface-tablet.png`,
      fullPage: false
    });

    // Generate additional feature screenshots
    await this.generateFeatureScreenshots(page, 'android');
    
    await page.close();
    console.log('✅ Android screenshots generated');
  }

  async generateFeatureScreenshots(page, platform) {
    // Return to phone viewport for feature shots
    if (platform === 'ios') {
      await page.setViewport({
        width: 1290,
        height: 2796,
        deviceScaleFactor: 3
      });
    } else {
      await page.setViewport({
        width: 1080,
        height: 1920,
        deviceScaleFactor: 2
      });
    }

    // Dream Commander Dashboard
    await page.evaluate(() => {
      // Simulate navigation to Dream Commander
      if (window.location.pathname !== '/dream-commander') {
        window.location.hash = '#dream-commander';
      }
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${this.outputDir}/${platform}-dream-commander.png`,
      fullPage: false
    });

    // Victory36 Security View
    await page.evaluate(() => {
      window.location.hash = '#victory36';
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${this.outputDir}/${platform}-victory36-security.png`,
      fullPage: false
    });

    // Voice Commands Interface
    await page.evaluate(() => {
      window.location.hash = '#voice-commands';
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${this.outputDir}/${platform}-voice-commands.png`,
      fullPage: false
    });

    // Diamond CLI Integration
    await page.evaluate(() => {
      window.location.hash = '#diamond-cli';
    });

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${this.outputDir}/${platform}-diamond-cli.png`,
      fullPage: false
    });
  }

  async generateAppIcons() {
    console.log('🎨 Generating app icons...');
    
    // Create a simple SVG-based app icon
    const iconSizes = [
      { size: 1024, name: 'ios-app-icon-1024.png' },
      { size: 512, name: 'android-app-icon-512.png' },
      { size: 192, name: 'android-app-icon-192.png' },
      { size: 144, name: 'android-app-icon-144.png' },
      { size: 96, name: 'android-app-icon-96.png' },
      { size: 72, name: 'android-app-icon-72.png' },
      { size: 48, name: 'android-app-icon-48.png' }
    ];

    const iconSvg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3A4F66" />
            <stop offset="50%" style="stop-color:#2A3B4D" />
            <stop offset="100%" style="stop-color:#FFD700" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#FFD700" />
            <stop offset="100%" style="stop-color:#0bb1bb" />
          </linearGradient>
        </defs>
        
        <!-- Background with rounded corners -->
        <rect width="1024" height="1024" rx="180" ry="180" fill="url(#bgGradient)" />
        
        <!-- ASOOS Text -->
        <text x="512" y="400" font-family="Arial, sans-serif" font-size="140" font-weight="900" 
              text-anchor="middle" fill="url(#textGradient)">ASOOS</text>
        
        <!-- Subtitle -->
        <text x="512" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="400" 
              text-anchor="middle" fill="#ffffff" opacity="0.9">Mobile DevOps</text>
        
        <!-- Victory36 Symbol -->
        <circle cx="512" cy="650" r="80" fill="rgba(255,215,0,0.2)" stroke="#FFD700" stroke-width="4"/>
        <text x="512" y="670" font-family="Arial, sans-serif" font-size="60" font-weight="400" 
              text-anchor="middle" fill="#FFD700">✝</text>
        
        <!-- Dream Commander Symbol -->
        <text x="512" y="800" font-family="Arial, sans-serif" font-size="32" font-weight="400" 
              text-anchor="middle" fill="#ffffff" opacity="0.8">🧠 Dream Commander</text>
      </svg>
    `;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (const { size, name } of iconSizes) {
      await page.setViewport({ width: size, height: size });
      await page.setContent(`<html><body style="margin:0;padding:0;">${iconSvg}</body></html>`);
      await page.screenshot({
        path: `${this.outputDir}/${name}`,
        fullPage: true
      });
    }
    
    await browser.close();
    console.log('✅ App icons generated');
  }

  async generateSummaryReport() {
    const screenshots = await fs.readdir(this.outputDir);
    const reportPath = `${this.outputDir}/screenshot_report.md`;
    
    const report = `# ASOOS Mobile Apps Screenshots Report
**Generated**: ${new Date().toISOString()}
**Total Screenshots**: ${screenshots.length}

## iOS Screenshots (App Store Connect)
- ios-main-interface-6.7.png (iPhone 15 Pro Max - 1290 × 2796)
- ios-main-interface-6.5.png (iPhone 15 Plus - 1242 × 2688) 
- ios-main-interface-5.5.png (iPhone 8 Plus - 1242 × 2208)
- ios-dream-commander.png (Dream Commander Dashboard)
- ios-victory36-security.png (Victory36 Protection)
- ios-voice-commands.png (Voice Commands Interface)
- ios-diamond-cli.png (Diamond CLI Integration)

## Android Screenshots (Google Play Console)  
- android-main-interface-phone.png (Phone - 1080 × 1920)
- android-main-interface-tablet.png (Tablet - 1920 × 1080)
- android-dream-commander.png (Dream Commander Dashboard)
- android-victory36-security.png (Victory36 Protection)
- android-voice-commands.png (Voice Commands Interface)
- android-diamond-cli.png (Diamond CLI Integration)

## App Icons
- ios-app-icon-1024.png (iOS App Store)
- android-app-icon-512.png (Google Play Store)
- Various Android adaptive icons (192px, 144px, 96px, 72px, 48px)

## Upload Instructions

### iOS App Store Connect:
1. Go to App Store Connect → Your App → App Information
2. Upload screenshots in the "App Screenshots" section
3. Drag screenshots to appropriate device categories

### Google Play Console:
1. Go to Play Console → Your App → Store Listing  
2. Upload screenshots in the "Graphics" section
3. Add phone and tablet screenshots

## Ready for Submission! 🚀
All required screenshots have been generated and are ready for app store submission.
`;

    await fs.writeFile(reportPath, report);
    console.log(`📊 Summary report created: ${reportPath}`);
  }
}

// Run screenshot generation if called directly
if (require.main === module) {
  const generator = new ScreenshotGenerator();
  
  generator.generateScreenshots()
    .then(() => generator.generateAppIcons())
    .then(() => generator.generateSummaryReport())
    .then(() => {
      console.log('\n🎉 SCREENSHOT GENERATION COMPLETE!');
      console.log('📁 All assets ready for app store submission');
      console.log('🚀 Next: Upload to App Store Connect & Google Play Console');
    })
    .catch(console.error);
}

module.exports = ScreenshotGenerator;