/**
 * 🏛️ COMPREHENSIVE BACA INVESTMENT SYSTEM
 * 
 * CLASSIFICATION: AI Publishing International LLP - Private Investment Platform
 * Created for ASOOS Symphony - Dual Coin Economy with Fund Offerings
 * Date: October 5, 2025
 * 
 * COMPLETE SYSTEM:
 * - BACA Coin Meta: Agent/product/service trading (closed loop)
 * - BACA Invest: LLP membership tokens with private fund offerings
 * - Proportional lottery system based on original stakes
 * - OAuth2/OIDC + SallyPort authentication
 * - UK LLP compliant private offerings
 * - Xero integration for distributions
 * - AIPI buyback authority for all coins
 */

const { OAuth2Service } = require('./oauth2/OAuth2Service');
const { SallyPortVerifier } = require('./auth/SallyPortVerifier');
const { BlockchainService } = require('./blockchain/S2DO-blockchain');
const { XeroIntegrationService } = require('./accounting/XeroIntegrationService');

class ComprehensiveBacaInvestmentSystem {
  constructor() {
    this.oauth2Service = new OAuth2Service();
    this.sallyPortVerifier = new SallyPortVerifier();
    this.blockchainService = new BlockchainService();
    this.xeroService = new XeroIntegrationService();
    
    // BACA Coin Meta Configuration (Agent Trading)
    this.bacaMetaConfig = {
      name: 'BACA Coin Meta',
      symbol: 'BACA_META',
      purpose: 'Agent NFT and service trading',
      decimals: 8,
      peggedToUSD: true,
      exchangeRate: 1.00, // 1 BACA_META = 1 USD
      minimumTrade: 250.00, // Basic agent value
      maximumTrade: 10000000.00, // Premium swarm value
      externalTransfersBlocked: true,
      closedLoopEconomy: true
    };
    
    // BACA Invest Configuration (LLP Membership)
    this.bacaInvestConfig = {
      name: 'BACA Invest',
      symbol: 'BACA_INV',
      purpose: 'LLP membership stakes with private fund offerings',
      decimals: 8,
      llpEntity: 'AI Publishing International LLP',
      companiesHouseNumber: '[YOUR_LLP_NUMBER]', 
      privateOfferingsOnly: true,
      aipiHasUnlimitedBuyback: true
    };
    
    // Private Fund Offerings (Based on conversation)
    this.privateFundOfferings = {
      january2025: {
        name: 'January 2025 Premium Fund',
        totalShares: 1000000,
        valuationBasis: 10000000, // £10M
        pricePerShare: 10.00, // £10.00
        launchDate: '2025-01-01',
        status: 'active',
        investorProfile: 'Early premium investors',
        bacaInvestBacking: true
      },
      may2025: {
        name: 'May 2025 Growth Fund', 
        totalShares: 20000000,
        valuationBasis: 105000000, // £105M
        pricePerShare: 5.25, // £5.25
        launchDate: '2025-05-01',
        status: 'planned',
        investorProfile: 'Momentum investors',
        bacaInvestBacking: true
      },
      august2025: {
        name: 'August 2025 Institutional Fund',
        totalShares: 20000000,
        valuationBasis: 12000000000, // £12B
        pricePerShare: 600.00, // £600.00
        launchDate: '2025-08-01', 
        status: 'planned',
        investorProfile: 'Institutional/ultra-high net worth',
        bacaInvestBacking: true
      }
    };
    
    // Proportional Lottery System Configuration
    this.lotteryConfig = {
      enabled: true,
      basedOnOriginalStake: true,
      baselineValuationDate: '2025-01-01',
      distributionMechanism: 'xero_automated',
      availabilityPoolEnabled: true
    };
    
    console.log('🏛️ Comprehensive BACA Investment System initialized');
    console.log('🪙 BACA Meta: Agent trading (closed loop)');
    console.log('💼 BACA Invest: LLP membership with fund offerings');
    console.log('🎰 Proportional lottery system: Active');
    console.log('🇬🇧 UK LLP compliance: Private offerings only');
  }

