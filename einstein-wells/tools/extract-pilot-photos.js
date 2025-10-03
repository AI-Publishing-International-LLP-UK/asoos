#!/usr/bin/env node

/**
 * Pilot Photo Extraction & Optimization Script
 * For Quantum Billiard Ball Videography Project - 250 Billion Agent Population
 * 
 * Usage: node tools/extract-pilot-photos.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MANIFEST_PATH = path.join(__dirname, '../assets/pilots/pilot-photo-manifest.json');
const OUTPUT_BASE = path.join(__dirname, '../assets/pilots');
const SIZES = {
    thumbnail: 120,
    small: 320,
    medium: 640, 
    large: 1024,
    xl: 1920
};

class PilotPhotoExtractor {
    constructor() {
        this.manifest = null;
        this.results = {
            success: [],
            errors: [],
            skipped: []
        };
    }

    async run() {
        console.log('🎱 Quantum Pilot Photo Extraction Started');
        console.log('=' .repeat(60));

        try {
            await this.loadManifest();
            await this.checkDependencies();
            await this.createDirectories();
            await this.processAllPilots();
            await this.generatePhotoMap();
            this.printResults();
        } catch (error) {
            console.error('❌ Fatal error:', error.message);
            process.exit(1);
        }
    }

    async loadManifest() {
        console.log('📄 Loading pilot manifest...');
        
        if (!fs.existsSync(MANIFEST_PATH)) {
            throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
        }

        const manifestData = fs.readFileSync(MANIFEST_PATH, 'utf8');
        this.manifest = JSON.parse(manifestData);
        
        console.log(`✅ Loaded ${this.manifest.total_pilots} pilots from manifest`);
    }

    async checkDependencies() {
        console.log('🔍 Checking dependencies...');
        
        // Check if ImageMagick is installed (fallback if Sharp fails)
        try {
            execSync('which magick', { stdio: 'ignore' });
            console.log('✅ ImageMagick available');
        } catch (error) {
            console.log('⚠️  ImageMagick not found - will try native Node.js processing');
        }

        // Try to import Sharp (optional dependency)
        try {
            await import('sharp');
            console.log('✅ Sharp available for optimal image processing');
        } catch (error) {
            console.log('⚠️  Sharp not installed - using fallback methods');
        }
    }

    async createDirectories() {
        console.log('📁 Creating directory structure...');

        for (const [pilotId, pilot] of Object.entries(this.manifest.pilots)) {
            if (pilot.status === 'pending_identification') continue;

            const pilotDir = path.join(OUTPUT_BASE, pilotId);
            const originalDir = path.join(pilotDir, 'original');
            const webDir = path.join(pilotDir, 'web');

            [pilotDir, originalDir, webDir].forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    console.log(`  📂 Created: ${path.relative(OUTPUT_BASE, dir)}`);
                }
            });
        }
    }

    async processAllPilots() {
        console.log('🖼️  Processing pilot photos...');
        console.log('-'.repeat(60));

        for (const [pilotId, pilot] of Object.entries(this.manifest.pilots)) {
            if (pilot.status === 'pending_identification') {
                console.log(`⏭️  Skipping ${pilotId} - pending identification`);
                this.results.skipped.push(pilotId);
                continue;
            }

            try {
                await this.processPilotPhoto(pilotId, pilot);
                this.results.success.push(pilotId);
                console.log(`✅ ${pilotId} processed successfully`);
            } catch (error) {
                console.error(`❌ Error processing ${pilotId}:`, error.message);
                this.results.errors.push({ pilotId, error: error.message });
            }
        }
    }

    async processPilotPhoto(pilotId, pilot) {
        const sourcePath = pilot.source_photo;
        const pilotDir = path.join(OUTPUT_BASE, pilotId);
        
        // Check if source file exists
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source photo not found: ${sourcePath}`);
        }

        // Copy original
        const originalPath = path.join(pilotDir, 'original', 'original.jpeg');
        fs.copyFileSync(sourcePath, originalPath);
        
        // Generate web-optimized versions
        await this.generateWebVersions(originalPath, path.join(pilotDir, 'web'), pilot);

        console.log(`  📸 ${pilot.name}: Original + ${Object.keys(SIZES).length} web versions`);
    }

    async generateWebVersions(inputPath, outputDir, pilot) {
        // Try Sharp first (best quality and performance)
        try {
            const { default: sharp } = await import('sharp');
            await this.generateWithSharp(sharp, inputPath, outputDir, pilot);
            return;
        } catch (error) {
            console.log('  ⚠️  Sharp failed, trying ImageMagick...');
        }

        // Fallback to ImageMagick
        try {
            await this.generateWithImageMagick(inputPath, outputDir, pilot);
            return;
        } catch (error) {
            console.log('  ⚠️  ImageMagick failed, using basic copy...');
        }

        // Last resort - just copy the original
        for (const [sizeName] of Object.entries(SIZES)) {
            const outputPath = path.join(outputDir, `${sizeName}.jpg`);
            fs.copyFileSync(inputPath, outputPath);
        }
    }

    async generateWithSharp(sharp, inputPath, outputDir, pilot) {
        
        for (const [sizeName, size] of Object.entries(SIZES)) {
            const outputPath = path.join(outputDir, `${sizeName}.jpg`);
            
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({
                    quality: sizeName === 'thumbnail' ? 85 : 90,
                    progressive: true
                })
                .toFile(outputPath);
        }

        // Generate WebP versions for modern browsers
        for (const [sizeName, size] of Object.entries(SIZES)) {
            const outputPath = path.join(outputDir, `${sizeName}.webp`);
            
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({
                    quality: sizeName === 'thumbnail' ? 85 : 90
                })
                .toFile(outputPath);
        }
    }

    async generateWithImageMagick(inputPath, outputDir, pilot) {
        for (const [sizeName, size] of Object.entries(SIZES)) {
            const outputPath = path.join(outputDir, `${sizeName}.jpg`);
            
            const cmd = `magick "${inputPath}" -resize ${size}x${size}^ -gravity center -extent ${size}x${size} -quality 90 "${outputPath}"`;
            execSync(cmd, { stdio: 'ignore' });
        }
    }

    async generatePhotoMap() {
        console.log('🗺️  Generating pilot photo map...');

        const photoMap = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            pilots: {}
        };

        for (const [pilotId, pilot] of Object.entries(this.manifest.pilots)) {
            if (pilot.status === 'pending_identification') continue;

            photoMap.pilots[pilotId] = {
                name: pilot.name,
                description: pilot.description,
                alt_text: pilot.alt_text || `Professional headshot of ${pilot.name}`,
                specialization: pilot.specialization,
                voice_profile: pilot.voice_profile,
                photos: {
                    original: `./assets/pilots/${pilotId}/original/original.jpeg`
                }
            };

            // Add web versions
            photoMap.pilots[pilotId].photos.web = {};
            for (const sizeName of Object.keys(SIZES)) {
                photoMap.pilots[pilotId].photos.web[sizeName] = {
                    jpg: `./assets/pilots/${pilotId}/web/${sizeName}.jpg`,
                    webp: `./assets/pilots/${pilotId}/web/${sizeName}.webp`
                };
            }
        }

        const mapPath = path.join(OUTPUT_BASE, 'pilot-photo-map.json');
        fs.writeFileSync(mapPath, JSON.stringify(photoMap, null, 2));
        console.log(`✅ Photo map saved: ${mapPath}`);
    }

    printResults() {
        console.log('\n🎯 EXTRACTION RESULTS');
        console.log('=' .repeat(60));
        console.log(`✅ Successfully processed: ${this.results.success.length}`);
        console.log(`⏭️  Skipped (pending ID): ${this.results.skipped.length}`);
        console.log(`❌ Errors: ${this.results.errors.length}`);

        if (this.results.success.length > 0) {
            console.log('\n✅ Successfully processed:');
            this.results.success.forEach(id => console.log(`  • ${id}`));
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.results.errors.forEach(({ pilotId, error }) => {
                console.log(`  • ${pilotId}: ${error}`);
            });
        }

        console.log('\n🚀 Next Steps:');
        console.log('1. Identify remaining pilots in the manifest');
        console.log('2. Run this script again to process new pilots');
        console.log('3. Integrate photos into Quantum Billiard Ball system');
        console.log('4. Build Mexico City visualization center');
        console.log('5. Add video recording capability');
    }
}

// Helper function to get pilot photo URL
function getPilotPhoto(pilotId, size = 'medium', format = 'jpg') {
    const photoMapPath = path.join(__dirname, '../assets/pilots/pilot-photo-map.json');
    
    if (!fs.existsSync(photoMapPath)) {
        console.warn('Photo map not found. Run extract-pilot-photos.js first.');
        return null;
    }

    const photoMap = JSON.parse(fs.readFileSync(photoMapPath, 'utf8'));
    const pilot = photoMap.pilots[pilotId];
    
    if (!pilot) {
        console.warn(`Pilot not found: ${pilotId}`);
        return null;
    }

    if (size === 'original') {
        return pilot.photos.original;
    }

    if (!pilot.photos.web[size]) {
        console.warn(`Size not available: ${size}`);
        return pilot.photos.web.medium[format] || pilot.photos.web.medium.jpg;
    }

    return pilot.photos.web[size][format] || pilot.photos.web[size].jpg;
}

// Run the extraction if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const extractor = new PilotPhotoExtractor();
    extractor.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export {
    PilotPhotoExtractor,
    getPilotPhoto
};
