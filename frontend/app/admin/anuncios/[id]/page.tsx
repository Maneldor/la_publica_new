'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, X, AlertTriangle, Clock, User, Calendar, Eye, Edit } from 'lucide-react';
import { useAnuncio, useApproveAnuncio, useRejectAnuncio } from '@/hooks/useAnuncios';
import { toast } from 'sonner';

export default function AnuncioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: anuncioResponse, isLoading, error } = useAnuncio(params.id as string);
  const approveAnuncioMutation = useApproveAnuncio();
  const rejectAnuncioMutation = useRejectAnuncio();

  const anuncio = anuncioResponse?.data || anuncioResponse;

  const handleApprove = async () => {
    if (!anuncio?.id) return;
    if (!confirm('¿Aprobar este anuncio? Se publicará inmediatamente.')) return;

    try {
      await approveAnuncioMutation.mutateAsync(anuncio.id);
      toast.success('Anuncio aprobado correctamente');
      router.push('/admin/anuncios/listar');
    } catch (error) {
      console.error('Error aprobando anuncio:', error);
    }
  };

  const handleReject = async () => {
    if (!anuncio?.id) return;

    try {
      await rejectAnuncioMutation.mutateAsync({
        id: anuncio.id,
        reason: rejectReason.trim() || undefined
      });
      toast.success('Anuncio rechazado correctamente');
      setShowRejectModal(false);
      setRejectReason('');
      router.push('/admin/anuncios/listar');
    } catch (error) {
      console.error('Error rechazando anuncio:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return '✅ Aprobado';
      case 'pending_review': return '⏳ Pendiente revisión';
      case 'rejected': return '❌ Rechazado';
      case 'draft': return '📝 Borrador';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando anuncio...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anuncio) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Tornar
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">No se pudo cargar el anuncio.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Tornar al llistat
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detalle del Anuncio
              </h1>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(anuncio.status)}`}>
                  {getStatusLabel(anuncio.status)}
                </span>
                <span className="text-gray-500 text-sm">
                  ID: {anuncio.id}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              {anuncio.status === 'pending_review' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={approveAnuncioMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={rejectAnuncioMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </button>
                </>
              )}

              <button
                onClick={() => router.push(`/admin/anuncios/${anuncio.id}/editar`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del anuncio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {anuncio.title}
              </h2>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {anuncio.content}
                </p>
              </div>

              {/* Configuración de marketplace si existe */}
              {anuncio.configuration && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Configuración adicional:</h3>
                  <pre className="text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(anuncio.configuration, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Razón de rechazo si existe */}
            {anuncio.status === 'rejected' && anuncio.configuration?.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">Razón del rechazo:</h3>
                    <p className="text-red-700 mt-1">{anuncio.configuration.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar con metadatos */}
          <div className="space-y-6">
            {/* Información del autor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Autor
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Nombre:</span> {anuncio.user?.name || anuncio.user?.email}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Email:</span> {anuncio.user?.email}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">ID:</span> {anuncio.userId}
                </p>
              </div>
            </div>

            {/* Detalles técnicos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Detalles
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="ml-2 font-medium">{anuncio.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Prioridad:</span>
                  <span className="ml-2 font-medium">{anuncio.priority}/10</span>
                </div>
                <div>
                  <span className="text-gray-600">Alcance:</span>
                  <span className="ml-2 font-medium">{anuncio.scope}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fijado:</span>
                  <span className="ml-2">{anuncio.isPinned ? '📌 Sí' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Activo:</span>
                  <span className="ml-2">{anuncio.isActive ? '✅ Sí' : '❌ No'}</span>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fechas
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Creado:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(anuncio.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Actualizado:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(anuncio.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Inicio:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(anuncio.startDate).toLocaleString('es-ES')}
                  </p>
                </div>
                {anuncio.expiresAt && (
                  <div>
                    <span className="text-gray-600">Expira:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(anuncio.expiresAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            {anuncio.totalReads !== undefined && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Estadísticas
                </h3>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {anuncio.totalReads || 0}
                  </div>
                  <div className="text-sm text-gray-600">lecturas</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de rechazo */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rechazar anuncio
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres rechazar este anuncio? Puedes proporcionar una razón opcional.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Razón del rechazo (opcional)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows={3}
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectAnuncioMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {rejectAnuncioMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}