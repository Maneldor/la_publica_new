import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear nueva solicitud de información
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { extrasIds, mensaje, telefono } = body;

    // Validaciones
    if (!extrasIds || !Array.isArray(extrasIds) || extrasIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un extra' },
        { status: 400 }
      );
    }

    if (!mensaje || mensaje.trim().length === 0) {
      return NextResponse.json(
        { error: 'El mensaje es obligatorio' },
        { status: 400 }
      );
    }

    // Buscar usuario y empresa
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que todos los extras existen
    const extras = await prisma.featureExtra.findMany({
      where: {
        id: { in: extrasIds },
        activo: true
      }
    });

    if (extras.length !== extrasIds.length) {
      return NextResponse.json(
        { error: 'Algunos extras seleccionados no son válidos' },
        { status: 400 }
      );
    }

    // Crear la solicitud
    const solicitud = await prisma.solicitudExtra.create({
      data: {
        empresaId: user.company.id,
        usuarioId: user.id,
        extrasIds: extrasIds,
        mensaje: mensaje.trim(),
        telefono: telefono?.trim() || null,
        estado: 'PENDIENTE'
      },
      include: {
        empresa: {
          select: {
            id: true,
            name: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Crear notificación para administradores
    const extrasNombres = extras.map(e => e.nombre).join(', ');
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'INFO',
        title: 'Nueva solicitud de información de extras',
        message: `La empresa ${user.company.name} ha solicitado información sobre: ${extrasNombres}`,
        read: false,
        metadata: JSON.stringify({
          solicitudId: solicitud.id,
          empresaId: user.company.id,
          empresaNombre: user.company.name,
          extrasIds: extrasIds,
          extrasNombres: extrasNombres
        })
      }
    });

    return NextResponse.json({
      success: true,
      solicitud: {
        id: solicitud.id,
        estado: solicitud.estado,
        fechaSolicitud: solicitud.fechaSolicitud
      },
      message: 'Solicitud enviada correctamente. Nos pondremos en contacto pronto.'
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Obtener solicitudes de la empresa
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuario y empresa
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const estado = url.searchParams.get('estado');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const where: any = {
      empresaId: user.company.id
    };

    if (estado) {
      where.estado = estado;
    }

    // Obtener solicitudes con información de extras
    const solicitudes = await prisma.solicitudExtra.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            name: true
          }
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        gestor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        presupuesto: true
      },
      orderBy: {
        fechaSolicitud: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Obtener información de los extras para cada solicitud
    const solicitudesConExtras = await Promise.all(
      solicitudes.map(async (solicitud) => {
        const extras = await prisma.featureExtra.findMany({
          where: {
            id: { in: solicitud.extrasIds }
          },
          select: {
            id: true,
            nombre: true,
            categoria: true,
            precio: true
          }
        });

        return {
          ...solicitud,
          extras
        };
      })
    );

    // Contar total de solicitudes
    const total = await prisma.solicitudExtra.count({ where });

    return NextResponse.json({
      solicitudes: solicitudesConExtras,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}