'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customLabels?: Record<string, string>;
  variant?: 'default' | 'contained';
}

/**
 * Componente de Breadcrumbs que genera automáticamente la ruta
 * basándose en el pathname actual, o permite items personalizados
 */
export default function Breadcrumbs({ items, customLabels, variant = 'default' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Labels personalizados para rutas comunes en catalán
  const defaultLabels: Record<string, string> = {
    // General
    'dashboard': 'Tauler',
    'ofertes': 'Ofertes',
    'favorits': 'Favorits',
    'cupons': 'Cupons',
    'notificacions': 'Notificacions',
    'configuracio': 'Configuració',
    'preferencies': 'Preferències',
    'missatges': 'Missatges',
    'perfil': 'Perfil',

    // Admin
    'admin': 'Administració',
    'logs': 'Logs d\'Auditoria',
    'empreses': 'Empreses',
    'usuarios': 'Usuaris',
    'usuaris': 'Usuaris',
    'estadistiques': 'Estadístiques',
    'plans': 'Plans',
    'facturacio': 'Facturació',
    'listar': 'Llistar',

    // Empresa
    'empresa': 'Empresa',
    'crear': 'Crear',
    'editar': 'Editar',
    'validar': 'Validar',
    'analytics': 'Analytics',

    // Específicos
    'nou': 'Nou',
    'detall': 'Detall',
    'gestio': 'Gestió',
    'auditoria': 'Auditoria',
    'registre': 'Registre',
    ...customLabels, // Sobrescribir con labels personalizados
  };

  // Generar breadcrumbs automáticamente si no se proporcionan items
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const paths = pathname.split('/').filter(Boolean);
    let currentPath = '';

    return paths.map((segment, index) => {
      currentPath += `/${segment}`;

      // Formatear el label
      const label = defaultLabels[segment] ||
                   segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      return {
        label,
        href: currentPath,
      };
    });
  })();

  // No mostrar breadcrumbs en la home
  if (pathname === '/' || breadcrumbItems.length === 0) {
    return null;
  }

  const containerClass = variant === 'contained'
    ? 'bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 mb-6'
    : 'mb-6';

  return (
    <nav className={`flex items-center space-x-2 text-sm ${containerClass}`} aria-label="Breadcrumb">
      {/* Home icon */}
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Inici"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={item.href} className="flex items-center space-x-2">
            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {/* Link o texto */}
            {isLast ? (
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors hover:underline"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}