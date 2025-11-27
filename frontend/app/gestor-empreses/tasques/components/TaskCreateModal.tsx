'use client';

import { useState, useEffect } from 'react';
import { TaskType, TaskPriority, TaskCategory } from '@prisma/client';
import { useUsers } from '@/hooks/useUsers';
import { useSession } from 'next-auth/react';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editTask?: any; // Para modo edición
}

export default function TaskCreateModal({ isOpen, onClose, onSubmit, editTask }: TaskCreateModalProps) {
  const { data: session } = useSession();
  const { usersForAssignment, loading: loadingUsers } = useUsers({ active: true });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    title: editTask?.title || '',
    description: editTask?.description || '',
    type: editTask?.type || 'FOLLOW_UP' as TaskType,
    category: editTask?.category || null as TaskCategory | null,

    // Paso 2: Prioridad y asignación
    priority: editTask?.priority || 'MEDIUM' as TaskPriority,
    assignedToId: editTask?.assignedToId || '',
    leadId: editTask?.leadId || null,
    companyId: editTask?.companyId || null,

    // Paso 3: Fechas y detalles
    dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '',
    startDate: editTask?.startDate ? new Date(editTask.startDate).toISOString().split('T')[0] : '',
    estimatedMinutes: editTask?.estimatedMinutes || null,
    reminderDate: editTask?.reminderDate ? new Date(editTask.reminderDate).toISOString().split('T')[0] : '',
    tags: editTask?.tags || [],
    isRecurring: editTask?.isRecurring || false,
  });

  const [newTag, setNewTag] = useState('');

  // Obtener ID del usuario actual
  useEffect(() => {
    if (session?.user?.email && usersForAssignment.length > 0) {
      const currentUser = usersForAssignment.find((u: any) => u.email === session.user?.email);
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }
    }
  }, [session, usersForAssignment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!formData.assignedToId) {
      setError('Debes asignar la tarea a un usuario');
      return;
    }

    setSubmitting(true);
    try {
      // Si seleccionó "Yo mismo", usar el ID del usuario actual
      const assignedToId = formData.assignedToId === 'current-user'
        ? currentUserId
        : formData.assignedToId;

      await onSubmit({
        ...formData,
        assignedToId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        reminderDate: formData.reminderDate ? new Date(formData.reminderDate).toISOString() : null,
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'FOLLOW_UP',
        category: null,
        priority: 'MEDIUM',
        assignedToId: '',
        leadId: null,
        companyId: null,
        dueDate: '',
        startDate: '',
        estimatedMinutes: null,
        reminderDate: '',
        tags: [],
        isRecurring: false,
      });
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Error al crear tarea');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editTask ? 'Editar Tarea' : 'Nova Tasca'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Paso {step} de 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PASO 1: Información básica */}
          {step === 1 && (
            <div className="px-6 py-6 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la tarea <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Llamar para seguimiento de propuesta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Añade detalles sobre lo que hay que hacer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  disabled={submitting}
                />
              </div>

              {/* Tipo y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="FOLLOW_UP">Seguimiento</option>
                    <option value="MEETING">Reunión</option>
                    <option value="CALL">Llamada</option>
                    <option value="EMAIL">Email</option>
                    <option value="DEMO">Demo</option>
                    <option value="PROPOSAL">Propuesta</option>
                    <option value="CONTRACT">Contrato</option>
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="SUPPORT">Soporte</option>
                    <option value="INTERNAL">Interna</option>
                    <option value="OTHER">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Sin categoría</option>
                    <option value="SALES">Ventas</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SUPPORT">Soporte</option>
                    <option value="OPERATIONS">Operaciones</option>
                    <option value="ADMIN">Administración</option>
                    <option value="DEVELOPMENT">Desarrollo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Prioridad y asignación */}
          {step === 2 && (
            <div className="px-6 py-6 space-y-6">
              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'URGENT', label: 'Urgente', color: 'bg-red-100 border-red-300 text-red-700' },
                    { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 border-orange-300 text-orange-700' },
                    { value: 'MEDIUM', label: 'Media', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
                    { value: 'LOW', label: 'Baja', color: 'bg-green-100 border-green-300 text-green-700' },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.value as TaskPriority })}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        formData.priority === priority.value
                          ? `${priority.color} ring-2 ring-offset-2`
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      disabled={submitting}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asignado a */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Gestor <span className="text-red-500">*</span>
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">Cargando usuarios...</div>
                ) : (
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Selecciona un gestor</option>
                    {currentUserId && (
                      <option value="current-user" className="font-semibold">
                        👤 Yo mismo (Gestor actual)
                      </option>
                    )}
                    <optgroup label="Gestores de Empresa">
                      {usersForAssignment.filter((u: any) => !u.isAI).map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </optgroup>
                    {usersForAssignment.some((u: any) => u.isAI) && (
                      <optgroup label="Gestores de IA">
                        {usersForAssignment.filter((u: any) => u.isAI).map((user: any) => (
                          <option key={user.id} value={user.id}>
                            🤖 {user.name} - {user.role || 'IA'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>

              {/* Estimación de tiempo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo estimado (minutos)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[15, 30, 60, 120, 240].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setFormData({ ...formData, estimatedMinutes: minutes })}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                        formData.estimatedMinutes === minutes
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500'
                      }`}
                      disabled={submitting}
                    >
                      {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={formData.estimatedMinutes || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || null })}
                  placeholder="O introduce un valor personalizado"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500"
                  min="1"
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          {/* PASO 3: Fechas y etiquetas */}
          {step === 3 && (
            <div className="px-6 py-6 space-y-6">
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Recordatorio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recordatorio
                </label>
                <input
                  type="datetime-local"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Añadir etiqueta..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={submitting}
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-red-600"
                        disabled={submitting}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tarea recurrente */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={submitting}
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Tarea recurrente
                </label>
              </div>
            </div>
          )}

          {/* Footer con botones */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  disabled={submitting}
                >
                  ← Anterior
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={submitting}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={submitting}
                >
                  {submitting ? 'Creando...' : editTask ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}