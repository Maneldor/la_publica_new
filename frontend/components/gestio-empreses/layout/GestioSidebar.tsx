// components/gestio-empreses/layout/GestioSidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Lock, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGestioPermissions } from '@/hooks/useGestioPermissions'
import {
  getFilteredSidebar,
  getGestorAdjustedLabels,
  type SidebarSection,
  type SidebarItem,
} from '@/lib/gestio-empreses/sidebar-config'

export function GestioSidebar() {
  const pathname = usePathname()
  const { role, isGestor } = useGestioPermissions()

  const sections = getFilteredSidebar(role)
  const gestorLabels = getGestorAdjustedLabels(role)

  // Estat per seccions col·lapsables
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach(section => {
      initial[section.id] = section.defaultOpen ?? true
    })
    return initial
  })

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getItemLabel = (item: SidebarItem): string => {
    if (isGestor && gestorLabels[item.id]) {
      return gestorLabels[item.id]
    }
    return item.label
  }

  const getSectionLabel = (section: SidebarSection): string => {
    if (isGestor && gestorLabels[section.id]) {
      // Només agafem la part després de " → "
      const parts = gestorLabels[section.id].split(' → ')
      return parts[1] || section.label
    }
    return section.label
  }

  const isItemActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="h-[73px] flex items-center px-4 border-b border-slate-200">
        <Link href="/gestio" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* Logo - placeholder amb inicials */}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">LP</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">La Pública</h1>
            <p className="text-xs text-slate-500">Dashboard de Gestió</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map(section => (
          <div key={section.id} className="mb-4">
            {/* Section Header */}
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900"
              >
                <span>{getSectionLabel(section)}</span>
                {openSections[section.id] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>
            ) : (
              <div className="px-2 py-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {getSectionLabel(section)}
              </div>
            )}

            {/* Section Items */}
            {(!section.collapsible || openSections[section.id]) && (
              <div className="mt-1 space-y-1">
                {section.items.length === 0 ? (
                  // Placeholder per seccions buides
                  <div className="px-3 py-2 text-sm text-slate-400 italic">
                    En desenvolupament...
                  </div>
                ) : (
                  section.items.map(item => {
                    const isActive = isItemActive(item.href)
                    const Icon = item.icon

                    if (item.disabled) {
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                          title="En construcció"
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                          <span>{getItemLabel(item)}</span>
                          <Lock className="h-3 w-3 ml-auto" />
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        <span>{getItemLabel(item)}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <Link
          href="/gestio/ajuda"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
          Ajuda i Suport
        </Link>
      </div>
    </aside>
  )
}