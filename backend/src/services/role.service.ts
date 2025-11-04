import { UserRole, PermissionType, User, UserAdditionalRole, UserPermission } from '@prisma/client';
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
  additionalRoles: UserAdditionalRole[];
  permissions: UserPermission[];
  employee?: any;
  company?: any;
  publicAdministration?: any;
}

export class RoleService {
  // Obtener usuario con roles y permisos
  async getUserWithRolesAndPermissions(userId: string): Promise<UserWithRolesAndPermissions | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        additionalRoles: true,
        permissions: true,
        employee: true,
        company: true,
        publicAdministration: true
      }
    });
  }

  // Obtener todos los roles de un usuario (primario + adicionales)
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { additionalRoles: true }
    });

    if (!user) return [];

    const roles = [user.primaryRole];
    user.additionalRoles.forEach(role => {
      if (!roles.includes(role.role)) {
        roles.push(role.role);
      }
    });

    return roles;
  }

  // Verificar si un usuario tiene un rol específico
  async userHasRole(userId: string, role: UserRole, groupId?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { additionalRoles: true }
    });

    if (!user) return false;

    // Verificar rol primario
    if (user.primaryRole === role && !groupId) return true;

    // Verificar roles adicionales
    return user.additionalRoles.some(additionalRole =>
      additionalRole.role === role &&
      (groupId ? additionalRole.groupId === groupId : true)
    );
  }

  // Asignar rol adicional a usuario
  async assignRole(data: CreateUserRoleData): Promise<UserAdditionalRole> {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no tiene ya este rol (para el mismo grupo si aplica)
    const whereClause: any = {
      userId: data.userId,
      role: data.role
    };

    if (data.groupId) {
      whereClause.groupId = data.groupId;
    }

    const existingRole = await prisma.userAdditionalRole.findUnique({
      where: {
        userId_role_groupId: whereClause
      }
    });

    if (existingRole) {
      throw new Error('El usuario ya tiene este rol asignado');
    }

    // Si es rol de grupo, verificar que el grupo existe
    if (data.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId }
      });
      if (!group) {
        throw new Error('Grupo no encontrado');
      }
    }

    return prisma.userAdditionalRole.create({
      data: {
        userId: data.userId,
        role: data.role,
        groupId: data.groupId,
        createdBy: data.createdBy
      }
    });
  }

  // Remover rol de usuario
  async removeRole(userId: string, role: UserRole, groupId?: string): Promise<void> {
    const whereClause: any = {
      userId,
      role
    };

    if (groupId) {
      whereClause.groupId = groupId;
    }

    await prisma.userAdditionalRole.delete({
      where: {
        userId_role_groupId: whereClause
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

    const userPermission = await prisma.userPermission.findFirst({
      where: whereClause
    });

    if (userPermission) {
      // Verificar si no ha expirado
      if (userPermission.expiresAt && userPermission.expiresAt < new Date()) {
        return false;
      }
      return userPermission.granted;
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
      [UserRole.SUPER_ADMIN]: Object.values(PermissionType), // Todos los permisos

      [UserRole.ADMIN]: [
        PermissionType.MANAGE_USERS,
        PermissionType.MANAGE_ROLES,
        PermissionType.VIEW_ADMIN_DASHBOARD,
        PermissionType.CREATE_CONTENT,
        PermissionType.EDIT_CONTENT,
        PermissionType.DELETE_CONTENT,
        PermissionType.PUBLISH_CONTENT,
        PermissionType.MODERATE_CONTENT,
        PermissionType.PIN_CONTENT,
        PermissionType.CREATE_POST,
        PermissionType.EDIT_POST,
        PermissionType.DELETE_POST,
        PermissionType.MODERATE_POST,
        PermissionType.PIN_POST,
        PermissionType.CREATE_GROUP,
        PermissionType.EDIT_GROUP,
        PermissionType.DELETE_GROUP,
        PermissionType.CREATE_FORUM,
        PermissionType.EDIT_FORUM,
        PermissionType.DELETE_FORUM,
        PermissionType.CREATE_ANNOUNCEMENT,
        PermissionType.EDIT_ANNOUNCEMENT,
        PermissionType.DELETE_ANNOUNCEMENT,
        PermissionType.PUBLISH_ANNOUNCEMENT,
        PermissionType.PIN_ANNOUNCEMENT,
        PermissionType.MANAGE_COMPANIES,
        PermissionType.MANAGE_PUBLIC_ADMINISTRATIONS,
        PermissionType.VIEW_REPORTS,
        PermissionType.HANDLE_REPORTS,
        PermissionType.VIEW_MODERATION_STATS,
        PermissionType.BULK_MODERATE
      ],

      [UserRole.EMPLEADO_PUBLICO]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.CREATE_FORUM_TOPIC,
        PermissionType.CREATE_ANNOUNCEMENT
      ],

      [UserRole.ADMINISTRADOR_GRUPO]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.MANAGE_GROUP_MEMBERS,
        PermissionType.MODERATE_GROUP_CONTENT,
        PermissionType.PIN_GROUP_CONTENT,
        PermissionType.CREATE_FORUM_TOPIC,
        PermissionType.CREATE_ANNOUNCEMENT
      ],

      [UserRole.MODERADOR_GRUPO]: [
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.MODERATE_GROUP_CONTENT,
        PermissionType.CREATE_FORUM_TOPIC
      ],

      [UserRole.GESTOR_CONTENIDO]: [
        PermissionType.CREATE_CONTENT,
        PermissionType.EDIT_CONTENT,
        PermissionType.PUBLISH_CONTENT,
        PermissionType.MODERATE_CONTENT,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.CREATE_FORUM_TOPIC,
        PermissionType.CREATE_ANNOUNCEMENT
      ],

      [UserRole.GESTOR_EMPRESAS]: [
        PermissionType.MANAGE_COMPANIES,
        PermissionType.CREATE_COMPANY_PROFILE,
        PermissionType.EDIT_COMPANY_PROFILE,
        PermissionType.MANAGE_COMPANY_SERVICES,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],

      [UserRole.GESTOR_ADMINISTRACIONES]: [
        PermissionType.MANAGE_PUBLIC_ADMINISTRATIONS,
        PermissionType.CREATE_ADMIN_PROFILE,
        PermissionType.EDIT_ADMIN_PROFILE,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT
      ],

      [UserRole.COMPANY_MANAGER]: [
        PermissionType.CREATE_COMPANY_PROFILE,
        PermissionType.EDIT_COMPANY_PROFILE,
        PermissionType.MANAGE_COMPANY_SERVICES,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.CREATE_ANNOUNCEMENT
      ],

      [UserRole.EMPRESA]: [
        PermissionType.CREATE_COMPANY_PROFILE,
        PermissionType.EDIT_COMPANY_PROFILE,
        PermissionType.MANAGE_COMPANY_SERVICES,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.CREATE_ANNOUNCEMENT
      ],

      [UserRole.ADMINISTRACION_PUBLICA]: [
        PermissionType.CREATE_ADMIN_PROFILE,
        PermissionType.EDIT_ADMIN_PROFILE,
        PermissionType.CREATE_POST,
        PermissionType.CREATE_COMMENT,
        PermissionType.CREATE_ANNOUNCEMENT
      ]
    };
  }

  // Asignar permiso específico a usuario
  async assignPermission(data: CreateUserPermissionData): Promise<UserPermission> {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const whereClause: any = {
      userId: data.userId,
      permission: data.permission
    };

    if (data.resource) {
      whereClause.resource = data.resource;
    }

    return prisma.userPermission.upsert({
      where: {
        userId_permission_resource: whereClause
      },
      update: {
        granted: data.granted ?? true,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt
      },
      create: {
        userId: data.userId,
        permission: data.permission,
        resource: data.resource,
        granted: data.granted ?? true,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt
      }
    });
  }

  // Remover permiso específico
  async removePermission(userId: string, permission: PermissionType, resource?: string): Promise<void> {
    const whereClause: any = {
      userId,
      permission
    };

    if (resource) {
      whereClause.resource = resource;
    }

    await prisma.userPermission.delete({
      where: {
        userId_permission_resource: whereClause
      }
    });
  }

  // Actualizar campos de habilitación de roles en Employee
  async updateEmployeeRoleCapabilities(userId: string, capabilities: {
    canBeGroupAdmin?: boolean;
    canBeGroupModerator?: boolean;
    canBeContentManager?: boolean;
  }): Promise<void> {
    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    await prisma.employee.update({
      where: { userId },
      data: capabilities
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
      prisma.user.findMany({
        include: {
          additionalRoles: true,
          permissions: true,
          employee: true,
          company: true,
          publicAdministration: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}