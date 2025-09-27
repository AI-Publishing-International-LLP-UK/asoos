/**
 * SUBSCRIPTION INTEGRATION - AMBASSADOR REFERRAL FRONTEND
 * High-speed subscription processing with QMM NFT integration
 * 
 * Features:
 * - Enhanced subscription form processing
 * - Ambassador referral capabilities setup
 * - QMM NFT membership integration
 * - Automated upward communication enablement
 * - One-click referral system activation
 * 
 * @author AI Publishing International LLP
 * @version 1.0.0 - Ambassador Edition
 */

class SubscriptionIntegration {
    constructor() {
        this.name = 'Subscription Integration';
        this.version = '1.0.0';
        this.baseURL = '/api/v1';
        this.ambassadorSystemURL = 'http://localhost:8084'; // Ambassador Referral System
        
        // Initialize subscription processing
        this.initializeSubscriptionForm();
        this.setupAmbassadorFeatures();
        
        console.log('🚀 SUBSCRIPTION INTEGRATION LOADED');
        console.log('👔 Ambassador referral capabilities ENABLED');
    }
    
    /**
     * Initialize subscription form with ambassador features
     */
    initializeSubscriptionForm() {
        // Enhanced form submission handler
        const subscriptionForm = document.getElementById('subscription-form');
        if (subscriptionForm) {
            subscriptionForm.addEventListener('submit', (e) => this.handleSubscriptionSubmit(e));
        }
        
        // Add ambassador features to form
        this.enhanceSubscriptionFormWithAmbassador();
        
        // Setup referral capability preview
        this.setupReferralPreview();
    }
    
