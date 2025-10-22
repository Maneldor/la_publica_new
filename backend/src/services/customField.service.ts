import { UserRole, CustomFieldType } from '@prisma/client';
import prisma from '../config/database';

export interface CreateCustomFieldData {
  name: string;
  fieldType: CustomFieldType;
  userType: UserRole;
  required?: boolean;
  isPublicByDefault?: boolean;
  allowUserPrivacy?: boolean;
  options?: any; // Para campos SELECT/MULTISELECT
  validation?: any; // Reglas de validación
  placeholder?: string;
  description?: string;
  order?: number;
}

export interface UpdateCustomFieldData {
  name?: string;
  fieldType?: CustomFieldType;
  required?: boolean;
  isPublicByDefault?: boolean;
  allowUserPrivacy?: boolean;
  options?: any;
  validation?: any;
  placeholder?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CustomFieldWithUsage {
  id: string;
  name: string;
  fieldType: CustomFieldType;
  userType: UserRole;
  required: boolean;
  isPublicByDefault: boolean;
  allowUserPrivacy: boolean;
  options?: any;
  validation?: any;
  placeholder?: string | undefined;
  description?: string | undefined;
  order: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number; // Cuántos usuarios tienen valor para este campo
}

export class CustomFieldService {
  // Crear campo personalizado
  async createCustomField(data: CreateCustomFieldData, createdBy: string) {
    // Verificar que no existe un campo con el mismo nombre para el mismo tipo de usuario
    const existingField = await prisma.customField.findUnique({
      where: {
        name_userType: {
          name: data.name,
          userType: data.userType
        }
      }
    });

    if (existingField) {
      throw new Error(`Ya existe un campo "${data.name}" para el tipo de usuario ${data.userType}`);
    }

    return prisma.customField.create({
      data: {
        name: data.name,
        fieldType: data.fieldType,
        userType: data.userType,
        required: data.required || false,
        isPublicByDefault: data.isPublicByDefault || false,
        allowUserPrivacy: data.allowUserPrivacy !== false, // true por defecto
        options: data.options ? JSON.stringify(data.options) : undefined,
        validation: data.validation ? JSON.stringify(data.validation) : undefined,
        placeholder: data.placeholder,
        description: data.description,
        order: data.order || 0,
        createdBy
      }
    });
  }

