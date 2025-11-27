import { UserRole, AdministrationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { RoleService } from './role.service';

export interface CreateUserData {
  userType: UserRole;
  email: string;
  password: string;
  userData: any; // Datos específicos según el tipo de usuario
  customFields?: Record<string, any>; // Valores de campos personalizados
  customFieldsPrivacy?: Record<string, 'public' | 'private'>; // Configuración de privacidad
  roles?: UserRole[]; // Roles adicionales
}

export interface UpdateUserData {
  email?: string;
  isActive?: boolean;
  userData?: any;
  customFields?: Record<string, any>;
  customFieldsPrivacy?: Record<string, 'public' | 'private'>;
}

export class AdminService {
  private roleService = new RoleService();

  // Crear usuario con tipo específico
  async createUser(data: CreateUserData, createdBy: string) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Verificar que el email no existe
    const existingUser = await (prisma as any).user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear usuario base
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        primaryRole: data.userType,
        isActive: true
      }
    });

    // Crear perfil específico según el tipo
    let profile;
    switch (data.userType) {
      case UserRole.EMPLEADO_PUBLICO:
        profile = await this.createEmployeeProfile(user.id, data.userData, data.customFields, data.customFieldsPrivacy);
        break;
      case (UserRole as any).EMPRESA:
        profile = await this.createCompanyProfile(user.id, data.userData, data.customFields, data.customFieldsPrivacy);
        break;
      case (UserRole as any).ADMINISTRACION_PUBLICA:
        profile = await this.createPublicAdminProfile(user.id, data.userData, data.customFields, data.customFieldsPrivacy);
        break;
      // Para ADMIN, SUPER_ADMIN, etc. no se crea perfil adicional
    }

    // Asignar roles adicionales si se especifican
    if (data.roles && data.roles.length > 0) {
      for (const role of data.roles) {
        if (role !== data.userType) {
          await this.roleService.assignRole({
            userId: user.id,
            role: role,
            createdBy: createdBy
          });
        }
      }
    }

    return { user, profile };
  }

  // Crear perfil de empleado público
  private async createEmployeeProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    return (prisma.employee.create as any)({
      data: {
        userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        nick: userData.nick,
        dni: userData.dni,
        jobTitle: userData.jobTitle,
        department: userData.department,
        organization: userData.organization,
        community: userData.community,
        administrationType: userData.administrationType as AdministrationType,
        province: userData.province,
        city: userData.city,
        avatar: userData.avatar,
        generalInfo: userData.generalInfo,
        skills: userData.skills ? JSON.stringify(userData.skills) : undefined,
        workExperience: userData.workExperience ? JSON.stringify(userData.workExperience) : undefined,
        socialNetworks: userData.socialNetworks,
        bio: userData.bio,
        privacySettings: userData.privacySettings,
        canBeGroupAdmin: userData.canBeGroupAdmin || false,
        canBeGroupModerator: userData.canBeGroupModerator || false,
        canBeContentManager: userData.canBeContentManager || false,
        customFields: customFields ? JSON.stringify(customFields) : undefined,
        customFieldsPrivacy: customFieldsPrivacy ? JSON.stringify(customFieldsPrivacy) : undefined
      }
    });
  }

  // Crear perfil de empresa
  private async createCompanyProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    return (prisma.companies.create as any)({
      data: {
        userId,
        name: userData.name,
        description: userData.description,
        sector: userData.sector,
        size: userData.size || 'pequeña',
        cif: userData.cif,
        address: userData.address,
        phone: userData.phone,
        email: userData.email,
        website: userData.website,
        socialMedia: userData.socialMedia,
        logo: userData.logo,
        certifications: userData.certifications,
        foundedYear: userData.foundedYear,
        employeeCount: userData.employeeCount,
        annualRevenue: userData.annualRevenue,
        configuration: userData.configuration,
        customFields: customFields ? JSON.stringify(customFields) : undefined,
        customFieldsPrivacy: customFieldsPrivacy ? JSON.stringify(customFieldsPrivacy) : undefined,
        isVerified: false
      }
    });
  }

  // Crear perfil de administración pública
  private async createPublicAdminProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    return (prisma as any).publicAdministration.create({
      data: {
        userId,
        name: userData.name,
        administrationType: userData.administrationType as AdministrationType,
        community: userData.community,
        province: userData.province,
        city: userData.city,
        address: userData.address,
        phone: userData.phone,
        email: userData.email,
        website: userData.website,
        description: userData.description,
        citizenServices: userData.citizenServices ? JSON.stringify(userData.citizenServices) : undefined,
        departments: userData.departments ? JSON.stringify(userData.departments) : undefined,
        publicHours: userData.publicHours,
        contactInfo: userData.contactInfo ? JSON.stringify(userData.contactInfo) : undefined,
        customFields: customFields ? JSON.stringify(customFields) : undefined,
        customFieldsPrivacy: customFieldsPrivacy ? JSON.stringify(customFieldsPrivacy) : undefined,
        isVerified: false
      }
    });
  }

  // Obtener todos los usuarios con paginación
  async getAllUsers(page: number = 1, limit: number = 20, userType?: UserRole, search?: string) {
    const offset = (page - 1) * limit;

    const where: any = {};
    if (userType) where.primaryRole = userType;
    if (search) {
      where.email = { contains: search };
    }

    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        include: {
          employee: true,
          company: true,
          publicAdministration: true,
          additionalRoles: true,
          permissions: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      (prisma as any).user.count({ where })
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  // Obtener usuario por ID con toda su información
  async getUserById(userId: string) {
    return (prisma.user.findUnique as any)({
      where: { id: userId },
      include: {
        employee: true,
        company: true,
        publicAdministration: true,
        additionalRoles: true,
        permissions: true
      }
    });
  }

  // Actualizar usuario
  async updateUser(userId: string, data: UpdateUserData) {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        company: true,
        publicAdministration: true
      } as any
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar datos del usuario base
    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: {
        email: data.email,
        isActive: data.isActive
      }
    });

    // Actualizar perfil específico si hay datos
    if (data.userData) {
      if ((user as any).employee) {
        await this.updateEmployeeProfile(userId, data.userData, data.customFields, data.customFieldsPrivacy);
      } else if ((user as any).company) {
        await this.updateCompanyProfile(userId, data.userData, data.customFields, data.customFieldsPrivacy);
      } else if ((user as any).publicAdministration) {
        await this.updatePublicAdminProfile(userId, data.userData, data.customFields, data.customFieldsPrivacy);
      }
    }

    return updatedUser;
  }

  // Actualizar perfil de empleado
  private async updateEmployeeProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    const updateData: any = { ...userData };

    if (userData.skills) updateData.skills = JSON.stringify(userData.skills);
    if (userData.workExperience) updateData.workExperience = JSON.stringify(userData.workExperience);
    if (customFields) updateData.customFields = JSON.stringify(customFields);
    if (customFieldsPrivacy) updateData.customFieldsPrivacy = JSON.stringify(customFieldsPrivacy);

    return (prisma.employee.update as any)({
      where: { userId } as any,
      data: updateData
    });
  }

  // Actualizar perfil de empresa
  private async updateCompanyProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    const updateData: any = { ...userData };

    if (customFields) updateData.customFields = JSON.stringify(customFields);
    if (customFieldsPrivacy) updateData.customFieldsPrivacy = JSON.stringify(customFieldsPrivacy);

    return (prisma.companies.update as any)({
      where: { userId } as any,
      data: updateData
    });
  }

  // Actualizar perfil de administración pública
  private async updatePublicAdminProfile(
    userId: string,
    userData: any,
    customFields?: Record<string, any>,
    customFieldsPrivacy?: Record<string, 'public' | 'private'>
  ) {
    const updateData: any = { ...userData };

    if (userData.citizenServices) updateData.citizenServices = JSON.stringify(userData.citizenServices);
    if (userData.departments) updateData.departments = JSON.stringify(userData.departments);
    if (userData.contactInfo) updateData.contactInfo = JSON.stringify(userData.contactInfo);
    if (customFields) updateData.customFields = JSON.stringify(customFields);
    if (customFieldsPrivacy) updateData.customFieldsPrivacy = JSON.stringify(customFieldsPrivacy);

    return (prisma as any).publicAdministration.update({
      where: { userId } as any,
      data: updateData
    });
  }

  // Eliminar usuario
  async deleteUser(userId: string) {
    // Prisma manejará la eliminación en cascada de los perfiles relacionados
    return (prisma as any).user.delete({
      where: { id: userId }
    });
  }

  // Activar/Desactivar usuario
  async toggleUserStatus(userId: string) {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return (prisma as any).user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive
      }
    });
  }

  // Obtener estadísticas de usuarios
  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      recentUsers
    ] = await Promise.all([
      (prisma as any).user.count(),
      (prisma as any).user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['primaryRole'],
        _count: { primaryRole: true }
      }),
      (prisma as any).user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        }
      })
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      byRole: usersByRole,
      recentUsers
    };
  }
}