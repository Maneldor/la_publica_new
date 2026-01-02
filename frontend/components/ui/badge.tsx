'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const getVariantStyles = (variant: string): React.CSSProperties => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: 'var(--Badge-default-bg, #2563eb)',
        color: 'var(--Badge-default-color, #ffffff)',
        border: 'none',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--Badge-secondary-bg, #f3f4f6)',
        color: 'var(--Badge-secondary-color, #111827)',
        border: 'none',
      };
    case 'destructive':
      return {
        backgroundColor: 'var(--Badge-destructive-bg, #dc2626)',
        color: 'var(--Badge-destructive-color, #ffffff)',
        border: 'none',
      };
    case 'outline':
      return {
        backgroundColor: 'var(--Badge-outline-bg, #ffffff)',
        color: 'var(--Badge-outline-color, #111827)',
        border: '1px solid var(--Badge-outline-border, #d1d5db)',
      };
    case 'success':
      return {
        backgroundColor: 'var(--Badge-success-bg, #dcfce7)',
        color: 'var(--Badge-success-color, #166534)',
        border: 'none',
      };
    case 'warning':
      return {
        backgroundColor: 'var(--Badge-warning-bg, #fef3c7)',
        color: 'var(--Badge-warning-color, #92400e)',
        border: 'none',
      };
    default:
      return {
        backgroundColor: 'var(--Badge-default-bg, #2563eb)',
        color: 'var(--Badge-default-color, #ffffff)',
        border: 'none',
      };
  }
};

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: 'var(--Badge-padding, 4px 8px)',
  fontSize: 'var(--Badge-font-size, 12px)',
  fontWeight: 'var(--Badge-font-weight, 500)' as any,
  borderRadius: 'var(--Badge-border-radius, 9999px)',
  lineHeight: 1,
};

export function Badge({ children, className = '', variant = 'default', style, ...props }: BadgeProps) {
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <span
      className={className}
      style={combinedStyles}
      {...props}
    >
      {children}
    </span>
  );
}
