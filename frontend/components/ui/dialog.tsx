'use client';

import { ReactNode, useEffect } from 'react';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--Dialog-overlay-background, rgba(0, 0, 0, 0.5))',
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyles}>
      <div
        style={overlayStyles}
        onClick={() => onOpenChange(false)}
      />
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogContent({ children, className = '', style }: DialogContentProps) {
  const contentStyles: React.CSSProperties = {
    backgroundColor: 'var(--Dialog-content-background, #ffffff)',
    borderRadius: 'var(--Dialog-content-border-radius, 8px)',
    boxShadow: 'var(--Dialog-content-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
    padding: 0,
    minWidth: 'var(--Dialog-content-min-width, 320px)',
    maxWidth: 'var(--Dialog-content-max-width, 448px)',
    width: '100%',
    margin: '0 16px',
    ...style,
  };

  return (
    <div className={className} style={contentStyles}>
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogHeader({ children, className = '', style }: DialogHeaderProps) {
  const headerStyles: React.CSSProperties = {
    padding: 'var(--Dialog-header-padding, 16px 24px)',
    borderBottom: '1px solid var(--Dialog-border-color, #e5e7eb)',
    ...style,
  };

  return (
    <div className={className} style={headerStyles}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogTitle({ children, className = '', style }: DialogTitleProps) {
  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--Dialog-title-font-size, 18px)',
    fontWeight: 'var(--Dialog-title-font-weight, 600)' as any,
    color: 'var(--Dialog-title-color, #111827)',
    margin: 0,
    ...style,
  };

  return (
    <h2 className={className} style={titleStyles}>
      {children}
    </h2>
  );
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogFooter({ children, className = '', style }: DialogFooterProps) {
  const footerStyles: React.CSSProperties = {
    padding: 'var(--Dialog-footer-padding, 16px 24px)',
    borderTop: '1px solid var(--Dialog-border-color, #e5e7eb)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--Dialog-footer-gap, 8px)',
    ...style,
  };

  return (
    <div className={className} style={footerStyles}>
      {children}
    </div>
  );
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogDescription({ children, className = '', style }: DialogDescriptionProps) {
  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--Dialog-description-font-size, 14px)',
    color: 'var(--Dialog-description-color, #6b7280)',
    margin: 0,
    ...style,
  };

  return (
    <p className={className} style={descriptionStyles}>
      {children}
    </p>
  );
}

interface DialogBodyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DialogBody({ children, className = '', style }: DialogBodyProps) {
  const bodyStyles: React.CSSProperties = {
    padding: 'var(--Dialog-body-padding, 24px)',
    ...style,
  };

  return (
    <div className={className} style={bodyStyles}>
      {children}
    </div>
  );
}
