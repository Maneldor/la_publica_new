import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Obtener configuración de facturación (TODO: crear modelo ConfigFacturacion o usar configuración alternativa)
    // const config = await prismaClient.configFacturacion.findFirst();
    const config = { prefijoFactura: 'FAC', serieActual: 'A', siguienteNumero: 1, id: 'default' } as any;
    if (!config) {
      return NextResponse.json(
        { error: 'Configuració de facturació no trobada' },
        { status: 400 }
      );
    }

    // Obtener empresa
    const company = await prismaClient.company.findUnique({
      where: { id: data.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        cif: true,
        address: true,
        // Campos fiscales no existen en schema, usar campos básicos
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no trobada' },
        { status: 404 }
      );
    }

    // Generar número de factura secuencial
    const numeroFactura = `${config.prefijoFactura}-${config.serieActual}-${String(config.siguienteNumero).padStart(5, '0')}`;

    // Crear factura usando campos del schema real
    const factura = await prismaClient.invoice.create({
      data: {
        invoiceNumber: numeroFactura,
        invoiceSeries: config.serieActual,
        companyId: company.id,
        clientName: company.name,
        clientCif: company.cif,
        clientEmail: company.email,
        clientAddress: company.address || '',
        clientCity: '',
        clientPostalCode: '',
        subtotalAmount: Math.round(data.baseImponible * 100), // Convertir a centavos
        taxAmount: Math.round(data.importeIVA * 100), // Convertir a centavos
        totalAmount: Math.round(data.total * 100), // Convertir a centavos
        taxRate: data.porcentajeIVA || 21.0,
        issueDate: new Date(data.fechaEmision),
        dueDate: new Date(data.fechaVencimiento),
        status: data.enviar ? 'SENT' : 'DRAFT',
        invoiceType: 'REGULAR',
        concept: data.observaciones || 'Factura manual',
        notes: data.notasInternas || null,
        pendingAmount: Math.round(data.total * 100), // Convertir a centavos
        items: {
          create: data.conceptos?.map((item: any, index: number) => ({
            order: index,
            description: item.descripcion || item.nombre || '',
            quantity: item.cantidad || 1,
            unitPrice: Math.round((item.precio || 0) * 100), // Convertir a centavos
            subtotalAmount: Math.round((item.subtotal || item.precio || 0) * 100),
            taxAmount: Math.round(((item.subtotal || item.precio || 0) * (data.porcentajeIVA || 21) / 100) * 100),
            totalAmount: Math.round((item.total || item.subtotal || item.precio || 0) * 100),
          })) || []
        }
      },
      include: {
        items: true,
        company: true
      }
    });

    // Actualizar siguiente número en configuración (TODO: implementar cuando exista el modelo)
    // await prismaClient.configFacturacion.update({
    //   where: { id: config.id },
    //   data: {
    //     siguienteNumero: config.siguienteNumero + 1
    //   }
    // });

    // TODO: Si data.enviar === true, enviar email a la empresa
    if (data.enviar) {
      console.log('Enviar email de factura a:', company.email);
      // Aquí se implementaría el envío de email
    }

    return NextResponse.json(factura);

  } catch (error) {
    console.error('Error al crear factura:', error);
    return NextResponse.json(
      { error: 'Error al crear factura' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}