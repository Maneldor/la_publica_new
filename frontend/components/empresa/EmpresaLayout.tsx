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
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar fijo - ocupa toda la altura */}
      <EmpresaSidebar
        plan={plan}
        missatgesCount={missatgesCount}
        notificacionsCount={notificacionsCount}
      />

      {/* Header fijo - desplazado a la derecha del sidebar */}
      <EmpresaHeader
        empresaNom={empresaNom}
        empresaLogo={empresaLogo}
        plan={plan}
        notificacionsCount={notificacionsCount}
        missatgesCount={missatgesCount}
      />

      {/* Contenido principal - ajustado margen y padding */}
      <main className="ml-64 pt-16 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}