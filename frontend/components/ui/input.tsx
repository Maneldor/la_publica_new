'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

const baseStyles: React.CSSProperties = {
  width: '100%',
  padding: 'var(--Input-padding, 8px 12px)',
  fontSize: 'var(--Input-font-size, 14px)',
  lineHeight: 'var(--Input-line-height, 1.5)',
  backgroundColor: 'var(--Input-background, #ffffff)',
  color: 'var(--Input-color, #111827)',
  border: '1px solid var(--Input-border-color, #d1d5db)',
  borderRadius: 'var(--Input-border-radius, 6px)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  backgroundColor: 'var(--Input-disabled-background, #f9fafb)',
};

const errorStyles: React.CSSProperties = {
  borderColor: 'var(--Input-error-border-color, #dc2626)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', disabled, error, style, ...props }, ref) => {
    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...(disabled ? disabledStyles : {}),
      ...(error ? errorStyles : {}),
      ...style,
    };

    return (
      <input
        type={type}
        ref={ref}
        className={className}
        style={combinedStyles}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
