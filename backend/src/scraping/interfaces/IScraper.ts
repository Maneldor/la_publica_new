// LeadSource type - usar enum de Prisma
import { LeadSource } from '@prisma/client';
export { LeadSource };

export interface ScraperConfig {
  maxResults: number;
  timeout: number;
  rateLimitDelay: number;
  retryAttempts: number;
  [key: string]: any;
}

export interface ScrapedData {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  description?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  metadata: {
    source: string;
    scrapedAt: Date;
    confidence: number;
    rawData?: any;
  };
}

export interface ScraperResult {
  success: boolean;
  data: ScrapedData[];
  totalFound: number;
  errors: string[];
  executionTime: number;
  metadata: {
    source: LeadSource;
    searchQuery?: string;
    filters?: any;
    rateLimited: boolean;
  };
}

export interface SearchFilters {
  industry?: string;
  location?: string;
  companySize?: 'small' | 'medium' | 'large';
  keywords?: string[];
  excludeKeywords?: string[];
}

export interface IScraper {
  readonly name: string;
  readonly source: LeadSource;
  readonly isAvailable: boolean;

  scrape(query: string, filters?: SearchFilters, config?: Partial<ScraperConfig>): Promise<ScraperResult>;
  validateConfig(config: Partial<ScraperConfig>): boolean;
  getDefaultConfig(): ScraperConfig;
  getRateLimit(): { requestsPerMinute: number; currentUsage: number };
}

export abstract class BaseScraper implements IScraper {
  abstract readonly name: string;
  abstract readonly source: LeadSource;

  protected config: ScraperConfig;
  protected lastRequestTime: Date = new Date(0);
  protected requestCount: number = 0;
  protected requestWindow: Date = new Date();

  constructor(config?: Partial<ScraperConfig>) {
    this.config = { ...this.getDefaultConfig(), ...config };
  }

  get isAvailable(): boolean {
    return true;
  }

  abstract scrape(query: string, filters?: SearchFilters, config?: Partial<ScraperConfig>): Promise<ScraperResult>;

  validateConfig(config: Partial<ScraperConfig>): boolean {
    if (!config) return true;

    if (config.maxResults !== undefined && (config.maxResults < 1 || config.maxResults > 1000)) {
      return false;
    }

    if (config.timeout !== undefined && (config.timeout < 1000 || config.timeout > 60000)) {
      return false;
    }

    if (config.rateLimitDelay !== undefined && config.rateLimitDelay < 0) {
      return false;
    }

    if (config.retryAttempts !== undefined && (config.retryAttempts < 0 || config.retryAttempts > 5)) {
      return false;
    }

    return true;
  }

  getDefaultConfig(): ScraperConfig {
    return {
      maxResults: 50,
      timeout: 30000,
      rateLimitDelay: 1000,
      retryAttempts: 3
    };
  }

  getRateLimit(): { requestsPerMinute: number; currentUsage: number } {
    const now = new Date();
    const windowDuration = 60000; // 1 minute

    if (now.getTime() - this.requestWindow.getTime() >= windowDuration) {
      this.requestCount = 0;
      this.requestWindow = now;
    }

    return {
      requestsPerMinute: 60,
      currentUsage: this.requestCount
    };
  }

  protected async enforceRateLimit(): Promise<void> {
    const now = new Date();
    const timeSinceLastRequest = now.getTime() - this.lastRequestTime.getTime();

    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = new Date();
    this.requestCount++;
  }

  protected createScraperResult(
    success: boolean,
    data: ScrapedData[] = [],
    errors: string[] = [],
    executionTime: number,
    searchQuery?: string,
    filters?: SearchFilters
  ): ScraperResult {
    return {
      success,
      data,
      totalFound: data.length,
      errors,
      executionTime,
      metadata: {
        source: this.source,
        searchQuery,
        filters,
        rateLimited: this.getRateLimit().currentUsage >= 60
      }
    };
  }

  protected calculateConfidence(data: Partial<ScrapedData>): number {
    let score = 0;
    let maxScore = 0;

    const checks = [
      { field: data.name, weight: 20, required: true },
      { field: data.email, weight: 15 },
      { field: data.phone, weight: 10 },
      { field: data.website, weight: 15 },
      { field: data.address, weight: 10 },
      { field: data.industry, weight: 10 },
      { field: data.description, weight: 20 }
    ];

    checks.forEach(check => {
      maxScore += check.weight;
      if (check.field) {
        if (check.required) {
          score += check.weight;
        } else {
          const quality = this.assessDataQuality(check.field);
          score += check.weight * quality;
        }
      } else if (check.required) {
        score += 0; // Required field missing
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  private assessDataQuality(value: string): number {
    if (!value || value.trim().length === 0) return 0;
    if (value.trim().length < 3) return 0.3;
    if (value.includes('N/A') || value.includes('n/a') || value.includes('null')) return 0.1;
    return 1;
  }
}