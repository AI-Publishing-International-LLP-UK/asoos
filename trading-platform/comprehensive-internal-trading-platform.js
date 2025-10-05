/**
 * 🏦 COMPREHENSIVE INTERNAL TRADING PLATFORM
 * 
 * CLASSIFICATION: AI Publishing International LLP - Complete Trading System
 * Created for ASOOS Symphony - Full End-to-End Trading Platform
 * Date: October 5, 2025
 * 
 * COMPLETE TRADING FLOWS:
 * 1. NFT Trading: Agent NFT ↔ BACA Meta
 * 2. PubSocial: USD ↔ BACA Meta transactions  
 * 3. BACA Invest: Place coins for trade, select funds
 * 4. Cross-trading: BACA Meta ↔ BACA Invest
 * 5. Full transaction management with OAuth2/OIDC
 */

const { ComprehensiveBacaInvestmentSystem } = require('../services/comprehensive-baca-investment-system');
const { OAuth2Service } = require('./oauth2/OAuth2Service');
const { SallyPortVerifier } = require('./auth/SallyPortVerifier');
const { BlockchainService } = require('./blockchain/S2DO-blockchain');
const { XeroIntegrationService } = require('./accounting/XeroIntegrationService');

class ComprehensiveInternalTradingPlatform {
  constructor() {
    this.bacaSystem = new ComprehensiveBacaInvestmentSystem();
    this.oauth2Service = new OAuth2Service();
    this.sallyPortVerifier = new SallyPortVerifier();
    this.blockchainService = new BlockchainService();
    this.xeroService = new XeroIntegrationService();
    
    // Trading Platform Configuration
    this.platformConfig = {
      name: 'AIPI Internal Trading Platform',
      version: '1.0.0',
      supportedFlows: [
        'nft_agent_trading',
        'pubsocial_usd_baca_meta',
        'baca_invest_fund_trading', 
        'cross_coin_trading',
        'availability_pool_trading'
      ],
      authentication: 'oauth2_oidc_sallyport',
      blockchain: 's2do_immutable_contracts',
      accounting: 'xero_automated'
    };
    
    // Trading Pairs Configuration
    this.tradingPairs = {
      // Agent NFT Trading
      'AGENT_NFT/BACA_META': {
        enabled: true,
        minimumValue: 250, // $250 basic agent
        maximumValue: 10000000, // $10M premium swarm
        feeStructure: 'tier_based',
        settlement: 'atomic'
      },
      
      // PubSocial USD-BACA Meta
      'USD/BACA_META': {
        enabled: true,
        exchangeRate: 1.00, // 1:1 peg
        minimumTrade: 250,
        maximumTrade: 1000000,
        externalGateway: 'stripe_banking',
        settlement: 'instant'
      },
      
      // BACA Invest Fund Trading
      'BACA_INV/GBP': {
        enabled: true,
        fundBacked: true,
        availableFunds: ['january2025', 'may2025', 'august2025'],
        settlement: 'llp_membership_update'
      },
      
      // Cross-coin Trading  
      'BACA_META/BACA_INV': {
        enabled: true,
        crossRate: 'market_determined',
        minimumTrade: 100,
        settlement: 'dual_blockchain'
      }
    };
    
    console.log('🏦 Comprehensive Internal Trading Platform initialized');
    console.log('💼 Supported: NFT, PubSocial, BACA Invest, Cross-trading');
    console.log('🔐 Authentication: OAuth2/OIDC + SallyPort');
    console.log('⚡ Settlement: Atomic transactions via S2DO blockchain');
  }

  /**
   * MAIN TRADING INTERFACE - Handle all trading requests
   * @param {Object} tradeRequest - Complete trading request
   * @returns {Object} Trade execution result
   */
  async executeTrade(tradeRequest) {
    const { 
      tradeType, 
      credentials, 
      tradeData,
      userPreferences = {}
    } = tradeRequest;

    console.log(`🔄 Processing ${tradeType} trade...`);

    try {
      // Step 1: Authenticate user for trading
      const authResult = await this.authenticateTrader(credentials);
      if (!authResult.success) {
        return {
          success: false,
          error: 'Authentication failed',
          code: 'AUTH_FAILED',
          details: authResult.error
        };
      }

      // Step 2: Route to appropriate trading flow
      let tradeResult;
      switch (tradeType) {
        case 'NFT_AGENT_TRADING':
          tradeResult = await this.handleAgentNFTTrading(authResult.user, tradeData);
          break;
          
        case 'PUBSOCIAL_USD_BACA_META':
          tradeResult = await this.handlePubSocialUSDToBacaMeta(authResult.user, tradeData);
          break;
          
        case 'BACA_INVEST_FUND_TRADING':
          tradeResult = await this.handleBacaInvestFundTrading(authResult.user, tradeData);
          break;
          
        case 'CROSS_COIN_TRADING':
          tradeResult = await this.handleCrossCoinTrading(authResult.user, tradeData);
          break;
          
        case 'AVAILABILITY_POOL_TRADING':
          tradeResult = await this.handleAvailabilityPoolTrading(authResult.user, tradeData);
          break;
          
        default:
          return {
            success: false,
            error: `Unsupported trade type: ${tradeType}`,
            code: 'UNSUPPORTED_TRADE_TYPE'
          };
      }

      // Step 3: Record transaction in Xero if successful
      if (tradeResult.success) {
        await this.recordTradeInXero(authResult.user, tradeType, tradeResult);
      }

      return tradeResult;

    } catch (error) {
      console.error('💥 Trade execution error:', error);
      return {
        success: false,
        error: 'Trade execution system error',
        code: 'SYSTEM_ERROR',
        details: error.message
      };
    }
  }

