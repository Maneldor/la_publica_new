'use client';

import { useState } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { UniversalCard } from '../../../components/ui/UniversalCard';

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

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Trucar client Innovació Tech',
    description: 'Trucar per confirmar reunió de presentació de proposta',
    type: 'call',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-10-30',
    leadId: 'lead-001',
    leadName: 'Innovació Tech SL',
    assignedTo: 'Maria García',
    createdDate: '2024-10-28'
  },
  {
    id: '2',
    title: 'Enviar proposta Consultoria Barcelona',
    description: 'Enviar proposta personalitzada amb preus i timings',
    type: 'email',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2024-10-29',
    companyId: 'comp-002',
    companyName: 'Consultoria Barcelona',
    assignedTo: 'Joan Martínez',
    createdDate: '2024-10-27'
  },
  {
    id: '3',
    title: 'Seguiment reunió Serveis Digitals',
    description: 'Enviar resum de la reunió i properes accions',
    type: 'follow-up',
    priority: 'medium',
    status: 'overdue',
    dueDate: '2024-10-26',
    leadId: 'lead-003',
    leadName: 'Serveis Digitals Pro',
    assignedTo: 'Anna López',
    createdDate: '2024-10-24'
  },
  {
    id: '4',
    title: 'Revisar contracte TechSolutions',
    description: 'Revisar els termes del contracte abans de la signatura',
    type: 'review',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-11-02',
    companyId: 'comp-001',
    companyName: 'TechSolutions BCN',
    assignedTo: 'Pere Soler',
    createdDate: '2024-10-28'
  },
  {
    id: '5',
    title: 'Reunió amb nou lead',
    description: 'Primera reunió amb potencial client del sector sanitari',
    type: 'meeting',
    priority: 'low',
    status: 'completed',
    dueDate: '2024-10-25',
    leadId: 'lead-004',
    leadName: 'Salut Digital',
    assignedTo: 'Maria García',
    createdDate: '2024-10-23',
    completedDate: '2024-10-25'
  }
];

export default function TasquesPage() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    return (
      (filterStatus === 'all' || task.status === filterStatus) &&
      (filterPriority === 'all' || task.priority === filterPriority) &&
      (filterType === 'all' || task.type === filterType)
    );
  });

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const statsData = [
    {
      label: 'Total Tasques',
      value: totalTasks.toString(),
      trend: '+3 aquesta setmana'
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
      trend: `${Math.round((completedTasks / totalTasks) * 100)}% del total`
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

  return (
    <PageTemplate
      title="Gestió de Tasques"
      subtitle="Organitza i fes seguiment de totes les tasques relacionades amb leads i empreses"
      statsData={statsData}
    >
      <div className="space-y-6">
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
                      text: 'Marcar com Completada',
                      onClick: () => console.log('Completar tasca:', task.id)
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

        {filteredTasks.length === 0 && (
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
      </div>
    </PageTemplate>
  );
}