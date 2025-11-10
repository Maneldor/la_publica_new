import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Obtener datos completos de una empresa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const empresaId = params.id;

    // Mock de datos completos de empresa para desarrollo
    // TODO: Reemplazar con consulta real a la base de datos
    const mockEmpresa = {
      id: empresaId,
      // Datos básicos
      name: empresaId === 'emp_1' ? 'TechSolutions BCN' :
            empresaId === 'emp_2' ? 'Construcciones Modernos SA' :
            empresaId === 'emp_3' ? 'Consultoría Legal BCN' :
            'Empresa Test',
      email: empresaId === 'emp_1' ? 'info@techsolutions.cat' :
             empresaId === 'emp_2' ? 'contacte@modernos.es' :
             empresaId === 'emp_3' ? 'info@legalbcn.cat' :
             'test@empresa.cat',
      sector: empresaId === 'emp_1' ? 'tecnologia' :
              empresaId === 'emp_2' ? 'construccion' :
              empresaId === 'emp_3' ? 'servicios' :
              'otros',
      size: empresaId === 'emp_1' ? 'mediana' :
            empresaId === 'emp_2' ? 'grande' :
            empresaId === 'emp_3' ? 'pequeña' :
            'startup',

      // Plan de suscripción
      subscriptionPlan: empresaId === 'emp_1' ? 'PROFESSIONAL' :
                       empresaId === 'emp_2' ? 'PREMIUM' :
                       empresaId === 'emp_3' ? 'BASIC' :
                       'STARTER',
      planFeatures: {
        maxUsers: empresaId === 'emp_1' ? 50 : 10,
        storage: empresaId === 'emp_1' ? '100GB' : '10GB',
        support: empresaId === 'emp_1' ? 'priority' : 'standard',
        customDomain: empresaId === 'emp_1' ? true : false,
      },

      // Información de contacto
      phone: empresaId === 'emp_1' ? '+34 934 567 890' :
             empresaId === 'emp_2' ? '+34 933 123 456' :
             '+34 934 000 000',
      website: empresaId === 'emp_1' ? 'https://techsolutions.cat' :
               empresaId === 'emp_2' ? 'https://modernos.es' :
               '',

      // Dirección
      address: {
        street: empresaId === 'emp_1' ? 'Carrer de la Tecnologia, 123' :
                empresaId === 'emp_2' ? 'Avinguda de la Construcció, 45' :
                'Carrer Principal, 1',
        city: 'Barcelona',
        postalCode: empresaId === 'emp_1' ? '08001' : '08002',
        province: 'Barcelona',
        country: 'España'
      },

      // Detalles adicionales
      description: empresaId === 'emp_1' ?
        'Empresa especializada en desarrollo de software para el sector público' :
        empresaId === 'emp_2' ?
        'Constructora especializada en obras públicas e infraestructuras' :
        'Asesoría jurídica especializada en derecho administrativo',

      foundedYear: empresaId === 'emp_1' ? 2018 :
                   empresaId === 'emp_2' ? 2005 :
                   2020,
      employeeCount: empresaId === 'emp_1' ? 45 :
                     empresaId === 'emp_2' ? 150 :
                     8,

      // Datos fiscales
      cif: empresaId === 'emp_1' ? 'B12345678' :
           empresaId === 'emp_2' ? 'A87654321' :
           'B11111111',

      // Configuración
      slogan: empresaId === 'emp_1' ?
        'Innovación tecnológica para el sector público' :
        'Construyendo el futuro',
      services: empresaId === 'emp_1' ?
        ['Desarrollo web', 'Apps móviles', 'Consultoría IT', 'Soporte técnico'] :
        ['Obra civil', 'Edificación', 'Reformas', 'Mantenimiento'],

      // Estado y verificación
      isVerified: empresaId === 'emp_1' || empresaId === 'emp_2',
      isFeatured: empresaId === 'emp_1',
      isPinned: false,
      isActive: true,
      status: 'active' as const,

      // Metadatos
      createdAt: empresaId === 'emp_1' ? '2024-01-15T10:00:00Z' :
                 empresaId === 'emp_2' ? '2024-02-10T14:30:00Z' :
                 '2024-03-05T09:15:00Z',
      updatedAt: new Date().toISOString(),

      // Estadísticas
      stats: {
        totalProjects: empresaId === 'emp_1' ? 28 : 15,
        activeProjects: empresaId === 'emp_1' ? 5 : 3,
        completedProjects: empresaId === 'emp_1' ? 23 : 12,
        teamMembers: empresaId === 'emp_1' ? 45 :
                     empresaId === 'emp_2' ? 150 : 8
      }
    };

    return NextResponse.json(mockEmpresa);

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar datos de empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const empresaId = params.id;

    // TODO: Implementar actualización real en base de datos
    console.log('Actualizando empresa:', empresaId, data);

    // Simular respuesta exitosa
    const empresaActualizada = {
      id: empresaId,
      ...data,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      empresa: empresaActualizada,
      message: 'Empresa actualizada correctamente'
    });

  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Error al actualizar empresa' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar empresa (opcional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const empresaId = params.id;

    // TODO: Implementar eliminación real en base de datos
    console.log('Eliminando empresa:', empresaId);

    return NextResponse.json({
      success: true,
      message: 'Empresa eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Error al eliminar empresa' },
      { status: 500 }
    );
  }
}