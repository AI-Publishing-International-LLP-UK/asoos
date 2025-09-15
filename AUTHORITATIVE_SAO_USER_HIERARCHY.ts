/**
 * AUTHORITATIVE SAO HIERARCHY AND USER TYPE DEFINITIONS
 * 
 * ⚠️  CRITICAL: THIS IS THE SINGLE SOURCE OF TRUTH ⚠️
 * 
 * This file contains the definitive hierarchy for all Super Admin Owner (SAO) 
 * levels and user types across the entire AIPI LLP ecosystem.
 * 
 * ALL other files should import from this file. NO definitions should be 
 * duplicated elsewhere to prevent confusion or competing concepts.
 * 
 * Last Updated: 2025-01-15
 * Authority: Mr. Phillip Corey Roark (0000001) - Diamond SAO
 */

// ============================================================================
// SAO (SUPER ADMIN OWNER) HIERARCHY - DEFINITIVE STRUCTURE
// ============================================================================

export interface SAOHierarchy {
  diamondSAO: DiamondSAOConfig;
  emeraldSAO: EmeraldSAOConfig;  
  sapphireSAO: SapphireSAOConfig;
  opalSAO: OpalSAOConfig;
  onyxSAO: OnyxSAOConfig;
}

export interface DiamondSAOConfig {
  count: 1;
  owner: 'Mr. Phillip Corey Roark (0000001)';
  role: 'ULTIMATE_PRODUCTION_AUTHORITY';
  level: 'DIAMOND_SAO_SUPER_ADMIN_OWNER';
  authority: 'UNLIMITED_OPERATIONAL';
  scope: 'ALL_SYSTEMS_UNIVERSAL_CONTROL';
  heirs: 'DESIGNATED_WHEN_NECESSARY';
  systemAccess: 'UNRESTRICTED';
}

export interface EmeraldSAOConfig {
  count: 25;
  role: 'ADMIN_LEVEL_FOR_AI_PUBLISHING_INTERNATIONAL_LLP';
  level: 'EMERALD_SAO_ADMIN';
  authority: 'HIGH_LEVEL_ADMINISTRATIVE';
  scope: 'AI_PUBLISHING_INTERNATIONAL_LLP_OPERATIONS';
  systemAccess: 'ADMINISTRATIVE';
}

export interface SapphireSAOConfig {
  role: 'SUPER_ADMIN_OWNERS_OF_mcp.{companyname}.2100.cool';
  level: 'SAPPHIRE_SAO_CLIENT_SUPER_ADMIN';
  authority: 'CLIENT_SUPER_ADMIN_AUTHORITY';
  scope: 'THEIR_SPECIFIC_COMPANY_MCP_SERVER';
  systemAccess: 'COMPANY_SUPER_ADMIN';
  description: 'Super admin owners OF AI Publishing International LLP (the company owners)';
}

export interface OpalSAOConfig {
  role: 'SYSTEM_ADMINISTRATOR as assigned by their Sapphire SAO';
  level: 'OPAL_SYS_ADMIN';
  authority: 'SYSTEM_ADMINISTRATION';
  scope: 'COMPANY_TECHNICAL_OPERATIONS';
  assignedBy: 'SAPPHIRE_SAO';
  systemAccess: 'TECHNICAL_ADMIN';
  description: 'THEIR sys admin (Sapphire SAOs system administrators)';
}

export interface OnyxSAOConfig {
  role: 'NON_ADMIN_USERS in association with their mcp.{companyname}.2100.cool';
  level: 'ONYX_OS_NON_ADMIN';
  authority: 'STANDARD_USER_ACCESS';
  scope: 'COMPANY_EMPLOYEE_OPERATIONS';
  association: 'THEIR_COMPANY_MCP_SERVER';
  systemAccess: 'STANDARD_USER';
  description: 'THEIR employees, etc. (Sapphire SAOs employees and standard users)';
}

// ============================================================================
// DEFINITIVE SAO HIERARCHY INSTANCE
// ============================================================================

