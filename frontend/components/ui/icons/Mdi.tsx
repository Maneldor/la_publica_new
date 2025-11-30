'use client';

import React from 'react';
import { iconPaths, type IconName } from './iconPaths';
import {
  combineIconStyles,
  iconVariantStyles,
  iconSizeValues,
  iconInteractionStyles,
  type IconVariant,
  type IconSize,
} from './iconStyles';

export interface MdiIconProps {
  name: IconName;
  size?: IconSize | number;
  variant?: IconVariant;
  className?: string;
  interactive?: 'hover' | 'clickable' | 'disabled' | false;
  onClick?: () => void;
  'aria-label'?: string;
  title?: string;
}

export function MdiIcon({
  name,
  size = 'md',
  variant = 'default',
  className = '',
  interactive = false,
  onClick,
  'aria-label': ariaLabel,
  title,
}: MdiIconProps) {
  const path = iconPaths[name];

  if (!path) {
    console.warn(`Icon "${name}" not found in iconPaths`);
    return null;
  }

  const sizeValue = typeof size === 'number' ? size : iconSizeValues[size];

  const classes = combineIconStyles(
    iconVariantStyles[variant],
    interactive && iconInteractionStyles[interactive],
    className
  );

  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : undefined}
    >
      <path d={path} />
    </svg>
  );
}

export interface MdiIconBadgeProps extends Omit<MdiIconProps, 'className'> {
  badge?: number | string;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  className?: string;
}

export function MdiIconBadge({
  badge,
  badgeVariant = 'primary',
  className = '',
  ...iconProps
}: MdiIconBadgeProps) {
  const badgeColors = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-purple-500 text-white',
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-gray-900',
  };

  return (
    <div className={combineIconStyles('relative inline-flex', className)}>
      <MdiIcon {...iconProps} />
      {badge && (
        <span
          className={combineIconStyles(
            'absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 text-xs font-semibold rounded-full flex items-center justify-center',
            badgeColors[badgeVariant]
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export interface TrendIconProps {
  value: number;
  size?: IconSize | number;
  className?: string;
  showValue?: boolean;
}

export function TrendIcon({
  value,
  size = 'md',
  className = '',
  showValue = false
}: TrendIconProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const iconName: IconName = isNeutral
    ? 'trendingNeutral'
    : isPositive
      ? 'trendingUp'
      : 'trendingDown';

  const variant: IconVariant = isNeutral
    ? 'muted'
    : isPositive
      ? 'success'
      : 'error';

  return (
    <div className={combineIconStyles('inline-flex items-center gap-1', className)}>
      <MdiIcon name={iconName} size={size} variant={variant} />
      {showValue && (
        <span className={combineIconStyles(
          'text-sm font-medium',
          isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive && '+'}
          {value}%
        </span>
      )}
    </div>
  );
}

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';

export interface StatusIconProps {
  status: StatusType;
  size?: IconSize | number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function StatusIcon({
  status,
  size = 'md',
  className = '',
  showLabel = false,
  label
}: StatusIconProps) {
  const statusConfig = {
    success: { icon: 'checkCircle' as IconName, variant: 'success' as IconVariant, label: 'Èxit' },
    error: { icon: 'closeCircle' as IconName, variant: 'error' as IconVariant, label: 'Error' },
    warning: { icon: 'alertCircle' as IconName, variant: 'warning' as IconVariant, label: 'Atenció' },
    info: { icon: 'info' as IconName, variant: 'info' as IconVariant, label: 'Informació' },
    pending: { icon: 'clock' as IconName, variant: 'muted' as IconVariant, label: 'Pendent' },
  };

  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <div className={combineIconStyles('inline-flex items-center gap-1', className)}>
      <MdiIcon name={config.icon} size={size} variant={config.variant} />
      {showLabel && (
        <span className={combineIconStyles(
          'text-sm font-medium',
          iconVariantStyles[config.variant]
        )}>
          {displayLabel}
        </span>
      )}
    </div>
  );
}

export interface LoadingIconProps {
  size?: IconSize | number;
  variant?: IconVariant;
  className?: string;
  label?: string;
}

export function LoadingIcon({
  size = 'md',
  variant = 'primary',
  className = '',
  label = 'Carregant...'
}: LoadingIconProps) {
  const sizeValue = typeof size === 'number' ? size : iconSizeValues[size];

  return (
    <div className={combineIconStyles('inline-flex items-center gap-2', className)}>
      <div
        className={combineIconStyles(
          'animate-spin rounded-full border-2 border-t-transparent',
          iconVariantStyles[variant].replace('text-', 'border-')
        )}
        style={{
          width: sizeValue,
          height: sizeValue,
          borderWidth: Math.max(2, Math.floor(sizeValue / 12))
        }}
        aria-label={label}
      />
      {label && (
        <span className={combineIconStyles(
          'text-sm',
          iconVariantStyles[variant]
        )}>
          {label}
        </span>
      )}
    </div>
  );
}