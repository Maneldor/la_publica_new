import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Interfaces para el paquete personalizado
interface SelectedFeature {
  featureId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PricingData {
  basePlanPrice: number;
  featuresSubtotal: number;
  subtotal: number;
  discountAmount: number;
  totalMonthly: number;
  totalAnnual: number;
  setupFees: number;
  annualSavings: number;
}

interface CustomPackageRequest {
  basePlan: 'STANDARD' | 'PREMIUM';
  features: SelectedFeature[];
  discountPercent: number;
  notes: string;
  status: 'draft' | 'proposed' | 'active';
  pricing: PricingData;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verificar que es admin
    // if (session.user.role !== UserRole.ADMIN) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const companyId = params.id;
    const body: CustomPackageRequest = await request.json();

    // Validar datos
    if (!body.basePlan || !body.features || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Para desarrollo, simular creación de paquete
    // TODO: Implementar con base de datos real
    const mockCustomPackage = {
      id: `pkg_${Date.now()}`,
      companyId,
      name: `Paquete Personalizado ${body.basePlan}`,
      description: `Paquete empresarial basado en ${body.basePlan} con ${body.features.length} extras`,

      // Plan base
      basePlan: body.basePlan,

      // Pricing
      basePrice: body.pricing.basePlanPrice,
      totalMonthly: body.pricing.totalMonthly,
      totalAnnual: body.pricing.totalAnnual,
      setupFees: body.pricing.setupFees,

      // Descuentos
      discountPercent: body.discountPercent,
      discountReason: body.discountPercent > 0 ? 'Descompte negociat' : null,

      // Estado
      status: body.status,
      proposedAt: body.status === 'proposed' ? new Date() : null,
      activatedAt: body.status === 'active' ? new Date() : null,

      // Metadata
      notes: body.notes,
      createdBy: session.user.id,

      // Items del paquete
      items: body.features.map(feature => ({
        id: `item_${Date.now()}_${feature.featureId}`,
        featureId: feature.featureId,
        quantity: feature.quantity,
        unitPrice: feature.unitPrice,
        totalPrice: feature.totalPrice,
        notes: null
      })),

      createdAt: new Date(),
      updatedAt: new Date()
    };

    // En producción, aquí se guardaría en la base de datos:
    /*
    const customPackage = await prisma.customPackage.create({
      data: {
        companyId,
        name: mockCustomPackage.name,
        description: mockCustomPackage.description,
        basePrice: mockCustomPackage.basePrice,
        totalMonthly: mockCustomPackage.totalMonthly,
        totalAnnual: mockCustomPackage.totalAnnual,
        setupFees: mockCustomPackage.setupFees,
        discountPercent: body.discountPercent,
        discountReason: mockCustomPackage.discountReason,
        status: body.status,
        proposedAt: mockCustomPackage.proposedAt,
        activatedAt: mockCustomPackage.activatedAt,
        notes: body.notes,
        createdBy: session.user.id,
        items: {
          create: body.features.map(feature => ({
            featureId: feature.featureId,
            quantity: feature.quantity,
            unitPrice: feature.unitPrice,
            totalPrice: feature.totalPrice
          }))
        }
      },
      include: {
        items: {
          include: {
            feature: true
          }
        }
      }
    });

    // Si se activa, actualizar la empresa
    if (body.status === 'active') {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          hasCustomPlan: true,
          subscriptionPlan: 'EMPRESARIAL'
        }
      });
    }
    */

    return NextResponse.json({
      success: true,
      message: body.status === 'active' ? 'Pla personalitzat activat' : 'Proposta creada correctament',
      data: mockCustomPackage
    });

  } catch (error) {
    console.error('Error creating custom package:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Para desarrollo, retornar mock data
    // TODO: Implementar con base de datos real
    const mockCustomPackage = {
      id: `pkg_${companyId}`,
      companyId,
      name: 'Paquete Personalizado Premium',
      description: 'Paquete empresarial con funcionalidades avançades',

      // Plan base
      basePlan: 'PREMIUM',

      // Pricing
      basePrice: 149,
      totalMonthly: 508,
      totalAnnual: 6096,
      setupFees: 0,

      // Descuentos
      discountPercent: 10,
      discountReason: 'Cliente VIP',

      // Estado
      status: 'active',
      proposedAt: new Date('2024-01-15'),
      activatedAt: new Date('2024-01-20'),

      // Metadata
      notes: 'Cliente grande, ayuntamiento. Negociado 10% descuento por compromiso anual.',
      createdBy: session.user.id,

      // Items de ejemplo
      items: [
        {
          id: 'item_1',
          featureId: 'storage_50gb',
          quantity: 1,
          unitPrice: 40,
          totalPrice: 40,
          feature: {
            key: 'storage_50gb',
            name: 'Storage +50 GB',
            description: 'Paquet gran d\'emmagatzematge',
            icon: '💾'
          }
        },
        {
          id: 'item_2',
          featureId: 'members_10',
          quantity: 1,
          unitPrice: 45,
          totalPrice: 45,
          feature: {
            key: 'members_10',
            name: '+10 Membres',
            description: 'Equip gran per a departaments',
            icon: '👥'
          }
        }
      ],

      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    };

    // En producción:
    /*
    const customPackage = await prisma.customPackage.findUnique({
      where: { companyId },
      include: {
        items: {
          include: {
            feature: true
          }
        },
        company: true
      }
    });

    if (!customPackage) {
      return NextResponse.json(
        { error: 'Custom package not found' },
        { status: 404 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      data: mockCustomPackage
    });

  } catch (error) {
    console.error('Error fetching custom package:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Para desarrollo, simular eliminación
    // TODO: Implementar con base de datos real
    /*
    await prisma.customPackage.delete({
      where: { companyId }
    });

    // Revertir empresa a plan estándar
    await prisma.company.update({
      where: { id: companyId },
      data: {
        hasCustomPlan: false,
        subscriptionPlan: 'PREMIUM' // O el plan que tenía antes
      }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Paquete personalizado eliminado'
    });

  } catch (error) {
    console.error('Error deleting custom package:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}