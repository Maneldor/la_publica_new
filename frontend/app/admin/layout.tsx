'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CalendarProvider } from '@/lib/context/CalendarContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.primaryRole !== 'ADMIN') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { title: 'Dashboard', icon: '📊', path: '/admin', exact: true },
    { title: 'Blog', icon: '📝', path: '/admin/blog/listar' },
    { title: 'Posts', icon: '📄', path: '/admin/posts/listar' },
    { title: 'Grupos', icon: '👥', path: '/admin/grupos/listar' },
    { title: 'Foros', icon: '🏛️', path: '/admin/foros/listar' },
    { title: 'Anuncios', icon: '📢', path: '/admin/anuncios/listar' },
    { title: 'Empresas', icon: '🏢', path: '/admin/empresas/listar' },
    { title: 'Ofertas VIP', icon: '🎁', path: '/admin/ofertas/listar' },
    { title: 'Assessoraments', icon: '💡', path: '/admin/assessoraments/listar' },
    { title: 'Formació', icon: '🎓', path: '/admin/formacio/listar' },
    { title: 'Calendario', icon: '📅', path: '/admin/calendario/listar' },
    { title: 'Usuarios', icon: '👤', path: '/admin/usuarios/listar' },
    { title: 'Plataforma', icon: '⚙️', path: '/admin/plataforma/configuracion' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
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
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`${menuOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-all duration-300`}>
          {menuOpen && (
            <nav className="p-4">
              {menuItems.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.path} 
                  className={`flex items-center gap-2 px-4 py-2 rounded mb-1 transition-colors ${
                    pathname === item.path || (item.exact && pathname === item.path) || (!item.exact && pathname.startsWith(item.path.split('/listar')[0]))
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          )}
        </aside>

        <main className={`flex-1 transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
    </CalendarProvider>
  );
}