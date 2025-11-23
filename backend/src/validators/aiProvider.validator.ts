import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const AIProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  type: z.enum(['CLAUDE', 'OPENAI', 'GEMINI', 'AZURE_OPENAI', 'COHERE', 'CUSTOM']),
  config: z.object({
    apiKey: z.string().optional(),
    model: z.string().optional(),
    endpoint: z.string().optional(),
    deployment: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }).passthrough(), // Permet camps addicionals
  capabilities: z.object({
    leadAnalysis: z.boolean().optional(),
    scoring: z.boolean().optional(),
    pitchGeneration: z.boolean().optional(),
    dataEnrichment: z.boolean().optional(),
    classification: z.boolean().optional(),
    validation: z.boolean().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const AIProviderUpdateSchema = AIProviderSchema.partial();

export const validateAIProvider = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    AIProviderSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};

export const validateAIProviderUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    AIProviderUpdateSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};