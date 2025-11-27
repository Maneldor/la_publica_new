import { UserRole, PermissionType, User } from '@prisma/client';
import prisma from '../config/database';

export interface CreateUserRoleData {
  userId: string;
  role: UserRole;
  groupId?: string;
  createdBy: string;
}

export interface CreateUserPermissionData {
  userId: string;
  permission: PermissionType;
  resource?: string;
  granted?: boolean;
  createdBy: string;
  expiresAt?: Date;
}

export interface UserWithRolesAndPermissions extends User {
  additionalRoles: any[];
  permissions: any[];
  employee?: any;
  company?: any;
  publicAdministration?: any;
}

export class RoleService {
  // Obtener usuario con roles y permisos
  async getUserWithRolesAndPermissions(userId: string): Promise<UserWithRolesAndPermissions | null> {
    return (prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        company: true,
        publicAdministration: true
      }
    }) as any;
  }

  // Obtener todos los roles de un usuario (primario + adicionales)
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId }
    });

    if (!user) return [];

    const roles = [user.primaryRole].filter(role => role !== null) as UserRole[];
    return roles;
  }

  // Verificar si un usuario tiene un rol específico
  async userHasRole(userId: string, role: UserRole, groupId?: string): Promise<boolean> {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Verificar rol primario
    if (user.primaryRole === role && !groupId) return true;

    return false;
  }

  // Asignar rol adicional a usuario
  async assignRole(data: CreateUserRoleData): Promise<any> {
    // Verificar que el usuario existe
    const user = await (prisma as any).user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Update primary role instead
    return (prisma as any).user.update({
      where: { id: data.userId },
      data: {
        primaryRole: data.role
      }
    });
  }

  // Remover rol de usuario
  async removeRole(userId: string, role: UserRole, groupId?: string): Promise<void> {
    // Reset to USER role
    await (prisma as any).user.update({
      where: { id: userId },
      data: {
        primaryRole: UserRole.USER
      }
    });
  }

  // Verificar permiso específico
  async userHasPermission(userId: string, permission: PermissionType, resource?: string): Promise<boolean> {
    // Verificar permiso explícito
    const whereClause: any = {
      userId,
      permission
    };

    if (resource) {
      whereClause.resource = resource;
    }

    const userPermission = null; // Simplified - no separate permissions table

    if (userPermission) {
      // Verificar si no ha expirado
      if ((userPermission as any).expiresAt && (userPermission as any).expiresAt < new Date()) {
        return false;
      }
      return (userPermission as any).granted;
    }

    // Si no hay permiso explícito, verificar permisos por rol
    return this.checkPermissionByRoles(userId, permission, resource);
  }

  // Verificar permisos basados en roles
  private async checkPermissionByRoles(userId: string, permission: PermissionType, resource?: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);

    // Definir permisos por rol
    const rolePermissions = this.getRolePermissions();

    return roles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes(permission);
    });
  }

  // Definir qué permisos tiene cada rol
  private getRolePermissions(): Record<UserRole, PermissionType[]> {
    return {
      [UserRole.USER]: [],
      [UserRole.MODERATOR]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.COMMUNITY_MANAGER]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.SUPER_ADMIN]: Object.values(PermissionType), // Todos los permisos
      [UserRole.ADMIN]: Object.values(PermissionType),
      [UserRole.COMPANY]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.EMPLEADO_PUBLICO]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.ADMINISTRADOR_GRUPO]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.COMPANY_MANAGER]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],
      [UserRole.GESTOR_EMPRESAS]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ]
    } as any;
  }

  // Asignar permiso específico a usuario
  async assignPermission(data: CreateUserPermissionData): Promise<any> {
    const user = await (prisma as any).user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Simplified - no separate permissions table
    return { granted: true };
  }

  // Remover permiso específico
  async removePermission(userId: string, permission: PermissionType, resource?: string): Promise<void> {
    // Simplified - no separate permissions table
    return;
  }

  // Actualizar campos de habilitación de roles en Employee
  async updateEmployeeRoleCapabilities(userId: string, capabilities: {
    canBeGroupAdmin?: boolean;
    canBeGroupModerator?: boolean;
    canBeContentManager?: boolean;
  }): Promise<void> {
    const employee = await prisma.employee.findUnique({
      where: { userId } as any
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    await prisma.employee.update({
      where: { userId } as any,
      data: capabilities as any
    });
  }

  // Listar todos los usuarios con sus roles y permisos
  async getAllUsersWithRoles(page: number = 1, limit: number = 20): Promise<{
    users: UserWithRolesAndPermissions[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        include: {
          employee: true,
          company: true,
          publicAdministration: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      (prisma as any).user.count()
    ]);

    return {
      users: users as any,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}