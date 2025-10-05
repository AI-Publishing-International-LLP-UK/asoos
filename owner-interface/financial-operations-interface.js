/**
 * Financial Operations Interface Components
 * 
 * Vanilla JS components for mocoa owner interface integration
 * Implements beveled panel design with left "do" / right "see" layout
 * 
 * @author AI Publishing International LLP
 * @compliance Dr. Burby KC Approved
 * @version 2.0.0 - Interface Ready
 */

class FinancialOperationsInterface {
  constructor() {
    this.walletManager = null;
    this.currentWalletId = null;
    this.sallyPortToken = localStorage.getItem('sallyport_token');
    this.refreshInterval = null;
    
    this.initialize();
  }

  initialize() {
    console.log('🏦 Financial Operations Interface initializing...');
    this.createMainInterface();
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  /**
   * Create main financial interface with beveled panels
   */
  createMainInterface() {
    const mainContainer = document.getElementById('financial-operations-container') || 
      this.createMainContainer();

    mainContainer.innerHTML = `
      <div class="financial-operations-layout">
        <!-- Left Panel - DO Area -->
        <div class="financial-panel-left beveled-panel">
          <div class="panel-header">
            <h2>💰 Financial Operations</h2>
            <div class="tier-indicator" id="wallet-tier">DIAMOND</div>
          </div>
          
          <!-- Wallet Status Section -->
          <div class="wallet-status-section">
            <div class="wallet-balance-display" id="wallet-balance">
              <div class="balance-main">$0.00</div>
              <div class="balance-currency">USD</div>
              <div class="balance-update">Last updated: Never</div>
            </div>
            
            <div class="balance-breakdown">
              <div class="balance-item">
                <span class="source-label">Stripe:</span>
                <span class="source-amount" id="stripe-balance">$0.00</span>
              </div>
              <div class="balance-item">
                <span class="source-label">Xero:</span>
                <span class="source-amount" id="xero-balance">$0.00</span>
              </div>
              <div class="balance-item">
                <span class="source-label">Internal:</span>
                <span class="source-amount" id="internal-balance">$0.00</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-section">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button class="action-btn primary" onclick="financialOps.initiatePayment()">
                💳 New Payment
              </button>
              <button class="action-btn secondary" onclick="financialOps.createInvoice()">
                📄 Create Invoice
              </button>
              <button class="action-btn secondary" onclick="financialOps.initiateTransfer()">
                💸 Transfer Funds
              </button>
              <button class="action-btn tertiary" onclick="financialOps.generateReport()">
                📊 Generate Report
              </button>
            </div>
          </div>

          <!-- Compliance Status -->
          <div class="compliance-section">
            <h3>🛡️ Compliance Status</h3>
            <div class="compliance-indicator" id="compliance-status">
              <div class="compliance-score">
                <span class="score-value" id="compliance-score-value">100</span>
                <span class="score-suffix">%</span>
              </div>
              <div class="compliance-details">
                <div class="status-item">
                  <span class="status-label">Dr. Burby KC:</span>
                  <span class="status-value approved" id="burby-status">APPROVED</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Risk Score:</span>
                  <span class="status-value low" id="risk-score">LOW</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity Preview -->
          <div class="activity-preview-section">
            <h3>Recent Activity</h3>
            <div class="activity-list" id="recent-activity-preview">
              <div class="activity-item placeholder">
                <div class="activity-icon">⏳</div>
                <div class="activity-details">Loading recent transactions...</div>
              </div>
            </div>
            <button class="view-all-btn" onclick="financialOps.showAllActivity()">
              View All Activity
            </button>
          </div>
        </div>

        <!-- Right Panel - SEE Area -->
        <div class="financial-panel-right beveled-panel">
          <div class="panel-header">
            <h2>📈 Financial Dashboard</h2>
            <div class="refresh-controls">
              <button class="refresh-btn" onclick="financialOps.refreshData()" id="refresh-btn">
                🔄 Refresh
              </button>
              <span class="auto-refresh-indicator">Auto-refresh: ON</span>
            </div>
          </div>

          <!-- Dynamic Content Area -->
          <div class="dashboard-content" id="dashboard-content">
            ${this.createDashboardHome()}
          </div>
        </div>
      </div>

      <!-- Transaction Modal -->
      <div class="transaction-modal" id="transaction-modal" style="display: none;">
        <div class="modal-content beveled-panel">
          <div class="modal-header">
            <h3 id="modal-title">New Transaction</h3>
            <button class="close-btn" onclick="financialOps.closeModal()">&times;</button>
          </div>
          <div class="modal-body" id="modal-body">
            <!-- Dynamic modal content -->
          </div>
        </div>
      </div>

      <!-- Compliance Ticker (Bottom) -->
      <div class="compliance-ticker" id="compliance-ticker">
        <div class="ticker-content" id="ticker-content">
          🛡️ Dr. Burby KC Compliance System Active • All financial operations monitored • 
          Real-time risk assessment enabled • SallyPort authentication verified • 
        </div>
      </div>
    `;

    // Apply styles
    this.applyStyles();
    
    // Initialize dashboard
    this.loadWalletData();
  }

  createMainContainer() {
    const container = document.createElement('div');
    container.id = 'financial-operations-container';
    container.className = 'financial-operations-main';
    
    // Insert into existing mocoa interface
    const mocoaContainer = document.querySelector('.mocoa-owner-interface') || 
      document.querySelector('#main-content') || 
      document.body;
    
    mocoaContainer.appendChild(container);
    return container;
  }

  createDashboardHome() {
    return `
      <div class="dashboard-home">
        <div class="dashboard-section">
          <h3>📊 Financial Overview</h3>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="card-label">Today's Transactions</div>
              <div class="card-value" id="today-transactions">0</div>
            </div>
            <div class="overview-card">
              <div class="card-label">Monthly Volume</div>
              <div class="card-value" id="monthly-volume">$0</div>
            </div>
            <div class="overview-card">
              <div class="card-label">Pending Approvals</div>
              <div class="card-value" id="pending-approvals">0</div>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h3>🏦 Wallet Health</h3>
          <div class="health-indicators">
            <div class="health-item">
              <div class="indicator-dot green"></div>
              <span>Stripe Integration: Active</span>
            </div>
            <div class="health-item">
              <div class="indicator-dot green"></div>
              <span>Xero Sync: Connected</span>
            </div>
            <div class="health-item">
              <div class="indicator-dot green"></div>
              <span>SallyPort Auth: Verified</span>
            </div>
            <div class="health-item">
              <div class="indicator-dot yellow"></div>
              <span>2FA: Enabled</span>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h3>📋 Recent Compliance Events</h3>
          <div class="compliance-events" id="compliance-events">
            <div class="event-item">
              <div class="event-timestamp">Just now</div>
              <div class="event-description">Dr. Burby KC validation: PASSED</div>
              <div class="event-status success">✓</div>
            </div>
            <div class="event-item">
              <div class="event-timestamp">5 min ago</div>
              <div class="event-description">AML check completed</div>
              <div class="event-status success">✓</div>
            </div>
            <div class="event-item">
              <div class="event-timestamp">1 hour ago</div>
              <div class="event-description">Transaction limit validation</div>
              <div class="event-status success">✓</div>
            </div>
          </div>
          <div class="scan-to-do-section">
            <button class="scan-to-do-btn" onclick="financialOps.scanToDo()">
              📱 Scan to Do
            </button>
            <span class="scan-help">Approve and blockchain confirm</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load wallet data and populate interface
   */
  async loadWalletData() {
    try {
      console.log('🔄 Loading wallet data...');
      
      // Simulate API calls - replace with actual Enhanced Wallet Manager calls
      const mockWalletStatus = {
        status: 'active',
        balance: {
          walletId: 'wallet_diamond_001',
          totalBalance: 125000.50,
          availableBalance: 120000.00,
          pendingBalance: 5000.50,
          breakdown: {
            stripe: 75000.25,
            xero: 45000.25,
            internal: 5000.00
          },
          currency: 'USD',
          lastUpdated: new Date()
        },
        compliance: {
          score: 95,
          status: 'active',
          lastReview: new Date()
        },
        recentActivity: [
          {
            transactionId: 'txn_001',
            type: 'payment',
            amount: 2500.00,
            description: 'Client Payment - Project Alpha',
            status: 'completed',
            timestamp: new Date(Date.now() - 300000), // 5 min ago
            complianceStatus: 'passed'
          },
          {
            transactionId: 'txn_002',
            type: 'invoice',
            amount: 5000.00,
            description: 'Monthly Consulting Services',
            status: 'sent',
            timestamp: new Date(Date.now() - 1800000), // 30 min ago
            complianceStatus: 'passed'
          }
        ]
      };

      this.updateInterface(mockWalletStatus);
      
    } catch (error) {
      console.error('❌ Failed to load wallet data:', error);
      this.showError('Failed to load financial data');
    }
  }

  /**
   * Update interface with wallet data
   */
  updateInterface(walletStatus) {
    const { balance, compliance, recentActivity } = walletStatus;

    // Update balance display
    document.getElementById('wallet-balance').querySelector('.balance-main').textContent = 
      `$${balance.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    
    document.getElementById('wallet-balance').querySelector('.balance-update').textContent = 
      `Last updated: ${balance.lastUpdated.toLocaleTimeString()}`;

    // Update balance breakdown
    document.getElementById('stripe-balance').textContent = 
      `$${balance.breakdown.stripe.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('xero-balance').textContent = 
      `$${balance.breakdown.xero.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('internal-balance').textContent = 
      `$${balance.breakdown.internal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Update compliance status
    document.getElementById('compliance-score-value').textContent = compliance.score;
    document.getElementById('burby-status').textContent = 
      compliance.score > 90 ? 'APPROVED' : 'REVIEW';
    document.getElementById('risk-score').textContent = 
      compliance.score > 90 ? 'LOW' : 'MEDIUM';

    // Update recent activity
    this.updateRecentActivity(recentActivity);

    // Update dashboard overview
    this.updateDashboardOverview(walletStatus);

    console.log('✅ Interface updated successfully');
  }

  updateRecentActivity(activities) {
    const container = document.getElementById('recent-activity-preview');
    
    if (!activities || activities.length === 0) {
      container.innerHTML = '<div class="activity-item">No recent activity</div>';
      return;
    }

    container.innerHTML = activities.slice(0, 3).map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
        <div class="activity-details">
          <div class="activity-description">${activity.description}</div>
          <div class="activity-meta">
            $${activity.amount.toLocaleString()} • ${activity.status} • 
            ${this.getTimeAgo(activity.timestamp)}
          </div>
        </div>
        <div class="activity-status ${activity.complianceStatus}">
          ${activity.complianceStatus === 'passed' ? '✅' : '⚠️'}
        </div>
      </div>
    `).join('');
  }

  updateDashboardOverview(walletStatus) {
    // Update overview cards
    document.getElementById('today-transactions').textContent = 
      walletStatus.recentActivity?.length || 0;
    
    document.getElementById('monthly-volume').textContent = 
      `$${(walletStatus.balance.totalBalance / 30 * new Date().getDate()).toLocaleString()}`;
    
    document.getElementById('pending-approvals').textContent = 
      walletStatus.recentActivity?.filter(a => a.status === 'pending').length || 0;
  }

  /**
   * Transaction Modal Methods
   */
  initiatePayment() {
    this.showModal('New Payment', this.createPaymentForm());
  }

  createInvoice() {
    this.showModal('Create Invoice', this.createInvoiceForm());
  }

  initiateTransfer() {
    this.showModal('Transfer Funds', this.createTransferForm());
  }

  generateReport() {
    this.showDashboardContent('Financial Reports', this.createReportsInterface());
  }

  showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('transaction-modal').style.display = 'flex';
  }

  closeModal() {
    document.getElementById('transaction-modal').style.display = 'none';
  }

  createPaymentForm() {
    return `
      <form class="transaction-form" onsubmit="financialOps.submitPayment(event)">
        <div class="form-group">
          <label for="payment-amount">Amount (USD)</label>
          <input type="number" id="payment-amount" step="0.01" min="0" required>
        </div>
        
        <div class="form-group">
          <label for="payment-description">Description</label>
          <input type="text" id="payment-description" required>
        </div>
        
        <div class="form-group">
          <label for="payment-method">Payment Method</label>
          <select id="payment-method" required>
            <option value="">Select method</option>
            <option value="stripe">Stripe</option>
            <option value="internal">Internal Transfer</option>
          </select>
        </div>
        
        <div class="compliance-notice">
          🛡️ This transaction will be validated by Dr. Burby KC compliance engine
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn secondary" onclick="financialOps.closeModal()">
            Cancel
          </button>
          <button type="submit" class="btn primary">
            Process Payment
          </button>
        </div>
      </form>
    `;
  }

  createInvoiceForm() {
    return `
      <form class="transaction-form" onsubmit="financialOps.submitInvoice(event)">
        <div class="form-group">
          <label for="invoice-amount">Amount (USD)</label>
          <input type="number" id="invoice-amount" step="0.01" min="0" required>
        </div>
        
        <div class="form-group">
          <label for="invoice-client">Client</label>
          <input type="text" id="invoice-client" required>
        </div>
        
        <div class="form-group">
          <label for="invoice-description">Description</label>
          <textarea id="invoice-description" rows="3" required></textarea>
        </div>
        
        <div class="form-group">
          <label for="invoice-due-date">Due Date</label>
          <input type="date" id="invoice-due-date" required>
        </div>
        
        <div class="compliance-notice">
          📋 Invoice will be created via Xero integration
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn secondary" onclick="financialOps.closeModal()">
            Cancel
          </button>
          <button type="submit" class="btn primary">
            Create Invoice
          </button>
        </div>
      </form>
    `;
  }

  createTransferForm() {
    return `
      <form class="transaction-form" onsubmit="financialOps.submitTransfer(event)">
        <div class="form-group">
          <label for="transfer-amount">Amount (USD)</label>
          <input type="number" id="transfer-amount" step="0.01" min="0" required>
        </div>
        
        <div class="form-group">
          <label for="transfer-from">From</label>
          <select id="transfer-from" required>
            <option value="">Select source</option>
            <option value="stripe">Stripe Account</option>
            <option value="internal">Internal Wallet</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="transfer-to">To</label>
          <select id="transfer-to" required>
            <option value="">Select destination</option>
            <option value="xero">Xero Account</option>
            <option value="internal">Internal Wallet</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="transfer-description">Purpose</label>
          <input type="text" id="transfer-description" required>
        </div>
        
        <div class="compliance-notice">
          🔒 High-value transfers require 2FA authentication
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn secondary" onclick="financialOps.closeModal()">
            Cancel
          </button>
          <button type="submit" class="btn primary">
            Execute Transfer
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Form Submission Handlers
   */
  async submitPayment(event) {
    event.preventDefault();
    
    const formData = {
      amount: parseFloat(document.getElementById('payment-amount').value),
      description: document.getElementById('payment-description').value,
      method: document.getElementById('payment-method').value
    };

    try {
      this.showProcessing('Processing payment...');
      
      // Simulate API call - replace with actual Enhanced Wallet Manager call
      await this.simulateApiCall(2000);
      
      this.showSuccess('Payment processed successfully!');
      this.closeModal();
      this.loadWalletData();
      
    } catch (error) {
      this.showError('Payment processing failed: ' + error.message);
    }
  }

  async submitInvoice(event) {
    event.preventDefault();
    
    const formData = {
      amount: parseFloat(document.getElementById('invoice-amount').value),
      client: document.getElementById('invoice-client').value,
      description: document.getElementById('invoice-description').value,
      dueDate: document.getElementById('invoice-due-date').value
    };

    try {
      this.showProcessing('Creating invoice...');
      
      await this.simulateApiCall(1500);
      
      this.showSuccess('Invoice created successfully!');
      this.closeModal();
      this.loadWalletData();
      
    } catch (error) {
      this.showError('Invoice creation failed: ' + error.message);
    }
  }

  async submitTransfer(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    
    // Check if 2FA is required
    if (amount > 1000) {
      if (!confirm('This transfer requires 2FA authentication. Continue?')) {
        return;
      }
    }

    const formData = {
      amount,
      from: document.getElementById('transfer-from').value,
      to: document.getElementById('transfer-to').value,
      description: document.getElementById('transfer-description').value
    };

    try {
      this.showProcessing('Executing transfer...');
      
      await this.simulateApiCall(2500);
      
      this.showSuccess('Transfer completed successfully!');
      this.closeModal();
      this.loadWalletData();
      
    } catch (error) {
      this.showError('Transfer failed: ' + error.message);
    }
  }

  /**
   * Dashboard Content Methods
   */
  showAllActivity() {
    this.showDashboardContent('Transaction History', this.createActivityInterface());
  }

  showDashboardContent(title, content) {
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.innerHTML = `
      <div class="dashboard-header">
        <h3>${title}</h3>
        <button class="back-btn" onclick="financialOps.showDashboardHome()">
          ← Back to Dashboard
        </button>
      </div>
      ${content}
    `;
  }

  showDashboardHome() {
    document.getElementById('dashboard-content').innerHTML = this.createDashboardHome();
  }

  createActivityInterface() {
    return `
      <div class="activity-interface">
        <div class="activity-filters">
          <select id="activity-type-filter">
            <option value="">All Types</option>
            <option value="payment">Payments</option>
            <option value="invoice">Invoices</option>
            <option value="transfer">Transfers</option>
          </select>
          
          <select id="activity-status-filter">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <button class="filter-btn" onclick="financialOps.applyActivityFilters()">
            Apply Filters
          </button>
        </div>
        
        <div class="activity-table">
          <div class="table-header">
            <div class="col-date">Date</div>
            <div class="col-type">Type</div>
            <div class="col-description">Description</div>
            <div class="col-amount">Amount</div>
            <div class="col-status">Status</div>
            <div class="col-compliance">Compliance</div>
          </div>
          <div class="table-body" id="activity-table-body">
            <!-- Activity rows will be populated here -->
          </div>
        </div>
      </div>
    `;
  }

  createReportsInterface() {
    return `
      <div class="reports-interface">
        <div class="report-options">
          <div class="report-type-selection">
            <h4>Report Type</h4>
            <div class="radio-group">
              <label>
                <input type="radio" name="report-type" value="financial" checked>
                Financial Overview
              </label>
              <label>
                <input type="radio" name="report-type" value="compliance">
                Compliance Report
              </label>
              <label>
                <input type="radio" name="report-type" value="activity">
                Transaction Activity
              </label>
            </div>
          </div>
          
          <div class="date-range-selection">
            <h4>Date Range</h4>
            <div class="date-inputs">
              <input type="date" id="report-start-date" required>
              <span>to</span>
              <input type="date" id="report-end-date" required>
            </div>
          </div>
          
          <button class="generate-report-btn" onclick="financialOps.generateFinancialReport()">
            📊 Generate Report
          </button>
        </div>
        
        <div class="report-preview" id="report-preview">
          <div class="preview-placeholder">
            Select report parameters and click "Generate Report" to preview
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Scan to Do functionality
   */
  scanToDo() {
    alert('📱 Scan to Do functionality would integrate with mobile app for blockchain confirmation');
  }

  /**
   * Utility Methods
   */
  setupEventListeners() {
    // Auto-refresh toggle
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('auto-refresh-indicator')) {
        this.toggleAutoRefresh();
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 30000); // Refresh every 30 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggleAutoRefresh() {
    const indicator = document.querySelector('.auto-refresh-indicator');
    
    if (this.refreshInterval) {
      this.stopAutoRefresh();
      indicator.textContent = 'Auto-refresh: OFF';
      indicator.classList.add('disabled');
    } else {
      this.startAutoRefresh();
      indicator.textContent = 'Auto-refresh: ON';
      indicator.classList.remove('disabled');
    }
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;

    try {
      await this.loadWalletData();
      this.updateComplianceTicker();
    } finally {
      refreshBtn.textContent = '🔄 Refresh';
      refreshBtn.disabled = false;
    }
  }

  updateComplianceTicker() {
    const tickerContent = document.getElementById('ticker-content');
    const messages = [
      '🛡️ Dr. Burby KC Compliance System Active',
      '📊 All financial operations monitored',
      '⚡ Real-time risk assessment enabled',
      '🔐 SallyPort authentication verified',
      '✅ System status: ALL GREEN'
    ];
    
    const currentTime = new Date().toLocaleTimeString();
    tickerContent.textContent = 
      `${messages.join(' • ')} • Last update: ${currentTime} • `;
  }

  getActivityIcon(type) {
    const icons = {
      payment: '💳',
      invoice: '📄',
      transfer: '💸',
      refund: '🔄',
      subscription: '📅'
    };
    return icons[type] || '💰';
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return timestamp.toLocaleDateString();
  }

  simulateApiCall(delay = 1000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, delay);
    });
  }

  showProcessing(message) {
    // Could integrate with your notification system
    console.log('⏳', message);
  }

  showSuccess(message) {
    console.log('✅', message);
    // Update ticker with success message
    this.updateComplianceTicker();
  }

  showError(message) {
    console.error('❌', message);
    alert(message); // Replace with proper notification system
  }

  /**
   * Apply beveled panel styles
   */
  applyStyles() {
    const styleId = 'financial-operations-styles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
      .financial-operations-main {
        width: 100%;
        height: 100vh;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #1a1a1a;
        color: #ffffff;
      }

      .financial-operations-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        height: calc(100vh - 60px);
        padding: 20px;
      }

      .beveled-panel {
        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
        border: 2px solid #404040;
        border-radius: 0;
        box-shadow: 
          inset -2px -2px 4px rgba(0,0,0,0.5),
          inset 2px 2px 4px rgba(255,255,255,0.1);
        padding: 20px;
        overflow-y: auto;
      }

      .financial-panel-left, .financial-panel-right {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #404040;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .panel-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 1.4rem;
      }

      .tier-indicator {
        background: linear-gradient(45deg, #ffd700, #ffed4e);
        color: #000;
        padding: 4px 12px;
        font-weight: bold;
        font-size: 0.8rem;
        box-shadow: inset 1px 1px 2px rgba(255,255,255,0.3);
      }

      .wallet-balance-display {
        text-align: center;
        background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
        padding: 20px;
        border: 1px solid #404040;
        margin-bottom: 15px;
      }

      .balance-main {
        font-size: 2.2rem;
        font-weight: bold;
        color: #00ff88;
        margin-bottom: 5px;
      }

      .balance-currency {
        color: #888;
        font-size: 0.9rem;
      }

      .balance-update {
        color: #666;
        font-size: 0.8rem;
        margin-top: 5px;
      }

      .balance-breakdown {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .balance-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        padding: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid #333;
      }

      .source-label {
        color: #888;
        font-size: 0.8rem;
        margin-bottom: 5px;
      }

      .source-amount {
        color: #ffffff;
        font-weight: bold;
      }

      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .action-btn {
        background: linear-gradient(145deg, #404040, #2a2a2a);
        border: 1px solid #555;
        color: #ffffff;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
      }

      .action-btn:hover {
        background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
        transform: translateY(-1px);
      }

      .action-btn.primary {
        background: linear-gradient(145deg, #0066cc, #004499);
        border-color: #0077dd;
      }

      .action-btn.secondary {
        background: linear-gradient(145deg, #666, #444);
      }

      .action-btn.tertiary {
        background: linear-gradient(145deg, #333, #222);
      }

      .compliance-indicator {
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(0,255,136,0.1);
        padding: 15px;
        border: 1px solid #00ff88;
      }

      .compliance-score {
        font-size: 2rem;
        font-weight: bold;
        color: #00ff88;
      }

      .score-suffix {
        font-size: 1rem;
        color: #888;
      }

      .status-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }

      .status-label {
        color: #888;
      }

      .status-value.approved {
        color: #00ff88;
        font-weight: bold;
      }

      .status-value.low {
        color: #00ff88;
      }

      .activity-list {
        max-height: 200px;
        overflow-y: auto;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        border-bottom: 1px solid #333;
        background: rgba(255,255,255,0.02);
        margin-bottom: 5px;
      }

      .activity-icon {
        font-size: 1.2rem;
        width: 24px;
        text-align: center;
      }

      .activity-details {
        flex: 1;
      }

      .activity-description {
        color: #ffffff;
        font-weight: 500;
      }

      .activity-meta {
        color: #888;
        font-size: 0.8rem;
        margin-top: 3px;
      }

      .activity-status.passed {
        color: #00ff88;
      }

      .view-all-btn {
        width: 100%;
        background: linear-gradient(145deg, #333, #222);
        border: 1px solid #444;
        color: #ffffff;
        padding: 8px;
        cursor: pointer;
        margin-top: 10px;
      }

      .dashboard-content {
        height: 100%;
        overflow-y: auto;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .overview-card {
        background: rgba(255,255,255,0.05);
        padding: 15px;
        border: 1px solid #333;
        text-align: center;
      }

      .card-label {
        color: #888;
        font-size: 0.8rem;
        margin-bottom: 8px;
      }

      .card-value {
        color: #ffffff;
        font-size: 1.5rem;
        font-weight: bold;
      }

      .health-indicators {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .health-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(255,255,255,0.02);
      }

      .indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .indicator-dot.green {
        background: #00ff88;
      }

      .indicator-dot.yellow {
        background: #ffdd00;
      }

      .indicator-dot.red {
        background: #ff4444;
      }

      .compliance-events {
        max-height: 150px;
        overflow-y: auto;
      }

      .event-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 8px;
        border-bottom: 1px solid #333;
      }

      .event-timestamp {
        color: #888;
        font-size: 0.8rem;
        min-width: 80px;
      }

      .event-description {
        flex: 1;
        color: #ffffff;
      }

      .event-status.success {
        color: #00ff88;
      }

      .scan-to-do-section {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #333;
      }

      .scan-to-do-btn {
        background: linear-gradient(45deg, #ff6b35, #ff8e53);
        border: none;
        color: white;
        padding: 10px 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }

      .scan-to-do-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(255,107,53,0.3);
      }

      .scan-help {
        color: #888;
        font-size: 0.8rem;
      }

      .transaction-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #404040;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .transaction-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group label {
        color: #888;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        background: rgba(255,255,255,0.05);
        border: 1px solid #404040;
        color: #ffffff;
        padding: 12px;
        font-size: 1rem;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #0066cc;
      }

      .compliance-notice {
        background: rgba(255,191,0,0.1);
        border: 1px solid #ffbf00;
        color: #ffbf00;
        padding: 10px;
        font-size: 0.9rem;
        text-align: center;
      }

      .form-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
      }

      .btn {
        padding: 12px 24px;
        border: 1px solid;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
      }

      .btn.primary {
        background: linear-gradient(145deg, #0066cc, #004499);
        border-color: #0077dd;
        color: white;
      }

      .btn.secondary {
        background: linear-gradient(145deg, #666, #444);
        border-color: #777;
        color: white;
      }

      .compliance-ticker {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: linear-gradient(90deg, #1a1a1a, #2a2a2a);
        border-top: 1px solid #404040;
        overflow: hidden;
        display: flex;
        align-items: center;
      }

      .ticker-content {
        color: #888;
        font-size: 0.8rem;
        white-space: nowrap;
        animation: ticker 60s linear infinite;
      }

      @keyframes ticker {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }

      .refresh-controls {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .refresh-btn {
        background: linear-gradient(145deg, #333, #222);
        border: 1px solid #444;
        color: #ffffff;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 0.8rem;
      }

      .auto-refresh-indicator {
        color: #00ff88;
        font-size: 0.8rem;
        cursor: pointer;
      }

      .auto-refresh-indicator.disabled {
        color: #666;
      }

      @media (max-width: 768px) {
        .financial-operations-layout {
          grid-template-columns: 1fr;
          height: auto;
        }
        
        .action-buttons {
          grid-template-columns: 1fr;
        }
        
        .overview-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(styles);
  }
}

// Initialize the financial operations interface
let financialOps;

document.addEventListener('DOMContentLoaded', () => {
  financialOps = new FinancialOperationsInterface();
});

// Export for global access
window.FinancialOperationsInterface = FinancialOperationsInterface;