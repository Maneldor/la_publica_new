// components/gestio-empreses/empreses/CompanyUsers.tsx
import { User, Mail, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyUser {
  id: string
  name: string | null
  email: string
  userType: string
  isActive: boolean
  createdAt: Date
}

export function CompanyUsers({ users }: { users: CompanyUser[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-medium text-slate-900">Usuaris ({users.length})</h2>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center">
          <User className="h-8 w-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-slate-500">Encara no hi ha usuaris</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{user.name || 'Sense nom'}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  user.userType === 'COMPANY_ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-700'
                )}>
                  {user.userType === 'COMPANY_ADMIN' ? 'Admin' : 'Usuari'}
                </span>
                {user.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}