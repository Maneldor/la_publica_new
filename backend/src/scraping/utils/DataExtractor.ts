import { DataQuality, ExtractedContact, BusinessIndustry, GeographicData, CompanySize, WebPresence, INDUSTRY_MAPPINGS } from '../types';

export class DataExtractor {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  private static readonly PHONE_REGEX = /(?:\+34|0034)?(?:\s|-)?(?:6|7|9)(?:\s|-)?(?:\d{2}(?:\s|-)?){4}|(?:\+34|0034)?(?:\s|-)?(?:8|9)(?:\d{2}(?:\s|-)?){4}/g;
  private static readonly URL_REGEX = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/gi;
  private static readonly SOCIAL_LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company\/|in\/|pub\/)[a-zA-Z0-9_.-]+/gi;
  private static readonly SOCIAL_TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?twitter\.com\/[a-zA-Z0-9_]+/gi;
  private static readonly SOCIAL_FACEBOOK_REGEX = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[a-zA-Z0-9_.]+/gi;
  private static readonly INSTAGRAM_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/gi;

  static extractEmails(text: string): string[] {
    if (!text) return [];

    const emails = text.match(this.EMAIL_REGEX) || [];
    return [...new Set(emails)]
      .filter(email => this.isValidEmail(email))
      .slice(0, 5); // Limit to 5 emails max
  }

  static extractPhones(text: string): string[] {
    if (!text) return [];

    const phones = text.match(this.PHONE_REGEX) || [];
    return [...new Set(phones)]
      .map(phone => this.normalizePhone(phone))
      .filter(phone => this.isValidPhone(phone))
      .slice(0, 3); // Limit to 3 phones max
  }

  static extractWebsites(text: string): string[] {
    if (!text) return [];

    const urls = text.match(this.URL_REGEX) || [];
    return [...new Set(urls)]
      .filter(url => this.isValidWebsite(url))
      .slice(0, 3); // Limit to 3 websites max
  }

  static extractSocialMedia(text: string): ExtractedContact['socialMedia'] {
    if (!text) return {};

    const social: ExtractedContact['socialMedia'] = {};

    const linkedinMatches = text.match(this.SOCIAL_LINKEDIN_REGEX);
    if (linkedinMatches && linkedinMatches.length > 0) {
      social.linkedin = linkedinMatches[0];
    }

    const twitterMatches = text.match(this.SOCIAL_TWITTER_REGEX);
    if (twitterMatches && twitterMatches.length > 0) {
      social.twitter = twitterMatches[0];
    }

    const facebookMatches = text.match(this.SOCIAL_FACEBOOK_REGEX);
    if (facebookMatches && facebookMatches.length > 0) {
      social.facebook = facebookMatches[0];
    }

    const instagramMatches = text.match(this.INSTAGRAM_REGEX);
    if (instagramMatches && instagramMatches.length > 0) {
      social.instagram = instagramMatches[0];
    }

    return social;
  }

  static extractAllContacts(text: string): ExtractedContact {
    return {
      emails: this.extractEmails(text),
      phones: this.extractPhones(text),
      socialMedia: this.extractSocialMedia(text)
    };
  }

  static cleanText(text: string): string {
    if (!text) return '';

    return text
      .replace(/[\r\n\t]+/g, ' ') // Replace newlines and tabs with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '') // Remove non-printable characters but keep accented chars
      .trim();
  }

  static normalizeCompanyName(name: string): string {
    if (!name) return '';

    return name
      .replace(/\b(?:S\.?L\.?|S\.?A\.?|Ltd\.?|Inc\.?|Corp\.?|LLC)\b/gi, '') // Remove common company suffixes
      .replace(/[^\w\s&.-]/g, '') // Keep only word chars, spaces, &, ., -
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  static extractIndustry(businessName: string, description: string): BusinessIndustry {
    const searchText = `${businessName} ${description}`.toLowerCase();
    const industryScores: Record<string, { score: number; keywords: string[] }> = {};

    // Score each industry based on keyword matches
    for (const [industry, keywords] of Object.entries(INDUSTRY_MAPPINGS)) {
      let score = 0;
      const foundKeywords: string[] = [];

      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        const matches = (searchText.match(new RegExp(`\\b${keywordLower}\\b`, 'gi')) || []).length;
        if (matches > 0) {
          score += matches * (keyword.length > 3 ? 2 : 1); // Longer keywords get higher weight
          foundKeywords.push(keyword);
        }
      });

      if (score > 0) {
        industryScores[industry] = { score, keywords: foundKeywords };
      }
    }

    // Find the industry with the highest score
    const bestMatch = Object.entries(industryScores)
      .sort(([,a], [,b]) => b.score - a.score)[0];

    if (!bestMatch) {
      return {
        primary: 'other',
        tags: [],
        confidence: 0
      };
    }

    const [industry, { score, keywords }] = bestMatch;
    const totalWords = searchText.split(' ').length;
    const confidence = Math.min(Math.round((score / totalWords) * 100), 95);

    return {
      primary: industry,
      tags: keywords,
      confidence
    };
  }

  static extractGeographicData(addressText: string): GeographicData {
    if (!addressText) return { address: '' };

    const cleanAddress = this.cleanText(addressText);

    // Extract Spanish postal codes (5 digits)
    const zipMatch = cleanAddress.match(/\b\d{5}\b/);
    const zipCode = zipMatch ? zipMatch[0] : undefined;

    // Extract common Spanish cities
    const spanishCities = ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'málaga', 'bilbao'];
    const cityMatch = spanishCities.find(city =>
      cleanAddress.toLowerCase().includes(city)
    );

    // Extract autonomous communities/provinces
    const spanishStates = ['catalunya', 'cataluña', 'andalucía', 'madrid', 'valencia', 'país vasco'];
    const stateMatch = spanishStates.find(state =>
      cleanAddress.toLowerCase().includes(state)
    );

    return {
      address: cleanAddress,
      city: cityMatch ? this.capitalizeFirst(cityMatch) : undefined,
      state: stateMatch ? this.capitalizeFirst(stateMatch) : undefined,
      country: cleanAddress.toLowerCase().includes('españa') || cleanAddress.toLowerCase().includes('spain') ? 'España' : undefined,
      zipCode
    };
  }

  static estimateCompanySize(description: string, employeeHints?: string): CompanySize {
    const text = `${description} ${employeeHints || ''}`.toLowerCase();

    // Look for explicit employee numbers
    const employeeNumberMatch = text.match(/(\d+)\s*(?:empleados?|trabajadores?|personas?|workers?|employees?)/i);
    if (employeeNumberMatch) {
      const count = parseInt(employeeNumberMatch[1]);
      return this.categorizeByEmployeeCount(count, 90);
    }

    // Look for size indicators
    const sizeIndicators = {
      micro: ['autónomo', 'freelance', 'individual', 'personal', 'pequeño negocio'],
      small: ['pequeña empresa', 'startup', 'equipo reducido', 'familia'],
      medium: ['mediana empresa', 'equipo', 'sucursales', 'oficinas'],
      large: ['gran empresa', 'corporación', 'multinacional', 'grupo'],
      enterprise: ['holding', 'conglomerado', 'internacional', 'global']
    };

    for (const [category, indicators] of Object.entries(sizeIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return {
          category: category as CompanySize['category'],
          employeeRange: this.getEmployeeRangeForCategory(category as CompanySize['category']),
          confidence: 60
        };
      }
    }

    // Default to small if no indicators found
    return {
      category: 'small',
      employeeRange: '1-10',
      confidence: 30
    };
  }

  static assessWebPresence(website?: string, socialMedia?: any): WebPresence {
    const hasWebsite = Boolean(website && this.isValidWebsite(website));
    const hasSocialMedia = Boolean(socialMedia && Object.keys(socialMedia).length > 0);

    let digitalMaturity: WebPresence['digitalMaturity'] = 'low';

    if (hasWebsite && hasSocialMedia) {
      const socialCount = Object.keys(socialMedia || {}).length;
      digitalMaturity = socialCount >= 2 ? 'high' : 'medium';
    } else if (hasWebsite || hasSocialMedia) {
      digitalMaturity = 'medium';
    }

    return {
      hasWebsite,
      hasSocialMedia,
      digitalMaturity
    };
  }

  static calculateDataQuality(data: any): DataQuality {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Required fields
    if (!data.name || data.name.length < 2) {
      issues.push('Nome da empresa em falta ou muito curto');
      score -= 30;
    }

    // Contact information
    if (!data.email && !data.phone) {
      issues.push('Nenhuma informação de contacto encontrada');
      recommendations.push('Procurar por email ou telefone');
      score -= 25;
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      issues.push('Email inválido');
      score -= 15;
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      issues.push('Telefone inválido');
      score -= 10;
    }

    // Website validation
    if (data.website && !this.isValidWebsite(data.website)) {
      issues.push('Website inválido');
      score -= 10;
    }

    // Address completeness
    if (!data.address || data.address.length < 10) {
      issues.push('Endereço incompleto ou em falta');
      recommendations.push('Adicionar endereço completo');
      score -= 15;
    }

    // Description quality
    if (!data.description || data.description.length < 20) {
      issues.push('Descrição muito curta ou em falta');
      recommendations.push('Adicionar descrição mais detalhada');
      score -= 10;
    }

    // Industry classification
    if (!data.industry) {
      issues.push('Indústria/sector não identificado');
      recommendations.push('Classificar por sector de atividade');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private static isValidEmail(email: string): boolean {
    if (!email || email.length > 254) return false;

    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [local, domain] = parts;
    if (local.length > 64 || domain.length > 255) return false;

    // Check for common invalid patterns
    if (email.includes('..') || email.includes('noreply') || email.includes('no-reply')) {
      return false;
    }

    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    if (!phone) return false;

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Spanish phone format validation
    return /^(\+34|0034)?[6789]\d{8}$/.test(cleanPhone);
  }

  private static isValidWebsite(url: string): boolean {
    if (!url) return false;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private static normalizePhone(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Add +34 prefix if missing
    if (!/^\+/.test(normalized) && /^[6789]/.test(normalized)) {
      normalized = '+34' + normalized;
    }

    // Replace 0034 with +34
    normalized = normalized.replace(/^0034/, '+34');

    return normalized;
  }

  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  private static categorizeByEmployeeCount(count: number, confidence: number): CompanySize {
    if (count <= 1) {
      return { category: 'micro', employeeRange: '1', estimatedEmployees: count, confidence };
    } else if (count <= 10) {
      return { category: 'small', employeeRange: '2-10', estimatedEmployees: count, confidence };
    } else if (count <= 50) {
      return { category: 'medium', employeeRange: '11-50', estimatedEmployees: count, confidence };
    } else if (count <= 250) {
      return { category: 'large', employeeRange: '51-250', estimatedEmployees: count, confidence };
    } else {
      return { category: 'enterprise', employeeRange: '250+', estimatedEmployees: count, confidence };
    }
  }

  private static getEmployeeRangeForCategory(category: string): string {
    const ranges = {
      micro: '1',
      small: '1-10',
      medium: '11-50',
      large: '51-250',
      enterprise: '250+'
    };
    return ranges[category as keyof typeof ranges] || '1-10';
  }
}