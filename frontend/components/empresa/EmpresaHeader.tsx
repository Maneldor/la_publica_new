'use client';

import { useState } from 'react';
import { Bell, MessageSquare, ChevronDown } from 'lucide-react';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const getPlanBadge = () => {
    const styles = {
      BÀSIC: 'bg-gray-100 text-gray-700',
      ESTÀNDARD: 'bg-blue-100 text-blue-700',
      PREMIUM: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
      EMPRESARIAL: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900'
    };

    const icons = {
      BÀSIC: '',
      ESTÀNDARD: '',
      PREMIUM: '⭐',
      EMPRESARIAL: '👑'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${styles[plan]}`}>
        {icons[plan] && <span>{icons[plan]}</span>}
        <span>{plan}</span>
      </span>
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-black z-50 h-20">
      <div className="flex items-center h-full">
        {/* Izquierda - Logo La Pública alineado con sidebar */}
        <div className="flex items-center justify-center w-64">
          <img
            src="/images/cropped-logo_la-Pública-ok-2.png"
            alt="La Pública"
            className="w-[150px] h-auto object-contain"
          />
        </div>

        {/* Centro - Empresa */}
        <div className="flex items-center justify-center gap-3 flex-1 px-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt={`Logo de ${empresaNom}`}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <span className="text-2xl">🏢</span>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{empresaNom}</h2>
            <p className="text-sm text-gray-500">Perfil empresa</p>
          </div>
        </div>

        {/* Derecha - Plan Badge, Notificaciones, Mensajes y Avatar */}
        <div className="flex items-center justify-center gap-4 px-6">
          {getPlanBadge()}
          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificacionsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificacionsCount > 9 ? '9+' : notificacionsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notificacions</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nou empleat públic interessat</p>
                        <p className="text-xs text-gray-500 mt-1">Maria García ha vist el vostre perfil</p>
                        <p className="text-xs text-gray-400 mt-1">Fa 5 minuts</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Agent IA ha generat un informe</p>
                        <p className="text-xs text-gray-500 mt-1">Anàlisi de tendències del sector</p>
                        <p className="text-xs text-gray-400 mt-1">Fa 2 hores</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Recordatori de reunió</p>
                        <p className="text-xs text-gray-500 mt-1">Demà a les 10:00 amb l'equip de desenvolupament</p>
                        <p className="text-xs text-gray-400 mt-1">Fa 4 hores</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Veure totes les notificacions
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mensajes */}
          <div className="relative">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              {missatgesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {missatgesCount > 9 ? '9+' : missatgesCount}
                </span>
              )}
            </button>

            {showMessages && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Missatges</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">JG</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Joan García</p>
                          <p className="text-xs text-gray-400">10:30</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Estic interessat en la vostra oferta de...</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AM</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Anna Martí</p>
                          <p className="text-xs text-gray-400">Ahir</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Moltes gràcies per la informació proporcionada</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PL</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Pere López</p>
                          <p className="text-xs text-gray-400">Ahir</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Podríem concertar una reunió per parlar del...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Veure tots els missatges
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar usuario */}
          <div className="relative">
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}