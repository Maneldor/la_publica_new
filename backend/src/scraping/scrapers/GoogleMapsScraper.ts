import { LeadSource } from '@prisma/client';
import { BaseScraper, ScraperResult, ScrapedData, SearchFilters, ScraperConfig } from '../interfaces/IScraper';
import { ScraperError, INDUSTRY_MAPPINGS } from '../types';

export interface GoogleMapsConfig extends ScraperConfig {
  language: string;
  region: string;
  includeReviews: boolean;
  minRating: number;
  radiusKm: number;
}

export class GoogleMapsScraper extends BaseScraper {
  readonly name = 'Google Maps Scraper';
  readonly source = LeadSource.AI_PROSPECTING; // Usar AI_PROSPECTING para Google Maps

  private readonly mockBusinesses: Array<Partial<ScrapedData>> = [
    {
      name: 'TechStart Solutions',
      email: 'contact@techstart.com',
      phone: '+34 123 456 789',
      website: 'https://techstart.com',
      address: 'Carrer de Balmes, 123, Barcelona, España',
      industry: 'technology',
      description: 'Empresa de desarrollo de software especializada en soluciones empresariales'
    },
    {
      name: 'Restaurante El Mediterráneo',
      email: 'info@elmediterraneo.es',
      phone: '+34 987 654 321',
      website: 'https://elmediterraneo.es',
      address: 'Passeig de Gràcia, 45, Barcelona, España',
      industry: 'food',
      description: 'Restaurante de cocina mediterránea con productos locales'
    },
    {
      name: 'Clínica Dental Barcelona',
      phone: '+34 555 123 456',
      website: 'https://clinicadental-bcn.com',
      address: 'Avinguda Diagonal, 234, Barcelona, España',
      industry: 'healthcare',
      description: 'Clínica dental moderna con tecnología avanzada'
    },
    {
      name: 'Constructora Mediterránea',
      email: 'proyectos@constructora-med.es',
      phone: '+34 666 777 888',
      website: 'https://constructora-mediterranea.com',
      address: 'Carrer de Provença, 567, Barcelona, España',
      industry: 'construction',
      description: 'Empresa constructora especializada en edificación residencial'
    },
    {
      name: 'Boutique Fashion Barcelona',
      email: 'hello@fashionbcn.com',
      phone: '+34 444 555 666',
      website: 'https://fashionbarcelona.com',
      address: 'El Born, Carrer del Rec, 12, Barcelona, España',
      industry: 'retail',
      description: 'Boutique de moda sostenible y diseño local'
    },
    {
      name: 'Academia Digital Pro',
      email: 'info@academiapro.es',
      phone: '+34 111 222 333',
      website: 'https://academiapro.es',
      address: 'Carrer de Muntaner, 89, Barcelona, España',
      industry: 'education',
      description: 'Centro de formación en marketing digital y desarrollo web'
    },
    {
      name: 'Asesoría Fiscal López',
      email: 'contacto@asesoria-lopez.com',
      phone: '+34 333 444 555',
      address: 'Plaza Catalunya, 21, Barcelona, España',
      industry: 'finance',
      description: 'Asesoría fiscal y contable para empresas y autónomos'
    },
    {
      name: 'Inmobiliaria Barcelona Premium',
      email: 'ventas@bcnpremium.es',
      phone: '+34 777 888 999',
      website: 'https://barcelonapremium.com',
      address: 'Carrer de Pau Claris, 145, Barcelona, España',
      industry: 'real-estate',
      description: 'Inmobiliaria especializada en propiedades de lujo en Barcelona'
    },
    {
      name: 'Auto Reparaciones García',
      phone: '+34 222 333 444',
      address: 'Carrer de la Indústria, 234, Barcelona, España',
      industry: 'automotive',
      description: 'Taller mecánico especializado en vehículos europeos'
    },
    {
      name: 'Bufete Jurídico Associats',
      email: 'info@juridico-associats.com',
      phone: '+34 888 999 000',
      website: 'https://juridico-associats.com',
      address: 'Carrer de Rosselló, 178, Barcelona, España',
      industry: 'legal',
      description: 'Bufete de abogados especializado en derecho mercantil y laboral'
    }
  ];

  constructor(config?: Partial<GoogleMapsConfig>) {
    super(config);
  }

  getDefaultConfig(): GoogleMapsConfig {
    return {
      ...super.getDefaultConfig(),
      language: 'es',
      region: 'ES',
      includeReviews: true,
      minRating: 3.0,
      radiusKm: 10
    };
  }

