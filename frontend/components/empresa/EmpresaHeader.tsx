'use client';

import { useState } from 'react';
import { Search, Bell, ChevronDown, User, MessageSquare } from 'lucide-react';
import NotificationCenter from '@/app/components/NotificationCenter';

interface EmpresaHeaderProps {
  empresaNom: string;
  empresaLogo?: string;
  plan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
  notificacionsCount: number;
  missatgesCount: number;
}

export default function EmpresaHeader({
  empresaNom,
  empresaLogo,
  plan,
  notificacionsCount,
  missatgesCount
}: EmpresaHeaderProps) {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Helper per a l'estil del badge del pla
  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case 'PREMIUM': return 'bg-purple-100 text-purple-700';
      case 'EMPRESARIAL': return 'bg-amber-100 text-amber-700';
      case 'ESTÀNDARD': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30 transition-all duration-300">
        {/* Esquerra: Títol de la pàgina */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard d'Empresa</h1>
        </div>

        {/* Dreta: Accions */}
        <div className="flex items-center gap-4">
          {/* Cerca */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Missatges */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors">
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
            {missatgesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>

          {/* Notificacions */}
          <button
            onClick={() => setNotificationCenterOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {notificacionsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center border-2 border-white">
                {notificacionsCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          {/* Badge pla (petit) */}
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getPlanBadgeStyle(plan)}`}>
            {plan}
          </span>

          {/* Avatar usuari */}
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 leading-tight">{empresaNom}</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>

            <button className="relative group">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-slate-200 transition-colors overflow-hidden">
                {empresaLogo ? (
                  <img src={empresaLogo} alt={empresaNom} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-sm">{empresaNom.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Logic */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </>
  );
}