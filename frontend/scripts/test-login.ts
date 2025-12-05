import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  const email = 'crm@gestio.com'
  const password = 'crm123456'

  console.log('🔍 Testing login for:', email)

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      userType: true,
      password: true,
      isActive: true,
      isEmailVerified: true
    }
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }

  console.log('✅ User found:')
  console.log('   Name:', user.name)
  console.log('   Role:', user.role)
  console.log('   UserType:', user.userType)
  console.log('   IsActive:', user.isActive)
  console.log('   IsEmailVerified:', user.isEmailVerified)

  if (!user.password) {
    console.log('❌ No password in DB')
    return
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  console.log('\n🔐 Password verification:')
  console.log('   Password to test:', password)
  console.log('   Password matches:', isValidPassword)

  if (!isValidPassword) {
    // Intentem generar una nova contrasenya
    const newHash = await bcrypt.hash(password, 10)
    console.log('\n💡 To fix, update password with:')
    console.log(`   UPDATE "User" SET password = '${newHash}' WHERE email = '${email}';`)
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())