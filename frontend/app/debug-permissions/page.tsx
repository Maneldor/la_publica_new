'use client'

import { useSession } from 'next-auth/react'
import { useGestioPermissions } from '@/hooks/useGestioPermissions'

export default function DebugPermissionsPage() {
  const { data: session, status } = useSession()
  const permissions = useGestioPermissions()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Permisos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sesión */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Información de Sesión</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                status,
                user: session?.user,
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Permisos */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Permisos Calculados</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                isLoading: permissions.isLoading,
                isAuthenticated: permissions.isAuthenticated,
                role: permissions.role,
                userId: permissions.userId,
                canAccessGestioPanel: permissions.canAccessGestioPanel,
                isGestor: permissions.isGestor,
                dataAccess: permissions.dataAccess,
                canViewOwnLeads: permissions.canViewOwnLeads,
                dashboardType: permissions.dashboardType,
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Todos los permisos */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Todos los Permisos</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}