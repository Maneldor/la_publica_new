'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Star, Users, User, ChevronRight, AlertCircle } from 'lucide-react';

interface Limit {
  name: string;
  used: number;
  max: number;
  label: string;
  icon: any;
}

export default function LimitsCard() {
  const [limits, setLimits] = useState<Limit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/empresa/limits');
      if (response.ok) {
        const data = await response.json();

        if (!data || typeof data !== 'object') {
          console.error('Invalid data format from API');
          return;
        }

        const limitsArray = [
          {
            name: 'activeOffers',
            used: data.data?.limits?.activeOffers?.current || 0,
            max: data.data?.limits?.activeOffers?.limit || 0,
            label: 'Ofertes Actives',
            icon: Package
          },
          {
            name: 'featuredOffers',
            used: data.data?.limits?.featuredOffers?.current || 0,
            max: data.data?.limits?.featuredOffers?.limit || 0,
            label: 'Ofertes Destacades',
            icon: Star
          },
          {
            name: 'teamMembers',
            used: data.data?.limits?.teamMembers?.current || 0,
            max: data.data?.limits?.teamMembers?.limit || 0,
            label: 'Membres Equip',
            icon: Users
          },
          {
            name: 'storage',
            used: data.data?.limits?.storage?.current || 0,
            max: data.data?.limits?.storage?.limit || 0,
            label: 'Emmagatzematge',
            icon: User
          }
        ];

        setLimits(limitsArray);
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
    return 'bg-blue-500';
  };

  const getProgressPercentage = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    return Math.min(percentage, 100);
  };

  const getTextColor = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    if (used > max) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall status
  const hasExceeded = limits.some(limit => limit.used > limit.max);
  const hasWarning = limits.some(limit => {
    const percentage = (limit.used / limit.max) * 100;
    return percentage >= 80 && limit.used <= limit.max;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Ús de Recursos del Pla</h3>
          {hasExceeded && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Límit superat
            </div>
          )}
          {!hasExceeded && hasWarning && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Prop del límit
            </div>
          )}
        </div>

        <Link
          href="/empresa/pla"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
        >
          Veure detalls
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Limits Grid - Horizontal in Desktop, Vertical in Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {limits.map((limit) => {
          const percentage = getProgressPercentage(limit.used, limit.max);
          const progressColor = getProgressColor(limit.used, limit.max);
          const textColor = getTextColor(limit.used, limit.max);
          const Icon = limit.icon;

          return (
            <div key={limit.name} className="flex flex-col gap-3">
              {/* Icon and Label */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{limit.label}</p>
                  <p className={`text-xs font-semibold ${textColor}`}>
                    {limit.used} / {limit.max}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${progressColor} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Percentage Text */}
              <p className="text-xs text-gray-500 text-center">
                {Math.round(percentage)}% utilitzat
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}