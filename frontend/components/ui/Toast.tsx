'use client';

import { useEffect } from 'react';
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const getTypeStyles = (type: string): React.CSSProperties => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: 'var(--Toast-success-background, #f0fdf4)',
        borderColor: 'var(--Toast-success-border-color, #bbf7d0)',
        color: 'var(--Toast-success-color, #166534)',
      };
    case 'error':
      return {
        backgroundColor: 'var(--Toast-error-background, #fef2f2)',
        borderColor: 'var(--Toast-error-border-color, #fecaca)',
        color: 'var(--Toast-error-color, #991b1b)',
      };
    case 'warning':
      return {
        backgroundColor: 'var(--Toast-warning-background, #fffbeb)',
        borderColor: 'var(--Toast-warning-border-color, #fde68a)',
        color: 'var(--Toast-warning-color, #92400e)',
      };
    case 'info':
      return {
        backgroundColor: 'var(--Toast-info-background, #eff6ff)',
        borderColor: 'var(--Toast-info-border-color, #bfdbfe)',
        color: 'var(--Toast-info-color, #1e40af)',
      };
    default:
      return {
        backgroundColor: 'var(--Toast-default-background, #f9fafb)',
        borderColor: 'var(--Toast-default-border-color, #e5e7eb)',
        color: 'var(--Toast-default-color, #1f2937)',
      };
  }
};

const getIconColor = (type: string): string => {
  switch (type) {
    case 'success':
      return 'var(--Toast-success-icon-color, #16a34a)';
    case 'error':
      return 'var(--Toast-error-icon-color, #dc2626)';
    case 'warning':
      return 'var(--Toast-warning-icon-color, #d97706)';
    case 'info':
      return 'var(--Toast-info-icon-color, #2563eb)';
    default:
      return 'var(--Toast-default-icon-color, #6b7280)';
  }
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--Toast-position-bottom, 16px)',
    right: 'var(--Toast-position-right, 16px)',
    zIndex: 50,
    animation: 'slideUp 0.3s ease-out',
  };

  const toastStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--Toast-gap, 12px)',
    padding: 'var(--Toast-padding, 12px 16px)',
    border: '1px solid',
    borderRadius: 'var(--Toast-border-radius, 8px)',
    boxShadow: 'var(--Toast-shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
    maxWidth: 'var(--Toast-max-width, 400px)',
    ...getTypeStyles(type),
  };

  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    color: getIconColor(type),
    flexShrink: 0,
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--Toast-font-size, 14px)',
    fontWeight: 'var(--Toast-font-weight, 500)' as any,
  };

  const closeButtonStyles: React.CSSProperties = {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--Toast-close-button-color, #9ca3af)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  };

  return (
    <div style={containerStyles}>
      <div style={toastStyles}>
        {getIcon()}
        <p style={messageStyles}>{message}</p>
        <button
          onClick={onClose}
          style={closeButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--Toast-close-button-hover-color, #4b5563)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--Toast-close-button-color, #9ca3af)';
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Hook para usar toast
export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
