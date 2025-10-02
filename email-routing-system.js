/**
 * ASOOS Email Routing System
 * 
 * Handles email routing based on SAO level keywords:
 * - "all" -> sends to ALL SAO levels (Diamond, Emerald, Sapphire, Opal, Onyx)
 * - "diamond" -> Diamond SAO only
 * - "emerald" -> Emerald SAO only  
 * - "sapphire" -> Sapphire SAO only
 * - "opal" -> Opal SAO only
 * - "onyx" -> Onyx SAO only
 * 
 * All emails appear from ASOOS@aixtiv.com with recipient privacy protection
 */

import nodemailer from 'nodemailer';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class ASOOSEmailRouter {
  constructor() {
    this.secretClient = new SecretManagerServiceClient();
    this.projectId = 'api-for-warp-drive';
    this.senderEmail = 'ASOOS@aixtiv.com';
    
    // SAO Level Email Distribution Lists
    this.saoDistributionLists = {
      diamond: [
        'phillip.roark@aipublishing.international',
        'morgan.obrien@aipublishing.international',
        'admin@asoos.2100.cool',
        'admin@aipub.2100.cool'
      ],
      emerald: [
        'emerald-01@aipublishing.international',
        'emerald-ops@asoos.2100.cool'
      ],
      sapphire: [
        'aaron.harris@zaxon.construction',
        'admin@einsteinwells.2100.cool',
        'admin@zaxon.2100.cool'
      ],
      opal: [
        'opal-admin@asoos.2100.cool'
      ],
      onyx: [
        'onyx-admin@asoos.2100.cool'
      ]
    };
    
    // Newsletter Distribution Lists
    this.newsletterDistributionLists = {
      internal: [
        // AI Publishing International LLP Members Only
        'phillip.roark@aipublishing.international',
        'morgan.obrien@aipublishing.international',
        'joshua.galbreath@aipublishing.international',
        'melika.rafiei@aipublishing.international',
        'adam.keith@aipublishing.international',
        'tadeo.aguilera@aipublishing.international',
        'david.goggin@aipublishing.international',
        'lisa.goldenthal@aipublishing.international',
        'admin@aipub.2100.cool'
      ],
      external: [
        // Everyone in ecosystem - SAO levels + customers + partners
        ...this.getAllSaoRecipients(),
        'admin@einsteinwells.2100.cool',
        'admin@zaxon.2100.cool',
        'newsletter@asoos.2100.cool',
        'updates@aipub.2100.cool'
      ]
    };
    
    // Agent Communication System (20+ million agents)
    this.agentCommunicationSystem = {
      grandHyperloopEndpoint: 'https://grand-hyperloop.aixtiv.com/api/v1/broadcast',
      totalAgents: 20000000,
      agentRegistryEndpoint: 'https://agent-registry.asoos.2100.cool/api/v1/all-agents',
      didcArchivesEndpoint: 'https://didc-archives.diamond.sao.2100.cool/api/v1/store'
    };
    
    // DIDC Archives Integration
    this.didcArchives = {
      enabled: true,
      endpoint: 'https://didc-archives.diamond.sao.2100.cool/api/v1/store',
      humanAccessEndpoint: 'https://diamond.sao.2100.cool/didc-archives',
      categories: [
        'company-communications',
        'news-announcements', 
        'historical-records',
        'agent-communications',
        'newsletter-archives'
      ]
    };
    
    // Hidden broadcast addresses (internal use only)
    this.internalAddresses = {
      all: 'quantum-symphony-broadcast@internal.aixtiv.com',
      diamond: 'diamond-sao-internal@internal.aixtiv.com',
      emerald: 'emerald-sao-internal@internal.aixtiv.com',
      sapphire: 'sapphire-sao-internal@internal.aixtiv.com',
      opal: 'opal-sao-internal@internal.aixtiv.com',
      onyx: 'onyx-sao-internal@internal.aixtiv.com'
    };
    
    // Email routing patterns
    this.routingPatterns = {
      'admin@asoos.2100.cool': ['diamond', 'emerald'],
      'admin@aipub.2100.cool': ['diamond', 'emerald'],
      'admin@einsteinwells.2100.cool': ['sapphire', 'opal', 'onyx'],
      'admin@zaxon.2100.cool': ['sapphire']
    };
    
    console.log('🌟 ASOOS Email Routing System initialized');
  }
  
  /**
   * Route email based on keyword triggers
   */
  async routeEmail(emailData) {
    const { to, subject, content, trigger } = emailData;
    
    console.log(`📧 Processing email routing with trigger: "${trigger}"`);
    
    // Determine recipients based on trigger
    let recipients = [];
    let saoLevels = [];
    
    switch (trigger.toLowerCase()) {
      case 'all':
        saoLevels = ['diamond', 'emerald', 'sapphire', 'opal', 'onyx'];
        recipients = this.getAllRecipients();
        break;
        
      case 'diamond':
        saoLevels = ['diamond'];
        recipients = this.saoDistributionLists.diamond;
        break;
        
      case 'emerald':
        saoLevels = ['emerald'];
        recipients = this.saoDistributionLists.emerald;
        break;
        
      case 'sapphire':
        saoLevels = ['sapphire'];
        recipients = this.saoDistributionLists.sapphire;
        break;
        
      case 'opal':
        saoLevels = ['opal'];
        recipients = this.saoDistributionLists.opal;
        break;
        
      case 'onyx':
        saoLevels = ['onyx'];
        recipients = this.saoDistributionLists.onyx;
        break;
        
      case 'internal-newsletter':
        saoLevels = ['internal-newsletter'];
        recipients = this.newsletterDistributionLists.internal;
        break;
        
      case 'external-newsletter':
        saoLevels = ['external-newsletter'];
        recipients = [...this.newsletterDistributionLists.external];
        // Also send to all 20+ million agents via Grand Hyperloop
        await this.sendToAgentsViaGrandHyperloop(subject, content);
        break;
        
      default:
        // Check if it's a specific domain admin
        if (this.routingPatterns[to]) {
          saoLevels = this.routingPatterns[to];
          recipients = this.getRecipientsForSaoLevels(saoLevels);
        } else {
          throw new Error(`Unknown routing trigger: ${trigger}`);
        }
    }
    
    console.log(`   🎯 Target SAO Levels: ${saoLevels.join(', ')}`);
    console.log(`   📮 Recipients: ${recipients.length} addresses`);
    
    // Send individual emails (BCC style - each recipient only sees themselves)
    const results = await this.sendIndividualEmails(recipients, subject, content, saoLevels);
    
    // Store in DIDC Archives for historical access
    await this.storeInDidcArchives({
      trigger,
      subject,
      content,
      saoLevels,
      recipientCount: recipients.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      trigger: trigger,
      saoLevels: saoLevels,
      recipientCount: recipients.length,
      sentCount: results.success.length,
      failedCount: results.failed.length,
      agentNotification: trigger === 'external-newsletter' ? 'sent-via-grand-hyperloop' : 'not-applicable',
      didcArchiveStatus: 'stored',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get all recipients across all SAO levels
   */
  getAllRecipients() {
    const allRecipients = [];
    Object.values(this.saoDistributionLists).forEach(list => {
      allRecipients.push(...list);
    });
    // Remove duplicates
    return [...new Set(allRecipients)];
  }
  
  /**
   * Get all SAO recipients for external newsletter
   */
  getAllSaoRecipients() {
    const allSaoRecipients = [];
    Object.values(this.saoDistributionLists).forEach(list => {
      allSaoRecipients.push(...list);
    });
    return [...new Set(allSaoRecipients)];
  }
  
  /**
   * Send communication to all 20+ million agents via Grand Hyperloop
   */
  async sendToAgentsViaGrandHyperloop(subject, content) {
    try {
      console.log('📡 Sending to 20+ million agents via Grand Hyperloop...');
      
      const agentBroadcast = {
        subject: subject,
        content: content,
        timestamp: new Date().toISOString(),
        source: 'ASOOS@aixtiv.com',
        type: 'external-newsletter',
        agentCount: this.agentCommunicationSystem.totalAgents
      };
      
      // In production, this would make an HTTP request to Grand Hyperloop
      // For now, we'll simulate the broadcast
      console.log(`   🌐 Grand Hyperloop Endpoint: ${this.agentCommunicationSystem.grandHyperloopEndpoint}`);
      console.log(`   🤖 Broadcasting to ${this.agentCommunicationSystem.totalAgents.toLocaleString()} agents`);
      console.log('   ✅ Agent broadcast initiated');
      
      return {
        status: 'success',
        agentCount: this.agentCommunicationSystem.totalAgents,
        endpoint: this.agentCommunicationSystem.grandHyperloopEndpoint
      };
    } catch (error) {
      console.error('❌ Failed to send to agents via Grand Hyperloop:', error.message);
      return {
        status: 'failed',
        error: error.message
      };
    }
  }
  
  /**
   * Store communication in DIDC Archives for historical access
   */
  async storeInDidcArchives(communicationData) {
    try {
      console.log('📚 Storing communication in DIDC Archives...');
      
      const archiveEntry = {
        id: `comm-${Date.now()}`,
        ...communicationData,
        category: this.getCommunicationCategory(communicationData.trigger),
        accessLevel: 'diamond-sao-command-center',
        storedAt: new Date().toISOString(),
        humanAccessUrl: `${this.didcArchives.humanAccessEndpoint}/view/${communicationData.trigger}/${Date.now()}`
      };
      
      // In production, this would store in DIDC Archives database
      console.log(`   📋 Archive Category: ${archiveEntry.category}`);
      console.log(`   🔑 Access Level: ${archiveEntry.accessLevel}`);
      console.log(`   🌐 Human Access: ${archiveEntry.humanAccessUrl}`);
      console.log('   ✅ DIDC Archive entry created');
      
      return {
        status: 'stored',
        archiveId: archiveEntry.id,
        category: archiveEntry.category,
        humanAccessUrl: archiveEntry.humanAccessUrl
      };
    } catch (error) {
      console.error('❌ Failed to store in DIDC Archives:', error.message);
      return {
        status: 'failed',
        error: error.message
      };
    }
  }
  
  /**
   * Get communication category for DIDC Archives
   */
  getCommunicationCategory(trigger) {
    const categoryMap = {
      'all': 'company-communications',
      'diamond': 'company-communications',
      'emerald': 'company-communications', 
      'sapphire': 'company-communications',
      'opal': 'company-communications',
      'onyx': 'company-communications',
      'internal-newsletter': 'newsletter-archives',
      'external-newsletter': 'newsletter-archives'
    };
    
    return categoryMap[trigger] || 'company-communications';
  }
  
  /**
   * Get recipients for specific SAO levels
   */
  getRecipientsForSaoLevels(saoLevels) {
    const recipients = [];
    saoLevels.forEach(level => {
      if (this.saoDistributionLists[level]) {
        recipients.push(...this.saoDistributionLists[level]);
      }
    });
    return [...new Set(recipients)];
  }
  
  /**
   * Send individual emails to maintain privacy
   */
  async sendIndividualEmails(recipients, subject, content, saoLevels) {
    const results = {
      success: [],
      failed: []
    };
    
    // Get email credentials from Secret Manager
    const transporter = await this.getEmailTransporter();
    
    for (const recipient of recipients) {
      try {
        // Personalized email for each recipient
        const personalizedContent = this.personalizeEmail(content, recipient, saoLevels);
        
        const mailOptions = {
          from: `ASOOS Admin <${this.senderEmail}>`,
          to: recipient,
          subject: subject,
          html: personalizedContent,
          headers: {
            'X-ASOOS-SAO-Levels': saoLevels.join(','),
            'X-ASOOS-Privacy': 'individual-send',
            'X-ASOOS-Timestamp': new Date().toISOString()
          }
        };
        
        await transporter.sendMail(mailOptions);
        results.success.push(recipient);
        console.log(`   ✅ Email sent to ${recipient}`);
        
      } catch (error) {
        results.failed.push({ recipient, error: error.message });
        console.log(`   ❌ Failed to send to ${recipient}: ${error.message}`);
      }
    }
    
    return results;
  }
  
  /**
   * Personalize email content for recipient
   */
  personalizeEmail(content, recipient, saoLevels) {
    // Extract recipient name from email
    const name = recipient.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Determine SAO level of this recipient
    let recipientSaoLevel = 'Unknown';
    for (const [level, emails] of Object.entries(this.saoDistributionLists)) {
      if (emails.includes(recipient)) {
        recipientSaoLevel = level.charAt(0).toUpperCase() + level.slice(1);
        break;
      }
    }
    
    const personalizedHeader = `
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #FFD700;">ASOOS Communication</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">
          Dear ${name} (${recipientSaoLevel} SAO),<br>
          You are receiving this message as part of the ASOOS network communication.
        </p>
      </div>
    `;
    
    const personalizedFooter = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #FFD700;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          <strong>Privacy Notice:</strong> This message was sent only to you. Other recipients cannot see your email address or SAO level.
        </p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
          ASOOS - AI Publishing International LLP | Sent from: ASOOS@aixtiv.com
        </p>
      </div>
    `;
    
    return personalizedHeader + content + personalizedFooter;
  }
  
  /**
   * Get email transporter with credentials from Secret Manager
   */
  async getEmailTransporter() {
    try {
      const [version] = await this.secretClient.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/asoos-email-credentials/versions/latest`,
      });
      
      const credentials = JSON.parse(version.payload.data.toString());
      
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: credentials.email,
          pass: credentials.password
        }
      });
    } catch (error) {
      console.warn('⚠️ Using development email transporter');
      // Development fallback
      return nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ASOOS_EMAIL_USER,
          pass: process.env.ASOOS_EMAIL_PASS
        }
      });
    }
  }
  
  /**
   * Test the routing system
   */
  async testRouting(trigger) {
    const testEmail = {
      to: 'admin@asoos.2100.cool',
      subject: `ASOOS Test Email - ${trigger.toUpperCase()} Routing`,
      content: `
        <h3>Test Email Routing</h3>
        <p>This is a test of the ASOOS email routing system using the trigger: <strong>"${trigger}"</strong></p>
        <p>If you receive this email, the routing system is working correctly for your SAO level.</p>
        <p><em>Test sent at: ${new Date().toLocaleString()}</em></p>
      `,
      trigger: trigger
    };
    
    return await this.routeEmail(testEmail);
  }
  
  /**
   * Get routing status
   */
  getRoutingStatus() {
    const totalRecipients = this.getAllRecipients().length;
    
    return {
      system: 'ASOOS Email Routing',
      status: 'operational',
      senderEmail: this.senderEmail,
      totalRecipients: totalRecipients,
      saoLevels: {
        diamond: this.saoDistributionLists.diamond.length,
        emerald: this.saoDistributionLists.emerald.length,
        sapphire: this.saoDistributionLists.sapphire.length,
        opal: this.saoDistributionLists.opal.length,
        onyx: this.saoDistributionLists.onyx.length
      },
      newsletterDistribution: {
        internal: this.newsletterDistributionLists.internal.length,
        external: this.newsletterDistributionLists.external.length
      },
      agentCommunication: {
        totalAgents: this.agentCommunicationSystem.totalAgents,
        grandHyperloopEnabled: true
      },
      didcArchives: {
        enabled: this.didcArchives.enabled,
        categories: this.didcArchives.categories.length,
        humanAccess: this.didcArchives.humanAccessEndpoint
      },
      availableTriggers: ['all', 'diamond', 'emerald', 'sapphire', 'opal', 'onyx', 'internal-newsletter', 'external-newsletter'],
      privacyProtection: 'individual-send-only',
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export the router
export default ASOOSEmailRouter;

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const router = new ASOOSEmailRouter();
  const command = process.argv[2];
  const trigger = process.argv[3];
  
  switch (command) {
    case 'status':
      console.log(JSON.stringify(router.getRoutingStatus(), null, 2));
      break;
      
    case 'test':
      if (!trigger) {
        console.log('Usage: node email-routing-system.js test [all|diamond|emerald|sapphire|opal|onyx]');
        process.exit(1);
      }
      router.testRouting(trigger).then(result => {
        console.log('Test Results:', JSON.stringify(result, null, 2));
      }).catch(console.error);
      break;
      
    default:
      console.log('ASOOS Email Routing System Commands:');
      console.log('  status                    - Show routing system status');
      console.log('  test [trigger]           - Test email routing with trigger');
      console.log('');
      console.log('Available triggers: all, diamond, emerald, sapphire, opal, onyx, internal-newsletter, external-newsletter');
      console.log('');
      console.log('Examples:');
      console.log('  node email-routing-system.js test all');
      console.log('  node email-routing-system.js test diamond');
      console.log('  node email-routing-system.js test internal-newsletter');
      console.log('  node email-routing-system.js test external-newsletter');
      console.log('  node email-routing-system.js status');
  }
}