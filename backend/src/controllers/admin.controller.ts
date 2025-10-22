import { Request, Response } from 'express';
import { AdminService, CreateUserData, UpdateUserData } from '../services/admin.service';
import { CustomFieldService, CreateCustomFieldData, UpdateCustomFieldData } from '../services/customField.service';
import { RoleService } from '../services/role.service';
import { AuthenticatedRequest } from '../middleware/permissions.middleware';

export class AdminController {
  private adminService = new AdminService();
  private customFieldService = new CustomFieldService();
  private roleService = new RoleService();

  // ========== GESTIÓN DE USUARIOS ==========

  // Crear usuario
  createUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData: CreateUserData = req.body;
      const createdBy = req.user?.id!;

      const result = await this.adminService.createUser(userData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener todos los usuarios
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userType = req.query.userType as any;
      const search = req.query.search as string;

      const result = await this.adminService.getAllUsers(page, limit, userType, search);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener usuario por ID
  getUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await this.adminService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Actualizar usuario
  updateUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updateData: UpdateUserData = req.body;

      const updatedUser = await this.adminService.updateUser(userId, updateData);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Eliminar usuario
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      await this.adminService.deleteUser(userId);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Activar/Desactivar usuario
  toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const updatedUser = await this.adminService.toggleUserStatus(userId);

      res.json({
        success: true,
        message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener estadísticas de usuarios
  getUserStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.adminService.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // ========== GESTIÓN DE ROLES Y PERMISOS ==========

  // Asignar rol a usuario
  assignRole = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { role, groupId } = req.body;
      const createdBy = req.user?.id!;

      const result = await this.roleService.assignRole({
        userId,
        role,
        groupId,
        createdBy
      });

      res.json({
        success: true,
        message: 'Rol asignado exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Remover rol de usuario
  removeRole = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { role, groupId } = req.body;

      await this.roleService.removeRole(userId, role, groupId);

      res.json({
        success: true,
        message: 'Rol removido exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Asignar permiso específico a usuario
  assignPermission = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { permission, resource, granted, expiresAt } = req.body;
      const createdBy = req.user?.id!;

      const result = await this.roleService.assignPermission({
        userId,
        permission,
        resource,
        granted,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.json({
        success: true,
        message: 'Permiso asignado exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Remover permiso específico
  removePermission = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { permission, resource } = req.body;

      await this.roleService.removePermission(userId, permission, resource);

      res.json({
        success: true,
        message: 'Permiso removido exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener roles y permisos de usuario
  getUserRolesAndPermissions = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await this.roleService.getUserWithRolesAndPermissions(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Actualizar capacidades de roles de empleado
  updateEmployeeRoleCapabilities = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const capabilities = req.body;

      await this.roleService.updateEmployeeRoleCapabilities(userId, capabilities);

      res.json({
        success: true,
        message: 'Capacidades de roles actualizadas exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // ========== GESTIÓN DE CAMPOS PERSONALIZADOS ==========

  // Crear campo personalizado
  createCustomField = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fieldData: CreateCustomFieldData = req.body;
      const createdBy = req.user?.id!;

      const field = await this.customFieldService.createCustomField(fieldData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Campo personalizado creado exitosamente',
        data: field
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener todos los campos personalizados
  getAllCustomFields = async (req: Request, res: Response) => {
    try {
      const userType = req.query.userType as any;
      const activeOnly = req.query.activeOnly !== 'false';

      const fields = await this.customFieldService.getAllCustomFields(userType, activeOnly);

      res.json({
        success: true,
        data: fields
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener campos por tipo de usuario
  getCustomFieldsByUserType = async (req: Request, res: Response) => {
    try {
      const { userType } = req.params;
      const activeOnly = req.query.activeOnly !== 'false';

      const fields = await this.customFieldService.getCustomFieldsByUserType(userType as any, activeOnly);

      res.json({
        success: true,
        data: fields
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener campo personalizado por ID
  getCustomFieldById = async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.params;

      const field = await this.customFieldService.getCustomFieldById(fieldId);

      if (!field) {
        return res.status(404).json({
          success: false,
          message: 'Campo personalizado no encontrado'
        });
      }

      res.json({
        success: true,
        data: field
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Actualizar campo personalizado
  updateCustomField = async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.params;
      const updateData: UpdateCustomFieldData = req.body;

      const updatedField = await this.customFieldService.updateCustomField(fieldId, updateData);

      res.json({
        success: true,
        message: 'Campo personalizado actualizado exitosamente',
        data: updatedField
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Eliminar campo personalizado
  deleteCustomField = async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.params;

      await this.customFieldService.deleteCustomField(fieldId);

      res.json({
        success: true,
        message: 'Campo personalizado eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Activar/Desactivar campo personalizado
  toggleCustomFieldStatus = async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.params;

      const updatedField = await this.customFieldService.toggleCustomFieldStatus(fieldId);

      res.json({
        success: true,
        message: `Campo personalizado ${updatedField.isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedField
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Reordenar campos personalizados
  reorderCustomFields = async (req: Request, res: Response) => {
    try {
      const { userType } = req.params;
      const { fieldOrders } = req.body;

      await this.customFieldService.reorderCustomFields(userType as any, fieldOrders);

      res.json({
        success: true,
        message: 'Campos reordenados exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Validar valor de campo personalizado
  validateCustomFieldValue = async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.params;
      const { value } = req.body;

      const validation = await this.customFieldService.validateCustomFieldValue(fieldId, value);

      res.json({
        success: true,
        data: validation
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Obtener estadísticas de campos personalizados
  getCustomFieldStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.customFieldService.getCustomFieldStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}