  validateConfig(config: Partial<GoogleMapsConfig>): boolean {
    if (!super.validateConfig(config)) return false;

    const gmapsConfig = config as GoogleMapsConfig;

    if (gmapsConfig.minRating !== undefined) {
      if (gmapsConfig.minRating < 1 || gmapsConfig.minRating > 5) {
        return false;
      }
    }

    if (gmapsConfig.radiusKm !== undefined) {
      if (gmapsConfig.radiusKm < 1 || gmapsConfig.radiusKm > 50) {
        return false;
      }
    }

    if (gmapsConfig.language && !/^[a-z]{2}$/.test(gmapsConfig.language)) {
      return false;
    }

    if (gmapsConfig.region && !/^[A-Z]{2}$/.test(gmapsConfig.region)) {
      return false;
    }

    return true;
  }

  async scrape(
    query: string,
    filters?: SearchFilters,
    config?: Partial<GoogleMapsConfig>
  ): Promise<ScraperResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...config } as GoogleMapsConfig;

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

      console.log(`[${this.name}] Mock scraping for query: "${query}"`);
      console.log(`[${this.name}] Filters:`, filters);
      console.log(`[${this.name}] Config:`, mergedConfig);

      await this.simulateNetworkDelay();

      let filteredBusinesses = this.filterBusinessesByQuery(query, filters);

      filteredBusinesses = filteredBusinesses.slice(0, mergedConfig.maxResults);

      const scrapedData: ScrapedData[] = filteredBusinesses.map((business, index) => {
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
            source: `Google Maps - ${query}`,
            scrapedAt: new Date(),
            confidence,
            rawData: {
              placeId: `mock_place_${index + 1}`,
              rating: this.generateRandomRating(),
              reviewCount: Math.floor(Math.random() * 500) + 10,
              priceLevel: Math.floor(Math.random() * 4) + 1,
              isVerified: Math.random() > 0.3,
              businessStatus: 'OPERATIONAL',
              location: this.generateMockCoordinates()
            }
          }
        };
      });

      const executionTime = Date.now() - startTime;

      return this.createScraperResult(
        true,
        scrapedData,
        [],
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

  private filterBusinessesByQuery(query: string, filters?: SearchFilters): Array<Partial<ScrapedData>> {
    let businesses = [...this.mockBusinesses];

    const queryLower = query.toLowerCase();
    businesses = businesses.filter(business => {
      const searchableText = `
        ${business.name}
        ${business.description}
        ${business.industry}
      `.toLowerCase();

      return searchableText.includes(queryLower);
    });

    if (filters) {
      if (filters.industry) {
        businesses = businesses.filter(business => {
          if (!business.industry) return false;

          const industryKeywords = INDUSTRY_MAPPINGS[filters.industry as keyof typeof INDUSTRY_MAPPINGS] || [filters.industry];
          return industryKeywords.some(keyword =>
            business.industry?.toLowerCase().includes(keyword.toLowerCase())
          );
        });
      }

      if (filters.location) {
        businesses = businesses.filter(business =>
          business.address?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.keywords) {
        businesses = businesses.filter(business => {
          const businessText = `${business.name} ${business.description}`.toLowerCase();
          return filters.keywords!.some(keyword =>
            businessText.includes(keyword.toLowerCase())
          );
        });
      }

      if (filters.excludeKeywords) {
        businesses = businesses.filter(business => {
          const businessText = `${business.name} ${business.description}`.toLowerCase();
          return !filters.excludeKeywords!.some(keyword =>
            businessText.includes(keyword.toLowerCase())
          );
        });
      }
    }

    return this.shuffleArray(businesses);
  }

  private generateMockSocialMedia(businessName: string): { linkedin?: string; twitter?: string; facebook?: string } {
    const slug = businessName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const socialMedia: any = {};

    if (Math.random() > 0.4) {
      socialMedia.linkedin = `https://linkedin.com/company/${slug}`;
    }

    if (Math.random() > 0.6) {
      socialMedia.twitter = `https://twitter.com/${slug}`;
    }

    if (Math.random() > 0.3) {
      socialMedia.facebook = `https://facebook.com/${slug}`;
    }

    return socialMedia;
  }

  private generateRandomRating(): number {
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // Rating between 3.0 and 5.0
  }

  private generateMockCoordinates(): { lat: number; lng: number } {
    // Barcelona coordinates with some randomization
    return {
      lat: 41.3851 + (Math.random() - 0.5) * 0.1,
      lng: 2.1734 + (Math.random() - 0.5) * 0.1
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  getRateLimit(): { requestsPerMinute: number; currentUsage: number } {
    return {
      requestsPerMinute: 30, // Google Maps is more restrictive
      currentUsage: this.requestCount
    };
  }
}