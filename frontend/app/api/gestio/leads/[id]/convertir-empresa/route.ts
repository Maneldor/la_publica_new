import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import {
  notifyCompanyRegistered,
  notifyLeadConvertedToGestor,
  getCRMUserIds
} from '@/lib/notifications/notification-actions'
import { EmailService } from '@/lib/email'
import { generateUniqueSlug } from '@/lib/utils/slug'

function generatePassword(companyName: string): string {
  const prefix = (companyName || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
  const date = new Date()
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${prefix}${day}${month}${year}${random}`
}

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
    const userRole = (session.user as any).role || (session.user as any).userType || ''
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { company, contacts, contract } = body

    console.log('📝 Convertint lead:', id)
    console.log('📝 Company data:', JSON.stringify(company, null, 2))
    console.log('📝 Contacts:', JSON.stringify(contacts, null, 2))
    console.log('📝 Contract:', JSON.stringify(contract, null, 2))

    // Verificar que el lead existe
    const lead = await prismaClient.companyLead.findUnique({
      where: { id },
      select: { id: true, companyName: true, status: true, assignedToId: true }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    // Verificar si ya existe una empresa con este CIF
    if (company.cif) {
      const existingCompany = await prismaClient.company.findUnique({
        where: { cif: company.cif },
        select: { id: true, name: true }
      })
      if (existingCompany) {
        return NextResponse.json({
          error: `Ja existeix una empresa amb el CIF ${company.cif}: ${existingCompany.name}`,
          existingCompanyId: existingCompany.id
        }, { status: 409 })
      }
    }

    // Crear Company
    console.log('📝 Step 1: Creating company...')
    // Combinar dirección completa si hay city/state/postalCode
    let fullAddress = company.address || ''
    if (company.city) fullAddress += fullAddress ? `, ${company.city}` : company.city
    if (company.postalCode) fullAddress += fullAddress ? ` ${company.postalCode}` : company.postalCode
    if (company.state) fullAddress += fullAddress ? `, ${company.state}` : company.state

    // Generar slug únic a partir del nom
    const slug = await generateUniqueSlug(company.name, prismaClient as any)

    const newCompany = await prismaClient.company.create({
      data: {
        name: company.name,
        slug: slug,
        cif: company.cif,
        email: company.email,
        phone: company.phone,
        website: company.website,
        description: company.description,
        sector: company.sector,
        employeeCount: company.employeeCount,
        address: fullAddress || null,
        socialMedia: {
          linkedin: company.socialMediaLinkedIn || null,
          facebook: company.socialMediaFacebook || null,
          twitter: company.socialMediaTwitter || null
        },
        currentPlanId: contract.planId,
        status: 'PENDING',
        isActive: true,
        fromLeadId: id
      }
    })

    console.log('📝 Step 1 complete: Company created with ID:', newCompany.id)

    // Crear usuarios por cada contacto
    console.log('📝 Step 2: Creating users...')
    const createdUsers = []
    for (const contact of contacts) {
      const isPrimary = contact.isPrimary

      // Generar password para el admin principal
      let password = null
      let hashedPassword = null
      if (isPrimary) {
        password = generatePassword(company.name)
        hashedPassword = await bcrypt.hash(password, 10)
      }

      // El usuario representa a la empresa, no a la persona
      const contactFullName = `${contact.firstName} ${contact.lastName || ''}`.trim()
      const user = await prismaClient.user.create({
        data: {
          name: company.name, // Nombre de la empresa como nombre del usuario
          firstName: contact.firstName,
          lastName: contact.lastName || null,
          email: contact.email,
          password: hashedPassword,
          userType: isPrimary ? 'COMPANY_OWNER' : 'COMPANY_MEMBER',
          role: 'COMPANY',
          cargo: contactFullName, // Guardamos el nombre del contacto en cargo
          memberCompanyId: newCompany.id,
          ownedCompanyId: isPrimary ? newCompany.id : null,
          isActive: true
        }
      })

      createdUsers.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: isPrimary ? 'COMPANY_OWNER' : 'COMPANY_MEMBER',
        plainPassword: password
      })
    }

    console.log('📝 Step 2 complete: Created', createdUsers.length, 'users')

    // Crear subscripción
    console.log('📝 Step 3: Creating subscription...')
    const endDate = new Date(contract.dataInici)
    endDate.setFullYear(endDate.getFullYear() + 1)

    await prismaClient.subscription.create({
      data: {
        companyId: newCompany.id,
        planId: contract.planId,
        status: 'ACTIVE',
        startDate: new Date(contract.dataInici),
        endDate: endDate,
        precioMensual: contract.preuTotal / 12,
        precioAnual: contract.preuTotal,
        limites: {},
        extras: contract.extres || []
      }
    })

    console.log('📝 Step 3 complete: Subscription created')

    // Actualizar lead como WON
    console.log('📝 Step 4: Updating lead status...')
    await prismaClient.companyLead.update({
      where: { id },
      data: {
        status: 'WON',
        stage: 'CONTRACTAT',
        convertedAt: new Date(),
        convertedToCompanyId: newCompany.id
      }
    })

    // Crear actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: 'CONVERTED',
        description: `Lead convertit a empresa: ${company.name}. ${createdUsers.length} usuaris creats.`
      }
    })

    // Enviar email de benvinguda amb credencials
    const adminUser = createdUsers.find(u => u.plainPassword)
    if (adminUser) {
      console.log('📧 Enviant email de benvinguda a:', adminUser.email)
      try {
        const emailService = new EmailService()
        await emailService.sendEmail({
          to: adminUser.email,
          subject: `Benvinguts a La Pública - ${company.name}`,
          template: 'WELCOME',
          templateProps: {
            companyName: company.name,
            contactName: adminUser.name,
            email: adminUser.email,
            password: adminUser.plainPassword,
            planName: contract.planName || 'Estàndard',
            gestorName: null, // Se puede añadir si hay gestor asignado
            loginUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`
          }
        })
        console.log('✅ Email de benvinguda enviat correctament')
      } catch (emailError) {
        console.error('❌ Error enviant email de benvinguda:', emailError)
        // No falla la petició si l'email falla
      }
    }

    // Enviar notificacions
    try {
      // a) Notificar CRM que s'ha creat l'empresa
      const crmIds = await getCRMUserIds()
      if (crmIds.length > 0) {
        await notifyCompanyRegistered(
          crmIds,
          newCompany.id,
          company.name,
          session.user.name || 'Admin'
        )
        console.log('📧 Notificació enviada a', crmIds.length, 'usuaris CRM')
      }

      // b) Notificar Gestor original que el seu lead s'ha convertit
      if (lead.assignedToId) {
        await notifyLeadConvertedToGestor(
          lead.assignedToId,
          lead.companyName,
          newCompany.id,
          company.name
        )
        console.log('📧 Notificació enviada al gestor:', lead.assignedToId)
      }
    } catch (notifyError) {
      console.error('Error enviant notificacions:', notifyError)
      // No falla la petició si les notificacions fallen
    }

    return NextResponse.json({
      success: true,
      company: {
        id: newCompany.id,
        name: newCompany.name
      },
      usersCreated: createdUsers.length,
      message: `Empresa creada amb ${createdUsers.length} usuaris`
    })
  } catch (error: any) {
    console.error('Error convertint lead:', error)
    return NextResponse.json(
      { error: error.message || 'Error convertint lead' },
      { status: 500 }
    )
  }
}
