import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateRoles() {
  console.log('🔄 Iniciant migració de rols...')

  try {
    // Migrar COMPANY_MANAGER a CRM_COMERCIAL
    const companyManagers = await prisma.user.updateMany({
      where: { role: 'COMPANY_MANAGER' as any },
      data: { role: 'CRM_COMERCIAL' as any }
    })
    console.log(`✅ Migrats ${companyManagers.count} COMPANY_MANAGER → CRM_COMERCIAL`)

    // Migrar COMMUNITY_MANAGER a CRM_CONTINGUT
    const communityManagers = await prisma.user.updateMany({
      where: { role: 'COMMUNITY_MANAGER' as any },
      data: { role: 'CRM_CONTINGUT' as any }
    })
    console.log(`✅ Migrats ${communityManagers.count} COMMUNITY_MANAGER → CRM_CONTINGUT`)

    // Migrar EMPLEADO_PUBLICO a USER
    const empleados = await prisma.user.updateMany({
      where: { role: 'EMPLEADO_PUBLICO' as any },
      data: { role: 'USER' }
    })
    console.log(`✅ Migrats ${empleados.count} EMPLEADO_PUBLICO → USER`)

    // Migrar GESTOR_EMPRESAS a GESTOR_ESTANDARD (per defecte)
    const gestors = await prisma.user.updateMany({
      where: { role: 'GESTOR_EMPRESAS' as any },
      data: { role: 'GESTOR_ESTANDARD' as any }
    })
    console.log(`✅ Migrats ${gestors.count} GESTOR_EMPRESAS → GESTOR_ESTANDARD`)

    // Eliminar ADMINISTRADOR_GRUPO (canviar a USER)
    const adminGrupo = await prisma.user.updateMany({
      where: { role: 'ADMINISTRADOR_GRUPO' as any },
      data: { role: 'USER' }
    })
    console.log(`✅ Migrats ${adminGrupo.count} ADMINISTRADOR_GRUPO → USER`)

    console.log('✅ Migració de rols completada!')
  } catch (error) {
    console.error('❌ Error durant la migració:', error)
  }
}

migrateRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())