import { MemberCard } from '../../../../components/ui/MemberCard';
import { Member } from '../data/sampleMembers';

interface MembersGridProps {
  members: Member[];
  viewMode: 'grid' | 'list';
}

export function MembersGrid({ members, viewMode }: MembersGridProps) {
  if (members.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '2px dashed #e9ecef'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#6c757d',
          marginBottom: '8px'
        }}>
          No s'han trobat membres
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#8e8e93',
          margin: 0
        }}>
          Prova a ajustar els filtres o el terme de cerca
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: viewMode === 'grid' ? 'grid' : 'block',
      gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
      gap: viewMode === 'grid' ? '20px' : '0'
    }}>
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}