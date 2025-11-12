import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// PATCH - Actualizar un plan específico
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Verificar que el plan existe
    const planExistente = await prismaClient.planConfig.findUnique({
      where: { id }
    });

    if (!planExistente) {
      return NextResponse.json(
        { error: 'Pla no trobat' },
        { status: 404 }
      );
    }


    // Construir objeto de actualización
    const updateData: any = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.nombreCorto !== undefined) updateData.nombreCorto = data.nombreCorto;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.precioMensual !== undefined) updateData.precioMensual = parseFloat(data.precioMensual);
    if (data.precioAnual !== undefined) updateData.precioAnual = data.precioAnual ? parseFloat(data.precioAnual) : null;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icono !== undefined) updateData.icono = data.icono;
    if (data.orden !== undefined) updateData.orden = parseInt(data.orden);
    if (data.destacado !== undefined) updateData.destacado = data.destacado;
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.visible !== undefined) updateData.visible = data.visible;

    if (data.limites !== undefined) {
      updateData.limitesJSON = JSON.stringify(data.limites);
    }

    if (data.caracteristicas !== undefined) {
      updateData.caracteristicas = JSON.stringify(data.caracteristicas);
    }

    // Actualizar el plan
    const planActualizado = await prismaClient.planConfig.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(planActualizado);

  } catch (error) {
    console.error('Error al actualizar plan:', error);
    return NextResponse.json(
      { error: 'Error al actualitzar el pla' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}

// DELETE - Eliminar un plan (solo si no es del sistema)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const plan = await prismaClient.planConfig.findUnique({
      where: { id }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Pla no trobat' },
        { status: 404 }
      );
    }

    if (plan.esSistema) {
      return NextResponse.json(
        { error: 'No es pot eliminar un pla del sistema' },
        { status: 400 }
      );
    }

    await prismaClient.planConfig.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Pla eliminat correctament' });

  } catch (error) {
    console.error('Error al eliminar plan:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el pla' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}
