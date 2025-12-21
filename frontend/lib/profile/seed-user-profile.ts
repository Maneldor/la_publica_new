import { prisma } from '@/lib/prisma'

/**
 * Crear perfil de ejemplo para un usuario
 * @param userId - ID del usuario para crear el perfil
 */
export async function seedUserProfile(userId: string) {
  const existingProfile = await prisma.userProfile.findUnique({
    where: { userId }
  })
  
  if (existingProfile) {
    console.log(`Perfil para usuario ${userId} ya existe, saltando seed`)
    return // Ya existe, no hacer nada
  }
  
  console.log(`Creando perfil de ejemplo para usuario ${userId}`)
  
  try {
    await prisma.$transaction([
      // Perfil básico
      prisma.userProfile.create({
        data: {
          userId,
          bio: "Apassionat per la innovació en l'administració pública. Treballo per fer els serveis públics més accessibles i eficients per a la ciutadania.",
          headline: "Cap de Secció - Transformació Digital",
          city: "Barcelona",
          province: "Barcelona",
          country: "Espanya",
          organization: "Ajuntament de Barcelona",
          department: "Gerència de Recursos",
          position: "Cap de Secció",
          yearsInPublicSector: 15,
          website: "https://jordi-garcia.dev",
          isPublic: true,
          showEmail: false,
          showPhone: false,
          showBirthDate: false,
        }
      }),
      
      // Educación
      prisma.userEducation.create({
        data: {
          userId,
          institution: "Universitat de Barcelona",
          degree: "Llicenciatura en Dret",
          field: "Dret Administratiu",
          startDate: new Date("2000-09-01"),
          endDate: new Date("2005-06-30"),
          description: "Especialització en dret administratiu i gestió pública",
          position: 0,
        }
      }),
      
      prisma.userEducation.create({
        data: {
          userId,
          institution: "ESADE Business School",
          degree: "Màster en Administració i Direcció d'Empreses (MBA)",
          field: "Gestió Pública",
          startDate: new Date("2010-09-01"),
          endDate: new Date("2012-06-30"),
          description: "Especialització en Gestió Pública i Transformació Digital",
          position: 1,
        }
      }),
      
      // Experiencia profesional
      prisma.userExperience.create({
        data: {
          userId,
          organization: "Ajuntament de Barcelona",
          position: "Cap de Secció",
          department: "Transformació Digital",
          location: "Barcelona",
          startDate: new Date("2018-01-01"),
          isCurrent: true,
          employmentType: "funcionario",
          description: "Lidero projectes de digitalització de serveis ciutadans. He implementat més de 20 tràmits online, reduint els temps de gestió en un 60%.",
          displayOrder: 0,
        }
      }),
      
      prisma.userExperience.create({
        data: {
          userId,
          organization: "Diputació de Barcelona",
          position: "Analista de Processos",
          department: "Organització i RRHH",
          location: "Barcelona",
          startDate: new Date("2012-03-01"),
          endDate: new Date("2017-12-31"),
          isCurrent: false,
          employmentType: "funcionario",
          description: "Optimització de processos administratius i implementació de sistemes de gestió documental electrònica.",
          displayOrder: 1,
        }
      }),
      
      prisma.userExperience.create({
        data: {
          userId,
          organization: "Deloitte Public Sector",
          position: "Consultor Junior",
          department: "Public Sector Consulting",
          location: "Barcelona",
          startDate: new Date("2008-01-01"),
          endDate: new Date("2012-02-29"),
          isCurrent: false,
          employmentType: "laboral",
          description: "Assessorament en projectes de modernització administrativa per a diversos organismes públics. Implementació d'e-administració.",
          displayOrder: 2,
        }
      }),
      
      // Habilidades
      prisma.userSkill.createMany({
        data: [
          { userId, name: "Transformació Digital", category: "technical", level: 5 },
          { userId, name: "Gestió de Projectes", category: "soft", level: 4 },
          { userId, name: "Contractació Pública", category: "legal", level: 4 },
          { userId, name: "LOPD/RGPD", category: "legal", level: 4 },
          { userId, name: "Administració Electrònica", category: "technical", level: 5 },
          { userId, name: "React", category: "technical", level: 3 },
          { userId, name: "Node.js", category: "technical", level: 3 },
          { userId, name: "Power BI", category: "technical", level: 4 },
          { userId, name: "Scrum", category: "soft", level: 4 },
          { userId, name: "Leadership", category: "soft", level: 4 },
          { userId, name: "Change Management", category: "soft", level: 4 },
          { userId, name: "Process Mining", category: "technical", level: 3 },
          { userId, name: "UX/UI Design", category: "technical", level: 2 },
        ]
      }),
      
      // Idiomas
      prisma.userLanguage.createMany({
        data: [
          { userId, language: "Català", level: "native" },
          { userId, language: "Castellà", level: "native" },
          { userId, language: "Anglès", level: "professional", certification: "Cambridge First Certificate (B2)" },
          { userId, language: "Francès", level: "intermediate" },
        ]
      }),
      
      // Redes sociales
      prisma.userSocialLink.createMany({
        data: [
          { 
            userId, 
            platform: "linkedin", 
            url: "https://linkedin.com/in/jordi-garcia-martinez", 
            username: "jordi-garcia-martinez",
            isVerified: true
          },
          { 
            userId, 
            platform: "twitter", 
            url: "https://twitter.com/jordi_func", 
            username: "jordi_func",
            isVerified: false
          },
          { 
            userId, 
            platform: "github", 
            url: "https://github.com/jordigarcia", 
            username: "jordigarcia",
            isVerified: false
          },
        ]
      }),
    ])
    
    console.log(`✅ Perfil de ejemplo creado exitosamente para usuario ${userId}`)
    
  } catch (error) {
    console.error(`❌ Error creando perfil de ejemplo para usuario ${userId}:`, error)
    throw error
  }
}