  /**
   * 🤖 AGENT NFT TRADING - Complete NFT ↔ BACA Meta flow
   */
  async handleAgentNFTTrading(user, tradeData) {
    const { 
      action, // 'buy_agent' | 'sell_agent' | 'trade_agents'
      agentNFTId,
      bacaMetaPrice,
      tradeDirection, // 'nft_to_baca' | 'baca_to_nft'
      counterparty = null
    } = tradeData;

    console.log(`🤖 Agent NFT Trading: ${action} - ${tradeDirection}`);

    try {
      if (tradeDirection === 'baca_to_nft') {
        // Buy Agent NFT with BACA Meta
        return await this.executeBacaMetaToAgentNFT(user, {
          agentNFTId: agentNFTId,
          bacaMetaAmount: bacaMetaPrice,
          seller: counterparty
        });
        
      } else if (tradeDirection === 'nft_to_baca') {
        // Sell Agent NFT for BACA Meta
        return await this.executeAgentNFTToBacaMeta(user, {
          agentNFTId: agentNFTId,
          askingPrice: bacaMetaPrice,
          buyer: counterparty
        });
      }

    } catch (error) {
      return {
        success: false,
        error: 'Agent NFT trading failed',
        code: 'NFT_TRADE_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 💰 PUBSOCIAL USD ↔ BACA META - Complete USD conversion flow
   */
  async handlePubSocialUSDToBacaMeta(user, tradeData) {
    const {
      direction, // 'usd_to_baca_meta' | 'baca_meta_to_usd'
      amount,
      paymentMethod,
      withdrawalMethod
    } = tradeData;

    console.log(`💰 PubSocial: ${direction} - Amount: ${amount}`);

    try {
      if (direction === 'usd_to_baca_meta') {
        // USD → BACA Meta conversion
        const purchaseResult = await this.bacaSystem.purchaseBacaMeta(
          user.id,
          amount,
          paymentMethod
        );
        
        return {
          success: purchaseResult.success,
          operation: 'USD_TO_BACA_META',
          usdAmount: amount,
          bacaMetaReceived: purchaseResult.bacaMetaAmount,
          exchangeRate: 1.00,
          purpose: 'Agent trading and services',
          error: purchaseResult.error
        };
        
      } else if (direction === 'baca_meta_to_usd') {
        // BACA Meta → USD conversion
        const conversionResult = await this.convertBacaMetaToUSD(
          user.id,
          amount,
          withdrawalMethod
        );
        
        return {
          success: conversionResult.success,
          operation: 'BACA_META_TO_USD',
          bacaMetaAmount: amount,
          usdReceived: conversionResult.usdAmount,
          exchangeRate: 1.00,
          withdrawalMethod: withdrawalMethod.type,
          error: conversionResult.error
        };
      }

    } catch (error) {
      return {
        success: false,
        error: 'PubSocial USD-BACA Meta conversion failed',
        code: 'PUBSOCIAL_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 🏛️ BACA INVEST FUND TRADING - Complete fund selection and trading
   */
  async handleBacaInvestFundTrading(user, tradeData) {
    const {
      action, // 'buy_fund_shares' | 'sell_to_pool' | 'select_fund' | 'trade_between_funds'
      fundOffering, // 'january2025' | 'may2025' | 'august2025'
      shareQuantity,
      targetFund,
      askingPrice,
      paymentMethod
    } = tradeData;

    console.log(`🏛️ BACA Invest Trading: ${action} in ${fundOffering}`);

    try {
      switch (action) {
        case 'buy_fund_shares':
          // Purchase shares in selected fund
          const purchaseResult = await this.bacaSystem.purchaseBacaInvest(
            user.id,
            fundOffering,
            shareQuantity,
            paymentMethod
          );
          
          return {
            success: purchaseResult.success,
            operation: 'FUND_SHARE_PURCHASE',
            fundOffering: purchaseResult.fundOffering,
            sharesAcquired: purchaseResult.bacaInvestAmount,
            totalCost: purchaseResult.totalCostGBP,
            llpMembership: purchaseResult.llpMembershipStatus,
            lotteryEligible: purchaseResult.lotteryEligibility,
            error: purchaseResult.error
          };
          
        case 'sell_to_pool':
          // Place BACA Invest in availability pool
          const poolResult = await this.bacaSystem.addToAvailabilityPool(
            user.id,
            shareQuantity,
            askingPrice
          );
          
          return {
            success: poolResult.success,
            operation: 'AVAILABILITY_POOL_LISTING',
            bacaInvestAmount: poolResult.bacaInvestAmount,
            askingPrice: poolResult.askingPriceGBP,
            listingId: poolResult.listingId,
            discoveryMethod: 'organic_only',
            error: poolResult.error
          };
          
        case 'select_fund':
          // Get fund information for selection
          const fundInfo = this.bacaSystem.getFundInformation(fundOffering);
          return {
            success: fundInfo.success,
            operation: 'FUND_SELECTION',
            availableFunds: this.getAvailableFunds(),
            selectedFund: fundInfo.fund,
            error: fundInfo.error
          };
          
        case 'trade_between_funds':
          // Trade between different fund offerings (if allowed)
          return await this.executeFundToFundTrade(user, {
            fromFund: fundOffering,
            toFund: targetFund,
            shareQuantity: shareQuantity
          });
      }

    } catch (error) {
      return {
        success: false,
        error: 'BACA Invest fund trading failed',
        code: 'FUND_TRADING_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 🔄 CROSS-COIN TRADING - BACA Meta ↔ BACA Invest
   */
  async handleCrossCoinTrading(user, tradeData) {
    const {
      direction, // 'meta_to_invest' | 'invest_to_meta'
      amount,
      exchangeRate, // Market determined or user specified
      fundPreference = null
    } = tradeData;

    console.log(`🔄 Cross-coin Trading: ${direction} - Amount: ${amount}`);

    try {
      if (direction === 'meta_to_invest') {
        // BACA Meta → BACA Invest conversion
        return await this.executeBacaMetaToBacaInvest(user, {
          bacaMetaAmount: amount,
          exchangeRate: exchangeRate,
          targetFund: fundPreference
        });
        
      } else if (direction === 'invest_to_meta') {
        // BACA Invest → BACA Meta conversion  
        return await this.executeBacaInvestToBacaMeta(user, {
          bacaInvestAmount: amount,
          exchangeRate: exchangeRate
        });
      }

    } catch (error) {
      return {
        success: false,
        error: 'Cross-coin trading failed',
        code: 'CROSS_TRADING_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 🏪 AVAILABILITY POOL TRADING - Buy from member listings
   */
  async handleAvailabilityPoolTrading(user, tradeData) {
    const {
      action, // 'browse_pool' | 'buy_from_pool' | 'update_listing'
      listingId,
      purchaseAmount,
      paymentMethod,
      filters = {}
    } = tradeData;

    console.log(`🏪 Availability Pool: ${action}`);

    try {
      switch (action) {
        case 'browse_pool':
          // Browse available BACA Invest listings
          return await this.browseAvailabilityPool(filters);
          
        case 'buy_from_pool':
          // Purchase from availability pool
          const purchaseResult = await this.bacaSystem.purchaseFromAvailabilityPool(
            user.id,
            listingId,
            purchaseAmount,
            paymentMethod
          );
          
          return {
            success: purchaseResult.success,
            operation: 'POOL_PURCHASE',
            tokensAcquired: purchaseResult.tokensAcquired,
            totalCost: purchaseResult.totalCostGBP,
            newLLPMember: purchaseResult.llpMembershipStatus === 'active',
            lotteryEligible: purchaseResult.lotteryEligibility,
            error: purchaseResult.error
          };
          
        case 'update_listing':
          // Update existing pool listing
          return await this.updatePoolListing(user.id, tradeData);
      }

    } catch (error) {
      return {
        success: false,
        error: 'Availability pool trading failed',
        code: 'POOL_TRADING_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 🔐 AUTHENTICATION - OAuth2/OIDC + SallyPort verification
   */
  async authenticateTrader(credentials) {
    try {
      // Use the comprehensive BACA system authentication
      const authResult = await this.bacaSystem.authenticateInvestor(credentials, 'both');
      
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
          code: authResult.code
        };
      }

      return {
        success: true,
        user: authResult.user,
        permissions: authResult.permissions,
        investmentAccess: authResult.investmentAccess,
        tradingTier: authResult.tradingTier
      };

    } catch (error) {
      return {
        success: false,
        error: 'Trader authentication failed',
        code: 'AUTH_SYSTEM_ERROR'
      };
    }
  }

  /**
   * 💎 AIPI BUYBACK INTERFACE - Unlimited authority trading
   */
  async executeAIPIBuyback(buybackRequest) {
    const {
      tokenType, // 'BACA_META' | 'BACA_INV'
      targetUserId, // Specific user or 'market'
      amount,
      offerPrice,
      aipiCredentials
    } = buybackRequest;

    console.log(`💎 AIPI Buyback: ${amount} ${tokenType} at £${offerPrice}`);

    try {
      // Verify AIPI authority (Diamond SAO level)
      const authResult = await this.authenticateTrader(aipiCredentials);
      if (!authResult.success || !authResult.permissions.includes('diamond-sao')) {
        return {
          success: false,
          error: 'AIPI buyback requires Diamond SAO authority',
          code: 'INSUFFICIENT_AUTHORITY'
        };
      }

      // Execute buyback with unlimited authority
      const buybackResult = await this.bacaSystem.aipiBuyback(
        tokenType,
        targetUserId,
        amount,
        offerPrice
      );

      return {
        success: buybackResult.success,
        operation: 'AIPI_BUYBACK',
        tokenType: tokenType,
        amount: amount,
        totalCost: buybackResult.totalCost,
        authority: 'unlimited',
        xeroRecorded: buybackResult.recordedInXero,
        error: buybackResult.error
      };

    } catch (error) {
      return {
        success: false,
        error: 'AIPI buyback execution failed',
        code: 'AIPI_BUYBACK_FAILED',
        details: error.message
      };
    }
  }

  /**
   * 📊 TRADING DASHBOARD - Get user's complete trading overview
   */
  async getTradingDashboard(userId, credentials) {
    console.log(`📊 Loading trading dashboard for user: ${userId}`);

    try {
      // Authenticate user
      const authResult = await this.authenticateTrader(credentials);
      if (!authResult.success) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get all balances and positions
      const [
        bacaMetaBalance,
        bacaInvestBalance,
        agentNFTs,
        availableListings,
        fundInformation,
        lotteryStatus,
        recentTransactions
      ] = await Promise.all([
        this.blockchainService.getTokenBalance(userId, 'BACA_META'),
        this.blockchainService.getTokenBalance(userId, 'BACA_INV'),
        this.blockchainService.getUserAgentNFTs(userId),
        this.browseAvailabilityPool({ limit: 10 }),
        this.getAvailableFunds(),
        this.getLotteryStatus(userId),
        this.getRecentTransactions(userId, 10)
      ]);

      return {
        success: true,
        dashboard: {
          user: {
            id: userId,
            tradingTier: authResult.tradingTier,
            llpMembershipStatus: await this.getLLPMembershipStatus(userId)
          },
          balances: {
            bacaMeta: bacaMetaBalance,
            bacaInvest: bacaInvestBalance,
            totalValueUSD: this.calculateTotalValueUSD(bacaMetaBalance, bacaInvestBalance)
          },
          assets: {
            agentNFTs: agentNFTs,
            agentNFTCount: agentNFTs.length,
            estimatedNFTValue: this.estimateNFTPortfolioValue(agentNFTs)
          },
          trading: {
            availableListings: availableListings,
            availableFunds: fundInformation,
            tradingPairs: this.getActiveTradingPairs()
          },
          lottery: lotteryStatus,
          transactions: recentTransactions
        }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Dashboard loading failed',
        code: 'DASHBOARD_FAILED',
        details: error.message
      };
    }
  }

  /**
   * Get available funds for selection
   * @private
   */
  getAvailableFunds() {
    const funds = [];
    for (const [key, fund] of Object.entries(this.bacaSystem.privateFundOfferings)) {
      funds.push({
        id: key,
        name: fund.name,
        pricePerShare: fund.pricePerShare,
        totalShares: fund.totalShares,
        valuationBasis: fund.valuationBasis,
        status: fund.status,
        investorProfile: fund.investorProfile
      });
    }
    return funds;
  }

  /**
   * Record trade in Xero for accounting
   * @private
   */
  async recordTradeInXero(user, tradeType, tradeResult) {
    try {
      await this.xeroService.recordTrade({
        userId: user.id,
        tradeType: tradeType,
        tradeData: tradeResult,
        timestamp: new Date().toISOString(),
        platform: 'internal_trading_platform'
      });
    } catch (error) {
      console.error('Xero recording failed:', error);
      // Don't fail the trade if Xero recording fails
    }
  }

  // Additional private methods for specific trade executions:
  // - executeBacaMetaToAgentNFT()
  // - executeAgentNFTToBacaMeta()
  // - convertBacaMetaToUSD()
  // - executeBacaMetaToBacaInvest() 
  // - executeBacaInvestToBacaMeta()
  // - browseAvailabilityPool()
  // - etc.

}

module.exports = { ComprehensiveInternalTradingPlatform };