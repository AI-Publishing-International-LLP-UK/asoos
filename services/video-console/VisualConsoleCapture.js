/**
 * 📹 VISUAL CONSOLE CAPTURE - DIAMOND SAO COMMAND CENTER
 *
 * Sacred Mission: Convert Console Output to Video Graphics
 * Authority: Mr. Phillip Corey Roark (0000001) - Diamond SAO Exclusive
 * Capability: Screen Capture → Video Processing → Visual Enhancement
 *
 * @classification DIAMOND_SAO_VISUAL_CONSOLE_VIDEO
 * @date 2025-09-22
 * @author Victory36 + Diamond SAO Command Center
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

class VisualConsoleCapture {
  constructor() {
    this.version = '1.0.0-visual-console';
    this.authority = 'Diamond SAO Visual Console Video System';
    this.outputDir = '/Users/as/asoos/Aixtiv-Symphony/video-output';
    this.captureActive = false;
    this.videoProcessing = false;

    // Video settings
    this.videoSettings = {
      fps: 30,
      resolution: '1920x1080',
      format: 'mp4',
      codec: 'h264',
      quality: 'high',
      audio: false, // Can enable for voice synthesis integration
    };

    // Visual enhancement settings
    this.visualSettings = {
      theme: 'dark', // or 'light'
      animations: true,
      transitions: true,
      highlights: true,
      typography: 'enhanced',
      background: 'gradient',
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });

    this.initializeVideoSystem();
  }

  initializeVideoSystem() {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    console.log('');
    console.log('📹 VISUAL CONSOLE CAPTURE SYSTEM');
    console.log('════════════════════════════════════════');
    console.log('🏛️  Authority: Diamond SAO Command Center');
    console.log('🎬 Capability: Console → Video Conversion');
    console.log('📊 Integration: Screen Capture + Video Processing');
    console.log('🎯 Output: Professional Video Graphics');
    console.log('');
    console.log('📋 CAPTURE CAPABILITIES:');
    console.log('   • Real-time console screen capture');
    console.log('   • HD video conversion (1920x1080)');
    console.log('   • Light/Dark theme support');
    console.log('   • Visual enhancements and animations');
    console.log('   • Integration with VisionSpeak CLI');
    console.log('');

    this.log('📹 Visual Console Capture System initialized', 'VIDEO');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        SUCCESS: '✅',
        ERROR: '❌',
        WARN: '⚠️',
        DIAMOND: '💎',
        VIDEO: '📹',
        CAPTURE: '📸',
        PROCESS: '⚙️',
        INFO: '🔷',
      }[level] || '🔷';

    console.log(`${prefix} [${timestamp}] VIDEO CONSOLE: ${message}`);
    this.logger.info(message, { level, timestamp, system: 'VisualConsole' });
  }

  async startConsoleCapture(sessionName = null) {
    if (this.captureActive) {
      this.log('❌ Capture already active', 'ERROR');
      return { error: 'Capture session already running' };
    }

    const sessionId = sessionName || `console-capture-${Date.now()}`;
    const outputFile = path.join(this.outputDir, `${sessionId}.mp4`);

    this.log(`📸 Starting console capture session: ${sessionId}`, 'CAPTURE');

    try {
      // Use ffmpeg to capture the terminal window
      const captureProcess = spawn('ffmpeg', [
        '-f',
        'avfoundation', // macOS screen capture
        '-i',
        '1:0', // Capture display 1, no audio
        '-r',
        this.videoSettings.fps.toString(),
        '-s',
        this.videoSettings.resolution,
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '18', // High quality
        '-pix_fmt',
        'yuv420p',
        '-y', // Overwrite output file
        outputFile,
      ]);

      captureProcess.stdout.on('data', (data) => {
        this.log(`FFmpeg stdout: ${data}`, 'PROCESS');
      });

      captureProcess.stderr.on('data', (data) => {
        // FFmpeg outputs progress info to stderr
        const output = data.toString();
        if (output.includes('frame=')) {
          // Progress update
          this.log('📹 Recording in progress...', 'VIDEO');
        }
      });

      captureProcess.on('error', (error) => {
        this.log(`❌ Capture error: ${error.message}`, 'ERROR');
        this.captureActive = false;
      });

      this.captureProcess = captureProcess;
      this.captureActive = true;
      this.currentSession = {
        id: sessionId,
        outputFile: outputFile,
        startTime: new Date().toISOString(),
        theme: this.visualSettings.theme,
      };

      console.log('');
      console.log('📹 CONSOLE CAPTURE ACTIVE');
      console.log('═════════════════════════');
      console.log(`🎬 Session: ${sessionId}`);
      console.log(`📁 Output: ${outputFile}`);
      console.log(`🎨 Theme: ${this.visualSettings.theme}`);
      console.log(`📊 Resolution: ${this.videoSettings.resolution}`);
      console.log(`🎯 FPS: ${this.videoSettings.fps}`);
      console.log('');
      console.log('🎮 CONTROLS:');
      console.log('   • Use your console normally');
      console.log('   • All output is being recorded');
      console.log('   • Call stopConsoleCapture() to finish');
      console.log('');

      return {
        status: 'recording',
        session_id: sessionId,
        output_file: outputFile,
        theme: this.visualSettings.theme,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.log(`❌ Failed to start capture: ${error.message}`, 'ERROR');
      return { error: error.message };
    }
  }

  async stopConsoleCapture() {
    if (!this.captureActive) {
      this.log('❌ No active capture session', 'ERROR');
      return { error: 'No capture session running' };
    }

    this.log('⏹️ Stopping console capture...', 'CAPTURE');

    try {
      // Send quit signal to ffmpeg
      this.captureProcess.stdin.write('q');

      await new Promise((resolve) => {
        this.captureProcess.on('close', (code) => {
          this.log(`📹 Capture stopped with code: ${code}`, 'VIDEO');
          resolve();
        });
      });

      const session = this.currentSession;
      this.captureActive = false;
      this.currentSession = null;

      console.log('');
      console.log('✅ CONSOLE CAPTURE COMPLETED');
      console.log('════════════════════════════');
      console.log(`🎬 Session: ${session.id}`);
      console.log(`📁 Video File: ${session.outputFile}`);
      console.log(`⏱️ Duration: ${this.calculateDuration(session.startTime)}`);
      console.log('');

      // Offer post-processing options
      await this.offerPostProcessing(session);

      return {
        status: 'completed',
        session_id: session.id,
        video_file: session.outputFile,
        duration: this.calculateDuration(session.startTime),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.log(`❌ Error stopping capture: ${error.message}`, 'ERROR');
      return { error: error.message };
    }
  }

  async offerPostProcessing(session) {
    console.log('🎬 POST-PROCESSING OPTIONS:');
    console.log('   1. Add visual enhancements');
    console.log('   2. Create animated GIF version');
    console.log('   3. Add title cards and transitions');
    console.log('   4. Export in multiple formats');
    console.log('   5. Upload to video hosting');
    console.log('');
    console.log('💡 Call enhanceVideo() for visual enhancements');
    console.log('💡 Call convertToGif() for GIF version');
    console.log('');
  }

  calculateDuration(startTime) {
    const start = new Date(startTime);
    const end = new Date();
    const duration = Math.round((end - start) / 1000);

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return `${minutes}m ${seconds}s`;
  }

  async enhanceVideo(sessionId, enhancements = {}) {
    const videoFile = path.join(this.outputDir, `${sessionId}.mp4`);
    const enhancedFile = path.join(this.outputDir, `${sessionId}-enhanced.mp4`);

    if (!fs.existsSync(videoFile)) {
      throw new Error(`Video file not found: ${videoFile}`);
    }

    this.log(`🎨 Enhancing video: ${sessionId}`, 'PROCESS');
    this.videoProcessing = true;

    const defaultEnhancements = {
      brightness: '0.1',
      contrast: '1.2',
      saturation: '1.1',
      addTitle: true,
      addTimestamp: true,
      theme: this.visualSettings.theme,
      ...enhancements,
    };

    try {
      // Create enhanced version with visual improvements
      const enhanceProcess = spawn('ffmpeg', [
        '-i',
        videoFile,
        '-vf',
        this.buildVideoFilters(defaultEnhancements),
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '18',
        '-y',
        enhancedFile,
      ]);

      await new Promise((resolve, reject) => {
        enhanceProcess.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Video enhancement completed', 'SUCCESS');
            resolve();
          } else {
            reject(new Error(`Enhancement failed with code: ${code}`));
          }
        });
      });

      this.videoProcessing = false;

      console.log('');
      console.log('✨ VIDEO ENHANCEMENT COMPLETED');
      console.log('════════════════════════════════');
      console.log(`🎬 Original: ${videoFile}`);
      console.log(`✨ Enhanced: ${enhancedFile}`);
      console.log(`🎨 Theme: ${defaultEnhancements.theme}`);
      console.log('📊 Enhancements Applied:');
      console.log(`   • Brightness: +${defaultEnhancements.brightness}`);
      console.log(`   • Contrast: ${defaultEnhancements.contrast}x`);
      console.log(`   • Saturation: ${defaultEnhancements.saturation}x`);
      if (defaultEnhancements.addTitle) {
        console.log('   • Title card added');
      }
      if (defaultEnhancements.addTimestamp) {
        console.log('   • Timestamp overlay');
      }
      console.log('');

      return {
        status: 'enhanced',
        original_file: videoFile,
        enhanced_file: enhancedFile,
        enhancements: defaultEnhancements,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.videoProcessing = false;
      this.log(`❌ Enhancement failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  buildVideoFilters(enhancements) {
    const filters = [];

    // Color adjustments
    filters.push(
      `eq=brightness=${enhancements.brightness}:contrast=${enhancements.contrast}:saturation=${enhancements.saturation}`
    );

    // Theme-specific adjustments
    if (enhancements.theme === 'dark') {
      filters.push('colorbalance=bs=-0.1:ms=-0.05:hs=-0.1');
    } else if (enhancements.theme === 'light') {
      filters.push('colorbalance=bs=0.1:ms=0.05:hs=0.1');
    }

    // Add timestamp if requested
    if (enhancements.addTimestamp) {
      filters.push('drawtext=text=\'%{localtime}\':fontsize=24:fontcolor=white:x=10:y=10');
    }

    // Add title if requested
    if (enhancements.addTitle) {
      filters.push(
        'drawtext=text=\'Diamond CLI Console\':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50'
      );
    }

    return filters.join(',');
  }

  async convertToGif(sessionId, options = {}) {
    const videoFile = path.join(this.outputDir, `${sessionId}.mp4`);
    const gifFile = path.join(this.outputDir, `${sessionId}.gif`);

    const defaultOptions = {
      fps: 10,
      width: 800,
      duration: 30, // seconds
      ...options,
    };

    this.log(`🎞️ Converting to GIF: ${sessionId}`, 'PROCESS');

    try {
      const gifProcess = spawn('ffmpeg', [
        '-i',
        videoFile,
        '-t',
        defaultOptions.duration.toString(),
        '-vf',
        `fps=${defaultOptions.fps},scale=${defaultOptions.width}:-1:flags=lanczos,palettegen`,
        '-y',
        path.join(this.outputDir, `${sessionId}-palette.png`),
      ]);

      await new Promise((resolve) => {
        gifProcess.on('close', () => resolve());
      });

      const gifCreateProcess = spawn('ffmpeg', [
        '-i',
        videoFile,
        '-i',
        path.join(this.outputDir, `${sessionId}-palette.png`),
        '-filter_complex',
        `fps=${defaultOptions.fps},scale=${defaultOptions.width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        '-t',
        defaultOptions.duration.toString(),
        '-y',
        gifFile,
      ]);

      await new Promise((resolve) => {
        gifCreateProcess.on('close', () => resolve());
      });

      // Clean up palette file
      fs.unlinkSync(path.join(this.outputDir, `${sessionId}-palette.png`));

      this.log('✅ GIF conversion completed', 'SUCCESS');

      return {
        status: 'converted',
        gif_file: gifFile,
        options: defaultOptions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.log(`❌ GIF conversion failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async switchTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      throw new Error('Theme must be "light" or "dark"');
    }

    this.visualSettings.theme = theme;
    this.log(`🎨 Switched to ${theme} theme`, 'VIDEO');

    console.log('');
    console.log(`🎨 THEME SWITCHED TO: ${theme.toUpperCase()}`);
    console.log('═══════════════════════════════════');
    console.log(`✅ Visual theme updated to ${theme} mode`);
    console.log('📹 Next capture will use new theme');
    console.log('');

    return { theme: theme, updated: true };
  }

  async getStatus() {
    return {
      capture_active: this.captureActive,
      video_processing: this.videoProcessing,
      current_session: this.currentSession,
      theme: this.visualSettings.theme,
      video_settings: this.videoSettings,
      output_directory: this.outputDir,
      timestamp: new Date().toISOString(),
    };
  }

  // Integration with VisionSpeak CLI
  async processVideoCommand(args) {
    const [subcommand, ...params] = args;

    switch (subcommand) {
      case 'start':
        return await this.startConsoleCapture(params[0]);

      case 'stop':
        return await this.stopConsoleCapture();

      case 'enhance':
        if (params.length === 0) {
          throw new Error('Session ID required for enhancement');
        }
        return await this.enhanceVideo(params[0]);

      case 'gif':
        if (params.length === 0) {
          throw new Error('Session ID required for GIF conversion');
        }
        return await this.convertToGif(params[0]);

      case 'theme':
        if (params.length === 0 || !['light', 'dark'].includes(params[0])) {
          throw new Error('Theme must be "light" or "dark"');
        }
        return await this.switchTheme(params[0]);

      case 'status':
        return await this.getStatus();

      default:
        throw new Error(`Unknown video command: ${subcommand}`);
    }
  }
}

export default VisualConsoleCapture;
