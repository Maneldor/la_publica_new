// Sistema de roles empresariales y permisos
export enum EmpresaRole {
  // Rol principal (transferible)
  EMPRESA = 'EMPRESA',

  // Roles secundarios (disponibles según plan)
  ADMIN_EMPRESA = 'ADMIN_EMPRESA',
  EDITOR_EMPRESA = 'EDITOR_EMPRESA',
  MEMBRE_EMPRESA = 'MEMBRE_EMPRESA',
  VISUALITZADOR = 'VISUALITZADOR',
}

export interface EmpresaPermissions {
  canManageTeam: boolean;           // Añadir/eliminar/editar miembros
  canTransferOwnership: boolean;    // Transferir rol principal
  canChangePlan: boolean;           // Cambiar/actualizar plan
  canEditCompanyProfile: boolean;   // Editar perfil de empresa
  canManageOffers: boolean;         // Crear/editar/eliminar ofertas
  canViewAllStats: boolean;         // Ver todas las estadísticas
  canConfigureAgents: boolean;      // Configurar Agentes IA
  canManageBilling: boolean;        // Gestionar facturación
  canMessageGestor: boolean;        // Contactar Gestor de La Pública
  canDeleteCompany: boolean;        // Eliminar cuenta empresa
}

export const EMPRESA_PERMISSIONS: Record<EmpresaRole, EmpresaPermissions> = {
  [EmpresaRole.EMPRESA]: {
    canManageTeam: true,
    canTransferOwnership: true,
    canChangePlan: true,
    canEditCompanyProfile: true,
    canManageOffers: true,
    canViewAllStats: true,
    canConfigureAgents: true,
    canManageBilling: true,
    canMessageGestor: true,
    canDeleteCompany: true,
  },

  [EmpresaRole.ADMIN_EMPRESA]: {
    canManageTeam: true,
    canTransferOwnership: false,
    canChangePlan: false,
    canEditCompanyProfile: true,
    canManageOffers: true,
    canViewAllStats: true,
    canConfigureAgents: true,
    canManageBilling: false,
    canMessageGestor: true,
    canDeleteCompany: false,
  },

  [EmpresaRole.EDITOR_EMPRESA]: {
    canManageTeam: false,
    canTransferOwnership: false,
    canChangePlan: false,
    canEditCompanyProfile: false,
    canManageOffers: true,
    canViewAllStats: true,
    canConfigureAgents: false,
    canManageBilling: false,
    canMessageGestor: true,
    canDeleteCompany: false,
  },

  [EmpresaRole.MEMBRE_EMPRESA]: {
    canManageTeam: false,
    canTransferOwnership: false,
    canChangePlan: false,
    canEditCompanyProfile: false,
    canManageOffers: true,
    canViewAllStats: true,
    canConfigureAgents: false,
    canManageBilling: false,
    canMessageGestor: true,
    canDeleteCompany: false,
  },

  [EmpresaRole.VISUALITZADOR]: {
    canManageTeam: false,
    canTransferOwnership: false,
    canChangePlan: false,
    canEditCompanyProfile: false,
    canManageOffers: false,
    canViewAllStats: true,
    canConfigureAgents: false,
    canManageBilling: false,
    canMessageGestor: false,
    canDeleteCompany: false,
  },
};

export interface EmpresaUser {
  id: string;
  name: string;
  email: string;
  role: EmpresaRole;
  cargo: string;
  avatar?: string;
  lastActive: Date;
  isOnline: boolean;
  isPending: boolean;
  invitedAt?: Date;
}

export interface RoleDisplayInfo {
  name: string;
  description: string;
  color: string;
  icon: string;
  badge: string;
}

