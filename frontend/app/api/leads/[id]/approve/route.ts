import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { assignTo, notes } = body;

    // Verificar que el lead existe y está pendiente
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { id: true, metadata: true },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const metadata = existingLead.metadata as any || {};

    if (metadata.generationMethod !== 'AI_SCRAPING') {
      return NextResponse.json(
        { success: false, error: 'Only AI-generated leads can be reviewed' },
        { status: 400 }
      );
    }

    if (metadata.reviewStatus !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Lead has already been reviewed' },
        { status: 400 }
      );
    }

    // Update lead metadata
    const updatedMetadata = {
      ...metadata,
      reviewStatus: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes,
      assignedTo: assignTo,
    };

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        metadata: updatedMetadata,
        status: 'NEW', // Cambiar a estado activo
        updatedAt: new Date(),
      },
    });

    // TODO: Notificar al gestor asignado (webhook, email, etc.)

    return NextResponse.json({
      success: true,
      data: lead,
    });

  } catch (error) {
    console.error('Error approving lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve lead' },
      { status: 500 }
    );
  }
}