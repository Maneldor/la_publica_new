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
    border: '#3b82f6',
    icon: '#3b82f6',
    trend: '#2563eb',
    badge: { bg: '#dbeafe', color: '#1e40af' }
  },
  green: {
    border: '#22c55e',
    icon: '#22c55e',
    trend: '#16a34a',
    badge: { bg: '#dcfce7', color: '#166534' }
  },
  purple: {
    border: '#a855f7',
    icon: '#a855f7',
    trend: '#9333ea',
    badge: { bg: '#f3e8ff', color: '#6b21a8' }
  },
  red: {
    border: '#ef4444',
    icon: '#ef4444',
    trend: '#dc2626',
    badge: { bg: '#fee2e2', color: '#991b1b' }
  },
  orange: {
    border: '#f97316',
    icon: '#f97316',
    trend: '#ea580c',
    badge: { bg: '#ffedd5', color: '#9a3412' }
  },
  yellow: {
    border: '#eab308',
    icon: '#eab308',
    trend: '#ca8a04',
    badge: { bg: '#fef9c3', color: '#854d0e' }
  },
  gray: {
    border: '#6b7280',
    icon: '#6b7280',
    trend: '#4b5563',
    badge: { bg: '#f3f4f6', color: '#374151' }
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
    <div
      className={className}
      style={{
        backgroundColor: 'var(--StatCard-background, #ffffff)',
        borderRadius: 'var(--StatCard-border-radius, 8px)',
        boxShadow: 'var(--StatCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
        padding: 'var(--StatCard-padding, 16px)',
        borderLeft: `4px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 'var(--StatCard-title-size, 14px)',
              fontWeight: '500',
              color: 'var(--StatCard-title-color, #4b5563)',
              margin: 0,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: 'var(--StatCard-value-size, 1.5rem)',
              fontWeight: 'var(--StatCard-value-weight, 700)',
              color: 'var(--StatCard-value-color, #111827)',
              margin: '4px 0 0 0',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Subtitle or Trend */}
          {subtitle && !trend && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--StatCard-subtitle-color, #6b7280)',
                margin: '4px 0 0 0',
              }}
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <p
              style={{
                fontSize: '12px',
                fontWeight: '500',
                margin: '4px 0 0 0',
                color: trend.isPositive
                  ? 'var(--StatCard-trend-up-color, ' + colors.trend + ')'
                  : 'var(--StatCard-trend-down-color, #dc2626)',
              }}
            >
              {trend.value} {trend.label}
            </p>
          )}

          {/* Badge for special cases */}
          {badge && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '9999px',
                marginTop: '8px',
                backgroundColor: 'var(--StatCard-badge-background, ' + colors.badge.bg + ')',
                color: 'var(--StatCard-badge-color, ' + colors.badge.color + ')',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Icon */}
        <div
          style={{
            color: colors.icon,
            opacity: 0.5,
            marginLeft: '16px',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
