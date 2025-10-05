/**
 * 🪙 BACA COIN AGENT ASSET TRADING SYSTEM
 * 
 * CLASSIFICATION: DIAMOND SAO FINANCIAL SECURITY
 * Created for ASOOS Symphony - Closed Loop Economy
 * Date: October 5, 2025
 * 
 * Secure agent NFT trading through Baca Coin with OAuth2/OIDC authentication
 * NO external asset transfers - completely closed ecosystem
 */

const { OAuth2Service } = require('./oauth2/OAuth2Service');
const { SallyPortVerifier } = require('./auth/SallyPortVerifier');
const { BlockchainService } = require('./blockchain/S2DO-blockchain');

class BacaCoinAgentTradingSystem {
  constructor() {
    this.oauth2Service = new OAuth2Service();
    this.sallyPortVerifier = new SallyPortVerifier();
    this.blockchainService = new BlockchainService();
    
    // Baca Coin configuration - USD pegged
    this.bacaCoinConfig = {
      name: 'BACA Coin Meta',
      symbol: 'BACA',
      decimals: 8,
      peggedToUSD: true,
      exchangeRate: 1.00, // 1 BACA = 1 USD
      minimumTrade: 250.00, // $250 minimum (basic agent value)
      maximumTrade: 1000000.00, // $1M maximum (premium swarm value)
      tradingEnabled: true,
      externalTransfersBlocked: true
    };
    
    console.log('🪙 Baca Coin Agent Trading System initialized');
    console.log('💰 Exchange Rate: 1 BACA = $1.00 USD (pegged)');
    console.log('🔒 External transfers: BLOCKED');
  }