  // Obtener todos los campos personalizados
  async getAllCustomFields(userType?: UserRole, activeOnly: boolean = true) {
    const where: any = {};
    if (userType) where.userType = userType;
    if (activeOnly) where.isActive = true;

    return prisma.customField.findMany({
      where,
      orderBy: [
        { userType: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  // Obtener campos por tipo de usuario con información de uso
  async getCustomFieldsByUserType(userType: UserRole, activeOnly: boolean = true): Promise<CustomFieldWithUsage[]> {
    const where: any = { userType };
    if (activeOnly) where.isActive = true;

    const fields = await prisma.customField.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Obtener estadísticas de uso para cada campo
    const fieldsWithUsage = await Promise.all(
      fields.map(async (field) => {
        let usageCount = 0;

        // Contar cuántos usuarios tienen valor para este campo según el tipo
        switch (userType) {
          case UserRole.EMPLEADO_PUBLICO:
            const employeeCount = await prisma.employee.count({
              where: {
                customFields: {
                  path: [`$.${field.id}`],
                  not: undefined
                }
              }
            });
            usageCount = employeeCount;
            break;

          case UserRole.EMPRESA:
            const companyCount = await prisma.company.count({
              where: {
                customFields: {
                  path: [`$.${field.id}`],
                  not: undefined
                }
              }
            });
            usageCount = companyCount;
            break;

          case UserRole.ADMINISTRACION_PUBLICA:
            const adminCount = await prisma.publicAdministration.count({
              where: {
                customFields: {
                  path: [`$.${field.id}`],
                  not: undefined
                }
              }
            });
            usageCount = adminCount;
            break;
        }

        return {
          ...field,
          options: field.options ? JSON.parse(field.options as string) : undefined,
          validation: field.validation ? JSON.parse(field.validation as string) : undefined,
          placeholder: field.placeholder || undefined,
          description: field.description || undefined,
          usageCount
        };
      })
    );

    return fieldsWithUsage;
  }

  // Obtener campo por ID
  async getCustomFieldById(id: string) {
    const field = await prisma.customField.findUnique({
      where: { id }
    });

    if (!field) {
      return null;
    }

    return {
      ...field,
      options: field.options ? JSON.parse(field.options as string) : undefined,
      validation: field.validation ? JSON.parse(field.validation as string) : undefined
    };
  }

  // Actualizar campo personalizado
  async updateCustomField(id: string, data: UpdateCustomFieldData) {
    const field = await prisma.customField.findUnique({
      where: { id }
    });

    if (!field) {
      throw new Error('Campo personalizado no encontrado');
    }

    // Si se cambia el nombre, verificar que no existe otro con ese nombre para el mismo tipo
    if (data.name && data.name !== field.name) {
      const existingField = await prisma.customField.findUnique({
        where: {
          name_userType: {
            name: data.name,
            userType: field.userType
          }
        }
      });

      if (existingField) {
        throw new Error(`Ya existe un campo "${data.name}" para el tipo de usuario ${field.userType}`);
      }
    }

    const updateData: any = { ...data };
    if (data.options) updateData.options = JSON.stringify(data.options);
    if (data.validation) updateData.validation = JSON.stringify(data.validation);

    return prisma.customField.update({
      where: { id },
      data: updateData
    });
  }

  // Eliminar campo personalizado
  async deleteCustomField(id: string) {
    const field = await prisma.customField.findUnique({
      where: { id }
    });

    if (!field) {
      throw new Error('Campo personalizado no encontrado');
    }

    // Verificar si el campo está siendo usado
    const usage = await this.getFieldUsage(id, field.userType);
    if (usage > 0) {
      throw new Error(`No se puede eliminar el campo. Está siendo usado por ${usage} usuarios. Desactívalo en su lugar.`);
    }

    return prisma.customField.delete({
      where: { id }
    });
  }

  // Activar/Desactivar campo
  async toggleCustomFieldStatus(id: string) {
    const field = await prisma.customField.findUnique({
      where: { id }
    });

    if (!field) {
      throw new Error('Campo personalizado no encontrado');
    }

    return prisma.customField.update({
      where: { id },
      data: {
        isActive: !field.isActive
      }
    });
  }

  // Reordenar campos
  async reorderCustomFields(userType: UserRole, fieldOrders: { id: string; order: number }[]) {
    // Actualizar el orden de múltiples campos en una transacción
    const updatePromises = fieldOrders.map(({ id, order }) =>
      prisma.customField.update({
        where: { id },
        data: { order }
      })
    );

    return prisma.$transaction(updatePromises);
  }

  // Obtener estadísticas de uso de un campo
  private async getFieldUsage(fieldId: string, userType: UserRole): Promise<number> {
    switch (userType) {
      case UserRole.EMPLEADO_PUBLICO:
        return prisma.employee.count({
          where: {
            customFields: {
              path: [`$.${fieldId}`],
              not: undefined
            }
          }
        });

      case UserRole.EMPRESA:
        return prisma.company.count({
          where: {
            customFields: {
              path: [`$.${fieldId}`],
              not: undefined
            }
          }
        });

      case UserRole.ADMINISTRACION_PUBLICA:
        return prisma.publicAdministration.count({
          where: {
            customFields: {
              path: [`$.${fieldId}`],
              not: undefined
            }
          }
        });

      default:
        return 0;
    }
  }

  // Validar valor de campo personalizado
  async validateCustomFieldValue(fieldId: string, value: any): Promise<{ isValid: boolean; error?: string }> {
    const field = await this.getCustomFieldById(fieldId);

    if (!field) {
      return { isValid: false, error: 'Campo no encontrado' };
    }

    // Validar campo requerido
    if (field.required && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: 'Este campo es obligatorio' };
    }

    // Validar tipo de campo
    switch (field.fieldType) {
      case CustomFieldType.EMAIL:
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, error: 'Formato de email inválido' };
        }
        break;

      case CustomFieldType.URL:
        if (value && !/^https?:\/\/.+/.test(value)) {
          return { isValid: false, error: 'Formato de URL inválido' };
        }
        break;

      case CustomFieldType.NUMBER:
        if (value && isNaN(Number(value))) {
          return { isValid: false, error: 'Debe ser un número válido' };
        }
        break;

      case CustomFieldType.SELECT:
        if (value && field.options && !field.options.includes(value)) {
          return { isValid: false, error: 'Valor no válido para este campo' };
        }
        break;

      case CustomFieldType.MULTISELECT:
        if (value && field.options && Array.isArray(value)) {
          const invalidValues = value.filter(v => !field.options.includes(v));
          if (invalidValues.length > 0) {
            return { isValid: false, error: 'Algunos valores no son válidos para este campo' };
          }
        }
        break;
    }

    // Validaciones adicionales según las reglas
    if (field.validation) {
      const rules = field.validation;

      if (rules.minLength && value && value.length < rules.minLength) {
        return { isValid: false, error: `Mínimo ${rules.minLength} caracteres` };
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        return { isValid: false, error: `Máximo ${rules.maxLength} caracteres` };
      }

      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        return { isValid: false, error: rules.patternMessage || 'Formato no válido' };
      }
    }

    return { isValid: true };
  }

  // Obtener estadísticas generales de campos personalizados
  async getCustomFieldStats() {
    const [
      totalFields,
      activeFields,
      fieldsByType,
      fieldsByUserType
    ] = await Promise.all([
      prisma.customField.count(),
      prisma.customField.count({ where: { isActive: true } }),
      prisma.customField.groupBy({
        by: ['fieldType'],
        _count: { fieldType: true }
      }),
      prisma.customField.groupBy({
        by: ['userType'],
        _count: { userType: true }
      })
    ]);

    return {
      total: totalFields,
      active: activeFields,
      inactive: totalFields - activeFields,
      byFieldType: fieldsByType,
      byUserType: fieldsByUserType
    };
  }
}