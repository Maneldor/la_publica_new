'use client';

import { useState } from 'react';
import { X, AlertTriangle, Crown, User } from 'lucide-react';
import { EmpresaUser, EmpresaRole, ROLE_DISPLAY_INFO } from '@/types/empresa-roles';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOwner: EmpresaUser;
  newOwner: EmpresaUser;
  onConfirmTransfer: (confirmationName: string) => void;
  isLoading?: boolean;
}

export default function TransferOwnershipModal({
  isOpen,
  onClose,
  currentOwner,
  newOwner,
  onConfirmTransfer,
  isLoading = false,
}: TransferOwnershipModalProps) {
  const [confirmationName, setConfirmationName] = useState('');
  const [isConfirmationValid, setIsConfirmationValid] = useState(false);

  if (!isOpen) return null;

  const handleConfirmationChange = (value: string) => {
    setConfirmationName(value);
    setIsConfirmationValid(value.toLowerCase().trim() === newOwner.name.toLowerCase().trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmationValid && !isLoading) {
      onConfirmTransfer(confirmationName);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmationName('');
      setIsConfirmationValid(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-red-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">Transferir Gestió Principal</h2>
              <p className="text-red-700 text-sm">Aquesta acció és reversible però requereix confirmació</p>
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
        <div className="p-6">
          {/* Advertencia principal */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">
                  Estàs a punt de transferir la gestió principal de l'equip
                </h3>
                <p className="text-amber-800 text-sm">
                  Aquest canvi afectarà els permisos i responsabilitats de tots dos membres.
                  Assegura't que confies plenament en aquesta persona.
                </p>
              </div>
            </div>
          </div>

          {/* Cambios que ocurrirán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Current owner changes */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  {currentOwner.avatar ? (
                    <img src={currentOwner.avatar} alt={currentOwner.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentOwner.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{currentOwner.name}</h4>
                  <p className="text-gray-600 text-sm">{currentOwner.cargo}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rol actual:</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${ROLE_DISPLAY_INFO[EmpresaRole.EMPRESA].color}`}>
                    <Crown className="w-3 h-3 inline mr-1" />
                    {ROLE_DISPLAY_INFO[EmpresaRole.EMPRESA].badge}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Nou rol:</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${ROLE_DISPLAY_INFO[EmpresaRole.ADMIN_EMPRESA].color}`}>
                    <User className="w-3 h-3 inline mr-1" />
                    {ROLE_DISPLAY_INFO[EmpresaRole.ADMIN_EMPRESA].badge}
                  </div>
                </div>
              </div>
            </div>

            {/* New owner changes */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  {newOwner.avatar ? (
                    <img src={newOwner.avatar} alt={newOwner.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    newOwner.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{newOwner.name}</h4>
                  <p className="text-gray-600 text-sm">{newOwner.cargo}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rol actual:</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${ROLE_DISPLAY_INFO[newOwner.role].color}`}>
                    {ROLE_DISPLAY_INFO[newOwner.role].badge}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Nou rol:</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${ROLE_DISPLAY_INFO[EmpresaRole.EMPRESA].color}`}>
                    <Crown className="w-3 h-3 inline mr-1" />
                    {ROLE_DISPLAY_INFO[EmpresaRole.EMPRESA].badge}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qué va a pasar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">Què passarà amb aquesta transferència:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>{newOwner.name}</strong> serà el nou gestor principal amb control total</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>{currentOwner.name}</strong> passarà a ser Administrador (mantindrà la majoria de permisos)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>El nou gestor podrà gestionar tot l'equip, el pla i la facturació</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Aquest canvi és <strong>reversible</strong> - el nou gestor pot tornar-te el rol</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>S'enviarà una notificació al Gestor de La Pública</span>
              </li>
            </ul>
          </div>

          {/* Formulario de confirmación */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="confirmationName" className="block text-sm font-medium text-gray-700 mb-2">
                Per confirmar la transferència, escriu el nom complet del nou gestor:
              </label>
              <input
                type="text"
                id="confirmationName"
                value={confirmationName}
                onChange={(e) => handleConfirmationChange(e.target.value)}
                disabled={isLoading}
                placeholder={newOwner.name}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 ${
                  confirmationName === ''
                    ? 'border-gray-300 focus:ring-blue-500'
                    : isConfirmationValid
                      ? 'border-green-500 focus:ring-green-500 bg-green-50'
                      : 'border-red-500 focus:ring-red-500 bg-red-50'
                }`}
              />
              {confirmationName !== '' && !isConfirmationValid && (
                <p className="text-sm text-red-600 mt-1">
                  El nom no coincideix exactament. Escriu: "{newOwner.name}"
                </p>
              )}
              {isConfirmationValid && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <span>✓</span> Nom confirmat correctament
                </p>
              )}
            </div>

            {/* Disclaimer final */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Nota important:</strong> Un cop completada la transferència, només el nou gestor principal
                podrà tornar-te aquest rol o realitzar canvis en el pla i la facturació.
                Assegura't que confies en aquesta persona abans de procedir.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={!isConfirmationValid || isLoading}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isConfirmationValid && !isLoading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Transferint...
                  </div>
                ) : (
                  'Confirmar Transferència'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}