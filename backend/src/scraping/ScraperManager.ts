import { PrismaClient, LeadSource, Prisma } from '@prisma/client';
import { IScraper, ScraperResult, ScrapedData, SearchFilters, ScraperConfig } from './interfaces/IScraper';
import { GoogleMapsScraper } from './scrapers/GoogleMapsScraper';
import { GenericWebScraper } from './scrapers/GenericWebScraper';
import { DataExtractor } from './utils/DataExtractor';
import {
  ScraperError,
  RateLimitExceededError,
  ScrapingSession,
  ScrapingMetrics,
  ScrapingStrategy,
  BulkScrapingConfig,
  ScraperHealthCheck,
  SCRAPER_CONSTANTS
} from './types';

export interface ScraperManagerConfig {
  maxConcurrentScrapers: number;
  globalRateLimit: number;
  enableDuplicateDetection: boolean;
  enableDataQuality: boolean;
  minDataQualityScore: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface ScrapingJobConfig extends SearchFilters {
  sources: LeadSource[];
  maxResults: number;
  strategy: ScrapingStrategy;
  priority: 'low' | 'medium' | 'high';
  deduplicate: boolean;
  webhookUrl?: string;
}

export class ScraperManager {
  private readonly prisma: PrismaClient;
  private readonly scrapers: Map<LeadSource, IScraper>;
  private readonly config: ScraperManagerConfig;
  private readonly metrics: ScrapingMetrics;
  private activeSessions: Map<string, ScrapingSession>;

  constructor(
    prisma: PrismaClient,
    config?: Partial<ScraperManagerConfig>
  ) {
    this.prisma = prisma;
    this.config = {
      maxConcurrentScrapers: 3,
      globalRateLimit: 100,
      enableDuplicateDetection: true,
      enableDataQuality: true,
      minDataQualityScore: 60,
      cacheEnabled: true,
      cacheTTL: SCRAPER_CONSTANTS.CACHE_TTL,
      ...config
    };

    this.scrapers = new Map();
    this.activeSessions = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      dataQualityAverage: 0,
      lastScrapeTime: new Date(),
      totalLeadsFound: 0
    };

    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.registerScraper(new GoogleMapsScraper());
    this.registerScraper(new GenericWebScraper());

    console.log(`[ScraperManager] Initialized with ${this.scrapers.size} scrapers:`,
      Array.from(this.scrapers.keys()));
  }

  registerScraper(scraper: IScraper): void {
    if (this.scrapers.has(scraper.source)) {
      console.warn(`[ScraperManager] Scraper for ${scraper.source} already registered, overwriting`);
    }

    this.scrapers.set(scraper.source, scraper);
    console.log(`[ScraperManager] Registered scraper: ${scraper.name} for source ${scraper.source}`);
  }

  unregisterScraper(source: LeadSource): boolean {
    const removed = this.scrapers.delete(source);
    if (removed) {
      console.log(`[ScraperManager] Unregistered scraper for source: ${source}`);
    }
    return removed;
  }

  getAvailableScrapers(): Array<{ source: LeadSource; name: string; isAvailable: boolean }> {
    return Array.from(this.scrapers.entries()).map(([source, scraper]) => ({
      source,
      name: scraper.name,
      isAvailable: scraper.isAvailable
    }));
  }

