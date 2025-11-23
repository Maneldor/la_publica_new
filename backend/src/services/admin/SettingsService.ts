import { PrismaClient } from '@prisma/client';

export interface GlobalSettings {
  lead_generation: {
    auto_approve_threshold: number; // Score mínim per auto-aprovar
    auto_reject_threshold: number; // Score mínim per no auto-rebutjar
    max_daily_leads: number;
    enable_ai_processing: boolean;
  };
  ai: {
    default_provider: string;
    max_retries: number;
    timeout_seconds: number;
    cost_alert_threshold: number; // Alert si cost diari > X
  };
  scraping: {
    default_frequency: string;
    max_concurrent_jobs: number;
    retry_failed_jobs: boolean;
    cleanup_after_days: number;
  };
  notifications: {
    email_on_new_leads: boolean;
    email_on_job_failure: boolean;
    daily_summary: boolean;
    weekly_report: boolean;
  };
}

// Clave única que usamos en la base de datos para este registro de configuración
const GLOBAL_SETTINGS_KEY = 'GLOBAL_SETTINGS';

export class SettingsService {
  private prisma: PrismaClient;
  private settingsCache: GlobalSettings | null = null;
  private cacheExpiry: Date | null = null;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // GET /api/admin/settings - Obtenir configuració
  async getSettings(): Promise<GlobalSettings> {
    // Cache de 5 minuts
    if (this.settingsCache && this.cacheExpiry && this.cacheExpiry > new Date()) {
      return this.settingsCache;
    }

    // Buscar settings a la DB (assumint model SystemSettings)
    const settings = await this.prisma.systemSettings.findFirst({
        where: { key: GLOBAL_SETTINGS_KEY }
    });

    if (!settings) {
      // Si no existeix, retornar valors per defecte sense cachear
      return this.getDefaultSettings();
    }

    // CORRECCIÓN CLAVE: Usamos 'value' en lugar de 'config'
    const globalSettings = settings.value as unknown as GlobalSettings;

    // Actualitzar cache
    this.settingsCache = globalSettings;
    this.cacheExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Si el valor no es válido por alguna razón, devolvemos los defaults
    return globalSettings || this.getDefaultSettings();
  }

  // PUT /api/admin/settings - Actualitzar configuració
  async updateSettings(updates: Partial<GlobalSettings>, userId: string): Promise<GlobalSettings> {
    const current = await this.getSettings();

    // Merge deep
    const updated: GlobalSettings = {
      lead_generation: {
        ...current.lead_generation,
        ...(updates.lead_generation || {})
      },
      ai: {
        ...current.ai,
        ...(updates.ai || {})
      },
      scraping: {
        ...current.scraping,
        ...(updates.scraping || {})
      },
      notifications: {
        ...current.notifications,
        ...(updates.notifications || {})
      }
    };

    // Validar settings
    this.validateSettings(updated);

    // Guardar a DB (usando upsert con la clave 'key')
    const settings = await this.prisma.systemSettings.upsert({
      where: { key: GLOBAL_SETTINGS_KEY }, // Usar key única
      create: {
        key: GLOBAL_SETTINGS_KEY,
        value: updated as any, // CORRECCIÓN CLAVE: Usando 'value'
        lastUpdatedBy: userId,
      },
      update: {
        value: updated as any, // CORRECCIÓN CLAVE: Usando 'value'
        lastUpdatedBy: userId,
      }
    });

    // Invalidar cache
    this.settingsCache = null;
    this.cacheExpiry = null;

    // Retornamos el valor actualizado de la DB
    return settings.value as unknown as GlobalSettings; 
  }

  // POST /api/admin/settings/reset - Reset a defaults
  async resetSettings(userId: string): Promise<GlobalSettings> {
    const defaults = this.getDefaultSettings();

    await this.prisma.systemSettings.upsert({
      where: { key: GLOBAL_SETTINGS_KEY }, // Usar key única
      create: {
        key: GLOBAL_SETTINGS_KEY,
        value: defaults as any, // CORRECCIÓN CLAVE: Usando 'value'
        lastUpdatedBy: userId,
      },
      update: {
        value: defaults as any, // CORRECCIÓN CLAVE: Usando 'value'
        lastUpdatedBy: userId,
      }
    });

    // Invalidar cache
    this.settingsCache = null;
    this.cacheExpiry = null;

    return defaults;
  }

  // HELPERS PRIVATS

  private getDefaultSettings(): GlobalSettings {
    return {
      lead_generation: {
        auto_approve_threshold: 80,
        auto_reject_threshold: 40,
        max_daily_leads: 1000,
        enable_ai_processing: true,
      },
      ai: {
        default_provider: 'claude-main',
        max_retries: 3,
        timeout_seconds: 30,
        cost_alert_threshold: 50,
      },
      scraping: {
        default_frequency: 'DAILY',
        max_concurrent_jobs: 5,
        retry_failed_jobs: true,
        cleanup_after_days: 30,
      },
      notifications: {
        email_on_new_leads: true,
        email_on_job_failure: true,
        daily_summary: true,
        weekly_report: true,
      }
    };
  }

  private validateSettings(settings: GlobalSettings) {
    // Validar lead_generation
    if (settings.lead_generation.auto_approve_threshold < 0 ||
        settings.lead_generation.auto_approve_threshold > 100) {
      throw new Error('auto_approve_threshold must be between 0 and 100');
    }

    if (settings.lead_generation.auto_reject_threshold < 0 ||
        settings.lead_generation.auto_reject_threshold > 100) {
      throw new Error('auto_reject_threshold must be between 0 and 100');
    }

    if (settings.lead_generation.auto_reject_threshold >=
        settings.lead_generation.auto_approve_threshold) {
      throw new Error('auto_reject_threshold must be less than auto_approve_threshold');
    }

    // Validar AI
    if (settings.ai.max_retries < 0 || settings.ai.max_retries > 10) {
      throw new Error('max_retries must be between 0 and 10');
    }

    if (settings.ai.timeout_seconds < 5 || settings.ai.timeout_seconds > 300) {
      throw new Error('timeout_seconds must be between 5 and 300');
    }

    // Validar scraping
    if (settings.scraping.max_concurrent_jobs < 1 ||
        settings.scraping.max_concurrent_jobs > 20) {
      throw new Error('max_concurrent_jobs must be between 1 and 20');
    }

    if (settings.scraping.cleanup_after_days < 1) {
      throw new Error('cleanup_after_days must be at least 1');
    }
  }
}