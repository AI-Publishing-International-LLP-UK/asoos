/**
 * AI Publishing International - Publishing Operations Controller
 * 
 * Orchestrates digital asset publishing operations with strict policies:
 * - NO ASSET MAY LEAVE - All assets permanently archived
 * - Dual numbering system (A1, B2, C3) for client reference
 * - Permanent archival rights included in publishing fee
 * - LLM enrichment for inspiration only (never direct IP use)
 * - Integration with pubsocial.live marketplace
 * 
 * @author AI Publishing International LLP
 * @compliance Dr. Burby KC Approved
 * @version 2.0.0 - Production Ready
 */

import { Request, Response, NextFunction } from 'express';
import { AIPublishingDigitalAssetSystem, DigitalAsset } from './AIPublishingDigitalAssetSystem';
import { Logger } from 'winston';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

export interface PublishingRequest {
  clientId: string;
  assetData: {
    title: string;
    description: string;
    assetType: 'creative' | 'publishing' | 'nft' | 'literary' | 'visual' | 'audio' | 'multimedia';
    fileFormat: string;
    originalCreator?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  };
  publishingTier: 'basic' | 'professional' | 'premium' | 'enterprise';
  nftRequested?: boolean;
  marketplaceListing?: boolean;
}

export interface PublishingResponse {
  success: boolean;
  asset?: DigitalAsset;
  clientIdentifier?: string; // A1, B2, C3 format
  aiPublishingArchiveId?: string;
  publishingContract?: string;
  marketplaceUrl?: string;
  nftDetails?: {
    contractAddress: string;
    tokenId: string;
    mintingHash: string;
  };
  error?: string;
  billingDetails?: {
    publishingFee: number;
    feeBreakdown: Record<string, number>;
    clientRoyaltyRate: number;
    marketplaceCommission: number;
  };
}

export interface ArchiveSearchRequest {
  query: {
    clientId?: string;
    assetType?: string;
    title?: string;
    tags?: string[];
    dateRange?: {
      start: string; // ISO date
      end: string;   // ISO date
    };
  };
  pagination: {
    page: number;
    limit: number;
  };
  sortBy?: 'createdAt' | 'title' | 'assetType' | 'publishingFee';
  sortOrder?: 'asc' | 'desc';
}

export class PublishingOperationsController {
  private assetSystem: AIPublishingDigitalAssetSystem;
  private logger: Logger;
  private upload: multer.Multer;

  // Publishing tier pricing (in USD)
  private readonly PUBLISHING_FEES = {
    basic: 99,      // Individual creators
    professional: 299,  // Small businesses
    premium: 599,   // Enterprises
    enterprise: 1299 // Large corporations with custom terms
  };

  constructor() {
    this.assetSystem = new AIPublishingDigitalAssetSystem();
    this.logger = this.initializeLogger();
    this.upload = this.configureFileUpload();
    
    this.logger.info('Publishing Operations Controller initialized');
  }

  /**
   * Publish digital asset with permanent archival
   * POST /api/v1/publishing/publish
   */
  publishAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      this.logger.info('Publishing request received', { 
        requestId,
        clientId: req.body.clientId,
        assetType: req.body.assetData?.assetType 
      });

      // Validate request
      const publishingRequest = this.validatePublishingRequest(req.body);
      const fileBuffer = req.file?.buffer;
      
      if (!fileBuffer) {
        throw new Error('No file provided for publishing');
      }

      // Calculate publishing fee based on tier
      const publishingFee = this.PUBLISHING_FEES[publishingRequest.publishingTier];
      
      // Publish asset with permanent archival
      const asset = await this.assetSystem.publishAsset(
        publishingRequest.assetData,
        fileBuffer,
        publishingRequest.clientId,
        publishingFee
      );

      // Mint NFT if requested
      let nftDetails;
      if (publishingRequest.nftRequested) {
        const updatedAsset = await this.assetSystem.mintNFTFromAsset(
          asset.aiPublishingArchiveId,
          {
            blockchainNetwork: 'ethereum',
            royaltyPercentage: 10
          }
        );
        nftDetails = updatedAsset.nftDetails;
      }

