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

    // Obtener configuración de facturación
    const config = await prismaClient.configFacturacion.findFirst();
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
        nombreFiscal: true,
        cifFiscal: true,
        direccionFiscal: true,
        ciudadFiscal: true,
        cpFiscal: true,
        provinciaFiscal: true
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

    // Crear factura
    const factura = await prismaClient.factura.create({
      data: {
        numeroFactura,
        serieFactura: config.serieActual,
        numeroSecuencial: config.siguienteNumero,
        companyId: company.id,
        empresaNombre: company.nombreFiscal || company.name,
        empresaCIF: company.cifFiscal,
        empresaDireccion: company.direccionFiscal,
        empresaCiudad: company.ciudadFiscal,
        empresaCP: company.cpFiscal,
        empresaProvincia: company.provinciaFiscal,
        empresaEmail: company.email,
        baseImponible: data.baseImponible,
        porcentajeIVA: data.porcentajeIVA,
        importeIVA: data.importeIVA,
        total: data.total,
        fechaEmision: new Date(data.fechaEmision),
        fechaVencimiento: new Date(data.fechaVencimiento),
        estado: data.enviar ? 'ENVIADA' : 'BORRADOR',
        tipoFactura: 'MANUAL',
        observaciones: data.observaciones,
        notasInternas: data.notasInternas,
        creadoPor: session.user.email || 'admin',
        conceptos: {
          create: data.conceptos
        }
      },
      include: {
        conceptos: true,
        company: true
      }
    });

    // Actualizar siguiente número en configuración
    await prismaClient.configFacturacion.update({
      where: { id: config.id },
      data: {
        siguienteNumero: config.siguienteNumero + 1
      }
    });

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