    /**
     * Enhanced subscription form with ambassador capabilities
     */
    enhanceSubscriptionFormWithAmbassador() {
        const form = document.getElementById('subscription-form');
        if (!form) return;
        
        // Add ambassador benefits section
        const ambassadorSection = document.createElement('div');
        ambassadorSection.className = 'ambassador-benefits-section';
        ambassadorSection.innerHTML = `
            <div class="ambassador-upgrade">
                <h3>🎯 Become an Ambassador</h3>
                <div class="ambassador-benefits">
                    <div class="benefit">
                        <span class="icon">👔</span>
                        <span class="text">One-click referrals to executives & legal</span>
                    </div>
                    <div class="benefit">
                        <span class="icon">📧</span>
                        <span class="text">Pre-written professional communications</span>
                    </div>
                    <div class="benefit">
                        <span class="icon">📄</span>
                        <span class="text">Automated contract & agreement generation</span>
                    </div>
                    <div class="benefit">
                        <span class="icon">🎨</span>
                        <span class="text">Exclusive Queen Mintmark NFT membership</span>
                    </div>
                    <div class="benefit">
                        <span class="icon">💼</span>
                        <span class="text">Company-specific customization</span>
                    </div>
                </div>
                <label class="ambassador-checkbox">
                    <input type="checkbox" id="ambassador-upgrade" name="ambassadorUpgrade" checked>
                    <span class="checkmark"></span>
                    Enable Ambassador Referral Capabilities (Recommended)
                </label>
            </div>
        `;
        
        // Insert before submit button
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            form.insertBefore(ambassadorSection, submitButton);
        }
    }
    
    /**
     * Setup referral capability preview
     */
    setupReferralPreview() {
        const ambassadorCheckbox = document.getElementById('ambassador-upgrade');
        if (ambassadorCheckbox) {
            ambassadorCheckbox.addEventListener('change', (e) => {
                this.toggleReferralPreview(e.target.checked);
            });
            
            // Show preview by default
            this.toggleReferralPreview(true);
        }
    }
    
    /**
     * Toggle referral capability preview
     */
    toggleReferralPreview(enabled) {
        let previewSection = document.querySelector('.referral-preview-section');
        
        if (enabled && !previewSection) {
            previewSection = document.createElement('div');
            previewSection.className = 'referral-preview-section';
            previewSection.innerHTML = `
                <div class="referral-preview">
                    <h4>🚀 Your Referral Capabilities</h4>
                    <div class="referral-actions">
                        <div class="referral-action" data-type="senior">
                            <div class="action-icon">👨‍💼</div>
                            <div class="action-content">
                                <h5>Senior Executive Referral</h5>
                                <p>One-click to send professional communication upward to executives, VPs, and C-level leadership</p>
                                <div class="action-features">
                                    <span class="feature">Pre-written emails</span>
                                    <span class="feature">Executive contracts</span>
                                    <span class="feature">ROI analysis</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="referral-action" data-type="legal">
                            <div class="action-icon">⚖️</div>
                            <div class="action-content">
                                <h5>Legal Department Package</h5>
                                <p>Comprehensive legal review package with compliance documentation and ready-to-review contracts</p>
                                <div class="action-features">
                                    <span class="feature">Legal documents</span>
                                    <span class="feature">Compliance certs</span>
                                    <span class="feature">Risk assessment</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="referral-action" data-type="team">
                            <div class="action-icon">👥</div>
                            <div class="action-content">
                                <h5>Team Leader Invitation</h5>
                                <p>Automated invitations to team leaders and managers with implementation plans and team benefits</p>
                                <div class="action-features">
                                    <span class="feature">Management templates</span>
                                    <span class="feature">Team benefits</span>
                                    <span class="feature">Implementation plans</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="preview-note">
                        <p><strong>After subscription:</strong> Access your ambassador dashboard to send one-click referrals with zero manual work required.</p>
                    </div>
                </div>
            `;
            
            const form = document.getElementById('subscription-form');
            const submitButton = form?.querySelector('button[type="submit"]');
            if (form && submitButton) {
                form.insertBefore(previewSection, submitButton);
            }
        } else if (!enabled && previewSection) {
            previewSection.remove();
        }
    }
    
    /**
     * Handle enhanced subscription form submission
     */
    async handleSubscriptionSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const ambassadorUpgrade = formData.get('ambassadorUpgrade') === 'on';
        
        // Show processing state
        this.showProcessingState('Processing your subscription...');
        
        try {
            // Collect form data
            const subscriptionData = {
                planType: formData.get('plan') || 'individual',
                companyName: formData.get('company') || formData.get('companyName'),
                contactName: formData.get('name') || formData.get('contactName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                industry: formData.get('industry') || 'Technology',
                ambassadorUpgrade: ambassadorUpgrade
            };
            
            console.log('📊 Processing subscription:', subscriptionData);
            
            // Process standard subscription first
            const subscriptionResult = await this.processStandardSubscription(subscriptionData);
            
            let ambassadorResult = null;
            
            // If ambassador upgrade enabled, setup ambassador capabilities
            if (ambassadorUpgrade) {
                console.log('👔 Setting up ambassador capabilities...');
                ambassadorResult = await this.setupAmbassadorCapabilities(subscriptionData);
            }
            
            // Show success with ambassador features if enabled
            this.showSuccessState(subscriptionResult, ambassadorResult);
            
            console.log('✅ Subscription completed successfully');
            
        } catch (error) {
            console.error('❌ Subscription failed:', error);
            this.showErrorState(error.message);
        }
    }
    
    /**
     * Process standard subscription
     */
    async processStandardSubscription(subscriptionData) {
        const response = await fetch(`${this.baseURL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionData)
        });
        
        if (!response.ok) {
            throw new Error('Subscription processing failed');
        }
        
        return await response.json();
    }
    
    /**
     * Setup ambassador capabilities
     */
    async setupAmbassadorCapabilities(subscriptionData) {
        try {
            const response = await fetch(`${this.ambassadorSystemURL}/ambassador/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscriptionData)
            });
            
            if (!response.ok) {
                throw new Error('Ambassador setup failed');
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Ambassador system not available, continuing with standard subscription');
            return null;
        }
    }
    
    /**
     * Show processing state
     */
    showProcessingState(message) {
        const form = document.getElementById('subscription-form');
        const submitButton = form?.querySelector('button[type="submit"]');
        
        if (submitButton) {
            submitButton.textContent = message;
            submitButton.disabled = true;
        }
        
        // Show processing indicator
        this.showNotification('info', message);
    }
    
    /**
     * Show success state with ambassador features
     */
    showSuccessState(subscriptionResult, ambassadorResult) {
        const form = document.getElementById('subscription-form');
        
        if (form) {
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'subscription-success';
            
            let successHTML = `
                <div class="success-header">
                    <h3>🎉 Subscription Successful!</h3>
                    <p>Welcome to AI Publishing International</p>
                </div>
                
                <div class="success-details">
                    <div class="success-item">
                        <span class="icon">✅</span>
                        <span class="text">Your ${subscriptionResult.planType || 'subscription'} plan is now active</span>
                    </div>
                    <div class="success-item">
                        <span class="icon">📄</span>
                        <span class="text">Legal agreement (PandaDoc contract) will arrive via email</span>
                    </div>
                    <div class="success-item">
                        <span class="icon">🎨</span>
                        <span class="text">Queen Mintmark NFT membership proof generated</span>
                    </div>
            `;
            
            // Add ambassador-specific success items
            if (ambassadorResult) {
                successHTML += `
                    <div class="success-item ambassador-success">
                        <span class="icon">🚀</span>
                        <span class="text">Ambassador capabilities ACTIVATED</span>
                    </div>
                    <div class="success-item ambassador-success">
                        <span class="icon">👔</span>
                        <span class="text">Ambassador ID: ${ambassadorResult.subscriptionId}</span>
                    </div>
                    <div class="success-item ambassador-success">
                        <span class="icon">🎯</span>
                        <span class="text">QMM Ambassador NFT: Token #${ambassadorResult.qmmNFT?.tokenId}</span>
                    </div>
                `;
            }
            
            successHTML += `
                </div>
                
                <div class="next-steps">
                    <h4>What's Next:</h4>
                    <ul>
                        <li>Check your email for contract documents</li>
                        <li>Access your dashboard to begin using AI agent services</li>
            `;
            
            if (ambassadorResult) {
                successHTML += `
                        <li><strong>Access your Ambassador Dashboard for one-click referrals</strong></li>
                        <li><strong>Send professional referrals to executives & legal teams</strong></li>
                `;
            }
            
            successHTML += `
                    </ul>
                </div>
            `;
            
            if (ambassadorResult) {
                successHTML += `
                    <div class="ambassador-dashboard-link">
                        <a href="${this.ambassadorSystemURL}/ambassador/${ambassadorResult.subscriptionId}/dashboard" 
                           target="_blank" class="dashboard-button">
                            🚀 Open Ambassador Dashboard
                        </a>
                    </div>
                `;
            }
            
            successMessage.innerHTML = successHTML;
            
            // Replace form with success message
            form.style.display = 'none';
            form.parentNode.insertBefore(successMessage, form.nextSibling);
        }
        
        this.showNotification('success', 'Subscription completed successfully!');
    }
    
    /**
     * Show error state
     */
    showErrorState(errorMessage) {
        const form = document.getElementById('subscription-form');
        const submitButton = form?.querySelector('button[type="submit"]');
        
        if (submitButton) {
            submitButton.textContent = 'Subscribe Now';
            submitButton.disabled = false;
        }
        
        this.showNotification('error', `Subscription failed: ${errorMessage}`);
    }
    
    /**
     * Show notification
     */
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    /**
     * Setup ambassador features for existing subscribers
     */
    setupAmbassadorFeatures() {
        // Add ambassador upgrade option for existing users
        const existingUserSection = document.querySelector('.existing-user-section');
        if (existingUserSection) {
            const upgradeButton = document.createElement('button');
            upgradeButton.className = 'ambassador-upgrade-button';
            upgradeButton.textContent = '🚀 Upgrade to Ambassador';
            upgradeButton.onclick = () => this.showAmbassadorUpgradeModal();
            
            existingUserSection.appendChild(upgradeButton);
        }
    }
    
    /**
     * Show ambassador upgrade modal for existing users
     */
    showAmbassadorUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'ambassador-upgrade-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 Upgrade to Ambassador</h3>
                    <span class="close-modal">&times;</span>
                </div>
                
                <div class="modal-body">
                    <p>Add powerful referral capabilities to your existing subscription:</p>
                    
                    <div class="upgrade-benefits">
                        <div class="benefit">👔 One-click executive referrals</div>
                        <div class="benefit">⚖️ Automated legal packages</div>
                        <div class="benefit">📧 Pre-written communications</div>
                        <div class="benefit">🎨 QMM Ambassador NFT</div>
                        <div class="benefit">💼 Commission eligibility</div>
                    </div>
                    
                    <form id="ambassador-upgrade-form">
                        <input type="email" placeholder="Your email" required>
                        <input type="text" placeholder="Company name" required>
                        <button type="submit">🚀 Enable Ambassador Features</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.appendChild(modal);
        
        // Setup modal close functionality
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        // Handle upgrade form
        modal.querySelector('#ambassador-upgrade-form').onsubmit = (e) => {
            this.handleAmbassadorUpgrade(e);
            modal.remove();
        };
    }
    
    /**
     * Handle ambassador upgrade for existing users
     */
    async handleAmbassadorUpgrade(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const upgradeData = {
            email: formData.get('email'),
            companyName: formData.get('company'),
            planType: 'existing-upgrade',
            ambassadorUpgrade: true
        };
        
        try {
            const result = await this.setupAmbassadorCapabilities(upgradeData);
            
            if (result) {
                this.showNotification('success', 'Ambassador capabilities activated! Check your email for dashboard access.');
                
                // Show ambassador dashboard link
                setTimeout(() => {
                    window.open(`${this.ambassadorSystemURL}/ambassador/${result.subscriptionId}/dashboard`, '_blank');
                }, 2000);
            }
        } catch (error) {
            this.showNotification('error', 'Ambassador upgrade failed. Please try again.');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SubscriptionIntegration();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubscriptionIntegration;
}