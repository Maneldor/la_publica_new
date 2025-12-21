'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'highlighted' | 'interactive';
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noDivider?: boolean;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'compact' | 'default' | 'large';
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  subtitle?: string;
}

// ============================================
// VARIANTES Y ESTILOS
// ============================================

const variantClasses = {
  default: 'bg-white rounded-xl border border-gray-200 shadow-sm',
  highlighted: 'bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm',
  interactive: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
};

const paddingClasses = {
  none: '',
  compact: 'px-4 py-3',
  default: 'px-5 py-4',
  large: 'px-6 py-5',
};

// ============================================
// COMPONENTES
// ============================================

export function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  noDivider = false,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'px-5 py-4',
        !noDivider && 'border-b border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  icon,
  action,
  subtitle,
  className = '',
  ...props
}: CardTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className={cn('font-semibold text-gray-900', className)} {...props}>
            {children}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
  padding = 'default',
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}