'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/lib/permissions';
import EmpresaLayout from '@/components/empresa/EmpresaLayout';
import { NotificationProvider } from '@/app/contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';

export default function EmpresaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Verificar que tenga el rol correcto
    const userRole = session.user.role;
    if (userRole !== UserRole.COMPANY && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

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

  // Obtener datos de la empresa del usuario
  // TODO: Cargar estos datos desde el backend según el usuario autenticado
  const empresaData = {
    empresaNom: session.user.name || 'Empresa',
    empresaLogo: undefined, // TODO: Cargar desde el perfil de la empresa
    plan: 'PREMIUM' as const, // TODO: Cargar desde el backend
    notificacionsCount: 3, // TODO: Cargar desde el backend
    missatgesCount: 2, // TODO: Cargar desde el backend
  };

  return (
    <NotificationProvider>
      <EmpresaLayout
        empresaNom={empresaData.empresaNom}
        empresaLogo={empresaData.empresaLogo}
        plan={empresaData.plan}
        notificacionsCount={empresaData.notificacionsCount}
        missatgesCount={empresaData.missatgesCount}
      >
        {children}
      </EmpresaLayout>
      <Toaster position="top-right" />
    </NotificationProvider>
  );
}