  async getLeadSourcesFromDatabase(): Promise<Array<{ id: string; type: LeadSource; config: any }>> {
    try {
      const leadSources = await this.prisma.leadSource.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          type: true,
          config: true
        }
      });

      return leadSources.map(source => ({
        id: source.id,
        type: source.type as LeadSource,
        config: source.config
      }));
    } catch (error) {
      console.error('[ScraperManager] Error fetching lead sources from database:', error);
      return [];
    }
  }

  async scrapeBySource(
    source: LeadSource,
    query: string,
    filters?: SearchFilters,
    config?: Partial<ScraperConfig>
  ): Promise<ScraperResult> {
    const startTime = Date.now();

    try {
      this.metrics.totalRequests++;

      const scraper = this.scrapers.get(source);
      if (!scraper) {
        throw new ScraperError(
          `No scraper registered for source: ${source}`,
          'SCRAPER_NOT_FOUND',
          'ScraperManager',
          { source }
        );
      }

      if (!scraper.isAvailable) {
        throw new ScraperError(
          `Scraper for ${source} is not available`,
          'SCRAPER_UNAVAILABLE',
          scraper.name,
          { source }
        );
      }

      await this.checkRateLimit(scraper);

      const result = await scraper.scrape(query, filters, config);

      if (this.config.enableDataQuality && result.success) {
        result.data = this.enhanceDataQuality(result.data);
      }

      if (this.config.enableDuplicateDetection) {
        result.data = this.removeDuplicates(result.data);
      }

      this.updateMetrics(result, Date.now() - startTime);

      return result;

    } catch (error) {
      this.metrics.failedRequests++;

      if (error instanceof RateLimitExceededError) {
        this.metrics.rateLimitHits++;
      }

      throw error;
    }
  }

  async scrapeMultipleSources(
    sources: LeadSource[],
    query: string,
    filters?: SearchFilters,
    strategy: ScrapingStrategy = 'parallel'
  ): Promise<ScraperResult[]> {
    const availableSources = sources.filter(source => {
      const scraper = this.scrapers.get(source);
      return scraper && scraper.isAvailable;
    });

    if (availableSources.length === 0) {
      throw new ScraperError(
        'No available scrapers for the requested sources',
        'NO_SCRAPERS_AVAILABLE',
        'ScraperManager',
        { requestedSources: sources }
      );
    }

    switch (strategy) {
      case 'parallel':
        return this.scrapeParallel(availableSources, query, filters);
      case 'sequential':
        return this.scrapeSequential(availableSources, query, filters);
      case 'priority-based':
        return this.scrapePriorityBased(availableSources, query, filters);
      default:
        return this.scrapeParallel(availableSources, query, filters);
    }
  }

  private async scrapeParallel(
    sources: LeadSource[],
    query: string,
    filters?: SearchFilters
  ): Promise<ScraperResult[]> {
    const promises = sources.slice(0, this.config.maxConcurrentScrapers).map(source =>
      this.scrapeBySource(source, query, filters).catch(error => ({
        success: false,
        data: [],
        totalFound: 0,
        errors: [error.message],
        executionTime: 0,
        metadata: {
          source,
          searchQuery: query,
          filters,
          rateLimited: false
        }
      }))
    );

    return Promise.all(promises);
  }

  private async scrapeSequential(
    sources: LeadSource[],
    query: string,
    filters?: SearchFilters
  ): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];

    for (const source of sources) {
      try {
        const result = await this.scrapeBySource(source, query, filters);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          data: [],
          totalFound: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          executionTime: 0,
          metadata: {
            source,
            searchQuery: query,
            filters,
            rateLimited: false
          }
        });
      }
    }

    return results;
  }

  private async scrapePriorityBased(
    sources: LeadSource[],
    query: string,
    filters?: SearchFilters
  ): Promise<ScraperResult[]> {
    const priorityOrder: LeadSource[] = [
      LeadSource.GOOGLE_MAPS,
      LeadSource.WEB_SCRAPING,
      LeadSource.LINKEDIN,
      LeadSource.FACEBOOK,
      LeadSource.MANUAL
    ];

    const sortedSources = sources.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a);
      const bIndex = priorityOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return this.scrapeSequential(sortedSources, query, filters);
  }

  async startBulkScraping(config: BulkScrapingConfig): Promise<string> {
    const sessionId = this.generateSessionId();

    const session: ScrapingSession = {
      id: sessionId,
      startTime: new Date(),
      status: 'pending',
      progress: 0,
      totalScrapers: config.queries.length * config.queries[0]?.toString().length || 1,
      completedScrapers: 0,
      results: {
        totalLeads: 0,
        qualityLeads: 0,
        duplicates: 0,
        errors: []
      }
    };

    this.activeSessions.set(sessionId, session);

    // Start processing asynchronously
    this.processBulkScraping(sessionId, config).catch(error => {
      console.error('[ScraperManager] Bulk scraping failed:', error);
      session.status = 'failed';
      session.results.errors.push(error.message);
    });

    return sessionId;
  }

  private async processBulkScraping(sessionId: string, config: BulkScrapingConfig): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'running';

    try {
      const allResults: ScrapedData[] = [];

      for (let i = 0; i < config.queries.length; i++) {
        const query = config.queries[i];

        const sourceResults = await this.scrapeMultipleSources(
          [LeadSource.GOOGLE_MAPS, LeadSource.WEB_SCRAPING],
          query.term,
          {
            location: query.location,
            industry: query.category,
            keywords: [query.term]
          },
          config.strategy
        );

        const successfulResults = sourceResults
          .filter(result => result.success)
          .flatMap(result => result.data);

        allResults.push(...successfulResults);

        session.completedScrapers++;
        session.progress = Math.round((session.completedScrapers / session.totalScrapers) * 100);

        if (config.notifications.onProgress) {
          await this.notifyProgress(sessionId, session);
        }
      }

      if (config.deduplication) {
        const beforeCount = allResults.length;
        const deduplicatedResults = this.removeDuplicates(allResults);
        session.results.duplicates = beforeCount - deduplicatedResults.length;
        session.results.totalLeads = deduplicatedResults.length;
      } else {
        session.results.totalLeads = allResults.length;
      }

      session.results.qualityLeads = allResults.filter(lead =>
        (lead.metadata.confidence >= this.config.minDataQualityScore)
      ).length;

      session.status = 'completed';
      session.endTime = new Date();

      if (config.notifications.onCompletion) {
        await this.notifyCompletion(sessionId, session);
      }

    } catch (error) {
      session.status = 'failed';
      session.results.errors.push(error instanceof Error ? error.message : 'Unknown error');

      if (config.notifications.onError) {
        await this.notifyError(sessionId, session, error);
      }
    }
  }

  getSessionStatus(sessionId: string): ScrapingSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  async cancelSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.status = 'cancelled';
    session.endTime = new Date();

    return true;
  }

  private async checkRateLimit(scraper: IScraper): Promise<void> {
    const rateLimit = scraper.getRateLimit();

    if (rateLimit.currentUsage >= rateLimit.requestsPerMinute) {
      throw new RateLimitExceededError(
        scraper.name,
        60000, // 1 minute retry
        rateLimit.currentUsage,
        rateLimit.requestsPerMinute
      );
    }
  }

  private enhanceDataQuality(data: ScrapedData[]): ScrapedData[] {
    return data.map(item => {
      const quality = DataExtractor.calculateDataQuality(item);

      // Update confidence based on quality assessment
      item.metadata.confidence = Math.min(item.metadata.confidence, quality.score);

      return item;
    }).filter(item => item.metadata.confidence >= this.config.minDataQualityScore);
  }

  private removeDuplicates(data: ScrapedData[]): ScrapedData[] {
    const seen = new Set<string>();
    return data.filter(item => {
      const key = this.createDuplicationKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private createDuplicationKey(item: ScrapedData): string {
    const normalizedName = DataExtractor.cleanText(item.name).toLowerCase();
    const normalizedEmail = item.email?.toLowerCase() || '';
    const normalizedPhone = item.phone?.replace(/\D/g, '') || '';

    return `${normalizedName}|${normalizedEmail}|${normalizedPhone}`;
  }

  private updateMetrics(result: ScraperResult, executionTime: number): void {
    if (result.success) {
      this.metrics.successfulRequests++;
      this.metrics.totalLeadsFound += result.totalFound;
    }

    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + executionTime;
    this.metrics.averageResponseTime = Math.round(totalTime / this.metrics.totalRequests);

    // Update average data quality
    if (result.data.length > 0) {
      const avgQuality = result.data.reduce((sum, item) => sum + item.metadata.confidence, 0) / result.data.length;
      this.metrics.dataQualityAverage = Math.round((this.metrics.dataQualityAverage + avgQuality) / 2);
    }

    this.metrics.lastScrapeTime = new Date();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async notifyProgress(sessionId: string, session: ScrapingSession): Promise<void> {
    // Implementation for progress notifications (webhook, etc.)
    console.log(`[ScraperManager] Session ${sessionId} progress: ${session.progress}%`);
  }

  private async notifyCompletion(sessionId: string, session: ScrapingSession): Promise<void> {
    // Implementation for completion notifications
    console.log(`[ScraperManager] Session ${sessionId} completed with ${session.results.totalLeads} leads`);
  }

  private async notifyError(sessionId: string, session: ScrapingSession, error: any): Promise<void> {
    // Implementation for error notifications
    console.error(`[ScraperManager] Session ${sessionId} failed:`, error);
  }

  getMetrics(): ScrapingMetrics {
    return { ...this.metrics };
  }

  async getHealthCheck(): Promise<Record<LeadSource, ScraperHealthCheck>> {
    const healthChecks: Record<string, ScraperHealthCheck> = {};

    for (const [source, scraper] of this.scrapers.entries()) {
      const startTime = Date.now();

      try {
        // Perform a lightweight health check
        const isHealthy = scraper.isAvailable && scraper.validateConfig({});
        const responseTime = Date.now() - startTime;

        healthChecks[source] = {
          isHealthy,
          lastCheck: new Date(),
          responseTime,
          errorRate: 0, // Would calculate from metrics in real implementation
          issues: isHealthy ? [] : ['Scraper not available'],
          recommendations: isHealthy ? [] : ['Check scraper configuration']
        };
      } catch (error) {
        healthChecks[source] = {
          isHealthy: false,
          lastCheck: new Date(),
          errorRate: 100,
          issues: [error instanceof Error ? error.message : 'Unknown error'],
          recommendations: ['Check scraper implementation and dependencies']
        };
      }
    }

    return healthChecks as Record<LeadSource, ScraperHealthCheck>;
  }

  async cleanup(): Promise<void> {
    // Clean up active sessions older than 24 hours
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.startTime.getTime() < cutoffTime) {
        this.activeSessions.delete(sessionId);
      }
    }

    console.log(`[ScraperManager] Cleanup completed. Active sessions: ${this.activeSessions.size}`);
  }
}