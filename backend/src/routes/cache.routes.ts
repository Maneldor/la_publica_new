import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cache.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';
import { PermissionType } from '@prisma/client';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * Obtener información del estado del caché
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.get('/info',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const info = await cacheService.info();
      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      console.error('Error obteniendo info de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información del caché'
      });
    }
  }
);

/**
 * Obtener todas las claves de caché con un patrón
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.get('/keys',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const { pattern = '*' } = req.query;
      const keys = await cacheService.keys(pattern as string);

      res.json({
        success: true,
        data: {
          pattern,
          count: keys.length,
          keys: keys.slice(0, 100) // Limitar a 100 para evitar sobrecarga
        }
      });
    } catch (error) {
      console.error('Error obteniendo keys de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo claves del caché'
      });
    }
  }
);

/**
 * Obtener valor específico del caché
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.get('/get/:key',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const value = await cacheService.get(key);

      if (value === null) {
        return res.status(404).json({
          success: false,
          message: 'Clave no encontrada en el caché'
        });
      }

      res.json({
        success: true,
        data: {
          key,
          value,
          ttl: await cacheService.ttl(key)
        }
      });
    } catch (error) {
      console.error('Error obteniendo valor de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo valor del caché'
      });
    }
  }
);

/**
 * Eliminar una clave específica del caché
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.delete('/delete/:key',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const deleted = await cacheService.del(key);

      res.json({
        success: true,
        data: {
          key,
          deleted
        }
      });
    } catch (error) {
      console.error('Error eliminando clave de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando clave del caché'
      });
    }
  }
);

/**
 * Eliminar múltiples claves por patrón
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.delete('/pattern/:pattern',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const { pattern } = req.params;
      const deletedCount = await cacheService.delPattern(pattern);

      res.json({
        success: true,
        data: {
          pattern,
          deletedCount
        }
      });
    } catch (error) {
      console.error('Error eliminando patrón de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando patrón del caché'
      });
    }
  }
);

/**
 * Limpiar todo el caché
 * Solo accesible para SUPER_ADMIN (muy peligroso)
 */
router.delete('/flush',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      // Verificar que el usuario sea SUPER_ADMIN
      const user = (req as any).user;
      if (user.primaryRole !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Solo SUPER_ADMIN puede limpiar todo el caché'
        });
      }

      const flushed = await cacheService.flush();

      res.json({
        success: true,
        data: {
          flushed,
          message: 'Caché completamente limpiado'
        }
      });
    } catch (error) {
      console.error('Error limpiando caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error limpiando el caché'
      });
    }
  }
);

/**
 * Estadísticas del caché
 * Solo accesible para ADMIN y SUPER_ADMIN
 */
router.get('/stats',
  requirePermission(PermissionType.MANAGE_SYSTEM_CONFIG),
  async (req: Request, res: Response) => {
    try {
      const [
        allKeys,
        contentKeys,
        groupKeys,
        companyKeys
      ] = await Promise.all([
        cacheService.keys('*'),
        cacheService.keys('content:*'),
        cacheService.keys('groups:*'),
        cacheService.keys('companies:*')
      ]);

      const stats = {
        total: allKeys.length,
        byCategory: {
          content: contentKeys.length,
          groups: groupKeys.length,
          companies: companyKeys.length,
          other: allKeys.length - contentKeys.length - groupKeys.length - companyKeys.length
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de caché:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas del caché'
      });
    }
  }
);

export default router;