/**
 * Eliminar todos los datos del perfil de un usuario
 * @param userId - ID del usuario para limpiar el perfil
 */
export async function clearUserProfile(userId: string) {
  try {
    await prisma.$transaction([
      prisma.userSocialLink.deleteMany({ where: { userId } }),
      prisma.userLanguage.deleteMany({ where: { userId } }),
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userExperience.deleteMany({ where: { userId } }),
      prisma.userEducation.deleteMany({ where: { userId } }),
      prisma.userProfile.delete({ where: { userId } }).catch(() => null), // Ignore if doesn't exist
    ])
    
    console.log(`✅ Perfil limpiado exitosamente para usuario ${userId}`)
    
  } catch (error) {
    console.error(`❌ Error limpiando perfil para usuario ${userId}:`, error)
    throw error
  }
}

/**
 * Verificar si un usuario tiene perfil completo
 * @param userId - ID del usuario a verificar
 */
export async function getUserProfileCompleteness(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          education: true,
          experiences: true,
          skills: true,
          languages: true,
          socialLinks: true,
        }
      }
    }
  })

  if (!profile) {
    return {
      hasProfile: false,
      completeness: 0,
      sections: {
        basic: false,
        personal: false,
        social: false,
        education: false,
        experience: false,
        skills: false,
        languages: false,
      }
    }
  }

  const sections = {
    basic: !!(profile.user.name && profile.user.email),
    personal: !!(profile.bio && profile.city && profile.organization),
    social: profile.user.socialLinks.length > 0,
    education: profile.user.education.length > 0,
    experience: profile.user.experiences.length > 0,
    skills: profile.user.skills.length > 0,
    languages: profile.user.languages.length > 0,
  }

  const completedSections = Object.values(sections).filter(Boolean).length
  const totalSections = Object.keys(sections).length
  const completeness = Math.round((completedSections / totalSections) * 100)

  return {
    hasProfile: true,
    completeness,
    sections,
    profile
  }
}