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
      select: { role: true, isActive: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'];
    if (!user || !adminRoles.includes(user.role)) {
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

    // Transformar dades per la UI
    const invoicesForUI = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const pending = Number(invoice.totalAmount) - totalPaid;
      const amount = Number(invoice.totalAmount) / 100; // Centims a euros
      const paidAmountEuros = totalPaid / 100;
      const pendingEuros = pending / 100;

      return {
        id: invoice.id,
        number: invoice.invoiceNumber, // Mapping per la UI
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientCif: invoice.clientCif,
        clientAddress: invoice.clientAddress,
        clientPhone: invoice.clientPhone,
        clientCity: invoice.clientCity,
        clientPostalCode: invoice.clientPostalCode,
        amount: amount, // En euros
        paidAmount: paidAmountEuros, // En euros
        pendingAmount: pendingEuros, // En euros
        subtotal: Number(invoice.subtotalAmount) / 100,
        taxAmount: Number(invoice.taxAmount) / 100,
        taxRate: invoice.taxRate,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        status: invoice.status,
        concept: invoice.concept,
        description: invoice.concept, // Alias per la UI
        notes: invoice.notes,
        items: invoice.items.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice) / 100,
          subtotalAmount: Number(item.subtotalAmount) / 100,
          taxAmount: Number(item.taxAmount) / 100,
          totalAmount: Number(item.totalAmount) / 100,
        })),
        payments: invoice.payments,
        company: invoice.company,
        isOverdue: invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date(),
        paymentProgress: amount > 0 ? (paidAmountEuros / amount) * 100 : 0,
      };
    });

    return NextResponse.json({
      success: true,
      invoices: invoicesForUI,
      total: invoicesForUI.length,
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
      select: { role: true, isActive: true }
    });

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'];
    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Si és una petició de seed
    if (body.action === 'seed') {
      return await seedExampleInvoices()
    }

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

        createdById: session.user.id,
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

