import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/admin/invoices
 * Lista todas las facturas con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');
    const overdue = searchParams.get('overdue'); // filtro especial para vencidas

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
        { clientName: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Filtro especial: facturas vencidas
    if (overdue === 'true') {
      where.status = 'SENT';
      where.dueDate = { lt: new Date() };
    }

    const invoices = await prismaClient.invoice.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            cif: true,
          },
        },
        items: {
          orderBy: { order: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    // Calcular totales pagados
    const invoicesWithPaymentInfo = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const pending = Number(invoice.totalAmount) - totalPaid;

      return {
        ...invoice,
        totalPaid,
        pending,
        isOverdue: invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date(),
      };
    });

    return NextResponse.json({
      success: true,
      invoices: invoicesWithPaymentInfo,
      total: invoicesWithPaymentInfo.length,
    });

  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invoices
 * Crea una nueva factura manualmente (no desde presupuesto)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar campos requeridos
    if (!body.companyId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener empresa
    const company = await prismaClient.company.findUnique({
      where: { id: body.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
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

    // Calcular totales
    let subtotal = 0;

    for (const item of body.items) {
      const itemSubtotal = (item.quantity || 1) * item.unitPrice;
      subtotal += itemSubtotal;
    }

    const taxRate = 21.0;
    const taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
    const total = subtotal + taxAmount;

    // Crear factura
    const invoice = await prismaClient.invoice.create({
      data: {
        invoiceNumber,
        invoiceSeries: year.toString(),
        companyId: body.companyId,
        status: body.status || 'DRAFT',

        // Fechas
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        dueDate: body.dueDate
          ? new Date(body.dueDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        // Importes (convertir a centavos)
        subtotalAmount: Math.round(subtotal * 100),
        taxAmount: Math.round(taxAmount * 100),
        totalAmount: Math.round(total * 100),
        taxRate: taxRate,
        taxType: 'IVA',
        pendingAmount: Math.round(total * 100),

        // Datos fiscales cliente
        clientName: body.clientName || company.name,
        clientCif: body.clientCif || company.cif,
        clientEmail: body.clientEmail || company.email,
        clientAddress: body.clientAddress || company.address || '',
        clientCity: body.clientCity || 'Barcelona',
        clientPostalCode: body.clientPostalCode || '08001',
        clientCountry: 'España',

        concept: body.concept || 'Servicios profesionales',
        notes: body.notes,

        // Items
        items: {
          create: body.items.map((item: any, index: number) => {
            const itemQuantity = item.quantity || 1;
            const itemUnitPrice = item.unitPrice;
            const itemSubtotal = itemQuantity * itemUnitPrice;

            return {
              order: index,
              itemType: item.itemType || 'CUSTOM',
              planId: item.planId || null,
              extraId: item.extraId || null,
              description: item.description,
              quantity: itemQuantity,
              unitPrice: Math.round(itemUnitPrice * 100), // En centavos
              subtotal: Math.round(itemSubtotal * 100),   // En centavos
            };
          }),
        },

        createdBy: session.user.id,
      },
      include: {
        company: true,
        items: true,
      },
    });

    console.log('✅ Factura creada manualmente:', invoiceNumber);

    return NextResponse.json({
      success: true,
      invoice,
      message: `Factura ${invoiceNumber} creada correctamente`,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    return NextResponse.json(
      {
        error: 'Error al crear factura',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}