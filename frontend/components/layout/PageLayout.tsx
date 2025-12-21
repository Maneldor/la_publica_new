'use client'

import { ReactNode } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageLayoutProps {
  children: ReactNode

  // Breadcrumb
  breadcrumb?: BreadcrumbItem[]

  // Header de página (opcional)
  title?: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode

  // Clases adicionales
  className?: string

  // Sin padding (para páginas que usan el espacio completo)
  noPadding?: boolean
}

export function PageLayout({
  children,
  breadcrumb,
  title,
  subtitle,
  icon,
  actions,
  className,
  noPadding = false,
}: PageLayoutProps) {
  return (
    <div className={cn(
      !noPadding && 'px-6 py-6',
      className
    )}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-300" />
              {item.href ? (
                <Link href={item.href} className="hover:text-gray-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header de página */}
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
