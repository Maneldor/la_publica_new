import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { notifyLeadVerifiedForAdmin, getAdminUserIds } from '@/lib/notifications/notification-actions'

// POST - Passar lead a Admin (des de CRM)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    // Verificar rol CRM
    const allowedRoles = ['CRM_COMERCIAL', 'ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN']
    if (!allowedRoles.includes(session.user.userType || '')) {
      return NextResponse.json({ error: 'No autoritzat - Només CRM' }, { status: 403 })
    }

    const { id } = await params
    const { crmData } = await request.json()

    // Verificar que el lead existeix
    const existingLead = await prismaClient.companyLead.findUnique({
      where: { id },
      select: { id: true, companyName: true, status: true }
    })

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    // Actualitzar lead amb dades CRM i passar a PENDING_ADMIN
    const updatedLead = await prismaClient.companyLead.update({
      where: { id },
      data: {
        status: 'PENDING_ADMIN',
        stage: 'PRE_CONTRACTE',
        verifiedById: session.user.id,
        verifiedAt: new Date(),
        preContractAt: new Date(),
        // Guardar dades CRM en camps JSON estructurats
        crmVerification: {
          empresaVerificada: crmData.empresaVerificada || false,
          contacteVerificat: crmData.contacteVerificat || false,
          cifValidat: crmData.cifValidat || false,
          contacteRealitzat: crmData.contacteRealitzat || false,
          verifiedAt: new Date().toISOString(),
          verifiedBy: session.user.id
        },
        precontract: {
          planId: crmData.planId || '',
          extres: crmData.extres || [],
          notes: crmData.notesPrecontracte || '',
          preuTotal: crmData.preuTotal || 0
        },
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Crear activitat
    await prismaClient.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: 'STATUS_CHANGED',
        description: `Lead verificat per CRM i passat a Admin. Pla seleccionat. Total: ${crmData.preuTotal}€/mes`
      }
    })

    // Notificar Admins que hi ha un lead pendent de contractar
    try {
      const adminIds = await getAdminUserIds()
      if (adminIds.length > 0) {
        await notifyLeadVerifiedForAdmin(
          adminIds,
          id,
          existingLead.companyName,
          session.user.name || 'CRM'
        )
        console.log('📧 Notificació enviada a', adminIds.length, 'admins')
      }
    } catch (notifyError) {
      console.error('Error enviant notificació a admins:', notifyError)
      // No falla la petició si la notificació falla
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      message: 'Lead passat a Admin correctament'
    })
  } catch (error) {
    console.error('Error passing lead to admin:', error)
    return NextResponse.json({ error: 'Error passant el lead a Admin' }, { status: 500 })
  }
}
