'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
  User,
  Calendar,
  Filter,
} from 'lucide-react';

interface ProfileChange {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    logoUrl: string | null;
    email: string | null;
    sector: string | null;
  };
  type: string;
  status: string;
  oldValue: Record<string, any>;
  newValue: Record<string, any>;
  description: string | null;
  requestedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  reviewedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface ChangeDetailModalProps {
  change: ProfileChange;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isProcessing: boolean;
}

function ChangeDetailModal({ change, onClose, onApprove, onReject, isProcessing }: ChangeDetailModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Camps que contenen imatges
  const imageFields = ['logo', 'coverImage', 'logoUrl', 'coverImageUrl', 'image', 'banner', 'avatar'];

  // Detecta si un valor és una imatge (URL o base64)
  const isImageValue = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return (
      value.startsWith('http') ||
      value.startsWith('data:image') ||
      value.startsWith('/images/') ||
      value.includes('cloudinary.com') ||
      value.includes('res.cloudinary')
    );
  };

  // Renderitza un valor, mostrant imatges quan correspongui
  const renderValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">-</span>;

    // Si és un camp d'imatge o el valor sembla una imatge
    const isImage = (fieldName && imageFields.includes(fieldName)) || isImageValue(value);

    if (isImage && typeof value === 'string' && value.length > 0) {
      return (
        <div className="mt-2">
          <img
            src={value}
            alt={fieldName || 'Imatge'}
            className="max-w-[200px] max-h-[150px] object-contain rounded-lg border border-gray-200 bg-white"
            onError={(e) => {
              // Si la imatge no carrega, mostrar el text
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-xs text-gray-500 break-all">{value.substring(0, 100)}...</span>
        </div>
      );
    }

    if (typeof value === 'object') return <pre className="text-sm">{JSON.stringify(value, null, 2)}</pre>;
    return <span>{String(value)}</span>;
  };

  const getChangedFields = () => {
    const oldValue = change.oldValue || {};
    const newValue = change.newValue || {};
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    return Array.from(allKeys).filter(key => {
      const oldVal = JSON.stringify(oldValue[key]);
      const newVal = JSON.stringify(newValue[key]);
      return oldVal !== newVal;
    });
  };

  const changedFields = getChangedFields();

  const fieldLabels: Record<string, string> = {
    name: 'Nom',
    cif: 'CIF',
    email: 'Email',
    phone: 'Telefon',
    website: 'Web',
    address: 'Adreca',
    description: 'Descripcio',
    sector: 'Sector',
    size: 'Mida',
    foundingYear: 'Any fundacio',
    logo: 'Logo',
    coverImage: 'Imatge portada',
    slogan: 'Eslogan',
    socialLinks: 'Xarxes socials',
    certifications: 'Certificacions',
    tags: 'Etiquetes',
    services: 'Serveis',
    configuration: 'Configuracio',
    specializations: 'Especialitzacions',
    teamMembers: 'Membres equip',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    instagram: 'Instagram',
    facebook: 'Facebook',
    city: 'Ciutat',
    postalCode: 'Codi postal',
    province: 'Provincia',
    brandColor: 'Color marca',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{change.company.name}</h2>
              <p className="text-sm text-gray-500">Sol·licitud de canvis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <User className="w-4 h-4" />
                Sol·licitat per
              </div>
              <p className="font-medium text-gray-900">
                {change.requestedBy?.name || change.requestedBy?.email || 'Desconegut'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                Data sol·licitud
              </div>
              <p className="font-medium text-gray-900">
                {new Date(change.createdAt).toLocaleDateString('ca-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {change.description && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{change.description}</p>
            </div>
          )}

          {/* Changes comparison */}
          <h3 className="font-semibold text-gray-900 mb-4">Canvis sol·licitats</h3>

          {changedFields.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hi ha canvis detectats</p>
          ) : (
            <div className="space-y-4">
              {changedFields.map(field => (
                <div key={field} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">
                      {fieldLabels[field] || field}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="p-4">
                      <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Valor actual</span>
                      <div className="mt-2 text-sm text-gray-600">
                        {renderValue(change.oldValue?.[field], field)}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50">
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Nou valor</span>
                      <div className="mt-2 text-sm text-gray-900">
                        {renderValue(change.newValue?.[field], field)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection form */}
          {showRejectForm && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <label className="block text-sm font-medium text-red-800 mb-2">
                Motiu del rebuig *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-red-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Explica per que es rebutja aquesta sol·licitud..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {change.status === 'PENDING' && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            {!showRejectForm ? (
              <>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Rebutjar
                </button>
                <button
                  onClick={() => onApprove(change.id)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Aprovar canvis
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowRejectForm(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={() => onReject(change.id, rejectionReason)}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirmar rebuig
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CanvisPendentsPage() {
  const [changes, setChanges] = useState<ProfileChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChange, setSelectedChange] = useState<ProfileChange | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const loadChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/gestio/empreses/canvis?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        setChanges(data.data.changes);
      } else {
        setError(data.error || 'Error carregant canvis');
      }
    } catch (err) {
      setError('Error de connexio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChanges();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/gestio/empreses/canvis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedChange(null);
        loadChanges();
      } else {
        alert(data.error || 'Error aprovant canvis');
      }
    } catch (err) {
      alert('Error de connexio');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/gestio/empreses/canvis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedChange(null);
        loadChanges();
      } else {
        alert(data.error || 'Error rebutjant canvis');
      }
    } catch (err) {
      alert('Error de connexio');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pendent
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Aprovat
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rebutjat
          </span>
        );
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COMPANY_DATA: 'Dades empresa',
      CONTACT_INFO: 'Contacte',
      LOGO: 'Logo/Imatges',
      DESCRIPTION: 'Descripcio',
      OTHER: 'Altres',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canvis de Perfil Pendents</h1>
        <p className="text-gray-600 mt-1">
          Revisa i aprova o rebutja les sol·licituds de canvis de les empreses
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Estat:</span>
        </div>
        <div className="flex gap-2">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'PENDING' ? 'Pendents' : status === 'APPROVED' ? 'Aprovats' : 'Rebutjats'}
            </button>
          ))}
        </div>
        <button
          onClick={loadChanges}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualitzar
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      ) : changes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {statusFilter === 'PENDING'
              ? 'No hi ha sol·licituds pendents de revisio'
              : statusFilter === 'APPROVED'
              ? 'No hi ha sol·licituds aprovades'
              : 'No hi ha sol·licituds rebutjades'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Empresa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tipus
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Sol·licitat per
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Estat
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {changes.map((change) => (
                <tr key={change.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(change.company.logo || change.company.logoUrl) ? (
                        <img
                          src={change.company.logo || change.company.logoUrl || ''}
                          alt={change.company.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{change.company.name}</p>
                        <p className="text-sm text-gray-500">{change.company.sector || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{getTypeLabel(change.type)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">
                      {change.requestedBy?.name || change.requestedBy?.email || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">
                      {new Date(change.createdAt).toLocaleDateString('ca-ES')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(change.createdAt).toLocaleTimeString('ca-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(change.status)}
                    {change.status === 'REJECTED' && change.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate">
                        {change.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedChange(change)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Veure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedChange && (
        <ChangeDetailModal
          change={selectedChange}
          onClose={() => setSelectedChange(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
