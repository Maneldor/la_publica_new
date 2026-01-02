import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    // Verificar rol Admin
    const allowedRoles = ['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN']
    if (!allowedRoles.includes((session.user as any).role || '')) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { planId, extres, preuTotal, emailDestinari, notesPrecontracte } = body

    // Verificar que el lead existe
    const lead = await prismaClient.companyLead.findUnique({
      where: { id },
      select: { id: true, companyName: true }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    // Guardar info del presupuesto en notas internas
    const presupuestInfo = `[PRESSUPOST ENVIAT ${new Date().toLocaleDateString('ca-ES')}]\nPla: ${planId}\nExtres: ${extres?.join(', ') || 'Cap'}\nTotal: ${preuTotal}€/any\nEnviat a: ${emailDestinari}\n\n${notesPrecontracte || ''}`

    await prismaClient.companyLead.update({
      where: { id },
      data: {
        internalNotes: {
          set: presupuestInfo
        },
        updatedAt: new Date()
      }
    })

    // Crear actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: 'BUDGET_SENT',
        description: `Pressupost enviat: ${preuTotal}€/any a ${emailDestinari}`
      }
    })

    // TODO: Enviar email real con el presupuesto
    console.log('📧 Pressupost enviat a:', emailDestinari, '- Total:', preuTotal, '€/any')

    return NextResponse.json({
      success: true,
      message: 'Pressupost enviat correctament'
    })
  } catch (error: any) {
    console.error('Error enviant pressupost:', error)
    return NextResponse.json(
      { error: error.message || 'Error enviant pressupost' },
      { status: 500 }
    )
  }
}
