'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ===========================================
   CARD BASE - Connectada al Design System

   Tokens CSS utilitzats:
   --card-background, --card-border-color, --card-border-radius,
   --card-shadow, --card-shadow-hover, etc.

   Configurables des de: /admin/componentes → Cards

   Variants disponibles:
   - default: Card estàndard
   - highlighted: Card amb destac visual
   - interactive: Card clicable amb hover
   - interactive-expand: Card amb efecte expand en hover
   =========================================== */

// ============================================
// TIPOS
// ============================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'interactive' | 'interactive-expand';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noDivider?: boolean;
  compact?: boolean;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'compact' | 'default' | 'large';
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withBackground?: boolean;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface CardHoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// CARD
// ============================================

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = [
      // Usem CSS variables amb fallbacks
      'rounded-[var(--card-border-radius,0.75rem)]',
      'border',
      'border-[var(--card-border-color,#e5e7eb)]',
      'bg-[var(--card-background,#ffffff)]',
      'shadow-[var(--card-shadow,0_1px_3px_0_rgb(0_0_0/0.1))]',
    ].join(' ');

    const variantStyles = {
      default: '',
      highlighted: [
        'border-[var(--card-highlighted-border-color,#3b82f6)]',
        'bg-[var(--card-highlighted-background,#eff6ff)]',
      ].join(' '),
      interactive: [
        'cursor-pointer',
        'transition-all duration-200',
        'hover:shadow-[var(--card-shadow-hover,0_4px_6px_-1px_rgb(0_0_0/0.1))]',
        'hover:border-[var(--card-interactive-hover-border-color,#3b82f6)]',
      ].join(' '),
      'interactive-expand': [
        'cursor-pointer',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-[var(--card-interactive-hover-shadow,0_8px_16px_-4px_rgba(59,130,246,0.2))]',
        'hover:border-[var(--card-interactive-hover-border-color,#3b82f6)]',
        'hover:scale-[var(--card-expand-scale,1.02)]',
        'hover:-translate-y-[2px]',
        'hover:z-10',
        'group',
      ].join(' '),
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// ============================================
// CARD HEADER
// ============================================

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', noDivider = false, compact = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          compact
            ? 'gap-[var(--card-header-gap,0.375rem)] p-[var(--card-header-padding-compact,1rem)]'
            : 'gap-[var(--card-header-gap,0.375rem)] p-[var(--card-header-padding,1.25rem)]',
          !noDivider && 'border-b border-[var(--card-header-border-color,#f3f4f6)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// ============================================
// CARD TITLE
// ============================================

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, icon, action, subtitle, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                'w-[var(--card-icon-size,2.5rem)] h-[var(--card-icon-size,2.5rem)]',
                'rounded-[var(--card-icon-border-radius,0.5rem)]',
                'bg-[var(--card-icon-background,#f3f4f6)]',
                'flex items-center justify-center'
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h3
              ref={ref}
              className={cn(
                'font-[var(--card-title-font-weight,600)]',
                'text-[var(--card-title-font-size,1rem)]',
                'leading-[var(--card-title-line-height,1.5rem)]',
                'text-[var(--card-title-color,#111827)]',
                'tracking-tight',
                className
              )}
              {...props}
            >
              {children}
            </h3>
            {subtitle && (
              <p className="text-[var(--card-description-font-size,0.875rem)] text-[var(--card-description-color,#6b7280)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
    );
  }
);
CardTitle.displayName = 'CardTitle';

// ============================================
// CARD CONTENT
// ============================================

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', padding = 'default', ...props }, ref) => {
    const paddingStyles = {
      none: 'p-0',
      compact: 'p-[var(--card-content-padding-compact,1rem)]',
      default: 'p-[var(--card-content-padding,1.25rem)] pt-0',
      large: 'p-[var(--card-content-padding-large,1.5rem)]',
    };

    return (
      <div
        ref={ref}
        className={cn(paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

// ============================================
// CARD FOOTER
// ============================================

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', withBackground = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          'p-[var(--card-footer-padding,1rem)]',
          'border-t border-[var(--card-footer-border-color,#f3f4f6)]',
          withBackground && 'bg-[var(--card-footer-background,#f9fafb)] rounded-b-[var(--card-border-radius,0.75rem)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

// ============================================
// CARD DESCRIPTION
// ============================================

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-[var(--card-description-font-size,0.875rem)]',
          'text-[var(--card-description-color,#6b7280)]',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

// ============================================
// CARD HOVER CONTENT
// Per contingut que només es mostra en hover
// Requereix que el parent Card tingui variant="interactive-expand"
// ============================================

const CardHoverContent = React.forwardRef<HTMLDivElement, CardHoverContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'opacity-0 group-hover:opacity-100',
          'transform translate-y-2 group-hover:translate-y-0',
          'transition-all duration-[var(--card-expand-transition,300ms)]',
          'overflow-hidden',
          'max-h-0 group-hover:max-h-96',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHoverContent.displayName = 'CardHoverContent';

// ============================================
// EXPORTS
// ============================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardHoverContent,
};

export type {
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
  CardHoverContentProps,
};
