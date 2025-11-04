'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Crown, Users, Edit, Mail, Eye, Trash2, Clock, AlertTriangle } from 'lucide-react';
import GestorProfileModal from '@/components/empresa/GestorProfileModal';
import SolicitarReunioModal from '@/components/empresa/SolicitarReunioModal';
import EditMemberModal from '@/components/empresa/EditMemberModal';
import TransferOwnershipModal from '@/components/empresa/TransferOwnershipModal';
import {
  EmpresaUser,
  EmpresaRole,
  ROLE_DISPLAY_INFO,
  EMPRESA_PERMISSIONS,
  PLAN_ROLE_LIMITS,
  getAvailableRoles,
  hasPermission
} from '@/types/empresa-roles';

// Types
interface GestorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  cargo: string;
  bio: string;
  expertise: string[];
  assignedDate: Date;
  companies: number;
}

type PlanType = 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';

interface PlanConfig {
  maxMembers: number;
  description: string;
  canAccessTeamSpace: boolean;
  features: string[];
  upgradeMessage: string | null;
  nextPlan?: string;
}

export default function EmpresaEquipPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<EmpresaUser | null>(null);
  const [transferTarget, setTransferTarget] = useState<EmpresaUser | null>(null);
  const [simulatedUser, setSimulatedUser] = useState<'gestor' | 'membre'>('gestor');

  // Plan actual
  const currentPlanType: PlanType = 'ESTÀNDARD';

  // Usuario actual (simulado - en producción vendría de autenticación)
  const currentUser: EmpresaUser = simulatedUser === 'gestor'
    ? {
        id: '1',
        name: 'Joan Pérez',
        email: 'joan.perez@empresa.com',
        role: EmpresaRole.EMPRESA,
        cargo: 'Director de RRHH',
        lastActive: new Date(),
        isOnline: true,
        isPending: false,
      }
    : {
        id: '2',
        name: 'Anna Martí',
        email: 'anna.marti@empresa.com',
        role: EmpresaRole.MEMBRE_EMPRESA,
        cargo: 'Responsable Comercial',
        lastActive: new Date(),
        isOnline: true,
        isPending: false,
      };

  // Configuración de límites por plan (legacy para compatibilidad)
  const PLAN_LIMITS: Record<PlanType, PlanConfig> = {
    BÀSIC: {
      maxMembers: 1,
      description: '1 persona de contacte',
      canAccessTeamSpace: false,
      features: ['Contacte principal'],
      upgradeMessage: 'El pla Bàsic no inclou equip. Millora al pla Estàndard per afegir fins a 3 membres.',
      nextPlan: 'Estàndard',
    },
    ESTÀNDARD: {
      maxMembers: 3,
      description: 'Fins a 3 membres',
      canAccessTeamSpace: true,
      features: ['Gestor intern', 'Fins a 2 membres addicionals', 'Gestió bàsica d\'equip'],
      upgradeMessage: 'Millora al pla Premium per tenir fins a 10 membres i més funcionalitats.',
      nextPlan: 'Premium',
    },
    PREMIUM: {
      maxMembers: 10,
      description: 'Fins a 10 membres',
      canAccessTeamSpace: true,
      features: ['Gestor intern', 'Fins a 9 membres addicionals', 'Rols personalitzats', 'Permisos granulars'],
      upgradeMessage: 'Millora al pla Empresarial per tenir membres il·limitats.',
      nextPlan: 'Empresarial',
    },
    EMPRESARIAL: {
      maxMembers: -1,
      description: 'Membres il·limitats',
      canAccessTeamSpace: true,
      features: ['Equip il·limitat', 'Rols personalitzats', 'Permisos granulars', 'Gestió multi-empresa', 'API d\'integració'],
      upgradeMessage: null,
    },
  };

  // Mock data del gestor de La Pública
  const mockGestor: GestorInfo = {
    id: 'gestor-maria',
    name: 'Maria García',
    email: 'maria.garcia@lapublica.cat',
    phone: '+34 666 777 888',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=3b82f6&color=fff&size=200',
    cargo: 'Gestora d\'Empreses',
    bio: 'Sóc la teva persona de contacte a La Pública. Estic aquí per ajudar-te amb qualsevol dubte sobre la plataforma, optimitzar el vostre perfil d\'empresa i trobar el millor talent.',
    expertise: ['Talent Acquisition', 'Employer Branding', 'Consultoría RRHH'],
    assignedDate: new Date('2024-01-15'),
    companies: 12,
  };

  // Función para generar miembros con nuevos roles
  const getMockTeamMembers = (plan: PlanType): EmpresaUser[] => {
    const baseMembers: EmpresaUser[] = [
      {
        id: '1',
        name: 'Joan Pérez',
        email: 'joan.perez@empresa.com',
        role: EmpresaRole.EMPRESA,
        cargo: 'Director de RRHH',
        lastActive: new Date(),
        isOnline: true,
        isPending: false,
      },
    ];

    if (plan === 'BÀSIC') {
      return []; // Sin equipo interno
    }

    if (plan === 'ESTÀNDARD') {
      return [
        ...baseMembers,
        {
          id: '2',
          name: 'Anna Martí',
          email: 'anna.marti@empresa.com',
          role: EmpresaRole.MEMBRE_EMPRESA,
          cargo: 'Responsable Comercial',
          lastActive: new Date(Date.now() - 3600000),
          isOnline: false,
          isPending: false,
        },
        {
          id: '3',
          name: 'Pere Soler',
          email: 'pere.soler@empresa.com',
          role: EmpresaRole.MEMBRE_EMPRESA,
          cargo: 'Analista de Marketing',
          lastActive: new Date(Date.now() - 86400000),
          isOnline: false,
          isPending: false,
        },
      ];
    }

    if (plan === 'PREMIUM') {
      return [
        ...baseMembers,
        {
          id: '2',
          name: 'Anna Martí',
          email: 'anna.marti@empresa.com',
          role: EmpresaRole.ADMIN_EMPRESA,
          cargo: 'Responsable Comercial',
          lastActive: new Date(Date.now() - 3600000),
          isOnline: false,
          isPending: false,
        },
        {
          id: '3',
          name: 'Pere Soler',
          email: 'pere.soler@empresa.com',
          role: EmpresaRole.EDITOR_EMPRESA,
          cargo: 'Analista de Marketing',
          lastActive: new Date(Date.now() - 86400000),
          isOnline: false,
          isPending: false,
        },
        {
          id: '4',
          name: 'Laura Vila',
          email: 'laura.vila@empresa.com',
          role: EmpresaRole.MEMBRE_EMPRESA,
          cargo: 'Atenció al Client',
          lastActive: new Date(Date.now() - 172800000),
          isOnline: false,
          isPending: false,
        },
        {
          id: '5',
          name: 'Marc Fonts',
          email: 'marc.fonts@empresa.com',
          role: EmpresaRole.EDITOR_EMPRESA,
          cargo: 'Content Manager',
          lastActive: new Date(Date.now() - 259200000),
          isOnline: false,
          isPending: false,
        },
        {
          id: '6',
          name: 'Sara Roca',
          email: 'sara.roca@empresa.com',
          role: EmpresaRole.VISUALITZADOR,
          cargo: 'Social Media',
          lastActive: new Date(Date.now() - 345600000),
          isOnline: false,
          isPending: false,
        },
      ];
    }

    if (plan === 'EMPRESARIAL') {
      const additionalMembers: EmpresaUser[] = [
        {
          id: '7',
          name: 'David Molina',
          email: 'david.molina@empresa.com',
          role: EmpresaRole.ADMIN_EMPRESA,
          cargo: 'IT Director',
          lastActive: new Date(Date.now() - 518400000),
          isOnline: true,
          isPending: false,
        },
        {
          id: '8',
          name: 'Elena Ruiz',
          email: 'elena.ruiz@empresa.com',
          role: EmpresaRole.EDITOR_EMPRESA,
          cargo: 'Product Manager',
          lastActive: new Date(Date.now() - 604800000),
          isOnline: false,
          isPending: false,
        },
      ];

      return [
        ...baseMembers,
        ...getMockTeamMembers('PREMIUM').slice(1),
        ...additionalMembers,
      ];
    }

    return baseMembers;
  };

  // Configuración actual
  const planConfig = PLAN_LIMITS[currentPlanType];
  const planRoleConfig = PLAN_ROLE_LIMITS[currentPlanType];
  const mockTeamMembers = getMockTeamMembers(currentPlanType);
  const currentUserPermissions = EMPRESA_PERMISSIONS[currentUser.role];

  // Cálculos dinámicos
  const canAddMore = planConfig.maxMembers === -1 || mockTeamMembers.length < planConfig.maxMembers;
  const progressPercentage = planConfig.maxMembers === -1 ? 0 : (mockTeamMembers.length / planConfig.maxMembers) * 100;
  const isAtLimit = planConfig.maxMembers !== -1 && mockTeamMembers.length >= planConfig.maxMembers;
  const isNearLimit = progressPercentage >= 80;

  const handleSendMessage = () => {
    alert('Funcionalitat de missatgeria en desenvolupament. Pots contactar directament per email: ' + mockGestor.email);
  };

  const handleRequestMeeting = () => {
    setShowMeetingModal(true);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  const handleEditMember = (member: EmpresaUser) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleSaveMember = async (updatedMember: Partial<EmpresaUser>) => {
    // Aquí iría la lógica para guardar en el backend
    console.log('Guardando miembro:', updatedMember);

    // Simular éxito
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mostrar mensaje de éxito
    alert(`Membre ${updatedMember.name} actualitzat correctament!`);
  };

  const handleTransferOwnership = (member: EmpresaUser) => {
    setTransferTarget(member);
    setShowEditModal(false);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = async (confirmationName: string) => {
    // Aquí iría la lógica para transferir ownership
    console.log('Transferring ownership to:', transferTarget, 'confirmation:', confirmationName);

    // Simular transferencia
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mostrar mensaje de éxito
    alert(`Ownership transferit a ${transferTarget?.name} correctament!`);
    setShowTransferModal(false);
    setTransferTarget(null);
  };

  const gestor = mockTeamMembers.find(member => member.role === EmpresaRole.EMPRESA);
  const teamMembers = mockTeamMembers; // Todos los miembros incluyendo el gestor
  const otherMembers = mockTeamMembers.filter(member => member.role !== EmpresaRole.EMPRESA); // Solo miembros que no son gestores
  const isCurrentUserGestor = currentUser.role === EmpresaRole.EMPRESA;

  const getRoleBadge = (role: EmpresaRole) => {
    return ROLE_DISPLAY_INFO[role].color;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Ara mateix';
    if (hours < 24) return `Fa ${hours}h`;
    return `Fa ${days}d`;
  };

  interface TeamMemberCardProps {
    member: EmpresaUser;
    showActions: boolean;
    showContactButton: boolean;
    showOnlineStatus: boolean;
  }

  const TeamMemberCard = ({ member, showActions, showContactButton, showOnlineStatus }: TeamMemberCardProps) => {
    const isPending = member.isPending;

    const handleOpenChat = () => {
      alert(`Obrint xat amb ${member.name} - Funcionalitat en desenvolupament`);
    };

    const handleViewProfile = () => {
      alert(`Veient perfil de ${member.name} - Funcionalitat en desenvolupament`);
    };

    const handleResendInvitation = () => {
      alert(`Reenviando invitació a ${member.email} - Funcionalitat en desenvolupament`);
    };

    const handleCancelInvitation = () => {
      if (confirm(`Estàs segur que vols cancel·lar la invitació a ${member.email}?`)) {
        alert(`Invitació cancel·lada - Funcionalitat en desenvolupament`);
      }
    };

    const handleDeleteMember = () => {
      if (confirm(`Estàs segur que vols eliminar ${member.name} de l'equip?`)) {
        alert(`Membre eliminat - Funcionalitat en desenvolupament`);
      }
    };

    return (
      <div className={`bg-white border rounded-lg p-6 relative hover:shadow-lg transition ${
        isPending ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
      }`}>
        {/* Badge de estado de invitación */}
        {isPending && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <span>⏳</span>
            <span>Invitació pendent</span>
          </div>
        )}

        {/* Avatar con indicador online */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
              isPending ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name ? member.name.charAt(0).toUpperCase() : '?'
              )}
            </div>

            {/* Indicador online/offline */}
            {showOnlineStatus && !isPending && (
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                member.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {member.name || member.email}
            </h3>
            {member.cargo && (
              <p className="text-sm text-gray-600 truncate">{member.cargo}</p>
            )}
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-1 ${getRoleBadge(member.role)}`}>
              <span className="mr-1">{ROLE_DISPLAY_INFO[member.role].icon}</span>
              {ROLE_DISPLAY_INFO[member.role].badge}
            </div>
          </div>
        </div>

        {/* Info de contacto */}
        <div className="text-sm text-gray-500 mb-4">
          <p className="truncate">{member.email}</p>
          {!isPending && (
            <p className="text-xs mt-1">
              {member.isOnline ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  En línia
                </span>
              ) : (
                <span>Última activitat: {getTimeAgo(member.lastActive)}</span>
              )}
            </p>
          )}
          {isPending && member.invitedAt && (
            <p className="text-xs text-amber-600 mt-1">
              Invitat fa {getTimeAgo(member.invitedAt)}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-4 border-t">
          {isPending ? (
            // Acciones para invitaciones pendientes
            <>
              <button
                onClick={handleResendInvitation}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
                title="Reenviar invitació"
              >
                📧 Reenviar
              </button>
              <button
                onClick={handleCancelInvitation}
                className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                title="Cancel·lar invitació"
              >
                ❌
              </button>
            </>
          ) : (
            // Acciones para miembros activos
            <>
              {/* Botón contactar (visible para todos) */}
              {showContactButton && (
                <button
                  onClick={handleOpenChat}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-1 text-sm font-medium"
                  title="Enviar missatge"
                >
                  <span>💬</span>
                  <span>Missatge</span>
                </button>
              )}

              {/* Ver perfil */}
              <button
                onClick={handleViewProfile}
                className="p-2 hover:bg-gray-100 rounded"
                title="Veure perfil"
              >
                👁️
              </button>

              {/* Acciones de gestión (solo para gestor) */}
              {showActions && (
                <>
                  <button
                    onClick={() => handleEditMember(member)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Editar membre"
                  >
                    ✏️
                  </button>
                  {member.role !== EmpresaRole.EMPRESA && (
                    <button
                      onClick={handleDeleteMember}
                      className="p-2 hover:bg-red-50 text-red-600 rounded"
                      title="Eliminar del equip"
                    >
                      🗑️
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const AddMemberCard = () => (
    <div
      onClick={() => canAddMore && currentUserPermissions.canManageTeam && setShowAddModal(true)}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[240px] transition-colors ${
        canAddMore && currentUserPermissions.canManageTeam
          ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
      }`}
    >
      {canAddMore && currentUserPermissions.canManageTeam ? (
        <Plus className="w-8 h-8 mb-2 text-gray-400" />
      ) : (
        <div className="w-8 h-8 mb-2 text-gray-300 flex items-center justify-center">
          🔒
        </div>
      )}
      <span className={`text-sm font-medium ${canAddMore && currentUserPermissions.canManageTeam ? 'text-gray-600' : 'text-gray-400'}`}>
        {canAddMore && currentUserPermissions.canManageTeam ? 'Afegir Nou Membre' : 'Límit assolit'}
      </span>
      {(!canAddMore || !currentUserPermissions.canManageTeam) && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400 block">
            {!currentUserPermissions.canManageTeam ? 'Sense permisos' : 'Millora el teu pla'}
          </span>
        </div>
      )}
    </div>
  );

  const PlanLimitsPanel = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👥</span>
          <h3 className="font-semibold text-gray-900">Límits del Pla {currentPlanType}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">{planConfig.description}</p>

        {planConfig.canAccessTeamSpace ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Membres actius:</span>
                <span className="font-semibold">
                  {teamMembers.length} / {planConfig.maxMembers === -1 ? '∞' : planConfig.maxMembers}
                </span>
              </div>

              {planConfig.maxMembers !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{width: `${Math.min(progressPercentage, 100)}%`}}
                  ></div>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Rols disponibles:</h4>
              {getAvailableRoles(currentPlanType).map((role) => (
                <div key={role} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`w-3 h-3 rounded-full ${getRoleBadge(role).includes('amber') ? 'bg-amber-400' : getRoleBadge(role).includes('blue') ? 'bg-blue-500' : getRoleBadge(role).includes('green') ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span>{ROLE_DISPLAY_INFO[role].name}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Característiques incloses:</h4>
              {planConfig.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {isAtLimit && planConfig.upgradeMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Has arribat al límit del teu pla
                  </p>
                </div>
              </div>
            )}

            {planConfig.upgradeMessage && currentUserPermissions.canChangePlan && (
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition">
                Millorar a {planConfig.nextPlan}
              </button>
            )}
          </>
        ) : (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">ℹ️</span>
              <span className="text-sm font-medium text-blue-800">Pla sense equip</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              {planConfig.upgradeMessage}
            </p>
            {currentUserPermissions.canChangePlan && (
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                Veure Plans
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Verificar si el usuario tiene acceso a esta página
  if (!currentUserPermissions.canManageTeam) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accés Restringit</h1>
          <p className="text-gray-600 mb-4">
            No tens permisos per gestionar l'equip de l'empresa.
          </p>
          <p className="text-sm text-gray-500">
            Contacta amb el gestor principal per obtenir accés a aquesta funcionalitat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isCurrentUserGestor ? 'Gestió d\'Equip' : 'El Meu Equip'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isCurrentUserGestor
              ? 'Gestiona els membres del teu equip i connecta amb el teu gestor de La Pública'
              : 'Coneix els membres del teu equip i els teus gestors'
            }
          </p>
        </div>

        {/* Botón temporal para testing */}
        <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
          <span className="text-sm text-yellow-800 font-medium">🧪 TESTING:</span>
          <div className="flex bg-white rounded-md">
            <button
              onClick={() => setSimulatedUser('gestor')}
              className={`px-3 py-1 text-sm font-medium rounded-l ${
                simulatedUser === 'gestor'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👑 Gestor
            </button>
            <button
              onClick={() => setSimulatedUser('membre')}
              className={`px-3 py-1 text-sm font-medium rounded-r ${
                simulatedUser === 'membre'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👤 Membre
            </button>
          </div>
          <span className="text-xs text-yellow-700">({currentUser.name})</span>
        </div>
      </div>

      {/* Gestor de La Pública Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h3 className="text-lg font-bold text-blue-900">
              EL TEU GESTOR DE LA PÚBLICA
            </h3>
          </div>
          <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
            Account Manager
          </span>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                MG
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-2xl font-bold text-gray-900">Maria García</h4>
            <p className="text-blue-700 font-semibold text-base">Gestora d'Empreses Senior</p>
            <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
              <span>✉️</span>
              <span>maria.garcia@lapublica.cat</span>
            </p>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
              <p className="text-gray-700 text-sm italic leading-relaxed">
                "Sóc la teva persona de contacte a La Pública. Estic aquí per
                ajudar-te amb qualsevol dubte sobre la plataforma, optimitzar
                el vostre perfil d'empresa i connectar-vos amb el millor talent
                del sector públic."
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                📊 Talent Acquisition
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                🎯 Employer Branding
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                💼 Consultoría RRHH
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={handleSendMessage}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <span>📧</span>
                <span>Enviar missatge</span>
              </button>

              <button
                onClick={handleRequestMeeting}
                className="px-5 py-2.5 bg-white border-2 border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 font-medium shadow-sm"
              >
                <span>📞</span>
                <span>Sol·licitar reunió</span>
              </button>

              <button
                onClick={handleViewProfile}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <span>👁️</span>
                <span>Veure perfil</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-blue-200">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span>Gestora assignada des de <strong>15 gener 2024</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏢</span>
              <span>Gestiona <strong>12 empreses</strong> col·laboradores</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span>Valoració: <strong>4.9/5</strong> (28 ressenyes)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separador visual */}
      <div className="my-8 border-t-2 border-gray-200"></div>

      {/* Contenido dinámico según el plan */}
      {!planConfig.canAccessTeamSpace ? (
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Funcionalitat d'Equip no disponible
            </h3>
            <p className="text-gray-600 mb-6">
              El pla Bàsic només inclou 1 persona de contacte. Millora al pla
              Estàndard per afegir fins a 3 membres del teu equip i accedir a
              totes les funcionalitats col·laboratives.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-red-500">✗</span>
                <span>Gestió d'equip intern</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-red-500">✗</span>
                <span>Rols i permisos</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="text-red-500">✗</span>
                <span>Col·laboració multi-usuari</span>
              </div>
            </div>
            {currentUserPermissions.canChangePlan && (
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Veure Plans i Preus
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            {/* Vista diferente según si es gestor o miembro */}
            {isCurrentUserGestor ? (
              // VISTA PARA GESTOR PRINCIPAL
              <>
                {/* Tarjeta propia del gestor - Solo informativa */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">👤</span>
                    <h2 className="text-xl font-semibold text-gray-900">La Teva Informació</h2>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-xl p-6">
                    <div className="flex items-center gap-6">
                      {/* Avatar con badge "TU" */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
                        {/* Badge "TU" */}
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          TU
                        </div>
                      </div>

                      {/* Información */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{currentUser.name}</h3>
                          <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                            <span>👑</span>
                            <span>GESTOR PRINCIPAL</span>
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">{currentUser.cargo}</p>
                        <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span>En línia</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Gestor des de gener 2024
                          </span>
                        </div>
                      </div>

                      {/* Info lateral */}
                      <div className="text-center px-6 py-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{otherMembers.length}</div>
                        <div className="text-xs text-gray-500 mt-1">Membres<br/>al teu equip</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: El Teu Equip */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">El Teu Equip</h2>
                      <p className="text-gray-600 mt-1">
                        Gestiona els membres del teu equip intern
                      </p>
                    </div>

                    {/* Botón añadir miembro dinámico */}
                    {canAddMore && currentUserPermissions.canManageTeam ? (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Afegir Membre</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                        title="Has arribat al límit del teu pla"
                      >
                        <span>🔒</span>
                        <span>Límit assolit</span>
                      </button>
                    )}
                  </div>

                  {/* Grid de OTROS miembros (sin incluir al gestor) */}
                  {otherMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {otherMembers.map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          showActions={true}  // Editar, eliminar
                          showContactButton={true}  // Contactar
                          showOnlineStatus={true}
                        />
                      ))}
                      <AddMemberCard />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AddMemberCard />
                    </div>
                  )}
                </div>
              </>
            ) : (
              // VISTA PARA MIEMBROS DEL EQUIPO
              <>
                {/* Tarjeta del Gestor del Equipo */}
                {gestor && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">👑</span>
                      <h2 className="text-xl font-semibold text-gray-900">Gestor de l'Equip</h2>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-6">
                        {/* Avatar con badge GESTOR */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {gestor.avatar ? (
                              <img src={gestor.avatar} alt={gestor.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              gestor.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* Indicador online/offline */}
                          <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-white ${
                            gestor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          {/* Badge GESTOR */}
                          <div className="absolute -top-2 -right-2 bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            GESTOR
                          </div>
                        </div>

                        {/* Info del gestor */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{gestor.name}</h3>
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                              <span>👑</span>
                              <span>GESTOR PRINCIPAL</span>
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium">{gestor.cargo}</p>
                          <p className="text-sm text-gray-500 mt-1">{gestor.email}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                gestor.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                              }`}></span>
                              <span>{gestor.isOnline ? 'En línia' : `Última activitat: ${getTimeAgo(gestor.lastActive)}`}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Gestor des de gener 2024
                            </span>
                          </div>
                        </div>

                        {/* Acciones prominentes */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => alert('Obrint xat amb el gestor - Funcionalitat en desenvolupament')}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition"
                          >
                            <span>💬</span>
                            <span>Enviar missatge</span>
                          </button>
                          <button
                            onClick={() => alert('Veient perfil del gestor - Funcionalitat en desenvolupament')}
                            className="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-2 font-medium transition"
                          >
                            <span>👁️</span>
                            <span>Veure perfil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Companys d'Equip */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>👥</span>
                    <span>Companys d'Equip</span>
                  </h2>

                  {otherMembers.filter(m => m.id !== currentUser.id).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {otherMembers
                        .filter(member => member.id !== currentUser.id)
                        .map(member => (
                          <TeamMemberCard
                            key={member.id}
                            member={member}
                            showActions={false}  // Sin editar/eliminar
                            showContactButton={true}  // Ver perfil y contactar
                            showOnlineStatus={true}
                          />
                        ))
                      }
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                      <p className="text-gray-500">
                        No hi ha altres membres a l'equip encara
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Call to Action - Espai de Treball (para todos) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>🛠️</span>
                    <span>Espai de Treball Col·laboratiu</span>
                  </h3>
                  <p className="text-gray-700">
                    {isCurrentUserGestor
                      ? 'Accedeix a documents compartits, tasques, calendari i xat per treballar amb el teu equip'
                      : 'Col·labora amb el teu equip: documents, tasques, calendari i xat'
                    }
                  </p>
                </div>
                <Link
                  href="/empresa/equip/espai"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition whitespace-nowrap"
                >
                  <span>Anar a l'Espai</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Plan Limits Panel (solo para gestores) */}
          {isCurrentUserGestor && (
            <div className="xl:col-span-1">
              <PlanLimitsPanel />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <GestorProfileModal
        gestor={mockGestor}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <SolicitarReunioModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        gestorName={mockGestor.name}
      />

      {selectedMember && (
        <EditMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          currentUser={currentUser}
          planType={currentPlanType}
          onSaveMember={handleSaveMember}
          onTransferOwnership={handleTransferOwnership}
        />
      )}

      {transferTarget && (
        <TransferOwnershipModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setTransferTarget(null);
          }}
          currentOwner={currentUser}
          newOwner={transferTarget}
          onConfirmTransfer={handleConfirmTransfer}
        />
      )}

      {/* Modal básico para añadir miembro */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Afegir Nou Membre</h3>
            <p className="text-gray-600 mb-4">Modal d'afegir membre - implementar formulari complet</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel·lar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Enviar Invitació
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}