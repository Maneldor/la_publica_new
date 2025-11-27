// Core Types and Interfaces
export * from './types';

// Queues
export { ScrapingQueue } from './queues/ScrapingQueue';
export { AIProcessingQueue } from './queues/AIProcessingQueue';

// Workers
export { ScrapingWorker } from './workers/ScrapingWorker';
export { AIProcessingWorker } from './workers/AIProcessingWorker';

// Scheduler
export { JobScheduler } from './scheduler/JobScheduler';

// Main Manager
import { JobManager, type JobManagerConfig } from './JobManager';
export { JobManager, type JobManagerConfig };

// Factory function for easy setup
export function createJobManager(
  prisma: any,
  scraperManager: any,
  aiManager: any,
  config?: any
) {
  return new JobManager(prisma, scraperManager, aiManager, config);
}

// Convenience functions for common operations
export async function startJobSystem(
  prisma: any,
  scraperManager: any,
  aiManager: any,
  config?: any
) {
  const jobManager = createJobManager(prisma, scraperManager, aiManager, config);
  await jobManager.start();
  return jobManager;
}

// Predefined configurations for different environments
export const JobConfigurations = {
  development: {
    autoStart: true,
    enableMetrics: true,
    scraping: {
      worker: {
        concurrency: 2,
        retryAttempts: 2,
        timeout: 120000, // 2 minutes
      },
    },
    ai: {
      worker: {
        concurrency: 3,
        retryAttempts: 1,
        timeout: 90000, // 1.5 minutes
      },
    },
    scheduler: {
      enabled: true,
      checkInterval: 30000, // 30 seconds for development
    },
  },

  production: {
    autoStart: true,
    enableMetrics: true,
    scraping: {
      queue: {
        maxSize: 2000,
        enableMetrics: true,
        cleanupInterval: 600000, // 10 minutes
      },
      worker: {
        concurrency: 5,
        retryAttempts: 3,
        timeout: 300000, // 5 minutes
      },
    },
    ai: {
      queue: {
        maxSize: 5000,
        enableMetrics: true,
        cleanupInterval: 300000, // 5 minutes
      },
      worker: {
        concurrency: 10,
        retryAttempts: 2,
        timeout: 180000, // 3 minutes
      },
    },
    scheduler: {
      enabled: true,
      checkInterval: 60000, // 1 minute
      timezone: 'Europe/Madrid',
    },
  },

  testing: {
    autoStart: false,
    enableMetrics: false,
    scraping: {
      worker: {
        concurrency: 1,
        retryAttempts: 1,
        timeout: 30000, // 30 seconds
      },
    },
    ai: {
      worker: {
        concurrency: 1,
        retryAttempts: 1,
        timeout: 30000,
      },
    },
    scheduler: {
      enabled: false,
    },
  },
} as const;

// Helper to get configuration by environment
export function getJobConfig(env: 'development' | 'production' | 'testing' = 'development') {
  return JobConfigurations[env];
}

// Queue management utilities
export class JobQueueUtils {
  static calculateOptimalConcurrency(
    availableMemory: number,
    cpuCores: number,
    jobType: 'scraping' | 'ai'
  ): number {
    // Simple heuristic for calculating optimal concurrency
    const baseMultiplier = jobType === 'ai' ? 2 : 1; // AI jobs can be more concurrent
    const memoryFactor = Math.min(Math.floor(availableMemory / 512), 10); // 512MB per job
    const cpuFactor = cpuCores * baseMultiplier;

    return Math.max(1, Math.min(memoryFactor, cpuFactor));
  }

  static calculateRetryDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  static isJobRetryable(error: any): boolean {
    if (!error) return false;

    // Check error codes that are typically not retryable
    const nonRetryableCodes = [
      'VALIDATION_ERROR',
      'AUTHENTICATION_FAILED',
      'RESOURCE_NOT_FOUND',
      'PERMISSION_DENIED',
      'INVALID_CONFIGURATION',
    ];

    if (error.code && nonRetryableCodes.includes(error.code)) {
      return false;
    }

    // Check error messages for retryable patterns
    if (error.message) {
      const message = error.message.toLowerCase();
      const retryablePatterns = [
        'timeout',
        'rate limit',
        'service unavailable',
        'temporary',
        'connection',
        'network',
      ];

      return retryablePatterns.some(pattern => message.includes(pattern));
    }

    return true; // Default to retryable
  }
}

