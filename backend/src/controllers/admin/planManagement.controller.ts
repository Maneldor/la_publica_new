// ============================================================================
// CONTROLADOR DE GESTIÓN DE PLANES - ADMIN - LA PÚBLICA
// ============================================================================

import { Request, Response } from 'express';
import { planManagementService } from '../../services/admin/planManagement.service';
import { planLimitsService } from '../../services/planLimits.service';
import { PlanType } from '../../config/planLimits';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

// ============================================================================
// CONTROLADORES
// ============================================================================

/**
 * GET /api/admin/companies/:id/limits
 * Obtiene los límites actuales de una empresa
 */
export async function getCompanyLimits(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    const limits = await planLimitsService.getCompanyLimits(companyId);

    if (!limits) {
      return res.status(404).json({
        error: 'COMPANY_NOT_FOUND',
        message: 'Empresa no trobada o sense subscripció'
      });
    }

    res.json({
      success: true,
      limits: {
        companyId: limits.companyId,
        planType: limits.planType,
        subscription: limits.subscription,
        limits: limits.limits,
        features: limits.features,
        storage: limits.storage,
        usage: limits.usage,
        percentages: limits.percentages
      }
    });

  } catch (error) {
    console.error('Error obtenint límits de l\'empresa:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * PUT /api/admin/companies/:id/limits
 * Actualiza un límite específico de una empresa
 */
export async function updateCustomLimit(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const { limitPath, value, notes } = req.body;
    const adminId = authReq.user.id;

    // Validaciones
    if (!companyId || !limitPath || value === undefined) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Tots els camps són obligatoris: limitPath, value'
      });
    }

    if (typeof limitPath !== 'string') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'limitPath ha de ser una cadena de text'
      });
    }

    const result = await planManagementService.updateCustomLimit(
      companyId,
      limitPath,
      value,
      adminId,
      notes
    );

    res.json({
      success: true,
      message: `Límit personalitzat actualitzat correctament: ${limitPath}`,
      customFeature: result.data
    });

  } catch (error) {
    console.error('Error actualitzant límit personalitzat:', error);

    if (error instanceof Error) {
      if (error.message.includes('Només el pla EMPRESARIAL')) {
        return res.status(403).json({
          error: 'PLAN_NOT_ALLOWED',
          message: error.message
        });
      }

      if (error.message.includes('no trobada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * POST /api/admin/companies/:id/enable-custom
 * Habilita la customización para una empresa con plan EMPRESARIAL
 */
export async function enableCustomization(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.user.id;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    const result = await planManagementService.enableCustomization(companyId, adminId);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error habilitant personalització:', error);

    if (error instanceof Error) {
      if (error.message.includes('Només el pla EMPRESARIAL')) {
        return res.status(403).json({
          error: 'PLAN_NOT_ALLOWED',
          message: error.message
        });
      }

      if (error.message.includes('no trobada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * POST /api/admin/companies/:id/change-plan
 * Cambia el plan de una empresa
 */
export async function changePlan(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const { newPlan, reason } = req.body;
    const adminId = authReq.user.id;

    // Validaciones
    if (!companyId || !newPlan) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'ID d\'empresa i nou pla són obligatoris'
      });
    }

    const validPlans = ['BASIC', 'STANDARD', 'PREMIUM', 'EMPRESARIAL'];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Pla no vàlid. Plans disponibles: ${validPlans.join(', ')}`
      });
    }

    const result = await planManagementService.changePlan(
      companyId,
      newPlan as PlanType,
      adminId,
      reason
    );

    res.json({
      success: true,
      message: result.message,
      subscription: result.data
    });

  } catch (error) {
    console.error('Error canviant pla:', error);

    if (error instanceof Error) {
      if (error.message.includes('no trobada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * GET /api/admin/companies/:id/customizations
 * Obtiene las customizaciones de una empresa
 */
export async function getCustomizations(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    const customizations = await planManagementService.getCustomizations(companyId);

    res.json({
      success: true,
      customizations
    });

  } catch (error) {
    console.error('Error obtenint personalitzacions:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * GET /api/admin/companies/:id/plan-history
 * Obtiene el historial de cambios de plan de una empresa
 */
export async function getPlanHistory(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    const history = await planManagementService.getPlanHistory(companyId);

    res.json({
      success: true,
      history,
      total: history.length
    });

  } catch (error) {
    console.error('Error obtenint historial de plans:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * POST /api/admin/companies/:id/reset-custom
 * Resetea las customizaciones de una empresa a valores base EMPRESARIAL
 */
export async function resetCustomization(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const { reason } = req.body;
    const adminId = authReq.user.id;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    const result = await planManagementService.resetCustomization(companyId, adminId, reason);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error resetejant personalització:', error);

    if (error instanceof Error) {
      if (error.message.includes('Només el pla EMPRESARIAL')) {
        return res.status(403).json({
          error: 'PLAN_NOT_ALLOWED',
          message: error.message
        });
      }

      if (error.message.includes('no trobada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * GET /api/admin/plan-templates
 * Obtiene las plantillas predefinidas disponibles
 */
export async function getTemplates(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const templates = await planManagementService.getTemplates();

    res.json({
      success: true,
      templates: templates.map((template: any) => ({
        key: template.id || template.key,
        name: template.name,
        description: template.description,
        targetType: template.targetType || 'company'
      })),
      total: templates.length
    });

  } catch (error) {
    console.error('Error obtenint plantilles:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * POST /api/admin/companies/:id/apply-template
 * Aplica una plantilla predefinida a una empresa
 */
export async function applyTemplate(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const { templateKey } = req.body;
    const adminId = authReq.user.id;

    // Validaciones
    if (!companyId || !templateKey) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'ID d\'empresa i clau de plantilla són obligatoris'
      });
    }

    if (typeof templateKey !== 'string') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'La clau de plantilla ha de ser una cadena de text'
      });
    }

    const result = await planManagementService.applyTemplate(companyId, templateKey, adminId);

    res.json({
      success: true,
      message: `Plantilla '${templateKey}' aplicada correctament`,
      appliedFeatures: result.appliedFeatures
    });

  } catch (error) {
    console.error('Error aplicant plantilla:', error);

    if (error instanceof Error) {
      if (error.message.includes('Plantilla no trobada')) {
        return res.status(404).json({
          error: 'TEMPLATE_NOT_FOUND',
          message: error.message
        });
      }

      if (error.message.includes('Només el pla EMPRESARIAL')) {
        return res.status(403).json({
          error: 'PLAN_NOT_ALLOWED',
          message: error.message
        });
      }

      if (error.message.includes('no trobada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}

/**
 * GET /api/admin/companies/:id/detailed-info
 * Obtiene información completa de una empresa para administradores
 */
export async function getDetailedCompanyInfo(req: Request, res: Response) {
  try {
    const { id: companyId } = req.params;
    const authReq = req as AuthenticatedRequest;

    if (!companyId) {
      return res.status(400).json({
        error: 'MISSING_COMPANY_ID',
        message: 'ID d\'empresa requerit'
      });
    }

    // Obtener información de límites y customizaciones en paralelo
    const [limits, customizations, history] = await Promise.all([
      planLimitsService.getCompanyLimits(companyId),
      planManagementService.getCustomizations(companyId),
      planManagementService.getPlanHistory(companyId)
    ]);

    if (!limits) {
      return res.status(404).json({
        error: 'COMPANY_NOT_FOUND',
        message: 'Empresa no trobada o sense subscripció'
      });
    }

    res.json({
      success: true,
      company: {
        id: companyId,
        limits,
        customizations,
        history: history.slice(0, 10), // Últimos 10 cambios
        analytics: {
          totalCustomizations: customizations.length,
          totalPlanChanges: history.length,
          lastPlanChange: history[0] || null,
          isNearingLimits: Object.values(limits.percentages).some((p: any) => p > 80)
        }
      }
    });

  } catch (error) {
    console.error('Error obtenint informació detallada de l\'empresa:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
}