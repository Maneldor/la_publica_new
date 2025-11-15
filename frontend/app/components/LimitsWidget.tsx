'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface Limit {
  name: string;
  used: number;
  max: number;
  label: string;
}

export default function LimitsWidget() {
  const [limits, setLimits] = useState<Limit[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExceeded, setHasExceeded] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/empresa/limits');
      if (response.ok) {
        const data = await response.json();
        const limitsArray = [
          { name: 'ofertas', used: data.ofertas.used, max: data.ofertas.max, label: 'Ofertes' },
          { name: 'extras', used: data.extras.used, max: data.extras.max, label: 'Extres' },
          { name: 'empleados', used: data.empleados.used, max: data.empleados.max, label: 'Empleats' },
          { name: 'usuaris', used: data.usuaris.used, max: data.usuaris.max, label: 'Usuaris' }
        ];
        setLimits(limitsArray);

        // Check if any limit exceeded
        const exceeded = limitsArray.some(limit => limit.used > limit.max);
        setHasExceeded(exceeded);
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    if (used > max) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    return Math.min(percentage, 100);
  };

  if (loading) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 mx-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-600 rounded w-3/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-2 bg-slate-600 rounded"></div>
            <div className="h-2 bg-slate-600 rounded"></div>
            <div className="h-2 bg-slate-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 mx-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Ús de Recursos
        </h3>
        {hasExceeded && (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* Limits list */}
      <div className="space-y-3">
        {limits.map((limit) => {
          const percentage = getProgressPercentage(limit.used, limit.max);
          const colorClass = getProgressColor(limit.used, limit.max);
          const isExceeded = limit.used > limit.max;

          return (
            <div key={limit.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${isExceeded ? 'text-red-400' : 'text-slate-300'}`}>
                  {limit.label}
                </span>
                <span className={`${isExceeded ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                  {limit.used} / {limit.max}
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div
                  className={`${colorClass} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <Link
        href="/empresa/pla"
        className="mt-4 block text-center text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
      >
        Veure detalls del pla →
      </Link>

      {/* Exceeded warning */}
      {hasExceeded && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/40 rounded text-xs text-red-400">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Has superat alguns límits
        </div>
      )}
    </div>
  );
}