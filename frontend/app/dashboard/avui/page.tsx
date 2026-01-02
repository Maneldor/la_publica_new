import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WelcomeHeader } from './components/WelcomeHeader'
import { TodayEvents } from './components/TodayEvents'
import { RecordatorisCard } from './components/RecordatorisCard'
import { ModulesSelector } from './components/ModulesSelector'
import { ModuleCard } from './components/ModuleCard'

export const metadata: Metadata = {
  title: 'Avui | La Pública',
  description: 'El teu resum diari a La Pública',
}

async function getEnabledModules(userId: string) {
  const modules = await prisma.userModulePreference.findMany({
    where: {
      userId,
      enabled: true,
    },
    orderBy: { order: 'asc' },
  })
  return modules
}

export default async function AvuiPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Carregar mòduls activats
  const enabledModules = await getEnabledModules(session.user.id)

  // Separar mòduls en columna esquerra i dreta
  const leftModules = enabledModules.filter((_, i) => i % 2 === 0)   // 1r, 3r, 5è...
  const rightModules = enabledModules.filter((_, i) => i % 2 === 1)  // 2n, 4t, 6è...

  return (
    <div className="space-y-6">
      {/* Capçalera de benvinguda + Frase del dia */}
      <WelcomeHeader userName={session.user.name || 'Usuari'} />

      {/* Layout 3 columnes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-6">

        {/* Columna 1: Avui tens + mòduls imparells */}
        <div className="space-y-6">
          <TodayEvents userId={session.user.id} />
          {leftModules.map(module => (
            <ModuleCard key={module.id} moduleId={module.moduleId} />
          ))}
        </div>

        {/* Columna 2: Recordatoris + mòduls parells */}
        <div className="space-y-6">
          <RecordatorisCard userId={session.user.id} />
          {rightModules.map(module => (
            <ModuleCard key={module.id} moduleId={module.moduleId} />
          ))}
        </div>

        {/* Columna 3: Selector de mòduls */}
        <div className="lg:block">
          <ModulesSelector
            enabledModules={enabledModules.map(m => m.moduleId)}
          />
        </div>

      </div>
    </div>
  )
}
