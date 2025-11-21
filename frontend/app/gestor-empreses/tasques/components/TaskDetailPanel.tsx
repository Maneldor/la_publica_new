'use client';

import { useState, useEffect } from 'react';
import { useTask } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority, TaskType, TaskCategory } from '@prisma/client';
import { useUsers } from '@/hooks/useUsers';

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function TaskDetailPanel({ taskId, onClose, onUpdate }: TaskDetailPanelProps) {
  const { task, loading, mutate } = useTask(taskId);
  const { users } = useUsers();
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'subtasks'>('details');
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setEditValues({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        category: task.category,
        assignedToId: task.assignedToId,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        estimatedMinutes: task.estimatedMinutes,
        tags: task.tags || [],
      });
    }
  }, [task]);

  if (!taskId) return null;

  const handleSaveField = async (field: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: editValues[field] }),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      await mutate();
      setEditMode(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar');

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  const handleDuplicate = async () => {
    if (!task) return;

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${task.title} (copia)`,
          description: task.description,
          type: task.type,
          priority: task.priority,
          category: task.category,
          assignedToId: task.assignedToId,
          estimatedMinutes: task.estimatedMinutes,
          tags: task.tags,
        }),
      });

      if (!response.ok) throw new Error('Error al duplicar');

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al duplicar');
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editValues.tags.includes(tag.trim())) {
      const newTags = [...editValues.tags, tag.trim()];
      setEditValues({ ...editValues, tags: newTags });
      setEditMode('tags');
      // Auto-guardar tags
      fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags }),
      }).then(() => mutate());
    }
  };

  const removeTag = (tag: string) => {
    const newTags = editValues.tags.filter((t: string) => t !== tag);
    setEditValues({ ...editValues, tags: newTags });
    // Auto-guardar tags
    fetch(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: newTags }),
    }).then(() => mutate());
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-700 border-red-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      LOW: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[priority];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      WAITING: 'bg-purple-100 text-purple-700',
      BLOCKED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };
    return colors[status];
  };

  const getStatusLabel = (status: TaskStatus) => {
    const labels = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      WAITING: 'Esperando',
      BLOCKED: 'Bloqueada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    const labels = {
      URGENT: 'Urgente',
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baja',
    };
    return labels[priority];
  };

  const getTypeLabel = (type: TaskType) => {
    const labels = {
      FOLLOW_UP: 'Seguimiento',
      MEETING: 'Reunión',
      CALL: 'Llamada',
      EMAIL: 'Email',
      DEMO: 'Demo',
      PROPOSAL: 'Propuesta',
      CONTRACT: 'Contrato',
      ONBOARDING: 'Onboarding',
      SUPPORT: 'Soporte',
      INTERNAL: 'Interna',
      OTHER: 'Otros',
    };
    return labels[type];
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !task ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Tarea no encontrada</p>
          </div>
        ) : (
          <>
            {/* Header fijo */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                {task.type && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getTypeLabel(task.type)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Título editable */}
            <div className="px-6 py-4 border-b border-gray-200">
              {editMode === 'title' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editValues.title}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveField('title');
                      } else if (e.key === 'Escape') {
                        setEditMode(null);
                        setEditValues({ ...editValues, title: task.title });
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveField('title')}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(null);
                        setEditValues({ ...editValues, title: task.title });
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <div
                    onClick={() => setEditMode('title')}
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    {task.title}
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex px-6 overflow-x-auto">
                {[
                  { id: 'details', label: 'Detalles', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { id: 'comments', label: 'Comentarios', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                  { id: 'subtasks', label: 'Subtareas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { id: 'activity', label: 'Actividad', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                    {tab.id === 'comments' && task._count?.comments > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                        {task._count.comments}
                      </span>
                    )}
                    {tab.id === 'subtasks' && task._count?.subtasks > 0 && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                        {task._count.subtasks}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido según tab */}
            <div className="px-6 py-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción
                    </label>
                    {editMode === 'description' ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValues.description || ''}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Añade una descripción detallada..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveField('description')}
                            disabled={saving}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {saving ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(null);
                              setEditValues({ ...editValues, description: task.description });
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setEditMode('description')}
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-3 rounded-lg min-h-[80px] border border-transparent hover:border-gray-200 transition-all"
                      >
                        {task.description ? (
                          <p className="whitespace-pre-wrap">{task.description}</p>
                        ) : (
                          <p className="text-gray-400 italic">Click para añadir descripción...</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grid de campos principales */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={editValues.status}
                        onChange={(e) => {
                          setEditValues({ ...editValues, status: e.target.value });
                          setEditMode('status');
                        }}
                        onBlur={() => editMode === 'status' && handleSaveField('status')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                        <option value="WAITING">Esperando</option>
                        <option value="BLOCKED">Bloqueada</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={editValues.priority}
                        onChange={(e) => {
                          setEditValues({ ...editValues, priority: e.target.value });
                          setEditMode('priority');
                        }}
                        onBlur={() => editMode === 'priority' && handleSaveField('priority')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="URGENT">Urgente</option>
                        <option value="HIGH">Alta</option>
                        <option value="MEDIUM">Media</option>
                        <option value="LOW">Baja</option>
                      </select>
                    </div>

                    {/* Asignado a */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Asignado a
                      </label>
                      <select
                        value={editValues.assignedToId}
                        onChange={(e) => {
                          setEditValues({ ...editValues, assignedToId: e.target.value });
                          setEditMode('assignedToId');
                        }}
                        onBlur={() => editMode === 'assignedToId' && handleSaveField('assignedToId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de tarea
                      </label>
                      <select
                        value={editValues.type}
                        onChange={(e) => {
                          setEditValues({ ...editValues, type: e.target.value });
                          setEditMode('type');
                        }}
                        onBlur={() => editMode === 'type' && handleSaveField('type')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

                    {/* Fecha inicio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={editValues.startDate}
                        onChange={(e) => {
                          setEditValues({ ...editValues, startDate: e.target.value });
                          setEditMode('startDate');
                        }}
                        onBlur={() => editMode === 'startDate' && handleSaveField('startDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Fecha límite */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha límite
                      </label>
                      <input
                        type="date"
                        value={editValues.dueDate}
                        onChange={(e) => {
                          setEditValues({ ...editValues, dueDate: e.target.value });
                          setEditMode('dueDate');
                        }}
                        onBlur={() => editMode === 'dueDate' && handleSaveField('dueDate')}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Estimación de tiempo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiempo estimado (minutos)
                    </label>
                    <input
                      type="number"
                      value={editValues.estimatedMinutes || ''}
                      onChange={(e) => {
                        setEditValues({ ...editValues, estimatedMinutes: parseInt(e.target.value) || null });
                        setEditMode('estimatedMinutes');
                      }}
                      onBlur={() => editMode === 'estimatedMinutes' && handleSaveField('estimatedMinutes')}
                      placeholder="Ej: 30"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[15, 30, 60, 120, 240].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => {
                            setEditValues({ ...editValues, estimatedMinutes: minutes });
                            setEditMode('estimatedMinutes');
                            handleSaveField('estimatedMinutes');
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded transition-colors"
                        >
                          {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scoring */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Scoring Automático
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">{task.autoScore || 0}</div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">Score Total</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-red-600">{task.urgencyScore || 0}</div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">Urgencia</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-600">{task.impactScore || 0}</div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">Impacto</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600">{task.effortScore || 0}</div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">Esfuerzo</div>
                      </div>
                    </div>
                  </div>

                  {/* Etiquetas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Etiquetas
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editValues.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Añadir etiqueta..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Contexto (Lead/Company) */}
                  {(task.lead || task.company) && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Contexto</h4>
                      <div className="space-y-2">
                        {task.lead && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Lead
                            </span>
                            
                              href={`/gestor-empreses/leads/${task.lead.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {task.lead.companyName}
                            </a>
                          </div>
                        )}
                        {task.company && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Cliente
                            </span>
                            
                              href={`/gestor-empreses/empresas/${task.company.id}`}
                              className="text-sm text-green-600 hover:text-green-700 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {task.company.name}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Información del sistema</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Creado por:</span>
                        <p className="font-medium text-gray-900">{task.createdBy?.name || 'Sistema'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Fecha creación:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(task.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Última actualización:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(task.updatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {task.completedAt && (
                        <div>
                          <span className="text-gray-600">Completada:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(task.completedAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <p className="text-center text-gray-500 py-8">
                    Sistema de comentarios - Próximamente
                  </p>
                </div>
              )}

              {activeTab === 'subtasks' && (
                <div className="space-y-4">
                  <p className="text-center text-gray-500 py-8">
                    Sistema de subtareas - Próximamente
                  </p>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {task.activities && task.activities.length > 0 ? (
                    task.activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {activity.user && (
                              <span className="text-xs text-gray-500">
                                {activity.user.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(activity.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No hay actividad registrada
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditValues({ ...editValues, status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' });
                    setEditMode('status');
                    handleSaveField('status');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {task.status === 'COMPLETED' ? 'Reabrir' : 'Completar'}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}