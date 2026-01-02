'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, MessageSquare } from 'lucide-react';
import NotificationCenter from '@/app/components/NotificationCenter';
import MessagesCenter from '@/app/components/MessagesCenter';
import SearchModal from '@/components/ui/SearchModal';
import { useNotifications } from '@/app/contexts/NotificationContext';
import { useMessages } from '@/app/contexts/MessagesContext';

interface EmpresaHeaderProps {
  empresaNom: string;
  empresaLogo?: string;
  plan: string;
  notificacionsCount?: number;
  missatgesCount?: number;
}

export default function EmpresaHeader({
  empresaNom,
  empresaLogo,
  plan
}: EmpresaHeaderProps) {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [messagesCenterOpen, setMessagesCenterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { unreadCount, hasWarnings, hasErrors } = useNotifications();
  const { totalUnread: messagesUnread } = useMessages();

  // Drecera de teclat Cmd+K o Ctrl+K per obrir cerca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper per a l'estil del badge del pla
  const getPlanBadgeStyle = (plan: string) => {
    const planLower = plan.toLowerCase();
    // Estratègic / Strategic
    if (planLower.includes('estrateg') || planLower === 'strategic') {
      return 'bg-purple-100 text-purple-700';
    }
    // Enterprise / Empresarial
    if (planLower.includes('enterprise') || planLower.includes('empresarial')) {
      return 'bg-amber-100 text-amber-700';
    }
    // Estàndard / Standard
    if (planLower.includes('estandar') || planLower.includes('standard')) {
      return 'bg-blue-100 text-blue-700';
    }
    // Pioneres (default/free)
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between pl-8 pr-6 fixed top-0 right-0 left-64 z-30 transition-all duration-300">
        {/* Esquerra: Nom de l'empresa + Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-light text-slate-700 ml-[60px] mr-[60px]">{empresaNom}</h1>
          {/* Logo empresa col·laboradora */}
          <div className="h-14 w-[160px] flex items-center justify-center">
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt={empresaNom}
                className="max-h-14 max-w-[160px] object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400">Logo empresa</span>
            )}
          </div>
        </div>

        {/* Dreta: Accions */}
        <div className="flex items-center gap-4">
          {/* Cerca */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            title="Cercar (Ctrl+K)"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
            <span className="hidden md:inline text-xs text-slate-400">Ctrl+K</span>
          </button>

          {/* Missatges */}
          <button
            onClick={() => setMessagesCenterOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
            {messagesUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center border-2 border-white">
                {messagesUnread > 9 ? '9+' : messagesUnread}
              </span>
            )}
          </button>

          {/* Notificacions */}
          <button
            onClick={() => setNotificationCenterOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className={`h-5 w-5 ${hasErrors ? 'text-red-500' : hasWarnings ? 'text-amber-500' : ''}`} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-medium rounded-full flex items-center justify-center border-2 border-white ${hasErrors ? 'bg-red-500' : hasWarnings ? 'bg-amber-500' : 'bg-blue-500'}`}>
                {unreadCount > 9 ? '9+' : unreadCount}
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

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      {/* Messages Center */}
      <MessagesCenter
        isOpen={messagesCenterOpen}
        onClose={() => setMessagesCenterOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        baseUrl="/empresa"
      />
    </>
  );
}