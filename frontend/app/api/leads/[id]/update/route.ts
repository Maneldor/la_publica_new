import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Verificar que el lead existe
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { id: true, metadata: true, email: true, phone: true },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const metadata = existingLead.metadata as any || {};

    // Validar campos permitidos - algunos van a campos directos, otros a metadata
    const allowedDirectFields = ['email', 'phone'];
    const allowedMetadataFields = ['website', 'address', 'description', 'notes'];

    const updateData: any = {};
    const updatedMetadata = { ...metadata };
    let hasUpdates = false;

    // Actualizar campos directos
    for (const field of allowedDirectFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
        hasUpdates = true;
      }
    }

    // Actualizar campos en metadata
    for (const field of allowedMetadataFields) {
      if (body[field] !== undefined) {
        updatedMetadata[field] = body[field];
        hasUpdates = true;
      }
    }

    // Si no hay campos para actualizar
    if (!hasUpdates) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Agregar metadata actualizada y timestamp
    updateData.metadata = updatedMetadata;
    updateData.updatedAt = new Date();

    // Update lead
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: lead,
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}