export const AUTHORITATIVE_SAO_HIERARCHY: SAOHierarchy = {
  diamondSAO: {
    count: 1,
    owner: 'Mr. Phillip Corey Roark (0000001)',
    role: 'ULTIMATE_PRODUCTION_AUTHORITY',
    level: 'DIAMOND_SAO_SUPER_ADMIN_OWNER',
    authority: 'UNLIMITED_OPERATIONAL',
    scope: 'ALL_SYSTEMS_UNIVERSAL_CONTROL',
    heirs: 'DESIGNATED_WHEN_NECESSARY',
    systemAccess: 'UNRESTRICTED'
  },
  
  emeraldSAO: {
    count: 25,
    role: 'ADMIN_LEVEL_FOR_AI_PUBLISHING_INTERNATIONAL_LLP',
    level: 'EMERALD_SAO_ADMIN',
    authority: 'HIGH_LEVEL_ADMINISTRATIVE',
    scope: 'AI_PUBLISHING_INTERNATIONAL_LLP_OPERATIONS',
    systemAccess: 'ADMINISTRATIVE'
  },
  
  sapphireSAO: {
    role: 'SUPER_ADMIN_OWNERS_OF_mcp.{companyname}.2100.cool',
    level: 'SAPPHIRE_SAO_CLIENT_SUPER_ADMIN',
    authority: 'CLIENT_SUPER_ADMIN_AUTHORITY',
    scope: 'THEIR_SPECIFIC_COMPANY_MCP_SERVER',
    systemAccess: 'COMPANY_SUPER_ADMIN',
    description: 'Super admin owners OF AI Publishing International LLP (the company owners)'
  },
  
  opalSAO: {
    role: 'SYSTEM_ADMINISTRATOR as assigned by their Sapphire SAO',
    level: 'OPAL_SYS_ADMIN',
    authority: 'SYSTEM_ADMINISTRATION',
    scope: 'COMPANY_TECHNICAL_OPERATIONS',
    assignedBy: 'SAPPHIRE_SAO',
    systemAccess: 'TECHNICAL_ADMIN',
    description: 'THEIR sys admin (Sapphire SAOs system administrators)'
  },
  
  onyxSAO: {
    role: 'NON_ADMIN_USERS in association with their mcp.{companyname}.2100.cool',
    level: 'ONYX_OS_NON_ADMIN',
    authority: 'STANDARD_USER_ACCESS',
    scope: 'COMPANY_EMPLOYEE_OPERATIONS',
    association: 'THEIR_COMPANY_MCP_SERVER',
    systemAccess: 'STANDARD_USER',
    description: 'THEIR employees, etc. (Sapphire SAOs employees and standard users)'
  }
};

// ============================================================================
// USER AUTHENTICATION LEVELS - DEFINITIVE STRUCTURE
// ============================================================================

export enum UserAuthLevel {
  NON_AUTHENTICATED = 0,
  DR_MATCH = 1,
  DR_GRANT = 2,
  PAYMENT_VERIFIED = 2.5,
  TRIAL_PERIOD = 2.75,
  FULLY_REGISTERED = 3
}

// ============================================================================
// AUTHENTICATION PROVIDER TYPES - DEFINITIVE STRUCTURE
// ============================================================================

export enum AuthProvider {
  NONE = 'none',
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  LINKEDIN = 'linkedin',
  EMAIL_PASSWORD = 'email_password',
  CLOUDFLARE = 'cloudflare',
  WHATSAPP = 'whatsapp',
  WHATSAPP_BUSINESS = 'whatsapp_business'
}

// ============================================================================
// USER INTERFACE - DEFINITIVE STRUCTURE
// ============================================================================

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: string;
  authLevel: UserAuthLevel;
  authProvider: AuthProvider;
  verifiedEmail: boolean;
  verifiedPaymentMethod: boolean;
  culturalEmpathyCode?: string;
  paymentMethodId?: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
  dreamCommanderInStasis?: boolean;
  saoLevel?: keyof SAOHierarchy; // Maps to SAO hierarchy
  companyMcp?: string; // Format: mcp-{companyname}-2100.cool
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER TYPE INTERFACE - DEFINITIVE STRUCTURE  
// ============================================================================

