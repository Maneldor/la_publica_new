'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { CalendarProvider } from '@/lib/context/CalendarContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const menuSections = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', icon: '📊', path: '/admin', exact: true },
      { title: 'Dashboard Gestió', icon: '🎛️', path: '/gestio', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ]
  },
  {
    title: 'Gestió Comercial',
    items: [
      { title: 'Empreses Pendents', icon: '⏳', path: '/admin/empreses-pendents' },
    ]
  },
  {
    title: 'Contingut',
    items: [
      { title: 'Blog', icon: '📝', path: '/admin/blog/listar' },
      { title: 'Posts', icon: '📄', path: '/admin/posts/listar' },
      { title: 'Grups', icon: '👥', path: '/admin/grupos/listar' },
      { title: 'Fòrums', icon: '🏛️', path: '/admin/foros/listar' },
      { title: 'Anuncis', icon: '📢', path: '/admin/anuncios/listar' },
      { title: 'Ofertes VIP', icon: '🎁', path: '/admin/ofertas/listar' },
      { title: 'Ofertes Pendents', icon: '⏳', path: '/admin/ofertas/pendents' },
    ]
  },
  {
    title: 'Serveis',
    items: [
      { title: 'Assessoraments', icon: '💡', path: '/admin/assessoraments/listar' },
      { title: 'Formació', icon: '🎓', path: '/admin/formacio/listar' },
    ]
  },
  {
    title: 'Comunicació',
    items: [
      { title: 'Missatges', icon: '💬', path: '/admin/missatges' },
      { title: 'Calendari', icon: '📅', path: '/admin/calendario/listar' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { title: 'Usuaris', icon: '👤', path: '/admin/usuarios/listar' },
      { title: 'Lead Generation', icon: '🤖', path: '/admin/lead-generation' },
      { title: 'Logs', icon: '📋', path: '/admin/logs' },
      { title: 'Plataforma', icon: '⚙️', path: '/admin/plataforma/configuracion' },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'General': true,
    'Gestió Comercial': true, // Abierta por defecto
    'Contingut': false,
    'Serveis': false,
    'Comunicació': false,
    'Sistema': true,
  });

  useEffect(() => {
    if (status === 'loading') return; // Esperando a que cargue la sesión

    if (!session) {
      router.push('/login');
      return;
    }

    // Verificar que tenga el rol correcto
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' &&
        userRole !== 'SUPER_ADMIN') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    console.log('🔴 CLICK EN CERRAR SESIÓN - INICIO');

    try {
      // Limpiar tokens de localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('lapublica_token');
      console.log('🔓 Token eliminado de localStorage');

      // Intentar cerrar sesión con NextAuth
      console.log('🔴 Llamando a signOut...');

      // Usar signOut y forzar redirección
      await signOut({
        callbackUrl: '/login',
        redirect: false  // No usar redirección automática
      });

      // Redirigir manualmente
      console.log('🔴 Redirigiendo a /login...');
      window.location.href = '/login';

    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Forzar redirección en caso de error
      window.location.href = '/login';
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Se redirigirá al login
  }

  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <CalendarProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 hover:text-gray-900">
              {menuOpen ? '✕' : '☰'}
            </button>
            <h1 className="text-xl font-bold text-gray-900">La Pública</h1>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <NotificationBell />
            <button
              onClick={() => {
                console.log('🎯 BOTÓN CLICKEADO');
                handleLogout();
              }}
              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`${menuOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300 z-20`}>
          {menuOpen && (
            <nav className="p-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span>{section.title}</span>
                    <span className="text-base transition-transform duration-200" style={{
                      transform: openSections[section.title] ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}>
                      ▶
                    </span>
                  </button>
                  
                  {openSections[section.title] && (
                    <nav className="mt-2 space-y-1">
                      {section.items.map((item, itemIndex) => {
                        // Verificar si l'usuari té accés a aquest element
                        const itemWithRoles = item as { roles?: string[] };
                        if (itemWithRoles.roles && !itemWithRoles.roles.includes(userRole)) {
                          return null; // No mostrar si no té el rol
                        }

                        const isActive = (item as { exact?: boolean }).exact
                          ? pathname === item.path
                          : pathname.startsWith(item.path);

                        return (
                          <Link
                            key={itemIndex}
                            href={item.path}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.title}
                          </Link>
                        );
                      })}
                    </nav>
                  )}
                </div>
              ))}
            </nav>
          )}
        </aside>

        <main className={`flex-1 transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
      </CalendarProvider>
  );
}