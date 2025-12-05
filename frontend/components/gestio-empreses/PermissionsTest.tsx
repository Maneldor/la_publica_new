// components/gestio-empreses/PermissionsTest.tsx

'use client'

import { useGestioPermissions } from '@/hooks/useGestioPermissions'

export function PermissionsTest() {
  const {
    role,
    roleLabel,
    roleBadgeColor,
    roleIcon,
    dataAccess,
    isAdmin,
    isGestor,
    isCrmComercial,
    canViewAllLeads,
    canVerifyLeads,
    canAssignLeads,
    canViewTeam,
    hasViewSelector,
    gestorSegment,
  } = useGestioPermissions()

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Test de Permisos</h3>

      <div className="flex items-center gap-2">
        <span>{roleIcon}</span>
        <span className={`px-2 py-1 rounded text-sm ${roleBadgeColor}`}>
          {roleLabel}
        </span>
      </div>

      <div className="text-sm space-y-1">
        <p>Accés dades: <strong>{dataAccess}</strong></p>
        <p>És Admin: <strong>{isAdmin ? 'Sí' : 'No'}</strong></p>
        <p>És Gestor: <strong>{isGestor ? 'Sí' : 'No'}</strong></p>
        <p>És CRM Comercial: <strong>{isCrmComercial ? 'Sí' : 'No'}</strong></p>
      </div>

      <div className="text-sm space-y-1 border-t pt-2">
        <p>Pot veure tots leads: <strong>{canViewAllLeads ? '✅' : '❌'}</strong></p>
        <p>Pot verificar leads: <strong>{canVerifyLeads ? '✅' : '❌'}</strong></p>
        <p>Pot assignar leads: <strong>{canAssignLeads ? '✅' : '❌'}</strong></p>
        <p>Pot veure equip: <strong>{canViewTeam ? '✅' : '❌'}</strong></p>
        <p>Té selector de vista: <strong>{hasViewSelector ? '✅' : '❌'}</strong></p>
      </div>

      {gestorSegment && (
        <div className="text-sm border-t pt-2">
          <p>Segment: <strong>{gestorSegment.label}</strong></p>
          <p>Objectiu leads: <strong>{gestorSegment.targets.leads}/mes</strong></p>
          <p>Valor mitjà: <strong>{gestorSegment.avgValue}</strong></p>
        </div>
      )}
    </div>
  )
}