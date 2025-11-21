'use client';

import { useState } from 'react';
import React from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { UniversalCard } from '../../../components/ui/UniversalCard';
import { useTasks, Task as APITask } from '@/hooks/useTasks';
import CreateTaskModal from '@/components/crm/CreateTaskModal';
import Toast from '@/components/ui/Toast';

// Mantenemos la interfaz local para compatibilidad temporal
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'review';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  leadId?: string;
  leadName?: string;
  companyId?: string;
  companyName?: string;
  assignedTo: string;
  createdDate: string;
  completedDate?: string;
}


export default function TasquesPage() {
  // Hook para datos reales
  const { tasks: apiTasks, loading, error, toggleComplete, createTask, deleteTask } = useTasks();

  // Estados para filtros y modal
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados para toast notifications
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Estado para controlar qué tarea se está marcando como completada
  const [togglingTaskId, setTogglingTaskId] = React.useState<string | null>(null);

  // Convertir datos de API a formato compatible con la UI existente
  const tasks: Task[] = apiTasks?.all ? apiTasks.all.map(apiTask => ({
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    type: 'follow-up' as const, // Por ahora usamos follow-up como default
    priority: (() => {
      const p = apiTask.priority.toLowerCase();
      if (p === 'urgent' || p === 'high') return 'high';
      if (p === 'medium') return 'medium';
      return 'low';
    })(),
    status: apiTask.status.toLowerCase() === 'completed' ? 'completed' : 'pending',
    dueDate: apiTask.dueDate || new Date().toISOString().split('T')[0],
    leadId: apiTask.leadId || undefined,
    leadName: apiTask.lead?.companyName || undefined,
    assignedTo: apiTask.user?.name || 'Sense assignar',
    createdDate: apiTask.createdAt.split('T')[0],
    completedDate: apiTask.completedAt?.split('T')[0]
  })) : [];

  const filteredTasks = tasks.filter(task => {
    return (
      (filterStatus === 'all' || task.status === filterStatus) &&
      (filterPriority === 'all' || task.priority === filterPriority) &&
      (filterType === 'all' || task.type === filterType)
    );
  });

  // DEBUG - Temporal
  console.log('=== DEBUG TASQUES ===');
  console.log('1. apiTasks raw:', apiTasks);
  console.log('2. apiTasks.all?.length:', apiTasks?.all?.length);
  console.log('3. tasks convertidas:', tasks);
  console.log('4. tasks.length:', tasks.length);
  console.log('5. filteredTasks:', filteredTasks);
  console.log('6. filteredTasks.length:', filteredTasks.length);
  console.log('7. filters activos:', { filterStatus, filterPriority, filterType });
  console.log('8. loading:', loading);
  console.log('9. error:', error);
  console.log('=====================');

  // Usar estadísticas reales de la API o calcular de los datos locales
  const totalTasks = apiTasks?.stats?.total || tasks.length;
  const pendingTasks = apiTasks?.stats?.pending || tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = apiTasks?.stats?.overdue || tasks.filter(t => t.status === 'overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completedThisWeek = apiTasks?.stats?.completedThisWeek || 0;

  const statsData = [
    {
      label: 'Total Tasques',
      value: totalTasks.toString(),
      trend: `+${completedThisWeek} aquesta setmana`
    },
    {
      label: 'Pendents',
      value: pendingTasks.toString(),
      trend: pendingTasks > 0 ? 'Requereix atenció' : 'Tot al dia'
    },
    {
      label: 'Endarrerides',
      value: overdueTasks.toString(),
      trend: overdueTasks > 0 ? 'Urgent!' : 'Excel·lent'
    },
    {
      label: 'Completades',
      value: completedTasks.toString(),
      trend: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% del total` : '0% del total'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '🤝';
      case 'follow-up':
        return '📋';
      case 'review':
        return '📑';
      default:
        return '📝';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in-progress':
        return 'En Progrés';
      case 'pending':
        return 'Pendent';
      case 'overdue':
        return 'Endarrerida';
      default:
        return 'Desconegut';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Mitjana';
      case 'low':
        return 'Baixa';
      default:
        return 'Desconeguda';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'call':
        return 'Trucada';
      case 'email':
        return 'Email';
      case 'meeting':
        return 'Reunió';
      case 'follow-up':
        return 'Seguiment';
      case 'review':
        return 'Revisió';
      default:
        return 'Altra';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  // Handler para crear tarea
  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setToast({ message: '✅ Tasca creada correctament!', type: 'success' });
      setShowCreateModal(false);
    } catch (error: any) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' });
      throw error; // Re-throw para que el modal lo maneje también
    }
  };

  return (
    <PageTemplate
      title="Gestió de Tasques"
      subtitle="Organitza i fes seguiment de totes les tasques relacionades amb leads i empreses"
      statsData={statsData}
      primaryAction={{
        text: '+ Nova Tasca',
        onClick: () => setShowCreateModal(true)
      }}
    >
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregant tasques...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Content only when not loading */}
        {!loading && (
          <>
            {/* Filtres */}
            <UniversalCard
              variant="default"
              topZone={{
                type: 'gradient',
                value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
              middleZone={{
                title: 'Filtres',
                description: 'Filtra tasques per estat, prioritat i tipus'
              }}
              bottomZone={{
                content: (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estat
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Tots els estats</option>
                        <option value="pending">Pendents</option>
                        <option value="in-progress">En Progrés</option>
                        <option value="completed">Completades</option>
                        <option value="overdue">Endarrerides</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioritat
                      </label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Totes les prioritats</option>
                        <option value="high">Alta</option>
                        <option value="medium">Mitjana</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipus
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Tots els tipus</option>
                        <option value="call">Trucades</option>
                        <option value="email">Emails</option>
                        <option value="meeting">Reunions</option>
                        <option value="follow-up">Seguiments</option>
                        <option value="review">Revisions</option>
                      </select>
                    </div>
                  </div>
                )
              }}
            />


            {/* Llista de tasques */}
            {!loading && filteredTasks.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">No hi ha tasques</p>
                <p className="text-sm text-gray-500">
                  {filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all'
                    ? 'Prova a canviar els filtres'
                    : 'Crea la teva primera tasca'}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <UniversalCard
                  key={task.id}
                  variant="default"
                  topZone={{
                    type: 'content',
                    value: (
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(task.type)}</span>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{task.title}</h3>
                            <p className="text-blue-100 text-sm">
                              {task.leadName || task.companyName || 'Sense assignar'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                      </div>
                    )
                  }}
                  middleZone={{
                    content: (
                      <div className="space-y-3">
                        <p className="text-gray-600">{task.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Tipus:</span>
                            <p className="text-gray-600">{getTypeText(task.type)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Assignada a:</span>
                            <p className="text-gray-600">{task.assignedTo}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Data límit:</span>
                            <p className={`${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {new Date(task.dueDate).toLocaleDateString('ca-ES')}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Creada:</span>
                            <p className="text-gray-600">{new Date(task.createdDate).toLocaleDateString('ca-ES')}</p>
                          </div>
                        </div>

                        {task.completedDate && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">Completada:</span>
                            <span className="text-green-600 ml-1">
                              {new Date(task.completedDate).toLocaleDateString('ca-ES')}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }}
                  bottomZone={{
                    primaryAction: task.status === 'completed'
                      ? {
                          text: 'Detalls',
                          onClick: () => console.log('Veure detalls tasca:', task.id)
                        }
                      : {
                          text: togglingTaskId === task.id ? 'Actualitzant...' : 'Marcar com Completada',
                          onClick: async () => {
                            if (togglingTaskId) return; // Prevenir clics múltiples

                            setTogglingTaskId(task.id);
                            try {
                              await toggleComplete(task.id);
                              setToast({
                                message: '✅ Tasca marcada com a completada!',
                                type: 'success'
                              });
                            } catch (err: any) {
                              setToast({
                                message: `❌ Error: ${err.message}`,
                                type: 'error'
                              });
                            } finally {
                              setTogglingTaskId(null);
                            }
                          }
                        },
                    secondaryAction: {
                      text: task.leadId ? 'Veure Lead' : 'Veure Empresa',
                      onClick: () => {
                        if (task.leadId) {
                          console.log('Navegar a lead:', task.leadId);
                        } else {
                          console.log('Navegar a empresa:', task.companyId);
                        }
                      }
                    }
                  }}
                />
              ))}
            </div>

            {filteredTasks.length === 0 && !loading && (
              <UniversalCard
                variant="default"
                topZone={{
                  type: 'gradient',
                  value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }}
                middleZone={{
                  title: 'Cap tasca trobada',
                  description: 'No s\'han trobat tasques que coincideixin amb els filtres seleccionats.'
                }}
                bottomZone={{
                  primaryAction: {
                    text: 'Netejar Filtres',
                    onClick: () => {
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterType('all');
                    }
                  }
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Modal para crear tarea */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </PageTemplate>
  );
}