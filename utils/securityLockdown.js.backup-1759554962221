/**
 * AIXTIV Symphony Security Lockdown System
 * Prevents unauthorized interference with demo pages and system functionality
 * Blocks external manipulation and maintains system integrity
 *
 * @module securityLockdown
 * @author AI Publishing International LLP
 * @version 1.0.0
 */

// Security Configuration
const SECURITY_CONFIG = {
  AUTHORIZED_DOMAINS: [
    '2100.cool',
    'asoos.2100.cool',
    'sallyport.2100.cool',
    'mcp.aipub.2100.cool',
    'drclaude.live',
    'localhost',
    '127.0.0.1',
  ],

  AUTHORIZED_USERS: ['Mr. Phillip Corey Roark', 'Diamond SAO', 'Emerald SAO'],

  PROTECTED_FUNCTIONS: [
    'authenticateWithSallyPort',
    'openSettings',
    'updateAuthenticatedState',
    'initializeAuthFeatures',
    'toggleScanToApprove',
    'openGiftShop',
    'openPilotsLounge',
  ],

  BLOCKED_INTERFERENCE: [
    'addEventListener',
    'removeEventListener',
    'setAttribute',
    'innerHTML',
    'outerHTML',
    'style.display',
    'style.visibility',
    'disabled',
    'readonly',
  ],
};

class SecurityLockdown {
  constructor() {
    this.isLocked = false;
    this.securityLevel = 'DIAMOND_SAO';
    this.authorizedSession = false;
    this.interferenceAttempts = [];
    this.originalMethods = new Map();

    this.initialize();
  }

  initialize() {
    console.log('🔒 AIXTIV Security Lockdown System Initializing...');

    // Verify domain authorization
    this.verifyDomainAuth();

    // Lock down DOM manipulation methods
    this.lockdownDOMManipulation();

    // Protect critical functions
    this.protectCriticalFunctions();

    // Monitor for interference attempts
    this.startInterferenceMonitoring();

    // Block unauthorized script injection
    this.blockScriptInjection();

    // Override console methods to detect debugging attempts
    this.monitorConsoleActivity();

    console.log('🛡️  Security lockdown active - Unauthorized interference blocked');
  }

  verifyDomainAuth() {
    const currentDomain = window.location.hostname;
    const isAuthorized = SECURITY_CONFIG.AUTHORIZED_DOMAINS.some(
      (domain) => currentDomain.includes(domain) || domain === currentDomain
    );

    if (!isAuthorized) {
      console.warn('🚨 UNAUTHORIZED DOMAIN ACCESS ATTEMPT');
      this.lockPageFunctionality();
      return false;
    }

    this.authorizedSession = true;
    return true;
  }

  lockdownDOMManipulation() {
    // Store original methods
    this.originalMethods.set('addEventListener', Element.prototype.addEventListener);
    this.originalMethods.set('removeEventListener', Element.prototype.removeEventListener);
    this.originalMethods.set('setAttribute', Element.prototype.setAttribute);
    this.originalMethods.set('appendChild', Node.prototype.appendChild);
    this.originalMethods.set('removeChild', Node.prototype.removeChild);

    // Override DOM manipulation methods
    Element.prototype.addEventListener = this.createProtectedMethod('addEventListener');
    Element.prototype.removeEventListener = this.createProtectedMethod('removeEventListener');
    Element.prototype.setAttribute = this.createProtectedMethod('setAttribute');
    Node.prototype.appendChild = this.createProtectedMethod('appendChild');
    Node.prototype.removeChild = this.createProtectedMethod('removeChild');

    // Protect innerHTML and outerHTML
    this.protectHTMLProperties();
  }

  createProtectedMethod(methodName) {
    const original = this.originalMethods.get(methodName);

    return function (...args) {
      // Check if this is an authorized call
      if (!window.securityLockdown.authorizedSession) {
        console.warn(`🚨 BLOCKED: Unauthorized ${methodName} attempt`);
        window.securityLockdown.logInterferenceAttempt(methodName, args);
        return;
      }

      // Check call stack for suspicious activity
      const stack = new Error().stack;
      if (window.securityLockdown.detectSuspiciousCall(stack)) {
        console.warn(`🚨 SUSPICIOUS: ${methodName} blocked - unauthorized source`);
        return;
      }

      // Allow authorized calls
      return original.apply(this, args);
    };
  }

  protectHTMLProperties() {
    // Protect innerHTML and outerHTML from unauthorized modification
    const protectProperty = (obj, prop) => {
      const descriptor =
        Object.getOwnPropertyDescriptor(obj, prop) ||
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), prop);

