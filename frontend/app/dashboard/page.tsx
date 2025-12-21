'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { LAYOUTS } from '@/lib/design-system';
import { SocialFeed } from '@/components/ui/SocialFeed';
import { ProfileCompletionCard } from '@/components/ui/ProfileCompletionCard';
import { MembresOnlineCard } from '@/components/ui/MembresOnlineCard';
import { ElsMeusGrupsCard } from '@/components/ui/ElsMeusGrupsCard';
import { Users, UserCheck, Activity, UsersRound, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      label: 'Membres Actius',
      value: '2.4K',
      trend: '+18%',
      icon: <UserCheck className="w-5 h-5" />,
      color: 'indigo' as const
    },
    {
      label: 'Activitat Avui',
      value: '156',
      trend: '+7%',
      icon: <Activity className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      label: 'Grups',
      value: '89',
      trend: '+5%',
      icon: <UsersRound className="w-5 h-5" />,
      color: 'blue' as const
    },
    {
      label: 'Missatges',
      value: '1.2K',
      trend: '+23%',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'amber' as const
    }
  ];

  return (
    <PageLayout
      title="Xarxa Social"
      subtitle="Benvingut a la comunitat de La Pública"
      icon={<Users className="w-6 h-6" />}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Main content with sidebar */}
      <div className={LAYOUTS.withSidebar}>
        {/* Main Column - Social Feed */}
        <div className={LAYOUTS.mainContent}>
          <SocialFeed />
        </div>

        {/* Sidebar - Profile & Members */}
        <div className={LAYOUTS.sidebar}>
          <ProfileCompletionCard />
          <MembresOnlineCard />
          <ElsMeusGrupsCard />
        </div>
      </div>
    </PageLayout>
  );
}
