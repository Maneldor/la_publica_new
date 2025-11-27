import { LeadSource } from '@prisma/client';
import { BaseScraper, ScraperResult, ScrapedData, SearchFilters, ScraperConfig } from '../interfaces/IScraper';
import { ScraperError, NetworkError, SCRAPER_CONSTANTS } from '../types';

export interface WebScrapingSelectors {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  container: string;
}

export interface GenericWebConfig extends ScraperConfig {
  selectors: WebScrapingSelectors;
  userAgent: string;
  followRedirects: boolean;
  maxRedirects: number;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  proxy?: string;
  javascript: boolean;
}

export interface MockWebsite {
  url: string;
  name: string;
  description: string;
  businesses: Array<Partial<ScrapedData>>;
  selectors: WebScrapingSelectors;
}

export class GenericWebScraper extends BaseScraper {
  readonly name = 'Generic Web Scraper';
  readonly source = LeadSource.WEB_FORM; // Usar WEB_FORM para Web Scraping

  private readonly mockWebsites: MockWebsite[] = [
    {
      url: 'https://example-business-directory.com',
      name: 'Business Directory Spain',
      description: 'Comprehensive business directory for Spanish companies',
      selectors: {
        container: '.business-listing',
        name: '.business-name',
        email: '.contact-email',
        phone: '.contact-phone',
        website: '.business-website a',
        address: '.business-address',
        description: '.business-description'
      },
      businesses: [
        {
          name: 'Digital Marketing Pro',
          email: 'hello@digitalmarketing-pro.es',
          phone: '+34 600 123 456',
          website: 'https://digitalmarketing-pro.es',
          address: 'Carrer del Consell de Cent, 334, Barcelona',
          industry: 'technology',
          description: 'Agencia de marketing digital especializada en SEO y SEM'
        },
        {
          name: 'Panadería Artesana Barcelona',
          email: 'info@panaderia-artesana.com',
          phone: '+34 933 456 789',
          address: 'Carrer de Girona, 67, Barcelona',
          industry: 'food',
          description: 'Panadería tradicional con productos ecológicos y artesanales'
        }
      ]
    },
    {
      url: 'https://catalonia-companies.com',
      name: 'Catalonia Business Portal',
      description: 'Business portal for Catalonian companies',
      selectors: {
        container: '.company-card',
        name: 'h3.company-title',
        email: 'a[href^="mailto:"]',
        phone: '.phone-number',
        website: '.website-link',
        address: '.company-location',
        description: '.company-summary'
      },
      businesses: [
        {
          name: 'Consultoría Empresarial Barcelona',
          email: 'contacto@consultoria-bcn.es',
          phone: '+34 934 567 890',
          website: 'https://consultoria-barcelona.com',
          address: 'Via Laietana, 12, Barcelona',
          industry: 'finance',
          description: 'Consultoría especializada en transformación digital empresarial'
        },
        {
          name: 'Estudio Arquitectura Moderna',
          email: 'proyectos@arquitectura-moderna.es',
          phone: '+34 935 678 901',
          website: 'https://arquitectura-moderna.es',
          address: 'Passeig de Sant Joan, 45, Barcelona',
          industry: 'construction',
          description: 'Estudio de arquitectura sostenible y diseño contemporáneo'
        }
      ]
    },
    {
      url: 'https://yellow-pages-spain.com',
      name: 'Yellow Pages Spain',
      description: 'Spanish business directory similar to Yellow Pages',
      selectors: {
        container: '.listing-item',
        name: '.business-title',
        email: '.email-contact',
        phone: '.phone-contact',
        website: '.web-link',
        address: '.full-address',
        description: '.business-info'
      },
      businesses: [
        {
          name: 'Veterinaria El Bosque',
          email: 'citas@veterinaria-bosque.com',
          phone: '+34 936 789 012',
          website: 'https://veterinaria-bosque.com',
          address: 'Carrer de Còrsega, 289, Barcelona',
          industry: 'healthcare',
          description: 'Clínica veterinaria con servicios 24h y cirugía especializada'
        },
        {
          name: 'Librería Independiente',
          email: 'hola@libreria-independiente.es',
          phone: '+34 937 890 123',
          address: 'Carrer de Verdi, 78, Barcelona',
          industry: 'retail',
          description: 'Librería especializada en literatura contemporánea y eventos culturales'
        }
      ]
    }
  ];