  /**
   * Authenticate user for agent trading using OAuth2/OIDC + SallyPort
   * @param {Object} credentials - User authentication credentials  
   * @param {string} credentials.oauth2Token - OAuth2 access token
   * @param {string} credentials.sallyPortToken - SallyPort verification token
   * @returns {Object} Authentication result with trading permissions
   */
  async authenticateTrader(credentials) {
    console.log('🔐 Authenticating trader for agent asset trading...');
    
    try {
      // Step 1: OAuth2/OIDC verification
      const oauth2Result = await this.oauth2Service.verifyToken(credentials.oauth2Token);
      if (!oauth2Result.valid) {
        return {
          success: false,
          error: 'OAuth2 authentication failed',
          code: 'OAUTH2_INVALID'
        };
      }

      // Step 2: SallyPort gateway verification
      const sallyPortResult = await this.sallyPortVerifier.verify(
        credentials.sallyPortToken, 
        { userId: oauth2Result.user.id }
      );
      if (!sallyPortResult.valid) {
        return {
          success: false,
          error: 'SallyPort verification failed',
          code: 'SALLYPORT_INVALID'
        };
      }

      // Step 3: Check user has valid Baca Coin wallet
      const walletStatus = await this.verifyBacaCoinWallet(oauth2Result.user.id);
      if (!walletStatus.valid) {
        return {
          success: false,
          error: 'Valid Baca Coin wallet required for trading',
          code: 'WALLET_REQUIRED'
        };
      }

      console.log('✅ Trader authentication successful');
      return {
        success: true,
        user: oauth2Result.user,
        permissions: sallyPortResult.permissions,
        walletAddress: walletStatus.address,
        bacaCoinBalance: walletStatus.balance,
        tradingTier: this.getTradingTier(sallyPortResult.permissions)
      };

    } catch (error) {
      console.error('💥 Trader authentication error:', error);
      return {
        success: false,
        error: 'Authentication system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Verify user has valid Baca Coin wallet (no external transfers allowed)
   * @param {string} userId - User identifier
   * @returns {Object} Wallet verification result
   */
  async verifyBacaCoinWallet(userId) {
    try {
      // Check if user has Baca Coin wallet in our closed system
      const walletData = await this.blockchainService.getUserWallet(userId, 'BACA');
      
      if (!walletData) {
        return {
          valid: false,
          reason: 'No Baca Coin wallet found - must create wallet first'
        };
      }

      // Verify wallet is properly configured for closed-loop trading only
      if (walletData.externalTransfersEnabled) {
        return {
          valid: false,
          reason: 'Wallet misconfigured - external transfers must be disabled'
        };
      }

      return {
        valid: true,
        address: walletData.address,
        balance: walletData.balance,
        lastActivity: walletData.lastActivity
      };

    } catch (error) {
      console.error('Wallet verification error:', error);
      return {
        valid: false,
        reason: 'Wallet verification system error'
      };
    }
  }

  /**
   * Purchase Baca Coin with USD (entry point to closed economy)
   * @param {string} userId - Authenticated user ID
   * @param {number} usdAmount - USD amount to convert to BACA
   * @param {Object} paymentMethod - External payment method (Stripe, etc.)
   * @returns {Object} Purchase result
   */
  async purchaseBacaCoin(userId, usdAmount, paymentMethod) {
    console.log(`💰 Processing Baca Coin purchase: $${usdAmount} USD`);

    try {
      // Validate purchase amount
      if (usdAmount < this.bacaCoinConfig.minimumTrade) {
        return {
          success: false,
          error: `Minimum purchase: $${this.bacaCoinConfig.minimumTrade}`,
          code: 'AMOUNT_TOO_LOW'
        };
      }

      if (usdAmount > this.bacaCoinConfig.maximumTrade) {
        return {
          success: false,
          error: `Maximum purchase: $${this.bacaCoinConfig.maximumTrade}`,
          code: 'AMOUNT_TOO_HIGH'
        };
      }

      // Process external USD payment (Stripe integration)
      const paymentResult = await this.processUSDPayment(usdAmount, paymentMethod);
      if (!paymentResult.success) {
        return {
          success: false,
          error: 'USD payment failed',
          code: 'PAYMENT_FAILED',
          details: paymentResult.error
        };
      }

      // Calculate Baca Coin amount (1:1 USD peg)
      const bacaCoinAmount = usdAmount * this.bacaCoinConfig.exchangeRate;

      // Mint Baca Coin to user's wallet
      const mintResult = await this.mintBacaCoin(userId, bacaCoinAmount, {
        transactionId: paymentResult.transactionId,
        usdAmount: usdAmount,
        timestamp: new Date().toISOString()
      });

      if (!mintResult.success) {
        // Refund USD payment if minting fails
        await this.refundUSDPayment(paymentResult.transactionId);
        return {
          success: false,
          error: 'Baca Coin minting failed',
          code: 'MINT_FAILED'
        };
      }

      console.log('✅ Baca Coin purchase successful');
      return {
        success: true,
        bacaCoinAmount: bacaCoinAmount,
        usdAmount: usdAmount,
        transactionId: mintResult.transactionId,
        walletBalance: mintResult.newBalance
      };

    } catch (error) {
      console.error('💥 Baca Coin purchase error:', error);
      return {
        success: false,
        error: 'Purchase system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Trade agent NFT assets between members using Baca Coin
   * @param {Object} tradeRequest - Trading request details
   * @returns {Object} Trade execution result
   */
  async tradeAgentAsset(tradeRequest) {
    const { 
      buyerAuth, 
      sellerAuth, 
      agentNFTId, 
      bacaCoinPrice, 
      tradeType // 'individual_agent' | 'agent_swarm' | 'agent_group'
    } = tradeRequest;

    console.log(`🤝 Processing agent asset trade: ${agentNFTId} for ${bacaCoinPrice} BACA`);

    try {
      // Step 1: Authenticate both parties
      const buyerVerification = await this.authenticateTrader(buyerAuth);
      const sellerVerification = await this.authenticateTrader(sellerAuth);

      if (!buyerVerification.success || !sellerVerification.success) {
        return {
          success: false,
          error: 'Authentication failed for one or both parties',
          code: 'AUTH_FAILED'
        };
      }

      // Step 2: Verify agent NFT ownership and trading permissions
      const assetVerification = await this.verifyAgentAssetOwnership(
        agentNFTId, 
        sellerVerification.user.id,
        tradeType
      );

      if (!assetVerification.valid) {
        return {
          success: false,
          error: 'Asset ownership verification failed',
          code: 'OWNERSHIP_INVALID',
          details: assetVerification.reason
        };
      }

      // Step 3: Verify buyer has sufficient Baca Coin balance
      if (buyerVerification.bacaCoinBalance < bacaCoinPrice) {
        return {
          success: false,
          error: 'Insufficient Baca Coin balance',
          code: 'INSUFFICIENT_FUNDS',
          required: bacaCoinPrice,
          available: buyerVerification.bacaCoinBalance
        };
      }

      // Step 4: Execute atomic trade (Baca Coin + NFT transfer)
      const tradeExecution = await this.executeAtomicTrade({
        buyer: buyerVerification,
        seller: sellerVerification,
        agentNFTId: agentNFTId,
        bacaCoinAmount: bacaCoinPrice,
        assetData: assetVerification.assetData
      });

      if (!tradeExecution.success) {
        return {
          success: false,
          error: 'Trade execution failed',
          code: 'TRADE_FAILED',
          details: tradeExecution.error
        };
      }

      console.log('✅ Agent asset trade completed successfully');
      return {
        success: true,
        tradeId: tradeExecution.tradeId,
        agentNFTId: agentNFTId,
        bacaCoinAmount: bacaCoinPrice,
        buyer: buyerVerification.user.id,
        seller: sellerVerification.user.id,
        timestamp: tradeExecution.timestamp,
        blockchainTxHash: tradeExecution.txHash
      };

    } catch (error) {
      console.error('💥 Agent asset trade error:', error);
      return {
        success: false,
        error: 'Trade system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Convert Baca Coin back to USD (exit from closed economy)
   * @param {string} userId - Authenticated user ID
   * @param {number} bacaCoinAmount - Amount of BACA to convert
   * @param {Object} withdrawalMethod - Bank account, PayPal, etc.
   * @returns {Object} Conversion result
   */
  async convertBacaCoinToUSD(userId, bacaCoinAmount, withdrawalMethod) {
    console.log(`💸 Processing Baca Coin to USD conversion: ${bacaCoinAmount} BACA`);

    try {
      // Verify user wallet and balance
      const walletStatus = await this.verifyBacaCoinWallet(userId);
      if (!walletStatus.valid || walletStatus.balance < bacaCoinAmount) {
        return {
          success: false,
          error: 'Insufficient Baca Coin balance',
          code: 'INSUFFICIENT_BALANCE'
        };
      }

      // Calculate USD amount (1:1 peg)
      const usdAmount = bacaCoinAmount * this.bacaCoinConfig.exchangeRate;

      // Burn Baca Coin from user's wallet
      const burnResult = await this.burnBacaCoin(userId, bacaCoinAmount);
      if (!burnResult.success) {
        return {
          success: false,
          error: 'Baca Coin burn failed',
          code: 'BURN_FAILED'
        };
      }

      // Process USD withdrawal
      const withdrawalResult = await this.processUSDWithdrawal(usdAmount, withdrawalMethod);
      if (!withdrawalResult.success) {
        // Re-mint Baca Coin if withdrawal fails
        await this.mintBacaCoin(userId, bacaCoinAmount, {
          reason: 'withdrawal_failed_refund',
          originalBurnTx: burnResult.transactionId
        });
        
        return {
          success: false,
          error: 'USD withdrawal failed',
          code: 'WITHDRAWAL_FAILED',
          details: withdrawalResult.error
        };
      }

      console.log('✅ Baca Coin to USD conversion successful');
      return {
        success: true,
        bacaCoinAmount: bacaCoinAmount,
        usdAmount: usdAmount,
        withdrawalId: withdrawalResult.withdrawalId,
        remainingBalance: burnResult.newBalance
      };

    } catch (error) {
      console.error('💥 Baca Coin conversion error:', error);
      return {
        success: false,
        error: 'Conversion system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Get user's trading tier based on SAO permissions
   * @param {Array} permissions - User's SallyPort permissions
   * @returns {Object} Trading tier configuration
   */
  getTradingTier(permissions) {
    if (permissions.includes('diamond-sao') || permissions.includes('*')) {
      return {
        tier: 'DIAMOND_SAO',
        maxTradeValue: 10000000, // $10M
        swarmTradingAllowed: true,
        premiumFeatures: true,
        tradingFeeDiscount: 100 // 100% discount (no fees)
      };
    }
    
    if (permissions.includes('emerald-sao')) {
      return {
        tier: 'EMERALD_SAO',
        maxTradeValue: 5000000, // $5M
        swarmTradingAllowed: true,
        premiumFeatures: true,
        tradingFeeDiscount: 90 // 90% discount
      };
    }
    
    if (permissions.includes('sapphire-sao')) {
      return {
        tier: 'SAPPHIRE_SAO',
        maxTradeValue: 1000000, // $1M
        swarmTradingAllowed: true,
        premiumFeatures: false,
        tradingFeeDiscount: 50 // 50% discount
      };
    }
    
    if (permissions.includes('opal-sao')) {
      return {
        tier: 'OPAL_SAO',
        maxTradeValue: 100000, // $100K
        swarmTradingAllowed: false,
        premiumFeatures: false,
        tradingFeeDiscount: 25 // 25% discount
      };
    }
    
    return {
      tier: 'ONYX_SAO',
      maxTradeValue: 10000, // $10K
      swarmTradingAllowed: false,
      premiumFeatures: false,
      tradingFeeDiscount: 0 // No discount
    };
  }

  /**
   * Execute atomic trade between two parties
   * @private
   */
  async executeAtomicTrade(tradeData) {
    const { buyer, seller, agentNFTId, bacaCoinAmount, assetData } = tradeData;
    
    try {
      // Create atomic transaction on blockchain
      const atomicTx = await this.blockchainService.createAtomicTransaction([
        // Transfer Baca Coin from buyer to seller
        {
          type: 'BACA_TRANSFER',
          from: buyer.walletAddress,
          to: seller.walletAddress,
          amount: bacaCoinAmount,
          currency: 'BACA'
        },
        // Transfer agent NFT from seller to buyer
        {
          type: 'NFT_TRANSFER',
          from: seller.user.id,
          to: buyer.user.id,
          tokenId: agentNFTId,
          contract: 'AGENT_NFT',
          metadata: assetData
        }
      ]);

      if (!atomicTx.success) {
        return {
          success: false,
          error: 'Atomic transaction failed',
          details: atomicTx.error
        };
      }

      return {
        success: true,
        tradeId: atomicTx.transactionId,
        txHash: atomicTx.blockchainHash,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: 'Atomic trade execution error',
        details: error.message
      };
    }
  }

  /**
   * Verify agent NFT ownership and trading eligibility
   * @private
   */
  async verifyAgentAssetOwnership(agentNFTId, userId, tradeType) {
    try {
      const assetData = await this.blockchainService.getAgentNFT(agentNFTId);
      
      if (!assetData) {
        return {
          valid: false,
          reason: 'Agent NFT not found'
        };
      }

      if (assetData.owner !== userId) {
        return {
          valid: false,
          reason: 'User does not own this agent NFT'
        };
      }

      if (assetData.locked || assetData.inEscrow) {
        return {
          valid: false,
          reason: 'Agent NFT is locked or in escrow'
        };
      }

      return {
        valid: true,
        assetData: assetData
      };

    } catch (error) {
      return {
        valid: false,
        reason: 'Asset verification system error'
      };
    }
  }

  /**
   * Mint Baca Coin to user wallet
   * @private
   */
  async mintBacaCoin(userId, amount, metadata) {
    return await this.blockchainService.mintToken({
      userId: userId,
      tokenType: 'BACA',
      amount: amount,
      metadata: metadata
    });
  }

  /**
   * Burn Baca Coin from user wallet  
   * @private
   */
  async burnBacaCoin(userId, amount) {
    return await this.blockchainService.burnToken({
      userId: userId,
      tokenType: 'BACA',
      amount: amount
    });
  }

  /**
   * Process USD payment through external gateway
   * @private
   */
  async processUSDPayment(amount, paymentMethod) {
    // Integration with Stripe or other payment processor
    // This handles the USD -> system entry point
    console.log(`Processing $${amount} USD payment via ${paymentMethod.type}`);
    
    // Placeholder - implement actual payment processing
    return {
      success: true,
      transactionId: `usd_pay_${Date.now()}`,
      amount: amount
    };
  }

  /**
   * Process USD withdrawal to external account
   * @private
   */
  async processUSDWithdrawal(amount, withdrawalMethod) {
    // Integration with banking/payment systems
    // This handles the system -> USD exit point
    console.log(`Processing $${amount} USD withdrawal via ${withdrawalMethod.type}`);
    
    // Placeholder - implement actual withdrawal processing
    return {
      success: true,
      withdrawalId: `usd_withdraw_${Date.now()}`,
      amount: amount
    };
  }

  /**
   * Refund USD payment if transaction fails
   * @private  
   */
  async refundUSDPayment(transactionId) {
    console.log(`Refunding USD payment: ${transactionId}`);
    // Implement refund logic
  }
}

module.exports = { BacaCoinAgentTradingSystem };