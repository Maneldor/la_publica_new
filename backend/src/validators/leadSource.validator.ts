import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const LeadSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['GOOGLE_MAPS', 'WEB_SCRAPING', 'API', 'CSV_IMPORT', 'MANUAL']),
  config: z.object({
    // Google Maps
    query: z.string().optional(),
    location: z.string().optional(),
    radius: z.number().optional(),

    // Web Scraping
    url: z.string().optional(),
    selectors: z.object({}).passthrough().optional(),

    // API
    endpoint: z.string().optional(),
    headers: z.object({}).passthrough().optional(),

    // CSV
    filePath: z.string().optional(),
    fileUrl: z.string().optional(),
    mapping: z.object({}).passthrough().optional(),
  }).passthrough(),
  aiProviderId: z.string().optional(),
  aiTasks: z.object({
    analyze: z.boolean().optional(),
    score: z.boolean().optional(),
    generatePitch: z.boolean().optional(),
    enrich: z.boolean().optional(),
    classify: z.boolean().optional(),
    validate: z.boolean().optional(),
  }).optional(),
  frequency: z.enum(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  isActive: z.boolean().optional(),
});

const LeadSourceUpdateSchema = LeadSourceSchema.partial();

export const validateLeadSource = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    LeadSourceSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};

export const validateLeadSourceUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    LeadSourceUpdateSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};