// components/gestio-empreses/crm/GestorsList.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Briefcase,
  Building2,
  ChevronRight,
  MoreVertical,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { redistributeFromGestor } from '@/lib/gestio-empreses/assignment-actions'

interface Gestor {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  activeLeads: number
  activeCompanies: number
}

interface GestorsListProps {
  gestors: Gestor[]
  selectedGestorId: string | null
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Empleat',
  ACCOUNT_MANAGER: 'Estratègic',
  ADMIN: 'Enterprise',
  COMPANY_OWNER: 'Propietari',
  COMPANY_MEMBER: 'Membre',
}

const roleColors: Record<string, string> = {
  EMPLOYEE: 'bg-slate-100 text-slate-700',
  ACCOUNT_MANAGER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  COMPANY_OWNER: 'bg-amber-100 text-amber-700',
  COMPANY_MEMBER: 'bg-green-100 text-green-700',
}

export function GestorsList({
  gestors,
  selectedGestorId
}: GestorsListProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSelectGestor = (gestorId: string) => {
    router.push(`/gestio/crm/assignacions?gestor=${gestorId}`)
  }

  const handleRedistribute = (gestorId: string) => {
    startTransition(async () => {
      try {
        await redistributeFromGestor(gestorId)
        router.refresh()
      } catch (error) {
        console.error('Error redistribuint leads:', error)
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Gestors Comercials</h3>
        <p className="text-sm text-slate-500 mt-1">
          Selecciona un gestor per veure els seus leads
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {gestors.map((gestor) => (
          <div
            key={gestor.id}
            className={cn(
              'p-4 cursor-pointer transition-colors relative',
              selectedGestorId === gestor.id
                ? 'bg-blue-50 border-l-2 border-l-blue-500'
                : 'hover:bg-slate-50'
            )}
            onClick={() => handleSelectGestor(gestor.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  {gestor.image ? (
                    <img
                      src={gestor.image}
                      alt={gestor.name || ''}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {gestor.name || gestor.email}
                  </p>
                  <span className={cn(
                    'inline-block px-2 py-0.5 text-xs font-medium rounded mt-1',
                    roleColors[gestor.role] || roleColors.EMPLOYEE
                  )}>
                    {roleLabels[gestor.role] || gestor.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{gestor.activeLeads}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{gestor.activeCompanies}</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(menuOpen === gestor.id ? null : gestor.id)
                    }}
                    className="p-1 rounded hover:bg-slate-200"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  </button>

                  {menuOpen === gestor.id && (
                    <div className="absolute right-0 top-8 z-10 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRedistribute(gestor.id)
                          setMenuOpen(null)
                        }}
                        disabled={isPending}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={cn(
                          "h-4 w-4",
                          isPending && "animate-spin"
                        )} strokeWidth={1.5} />
                        Redistribuir leads
                      </button>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}