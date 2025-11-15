'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface Limit {
  name: string;
  used: number;
  max: number;
  label: string;
}

export default function LimitsCard() {
  const [limits, setLimits] = useState<Limit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExceeded, setHasExceeded] = useState(false);
  const [hasWarning, setHasWarning] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/empresa/limits');
      if (response.ok) {
        const data = await response.json();

        // Validar que data tiene la estructura esperada
        if (!data || typeof data !== 'object') {
          console.error('Invalid data format from API');
          return;
        }

        const limitsArray = [
          {
            name: 'activeOffers',
            used: data.data?.limits?.activeOffers?.current || 0,
            max: data.data?.limits?.activeOffers?.limit || 0,
            label: 'Ofertes Actives'
          },
          {
            name: 'featuredOffers',
            used: data.data?.limits?.featuredOffers?.current || 0,
            max: data.data?.limits?.featuredOffers?.limit || 0,
            label: 'Ofertes Destacades'
          },
          {
            name: 'teamMembers',
            used: data.data?.limits?.teamMembers?.current || 0,
            max: data.data?.limits?.teamMembers?.limit || 0,
            label: 'Membres Equip'
          },
          {
            name: 'storage',
            used: data.data?.limits?.storage?.current || 0,
            max: data.data?.limits?.storage?.limit || 0,
            label: 'Emmagatzematge'
          }
        ];

        setLimits(limitsArray);

        // Check status
        const exceeded = limitsArray.some(limit => limit.used > limit.max);
        const warning = limitsArray.some(limit => {
          const percentage = (limit.used / limit.max) * 100;
          return percentage >= 80 && limit.used <= limit.max;
        });

        setHasExceeded(exceeded);
        setHasWarning(warning);
      } else {
        console.error('API response not OK:', response.status);
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setIsLoading(false);
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

  const getStatusIcon = () => {
    if (hasExceeded) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (hasWarning) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <TrendingUp className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (hasExceeded) return 'Límit superat';
    if (hasWarning) return 'A prop del límit';
    return 'Tot correcte';
  };

  const getStatusColor = () => {
    if (hasExceeded) return 'text-red-600';
    if (hasWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Ús de Recursos</h3>
            <p className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>

      {/* Limits Progress Bars */}
      <div className="space-y-3 mb-4">
        {limits.map((limit) => {
          const percentage = getProgressPercentage(limit.used, limit.max);
          const colorClass = getProgressColor(limit.used, limit.max);
          const isExceeded = limit.used > limit.max;

          return (
            <div key={limit.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${isExceeded ? 'text-red-600' : 'text-gray-700'}`}>
                  {limit.label}
                </span>
                <span className={`${isExceeded ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {limit.used} / {limit.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <Link
        href="/empresa/pla"
        className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
      >
        Veure detalls del pla →
      </Link>

      {/* Alert if exceeded */}
      {hasExceeded && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Has superat alguns límits del teu pla
        </div>
      )}
    </div>
  );
}