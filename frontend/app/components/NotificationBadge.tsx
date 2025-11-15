'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/app/contexts/NotificationContext';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { unreadCount, hasErrors, hasWarnings } = useNotifications();

  const getBadgeColor = () => {
    if (hasErrors) return 'bg-red-500';
    if (hasWarnings) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
      aria-label="Notificaciones"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <>
          {/* Badge numérico */}
          <span
            className={`absolute -top-1 -right-1 ${getBadgeColor()} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
          {/* Pulsing dot para llamar atención */}
          {hasErrors && (
            <span className="absolute -top-1 -right-1 w-5 h-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </>
      )}
    </button>
  );
}