export class ScraperError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly scraperName: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ScraperError';
    Object.setPrototypeOf(this, ScraperError.prototype);
  }
}

export class RateLimitExceededError extends ScraperError {
  constructor(
    scraperName: string,
    public readonly retryAfter: number,
    public readonly currentUsage: number,
    public readonly limit: number
  ) {
    super(
      `Rate limit exceeded for ${scraperName}. Current usage: ${currentUsage}/${limit}. Retry after ${retryAfter}ms`,
      'RATE_LIMIT_EXCEEDED',
      scraperName,
      { retryAfter, currentUsage, limit }
    );
    this.name = 'RateLimitExceededError';
    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }
}

export class ValidationError extends ScraperError {
  constructor(
    scraperName: string,
    public readonly field: string,
    public readonly value: any,
    public readonly constraint: string
  ) {
    super(
      `Validation failed for ${scraperName}: ${field} ${constraint}. Got: ${value}`,
      'VALIDATION_ERROR',
      scraperName,
      { field, value, constraint }
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConfigurationError extends ScraperError {
  constructor(
    scraperName: string,
    public readonly configField: string,
    message: string
  ) {
    super(
      `Configuration error for ${scraperName}: ${message}`,
      'CONFIGURATION_ERROR',
      scraperName,
      { configField }
    );
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class NetworkError extends ScraperError {
  constructor(
    scraperName: string,
    public readonly url: string,
    public readonly statusCode?: number,
    public readonly networkMessage?: string
  ) {
    super(
      `Network error for ${scraperName} at ${url}: ${networkMessage || 'Unknown network error'}`,
      'NETWORK_ERROR',
      scraperName,
      { url, statusCode, networkMessage }
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ParseError extends ScraperError {
  constructor(
    scraperName: string,
    public readonly selector: string,
    public readonly htmlSnippet: string
  ) {
    super(
      `Parse error for ${scraperName}: Could not parse data using selector "${selector}"`,
      'PARSE_ERROR',
      scraperName,
      { selector, htmlSnippet: htmlSnippet.substring(0, 200) }
    );
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export interface DataQuality {
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ExtractedContact {
  emails: string[];
  phones: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface BusinessIndustry {
  primary: string;
  secondary?: string;
  tags: string[];
  confidence: number;
}

export interface GeographicData {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CompanySize {
  category: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  employeeRange: string;
  estimatedEmployees?: number;
  confidence: number;
}

export interface WebPresence {
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  digitalMaturity: 'low' | 'medium' | 'high';
  onlineReviews?: {
    platform: string;
    rating: number;
    reviewCount: number;
  }[];
}

export interface ScrapingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  rateLimitHits: number;
  dataQualityAverage: number;
  lastScrapeTime: Date;
  totalLeadsFound: number;
}

export interface SearchQuery {
  term: string;
  location?: string;
  radius?: number;
  category?: string;
  minRating?: number;
  priceRange?: 'low' | 'medium' | 'high';
  openNow?: boolean;
}

export interface ScrapingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentScraper?: string;
  totalScrapers: number;
  completedScrapers: number;
  results: {
    totalLeads: number;
    qualityLeads: number;
    duplicates: number;
    errors: string[];
  };
}

export interface ScraperHealthCheck {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime?: number;
  errorRate: number;
  issues: string[];
  recommendations: string[];
}

export type ScrapingStrategy = 'sequential' | 'parallel' | 'priority-based' | 'round-robin';

export type DataVerificationLevel = 'basic' | 'standard' | 'comprehensive';

export interface BulkScrapingConfig {
  queries: SearchQuery[];
  strategy: ScrapingStrategy;
  maxConcurrency: number;
  verificationLevel: DataVerificationLevel;
  deduplication: boolean;
  outputFormat: 'json' | 'csv' | 'database';
  notifications: {
    onProgress?: boolean;
    onCompletion?: boolean;
    onError?: boolean;
    webhookUrl?: string;
  };
}

export const SCRAPER_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 5,
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RATE_LIMIT: 60, // requests per minute
  MIN_DATA_QUALITY_SCORE: 60,
  MAX_RESULTS_PER_SCRAPER: 1000,
  DEFAULT_CONCURRENCY: 3,
  CACHE_TTL: 3600000, // 1 hour in milliseconds
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ]
} as const;

export const INDUSTRY_MAPPINGS = {
  'technology': ['tech', 'software', 'it', 'digital', 'saas', 'app', 'web', 'development'],
  'healthcare': ['medical', 'health', 'clinic', 'hospital', 'dental', 'pharmacy', 'therapy'],
  'retail': ['shop', 'store', 'boutique', 'market', 'sales', 'commerce', 'fashion'],
  'food': ['restaurant', 'cafe', 'food', 'dining', 'catering', 'bakery', 'bar', 'pub'],
  'finance': ['bank', 'financial', 'insurance', 'accounting', 'investment', 'credit'],
  'education': ['school', 'university', 'training', 'education', 'academy', 'tutor'],
  'real-estate': ['real estate', 'property', 'housing', 'rental', 'mortgage'],
  'automotive': ['car', 'auto', 'vehicle', 'mechanic', 'garage', 'dealership'],
  'legal': ['law', 'legal', 'attorney', 'lawyer', 'paralegal', 'court'],
  'construction': ['construction', 'contractor', 'builder', 'renovation', 'plumber', 'electrician']
} as const;

export const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  INVALID_RESPONSE: 'INVALID_RESPONSE'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];