export interface UserType {
  id: string;
  level: UserAuthLevel;
  name: string;
  description: string;
  privileges: string[];
  allowedOperations: string[];
  saoMapping?: keyof SAOHierarchy; // Links to SAO hierarchy
}

// ============================================================================
// DEFINITIVE USER TYPES - MAPPED TO SAO HIERARCHY
// ============================================================================

export const AUTHORITATIVE_USER_TYPES: { [key: string]: UserType } = {
  // Non-authenticated users
  guest: {
    id: 'guest',
    level: UserAuthLevel.NON_AUTHENTICATED,
    name: 'Guest',
    description: 'Non-authenticated user with limited access',
    privileges: ['view_public_content'],
    allowedOperations: ['read_public']
  },
  
  // Basic authenticated users  
  authenticated: {
    id: 'authenticated',
    level: UserAuthLevel.DR_MATCH,
    name: 'Dr. Match Authenticated',
    description: 'Basic authenticated user',
    privileges: ['view_public_content', 'view_basic_features', 'comment'],
    allowedOperations: ['read_public', 'read_basic', 'write_comments']
  },
  
  // Verified users
  verified: {
    id: 'verified',
    level: UserAuthLevel.DR_GRANT,
    name: 'Dr. Grant Verified',
    description: 'Email verified user with free publication',
    privileges: [
      'view_public_content',
      'view_basic_features', 
      'comment',
      'publish_free'
    ],
    allowedOperations: [
      'read_public',
      'read_basic',
      'write_comments',
      'write_publications'
    ]
  },
  
  // Payment verified users
  paymentVerified: {
    id: 'paymentVerified',
    level: UserAuthLevel.PAYMENT_VERIFIED,
    name: 'Payment Method Verified',
    description: 'User with validated payment method',
    privileges: [
      'view_public_content',
      'view_basic_features',
      'comment',
      'publish_free',
      'access_premium_content'
    ],
    allowedOperations: [
      'read_public',
      'read_basic',
      'read_premium',
      'write_comments',
      'write_publications'
    ]
  },
  
  // Trial users
  trialPeriod: {
    id: 'trialPeriod',
    level: UserAuthLevel.TRIAL_PERIOD,
    name: 'Trial Period User',
    description: 'User in 3-day free trial with validated payment',
    privileges: [
      'view_public_content',
      'view_basic_features',
      'comment',
      'publish_free',
      'access_premium_content',
      'access_trial_features'
    ],
    allowedOperations: [
      'read_public',
      'read_basic',
      'read_premium',
      'write_comments',
      'write_publications',
      'create_dream_commander'
    ]
  },
  
  // Fully registered users
  fullyRegistered: {
    id: 'fullyRegistered',
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Fully Registered User',
    description: 'Permanent registered user with cultural-empathy code',
    privileges: [
      'view_public_content',
      'view_basic_features',
      'comment',
      'publish_free', 
      'access_premium_content',
      'access_all_features',
      'download_content'
    ],
    allowedOperations: [
      'read_public',
      'read_basic',
      'read_premium',
      'write_comments',
      'write_publications',
      'create_dream_commander',
      'download_lenz',
      'download_co_pilot_nft'
    ]
  },
  
  // ========================================================================
  // SAO-LEVEL USER TYPES
  // ========================================================================
  
  // Diamond SAO (Ultimate Authority)
  diamondSAO: {
    id: 'diamondSAO',
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Diamond SAO - Ultimate Production Authority',
    description: 'Mr. Phillip Corey Roark (0000001) - Unlimited operational authority over all systems',
    privileges: ['UNLIMITED_ACCESS_ALL_SYSTEMS'],
    allowedOperations: ['UNRESTRICTED_OPERATIONS'],
    saoMapping: 'diamondSAO'
  },
  
  // Emerald SAO (AIPI LLP Admin)
  emeraldSAO: {
    id: 'emeraldSAO',
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Emerald SAO - AIPI LLP Admin',
    description: 'Admin level for AI Publishing International LLP (~25 users)',
    privileges: ['AIPI_LLP_ADMIN_ACCESS'],
    allowedOperations: ['AIPI_LLP_ADMINISTRATION'],
    saoMapping: 'emeraldSAO'
  },
  
  // Sapphire SAO (Company Owners)  
  sapphireSAO: {
    id: 'sapphireSAO',
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Sapphire SAO - Company Super Admin Owner',
    description: 'Super admin owners of their specific mcp.{companyname}.2100.cool',
    privileges: ['COMPANY_SUPER_ADMIN_ACCESS'],
    allowedOperations: ['COMPANY_OWNERSHIP_CONTROL'],
    saoMapping: 'sapphireSAO'
  },
  
  // Opal (System Administrators)
  opalSAO: {
    id: 'opalSAO', 
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Opal - System Administrator',
    description: 'System administrators assigned by their Sapphire SAO',
    privileges: ['COMPANY_TECHNICAL_ADMIN'],
    allowedOperations: ['TECHNICAL_ADMINISTRATION'],
    saoMapping: 'opalSAO'
  },
  
  // Onyx (Standard Users/Employees)
  onyxSAO: {
    id: 'onyxSAO',
    level: UserAuthLevel.FULLY_REGISTERED,
    name: 'Onyx OS - Standard User',
    description: 'Non-admin users associated with their company MCP server (employees)',
    privileges: ['COMPANY_STANDARD_ACCESS'],
    allowedOperations: ['EMPLOYEE_OPERATIONS'],
    saoMapping: 'onyxSAO'
  }
};

