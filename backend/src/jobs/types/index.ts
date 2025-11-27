// Tipos locales para reemplazar imports de Prisma que no existen
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'RETRYING';
export type AIOperation = 'ANALYZE' | 'SCORE' | 'GENERATE_PITCH' | 'ENRICH' | 'CLASSIFY' | 'VALIDATE';
export type ScheduleFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
export type AIProviderType = 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'AZURE' | 'CUSTOM';

export interface JobData {
  id: string;
  type: JobType;
  payload: any;
  createdAt: Date;
  priority?: number;
}

export type JobType =
  | 'SCRAPING'
  | 'AI_ANALYSIS'
  | 'AI_SCORING'
  | 'AI_PITCH_GENERATION'
  | 'LEAD_ENRICHMENT'
  | 'BULK_IMPORT';

export interface ScrapingJobData {
  sourceId: string;
  sourceName: string;
  config: any;
  maxResults?: number;
  location?: string;
  industry?: string;
  keywords?: string[];
}

export interface AIProcessingJobData {
  leadId: string;
  operation: AIOperation;
  providerId?: string;
  options?: any;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  processedAt: Date;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export type JobEvent =
  | 'created'
  | 'started'
  | 'progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface JobEventData {
  jobId: string;
  event: JobEvent;
  data?: any;
  timestamp: Date;
}

export type JobListener = (event: JobEventData) => void | Promise<void>;

export interface WorkerConfig {
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

export interface SchedulerConfig {
  checkInterval: number;
  enabled: boolean;
  timezone: string;
}

export interface BulkJobConfig {
  batchSize: number;
  priority: number;
  maxRetries: number;
  onProgress?: (completed: number, total: number) => void;
  onComplete?: (results: JobResult[]) => void;
  onError?: (error: Error, job: JobData) => void;
}

export interface LeadEnrichmentJobData {
  leadId: string;
  enrichmentType: 'EMAIL' | 'PHONE' | 'SOCIAL' | 'COMPANY_INFO' | 'FULL';
  providerId?: string;
  validateData?: boolean;
}

export interface BulkImportJobData {
  userId: string;
  fileName: string;
  fileContent: any[];
  mapping: Record<string, string>;
  validateBeforeImport: boolean;
  skipDuplicates: boolean;
}

export interface JobProgress {
  jobId: string;
  percentage: number;
  message: string;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  estimatedTimeRemaining?: number;
  data?: any;
}

export interface JobMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  throughput: number; // jobs per minute
  errorRate: number;
  lastProcessedAt?: Date;
  peakConcurrency: number;
  queueLatency: number; // time in queue before processing
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
}

export interface JobDependency {
  jobId: string;
  dependsOn: string[];
  condition: 'ALL' | 'ANY' | 'NONE';
}

export interface ScheduledJob {
  id: string;
  name: string;
  cron: string;
  jobType: JobType;
  payload: any;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  timezone: string;
  retryConfig?: RetryConfig;
}

export interface QueueConfig {
  maxSize: number;
  defaultPriority: number;
  enableMetrics: boolean;
  cleanupInterval: number;
  maxAge: number; // max age in milliseconds for completed jobs
}

export const JOB_PRIORITIES = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 8,
  URGENT: 10,
  CRITICAL: 15
} as const;

export const JOB_STATUSES = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRYING: 'RETRYING'
} as const;

export const AI_OPERATIONS = {
  ANALYZE: 'ANALYZE',
  SCORE: 'SCORE',
  GENERATE_PITCH: 'GENERATE_PITCH',
  ENRICH: 'ENRICH',
  CLASSIFY: 'CLASSIFY',
  VALIDATE: 'VALIDATE'
} as const;

export const SCRAPING_SOURCES = {
  GOOGLE_MAPS: 'GOOGLE_MAPS',
  WEB_SCRAPING: 'WEB_SCRAPING',
  LINKEDIN: 'LINKEDIN',
  FACEBOOK: 'FACEBOOK',
  MANUAL: 'MANUAL'
} as const;

export const JOB_EVENTS = {
  CREATED: 'created',
  QUEUED: 'queued',
  STARTED: 'started',
  PROGRESS: 'progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying',
  DELAYED: 'delayed'
} as const;

export interface ErrorWithRetry extends Error {
  retryable: boolean;
  retryAfter?: number;
  metadata?: any;
}

export class JobError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly metadata?: any
  ) {
    super(message);
    this.name = 'JobError';
  }
}

export class QueueFullError extends JobError {
  constructor(queueName: string, maxSize: number) {
    super(
      `Queue ${queueName} is full (max: ${maxSize})`,
      'QUEUE_FULL',
      true,
      { queueName, maxSize }
    );
  }
}

export class WorkerTimeoutError extends JobError {
  constructor(jobId: string, timeout: number) {
    super(
      `Job ${jobId} timed out after ${timeout}ms`,
      'WORKER_TIMEOUT',
      true,
      { jobId, timeout }
    );
  }
}

export class DependencyFailedError extends JobError {
  constructor(jobId: string, failedDependency: string) {
    super(
      `Job ${jobId} cancelled due to failed dependency: ${failedDependency}`,
      'DEPENDENCY_FAILED',
      false,
      { jobId, failedDependency }
    );
  }
}