'use client';

import { useState } from 'react';
import { CreateTaskInput } from '@/hooks/useTasks';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskInput) => Promise<void>;
  leadId?: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  leadId,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    leadId: leadId || undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('El títol és obligatori');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        leadId: leadId || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creant la tasca');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        leadId: leadId || undefined,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nova Tasca</h3>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Títol *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Trucar al client"
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripció
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ex: Trucar per confirmar reunió i enviar documentació..."
              disabled={submitting}
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data límit
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioritat
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            >
              <option value="low">Baixa</option>
              <option value="medium">Mitjana</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creant...
                </>
              ) : (
                'Crear Tasca'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}