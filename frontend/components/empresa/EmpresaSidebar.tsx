'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface EmpresaSidebarProps {
  plan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
  missatgesCount?: number;
  notificacionsCount?: number;
}

interface PlanBadgeProps {
  plan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
}

function PlanBadge({ plan }: PlanBadgeProps) {
  const styles = {
    BÀSIC: 'bg-gray-100 text-gray-700',
    ESTÀNDARD: 'bg-blue-100 text-blue-700',
    PREMIUM: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
    EMPRESARIAL: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900'
  };

  const icons = {
    BÀSIC: '',
    ESTÀNDARD: '',
    PREMIUM: '⭐',
    EMPRESARIAL: '👑'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[plan]}`}>
      {icons[plan] && <span>{icons[plan]}</span>}
      <span>Pla {plan}</span>
    </div>
  );
}

export default function EmpresaSidebar({
  plan,
  missatgesCount = 0,
  notificacionsCount = 0
}: EmpresaSidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['empresa']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isParentActive = (basePath: string) => pathname.startsWith(basePath);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/empresa/dashboard'
    },
    {
      id: 'empresa',
      label: 'Empresa',
      icon: '🏢',
      hasSubmenu: true,
      children: [
        { label: 'Perfil', path: '/empresa/perfil' },
        { label: 'Pla', path: '/empresa/pla' },
        ...(plan !== 'BÀSIC' ? [{ label: 'Equip', path: '/empresa/equip' }] : [])
      ]
    },
    {
      id: 'facturacio',
      label: 'Facturació',
      icon: '📄',
      path: '/empresa/facturacio'
    },
    ...(plan !== 'BÀSIC' ? [{
      id: 'agents',
      label: 'Agents IA',
      icon: '🤖',
      path: '/empresa/agents',
      badge: 'NEW',
      badgeStyle: 'bg-green-500 text-white'
    }] : []),
    {
      id: 'estadistiques',
      label: 'Estadístiques',
      icon: '📈',
      path: '/empresa/estadistiques'
    },
    {
      id: 'missatges',
      label: 'Missatges',
      icon: '💬',
      path: '/empresa/missatges',
      badge: missatgesCount > 0 ? missatgesCount.toString() : undefined,
      badgeStyle: 'bg-red-500 text-white'
    },
    {
      id: 'notificacions',
      label: 'Notificacions',
      icon: '🔔',
      path: '/empresa/notificacions',
      badge: notificacionsCount > 0 ? notificacionsCount.toString() : undefined,
      badgeStyle: 'bg-red-500 text-white'
    },
    {
      id: 'recursos',
      label: 'Recursos',
      icon: '📚',
      path: '/empresa/recursos'
    }
  ];

  return (
    <div className="fixed top-20 left-0 w-64 text-slate-400 h-[calc(100vh-80px)] flex flex-col bg-slate-900 z-30">

      {/* Navegación con fondo oscuro y scroll independiente */}
      <nav className="flex-1 p-4 space-y-2 bg-slate-900 overflow-y-scroll scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500"
           style={{
             scrollbarWidth: 'thin',
             scrollbarColor: '#475569 #1e293b'
           }}>
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.hasSubmenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isParentActive(`/empresa/${item.id}`)
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {expandedMenus.includes(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Submenu */}
                {expandedMenus.includes(item.id) && item.children && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.path)
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>


      {/* Footer con fondo oscuro */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Sortir</span>
        </button>
      </div>
    </div>
  );
}