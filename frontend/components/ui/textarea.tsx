'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: boolean;
}

const baseStyles: React.CSSProperties = {
  width: '100%',
  padding: 'var(--Textarea-padding, 8px 12px)',
  fontSize: 'var(--Textarea-font-size, 14px)',
  lineHeight: 'var(--Textarea-line-height, 1.5)',
  backgroundColor: 'var(--Textarea-background, #ffffff)',
  color: 'var(--Textarea-color, #111827)',
  border: '1px solid var(--Textarea-border-color, #d1d5db)',
  borderRadius: 'var(--Textarea-border-radius, 6px)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  resize: 'vertical' as const,
  minHeight: 'var(--Textarea-min-height, 80px)',
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  backgroundColor: 'var(--Textarea-disabled-background, #f9fafb)',
  resize: 'none' as const,
};

const errorStyles: React.CSSProperties = {
  borderColor: 'var(--Textarea-error-border-color, #dc2626)',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', disabled, error, style, ...props }, ref) => {
    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...(disabled ? disabledStyles : {}),
      ...(error ? errorStyles : {}),
      ...style,
    };

    return (
      <textarea
        ref={ref}
        className={className}
        style={combinedStyles}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
