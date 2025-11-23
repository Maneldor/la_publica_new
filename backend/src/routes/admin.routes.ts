import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';
import { PermissionType } from '@prisma/client';
import { cache, cacheList, cacheUser, invalidateCache } from '../middleware/cache.middleware';
import dashboardRoutes from './admin/dashboard.routes';
import settingsRoutes from './admin/settings.routes';

const router = Router();
const adminController = new AdminController();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ========== RUTAS DE GESTIÓN DE USUARIOS ==========

// Crear usuario (solo ADMIN y SUPER_ADMIN)
router.post('/users',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.createUser
);

// Obtener todos los usuarios
router.get('/users',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.getAllUsers
);

// Obtener estadísticas de usuarios
router.get('/users/stats',
  requirePermission(PermissionType.VIEW_ADMIN_DASHBOARD),
  adminController.getUserStats
);

// Obtener usuario por ID
router.get('/users/:userId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.getUserById
);

// Actualizar usuario
router.put('/users/:userId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.updateUser
);

// Eliminar usuario
router.delete('/users/:userId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.deleteUser
);

// Activar/Desactivar usuario
router.patch('/users/:userId/toggle-status',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.toggleUserStatus
);

// ========== RUTAS DE GESTIÓN DE ROLES Y PERMISOS ==========

// Obtener roles y permisos de usuario
router.get('/users/:userId/roles-permissions',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.getUserRolesAndPermissions
);

// Asignar rol a usuario
router.post('/users/:userId/roles',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.assignRole
);

// Remover rol de usuario
router.delete('/users/:userId/roles',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.removeRole
);

// Asignar permiso específico a usuario
router.post('/users/:userId/permissions',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.assignPermission
);

// Remover permiso específico
router.delete('/users/:userId/permissions',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.removePermission
);

// Actualizar capacidades de roles de empleado
router.patch('/users/:userId/employee-capabilities',
  requirePermission(PermissionType.MANAGE_ROLES),
  adminController.updateEmployeeRoleCapabilities
);

// ========== RUTAS DE GESTIÓN DE CAMPOS PERSONALIZADOS ==========

// Crear campo personalizado (solo ADMIN y SUPER_ADMIN)
router.post('/custom-fields',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.createCustomField
);

// Obtener todos los campos personalizados
router.get('/custom-fields',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.getAllCustomFields
);

// Obtener estadísticas de campos personalizados
router.get('/custom-fields/stats',
  requirePermission(PermissionType.VIEW_ADMIN_DASHBOARD),
  adminController.getCustomFieldStats
);

// Obtener campos por tipo de usuario
router.get('/custom-fields/user-type/:userType',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.getCustomFieldsByUserType
);

// Obtener campo personalizado por ID
router.get('/custom-fields/:fieldId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.getCustomFieldById
);

// Actualizar campo personalizado
router.put('/custom-fields/:fieldId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.updateCustomField
);

// Eliminar campo personalizado
router.delete('/custom-fields/:fieldId',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.deleteCustomField
);

// Activar/Desactivar campo personalizado
router.patch('/custom-fields/:fieldId/toggle-status',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.toggleCustomFieldStatus
);

// Reordenar campos personalizados
router.patch('/custom-fields/user-type/:userType/reorder',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.reorderCustomFields
);

// Validar valor de campo personalizado
router.post('/custom-fields/:fieldId/validate',
  requirePermission(PermissionType.MANAGE_USERS),
  adminController.validateCustomFieldValue
);

// ========== SUBRUTAS ADMIN ==========
// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Settings routes (Lead Generation)
router.use('/settings', settingsRoutes);

export default router;