  /**
   * Authenticate investor for any BACA system (Meta or Invest)
   * @param {Object} credentials - OAuth2/OIDC + SallyPort credentials
   * @param {string} investmentType - 'meta' | 'invest' | 'both'
   * @returns {Object} Authentication result with investment permissions
   */
  async authenticateInvestor(credentials, investmentType = 'both') {
    console.log(`🔐 Authenticating investor for ${investmentType} access...`);
    
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

      // Step 3: Check investment eligibility
      const eligibility = await this.checkInvestmentEligibility(
        oauth2Result.user.id, 
        investmentType,
        sallyPortResult.permissions
      );

      return {
        success: true,
        user: oauth2Result.user,
        permissions: sallyPortResult.permissions,
        investmentAccess: eligibility,
        tradingTier: this.getTradingTier(sallyPortResult.permissions)
      };

    } catch (error) {
      console.error('💥 Investor authentication error:', error);
      return {
        success: false,
        error: 'Authentication system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Handle BACA Meta purchases (agent trading economy)
   * @param {string} userId - Authenticated user ID
   * @param {number} usdAmount - Amount to convert to BACA Meta
   * @param {Object} paymentMethod - External payment method
   * @returns {Object} Purchase result
   */
  async purchaseBacaMeta(userId, usdAmount, paymentMethod) {
    console.log(`🪙 Processing BACA Meta purchase: $${usdAmount}`);
    
    try {
      // Validate amount within limits
      if (usdAmount < this.bacaMetaConfig.minimumTrade) {
        return {
          success: false,
          error: `Minimum BACA Meta purchase: $${this.bacaMetaConfig.minimumTrade}`,
          code: 'AMOUNT_TOO_LOW'
        };
      }

      // Process USD payment 
      const paymentResult = await this.processUSDPayment(usdAmount, paymentMethod);
      if (!paymentResult.success) {
        return {
          success: false,
          error: 'USD payment failed',
          code: 'PAYMENT_FAILED'
        };
      }

      // Mint BACA Meta (1:1 USD peg)
      const bacaMetaAmount = usdAmount * this.bacaMetaConfig.exchangeRate;
      const mintResult = await this.mintToken(userId, 'BACA_META', bacaMetaAmount, {
        purpose: 'agent_trading',
        transactionId: paymentResult.transactionId,
        usdAmount: usdAmount
      });

      return {
        success: true,
        tokenType: 'BACA_META',
        bacaMetaAmount: bacaMetaAmount,
        usdAmount: usdAmount,
        purpose: 'Agent NFT and service trading'
      };

    } catch (error) {
      console.error('💥 BACA Meta purchase error:', error);
      return {
        success: false,
        error: 'BACA Meta purchase failed',
        code: 'PURCHASE_FAILED'
      };
    }
  }

  /**
   * Handle BACA Invest purchases (LLP membership with fund backing)
   * @param {string} userId - Authenticated user ID  
   * @param {string} fundOffering - 'january2025' | 'may2025' | 'august2025'
   * @param {number} shareQuantity - Number of shares to purchase
   * @param {Object} paymentMethod - Payment method
   * @returns {Object} Investment result
   */
  async purchaseBacaInvest(userId, fundOffering, shareQuantity, paymentMethod) {
    console.log(`💼 Processing BACA Invest purchase: ${shareQuantity} shares in ${fundOffering}`);
    
    try {
      const fund = this.privateFundOfferings[fundOffering];
      if (!fund) {
        return {
          success: false,
          error: 'Invalid fund offering',
          code: 'INVALID_FUND'
        };
      }

      if (fund.status !== 'active') {
        return {
          success: false, 
          error: `Fund ${fund.name} is not currently active`,
          code: 'FUND_INACTIVE'
        };
      }

      // Calculate investment amount
      const totalCost = shareQuantity * fund.pricePerShare;
      
      // Process payment
      const paymentResult = await this.processGBPPayment(totalCost, paymentMethod);
      if (!paymentResult.success) {
        return {
          success: false,
          error: 'GBP payment failed',
          code: 'PAYMENT_FAILED'
        };
      }

      // Mint BACA Invest tokens backed by fund shares
      const bacaInvestAmount = shareQuantity; // 1 token = 1 share
      const mintResult = await this.mintToken(userId, 'BACA_INV', bacaInvestAmount, {
        fundOffering: fundOffering,
        fundName: fund.name,
        sharesBacked: shareQuantity,
        pricePerShare: fund.pricePerShare,
        valuationBasis: fund.valuationBasis,
        originalStakeDate: new Date().toISOString(),
        transactionId: paymentResult.transactionId
      });

      // Add to proportional lottery system
      await this.addToProportionalLottery(userId, {
        fundOffering: fundOffering,
        originalStake: shareQuantity,
        costBasis: totalCost,
        entryDate: new Date().toISOString()
      });

      // Update LLP membership (Companies House integration)
      await this.updateLLPMembership(userId, {
        partnershipInterests: shareQuantity,
        fundBasis: fundOffering,
        entryDate: new Date().toISOString()
      });

      // Xero integration for tracking
      await this.xeroService.recordInvestment({
        userId: userId,
        amount: totalCost,
        currency: 'GBP',
        fundOffering: fundOffering,
        shares: shareQuantity
      });

      return {
        success: true,
        tokenType: 'BACA_INV',
        bacaInvestAmount: bacaInvestAmount,
        fundOffering: fund.name,
        sharesOwned: shareQuantity,
        totalCostGBP: totalCost,
        pricePerShare: fund.pricePerShare,
        llpMembershipStatus: 'active',
        lotteryEligibility: true
      };

    } catch (error) {
      console.error('💥 BACA Invest purchase error:', error);
      return {
        success: false,
        error: 'BACA Invest purchase failed',
        code: 'INVESTMENT_FAILED'
      };
    }
  }

  /**
   * Execute proportional lottery draw
   * @param {string} lotteryType - Type of lottery ('monthly' | 'quarterly' | 'special')
   * @param {number} prizePool - Total prize amount
   * @returns {Object} Lottery results
   */
  async executeProportionalLottery(lotteryType, prizePool) {
    console.log(`🎰 Executing ${lotteryType} proportional lottery: £${prizePool} prize pool`);
    
    try {
      // Get all BACA Invest holders with their original stakes
      const allHolders = await this.blockchainService.getBacaInvestHolders();
      
      // Calculate total proportional weight
      let totalWeight = 0;
      const weightedHolders = [];
      
      for (const holder of allHolders) {
        const weight = await this.calculateProportionalWeight(holder);
        totalWeight += weight;
        weightedHolders.push({
          ...holder,
          weight: weight,
          percentage: 0 // Will calculate after total known
        });
      }
      
      // Calculate percentages and select winners
      const winners = [];
      let remainingPool = prizePool;
      
      for (const holder of weightedHolders) {
        holder.percentage = (holder.weight / totalWeight) * 100;
        const winnings = (holder.weight / totalWeight) * prizePool;
        
        if (winnings > 1) { // Minimum £1 to win
          winners.push({
            userId: holder.userId,
            originalStake: holder.originalStake,
            percentage: holder.percentage,
            winnings: Math.floor(winnings * 100) / 100 // Round to pence
          });
        }
      }
      
      // Distribute winnings via Xero
      for (const winner of winners) {
        await this.xeroService.recordLotteryDistribution({
          userId: winner.userId,
          amount: winner.winnings,
          lotteryType: lotteryType,
          date: new Date().toISOString()
        });
      }
      
      console.log(`✅ Lottery complete: ${winners.length} winners, £${prizePool} distributed`);
      return {
        success: true,
        lotteryType: lotteryType,
        totalPrizePool: prizePool,
        totalWinners: winners.length,
        winners: winners,
        distributionMethod: 'xero_automated'
      };

    } catch (error) {
      console.error('💥 Lottery execution error:', error);
      return {
        success: false,
        error: 'Lottery execution failed',
        code: 'LOTTERY_FAILED'
      };
    }
  }

  /**
   * Allow members to place BACA Invest in availability pool for outsider purchase
   * @param {string} userId - Member placing coins in pool
   * @param {number} bacaInvestAmount - Amount to make available  
   * @param {number} askingPrice - Price per token in GBP
   * @returns {Object} Listing result
   */
  async addToAvailabilityPool(userId, bacaInvestAmount, askingPrice) {
    console.log(`🏪 Adding to availability pool: ${bacaInvestAmount} BACA Invest at £${askingPrice} each`);
    
    try {
      // Verify user owns the tokens
      const balance = await this.blockchainService.getTokenBalance(userId, 'BACA_INV');
      if (balance < bacaInvestAmount) {
        return {
          success: false,
          error: 'Insufficient BACA Invest balance',
          code: 'INSUFFICIENT_BALANCE'
        };
      }

      // Escrow the tokens
      const escrowResult = await this.blockchainService.escrowTokens(userId, 'BACA_INV', bacaInvestAmount);
      if (!escrowResult.success) {
        return {
          success: false,
          error: 'Token escrow failed',
          code: 'ESCROW_FAILED'
        };
      }

      // Add to availability pool
      const listingId = `pool_${Date.now()}_${userId}`;
      const poolListing = {
        listingId: listingId,
        sellerId: userId,
        tokenType: 'BACA_INV',
        amount: bacaInvestAmount,
        askingPriceGBP: askingPrice,
        totalValueGBP: bacaInvestAmount * askingPrice,
        listedAt: new Date().toISOString(),
        status: 'active',
        discoveryMethod: 'organic_only', // No advertising
        escrowId: escrowResult.escrowId
      };

      await this.blockchainService.addToAvailabilityPool(poolListing);
      
      return {
        success: true,
        listingId: listingId,
        bacaInvestAmount: bacaInvestAmount,
        askingPriceGBP: askingPrice,
        totalValueGBP: poolListing.totalValueGBP,
        discoveryNote: 'Available to authenticated users through organic discovery only'
      };

    } catch (error) {
      console.error('💥 Availability pool listing error:', error);
      return {
        success: false,
        error: 'Pool listing failed',
        code: 'LISTING_FAILED'
      };
    }
  }

  /**
   * Allow outsiders to purchase BACA Invest from availability pool
   * @param {string} buyerId - Authenticated buyer ID
   * @param {string} listingId - Pool listing to purchase
   * @param {number} purchaseAmount - Amount of tokens to buy
   * @param {Object} paymentMethod - Payment method
   * @returns {Object} Purchase result
   */
  async purchaseFromAvailabilityPool(buyerId, listingId, purchaseAmount, paymentMethod) {
    console.log(`🛒 Purchase from pool: ${purchaseAmount} tokens from listing ${listingId}`);
    
    try {
      // Get listing details
      const listing = await this.blockchainService.getAvailabilityPoolListing(listingId);
      if (!listing || listing.status !== 'active') {
        return {
          success: false,
          error: 'Listing not available',
          code: 'LISTING_UNAVAILABLE'
        };
      }

      if (purchaseAmount > listing.amount) {
        return {
          success: false,
          error: 'Purchase amount exceeds available tokens',
          code: 'AMOUNT_EXCEEDS_AVAILABLE'
        };
      }

      // Calculate total cost
      const totalCost = purchaseAmount * listing.askingPriceGBP;
      
      // Process payment
      const paymentResult = await this.processGBPPayment(totalCost, paymentMethod);
      if (!paymentResult.success) {
        return {
          success: false,
          error: 'Payment failed',
          code: 'PAYMENT_FAILED'
        };
      }

      // Execute atomic swap (GBP to seller, tokens to buyer)
      const swapResult = await this.executeAtomicSwap({
        buyer: buyerId,
        seller: listing.sellerId,
        tokenAmount: purchaseAmount,
        gbpAmount: totalCost,
        escrowId: listing.escrowId
      });

      if (!swapResult.success) {
        // Refund payment if swap fails
        await this.refundGBPPayment(paymentResult.transactionId);
        return {
          success: false,
          error: 'Token transfer failed',
          code: 'SWAP_FAILED'
        };
      }

      // Update LLP membership for new buyer
      await this.updateLLPMembership(buyerId, {
        partnershipInterests: purchaseAmount,
        acquisitionMethod: 'secondary_market',
        originalSeller: listing.sellerId,
        entryDate: new Date().toISOString()
      });

      // Add buyer to proportional lottery system
      await this.addToProportionalLottery(buyerId, {
        secondaryPurchase: true,
        originalStake: purchaseAmount,
        costBasis: totalCost,
        entryDate: new Date().toISOString()
      });

      // Process seller payout via Xero
      await this.xeroService.recordSecondaryMarketSale({
        sellerId: listing.sellerId,
        amount: totalCost,
        tokensTransferred: purchaseAmount,
        buyerId: buyerId
      });

      return {
        success: true,
        tokenType: 'BACA_INV',
        tokensAcquired: purchaseAmount,
        totalCostGBP: totalCost,
        pricePerToken: listing.askingPriceGBP,
        llpMembershipStatus: 'active',
        lotteryEligibility: true,
        sellerPaidOut: true
      };

    } catch (error) {
      console.error('💥 Pool purchase error:', error);
      return {
        success: false,
        error: 'Pool purchase failed',
        code: 'PURCHASE_FAILED'
      };
    }
  }

  /**
   * AIPI buyback - unlimited authority to purchase any BACA coins
   * @param {string} tokenType - 'BACA_META' | 'BACA_INV' 
   * @param {string} targetUserId - User to buy from (or 'market' for general)
   * @param {number} amount - Amount to buyback
   * @param {number} offerPrice - Price offered per token
   * @returns {Object} Buyback result
   */
  async aipiBuyback(tokenType, targetUserId, amount, offerPrice) {
    console.log(`🏛️ AIPI Buyback: ${amount} ${tokenType} at £${offerPrice} per token`);
    
    try {
      // AIPI has unlimited buyback authority
      const totalCost = amount * offerPrice;
      
      let buybackResult;
      if (targetUserId === 'market') {
        // General market buyback offer
        buybackResult = await this.executeMarketBuyback(tokenType, amount, offerPrice);
      } else {
        // Direct buyback from specific user
        buybackResult = await this.executeDirectBuyback(targetUserId, tokenType, amount, offerPrice);
      }

      if (!buybackResult.success) {
        return buybackResult;
      }

      // Record in Xero as AIPI treasury operation
      await this.xeroService.recordAIPIBuyback({
        tokenType: tokenType,
        amount: amount,
        pricePerToken: offerPrice,
        totalCost: totalCost,
        targetUserId: targetUserId,
        executionMethod: targetUserId === 'market' ? 'market_offer' : 'direct_purchase'
      });

      return {
        success: true,
        operation: 'AIPI_BUYBACK',
        tokenType: tokenType,
        amount: amount,
        pricePerToken: offerPrice,
        totalCost: totalCost,
        authority: 'unlimited',
        recordedInXero: true
      };

    } catch (error) {
      console.error('💥 AIPI buyback error:', error);
      return {
        success: false,
        error: 'AIPI buyback failed',
        code: 'BUYBACK_FAILED'
      };
    }
  }

  /**
   * Get current fund offering information
   * @param {string} fundOffering - Fund to query
   * @returns {Object} Fund information
   */
  getFundInformation(fundOffering) {
    const fund = this.privateFundOfferings[fundOffering];
    if (!fund) {
      return { success: false, error: 'Fund not found' };
    }

    return {
      success: true,
      fund: {
        ...fund,
        remainingShares: fund.totalShares - (fund.sharesSold || 0),
        percentageSold: ((fund.sharesSold || 0) / fund.totalShares) * 100,
        currentValuation: fund.valuationBasis,
        roiFromPrevious: this.calculateROIFromPrevious(fundOffering)
      }
    };
  }

  /**
   * Calculate proportional weight for lottery system
   * @private
   */
  async calculateProportionalWeight(holder) {
    // Weight based on original stake amount and time held
    const baseWeight = holder.originalStake || holder.amount;
    const timeHeldMonths = this.calculateMonthsHeld(holder.entryDate);
    const timeMultiplier = 1 + (timeHeldMonths * 0.1); // 10% bonus per month held
    
    return baseWeight * timeMultiplier;
  }

  /**
   * Calculate ROI from previous fund offering
   * @private
   */
  calculateROIFromPrevious(currentFund) {
    const funds = Object.keys(this.privateFundOfferings);
    const currentIndex = funds.indexOf(currentFund);
    
    if (currentIndex <= 0) return null;
    
    const previousFund = this.privateFundOfferings[funds[currentIndex - 1]];
    const currentFundData = this.privateFundOfferings[currentFund];
    
    return ((currentFundData.valuationBasis - previousFund.valuationBasis) / previousFund.valuationBasis) * 100;
  }

  /**
   * Get trading tier based on SAO permissions
   * @private
   */
  getTradingTier(permissions) {
    if (permissions.includes('diamond-sao') || permissions.includes('*')) {
      return {
        tier: 'DIAMOND_SAO',
        maxTradeValue: 10000000, // £10M
        allFundsAccess: true,
        premiumFeatures: true,
        tradingFeeDiscount: 100 // No fees
      };
    }
    
    if (permissions.includes('emerald-sao')) {
      return {
        tier: 'EMERALD_SAO', 
        maxTradeValue: 5000000, // £5M
        allFundsAccess: true,
        premiumFeatures: true,
        tradingFeeDiscount: 90
      };
    }
    
    if (permissions.includes('sapphire-sao')) {
      return {
        tier: 'SAPPHIRE_SAO',
        maxTradeValue: 1000000, // £1M
        allFundsAccess: true,
        premiumFeatures: false,
        tradingFeeDiscount: 50
      };
    }
    
    return {
      tier: 'STANDARD',
      maxTradeValue: 100000, // £100K
      allFundsAccess: false,
      premiumFeatures: false,
      tradingFeeDiscount: 0
    };
  }

  // Additional private methods would include:
  // - processGBPPayment()
  // - mintToken()
  // - executeAtomicSwap()
  // - updateLLPMembership()
  // - addToProportionalLottery()
  // - calculateMonthsHeld()
  // - etc.

}

module.exports = { ComprehensiveBacaInvestmentSystem };