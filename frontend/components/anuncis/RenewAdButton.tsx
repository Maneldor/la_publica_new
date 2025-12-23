'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RenewAdButtonProps {
  anuncioId: string;
  expiresAt?: Date | string | null;
  status: string;
  onSuccess?: (newExpiresAt: Date) => void;
  size?: 'sm' | 'md' | 'lg';
  showExpirationInfo?: boolean;
}

export function RenewAdButton({
  anuncioId,
  expiresAt,
  status,
  onSuccess,
  size = 'sm',
  showExpirationInfo = true
}: RenewAdButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular dies restants
  const getDaysRemaining = () => {
    if (!expiresAt) return null;
    const expDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isExpired = status === 'EXPIRED' || (daysRemaining !== null && daysRemaining <= 0);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  // Només mostrar si l'anunci pot ser renovat
  if (!['PUBLISHED', 'EXPIRED'].includes(status)) {
    return null;
  }

  const handleRenew = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/announcements/${anuncioId}/renew`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error renovant anunci');
      }

      if (onSuccess && data.expiresAt) {
        onSuccess(new Date(data.expiresAt));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonVariant = () => {
    if (isExpired) return 'destructive';
    if (isExpiringSoon) return 'default';
    return 'outline';
  };

  const getExpirationLabel = () => {
    if (isExpired) return 'Expirat';
    if (daysRemaining === 1) return 'Expira demà!';
    if (daysRemaining !== null && daysRemaining <= 7) return `Expira en ${daysRemaining} dies`;
    if (daysRemaining !== null) return `${daysRemaining} dies restants`;
    return null;
  };

  return (
    <div className="flex flex-col gap-1">
      {showExpirationInfo && (
        <div className="flex items-center gap-2">
          {isExpired && (
            <span className="text-xs text-red-600 font-medium">
              Expirat
            </span>
          )}
          {isExpiringSoon && (
            <span className="text-xs text-amber-600 font-medium">
              {getExpirationLabel()}
            </span>
          )}
          {!isExpired && !isExpiringSoon && daysRemaining && (
            <span className="text-xs text-gray-500">
              {getExpirationLabel()}
            </span>
          )}
        </div>
      )}

      <Button
        onClick={handleRenew}
        disabled={isLoading}
        variant={getButtonVariant()}
        size={size}
        className="gap-1"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Renovant...' : isExpired ? 'Reactivar' : 'Renovar'}
      </Button>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