  constructor(config?: Partial<GenericWebConfig>) {
    super(config);
  }

  getDefaultConfig(): GenericWebConfig {
    return {
      ...super.getDefaultConfig(),
      selectors: {
        container: '.business, .listing, .company',
        name: 'h1, h2, h3, .name, .title, .company-name'
      },
      userAgent: SCRAPER_CONSTANTS.USER_AGENTS[0],
      followRedirects: true,
      maxRedirects: 5,
      javascript: false
    };
  }

  validateConfig(config: Partial<GenericWebConfig>): boolean {
    if (!super.validateConfig(config)) return false;

    const webConfig = config as GenericWebConfig;

    if (webConfig.selectors) {
      if (!webConfig.selectors.container || !webConfig.selectors.name) {
        return false;
      }
    }

    if (webConfig.maxRedirects !== undefined) {
      if (webConfig.maxRedirects < 0 || webConfig.maxRedirects > 10) {
        return false;
      }
    }

    if (webConfig.proxy && !this.isValidUrl(webConfig.proxy)) {
      return false;
    }

    return true;
  }

  async scrape(
    query: string,
    filters?: SearchFilters,
    config?: Partial<GenericWebConfig>
  ): Promise<ScraperResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...config } as GenericWebConfig;

    if (!this.validateConfig(mergedConfig)) {
      throw new ScraperError(
        'Invalid configuration provided',
        'CONFIGURATION_ERROR',
        this.name,
        { config: mergedConfig }
      );
    }

    try {
      await this.enforceRateLimit();

      console.log(`[${this.name}] Mock scraping websites for query: "${query}"`);
      console.log(`[${this.name}] Filters:`, filters);
      console.log(`[${this.name}] Config:`, mergedConfig);

      const results: ScrapedData[] = [];
      const errors: string[] = [];

      for (const website of this.mockWebsites) {
        try {
          await this.simulateNetworkDelay();

          const websiteResults = await this.scrapeWebsite(website, query, filters, mergedConfig);
          results.push(...websiteResults);

          if (results.length >= mergedConfig.maxResults) {
            break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to scrape ${website.url}: ${errorMessage}`);
          console.warn(`[${this.name}] Error scraping ${website.url}:`, errorMessage);
        }
      }

      const finalResults = results.slice(0, mergedConfig.maxResults);
      const executionTime = Date.now() - startTime;

      return this.createScraperResult(
        results.length > 0,
        finalResults,
        errors,
        executionTime,
        query,
        filters
      );

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return this.createScraperResult(
        false,
        [],
        [errorMessage],
        executionTime,
        query,
        filters
      );
    }
  }

  private async scrapeWebsite(
    website: MockWebsite,
    query: string,
    filters?: SearchFilters,
    _config?: Partial<GenericWebConfig>
  ): Promise<ScrapedData[]> {
    console.log(`[${this.name}] Scraping ${website.name} (${website.url})`);

    await this.simulateHTTPRequest(website.url);

    let businesses = this.filterBusinessesByQuery(website.businesses, query, filters);

    return businesses.map((business) => {
      const confidence = this.calculateConfidence(business);

      return {
        name: business.name!,
        email: business.email,
        phone: business.phone,
        website: business.website,
        address: business.address,
        industry: business.industry,
        description: business.description,
        socialMedia: this.generateMockSocialMedia(business.name!),
        metadata: {
          source: `${website.name} - ${website.url}`,
          scrapedAt: new Date(),
          confidence,
          rawData: {
            url: website.url,
            selectors: website.selectors,
            pageTitle: this.generateMockPageTitle(website.name),
            htmlSnippet: this.generateMockHTMLSnippet(business),
            responseTime: Math.floor(Math.random() * 1000) + 200,
            statusCode: 200
          }
        }
      };
    });
  }

  private filterBusinessesByQuery(
    businesses: Array<Partial<ScrapedData>>,
    query: string,
    filters?: SearchFilters
  ): Array<Partial<ScrapedData>> {
    let filtered = [...businesses];

    const queryLower = query.toLowerCase();
    filtered = filtered.filter(business => {
      const searchableText = `
        ${business.name}
        ${business.description}
        ${business.industry}
      `.toLowerCase();

      return searchableText.includes(queryLower);
    });

    if (filters) {
      if (filters.industry) {
        filtered = filtered.filter(business =>
          business.industry?.toLowerCase().includes(filters.industry!.toLowerCase())
        );
      }

      if (filters.location) {
        filtered = filtered.filter(business =>
          business.address?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.keywords) {
        filtered = filtered.filter(business => {
          const businessText = `${business.name} ${business.description}`.toLowerCase();
          return filters.keywords!.some(keyword =>
            businessText.includes(keyword.toLowerCase())
          );
        });
      }
    }

    return filtered;
  }

  private generateMockSocialMedia(businessName: string): { linkedin?: string; twitter?: string; facebook?: string } {
    const slug = businessName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const socialMedia: any = {};

    if (Math.random() > 0.5) {
      socialMedia.linkedin = `https://linkedin.com/company/${slug}`;
    }

    if (Math.random() > 0.7) {
      socialMedia.twitter = `https://twitter.com/${slug}`;
    }

    if (Math.random() > 0.4) {
      socialMedia.facebook = `https://facebook.com/${slug}`;
    }

    return socialMedia;
  }

  private generateMockPageTitle(websiteName: string): string {
    return `${websiteName} - Business Directory`;
  }

  private generateMockHTMLSnippet(business: Partial<ScrapedData>): string {
    return `
      <div class="business-listing">
        <h3 class="business-name">${business.name}</h3>
        <div class="contact-info">
          ${business.email ? `<a href="mailto:${business.email}" class="contact-email">${business.email}</a>` : ''}
          ${business.phone ? `<span class="contact-phone">${business.phone}</span>` : ''}
        </div>
        <div class="business-address">${business.address || ''}</div>
        <p class="business-description">${business.description || ''}</p>
      </div>
    `.trim();
  }

  private async simulateHTTPRequest(url: string): Promise<void> {
    console.log(`[${this.name}] HTTP GET ${url}`);

    // Simulate potential network issues
    if (Math.random() < 0.05) { // 5% chance of network error
      throw new NetworkError(this.name, url, 500, 'Simulated server error');
    }

    if (Math.random() < 0.02) { // 2% chance of timeout
      throw new ScraperError(
        `Request timeout for ${url}`,
        'TIMEOUT_ERROR',
        this.name,
        { url, timeout: this.config.timeout }
      );
    }

    // Simulate response time
    const responseTime = Math.random() * 3000 + 500; // 0.5-3.5 seconds
    await new Promise(resolve => setTimeout(resolve, responseTime));
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getRateLimit(): { requestsPerMinute: number; currentUsage: number } {
    return {
      requestsPerMinute: 120, // More permissive for web scraping
      currentUsage: this.requestCount
    };
  }

  async scrapeUrl(
    url: string,
    selectors?: WebScrapingSelectors,
    config?: Partial<GenericWebConfig>
  ): Promise<ScrapedData[]> {
    console.log(`[${this.name}] Direct URL scraping: ${url}`);

    const mockWebsite: MockWebsite = {
      url,
      name: 'Custom URL',
      description: 'Direct URL scraping',
      selectors: selectors || this.getDefaultConfig().selectors,
      businesses: [
        {
          name: 'Example Business from URL',
          email: 'contact@example.com',
          phone: '+34 123 456 789',
          address: 'Barcelona, Spain',
          description: 'Mock business extracted from custom URL'
        }
      ]
    };

    return this.scrapeWebsite(mockWebsite, '', undefined, config);
  }

  getAvailableSelectors(): string[] {
    return [
      '.business', '.company', '.listing',
      'h1', 'h2', 'h3', '.title', '.name',
      '.email', 'a[href^="mailto:"]',
      '.phone', '.tel', '.telephone',
      '.website', '.url', 'a[href^="http"]',
      '.address', '.location', '.contact',
      '.description', '.summary', '.about'
    ];
  }

  validateSelectors(selectors: WebScrapingSelectors): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!selectors.container) {
      issues.push('Container selector is required');
    }

    if (!selectors.name) {
      issues.push('Name selector is required');
    }

    // Check for potentially problematic selectors
    const problematicSelectors = [selectors.container, selectors.name, selectors.email, selectors.phone];
    problematicSelectors.forEach((selector, index) => {
      if (selector && selector.includes('script')) {
        issues.push(`Selector ${index} contains potentially dangerous 'script' reference`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }
}