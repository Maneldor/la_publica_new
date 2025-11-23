import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const SettingsSchema = z.object({
  lead_generation: z.object({
    auto_approve_threshold: z.number().min(0).max(100).optional(),
    auto_reject_threshold: z.number().min(0).max(100).optional(),
    max_daily_leads: z.number().min(1).optional(),
    enable_ai_processing: z.boolean().optional(),
  }).optional(),
  ai: z.object({
    default_provider: z.string().optional(),
    max_retries: z.number().min(0).max(10).optional(),
    timeout_seconds: z.number().min(5).max(300).optional(),
    cost_alert_threshold: z.number().min(0).optional(),
  }).optional(),
  scraping: z.object({
    default_frequency: z.enum(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    max_concurrent_jobs: z.number().min(1).max(20).optional(),
    retry_failed_jobs: z.boolean().optional(),
    cleanup_after_days: z.number().min(1).optional(),
  }).optional(),
  notifications: z.object({
    email_on_new_leads: z.boolean().optional(),
    email_on_job_failure: z.boolean().optional(),
    daily_summary: z.boolean().optional(),
    weekly_report: z.boolean().optional(),
  }).optional(),
});

export const validateSettings = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    SettingsSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};