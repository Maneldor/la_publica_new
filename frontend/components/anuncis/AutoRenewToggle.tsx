'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';

interface AutoRenewToggleProps {
  anuncioId: string;
  initialEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function AutoRenewToggle({
  anuncioId,
  initialEnabled = false,
  onToggle,
  disabled = false,
  showLabel = true
}: AutoRenewToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    const newValue = !isEnabled;
    setIsLoading(true);
    setError(null);

    // Optimistic update
    setIsEnabled(newValue);

    try {
      const response = await fetch(`/api/announcements/${anuncioId}/auto-renew`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newValue })
      });

      const data = await response.json();

      if (!response.ok) {
        // Revertir canvi optimista
        setIsEnabled(!newValue);
        throw new Error(data.error || 'Error canviant auto-renovacio');
      }

      if (onToggle) {
        onToggle(newValue);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
      // Revertir canvi optimista
      setIsEnabled(!newValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <label
          htmlFor={`auto-renew-${anuncioId}`}
          className="text-sm text-gray-700 cursor-pointer select-none flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
          Auto-renovar
        </label>
      )}

      <button
        id={`auto-renew-${anuncioId}`}
        type="button"
        role="switch"
        aria-checked={isEnabled}
        disabled={disabled || isLoading}
        onClick={handleToggle}
        className={`
          relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
          ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="sr-only">Auto-renovar anunci</span>
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out flex items-center justify-center
            ${isEnabled ? 'translate-x-4' : 'translate-x-0'}
          `}
        >
          {isLoading && (
            <Loader2 className="h-2.5 w-2.5 text-gray-400 animate-spin" />
          )}
        </span>
      </button>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
