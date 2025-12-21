'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Crown,
  Shield,
  Settings,
  Briefcase,
  FileText,
  Building2,
  ClipboardList,
  Target,
  Rocket,
  Store,
  UserCog,
  Landmark,
  User,
  ShieldCheck,
  Users,
  ArrowLeft,
  UserPlus
} from 'lucide-react'

// Definición de categorías y tipos de usuario
const userCategories = [
  {
    id: 'admins',
    title: 'Administradors',
    icon: Shield,
    color: 'red',
    users: [
      { id: 'SUPER_ADMIN', name: 'Super Admin', description: 'Accés total al sistema', icon: Crown },
      { id: 'ADMIN', name: 'Admin', description: 'Administrador /admin/', icon: Shield },
      { id: 'ADMIN_GESTIO', name: 'Admin Gestió', description: 'Dashboard /gestio/ CRM', icon: Settings },
    ]
  },
  {
    id: 'crm',
    title: 'Gestió CRM',
    icon: Briefcase,
    color: 'blue',
    users: [
      { id: 'CRM_COMERCIAL', name: 'CRM Comercial', description: 'Leads i pipeline', icon: Briefcase },
      { id: 'CRM_CONTINGUT', name: 'CRM Contingut', description: 'Comunicació', icon: FileText },
      { id: 'CRM_ADMINISTRACIONS', name: 'CRM Admins', description: 'Relacions públiques', icon: Building2 },
    ]
  },
  {
    id: 'gestors',
    title: 'Gestors Comercials',
    icon: ClipboardList,
    color: 'emerald',
    users: [
      { id: 'GESTOR_ESTANDARD', name: 'Estàndard', description: 'Empreses bàsiques', icon: ClipboardList },
      { id: 'GESTOR_ESTRATEGIC', name: 'Estratègic', description: 'Empreses estratègiques', icon: Target },
      { id: 'GESTOR_ENTERPRISE', name: 'Enterprise', description: 'Comptes enterprise', icon: Rocket },
    ]
  },
  {
    id: 'collaboradors',
    title: 'Col·laboradors',
    icon: Store,
    color: 'amber',
    users: [
      { id: 'COMPANY', name: 'Empresa', description: 'Usuari d\'empresa', icon: Store },
      { id: 'GESTOR_EMPRESA', name: 'Gestor Empresa', description: 'Gestor intern empresa', icon: UserCog },
    ]
  },
  {
    id: 'public',
    title: 'Sector Públic',
    icon: Landmark,
    color: 'purple',
    users: [
      { id: 'ADMINISTRATION', name: 'Admin. Pública', description: 'Usuari administració', icon: Landmark },
    ]
  },
  {
    id: 'comunitat',
    title: 'Usuaris Comunitat',
    icon: Users,
    color: 'indigo',
    users: [
      { id: 'USER', name: 'Empleat Públic', description: 'Usuari bàsic', icon: User },
      { id: 'MODERATOR', name: 'Moderador', description: 'Modera contingut', icon: ShieldCheck },
      { id: 'ADMIN_GRUP', name: 'Admin Grup', description: 'Gestiona grups', icon: Crown },
    ]
  },
]

// Colores por categoría con bordes diferenciados
const categoryColors: Record<string, {
  bg: string
  border: string
  borderHover: string
  text: string
  iconBg: string
  titleBorder: string
}> = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    borderHover: 'hover:border-red-400',
    text: 'text-red-700',
    iconBg: 'bg-red-100',
    titleBorder: 'border-l-red-500'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    borderHover: 'hover:border-blue-400',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
    titleBorder: 'border-l-blue-500'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    borderHover: 'hover:border-emerald-400',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    titleBorder: 'border-l-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    borderHover: 'hover:border-amber-400',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100',
    titleBorder: 'border-l-amber-500'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    borderHover: 'hover:border-purple-400',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100',
    titleBorder: 'border-l-purple-500'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    borderHover: 'hover:border-indigo-400',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    titleBorder: 'border-l-indigo-500'
  },
}

export default function CrearUsuariPage() {
  const router = useRouter()

  const handleSelectUserType = (userType: string) => {
    // Navegar a la página del wizard con el tipo de usuario
    router.push(`/admin/usuaris/crear/${userType.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/usuaris"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Crear nou usuari</h1>
              <p className="text-slate-500">Selecciona el tipus d&apos;usuari que vols crear</p>
            </div>
          </div>
        </div>

        {/* Grid de categorías - 3 columnas en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCategories.map((category) => {
            const colors = categoryColors[category.color]
            const CategoryIcon = category.icon

            return (
              <div
                key={category.id}
                className={`bg-white rounded-xl border-l-4 ${colors.titleBorder} shadow-sm overflow-hidden`}
              >
                {/* Título de categoría */}
                <div className={`px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
                      <CategoryIcon className={`w-4 h-4 ${colors.text}`} strokeWidth={1.5} />
                    </div>
                    <h2 className={`font-semibold ${colors.text}`}>{category.title}</h2>
                  </div>
                </div>

                {/* Tarjetas de usuarios */}
                <div className="p-3 space-y-2">
                  {category.users.map((user) => {
                    const UserIcon = user.icon
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUserType(user.id)}
                        className={`w-full p-3 rounded-lg border-2 ${colors.border} ${colors.borderHover}
                          hover:shadow-md hover:scale-[1.01] transition-all text-left group bg-white`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.iconBg} group-hover:scale-110 transition-transform`}>
                            <UserIcon className={`w-4 h-4 ${colors.text}`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.description}</p>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Selecciona un tipus d&apos;usuari per continuar amb el formulari de creació</p>
        </div>
      </div>
    </div>
  )
}
