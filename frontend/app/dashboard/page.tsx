'use client';

import { PageTemplate } from '../../components/ui/PageTemplate';
import { SocialFeed } from '../../components/ui/SocialFeed';
import { ProfileCompletionCard } from '../../components/ui/ProfileCompletionCard';
import { MembresOnlineCard } from '../../components/ui/MembresOnlineCard';
import { ElsMeusGrupsCard } from '../../components/ui/ElsMeusGrupsCard';

export default function DashboardPage() {
  const statsData = [
    { label: 'Membres Actius', value: '2.4K', trend: '+18%' },
    { label: 'Activitat Avui', value: '156', trend: '+7%' },
    { label: 'Grups', value: '89', trend: '+5%' },
    { label: 'Missatges', value: '1.2K', trend: '+23%' }
  ];

  return (
    <PageTemplate
      title="Xarxa Social"
      subtitle="Benvingut a la comunitat de La Pública"
      statsData={statsData}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 330px',
        gap: '24px',
        padding: '0 24px 24px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
      {/* Main Column - Social Feed (70%) */}
      <div>
        <SocialFeed />
      </div>

      {/* Right Column - Profile & Members */}
      <div>
        <ProfileCompletionCard />
        <MembresOnlineCard />
        <ElsMeusGrupsCard />
      </div>
      </div>
    </PageTemplate>
  );
}