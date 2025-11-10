// ============================================================================
// RUTAS ADMIN - GESTIÓN DE PLANES - LA PÚBLICA
// ============================================================================

import { Router } from 'express';
import * as controller from '../../controllers/admin/planManagement.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================================
// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// ============================================================================
// RUTAS DE GESTIÓN DE LÍMITES
// ============================================================================

/**
 * GET /api/admin/plans/companies/:id/limits
 * Obtiene los límites actuales de una empresa
 */
router.get('/companies/:id/limits',
  requireRole('ADMIN'),
  controller.getCompanyLimits
);

/**
 * PUT /api/admin/plans/companies/:id/limits
 * Actualiza un límite específico de una empresa
 */
router.put('/companies/:id/limits',
  requireRole('ADMIN'),
  controller.updateCustomLimit
);

/**
 * GET /api/admin/plans/companies/:id/detailed-info
 * Obtiene información completa de una empresa para administradores
 */
router.get('/companies/:id/detailed-info',
  requireRole('ADMIN'),
  controller.getDetailedCompanyInfo
);

// ============================================================================
// RUTAS DE GESTIÓN DE PLANES
// ============================================================================

/**
 * POST /api/admin/plans/companies/:id/change-plan
 * Cambia el plan de una empresa
 */
router.post('/companies/:id/change-plan',
  requireRole('ADMIN'),
  controller.changePlan
);

/**
 * GET /api/admin/plans/companies/:id/plan-history
 * Obtiene el historial de cambios de plan de una empresa
 */
router.get('/companies/:id/plan-history',
  requireRole('ADMIN'),
  controller.getPlanHistory
);

// ============================================================================
// RUTAS DE CUSTOMIZACIÓN (PLAN EMPRESARIAL)
// ============================================================================

/**
 * POST /api/admin/plans/companies/:id/enable-custom
 * Habilita la customización para una empresa con plan EMPRESARIAL
 */
router.post('/companies/:id/enable-custom',
  requireRole('ADMIN'),
  controller.enableCustomization
);

/**
 * GET /api/admin/plans/companies/:id/customizations
 * Obtiene las customizaciones de una empresa
 */
router.get('/companies/:id/customizations',
  requireRole('ADMIN'),
  controller.getCustomizations
);

/**
 * POST /api/admin/plans/companies/:id/reset-custom
 * Resetea las customizaciones de una empresa a valores base EMPRESARIAL
 */
router.post('/companies/:id/reset-custom',
  requireRole('ADMIN'),
  controller.resetCustomization
);

// ============================================================================
// RUTAS DE PLANTILLAS
// ============================================================================

/**
 * GET /api/admin/plans/templates
 * Obtiene las plantillas predefinidas disponibles
 */
router.get('/templates',
  requireRole('ADMIN'),
  controller.getTemplates
);

/**
 * POST /api/admin/plans/companies/:id/apply-template
 * Aplica una plantilla predefinida a una empresa
 */
router.post('/companies/:id/apply-template',
  requireRole('ADMIN'),
  controller.applyTemplate
);

export default router;