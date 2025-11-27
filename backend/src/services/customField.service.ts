import { UserRole } from '@prisma/client';

enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  URL = 'URL',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  TEXTAREA = 'TEXTAREA'
}
import prisma from '../config/database';

export interface CreateCustomFieldData {
  name: string;
  fieldType: CustomFieldType;
  userType: UserRole;
  required?: boolean;
  isPublicByDefault?: boolean;
  allowUserPrivacy?: boolean;
  options?: any;
  validation?: any;
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
    const existingField = await prisma.customField.findFirst({
      where: {
        fieldName: data.name,
        entityType: data.userType as any
      }
    });

    if (existingField) {
      throw new Error(`Ya existe un campo "${data.name}" para el tipo de usuario ${data.userType}`);
    }

    return prisma.customField.create({
      data: {
        fieldName: data.name,
        fieldType: data.fieldType as any,
        entityType: data.userType as any,
        entityId: '',
        fieldValue: {},
        isRequired: data.required || false,
        order: data.order || 0
      }
    });
  }

  // Obtener todos los campos personalizados
  async getAllCustomFields(userType?: UserRole, activeOnly: boolean = true) {
    const where: any = {};
    if (userType) where.entityType = userType;
    if (activeOnly) where.isActive = true;

    return prisma.customField.findMany({
      where,
      orderBy: [
        { entityType: 'asc' },
        { order: 'asc' },
        { fieldName: 'asc' }
      ]
    }) as any;
  }

  // Obtener campos por tipo de usuario con información de uso
  async getCustomFieldsByUserType(userType: UserRole, activeOnly: boolean = true): Promise<CustomFieldWithUsage[]> {
    const where: any = { entityType: userType };
    if (activeOnly) where.isActive = true;

    const fields = await prisma.customField.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { fieldName: 'asc' }
      ]
    });

    // Obtener estadísticas de uso para cada campo
    const fieldsWithUsage = await Promise.all(
      fields.map(async (field) => {
        let usageCount = 0;

        // Contar cuántos usuarios tienen valor para este campo según el tipo
        switch (userType) {
          case UserRole.EMPLEADO_PUBLICO:
            usageCount = await prisma.employee.count() || 0;
            break;

          case UserRole.COMPANY:
            usageCount = await prisma.companies.count() || 0;
            break;

          default:
            usageCount = 0;
            break;
        }

        return {
          ...field,
          name: (field as any).fieldName,
          fieldType: (field as any).fieldType,
          userType: (field as any).entityType,
          required: (field as any).isRequired,
          isPublicByDefault: false,
          allowUserPrivacy: true,
          options: undefined,
          validation: undefined,
          placeholder: undefined,
          description: undefined,
          createdBy: '',
          usageCount
        } as CustomFieldWithUsage;
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
      name: (field as any).fieldName,
      fieldType: (field as any).fieldType,
      userType: (field as any).entityType,
      required: (field as any).isRequired,
      options: undefined,
      validation: undefined
    } as any;
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
    if (data.name && data.name !== (field as any).fieldName) {
      const existingField = await prisma.customField.findFirst({
        where: {
          fieldName: data.name,
          entityType: (field as any).entityType
        }
      });

      if (existingField) {
        throw new Error(`Ya existe un campo "${data.name}" para el tipo de usuario ${(field as any).entityType}`);
      }
    }

    const updateData: any = {};
    if (data.name) updateData.fieldName = data.name;
    if (data.fieldType) updateData.fieldType = data.fieldType;
    if (data.required !== undefined) updateData.isRequired = data.required;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

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
    const usage = await this.getFieldUsage(id, (field as any).entityType);
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
        return await prisma.employee.count() || 0;

      case UserRole.COMPANY:
        return await prisma.companies.count() || 0;

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
    if ((field as any).isRequired && (value === null || value === undefined || value === '')) {
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
        by: ['entityType'],
        _count: { entityType: true }
      })
    ]) as any;

    return {
      total: totalFields,
      active: activeFields,
      inactive: totalFields - activeFields,
      byFieldType: fieldsByType,
      byUserType: fieldsByUserType
    };
  }
}