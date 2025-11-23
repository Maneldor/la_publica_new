// Core Interfaces and Base Classes
export {
  IScraper,
  BaseScraper,
  ScraperConfig,
  ScrapedData,
  ScraperResult,
  SearchFilters
} from './interfaces/IScraper';

// Type Definitions and Error Classes
export {
  ScraperError,
  RateLimitExceededError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  ParseError,
  DataQuality,
  ExtractedContact,
  BusinessIndustry,
  GeographicData,
  CompanySize,
  WebPresence,
  ScrapingMetrics,
  SearchQuery,
  ScrapingSession,
  ScraperHealthCheck,
  ScrapingStrategy,
  DataVerificationLevel,
  BulkScrapingConfig,
  SCRAPER_CONSTANTS,
  INDUSTRY_MAPPINGS,
  ERROR_CODES,
  ErrorCode
} from './types';

// Concrete Scraper Implementations
export {
  GoogleMapsScraper,
  GoogleMapsConfig
} from './scrapers/GoogleMapsScraper';

export {
  GenericWebScraper,
  GenericWebConfig,
  WebScrapingSelectors,
  MockWebsite
} from './scrapers/GenericWebScraper';

// Utilities
export { DataExtractor } from './utils/DataExtractor';

// Scraper Manager
export {
  ScraperManager,
  ScraperManagerConfig,
  ScrapingJobConfig
} from './ScraperManager';

// Convenience factory function for creating a ScraperManager with default scrapers
export function createScraperManager(
  prisma: any,
  config?: Partial<ScraperManagerConfig>
): ScraperManager {
  return new ScraperManager(prisma, config);
}

// Convenience function to get all available scraper types
export function getAvailableScraperTypes(): string[] {
  return [
    'GOOGLE_MAPS',
    'WEB_SCRAPING',
    'LINKEDIN',
    'FACEBOOK',
    'MANUAL'
  ];
}

// Convenience function to validate scraper configuration
export function validateScraperConfig(
  scraperType: string,
  config: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!scraperType) {
    errors.push('Scraper type is required');
  }

  if (!config) {
    errors.push('Configuration is required');
  }

  // Add specific validation logic for different scraper types
  switch (scraperType) {
    case 'GOOGLE_MAPS':
      if (config.minRating && (config.minRating < 1 || config.minRating > 5)) {
        errors.push('Google Maps minRating must be between 1 and 5');
      }
      if (config.radiusKm && (config.radiusKm < 1 || config.radiusKm > 50)) {
        errors.push('Google Maps radiusKm must be between 1 and 50');
      }
      break;
    case 'WEB_SCRAPING':
      if (!config.selectors || !config.selectors.container) {
        errors.push('Web scraping requires container selector');
      }
      if (!config.selectors || !config.selectors.name) {
        errors.push('Web scraping requires name selector');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export default instance creator for easier usage
export default {
  createScraperManager,
  getAvailableScraperTypes,
  validateScraperConfig,
  SCRAPER_CONSTANTS,
  ERROR_CODES
};