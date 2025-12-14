import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Actualizando contraseñas para coincidir con login...\n')

  const users = [
    { email: 'super.admin@lapublica.cat', password: 'super123', name: 'Manel', role: 'SUPER_ADMIN', userType: 'ADMIN' },
    { email: 'gestio@lapublica.cat', password: 'admin123', name: 'Admin Gestió', role: 'ADMIN_GESTIO', userType: 'ADMIN' },
    { email: 'admin@lapublica.cat', password: 'admin123', name: 'Admin', role: 'ADMIN', userType: 'ADMIN' },
    { email: 'crm@gestio.com', password: 'crm123456', name: 'CRM Comercial', role: 'CRM_COMERCIAL', userType: 'ACCOUNT_MANAGER' },
    { email: 'contingut@lapublica.cat', password: 'contingut123', name: 'CRM Contingut', role: 'CRM_CONTINGUT', userType: 'ACCOUNT_MANAGER' },
    { email: 'g-estandar@lapublica.cat', password: 'gestor123', name: 'Gestor Estàndard', role: 'CRM_COMERCIAL', userType: 'ACCOUNT_MANAGER' },
    { email: 'g-strategic@lapublica.cat', password: 'gestor123', name: 'Gestor Estratègic', role: 'CRM_COMERCIAL', userType: 'ACCOUNT_MANAGER' },
    { email: 'g-enterprise@lapublica.cat', password: 'gestor123', name: 'Gestor Enterprise', role: 'CRM_COMERCIAL', userType: 'ACCOUNT_MANAGER' },
    { email: 'joan.perez@empresadeprova.cat', password: 'owner123', name: 'Joan Pérez', role: 'COMPANY', userType: 'COMPANY_OWNER' },
    { email: 'laura.garcia@generalitat.cat', password: 'empleat123', name: 'Laura García', role: 'USER', userType: 'EMPLOYEE' },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hash, name: u.name, role: u.role as any, userType: u.userType as any, isActive: true },
      create: { email: u.email, password: hash, name: u.name, role: u.role as any, userType: u.userType as any, isActive: true, isEmailVerified: true },
    })
    console.log(`✅ ${u.email} / ${u.password}`)
  }

  console.log('\n🎉 Listo!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
