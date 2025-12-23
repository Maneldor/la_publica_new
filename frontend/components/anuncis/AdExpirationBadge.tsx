'use client';

import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface AdExpirationBadgeProps {
  expiresAt?: Date | string | null;
  status: string;
  deletionScheduledAt?: Date | string | null;
  showIcon?: boolean;
  className?: string;
}

export function AdExpirationBadge({
  expiresAt,
  status,
  deletionScheduledAt,
  showIcon = true,
  className = ''
}: AdExpirationBadgeProps) {
  // Calcular dies restants
  const getDaysRemaining = (date: Date | string) => {
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Si esta eliminat
  if (status === 'ARCHIVED' || status === 'DELETED') {
    return null;
  }

  // Si esta expirat amb data d'eliminacio
  if (status === 'EXPIRED' && deletionScheduledAt) {
    const daysUntilDeletion = getDaysRemaining(deletionScheduledAt);

    if (daysUntilDeletion <= 1) {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
          {showIcon && <XCircle className="h-3 w-3" />}
          S'elimina avui!
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        {showIcon && <AlertTriangle className="h-3 w-3" />}
        Expirat - S'elimina en {daysUntilDeletion} dies
      </span>
    );
  }

  // Si esta expirat sense data d'eliminacio
  if (status === 'EXPIRED') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        {showIcon && <XCircle className="h-3 w-3" />}
        Expirat
      </span>
    );
  }

  // Si no te data d'expiracio
  if (!expiresAt) {
    return null;
  }

  const daysRemaining = getDaysRemaining(expiresAt);

  // Si ja ha passat la data d'expiracio (hauria de ser EXPIRED pero per si de cas)
  if (daysRemaining <= 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        {showIcon && <XCircle className="h-3 w-3" />}
        Expirat
      </span>
    );
  }

  // Expira dema
  if (daysRemaining === 1) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 ${className}`}>
        {showIcon && <AlertTriangle className="h-3 w-3" />}
        Expira dema!
      </span>
    );
  }

  // Expira en menys de 7 dies
  if (daysRemaining <= 7) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 ${className}`}>
        {showIcon && <Clock className="h-3 w-3" />}
        Expira en {daysRemaining} dies
      </span>
    );
  }

  // Actiu amb mes de 7 dies
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ${className}`}>
      {showIcon && <CheckCircle className="h-3 w-3" />}
      {daysRemaining} dies restants
    </span>
  );
}