// ============================================================================
// AUTH STATE INTERFACE - DEFINITIVE STRUCTURE
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  error: string | null;
  saoLevel?: keyof SAOHierarchy;
  companyMcp?: string;
}

// ============================================================================
// UTILITY FUNCTIONS - DEFINITIVE HELPERS
// ============================================================================

/**
 * Get SAO level from user
 */
export function getUserSAOLevel(user: User): keyof SAOHierarchy | null {
  return user.saoLevel || null;
}

/**
 * Check if user has SAO authority
 */
export function hasSAOAuthority(user: User): boolean {
  return !!user.saoLevel;
}

/**
 * Get user's company MCP server URL
 */
export function getUserCompanyMCP(user: User): string | null {
  return user.companyMcp || null;
}

/**
 * Check if user is Diamond SAO (ultimate authority)
 */
export function isDiamondSAO(user: User): boolean {
  return user.saoLevel === 'diamondSAO';
}

/**
 * Check if user is company owner (Sapphire SAO)
 */
export function isCompanyOwner(user: User): boolean {
  return user.saoLevel === 'sapphireSAO';
}

/**
 * Get SAO hierarchy for a specific level
 */
export function getSAOConfig(level: keyof SAOHierarchy): any {
  return AUTHORITATIVE_SAO_HIERARCHY[level];
}

// ============================================================================
// EXPORT STATEMENTS - FOR EXTERNAL USE
// ============================================================================

// Re-export everything for backwards compatibility
export {
  AUTHORITATIVE_SAO_HIERARCHY as SAO_HIERARCHY,
  AUTHORITATIVE_USER_TYPES as USER_TYPES
};

// ============================================================================
// DEPRECATION NOTICE
// ============================================================================

/**
 * ⚠️  DEPRECATION NOTICE FOR OTHER FILES ⚠️
 * 
 * The following files should be updated to import from this authoritative source:
 * 
 * - /integrations/auth/user-auth-types.ts
 * - /deploy-clean/functions/lib/user-types/as-user-auth-types.js  
 * - /functions/lib/user-types/01-user-type-enum.js
 * - /src/core/cloudflare-auth-service.ts
 * - /integrations/auth/as-auth-service.ts
 * - /mcp-factory/mcp-asoos-factory-template.ts
 * 
 * ALL of these should import from THIS file to maintain consistency.
 */

export default {
  SAO_HIERARCHY: AUTHORITATIVE_SAO_HIERARCHY,
  USER_TYPES: AUTHORITATIVE_USER_TYPES,
  UserAuthLevel,
  AuthProvider
};