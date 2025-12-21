'use client'

import { useState } from 'react'
import { Plus, X, Calendar, Target, MessageCircle, Users, Gift, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      label: 'Nou esdeveniment',
      href: '/dashboard/agenda/esdeveniment/nou',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Afegir a l\'agenda'
    },
    {
      label: 'Nou objectiu',
      href: '/dashboard/agenda/objectiu/nou',
      icon: Target,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      description: 'Definir meta'
    },
    {
      label: 'Nou missatge',
      href: '/dashboard/missatges/nou',
      icon: MessageCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Contactar algú'
    },
    {
      label: 'Nova connexió',
      href: '/dashboard/connexions/cercar',
      icon: Users,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Trobar persones'
    },
    {
      label: 'Explorar ofertes',
      href: '/dashboard/ofertes',
      icon: Gift,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Descobrir descomptes'
    },
    {
      label: 'Nova reflexió',
      href: '/dashboard/agenda/reflexio/nova',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Escriure pensaments'
    }
  ]

  return (
    <>
      {/* Botó principal flotant */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center ${
            isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay de fons */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú d'accions */}
      <div 
        className={`fixed bottom-24 right-6 z-50 transform transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-0 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 min-w-[280px]">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="font-semibold text-gray-900 text-sm">Accions ràpides</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-100 mt-3 pt-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Veure totes les opcions
            </Link>
          </div>
        </div>
      </div>

      {/* Versió desktop - sempre visible al sidebar */}
      <div className="hidden lg:block bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <h2 className="font-semibold text-gray-900">Accions ràpides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {actions.slice(0, 4).map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-center"
            >
              <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 line-clamp-2">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
        
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 mt-3 p-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Més opcions
        </Link>
      </div>
    </>
  )
}