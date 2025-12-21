'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  color?: 'default' | 'indigo' | 'green' | 'amber' | 'red' | 'blue';
}

interface StatsGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

const colorClasses = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
};

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color || 'default'];

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                {stat.label}
              </span>
              {stat.trend && (
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded',
                    stat.trendUp !== false
                      ? 'text-green-600 bg-green-50'
                      : 'text-red-600 bg-red-50'
                  )}
                >
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {stat.icon && (
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    colors.bg
                  )}
                >
                  <span className={colors.text}>{stat.icon}</span>
                </div>
              )}
              <span className="text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Variante compacta para stats más pequeñas
export function StatsGridCompact({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn('grid gap-3', gridClasses[columns], className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
        >
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            {stat.label}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            {stat.trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.trendUp !== false ? 'text-green-600' : 'text-red-600'
                )}
              >
                {stat.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
