// lib/plan-limits/types.ts

export interface PlanLimits {
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxFeaturedOffers: number;
  maxStorage: number;
}

export interface CompanyUsage {
  activeOffers: number;
  teamMembers: number;
  featuredOffers: number;
  storage: number;
}

export interface LimitValidationError {
  limitType: string;
  current: number;
  limit: number;
  message: string;
}