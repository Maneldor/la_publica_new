'use client';

import React from 'react';

interface MetricWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    badge: 'bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    icon: 'text-green-500',
    badge: 'bg-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-100'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    icon: 'text-red-500',
    badge: 'bg-red-100'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    badge: 'bg-purple-100'
  }
};

export function MetricWidget({
  title,
  value,
  change,
  changeLabel = 'desde el mes pasado',
  icon,
  color = 'blue',
  format = 'number',
  loading = false
}: MetricWidgetProps) {
  const colors = colorMap[color];

  const formatValue = () => {
    if (loading) return '...';

    switch (format) {
      case 'currency':
        return typeof value === 'number'
          ? `€${value.toLocaleString('es-ES')}`
          : value;
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value;
      default:
        return typeof value === 'number'
          ? value.toLocaleString('es-ES')
          : value;
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border ${colors.border} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      {/* Fondo decorativo */}
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full ${colors.bg} opacity-50`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Título */}
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>

            {/* Valor */}
            <div className="flex items-baseline">
              <p className={`text-2xl font-bold ${loading ? 'text-gray-400' : 'text-gray-900'} transition-all duration-300`}>
                {formatValue()}
              </p>
            </div>

            {/* Cambio */}
            {change !== undefined && !loading && (
              <div className="flex items-center mt-3 text-sm">
                {change > 0 ? (
                  <div className="flex items-center text-green-600">
                    <span className="mr-1">↗</span>
                    <span className="font-semibold">+{change}%</span>
                  </div>
                ) : change < 0 ? (
                  <div className="flex items-center text-red-600">
                    <span className="mr-1">↘</span>
                    <span className="font-semibold">{change}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <span className="font-semibold">0%</span>
                  </div>
                )}
                <span className="ml-2 text-gray-500">{changeLabel}</span>
              </div>
            )}
          </div>

          {/* Icono */}
          {icon && (
            <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon}`}>
              {icon}
            </div>
          )}
        </div>

        {/* Barra de progreso opcional */}
        {!loading && change !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-gray-400'
                }`}
                style={{
                  width: `${Math.min(Math.abs(change), 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}