import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/admin/budgets
 * Lista todos los presupuestos con filtros
 */
export async function GET(request: NextRequest) {
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

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { budgetNumber: { contains: search, mode: 'insensitive' as const } },
        { clientName: { contains: search, mode: 'insensitive' as const } },
        { clientEmail: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const budgets = await prismaClient.budget.findMany({
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
          include: {
            plan: true,
            extra: true,
          },
          orderBy: { order: 'asc' },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      budgets,
      total: budgets.length,
    });

  } catch (error) {
    console.error('❌ Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuestos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/budgets
 * Crea un nuevo presupuesto con cálculos automáticos
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validar campos requeridos
    if (!body.companyId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (companyId, items)' },
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

    // Generar número de presupuesto
    const year = new Date().getFullYear();
    const lastBudget = await prismaClient.budget.findFirst({
      where: {
        budgetNumber: {
          startsWith: `PRE-${year}-`,
        },
      },
      orderBy: { budgetNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastBudget) {
      const lastNumber = parseInt(lastBudget.budgetNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const budgetNumber = `PRE-${year}-${nextNumber.toString().padStart(3, '0')}`;

    // Calcular totales
    let subtotal = new Decimal(0);

    for (const item of body.items) {
      const itemSubtotal = new Decimal(item.quantity || 1).mul(new Decimal(item.unitPrice));
      subtotal = subtotal.add(itemSubtotal);
    }

    // Aplicar descuento si existe
    if (body.discountAmount) {
      subtotal = subtotal.sub(new Decimal(body.discountAmount));
    }

    const taxRate = new Decimal(21.00);
    const taxAmount = subtotal.mul(taxRate).div(100);
    const total = subtotal.add(taxAmount);

    // Crear presupuesto
    const budget = await prismaClient.budget.create({
      data: {
        budgetNumber,
        companyId: body.companyId,
        status: body.status || 'DRAFT',

        // Fechas
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        validUntil: body.validUntil
          ? new Date(body.validUntil)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días

        // Datos cliente
        clientName: body.clientName || company.name,
        clientEmail: body.clientEmail || company.email || '',
        clientPhone: body.clientPhone || company.phone,
        clientNIF: body.clientNIF || company.cif,

        // Importes
        subtotal: subtotal.toNumber(),
        taxRate: taxRate.toNumber(),
        taxAmount: taxAmount.toNumber(),
        discountAmount: body.discountAmount ? new Decimal(body.discountAmount).toNumber() : null,
        total: total.toNumber(),

        // Notas
        notes: body.notes,
        internalNotes: body.internalNotes,
        terms: body.terms || 'Preu vàlid per 30 dies. IVA inclòs.',

        // Crear items
        items: {
          create: body.items.map((item: any, index: number) => {
            const itemQuantity = new Decimal(item.quantity || 1);
            const itemUnitPrice = new Decimal(item.unitPrice);
            const itemSubtotal = itemQuantity.mul(itemUnitPrice);

            return {
              order: index,
              itemType: item.itemType,
              planId: item.planId || null,
              extraId: item.extraId || null,
              description: item.description,
              quantity: itemQuantity.toNumber(),
              unitPrice: itemUnitPrice.toNumber(),
              subtotal: itemSubtotal.toNumber(),
              billingCycle: item.billingCycle || null,
              discountPercent: item.discountPercent || null,
            };
          }),
        },

        createdBy: user.id,
      },
      include: {
        company: true,
        items: {
          include: {
            plan: true,
            extra: true,
          },
        },
      },
    });

    console.log('✅ Presupuesto creado:', budgetNumber);

    return NextResponse.json({
      success: true,
      budget,
      message: 'Presupuesto creado correctamente',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating budget:', error);
    return NextResponse.json(
      {
        error: 'Error al crear presupuesto',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}