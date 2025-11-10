import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener plan específico
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const plan = await prisma.planConfig.findUnique({
      where: { id: params.planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Pla no trobat' }, { status: 404 });
    }

    return NextResponse.json(plan);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtenir pla' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar plan parcialmente (para toggles rápidos)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que el plan existe
    const existingPlan = await prisma.planConfig.findUnique({
      where: { id: params.planId }
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Pla no trobat' }, { status: 404 });
    }

    // Actualizar solo los campos enviados
    const updatedPlan = await prisma.planConfig.update({
      where: { id: params.planId },
      data: data
    });

    return NextResponse.json(updatedPlan);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al actualitzar pla' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar plan completo
export async function PUT(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que el plan existe
    const existingPlan = await prisma.planConfig.findUnique({
      where: { id: params.planId }
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Pla no trobat' }, { status: 404 });
    }

    // Generar características automáticamente basándose en los límites
    const generateCaracteristicas = (limites: any, planType: string) => {
      const features = [];

      if (limites.maxMembers === -1) {
        features.push('Usuaris il·limitats');
      } else if (limites.maxMembers === 1) {
        features.push('1 usuari');
      } else {
        features.push(`Fins a ${limites.maxMembers} usuaris`);
      }

      if (limites.maxStorage === -1) {
        features.push('Emmagatzematge il·limitat');
      } else {
        features.push(`${limites.maxStorage}GB emmagatzematge`);
      }

      if (limites.maxProjects === -1) {
        features.push('Projectes il·limitats');
      } else {
        features.push(`${limites.maxProjects} projectes`);
      }

      if (limites.maxPosts === -1) {
        features.push('Posts il·limitats');
      } else {
        features.push(`${limites.maxPosts} posts/mes`);
      }

      if (limites.maxAIAgents === -1) {
        features.push('Agents IA il·limitats');
      } else if (limites.maxAIAgents === 0) {
        features.push('Sense agents IA');
      } else if (limites.maxAIAgents === 1) {
        features.push('1 agent IA');
      } else {
        features.push(`${limites.maxAIAgents} agents IA`);
      }

      // Añadir características adicionales específicas por tipo de plan
      if (planType === 'STARTER') {
        features.push('Suport bàsic');
      } else if (planType === 'BASIC') {
        features.push('Suport per email');
      } else if (planType === 'STANDARD') {
        features.push('Suport prioritari');
      } else if (planType === 'PREMIUM') {
        features.push('Suport 24/7');
        features.push('API access');
      } else if (planType === 'PROFESSIONAL') {
        features.push('Configuració avançada');
        features.push('Extras disponibles');
      }

      return features;
    };

    const caracteristicasGeneradas = generateCaracteristicas(data.limites, existingPlan.planType);

    // Actualizar el plan en la base de datos
    const planActualizado = await prisma.planConfig.update({
      where: { id: params.planId },
      data: {
        nombre: data.nombre,
        nombreCorto: data.nombreCorto,
        descripcion: data.descripcion,
        precioMensual: parseFloat(data.precioMensual),
        precioAnual: data.precioAnual ? parseFloat(data.precioAnual) : null,
        limitesJSON: JSON.stringify(data.limites),
        caracteristicas: JSON.stringify(caracteristicasGeneradas), // Usar características generadas automáticamente
        color: data.color,
        icono: data.icono,
        orden: data.orden,
        destacado: data.destacado,
        activo: data.activo,
        visible: data.visible
      }
    });

    return NextResponse.json(planActualizado);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al actualitzar pla' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el plan existe
    const plan = await prisma.planConfig.findUnique({
      where: { id: params.planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Pla no trobat' }, { status: 404 });
    }

    if (plan.esSistema) {
      return NextResponse.json(
        { error: 'No es pot eliminar un pla del sistema' },
        { status: 400 }
      );
    }

    // Verificar si hay empresas usando este plan
    const companiesUsingPlan = await prisma.company.count({
      where: { planType: plan.planType }
    });

    if (companiesUsingPlan > 0) {
      return NextResponse.json(
        {
          error: `No es pot eliminar aquest pla perquè ${companiesUsingPlan} empresa(es) l'estan utilitzant`,
          message: `Hi ha ${companiesUsingPlan} empresa(es) amb aquest pla actiu`
        },
        { status: 400 }
      );
    }

    // Eliminar el plan de la base de datos
    await prisma.planConfig.delete({
      where: { id: params.planId }
    });

    return NextResponse.json({ success: true, message: 'Pla eliminat correctament' });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar pla' },
      { status: 500 }
    );
  }
}