'use client';

import { MemberCard } from '../../../../components/ui/MemberCard';
import { Member } from '../page';
import { Users } from 'lucide-react';

interface ConnectionActions {
  onConnect: (memberId: string) => Promise<void>;
  onAccept: (connectionId: string, memberId: string) => Promise<void>;
  onReject: (connectionId: string, memberId: string) => Promise<void>;
  onDisconnect: (connectionId: string, memberId: string) => Promise<void>;
  onCancel: (connectionId: string, memberId: string) => Promise<void>;
}

interface MembersGridProps {
  members: Member[];
  viewMode: 'grid' | 'list';
  connectionActions?: ConnectionActions;
}

export function MembersGrid({ members, viewMode, connectionActions }: MembersGridProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No s'han trobat membres
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Prova a ajustar els filtres o el terme de cerca per trobar el que busques
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch'
          : 'space-y-0'
      }
    >
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          viewMode={viewMode}
          connectionActions={connectionActions}
        />
      ))}
    </div>
  );
}
