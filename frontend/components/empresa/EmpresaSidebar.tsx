'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  MessageSquare,
  Bell,
  Bot,
  FolderOpen,
  ChevronDown,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { signOut } from 'next-auth/react';

// Component reutilitzable per al logo
export function LaPublicaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/images/cropped-logo_la-Pública-ok-2.png"
      alt="La Pública"
      className={cn("h-8 w-auto object-contain", className)}
    />
  )
}

interface Item {
  label: string;
  href: string;
  icon: any;
  badge?: number | string;
  isNew?: boolean;
}

interface Section {
  title: string;
  items: Item[];
}

const EMPRESA_SIDEBAR_SECTIONS: Section[] = [
  {
    title: 'GENERAL',
    items: [
      { label: 'Dashboard', href: '/empresa/dashboard', icon: LayoutDashboard },
      { label: 'Perfil', href: '/empresa/perfil', icon: Building2 },
    ]
  },
  {
    title: 'GESTIÓ',
    items: [
      { label: 'Ofertes', href: '/empresa/ofertes', icon: Tag },
      { label: 'Equip', href: '/empresa/equip', icon: Users },
    ]
  },
  {
    title: 'NEGOCI',
    items: [
      { label: 'Pla', href: '/empresa/pla', icon: CreditCard },
      { label: 'Facturació', href: '/empresa/facturacio', icon: Receipt },
      { label: 'Estadístiques', href: '/empresa/estadistiques', icon: BarChart3 },
    ]
  },
  {
    title: 'COMUNICACIÓ',
    items: [
      { label: 'Missatges', href: '/empresa/missatges', icon: MessageSquare, badge: 2 },
      { label: 'Notificacions', href: '/empresa/notificacions', icon: Bell, badge: 3 },
    ]
  },
  {
    title: 'EINES',
    items: [
      { label: 'Agents IA', href: '/empresa/agents', icon: Bot, isNew: true },
      { label: 'Recursos', href: '/empresa/recursos', icon: FolderOpen },
    ]
  }
];

interface EmpresaSidebarProps {
  plan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
  missatgesCount?: number;
  notificacionsCount?: number;
}

export default function EmpresaSidebar({
  plan,
  missatgesCount = 0,
  notificacionsCount = 0
}: EmpresaSidebarProps) {
  const pathname = usePathname();
  // Estat per controlar quines seccions estan obertes. Per defecte totes.
  const [openSections, setOpenSections] = useState<string[]>(EMPRESA_SIDEBAR_SECTIONS.map(s => s.title));

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="fixed top-0 left-0 w-64 bg-white border-r border-slate-200 h-screen flex flex-col z-40 transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <LaPublicaLogo />
      </div>

      {/* Navegació */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {EMPRESA_SIDEBAR_SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.title);
          return (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors"
              >
                {section.title}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen ? "transform rotate-0" : "transform -rotate-90"
                )} />
              </button>

              {isOpen && (
                <div className="space-y-1 pt-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    // Override badge counts with props if available for specific items
                    let displayBadge = item.badge;
                    if (item.label === 'Missatges' && missatgesCount > 0) displayBadge = missatgesCount;
                    if (item.label === 'Notificacions' && notificacionsCount > 0) displayBadge = notificacionsCount;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                          active
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("h-5 w-5", active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={1.5} />
                          {item.label}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.isNew && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                              NEW
                            </span>
                          )}
                          {displayBadge && (
                            <span className={cn(
                              "flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full",
                              active ? "bg-white text-slate-900 shadow-sm" : "bg-slate-100 text-slate-600"
                            )}>
                              {displayBadge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="p-4 border-t border-slate-200 shrink-0 bg-slate-50">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Tancar sessió
        </button>
      </div>
    </aside>
  );
}