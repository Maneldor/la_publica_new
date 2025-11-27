import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Reemplazar con consulta real a la base de datos
    const mockEmpresas = [
      {
        id: 'emp_1',
        name: 'TechSolutions BCN',
        description: 'Empresa especializada en desarrollo de software para el sector público',
        sector: 'tecnologia',
        size: 'mediana',
        email: 'info@techsolutions.cat',
        phone: '+34 934 567 890',
        website: 'https://techsolutions.cat',
        foundedYear: 2018,
        employeeCount: 45,
        logo: '',
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'emp_2',
        name: 'Construcciones Modernos SA',
        description: 'Constructora especializada en obras públicas e infraestructuras',
        sector: 'construccion',
        size: 'grande',
        email: 'contacte@modernos.es',
        phone: '+34 933 123 456',
        website: 'https://modernos.es',
        foundedYear: 2005,
        employeeCount: 150,
        logo: '',
        isVerified: true,
        isActive: true,
        createdAt: '2024-02-10T14:30:00Z',
        updatedAt: '2024-02-10T14:30:00Z'
      },
      {
        id: 'emp_3',
        name: 'Consultoría Legal BCN',
        description: 'Asesoría jurídica especializada en derecho administrativo',
        sector: 'servicios',
        size: 'pequeña',
        email: 'info@legalbcn.cat',
        foundedYear: 2020,
        employeeCount: 8,
        logo: '',
        isVerified: false,
        isActive: true,
        createdAt: '2024-03-05T09:15:00Z',
        updatedAt: '2024-03-05T09:15:00Z'
      }
    ];

    return NextResponse.json(mockEmpresas);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // TODO: Guardar en base de datos real
    const newEmpresa = {
      id: `emp_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newEmpresa, { status: 201 });

  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}