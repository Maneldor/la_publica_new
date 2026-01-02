'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRole } from '@/lib/permissions';
import EmpresaLayout from '@/components/empresa/EmpresaLayout';
import { NotificationProvider } from '@/app/contexts/NotificationContext';
import { MessagesProvider } from '@/app/contexts/MessagesContext';
import { Toaster } from 'react-hot-toast';

interface EmpresaData {
  empresaNom: string;
  empresaLogo?: string;
  plan: string;
  notificacionsCount: number;
  missatgesCount: number;
}

export default function EmpresaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    empresaNom: 'Empresa',
    empresaLogo: undefined,
    plan: 'Pioneres',
    notificacionsCount: 0,
    missatgesCount: 0,
  });
  const [loading, setLoading] = useState(true);

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

  // Cargar datos de la empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/empresa/perfil');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const company = data.data;
            setEmpresaData({
              empresaNom: company.name || 'Empresa',
              empresaLogo: company.logo || company.logoUrl || undefined,
              plan: company.currentPlan?.name || company.currentPlan?.planType || 'Pioneres',
              notificacionsCount: 0, // Se actualiza desde NotificationContext
              missatgesCount: 0,
            });
          }
        }
      } catch (error) {
        console.error('Error carregant dades empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEmpresaData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
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
    <NotificationProvider>
      <MessagesProvider>
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
      </MessagesProvider>
    </NotificationProvider>
  );
}