'use client';

import { useState } from 'react';
import { X, Crown, User, Edit3, Shield, Eye, AlertCircle } from 'lucide-react';
import {
  EmpresaUser,
  EmpresaRole,
  ROLE_DISPLAY_INFO,
  EMPRESA_PERMISSIONS,
  getAvailableRoles,
  hasPermission
} from '@/types/empresa-roles';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: EmpresaUser;
  currentUser: EmpresaUser;
  planType: string;
  onSaveMember: (updatedMember: Partial<EmpresaUser>) => Promise<void>;
  onTransferOwnership: (member: EmpresaUser) => void;
  isLoading?: boolean;
}

interface PermissionItem {
  key: keyof typeof EMPRESA_PERMISSIONS[EmpresaRole.EMPRESA];
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PERMISSION_ITEMS: PermissionItem[] = [
  {
    key: 'canManageTeam',
    label: 'Gestionar equip',
    description: 'Afegir, editar i eliminar membres de l\'equip',
    icon: <User className="w-4 h-4" />
  },
  {
    key: 'canEditCompanyProfile',
    label: 'Editar perfil empresa',
    description: 'Modificar la informació de l\'empresa',
    icon: <Edit3 className="w-4 h-4" />
  },
  {
    key: 'canManageOffers',
    label: 'Gestionar ofertes',
    description: 'Crear, editar i eliminar ofertes de feina',
    icon: <Shield className="w-4 h-4" />
  },
  {
    key: 'canViewAllStats',
    label: 'Veure estadístiques',
    description: 'Accés a totes les estadístiques de l\'empresa',
    icon: <Eye className="w-4 h-4" />
  },
  {
    key: 'canChangePlan',
    label: 'Gestionar pla',
    description: 'Canviar i actualitzar el pla de subscripció',
    icon: <Crown className="w-4 h-4" />
  },
  {
    key: 'canManageBilling',
    label: 'Gestionar facturació',
    description: 'Accés a facturació i mètodes de pagament',
    icon: <Shield className="w-4 h-4" />
  },
];

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  currentUser,
  planType,
  onSaveMember,
  onTransferOwnership,
  isLoading = false,
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    cargo: member.cargo,
    role: member.role,
  });

  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const availableRoles = getAvailableRoles(planType);
  const currentUserPermissions = EMPRESA_PERMISSIONS[currentUser.role];
  const canEditRoles = currentUserPermissions.canManageTeam;
  const canTransferOwnership = currentUser.role === EmpresaRole.EMPRESA && member.id !== currentUser.id;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      setHasChanges(
        newData.name !== member.name ||
        newData.cargo !== member.cargo ||
        newData.role !== member.role
      );
      return newData;
    });
  };

  const handleSave = async () => {
    if (!hasChanges || isLoading) return;

    try {
      await onSaveMember({
        id: member.id,
        name: formData.name,
        cargo: formData.cargo,
        role: formData.role as EmpresaRole,
      });
      onClose();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleTransferOwnership = () => {
    onTransferOwnership(member);
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form
      setFormData({
        name: member.name,
        cargo: member.cargo,
        role: member.role,
      });
      setHasChanges(false);
      onClose();
    }
  };

  const selectedRolePermissions = EMPRESA_PERMISSIONS[formData.role as EmpresaRole];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Editar Membre</h2>
              <p className="text-gray-600">{member.email}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Form */}
          <div className="space-y-6">
            {/* Basic info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informació bàsica</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correu electrònic
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={member.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El correu electrònic no es pot modificar
                  </p>
                </div>

                <div>
                  <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
                    Càrrec / Posició
                  </label>
                  <input
                    type="text"
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ex: Responsable de Recursos Humans"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Role selection */}
            {canEditRoles && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rol i permisos</h3>

                <div className="space-y-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol del membre
                  </label>

                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={isLoading || member.role === EmpresaRole.EMPRESA}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_DISPLAY_INFO[role].name} - {ROLE_DISPLAY_INFO[role].description}
                      </option>
                    ))}
                  </select>

                  {member.role === EmpresaRole.EMPRESA && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        No pots canviar el rol del gestor principal. Per transferir aquest rol, utilitza l'opció de transferència a continuació.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transfer ownership */}
            {canTransferOwnership && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferència de gestió</h3>

                <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900">Transferir gestió principal</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Convertir aquest membre en el nou gestor principal de l'equip.
                        Tu passaràs a ser Administrador.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTransferOwnership}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    👑 Transferir Gestió Principal a {member.name}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Permissions preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista prèvia de permisos: {ROLE_DISPLAY_INFO[formData.role as EmpresaRole].name}
            </h3>

            <div className="space-y-3">
              {PERMISSION_ITEMS.map((permission) => {
                const hasThisPermission = selectedRolePermissions[permission.key];

                return (
                  <div
                    key={permission.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      hasThisPermission
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      hasThisPermission ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {permission.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          hasThisPermission ? 'text-green-900' : 'text-gray-600'
                        }`}>
                          {permission.label}
                        </span>
                        <span className={`text-sm ${
                          hasThisPermission ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {hasThisPermission ? '✓' : '✗'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        hasThisPermission ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {permission.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Informació del rol</h4>
              <p className="text-sm text-blue-800">
                {ROLE_DISPLAY_INFO[formData.role as EmpresaRole].description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              hasChanges && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardant...
              </div>
            ) : (
              'Guardar Canvis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}