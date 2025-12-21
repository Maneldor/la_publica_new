import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { LAYOUTS } from '@/lib/design-system'
import { WelcomeHeader } from './components/WelcomeHeader'
import { TodayEvents } from './components/TodayEvents'
import { TodayGoals } from './components/TodayGoals'
import { ProgressStats } from './components/ProgressStats'
import { ActivityFeed } from './components/ActivityFeed'
import { FeaturedOffers } from './components/FeaturedOffers'
import { CommunityActivity } from './components/CommunityActivity'
import { PlatformNews } from './components/PlatformNews'
import { QuickActions } from './components/QuickActions'

export const metadata: Metadata = {
  title: 'Avui | La Pública',
  description: 'El teu resum diari a La Pública',
}

export default async function AvuiPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout>
      {/* Capçalera de benvinguda */}
      <WelcomeHeader userName={session.user.name || 'Usuari'} />

      {/* Fila 1: Agenda del dia */}
      <div className={LAYOUTS.twoColumns}>
        <TodayEvents userId={session.user.id} />
        <TodayGoals userId={session.user.id} />
      </div>

      {/* Fila 2: Estadístiques de progrés */}
      <ProgressStats userId={session.user.id} />

      {/* Fila 3: Activitat i Ofertes */}
      <div className={LAYOUTS.withSidebar}>
        <div className={LAYOUTS.mainContent}>
          <ActivityFeed userId={session.user.id} />
        </div>
        <FeaturedOffers />
      </div>

      {/* Fila 4: Comunitat i Novetats */}
      <div className={LAYOUTS.twoColumns}>
        <CommunityActivity userId={session.user.id} />
        <PlatformNews />
      </div>

      {/* Accions ràpides - Floating button en mòbil */}
      <QuickActions />
    </PageLayout>
  )
}