import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    label: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'gray';
  badge?: string;
  className?: string;
}

const colorConfig = {
  blue: {
    border: 'border-blue-500',
    icon: 'text-blue-500',
    trend: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  green: {
    border: 'border-green-500',
    icon: 'text-green-500',
    trend: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  },
  purple: {
    border: 'border-purple-500',
    icon: 'text-purple-500',
    trend: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800'
  },
  red: {
    border: 'border-red-500',
    icon: 'text-red-500',
    trend: 'text-red-600',
    badge: 'bg-red-100 text-red-800'
  },
  orange: {
    border: 'border-orange-500',
    icon: 'text-orange-500',
    trend: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800'
  },
  yellow: {
    border: 'border-yellow-500',
    icon: 'text-yellow-500',
    trend: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  gray: {
    border: 'border-gray-500',
    icon: 'text-gray-500',
    trend: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-800'
  }
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  badge,
  className = ''
}: StatCardProps) {
  const colors = colorConfig[color];

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors.border} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Subtitle or Trend */}
          {subtitle && !trend && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}

          {trend && (
            <p className={`text-xs mt-1 font-medium ${
              trend.isPositive ? colors.trend : 'text-red-600'
            }`}>
              {trend.value} {trend.label}
            </p>
          )}

          {/* Badge for special cases */}
          {badge && (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${colors.badge}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Icon */}
        <div className={`${colors.icon} opacity-50 ml-4 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;