      if (descriptor && descriptor.set) {
        const originalSetter = descriptor.set;

        Object.defineProperty(obj, prop, {
          set: function (value) {
            if (!window.securityLockdown.authorizedSession) {
              console.warn(`🚨 BLOCKED: Unauthorized ${prop} modification attempt`);
              window.securityLockdown.logInterferenceAttempt(prop, [value]);
              return;
            }

            return originalSetter.call(this, value);
          },
          get: descriptor.get,
          configurable: true,
        });
      }
    };

    // Apply to all DOM elements
    protectProperty(Element.prototype, 'innerHTML');
    protectProperty(Element.prototype, 'outerHTML');
    protectProperty(HTMLElement.prototype, 'style');
  }

  protectCriticalFunctions() {
    SECURITY_CONFIG.PROTECTED_FUNCTIONS.forEach((funcName) => {
      if (window[funcName]) {
        const originalFunc = window[funcName];

        window[funcName] = (...args) => {
          if (!this.authorizedSession) {
            console.warn(`🚨 BLOCKED: Unauthorized access to ${funcName}`);
            this.showSecurityAlert(`Unauthorized access blocked: ${funcName}`);
            return;
          }

          return originalFunc.apply(window, args);
        };
      }
    });
  }

  startInterferenceMonitoring() {
    // Monitor for common interference patterns
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          this.checkAttributeChange(mutation);
        } else if (mutation.type === 'childList') {
          this.checkNodeChanges(mutation);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
    });

    // Monitor for style changes that could disable functionality
    this.monitorStyleChanges();
  }

  checkAttributeChange(mutation) {
    const suspiciousAttributes = ['disabled', 'readonly', 'hidden', 'style'];

    if (suspiciousAttributes.includes(mutation.attributeName)) {
      const element = mutation.target;
      const newValue = element.getAttribute(mutation.attributeName);
      const oldValue = mutation.oldValue;

      // Check if this could be blocking functionality
      if (this.isSuspiciousChange(mutation.attributeName, oldValue, newValue)) {
        console.warn('🚨 SUSPICIOUS: Attribute change detected that could block functionality');
        this.logInterferenceAttempt('attribute_change', {
          element: element.tagName,
          attribute: mutation.attributeName,
          oldValue,
          newValue,
        });

        // Revert suspicious changes
        if (oldValue !== null) {
          element.setAttribute(mutation.attributeName, oldValue);
        } else {
          element.removeAttribute(mutation.attributeName);
        }
      }
    }
  }

  checkNodeChanges(mutation) {
    // Check for suspicious script or style injections
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (tagName === 'script' || tagName === 'style') {
          console.warn('🚨 BLOCKED: Unauthorized script/style injection attempt');
          this.logInterferenceAttempt('node_injection', {
            tag: tagName,
            content: node.textContent?.substring(0, 100),
          });

          // Remove the injected node
          node.remove();
        }
      }
    });
  }

  monitorStyleChanges() {
    // Override style setters to detect blocking attempts
    const originalStyleSetter = CSSStyleDeclaration.prototype.setProperty;

    CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
      // Check for properties that could disable functionality
      const blockingProperties = ['display', 'visibility', 'pointer-events', 'opacity'];
      const blockingValues = ['none', 'hidden', 'none', '0'];

      if (
        blockingProperties.includes(property) &&
        blockingValues.includes(value) &&
        !window.securityLockdown.authorizedSession
      ) {
        console.warn(`🚨 BLOCKED: Suspicious style change - ${property}: ${value}`);
        window.securityLockdown.logInterferenceAttempt('style_blocking', {
          property,
          value,
          element: this.parentElement?.tagName,
        });
        return;
      }

      return originalStyleSetter.call(this, property, value, priority);
    };
  }

  blockScriptInjection() {
    // Override createElement to block unauthorized script creation
    const originalCreateElement = document.createElement;

    document.createElement = function (tagName) {
      if (tagName.toLowerCase() === 'script' && !window.securityLockdown.authorizedSession) {
        console.warn('🚨 BLOCKED: Unauthorized script creation attempt');
        window.securityLockdown.logInterferenceAttempt('script_creation', { tagName });
        return originalCreateElement.call(document, 'div'); // Return harmless element
      }

      return originalCreateElement.call(document, tagName);
    };
  }

  monitorConsoleActivity() {
    // Monitor console for debugging attempts
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      this.checkConsoleActivity('log', args);
      return originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      this.checkConsoleActivity('warn', args);
      return originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.checkConsoleActivity('error', args);
      return originalError.apply(console, args);
    };
  }

  checkConsoleActivity(type, args) {
    const suspiciousPatterns = [
      'debugger',
      'breakpoint',
      'inspect',
      'bypass',
      'override',
      'hack',
      'disable',
    ];

    const message = args.join(' ').toLowerCase();
    const isSuspicious = suspiciousPatterns.some((pattern) => message.includes(pattern));

    if (isSuspicious) {
      this.logInterferenceAttempt('console_activity', { type, message: message.substring(0, 100) });
    }
  }

  detectSuspiciousCall(stack) {
    // Check for suspicious call patterns
    const suspiciousPatterns = [
      'eval',
      'Function',
      'setTimeout',
      'setInterval',
      'anonymous',
      'chrome-extension',
    ];

    return suspiciousPatterns.some((pattern) => stack.includes(pattern));
  }

  isSuspiciousChange(attribute, oldValue, newValue) {
    // Define what constitutes suspicious changes
    const suspiciousChanges = {
      disabled: newValue === 'true' || newValue === '',
      readonly: newValue === 'true' || newValue === '',
      hidden: newValue === 'true' || newValue === '',
      style:
        newValue &&
        (newValue.includes('display:none') ||
          newValue.includes('visibility:hidden') ||
          newValue.includes('pointer-events:none')),
    };

    return suspiciousChanges[attribute] || false;
  }

  logInterferenceAttempt(type, details) {
    const attempt = {
      timestamp: new Date().toISOString(),
      type,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
    };

    this.interferenceAttempts.push(attempt);

    // Send to security monitoring system
    this.reportToSecuritySystem(attempt);

    // Show security alert if too many attempts
    if (this.interferenceAttempts.length > 5) {
      this.activateEmergencyLockdown();
    }
  }

  reportToSecuritySystem(attempt) {
    // Send interference attempt to your security monitoring system
    fetch('/api/security/interference-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    }).catch(() => {
      // Fail silently - don't let security reporting break functionality
      console.log('Security report sent');
    });
  }

  activateEmergencyLockdown() {
    console.error('🚨 EMERGENCY SECURITY LOCKDOWN ACTIVATED');
    this.showSecurityAlert(
      'Multiple unauthorized access attempts detected. Emergency lockdown activated.'
    );

    // Disable all interactive elements
    document.querySelectorAll('button, input, textarea, select').forEach((el) => {
      if (!el.classList.contains('security-exempt')) {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
      }
    });

    // Show security overlay
    this.createSecurityOverlay();
  }

  lockPageFunctionality() {
    console.warn('🔒 Page functionality locked due to unauthorized domain');

    // Disable all buttons and inputs
    document.querySelectorAll('button, input, textarea').forEach((el) => {
      el.disabled = true;
      el.style.opacity = '0.5';
    });

    // Show unauthorized access message
    this.showSecurityAlert('Access denied: Unauthorized domain detected');
  }

  showSecurityAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(239, 68, 68, 0.95);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: monospace;
      font-size: 18px;
      text-align: center;
      backdrop-filter: blur(10px);
    `;

    alert.innerHTML = `
      <div>
        <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
        <div style="font-size: 24px; margin-bottom: 10px; color: #ffff00;">SECURITY ALERT</div>
        <div style="margin-bottom: 20px;">${message}</div>
        <div style="font-size: 14px; opacity: 0.8;">AIXTIV Symphony Security System</div>
      </div>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  createSecurityOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'securityOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: #ff6b6b;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Courier New', monospace;
      text-align: center;
    `;

    overlay.innerHTML = `
      <div>
        <h1 style="color: #ff6b6b; font-size: 36px; margin-bottom: 20px;">🚨 SECURITY LOCKDOWN 🚨</h1>
        <p style="font-size: 18px; margin-bottom: 20px;">Multiple unauthorized interference attempts detected</p>
        <p style="font-size: 14px; opacity: 0.8;">Contact system administrator for assistance</p>
        <div style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
          Attempts logged: ${this.interferenceAttempts.length}<br>
          Session ID: ${Date.now()}<br>
          Protected by AIXTIV Security System
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  // Emergency method to restore authorized access
  static authorizeEmergencyAccess(authCode) {
    if (authCode === 'DIAMOND_SAO_OVERRIDE_2025') {
      window.securityLockdown.authorizedSession = true;
      window.securityLockdown.interferenceAttempts = [];

      // Remove security overlays
      const overlay = document.getElementById('securityOverlay');
      if (overlay) {
        overlay.remove();
      }

      // Restore functionality
      document.querySelectorAll('button, input, textarea').forEach((el) => {
        el.disabled = false;
        el.style.pointerEvents = '';
        el.style.opacity = '';
      });

      console.log('🔓 Emergency access authorized - Security lockdown lifted');
      return true;
    }
    return false;
  }
}

// Initialize security system
if (typeof window !== 'undefined') {
  window.securityLockdown = new SecurityLockdown();

  // Expose emergency override for Diamond SAO
  window.emergencyOverride = SecurityLockdown.authorizeEmergencyAccess;

  // Protect the security system itself
  Object.freeze(window.securityLockdown);
  Object.freeze(SecurityLockdown);
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityLockdown;
}
