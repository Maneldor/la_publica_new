import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/invoices/[id]
 * Obtiene detalle completo de una factura
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

    const invoice = await prismaClient.invoice.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        items: {
          include: {
            plan: {
              select: {
                id: true,
                nombre: true,
                planType: true,
              }
            },
            extra: {
              select: {
                id: true,
                name: true,
                category: true,
              }
            },
          },
          orderBy: { order: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    // Calcular totales de pago
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const pending = Number(invoice.totalAmount) - totalPaid;

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        totalPaid,
        pending,
        isOverdue: invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date(),
      },
    });

  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Error al obtener factura' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/invoices/[id]
 * Actualiza una factura
 */
export async function PATCH(
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

    const invoice = await prismaClient.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    // No permitir editar si está pagada completamente
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'No se puede editar una factura pagada' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;

      // Si se marca como pagada, actualizar fecha
      if (body.status === 'PAID' && !invoice.paidDate) {
        updateData.paidDate = new Date();
      }
    }

    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await prismaClient.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        company: true,
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: 'Factura actualizada',
    });

  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Error al actualizar factura' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/invoices/[id]
 * Elimina una factura (solo si está en borrador)
 */
export async function DELETE(
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

    // Solo permitir eliminar borradores sin pagos
    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar facturas en borrador' },
        { status: 400 }
      );
    }

    if (invoice.payments.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una factura con pagos registrados' },
        { status: 400 }
      );
    }

    // Eliminar items primero, luego la factura
    await prismaClient.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    await prismaClient.invoice.delete({
      where: { id: params.id },
    });

    console.log('✅ Factura eliminada:', invoice.invoiceNumber);

    return NextResponse.json({
      success: true,
      message: `Factura ${invoice.invoiceNumber} eliminada correctamente`,
    });

  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Error al eliminar factura' },
      { status: 500 }
    );
  }
}