// Monitoring and metrics utilities
export class JobMetricsUtils {
  static calculateSuccessRate(completed: number, failed: number): number {
    const total = completed + failed;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  static calculateThroughput(jobsCompleted: number, timeWindowMs: number): number {
    const timeWindowMinutes = timeWindowMs / (1000 * 60);
    return timeWindowMinutes > 0 ? Math.round(jobsCompleted / timeWindowMinutes) : 0;
  }

  static formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${Math.round(durationMs / 1000)}s`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.round((durationMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  static getHealthStatus(errorRate: number, queueSize: number, maxQueueSize: number): 'healthy' | 'warning' | 'critical' {
    if (errorRate > 50 || queueSize > maxQueueSize * 0.9) {
      return 'critical';
    } else if (errorRate > 20 || queueSize > maxQueueSize * 0.7) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }
}

// Job data validation utilities
export class JobValidationUtils {
  static validateScrapingJobData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.sourceId) {
      errors.push('sourceId is required');
    }

    if (!data.sourceName) {
      errors.push('sourceName is required');
    }

    if (data.maxResults && (typeof data.maxResults !== 'number' || data.maxResults < 1 || data.maxResults > 1000)) {
      errors.push('maxResults must be a number between 1 and 1000');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateAIJobData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.leadId) {
      errors.push('leadId is required');
    }

    const validOperations = ['ANALYZE', 'SCORE', 'GENERATE_PITCH', 'ENRICH', 'CLASSIFY', 'VALIDATE'];
    if (!data.operation || !validOperations.includes(data.operation)) {
      errors.push(`operation must be one of: ${validOperations.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Error classes for better error handling
export class JobSystemError extends Error {
  constructor(
    message: string,
    public readonly component: string,
    public readonly code?: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'JobSystemError';
  }
}

export class QueueOverflowError extends JobSystemError {
  constructor(queueName: string, currentSize: number, maxSize: number) {
    super(
      `Queue ${queueName} overflow: ${currentSize}/${maxSize}`,
      'queue',
      'QUEUE_OVERFLOW',
      true
    );
  }
}

export class WorkerUnavailableError extends JobSystemError {
  constructor(workerType: string) {
    super(
      `Worker ${workerType} is not available`,
      'worker',
      'WORKER_UNAVAILABLE',
      true
    );
  }
}

// Constants for external use
export const JOB_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 5,
  DEFAULT_TIMEOUT: 300000, // 5 minutes
  DEFAULT_SCRAPING_CONCURRENCY: 3,
  DEFAULT_AI_CONCURRENCY: 5,
  DEFAULT_QUEUE_SIZE: 1000,
  CLEANUP_INTERVAL: 600000, // 10 minutes
  METRICS_INTERVAL: 60000, // 1 minute
  SCHEDULER_INTERVAL: 60000, // 1 minute
} as const;

// Version and build info
export const VERSION = '1.0.0';
export const BUILD_INFO = {
  version: VERSION,
  features: [
    'In-memory job queues (BullMQ-compatible)',
    'Concurrent workers with configurable limits',
    'Automatic retry with exponential backoff',
    'Job scheduling with cron-like expressions',
    'Comprehensive metrics and monitoring',
    'Health checks and diagnostics',
    'Bulk job processing',
    'Event-driven architecture',
    'Database integration with Prisma',
    'AI-powered lead processing',
  ],
  compatibility: {
    node: '>=16.0.0',
    prisma: '>=5.0.0',
    typescript: '>=4.5.0',
  },
};

// Export default object for easier imports
export default {
  JobManager,
  createJobManager,
  startJobSystem,
  getJobConfig,
  JobQueueUtils,
  JobMetricsUtils,
  JobValidationUtils,
  VERSION,
  BUILD_INFO,
  JOB_CONSTANTS,
};