export const ROLE_DISPLAY_INFO: Record<EmpresaRole, RoleDisplayInfo> = {
  [EmpresaRole.EMPRESA]: {
    name: 'Gestor Principal',
    description: 'Control total de l\'empresa i l\'equip',
    color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900',
    icon: '👑',
    badge: 'GESTOR PRINCIPAL',
  },
  [EmpresaRole.ADMIN_EMPRESA]: {
    name: 'Administrador',
    description: 'Gestiona l\'equip i el perfil de l\'empresa',
    color: 'bg-blue-500 text-white',
    icon: '⭐',
    badge: 'ADMIN',
  },
  [EmpresaRole.EDITOR_EMPRESA]: {
    name: 'Editor',
    description: 'Crea i edita ofertes de feina',
    color: 'bg-green-500 text-white',
    icon: '✏️',
    badge: 'EDITOR',
  },
  [EmpresaRole.MEMBRE_EMPRESA]: {
    name: 'Membre',
    description: 'Accés a ofertes i estadístiques',
    color: 'bg-gray-500 text-white',
    icon: '👤',
    badge: 'MEMBRE',
  },
  [EmpresaRole.VISUALITZADOR]: {
    name: 'Visualitzador',
    description: 'Només lectura d\'estadístiques',
    color: 'bg-gray-400 text-white',
    icon: '👁️',
    badge: 'VISUALITZADOR',
  },
};

// Límites de roles por plan
export interface PlanRoleConfig {
  maxMembers: number;
  availableRoles: EmpresaRole[];
  canTransferOwnership: boolean;
  customRoles?: boolean;
}

export const PLAN_ROLE_LIMITS: Record<string, PlanRoleConfig> = {
  BÀSIC: {
    maxMembers: 1,
    availableRoles: [EmpresaRole.EMPRESA],
    canTransferOwnership: false,
  },

  ESTÀNDARD: {
    maxMembers: 3,
    availableRoles: [EmpresaRole.EMPRESA, EmpresaRole.MEMBRE_EMPRESA],
    canTransferOwnership: true,
  },

  PREMIUM: {
    maxMembers: 10,
    availableRoles: [
      EmpresaRole.EMPRESA,
      EmpresaRole.ADMIN_EMPRESA,
      EmpresaRole.EDITOR_EMPRESA,
      EmpresaRole.MEMBRE_EMPRESA,
      EmpresaRole.VISUALITZADOR
    ],
    canTransferOwnership: true,
  },

  EMPRESARIAL: {
    maxMembers: -1,
    availableRoles: [
      EmpresaRole.EMPRESA,
      EmpresaRole.ADMIN_EMPRESA,
      EmpresaRole.EDITOR_EMPRESA,
      EmpresaRole.MEMBRE_EMPRESA,
      EmpresaRole.VISUALITZADOR
    ],
    canTransferOwnership: true,
    customRoles: true,
  },
};

// Función helper para verificar permisos
export function hasPermission(
  userRole: EmpresaRole,
  permission: keyof EmpresaPermissions
): boolean {
  return EMPRESA_PERMISSIONS[userRole][permission];
}

// Función helper para obtener permisos de un rol
export function getRolePermissions(role: EmpresaRole): EmpresaPermissions {
  return EMPRESA_PERMISSIONS[role];
}

// Función helper para obtener roles disponibles por plan
export function getAvailableRoles(planType: string): EmpresaRole[] {
  return PLAN_ROLE_LIMITS[planType]?.availableRoles || [EmpresaRole.EMPRESA];
}

// Función helper para verificar si se puede transferir ownership
export function canTransferOwnership(planType: string): boolean {
  return PLAN_ROLE_LIMITS[planType]?.canTransferOwnership || false;
}

// Interface para transferencia de ownership
export interface TransferOwnershipRequest {
  newOwnerId: string;
  confirmationName: string;
}

// Interface para cambio de rol
export interface ChangeRoleRequest {
  memberId: string;
  newRole: EmpresaRole;
}

// Interface para notificaciones
export interface RoleChangeNotification {
  type: 'role_change' | 'ownership_transfer' | 'member_added' | 'member_removed';
  fromUser: EmpresaUser;
  toUser?: EmpresaUser;
  oldRole?: EmpresaRole;
  newRole?: EmpresaRole;
  timestamp: Date;
  message: string;
}