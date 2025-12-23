'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
  link: 'text-blue-600 underline-offset-4 hover:underline bg-transparent',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
};

const sizes = {
  sm: 'h-9 px-3 py-1.5 text-sm',
  md: 'h-10 px-4 py-2 text-sm',
  lg: 'h-11 px-6 py-3 text-base',
  icon: 'h-10 w-10 p-0'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    // Si asChild és true, renderitzem directament els children
    // Això permet usar Link dins de Button
    if (asChild) {
      return (
        <span className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';