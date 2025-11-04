'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/permissions';
import {
  Building2,
  BarChart3,
  Target,
  CheckSquare,
  TrendingUp,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Kanban,
  MessageSquare,
  Calendar
} from 'lucide-react';
import NotificationCenter from '@/components/crm/NotificationCenter';
import { useRealNotifications } from '@/hooks/crm/useRealNotifications';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

export default function GestorEmpresasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Hook de notificaciones
  const {
    notifications,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    loading: notificationsLoading,
    reload: refreshNotifications
  } = useRealNotifications();

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Verificar que tenga el rol correcto
    const userRole = session.user.role;
    if (userRole !== UserRole.COMPANY_MANAGER && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  // TODO: Cargar datos reales de pending tasks y new leads
  useEffect(() => {
    // Aquí cargaremos los contadores reales desde el backend
    setPendingTasks(5); // Mock
    setNewLeads(3); // Mock
  }, []);

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/gestor-empreses/dashboard', icon: BarChart3 },
    { name: 'Leads', href: '/gestor-empreses/leads', icon: Target, badge: newLeads },
    { name: 'Pipeline', href: '/gestor-empreses/pipeline', icon: Kanban },
    { name: 'Empresas', href: '/gestor-empreses/empreses', icon: Building2 },
    { name: 'Missatges', href: '/gestor-empreses/missatges', icon: MessageSquare },
    { name: 'Agenda', href: '/gestor-empreses/agenda', icon: Calendar },
    { name: 'Tasques', href: '/gestor-empreses/tasques', icon: CheckSquare, badge: pendingTasks },
    { name: 'Estadístiques', href: '/gestor-empreses/estadistiques', icon: TrendingUp },
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregant...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LP</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">La Pública</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-6">
          <div className="mb-8">
            <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">
              Gestor Comercial
            </p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/gestor-empreses/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-150 ease-in-out`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                    />
                    <span className="truncate">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
                Gestor d'Empreses
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -left-1 inline-flex items-center justify-center w-3 h-3 text-xs font-bold leading-none text-white bg-orange-500 rounded-full animate-pulse">
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700">
                      {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-gray-500">Gestor Comercial</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                  title="Tancar sessió"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRefresh={refreshNotifications}
        onNotificationClick={(notification) => {
          // Navegar al lead si tiene leadId
          if (notification.leadId) {
            router.push(`/gestor-empreses/leads/${notification.leadId}`);
            setShowNotifications(false);
          }
        }}
      />
    </div>
  );
}