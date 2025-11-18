'use client';

import { ReactNode } from 'react';
import EmpresaHeader from './EmpresaHeader';
import EmpresaSidebar from './EmpresaSidebar';
import Breadcrumbs from '@/components/Breadcrumbs';

interface EmpresaLayoutProps {
  children: ReactNode;
  empresaNom: string;
  empresaLogo?: string;
  plan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
  notificacionsCount: number;
  missatgesCount: number;
}

export default function EmpresaLayout({
  children,
  empresaNom,
  empresaLogo,
  plan,
  notificacionsCount,
  missatgesCount
}: EmpresaLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo en la parte superior */}
      <EmpresaHeader
        empresaNom={empresaNom}
        empresaLogo={empresaLogo}
        plan={plan}
        notificacionsCount={notificacionsCount}
        missatgesCount={missatgesCount}
      />

      {/* Sidebar fijo */}
      <EmpresaSidebar
        plan={plan}
        missatgesCount={missatgesCount}
        notificacionsCount={notificacionsCount}
      />

      {/* Contenido principal con margen para header y sidebar */}
      <main className="ml-64 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}