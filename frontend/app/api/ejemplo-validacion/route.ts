/**
 * API Route de ejemplo usando el sistema de validaciones Zod
 * Demuestra cómo usar las validaciones en endpoints del admin
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createUserSchema,
  createCompanySchema,
  createJobSchema,
  validateSchema,
  withValidation,
  ValidationError,
  type CreateUserInput,
  type CreateCompanyInput
} from '@/src/lib/validations';

// ==================== EJEMPLO 1: Validación manual ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'user':
        return await createUserExample(data);
      case 'company':
        return await createCompanyExample(data);
      default:
        return NextResponse.json(
          { error: 'Tipo no válido. Use: user, company' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API de ejemplo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Ejemplo de creación de usuario con validación manual
async function createUserExample(userData: unknown) {
  // Validar usando validateSchema helper
  const validation = validateSchema<CreateUserInput>(createUserSchema, userData);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Datos de usuario inválidos',
        details: validation.errors,
        message: validation.message
      },
      { status: 400 }
    );
  }

  // Los datos ya están validados y tipados
  const validUser = validation.data!;

  // Simular creación de usuario
  const createdUser = {
    id: 'user_' + Date.now(),
    firstName: validUser.firstName,
    lastName: validUser.lastName,
    email: validUser.email,
    role: validUser.role,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: createdUser
  });
}

// Ejemplo de creación de empresa con manejo de errores
async function createCompanyExample(companyData: unknown) {
  try {
    // Validar con throwOnError
    const validation = validateSchema<CreateCompanyInput>(
      createCompanySchema,
      companyData,
      { throwOnError: true }
    );

    // Si llegamos aquí, los datos son válidos
    const validCompany = validation.data!;

    // Simular creación de empresa
    const createdCompany = {
      id: 'company_' + Date.now(),
      name: validCompany.name,
      cif: validCompany.cif,
      email: validCompany.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Empresa creada exitosamente',
      data: createdCompany
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Datos de empresa inválidos',
          details: error.getFormErrors(),
          message: error.getFirstError()
        },
        { status: 400 }
      );
    }

    throw error; // Re-lanzar si no es error de validación
  }
}

// ==================== EJEMPLO 2: Usando withValidation middleware ====================

// Endpoint para crear trabajo usando el middleware de validación
export const PUT = withValidation(createJobSchema)(
  async (validatedData, request: NextRequest) => {
    // validatedData ya está validado y tipado automáticamente
    const jobData = validatedData;

    // Simular creación de oferta laboral
    const createdJob = {
      id: 'job_' + Date.now(),
      title: jobData.title,
      companyId: jobData.companyId,
      category: jobData.category,
      status: jobData.status,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Oferta laboral creada exitosamente',
      data: createdJob
    });
  }
);

// ==================== EJEMPLO 3: Validación de query parameters ====================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Schema para validar query parameters
  const querySchema = createUserSchema.pick({
    firstName: true,
    lastName: true,
    email: true
  }).partial();

  const queryData = {
    firstName: searchParams.get('firstName'),
    lastName: searchParams.get('lastName'),
    email: searchParams.get('email')
  };

  const validation = validateSchema(querySchema, queryData);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Parámetros de búsqueda inválidos',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  // Simular búsqueda de usuarios
  const mockUsers = [
    {
      id: '1',
      firstName: 'Juan',
      lastName: 'García',
      email: 'juan@lapublica.com'
    },
    {
      id: '2',
      firstName: 'María',
      lastName: 'López',
      email: 'maria@lapublica.com'
    }
  ];

  // Filtrar según parámetros validados
  const filters = validation.data!;
  let filteredUsers = mockUsers;

  if (filters.firstName) {
    filteredUsers = filteredUsers.filter(user =>
      user.firstName.toLowerCase().includes(filters.firstName!.toLowerCase())
    );
  }

  if (filters.email) {
    filteredUsers = filteredUsers.filter(user =>
      user.email.toLowerCase().includes(filters.email!.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Usuarios encontrados',
    data: filteredUsers,
    total: filteredUsers.length,
    filters: filters
  });
}

// ==================== EJEMPLO 4: Validación con transformaciones ====================
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  // Schema que transforma y valida datos
  const updateSchema = createUserSchema
    .pick({
      firstName: true,
      lastName: true,
      email: true
    })
    .partial()
    .transform((data) => ({
      ...data,
      // Transformar email a minúsculas
      email: data.email?.toLowerCase(),
      // Generar displayName automáticamente
      displayName: data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : undefined,
      // Añadir timestamp de actualización
      updatedAt: new Date().toISOString()
    }));

  const validation = validateSchema(updateSchema, body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Datos de actualización inválidos',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  const transformedData = validation.data!;

  return NextResponse.json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: transformedData,
    transformations_applied: [
      'Email convertido a minúsculas',
      'DisplayName generado automáticamente',
      'Timestamp de actualización añadido'
    ]
  });
}