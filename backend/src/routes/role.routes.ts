import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import {
  requireRole,
  requirePermission,
  requireAllPermissions
} from '../middleware/permissions.middleware';
import { UserRole, PermissionType } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();
const roleController = new RoleController();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para obtener información de roles y permisos (disponible para admins)
router.get(
  '/info',
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  cacheMiddleware(600),
  roleController.getRolesAndPermissions
);

// Obtener todos los usuarios con roles (solo super admin y admin)
router.get(
  '/users',
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  cacheMiddleware(600),
  roleController.getAllUsersWithRoles
);

// Obtener usuario específico con roles
router.get(
  '/users/:userId',
  requirePermission(PermissionType.MANAGE_USERS),
  cacheMiddleware(600),
  roleController.getUserWithRoles
);

// Verificar roles de usuario
router.get(
  '/users/:userId/roles',
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  roleController.checkUserRoles
);

// Verificar permisos de usuario
router.get(
  '/users/:userId/permissions',
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  roleController.checkUserPermissions
);

// Asignar rol a usuario
router.post(
  '/assign',
  requireAllPermissions([PermissionType.MANAGE_USERS, PermissionType.MANAGE_ROLES]),
  invalidateCacheMiddleware('GET:/api/v1/roles*'),
  roleController.assignRole
);

// Remover rol de usuario
router.delete(
  '/remove',
  requireAllPermissions([PermissionType.MANAGE_USERS, PermissionType.MANAGE_ROLES]),
  invalidateCacheMiddleware('GET:/api/v1/roles*'),
  roleController.removeRole
);

// Asignar permiso específico
router.post(
  '/permissions/assign',
  requirePermission(PermissionType.MANAGE_PERMISSIONS),
  roleController.assignPermission
);

// Remover permiso específico
router.delete(
  '/permissions/remove',
  requirePermission(PermissionType.MANAGE_PERMISSIONS),
  roleController.removePermission
);

// Actualizar capacidades de empleado
router.patch(
  '/employees/:userId/capabilities',
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  roleController.updateEmployeeRoleCapabilities
);

// Asignación masiva de roles (solo super admin)
router.post(
  '/bulk-assign',
  requireRole(UserRole.SUPER_ADMIN),
  roleController.bulkAssignRoles
);

export default router;