// Funció per crear factures d'exemple
async function seedExampleInvoices() {
  try {
    // Obtenir una empresa existent
    const company = await prismaClient.company.findFirst({
      where: { isActive: true }
    })

    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'No hi ha empreses actives. Crea una empresa primer.'
      }, { status: 400 })
    }

    // Obtenir un usuari admin
    const adminUser = await prismaClient.user.findFirst({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'] },
        isActive: true
      }
    })

    // Eliminar factures d'exemple anteriors
    await prismaClient.invoiceItem.deleteMany({
      where: { invoice: { invoiceNumber: { startsWith: 'EXEMPLE-' } } }
    })
    await prismaClient.invoice.deleteMany({
      where: { invoiceNumber: { startsWith: 'EXEMPLE-' } }
    })

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 10)

    const exampleInvoices = [
      {
        invoiceNumber: 'EXEMPLE-2024-001',
        invoiceSeries: 'E',
        companyId: company.id,
        status: 'PAID' as const,
        issueDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(twoMonthsAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
        clientName: company.name,
        clientCif: company.cif || 'B12345678',
        clientEmail: company.email || 'client@example.com',
        clientAddress: company.address || 'Carrer Exemple, 123',
        clientCity: 'Barcelona',
        clientPostalCode: '08001',
        concept: 'Subscripció Pla Estàndard - Anual',
        subtotalAmount: 25000,
        taxRate: 21.0,
        taxAmount: 5250,
        totalAmount: 30250,
        paidAmount: 30250,
        pendingAmount: 0,
        createdById: adminUser?.id,
        items: {
          create: [
            {
              description: 'Pla Estàndard - Subscripció Anual',
              quantity: 1,
              unitPrice: 25000,
              subtotalAmount: 25000,
              taxRate: 21.0,
              taxAmount: 5250,
              totalAmount: 30250,
              order: 1,
              itemType: 'PLAN' as const
            }
          ]
        }
      },
      {
        invoiceNumber: 'EXEMPLE-2024-002',
        invoiceSeries: 'E',
        companyId: company.id,
        status: 'SENT' as const,
        issueDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        clientName: 'Empresa Demo SL',
        clientCif: 'B87654321',
        clientEmail: 'demo@empresa.cat',
        clientAddress: 'Avinguda Diagonal, 456',
        clientCity: 'Barcelona',
        clientPostalCode: '08006',
        concept: 'Serveis de Màrqueting Digital',
        subtotalAmount: 150000,
        taxRate: 21.0,
        taxAmount: 31500,
        totalAmount: 181500,
        paidAmount: 0,
        pendingAmount: 181500,
        createdById: adminUser?.id,
        items: {
          create: [
            {
              description: 'Gestió de xarxes socials - Mensual',
              quantity: 1,
              unitPrice: 80000,
              subtotalAmount: 80000,
              taxRate: 21.0,
              taxAmount: 16800,
              totalAmount: 96800,
              order: 1,
              itemType: 'CUSTOM' as const
            },
            {
              description: 'Campanyes Google Ads',
              quantity: 1,
              unitPrice: 70000,
              subtotalAmount: 70000,
              taxRate: 21.0,
              taxAmount: 14700,
              totalAmount: 84700,
              order: 2,
              itemType: 'CUSTOM' as const
            }
          ]
        }
      },
      {
        invoiceNumber: 'EXEMPLE-2024-003',
        invoiceSeries: 'E',
        companyId: company.id,
        status: 'OVERDUE' as const,
        issueDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        clientName: 'Consultoria BCN SA',
        clientCif: 'A11223344',
        clientEmail: 'admin@consultoriabcn.com',
        clientAddress: 'Passeig de Gràcia, 100',
        clientCity: 'Barcelona',
        clientPostalCode: '08008',
        concept: 'Desenvolupament Web Corporatiu',
        subtotalAmount: 350000,
        taxRate: 21.0,
        taxAmount: 73500,
        totalAmount: 423500,
        paidAmount: 100000,
        pendingAmount: 323500,
        createdById: adminUser?.id,
        items: {
          create: [
            {
              description: 'Disseny i maquetació web',
              quantity: 40,
              unitPrice: 5000,
              subtotalAmount: 200000,
              taxRate: 21.0,
              taxAmount: 42000,
              totalAmount: 242000,
              order: 1,
              itemType: 'CUSTOM' as const
            },
            {
              description: 'Desenvolupament backend',
              quantity: 30,
              unitPrice: 5000,
              subtotalAmount: 150000,
              taxRate: 21.0,
              taxAmount: 31500,
              totalAmount: 181500,
              order: 2,
              itemType: 'CUSTOM' as const
            }
          ]
        }
      },
      {
        invoiceNumber: 'EXEMPLE-2024-004',
        invoiceSeries: 'E',
        companyId: company.id,
        status: 'DRAFT' as const,
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        clientName: 'StartUp Innovació SL',
        clientCif: 'B99887766',
        clientEmail: 'hola@startupinnovacio.cat',
        clientAddress: 'Carrer de la Innovació, 22',
        clientCity: 'Terrassa',
        clientPostalCode: '08221',
        concept: 'Pla Enterprise + Serveis Extra',
        subtotalAmount: 220000,
        taxRate: 21.0,
        taxAmount: 46200,
        totalAmount: 266200,
        paidAmount: 0,
        pendingAmount: 266200,
        createdById: adminUser?.id,
        items: {
          create: [
            {
              description: 'Pla Enterprise - Anual',
              quantity: 1,
              unitPrice: 200000,
              subtotalAmount: 200000,
              taxRate: 21.0,
              taxAmount: 42000,
              totalAmount: 242000,
              order: 1,
              itemType: 'PLAN' as const
            },
            {
              description: 'Suport Premium - Mensual',
              quantity: 1,
              unitPrice: 20000,
              subtotalAmount: 20000,
              taxRate: 21.0,
              taxAmount: 4200,
              totalAmount: 24200,
              order: 2,
              itemType: 'EXTRA' as const
            }
          ]
        }
      }
    ]

    let created = 0
    for (const invoiceData of exampleInvoices) {
      await prismaClient.invoice.create({ data: invoiceData })
      created++
    }

    return NextResponse.json({
      success: true,
      message: `S'han creat ${created} factures d'exemple correctament.`,
      created
    })
  } catch (error) {
    console.error('Error seeding invoices:', error)
    return NextResponse.json({
      success: false,
      error: 'Error creant factures d\'exemple'
    }, { status: 500 })
  }
}