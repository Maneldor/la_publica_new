'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

const getVariantStyles = (variant: string): React.CSSProperties => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: 'var(--Button-default-bg, #2563eb)',
        color: 'var(--Button-default-color, #ffffff)',
        border: 'none',
      };
    case 'outline':
      return {
        backgroundColor: 'var(--Button-outline-bg, #ffffff)',
        color: 'var(--Button-outline-color, #374151)',
        border: '1px solid var(--Button-outline-border, #d1d5db)',
      };
    case 'destructive':
      return {
        backgroundColor: 'var(--Button-destructive-bg, #dc2626)',
        color: 'var(--Button-destructive-color, #ffffff)',
        border: 'none',
      };
    case 'ghost':
      return {
        backgroundColor: 'var(--Button-ghost-bg, transparent)',
        color: 'var(--Button-ghost-color, #374151)',
        border: 'none',
      };
    case 'link':
      return {
        backgroundColor: 'transparent',
        color: 'var(--Button-link-color, #2563eb)',
        border: 'none',
        textDecoration: 'none',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--Button-secondary-bg, #f3f4f6)',
        color: 'var(--Button-secondary-color, #111827)',
        border: 'none',
      };
    default:
      return {
        backgroundColor: 'var(--Button-default-bg, #2563eb)',
        color: 'var(--Button-default-color, #ffffff)',
        border: 'none',
      };
  }
};

const getSizeStyles = (size: string): React.CSSProperties => {
  switch (size) {
    case 'sm':
      return {
        height: 'var(--Button-height-sm, 36px)',
        padding: 'var(--Button-padding-sm, 6px 12px)',
        fontSize: 'var(--Button-font-size-sm, 14px)',
      };
    case 'md':
      return {
        height: 'var(--Button-height-md, 40px)',
        padding: 'var(--Button-padding-md, 8px 16px)',
        fontSize: 'var(--Button-font-size-md, 14px)',
      };
    case 'lg':
      return {
        height: 'var(--Button-height-lg, 44px)',
        padding: 'var(--Button-padding-lg, 12px 24px)',
        fontSize: 'var(--Button-font-size-lg, 16px)',
      };
    case 'icon':
      return {
        height: 'var(--Button-height-icon, 40px)',
        width: 'var(--Button-width-icon, 40px)',
        padding: '0',
        fontSize: 'var(--Button-font-size-md, 14px)',
      };
    default:
      return {
        height: 'var(--Button-height-md, 40px)',
        padding: 'var(--Button-padding-md, 8px 16px)',
        fontSize: 'var(--Button-font-size-md, 14px)',
      };
  }
};

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'var(--Button-font-weight, 500)' as any,
  borderRadius: 'var(--Button-border-radius, 6px)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  outline: 'none',
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'default', size = 'md', asChild = false, disabled, style, ...props }, ref) => {
    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...getVariantStyles(variant),
      ...getSizeStyles(size),
      ...(disabled ? disabledStyles : {}),
      ...style,
    };

    // Si asChild és true, renderitzem directament els children
    // Això permet usar Link dins de Button
    if (asChild) {
      return (
        <span
          className={className}
          style={combinedStyles}
        >
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={className}
        style={combinedStyles}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