      const response: PublishingResponse = {
        success: true,
        asset,
        clientIdentifier: asset.clientIdentifier,
        aiPublishingArchiveId: asset.aiPublishingArchiveId,
        publishingContract: `AIP_CONTRACT_${Date.now()}`,
        marketplaceUrl: asset.pubsocialLiveListingId 
          ? `https://pubsocial.live/asset/${asset.pubsocialLiveListingId}` 
          : undefined,
        nftDetails,
        billingDetails: {
          publishingFee,
          feeBreakdown: {
            'Permanent Archive Storage': publishingFee * 0.3,
            'LLM Database Enrichment': publishingFee * 0.2,
            'Marketplace Listing': publishingFee * 0.2,
            'Legal & Compliance': publishingFee * 0.15,
            'NFT Minting (if requested)': publishingRequest.nftRequested ? publishingFee * 0.15 : 0
          },
          clientRoyaltyRate: 85, // 85% to client on sales
          marketplaceCommission: 15 // 15% to AI Publishing
        }
      };

      this.logger.info('Asset published successfully', {
        requestId,
        clientIdentifier: asset.clientIdentifier,
        archiveId: asset.aiPublishingArchiveId,
        publishingFee
      });

      res.status(201).json(response);

    } catch (error) {
      this.logger.error('Publishing failed', { 
        requestId, 
        error: error.message,
        stack: error.stack 
      });

      const response: PublishingResponse = {
        success: false,
        error: error.message
      };

      res.status(400).json(response);
    }
  };

  /**
   * Search archived assets
   * POST /api/v1/publishing/search
   */
  searchArchive = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchRequest: ArchiveSearchRequest = req.body;
      
      // Convert date strings to Date objects
      const query = {
        ...searchRequest.query,
        dateRange: searchRequest.query.dateRange ? {
          start: new Date(searchRequest.query.dateRange.start),
          end: new Date(searchRequest.query.dateRange.end)
        } : undefined
      };

      const assets = await this.assetSystem.searchAssets(query);
      
      // Apply pagination
      const startIndex = (searchRequest.pagination.page - 1) * searchRequest.pagination.limit;
      const endIndex = startIndex + searchRequest.pagination.limit;
      const paginatedAssets = assets.slice(startIndex, endIndex);

      // Apply sorting
      if (searchRequest.sortBy) {
        paginatedAssets.sort((a, b) => {
          const aValue = a[searchRequest.sortBy!];
          const bValue = b[searchRequest.sortBy!];
          
          if (searchRequest.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      res.json({
        success: true,
        assets: paginatedAssets,
        pagination: {
          page: searchRequest.pagination.page,
          limit: searchRequest.pagination.limit,
          total: assets.length,
          totalPages: Math.ceil(assets.length / searchRequest.pagination.limit)
        }
      });

    } catch (error) {
      this.logger.error('Archive search failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get specific asset from archive
   * GET /api/v1/publishing/asset/:assetId
   */
  getAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const asset = await this.assetSystem.getAsset(assetId);

      if (!asset) {
        res.status(404).json({
          success: false,
          error: 'Asset not found in permanent archive'
        });
        return;
      }

      res.json({
        success: true,
        asset
      });

    } catch (error) {
      this.logger.error('Asset retrieval failed', { 
        error: error.message,
        assetId: req.params.assetId 
      });
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Attempt to sell asset for client
   * POST /api/v1/publishing/sell/:assetId
   */
  sellAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const { buyerInfo, salePrice } = req.body;

      const saleResult = await this.assetSystem.sellAssetForClient(
        assetId,
        buyerInfo,
        salePrice
      );

      res.json({
        success: true,
        saleResult,
        note: 'Asset remains in AI Publishing permanent archive - only usage rights transferred'
      });

    } catch (error) {
      this.logger.error('Asset sale failed', { 
        error: error.message,
        assetId: req.params.assetId 
      });
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Generate archive and operations report
   * GET /api/v1/publishing/reports/archive
   */
  generateArchiveReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = await this.assetSystem.generateArchiveReport();
      
      res.json({
        success: true,
        report: {
          ...report,
          archivePolicy: {
            permanentRetention: true,
            noAssetDeletion: true,
            llmEnrichmentRights: true,
            inspirationOnlyUse: true
          },
          generatedAt: new Date(),
          reportId: `AIP_REPORT_${Date.now()}`
        }
      });

    } catch (error) {
      this.logger.error('Archive report generation failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get publishing pricing tiers
   * GET /api/v1/publishing/pricing
   */
  getPricingTiers = (req: Request, res: Response): void => {
    res.json({
      success: true,
      pricingTiers: {
        basic: {
          price: this.PUBLISHING_FEES.basic,
          features: [
            'Permanent archival storage',
            'Basic marketplace listing',
            'LLM database enrichment',
            'Standard client support',
            '85% royalty on sales'
          ],
          targetMarket: 'Individual creators and artists'
        },
        professional: {
          price: this.PUBLISHING_FEES.professional,
          features: [
            'All Basic features',
            'Priority marketplace placement',
            'Advanced analytics dashboard',
            'Priority client support',
            'Custom metadata fields',
            'Bulk upload capabilities'
          ],
          targetMarket: 'Small businesses and agencies'
        },
        premium: {
          price: this.PUBLISHING_FEES.premium,
          features: [
            'All Professional features',
            'Dedicated account manager',
            'Custom NFT smart contracts',
            'Advanced compliance reporting',
            'API access for integration',
            'White-label marketplace options'
          ],
          targetMarket: 'Mid-size enterprises'
        },
        enterprise: {
          price: this.PUBLISHING_FEES.enterprise,
          features: [
            'All Premium features',
            'Custom contract terms',
            'Dedicated infrastructure',
            'Legal consultation included',
            'Custom compliance frameworks',
            'Direct blockchain deployment',
            'Unlimited storage and bandwidth'
          ],
          targetMarket: 'Large corporations and institutions'
        }
      },
      policies: {
        permanentArchival: 'All assets permanently archived - NO ASSET MAY LEAVE',
        dualNumbering: 'Client identifiers: A1, B2, C3... + internal archive IDs',
        llmEnrichment: 'All assets used for LLM inspiration only, never direct IP use',
        marketplaceCommission: '15% commission, 85% royalties to clients',
        legalCompliance: 'Dr. Burby KC approval required for all publications'
      }
    });
  };

  /**
   * Create NFT from existing archived asset
   * POST /api/v1/publishing/mint-nft/:assetId
   */
  mintNFTFromAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const { blockchainNetwork, royaltyPercentage, additionalMetadata } = req.body;

      const updatedAsset = await this.assetSystem.mintNFTFromAsset(assetId, {
        blockchainNetwork: blockchainNetwork || 'ethereum',
        royaltyPercentage: royaltyPercentage || 10,
        additionalMetadata
      });

      res.json({
        success: true,
        asset: updatedAsset,
        nftDetails: updatedAsset.nftDetails,
        note: 'NFT minted from permanently archived asset'
      });

    } catch (error) {
      this.logger.error('NFT minting failed', { 
        error: error.message,
        assetId: req.params.assetId 
      });
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Private utility methods

  private validatePublishingRequest(body: any): PublishingRequest {
    const { clientId, assetData, publishingTier, nftRequested, marketplaceListing } = body;

    if (!clientId) {
      throw new Error('Client ID is required');
    }

    if (!assetData?.title || !assetData?.description) {
      throw new Error('Asset title and description are required');
    }

    if (!['basic', 'professional', 'premium', 'enterprise'].includes(publishingTier)) {
      throw new Error('Invalid publishing tier');
    }

    const validAssetTypes = ['creative', 'publishing', 'nft', 'literary', 'visual', 'audio', 'multimedia'];
    if (!validAssetTypes.includes(assetData.assetType)) {
      throw new Error('Invalid asset type');
    }

    return {
      clientId,
      assetData: {
        title: assetData.title,
        description: assetData.description,
        assetType: assetData.assetType,
        fileFormat: assetData.fileFormat,
        originalCreator: assetData.originalCreator,
        tags: assetData.tags,
        metadata: assetData.metadata
      },
      publishingTier,
      nftRequested: nftRequested || false,
      marketplaceListing: marketplaceListing !== false // Default to true
    };
  }

  private configureFileUpload(): multer.Multer {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1
      },
      fileFilter: (req, file, cb) => {
        // Allow all file types for digital asset publishing
        cb(null, true);
      }
    });
  }

  private initializeLogger(): Logger {
    const winston = require('winston');
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'publishing-operations-controller' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'publishing-operations.log' })
      ]
    });
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return this.upload.single('assetFile');
  }
}

/**
 * Express Router Configuration
 */
export function createPublishingRoutes() {
  const express = require('express');
  const router = express.Router();
  const controller = new PublishingOperationsController();

  // Publishing endpoints
  router.post('/publish', controller.getUploadMiddleware(), controller.publishAsset);
  router.post('/search', controller.searchArchive);
  router.get('/asset/:assetId', controller.getAsset);
  router.post('/sell/:assetId', controller.sellAsset);
  router.post('/mint-nft/:assetId', controller.mintNFTFromAsset);
  
  // Information endpoints
  router.get('/pricing', controller.getPricingTiers);
  router.get('/reports/archive', controller.generateArchiveReport);

  return router;
}