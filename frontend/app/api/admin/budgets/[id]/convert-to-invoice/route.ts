import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * POST /api/admin/budgets/[id]/convert-to-invoice
 * Convierte presupuesto aprobado en factura
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true, id: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const budget = await prismaClient.budget.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        items: {
          include: {
            plan: true,
            extra: true,
          },
        },
        invoice: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    if (budget.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Solo se pueden facturar presupuestos aprobados' },
        { status: 400 }
      );
    }

    if (budget.invoice) {
      return NextResponse.json(
        { error: 'Este presupuesto ya ha sido facturado' },
        { status: 400 }
      );
    }

    // Generar número de factura
    const year = new Date().getFullYear();
    const lastInvoice = await prismaClient.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `FAC-${year}-`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `FAC-${year}-${nextNumber.toString().padStart(3, '0')}`;

    // Crear factura
    const invoice = await prismaClient.invoice.create({
      data: {
        invoiceNumber,
        invoiceSeries: year.toString(),
        companyId: budget.companyId,
        invoiceType: 'REGULAR',
        status: 'SENT',

        // Fechas
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días

        // Importes (convertir Decimal a number)
        subtotalAmount: Number(budget.subtotal),
        taxRate: Number(budget.taxRate),
        taxAmount: Number(budget.taxAmount),
        totalAmount: Number(budget.total),
        discountAmount: budget.discountAmount ? Number(budget.discountAmount) : 0,
        pricesIncludeVAT: true,

        // Datos fiscales cliente
        clientName: budget.clientName,
        clientCif: budget.clientNIF || budget.company.cif,
        clientEmail: budget.clientEmail || budget.company.email,
        clientAddress: budget.company.address || '',
        clientCity: (budget.company as any).city || '',
        clientPostalCode: (budget.company as any).postalCode || '',

        // Campos requeridos faltantes
        concept: `Factura per pressupost ${budget.budgetNumber}`,
        pendingAmount: Number(budget.total),

        // Datos fiscales emisor (La Pública)
        issuerName: 'La Pública',
        issuerCif: 'B12345678',
        issuerAddress: 'Carrer Example 123',
        issuerEmail: 'facturacio@lapublica.cat',

        // Texto legal
        legalText: 'Factura emesa conforme a la Llei 37/1992 de l\'IVA',

        // Crear items de factura desde presupuesto
        items: {
          create: budget.items.map((item, index) => ({
            order: index,
            itemType: item.itemType as any,
            planId: item.planId,
            extraId: item.extraId,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            subtotalAmount: Number(item.subtotal),
            taxAmount: Math.round((Number(item.subtotal) * 21) / 100), // IVA 21%
            totalAmount: Math.round(Number(item.subtotal) * 1.21), // Subtotal con IVA 21%
            discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          })),
        },

        createdById: user.id,
      },
      include: {
        items: true,
        company: true,
      },
    });

    // Actualizar presupuesto
    await prismaClient.budget.update({
      where: { id: params.id },
      data: {
        status: 'INVOICED',
        invoiceId: invoice.id,
      },
    });

    console.log('✅ Factura creada desde presupuesto:', invoiceNumber);

    return NextResponse.json({
      success: true,
      invoice,
      message: `Factura ${invoiceNumber} creada correctamente`,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error converting budget to invoice:', error);
    return NextResponse.json(
      {
        error: 'Error al convertir a factura',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}