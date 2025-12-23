// lib/gestio-empreses/sidebar-config.ts

import { UserRole } from '@prisma/client'
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  CheckCircle,
  UserPlus,
  UsersRound,
  Gift,
  HelpCircle,
  Star,
  FileText,
  MessageSquare,
  MessagesSquare,
  Users2,
  Megaphone,
  GraduationCap,
  Link,
  Shield,
  Calendar,
  Mail,
  CheckSquare,
  BarChart3,
  Settings,
  Database,
  FileKey,
  ScrollText,
  Sparkles,
  Eye,
  CreditCard,
  Package,
  Euro,
  GitBranch,
  Brain,
  Network,
  AlertTriangle,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { ROLE_GROUPS } from './permissions'

// ============================================
// TIPUS
// ============================================

export interface SidebarItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
  badge?: string
  disabled?: boolean
}

export interface SidebarSection {
  id: string
  label: string
  icon?: LucideIcon
  roles: UserRole[]
  items: SidebarItem[]
  collapsible?: boolean
  defaultOpen?: boolean
}

// ============================================
// CONFIGURACIÓ DEL SIDEBAR
// ============================================

export const SIDEBAR_CONFIG: SidebarSection[] = [
  // ============================================
  // TAULELL (tots)
  // ============================================
  {
    id: 'dashboard',
    label: 'General',
    roles: [...ROLE_GROUPS.ALL_GESTIO],
    collapsible: false,
    items: [
      {
        id: 'panell',
        label: 'Taulell',
        href: '/gestio',
        icon: LayoutDashboard,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
    ],
  },

  // ============================================
  // ADMINISTRACIÓ (només Admin)
  // ============================================
  {
    id: 'admin',
    label: 'Administració',
    icon: Settings,
    roles: [...ROLE_GROUPS.ADMINS],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'pressupostos',
        label: 'Pressupostos',
        href: '/gestio/admin/pressupostos',
        icon: FileText,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'empreses-pendents',
        label: 'Empreses Pendents',
        href: '/gestio/admin/empreses-pendents',
        icon: Building2,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'plans',
        label: 'Plans',
        href: '/gestio/admin/plans',
        icon: CreditCard,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'extras',
        label: 'Serveis Extra',
        href: '/gestio/admin/extras',
        icon: Package,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'facturacio',
        label: 'Facturació',
        href: '/gestio/admin/facturacio',
        icon: Euro,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'supervision',
        label: 'Supervisio',
        href: '/gestio/admin/supervision',
        icon: Network,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'campanyes',
        label: 'Campanyes',
        href: '/gestio/admin/campanyes',
        icon: Megaphone,
        roles: [...ROLE_GROUPS.ADMINS],
      },
      {
        id: 'configuracio-ia',
        label: 'Configuració d\'IA',
        href: '/gestio/admin/configuracio-ia',
        icon: Brain,
        roles: [...ROLE_GROUPS.ADMINS],
      },
    ],
  },

  // ============================================
  // GESTIÓ LEADS (Admin + CRM Comercial + Gestors)
  // ============================================
  {
    id: 'leads',
    label: 'Gestió Leads',
    icon: Target,
    roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'leads-list',
        label: 'Leads',
        href: '/gestio/leads',
        icon: Users,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
      {
        id: 'leads-ia',
        label: 'IA Leads',
        href: '/gestio/leads/ia',
        icon: Sparkles,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        href: '/gestio/pipeline',
        icon: Target,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
      {
        id: 'verificacio',
        label: 'Verificació',
        href: '/gestio/crm/verificacio',
        icon: CheckCircle,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CAN_VERIFY],
      },
      {
        id: 'assignacions',
        label: 'Assignacions',
        href: '/gestio/crm/assignacions',
        icon: UserPlus,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CAN_ASSIGN],
      },
      {
        id: 'equip',
        label: 'Equip',
        href: '/gestio/crm/equip',
        icon: UsersRound,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CAN_MANAGE_TEAM],
      },
    ],
  },

  // ============================================
  // GESTIÓ EMPRESES
  // ============================================
  {
    id: 'gestio-empreses',
    label: 'Gestió Empreses',
    icon: Building2,
    roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'empreses-list',
        label: 'Empreses',
        href: '/gestio/empreses',
        icon: Building2,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
      {
        id: 'empreses-pipeline',
        label: 'Pipeline',
        href: '/gestio/empreses/pipeline',
        icon: GitBranch,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
    ],
  },

  // ============================================
  // GESTIÓ OFERTES
  // ============================================
  {
    id: 'gestio-ofertes',
    label: 'Gestió Ofertes',
    icon: Gift,
    roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'ofertes-list',
        label: 'Ofertes',
        href: '/gestio/ofertes',
        icon: Gift,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
      },
      {
        id: 'ofertes-pipeline',
        label: 'Pipeline',
        href: '/gestio/ofertes/pipeline',
        icon: GitBranch,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
        disabled: true, // Activar quan es creï la pàgina
      },
    ],
  },

  // ============================================
  // GESTIÓ ASSESSORAMENTS
  // ============================================
  {
    id: 'gestio-assessoraments',
    label: 'Gestió Assessoraments',
    icon: HelpCircle,
    roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'assessoraments-list',
        label: 'Assessoraments',
        href: '/gestio/assessoraments',
        icon: HelpCircle,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
        disabled: true, // Activar quan es creï la pàgina
      },
      {
        id: 'assessoraments-pipeline',
        label: 'Pipeline',
        href: '/gestio/assessoraments/pipeline',
        icon: GitBranch,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
        disabled: true, // Activar quan es creï la pàgina
      },
    ],
  },

  // ============================================
  // GESTIÓ EXTRES
  // ============================================
  {
    id: 'gestio-extres',
    label: 'Gestió Extres',
    icon: Star,
    roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'extres-list',
        label: 'Extres',
        href: '/gestio/extres',
        icon: Star,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
        disabled: true,
      },
      {
        id: 'extres-pipeline',
        label: 'Pipeline',
        href: '/gestio/extres/pipeline',
        icon: GitBranch,
        roles: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.CRM_TEAM],
        disabled: true,
      },
    ],
  },

  // ============================================
  // GESTIÓ CONTINGUT (ADMIN_GESTIO + CRM Contingut)
  // ============================================
  {
    id: 'gestio-contingut',
    label: 'Gestió Contingut',
    icon: FileText,
    roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
    collapsible: true,
    defaultOpen: false,
    items: [
      // --- Xarxa Social ---
      {
        id: 'feed',
        label: 'Feed / Posts',
        href: '/gestio/contingut/feed',
        icon: MessagesSquare,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'blogs',
        label: 'Blogs',
        href: '/gestio/contingut/blogs',
        icon: FileText,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'forums',
        label: 'Fòrums',
        href: '/gestio/contingut/forums',
        icon: MessageSquare,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'grups',
        label: 'Grups',
        href: '/gestio/contingut/grups',
        icon: Users2,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'formacio',
        label: 'Formació',
        href: '/gestio/contingut/formacio',
        icon: GraduationCap,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'enllacos',
        label: "Enllaços d'Interès",
        href: '/gestio/contingut/enllacos',
        icon: Link,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      // --- Serveis (Visibilitat) ---
      {
        id: 'vis-empreses',
        label: 'Visibilitat Empreses',
        href: '/gestio/contingut/empreses',
        icon: Building2,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'vis-ofertes',
        label: 'Visibilitat Ofertes',
        href: '/gestio/contingut/ofertes',
        icon: Gift,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      {
        id: 'vis-assessoraments',
        label: 'Visibilitat Assessoraments',
        href: '/gestio/contingut/assessoraments',
        icon: HelpCircle,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      // --- Alertes i Moderació ---
      {
        id: 'alertes-anuncis',
        label: 'Alertes Anuncis',
        href: '/gestio/contingut/alertes',
        icon: ShieldAlert,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
      },
      {
        id: 'moderacio-anuncis',
        label: 'Moderació Anuncis',
        href: '/gestio/contingut/anuncis',
        icon: Megaphone,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
      },
      {
        id: 'moderacio-general',
        label: 'Moderació General',
        href: '/gestio/contingut/moderacio',
        icon: Shield,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
        disabled: true,
      },
      // --- Anuncis Destacats ---
      {
        id: 'anuncis-destacats-list',
        label: 'Anuncis Destacats',
        href: '/gestio/anuncis-destacats',
        icon: Sparkles,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
      },
      {
        id: 'anuncis-destacats-crear',
        label: 'Crear Destacat',
        href: '/gestio/anuncis-destacats/crear',
        icon: Star,
        roles: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] as UserRole[],
      },
      {
        id: 'anuncis-destacats-preus',
        label: 'Preus Destacats',
        href: '/gestio/anuncis-destacats/preus',
        icon: Euro,
        roles: ['ADMIN_GESTIO'] as UserRole[],
      },
    ],
  },

  // ============================================
  // EINES (tots)
  // ============================================
  {
    id: 'eines',
    label: 'Eines',
    icon: CheckSquare,
    roles: [...ROLE_GROUPS.ALL_GESTIO],
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'recursos-comercials',
        label: 'Recursos Comercials',
        href: '/gestio/eines',
        icon: FileText,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
      {
        id: 'agenda',
        label: 'Agenda',
        href: '/gestio/agenda',
        icon: Calendar,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
      {
        id: 'missatges',
        label: 'Missatges',
        href: '/gestio/missatges',
        icon: Mail,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
      {
        id: 'tasques',
        label: 'Tasques',
        href: '/gestio/tasques',
        icon: CheckSquare,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
      {
        id: 'estadistiques',
        label: 'Estadístiques',
        href: '/gestio/estadistiques',
        icon: BarChart3,
        roles: [...ROLE_GROUPS.ALL_GESTIO],
      },
    ],
  },
]

// ============================================
// FUNCIONS D'UTILITAT
// ============================================

/**
 * Filtra el sidebar segons el rol de l'usuari
 */
export function getFilteredSidebar(role: UserRole | undefined | null): SidebarSection[] {
  if (!role) return []

  return SIDEBAR_CONFIG
    .filter(section => section.roles.includes(role))
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role))
    }))
    .filter(section => {
      // Mantenir la secció ADMINISTRACIÓ fins i tot si està buida
      if (section.id === 'admin') return true
      // Filtrar altres seccions buides
      return section.items.length > 0
    })
}

/**
 * Retorna el títol del sidebar segons el rol
 */
export function getSidebarTitle(role: UserRole | undefined | null): string {
  if (!role) return 'Dashboard'

  const titles: Partial<Record<UserRole, string>> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administració',
    CRM_COMERCIAL: 'CRM Comercial',
    CRM_CONTINGUT: 'CRM Contingut',
    GESTOR_ESTANDARD: 'Gestor Estàndard',
    GESTOR_ESTRATEGIC: 'Gestor Estratègic',
    GESTOR_ENTERPRISE: 'Gestor Enterprise',
  }

  return titles[role] || 'Dashboard'
}

/**
 * Adapta els labels per a gestors
 */
export function getGestorAdjustedLabels(role: UserRole | undefined | null): Record<string, string> {
  if (!role || !ROLE_GROUPS.GESTORS.includes(role)) return {}

  return {
    'leads': 'Gestió Leads',
    'leads-list': 'Leads',
    'pipeline': 'Pipeline',
    'empreses': 'Gestió Empreses',
    'empreses-list': 'Empreses',
    'ofertes': 'Ofertes',
    'assessoraments': 'Assessoraments',
    'estadistiques': 'Estadístiques',
  }
}