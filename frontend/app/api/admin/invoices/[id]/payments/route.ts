import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/invoices/[id]/payments
 * Lista los pagos de una factura
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const payments = await prismaClient.payment.findMany({
      where: { invoiceId: params.id },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      payments,
    });

  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invoices/[id]/payments
 * Registra un nuevo pago para una factura
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!body.amount || !body.method) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (amount, method)' },
        { status: 400 }
      );
    }

    // Obtener factura
    const invoice = await prismaClient.invoice.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    const amount = Number(body.amount);

    // Calcular total pagado actual
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const pending = Number(invoice.totalAmount) - totalPaid;

    // Validar que el monto no exceda el pendiente
    if (amount > pending) {
      return NextResponse.json(
        {
          error: `El monto excede el pendiente de pago (${(pending / 100).toFixed(2)}€)`
        },
        { status: 400 }
      );
    }

    // Generar número de pago
    const paymentCount = invoice.payments.length + 1;
    const paymentNumber = `PAY-${invoice.invoiceNumber}-${paymentCount}`;

    // Crear pago
    const cents = Math.round(amount * 100);
    const payment = await prismaClient.payment.create({
      data: {
        paymentNumber,
        invoiceId: params.id,
        amount: cents,
        netAmount: cents,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        method: body.method,
        reference: body.reference || null,
        description: body.description || null,
        status: 'COMPLETED',
        notes: body.notes || null,
        processedById: session.user.id,
      },
    });

    // Calcular nuevo total pagado
    const newTotalPaid = totalPaid + Math.round(amount * 100);
    const newPending = Number(invoice.totalAmount) - newTotalPaid;

    // Si se pagó todo, marcar factura como pagada
    if (newPending <= 0) {
      await prismaClient.invoice.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          paidAmount: Number(invoice.totalAmount),
          pendingAmount: 0,
        },
      });
    } else {
      // Actualizar monto pagado y pendiente
      await prismaClient.invoice.update({
        where: { id: params.id },
        data: {
          paidAmount: newTotalPaid,
          pendingAmount: newPending,
          status: 'SENT', // Mantener como sent si no está completamente pagada
        },
      });
    }

    console.log('✅ Pago registrado:', paymentNumber, amount.toFixed(2));

    return NextResponse.json({
      success: true,
      payment,
      message: `Pago de ${amount.toFixed(2)}€ registrado correctamente`,
      invoice: {
        totalPaid: newTotalPaid / 100,
        pending: newPending / 100,
        fullyPaid: newPending <= 0,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    return NextResponse.json(
      {
        error: 'Error al registrar pago',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}