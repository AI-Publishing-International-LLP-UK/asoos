/**
 * AIXTIV Symphony - Main Electron Process
 * Unified Desktop Application with Gothic Entanglement Ribbon Maker
 * Part of DiD Archives Project - Book of Light
 */

const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const winston = require('winston');

// Import our core services
const { ServiceManager } = require('./services/ServiceManager');
const { GothicEntanglementRibbonMaker } = require('./services/GothicEntanglementRibbonMaker');
const { MCPProtocolManager } = require('./services/MCPProtocolManager');
const { VoiceSynthesisManager } = require('./services/VoiceSynthesisManager');
const { SallyPortAuthenticator } = require('./services/SallyPortAuthenticator');
const { DiDArchivesManager } = require('./services/DiDArchivesManager');

// Configure logging
const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

class AIXTIVSymphonyApp {
  constructor() {
    this.mainWindow = null;
    this.commandCenterWindow = null;
    this.serviceManager = null;
    this.ribbonMaker = null;
    this.mcpManager = null;
    this.voiceManager = null;
    this.authManager = null;
    this.archivesManager = null;

    this.appConfig = {
      name: 'AIXTIV Symphony',
      version: '1.0.0',
      environment: isDev ? 'development' : 'production',
      gcpProject: 'api-for-warp-drive',
      region: 'us-west1',
    };
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing AIXTIV Symphony Application...');

      // Initialize core services
      await this.initializeServices();

      // Set up Electron app handlers
      this.setupAppHandlers();

      // Set up IPC handlers
      this.setupIPCHandlers();

      // Create application menu
      this.createApplicationMenu();

      logger.info('✅ AIXTIV Symphony initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize AIXTIV Symphony:', error);
      throw error;
    }
  }

  async initializeServices() {
    logger.info('🔧 Initializing core services...');

    try {
      // Initialize Service Manager
      this.serviceManager = new ServiceManager({
        appConfig: this.appConfig,
        logger,
      });

      // Initialize Gothic Entanglement Ribbon Maker
      this.ribbonMaker = new GothicEntanglementRibbonMaker({
        entanglementDepth: 3,
        colorPaletteMode: 'variegated',
        gothicIntensity: 0.7,
        logger,
      });

      // Initialize MCP Protocol Manager
      this.mcpManager = new MCPProtocolManager({
        masterServer: 'mcpasoos.2100.cool',
        maxCustomers: 10000,
        region: this.appConfig.region,
        logger,
      });

      // Initialize Voice Synthesis Manager
      this.voiceManager = new VoiceSynthesisManager({
        elevenlabsProfiles: [
          'Dr. Memoria sRIX',
          'Dr. Lucy sRIX',
          'Dr. Match sRIX',
          'Dr. Cypriot sRIX',
          'Dr. Claude sRIX',
          'Professor Lee sRIX',
          'Dr. Sabina sRIX',
          'Dr. Maria sRIX',
          'Dr. Roark sRIX',
          'Dr. Grant sRIX',
          'Dr. Burby sRIX',
          'Elite11',
          'Mastery33',
          'Victory36',
        ],
        useSmootVoice: true, // User preference from rules
        logger,
      });

      // Initialize SallyPort Authentication
      this.authManager = new SallyPortAuthenticator({
        sallyPortEndpoint: 'https://sallyport.2100.cool',
        oauth2Config: {
          provider: 'google',
          clientId: process.env.OAUTH2_CLIENT_ID,
          clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        },
        logger,
      });

      // Initialize DiD Archives Manager
      this.archivesManager = new DiDArchivesManager({
        mongoAtlasUri: process.env.MONGODB_ATLAS_URI,
        pineconeApiKey: process.env.PINECONE_API_KEY,
        firestoreProjectId: this.appConfig.gcpProject,
        logger,
      });

      // Start all services
      await this.serviceManager.startAllServices();

      logger.info('✅ All core services initialized');
    } catch (error) {
      logger.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  setupAppHandlers() {
    // App ready handler
    app.whenReady().then(() => {
      this.createMainWindow();

      // macOS specific - recreate window when app is activated
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Quit when all windows are closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Before quit handler
    app.on('before-quit', async () => {
      try {
        logger.info('🛑 Shutting down AIXTIV Symphony...');
        if (this.serviceManager) {
          await this.serviceManager.stopAllServices();
        }
      } catch (error) {
        logger.error('Error during shutdown:', error);
      }
    });

    // Security: Prevent navigation to external URLs
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });
  }

  createMainWindow() {
    logger.info('🪟 Creating main window...');

    // Create the main application window
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      title: 'AIXTIV Symphony - Diamond SAO Command Center',
      icon: path.join(__dirname, '../../assets/icons/icon.png'),
      webPreferences: {
        nodeIntegration: false, // Security best practice
        contextIsolation: true, // Security best practice
        enableRemoteModule: false, // Security best practice
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hiddenInset', // macOS style
      trafficLightPosition: { x: 20, y: 20 },
      backgroundColor: '#1a1a2e', // Dark theme matching gothic aesthetic
      show: false, // Don't show until ready
    });

    // Load the main UI
    const startUrl = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

    this.mainWindow.loadURL(startUrl);

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();

      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  createCommandCenterWindow() {
    if (this.commandCenterWindow) {
      this.commandCenterWindow.focus();
      return;
    }

    logger.info('🪟 Creating Diamond SAO Command Center window...');

    this.commandCenterWindow = new BrowserWindow({
      width: 1600,
      height: 1000,
      parent: this.mainWindow,
      title: 'Diamond SAO Command Center - Monitoring Dashboard v34',
      icon: path.join(__dirname, '../../assets/icons/command-center.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
      backgroundColor: '#0f0f23',
      show: false,
    });

    const commandCenterUrl = isDev
      ? 'http://localhost:3000/command-center'
      : `file://${path.join(__dirname, '../renderer/command-center.html')}`;

    this.commandCenterWindow.loadURL(commandCenterUrl);

    this.commandCenterWindow.once('ready-to-show', () => {
      this.commandCenterWindow.show();
    });

    this.commandCenterWindow.on('closed', () => {
      this.commandCenterWindow = null;
    });
  }

  setupIPCHandlers() {
    logger.info('🔗 Setting up IPC handlers...');

    // Gothic Entanglement Ribbon Maker handlers
    ipcMain.handle('ribbonMaker:backupConversations', async (event, conversations) => {
      try {
        return await this.ribbonMaker.backupConversations(conversations);
      } catch (error) {
        logger.error('Failed to backup conversations:', error);
        throw error;
      }
    });

    ipcMain.handle('ribbonMaker:entangleConversations', async (event, backupId) => {
      try {
        return await this.ribbonMaker.entangleConversations(backupId);
      } catch (error) {
        logger.error('Failed to entangle conversations:', error);
        throw error;
      }
    });

    ipcMain.handle('ribbonMaker:weaveRibbons', async (event, entangledData) => {
      try {
        return await this.ribbonMaker.weaveRibbons(entangledData);
      } catch (error) {
        logger.error('Failed to weave ribbons:', error);
        throw error;
      }
    });

    // Voice Synthesis handlers
    ipcMain.handle('voice:synthesize', async (event, { text, voiceProfile, options }) => {
      try {
        return await this.voiceManager.synthesizeText(text, voiceProfile, options);
      } catch (error) {
        logger.error('Voice synthesis failed:', error);
        throw error;
      }
    });

    ipcMain.handle('voice:getAvailableProfiles', async () => {
      return this.voiceManager.getAvailableProfiles();
    });

    // MCP Protocol handlers
    ipcMain.handle('mcp:createCustomerServer', async (event, customerConfig) => {
      try {
        return await this.mcpManager.createCustomerServer(customerConfig);
      } catch (error) {
        logger.error('Failed to create MCP server:', error);
        throw error;
      }
    });

    ipcMain.handle('mcp:getServerStatus', async (event, serverId) => {
      try {
        return await this.mcpManager.getServerStatus(serverId);
      } catch (error) {
        logger.error('Failed to get MCP server status:', error);
        throw error;
      }
    });

    // Authentication handlers
    ipcMain.handle('auth:sallyPortVerify', async (event, token) => {
      try {
        return await this.authManager.verifySallyPortToken(token);
      } catch (error) {
        logger.error('SallyPort verification failed:', error);
        throw error;
      }
    });

    ipcMain.handle('auth:oauth2Login', async () => {
      try {
        return await this.authManager.initiateOAuth2Flow();
      } catch (error) {
        logger.error('OAuth2 login failed:', error);
        throw error;
      }
    });

    // Archives handlers
    ipcMain.handle('archives:storeDocument', async (event, document) => {
      try {
        return await this.archivesManager.storeDocument(document);
      } catch (error) {
        logger.error('Failed to store document:', error);
        throw error;
      }
    });

    ipcMain.handle('archives:searchDocuments', async (event, query) => {
      try {
        return await this.archivesManager.searchDocuments(query);
      } catch (error) {
        logger.error('Document search failed:', error);
        throw error;
      }
    });

    // Window management handlers
    ipcMain.handle('window:openCommandCenter', () => {
      this.createCommandCenterWindow();
    });

    ipcMain.handle('window:minimize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window.minimize();
    });

    ipcMain.handle('window:maximize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    });

    ipcMain.handle('window:close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window.close();
    });

    // System information handlers
    ipcMain.handle('system:getAppConfig', () => {
      return this.appConfig;
    });

    ipcMain.handle('system:getServiceStatus', async () => {
      return await this.serviceManager.getServicesStatus();
    });

    // File operations
    ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      return await dialog.showOpenDialog(window, options);
    });

    ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      return await dialog.showSaveDialog(window, options);
    });
  }

  createApplicationMenu() {
    const template = [
      {
        label: 'AIXTIV Symphony',
        submenu: [
          { label: 'About AIXTIV Symphony', role: 'about' },
          { type: 'separator' },
          { label: 'Services', role: 'services' },
          { type: 'separator' },
          { label: 'Hide AIXTIV Symphony', accelerator: 'Command+H', role: 'hide' },
          { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() },
        ],
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'New Conversation',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.mainWindow.webContents.send('menu:newConversation'),
          },
          {
            label: 'Open Book of Light',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.mainWindow.webContents.send('menu:openBookOfLight'),
          },
          { type: 'separator' },
          {
            label: 'Export Ribbons',
            accelerator: 'CmdOrCtrl+E',
            click: () => this.mainWindow.webContents.send('menu:exportRibbons'),
          },
        ],
      },
      {
        label: 'Gothic Entanglement',
        submenu: [
          {
            label: 'Create Ribbon',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.mainWindow.webContents.send('menu:createRibbon'),
          },
          {
            label: 'View Ribbon Gallery',
            click: () => this.mainWindow.webContents.send('menu:viewRibbonGallery'),
          },
          { type: 'separator' },
          {
            label: 'Backup Conversations',
            click: () => this.mainWindow.webContents.send('menu:backupConversations'),
          },
        ],
      },
      {
        label: 'Voice Synthesis',
        submenu: [
          {
            label: 'Select Voice Profile',
            click: () => this.mainWindow.webContents.send('menu:selectVoiceProfile'),
          },
          {
            label: 'Voice Settings',
            click: () => this.mainWindow.webContents.send('menu:voiceSettings'),
          },
        ],
      },
      {
        label: 'Diamond SAO',
        submenu: [
          {
            label: 'Open Command Center',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => this.createCommandCenterWindow(),
          },
          {
            label: 'System Monitoring',
            click: () => this.mainWindow.webContents.send('menu:systemMonitoring'),
          },
          { type: 'separator' },
          {
            label: 'MCP Server Status',
            click: () => this.mainWindow.webContents.send('menu:mcpServerStatus'),
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [{ role: 'minimize' }, { role: 'close' }],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: () =>
              shell.openExternal(
                'https://github.com/AI-Publishing-International-LLP-UK/asoos/wiki'
              ),
          },
          {
            label: 'Gothic Entanglement Guide',
            click: () => this.mainWindow.webContents.send('menu:showGothicGuide'),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Initialize and start the application
const symphonyApp = new AIXTIVSymphonyApp();

// Start the app when Electron is ready
app.whenReady().then(async () => {
  try {
    await symphonyApp.initialize();
  } catch (error) {
    logger.error('Failed to start AIXTIV Symphony:', error);
    app.quit();
  }
});

module.exports = { AIXTIVSymphonyApp };
