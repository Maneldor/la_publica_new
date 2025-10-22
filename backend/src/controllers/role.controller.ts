import { Response } from 'express';
import { UserRole, PermissionType } from '@prisma/client';
import { RoleService } from '../services/role.service';
import { AuthenticatedRequest } from '../middleware/permissions.middleware';

const roleService = new RoleService();

export class RoleController {
  // Obtener todos los usuarios con sus roles y permisos
  async getAllUsersWithRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await roleService.getAllUsersWithRoles(
        Number(page),
        Number(limit)
      );

      res.json(result);
    } catch (error: any) {
      console.error('Error obteniendo usuarios con roles:', error);
      res.status(500).json({
        error: 'Error obteniendo usuarios con roles',
        message: error.message
      });
    }
  }

  // Obtener usuario específico con roles y permisos
  async getUserWithRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await roleService.getUserWithRolesAndPermissions(userId);

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario solicitado no existe'
        });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error obteniendo usuario con roles:', error);
      res.status(500).json({
        error: 'Error obteniendo usuario con roles',
        message: error.message
      });
    }
  }

  // Asignar rol a usuario
  async assignRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, role, groupId } = req.body;

      if (!userId || !role) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere userId y role'
        });
      }

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({
          error: 'Rol inválido',
          message: 'El rol especificado no es válido'
        });
      }

      const result = await roleService.assignRole({
        userId,
        role,
        groupId,
        createdBy: req.user!.id
      });

      res.status(201).json({
        message: 'Rol asignado exitosamente',
        role: result
      });
    } catch (error: any) {
      console.error('Error asignando rol:', error);
      res.status(400).json({
        error: 'Error asignando rol',
        message: error.message
      });
    }
  }

  // Remover rol de usuario
  async removeRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, role, groupId } = req.body;

      if (!userId || !role) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere userId y role'
        });
      }

      await roleService.removeRole(userId, role, groupId);

      res.json({
        message: 'Rol removido exitosamente'
      });
    } catch (error: any) {
      console.error('Error removiendo rol:', error);
      res.status(400).json({
        error: 'Error removiendo rol',
        message: error.message
      });
    }
  }

  // Asignar permiso específico a usuario
  async assignPermission(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, permission, resource, granted = true, expiresAt } = req.body;

      if (!userId || !permission) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere userId y permission'
        });
      }

      if (!Object.values(PermissionType).includes(permission)) {
        return res.status(400).json({
          error: 'Permiso inválido',
          message: 'El permiso especificado no es válido'
        });
      }

      const result = await roleService.assignPermission({
        userId,
        permission,
        resource,
        granted,
        createdBy: req.user!.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.status(201).json({
        message: 'Permiso asignado exitosamente',
        permission: result
      });
    } catch (error: any) {
      console.error('Error asignando permiso:', error);
      res.status(400).json({
        error: 'Error asignando permiso',
        message: error.message
      });
    }
  }

  // Remover permiso específico
  async removePermission(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, permission, resource } = req.body;

      if (!userId || !permission) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere userId y permission'
        });
      }

      await roleService.removePermission(userId, permission, resource);

      res.json({
        message: 'Permiso removido exitosamente'
      });
    } catch (error: any) {
      console.error('Error removiendo permiso:', error);
      res.status(400).json({
        error: 'Error removiendo permiso',
        message: error.message
      });
    }
  }

  // Verificar roles de usuario
  async checkUserRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role, groupId } = req.query;

      if (role) {
        // Verificar rol específico
        const hasRole = await roleService.userHasRole(
          userId,
          role as UserRole,
          groupId as string
        );

        return res.json({ hasRole, role, groupId });
      }

      // Obtener todos los roles
      const roles = await roleService.getUserRoles(userId);
      res.json({ roles });
    } catch (error: any) {
      console.error('Error verificando roles:', error);
      res.status(500).json({
        error: 'Error verificando roles',
        message: error.message
      });
    }
  }

  // Verificar permisos de usuario
  async checkUserPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { permission, resource } = req.query;

      if (!permission) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere permission en query'
        });
      }

      const hasPermission = await roleService.userHasPermission(
        userId,
        permission as PermissionType,
        resource as string
      );

      res.json({ hasPermission, permission, resource });
    } catch (error: any) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({
        error: 'Error verificando permisos',
        message: error.message
      });
    }
  }

  // Actualizar capacidades de rol de empleado
  async updateEmployeeRoleCapabilities(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { canBeGroupAdmin, canBeGroupModerator, canBeContentManager } = req.body;

      await roleService.updateEmployeeRoleCapabilities(userId, {
        canBeGroupAdmin,
        canBeGroupModerator,
        canBeContentManager
      });

      res.json({
        message: 'Capacidades de rol actualizadas exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando capacidades:', error);
      res.status(400).json({
        error: 'Error actualizando capacidades',
        message: error.message
      });
    }
  }

  // Obtener información de roles y permisos disponibles
  async getRolesAndPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const roles = Object.values(UserRole);
      const permissions = Object.values(PermissionType);

      // Descripción de roles
      const roleDescriptions = {
        [UserRole.SUPER_ADMIN]: 'Super Administrador - Acceso completo al sistema',
        [UserRole.ADMIN]: 'Administrador - Gestión general de la plataforma',
        [UserRole.EMPLEADO_PUBLICO]: 'Empleado Público - Usuario estándar',
        [UserRole.ADMINISTRADOR_GRUPO]: 'Administrador de Grupo - Gestiona grupos específicos',
        [UserRole.MODERADOR_GRUPO]: 'Moderador de Grupo - Modera contenido de grupos',
        [UserRole.GESTOR_CONTENIDO]: 'Gestor de Contenido - Gestiona contenido del blog',
        [UserRole.GESTOR_EMPRESAS]: 'Gestor de Empresas - Administra perfiles de empresas',
        [UserRole.GESTOR_ADMINISTRACIONES]: 'Gestor de Administraciones - Administra administraciones públicas',
        [UserRole.EMPRESA]: 'Empresa - Perfil empresarial',
        [UserRole.ADMINISTRACION_PUBLICA]: 'Administración Pública - Perfil institucional'
      };

      // Categorías de permisos
      const permissionCategories = {
        'Sistema': [
          PermissionType.MANAGE_USERS,
          PermissionType.MANAGE_ROLES,
          PermissionType.MANAGE_PERMISSIONS,
          PermissionType.VIEW_ADMIN_DASHBOARD,
          PermissionType.MANAGE_SYSTEM_CONFIG
        ],
        'Contenido': [
          PermissionType.CREATE_CONTENT,
          PermissionType.EDIT_CONTENT,
          PermissionType.DELETE_CONTENT,
          PermissionType.PUBLISH_CONTENT,
          PermissionType.MODERATE_CONTENT,
          PermissionType.PIN_CONTENT
        ],
        'Posts y Comentarios': [
          PermissionType.CREATE_POST,
          PermissionType.EDIT_POST,
          PermissionType.DELETE_POST,
          PermissionType.MODERATE_POST,
          PermissionType.PIN_POST,
          PermissionType.CREATE_COMMENT,
          PermissionType.EDIT_COMMENT,
          PermissionType.DELETE_COMMENT,
          PermissionType.MODERATE_COMMENT
        ],
        'Grupos': [
          PermissionType.CREATE_GROUP,
          PermissionType.EDIT_GROUP,
          PermissionType.DELETE_GROUP,
          PermissionType.MANAGE_GROUP_MEMBERS,
          PermissionType.MODERATE_GROUP_CONTENT,
          PermissionType.PIN_GROUP_CONTENT
        ],
        'Foros': [
          PermissionType.CREATE_FORUM,
          PermissionType.EDIT_FORUM,
          PermissionType.DELETE_FORUM,
          PermissionType.CREATE_FORUM_TOPIC,
          PermissionType.EDIT_FORUM_TOPIC,
          PermissionType.DELETE_FORUM_TOPIC,
          PermissionType.MODERATE_FORUM,
          PermissionType.PIN_FORUM_TOPIC,
          PermissionType.LOCK_FORUM_TOPIC
        ],
        'Anuncios': [
          PermissionType.CREATE_ANNOUNCEMENT,
          PermissionType.EDIT_ANNOUNCEMENT,
          PermissionType.DELETE_ANNOUNCEMENT,
          PermissionType.PUBLISH_ANNOUNCEMENT,
          PermissionType.PIN_ANNOUNCEMENT
        ],
        'Empresas': [
          PermissionType.MANAGE_COMPANIES,
          PermissionType.CREATE_COMPANY_PROFILE,
          PermissionType.EDIT_COMPANY_PROFILE,
          PermissionType.MANAGE_COMPANY_SERVICES
        ],
        'Administraciones Públicas': [
          PermissionType.MANAGE_PUBLIC_ADMINISTRATIONS,
          PermissionType.CREATE_ADMIN_PROFILE,
          PermissionType.EDIT_ADMIN_PROFILE
        ],
        'Moderación': [
          PermissionType.VIEW_REPORTS,
          PermissionType.HANDLE_REPORTS,
          PermissionType.VIEW_MODERATION_STATS,
          PermissionType.BULK_MODERATE
        ],
        'Especiales': [
          PermissionType.IMPERSONATE_USER,
          PermissionType.VIEW_AUDIT_LOGS,
          PermissionType.MANAGE_TRANSLATIONS,
          PermissionType.MANAGE_COMMUNITIES
        ]
      };

      res.json({
        roles: {
          list: roles,
          descriptions: roleDescriptions
        },
        permissions: {
          list: permissions,
          categories: permissionCategories
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo roles y permisos:', error);
      res.status(500).json({
        error: 'Error obteniendo información de roles y permisos',
        message: error.message
      });
    }
  }

  // Asignación masiva de roles
  async bulkAssignRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { assignments } = req.body; // Array de {userId, role, groupId}

      if (!Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'Se requiere un array de asignaciones'
        });
      }

      const results = [];
      const errors = [];

      for (const assignment of assignments) {
        try {
          const result = await roleService.assignRole({
            userId: assignment.userId,
            role: assignment.role,
            groupId: assignment.groupId,
            createdBy: req.user!.id
          });
          results.push({ userId: assignment.userId, success: true, role: result });
        } catch (error: any) {
          errors.push({
            userId: assignment.userId,
            error: error.message
          });
        }
      }

      res.json({
        message: 'Asignación masiva completada',
        successful: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error: any) {
      console.error('Error en asignación masiva:', error);
      res.status(500).json({
        error: 'Error en asignación masiva',
        message: error.message
      });
    }
  }
}