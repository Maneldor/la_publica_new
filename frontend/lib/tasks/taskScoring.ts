import { TaskPriority, TaskStatus } from '@prisma/client';

interface TaskScoringInput {
  priority: TaskPriority;
  dueDate?: Date | null;
  status: TaskStatus;
  estimatedMinutes?: number | null;
  leadId?: string | null;
  companyId?: string | null;
}

/**
 * Calcula el score de urgencia de una tarea (0-100)
 * Factores: prioridad, fecha límite, estado
 */
export function calculateUrgencyScore(input: TaskScoringInput): number {
  let score = 0;

  // 1. PRIORIDAD (0-40 puntos)
  switch (input.priority) {
    case 'URGENT':
      score += 40;
      break;
    case 'HIGH':
      score += 30;
      break;
    case 'MEDIUM':
      score += 15;
      break;
    case 'LOW':
      score += 5;
      break;
  }

  // 2. PROXIMIDAD DE FECHA LÍMITE (0-40 puntos)
  if (input.dueDate) {
    const now = new Date();
    const dueDate = new Date(input.dueDate);
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      // Atrasada
      score += 40;
    } else if (daysUntilDue === 0) {
      // Hoy
      score += 35;
    } else if (daysUntilDue === 1) {
      // Mañana
      score += 30;
    } else if (daysUntilDue <= 3) {
      // Próximos 3 días
      score += 25;
    } else if (daysUntilDue <= 7) {
      // Esta semana
      score += 15;
    } else if (daysUntilDue <= 30) {
      // Este mes
      score += 5;
    }
  }

  // 3. ESTADO (0-20 puntos bonus)
  if (input.status === 'IN_PROGRESS') {
    score += 10; // En progreso = mantener momentum
  }

  return Math.min(score, 100);
}

/**
 * Calcula el score de impacto de una tarea (0-100)
 * Factores: relación con entidades importantes, tipo de tarea
 */
export function calculateImpactScore(input: TaskScoringInput): number {
  let score = 50; // Base score

  // 1. RELACIÓN CON ENTIDADES (0-30 puntos)
  if (input.companyId) {
    score += 20; // Relacionada con empresa = más impacto
  }
  if (input.leadId) {
    score += 10; // Relacionada con lead
  }

  // 2. PRIORIDAD COMO INDICADOR DE IMPACTO (0-20 puntos)
  switch (input.priority) {
    case 'URGENT':
      score += 20;
      break;
    case 'HIGH':
      score += 15;
      break;
    case 'MEDIUM':
      score += 7;
      break;
    case 'LOW':
      score += 0;
      break;
  }

  return Math.min(score, 100);
}

/**
 * Calcula el score de esfuerzo de una tarea (0-100)
 * Menor número = menos esfuerzo (más fácil de completar)
 */
export function calculateEffortScore(input: TaskScoringInput): number {
  let score = 30; // Base score (asumir esfuerzo medio-bajo)

  // 1. TIEMPO ESTIMADO (0-70 puntos)
  if (input.estimatedMinutes) {
    if (input.estimatedMinutes <= 15) {
      score += 10; // Tarea rápida
    } else if (input.estimatedMinutes <= 30) {
      score += 20;
    } else if (input.estimatedMinutes <= 60) {
      score += 35;
    } else if (input.estimatedMinutes <= 120) {
      score += 50;
    } else {
      score += 70; // Tarea larga
    }
  } else {
    // Sin estimación = asumir esfuerzo medio
    score += 30;
  }

  return Math.min(score, 100);
}

/**
 * Calcula el score automático total
 * Formula: (Urgencia * 0.4) + (Impacto * 0.4) - (Esfuerzo * 0.2)
 * El objetivo es priorizar tareas urgentes, de alto impacto y bajo esfuerzo
 */
export function calculateAutoScore(input: TaskScoringInput): number {
  const urgency = calculateUrgencyScore(input);
  const impact = calculateImpactScore(input);
  const effort = calculateEffortScore(input);

  // Formula ponderada
  const autoScore = (urgency * 0.4) + (impact * 0.4) - (effort * 0.2);

  return Math.round(Math.max(0, Math.min(autoScore, 100)));
}

/**
 * Recalcula todos los scores de una tarea
 */
export function recalculateTaskScores(input: TaskScoringInput) {
  return {
    urgencyScore: calculateUrgencyScore(input),
    impactScore: calculateImpactScore(input),
    effortScore: calculateEffortScore(input),
    autoScore: calculateAutoScore(input),
  };
}