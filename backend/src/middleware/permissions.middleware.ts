import { Request, Response, NextFunction } from 'express';
import { UserRole, PermissionType } from '@prisma/client';
import { RoleService } from '../services/role.service';

// Interfaz para request autenticado
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

const roleService = new RoleService();

// Middleware para verificar roles
export const requireRole = (roles: UserRole | UserRole[], groupId?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      const rolesToCheck = Array.isArray(roles) ? roles : [roles];

      // Verificar cada rol
      for (const role of rolesToCheck) {
        const hasRole = await roleService.userHasRole(req.user.id, role, groupId);
        if (hasRole) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes los permisos necesarios para realizar esta acción'
      });
    } catch (error: any) {
      console.error('Error verificando roles:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission: PermissionType, resource?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      // Si se especifica un recurso dinámico (ej: grupoId desde params)
      let finalResource = resource;
      if (resource?.startsWith(':')) {
        const paramName = resource.substring(1);
        finalResource = req.params[paramName];
      }

      const hasPermission = await roleService.userHasPermission(
        req.user.id,
        permission,
        finalResource
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      next();
    } catch (error: any) {
      console.error('Error verificando permisos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Middleware para verificar múltiples permisos (AND)
export const requireAllPermissions = (permissions: PermissionType[], resource?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      let finalResource = resource;
      if (resource?.startsWith(':')) {
        const paramName = resource.substring(1);
        finalResource = req.params[paramName];
      }

      // Verificar todos los permisos
      for (const permission of permissions) {
        const hasPermission = await roleService.userHasPermission(
          req.user.id,
          permission,
          finalResource
        );

        if (!hasPermission) {
          return res.status(403).json({
            error: 'Acceso denegado',
            message: `No tienes el permiso ${permission} necesario`
          });
        }
      }

      next();
    } catch (error: any) {
      console.error('Error verificando permisos múltiples:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Middleware para verificar cualquiera de varios permisos (OR)
export const requireAnyPermission = (permissions: PermissionType[], resource?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      let finalResource = resource;
      if (resource?.startsWith(':')) {
        const paramName = resource.substring(1);
        finalResource = req.params[paramName];
      }

      // Verificar si tiene al menos uno de los permisos
      for (const permission of permissions) {
        const hasPermission = await roleService.userHasPermission(
          req.user.id,
          permission,
          finalResource
        );

        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes ninguno de los permisos necesarios'
      });
    } catch (error: any) {
      console.error('Error verificando permisos alternativos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Middleware para verificar propietario del recurso
export const requireOwnership = (resourceType: 'post' | 'content' | 'group' | 'forum' | 'announcement') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      const resourceId = req.params.id || req.params.postId || req.params.contentId;
      if (!resourceId) {
        return res.status(400).json({
          error: 'Parámetro faltante',
          message: 'ID del recurso no proporcionado'
        });
      }

      let isOwner = false;

      // Verificar propietario según el tipo de recurso
      switch (resourceType) {
        case 'post':
          const post = await roleService.getUserWithRolesAndPermissions(req.user.id);
          // Implementar lógica específica para posts
          break;
        case 'content':
          // Implementar lógica para contenido del blog
          break;
        case 'group':
          // Implementar lógica para grupos
          break;
        // ... otros casos
      }

      if (!isOwner) {
        // Verificar si tiene permisos administrativos para gestionar el recurso
        const hasAdminPermission = await roleService.userHasPermission(
          req.user.id,
          PermissionType.MANAGE_USERS // O el permiso apropiado
        );

        if (!hasAdminPermission) {
          return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Solo puedes gestionar tus propios recursos'
          });
        }
      }

      next();
    } catch (error: any) {
      console.error('Error verificando propiedad:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Middleware para verificar si un usuario puede gestionar grupos
export const requireGroupManagement = (groupId?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Usuario no autenticado'
        });
      }

      const finalGroupId = groupId || req.params.groupId;

      // Verificar si es administrador del grupo específico
      const isGroupAdmin = await roleService.userHasRole(
        req.user.id,
        UserRole.ADMINISTRADOR_GRUPO,
        finalGroupId
      );

      if (isGroupAdmin) {
        return next();
      }

      // Verificar si tiene permisos administrativos generales
      const hasGeneralPermission = await roleService.userHasPermission(
        req.user.id,
        PermissionType.MANAGE_GROUP_MEMBERS
      );

      if (!hasGeneralPermission) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para gestionar este grupo'
        });
      }

      next();
    } catch (error: any) {
      console.error('Error verificando gestión de grupos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  };
};

// Utilitario para verificar permisos en controladores
export const checkUserPermission = async (
  userId: string,
  permission: PermissionType,
  resource?: string
): Promise<boolean> => {
  return roleService.userHasPermission(userId, permission, resource);
};

// Utilitario para verificar roles en controladores
export const checkUserRole = async (
  userId: string,
  role: UserRole,
  groupId?: string
): Promise<boolean> => {
  return roleService.userHasRole(userId, role, groupId);
};