'use client';

import { TaskStatus } from '@prisma/client';

interface Task {
  id: string;
  status: TaskStatus;
  dueDate?: Date | string;
  assignedTo: {
    id: string;
    name: string | null;
  };
}

interface TimelineMetricsProps {
  tasks: Task[];
}

export default function TimelineMetrics({ tasks }: TimelineMetricsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'COMPLETED') return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const atRiskTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'COMPLETED') return false;
    const dueDate = new Date(t.dueDate);
    const riskDate = new Date(today);
    riskDate.setDate(riskDate.getDate() + 2);
    return dueDate <= riskDate && dueDate >= today;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const uniqueManagers = new Set(tasks.map(t => t.assignedTo.id));
  const avgTasksPerManager = uniqueManagers.size > 0 ? Math.round(activeTasks / uniqueManagers.size) : 0;

  const overloadedManagers = tasks.reduce((acc, task) => {
    if (task.status !== 'COMPLETED' && task.status !== 'CANCELLED') {
      acc[task.assignedTo.id] = (acc[task.assignedTo.id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const managersOverloaded = Object.values(overloadedManagers).filter(count => count > 10).length;

  const metrics = [
    {
      title: 'Total Tareas',
      value: totalTasks.toString(),
      subtitle: `${activeTasks} activas`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📋'
    },
    {
      title: 'Completadas',
      value: `${completionRate}%`,
      subtitle: `${completedTasks} de ${totalTasks}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅'
    },
    {
      title: 'Vencidas',
      value: overdueTasks.toString(),
      subtitle: overdueTasks > 0 ? '¡Atención!' : 'Todo OK',
      color: overdueTasks > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: overdueTasks > 0 ? 'bg-red-50' : 'bg-green-50',
      icon: overdueTasks > 0 ? '⚠️' : '✓'
    },
    {
      title: 'En Riesgo',
      value: atRiskTasks.toString(),
      subtitle: 'Vencen en 2 días',
      color: atRiskTasks > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: atRiskTasks > 0 ? 'bg-orange-50' : 'bg-green-50',
      icon: atRiskTasks > 0 ? '⏰' : '👍'
    },
    {
      title: 'Carga Promedio',
      value: avgTasksPerManager.toString(),
      subtitle: 'tareas/gestor',
      color: avgTasksPerManager > 8 ? 'text-orange-600' : 'text-blue-600',
      bgColor: avgTasksPerManager > 8 ? 'bg-orange-50' : 'bg-blue-50',
      icon: '👥'
    },
    {
      title: 'Sobrecarga',
      value: managersOverloaded.toString(),
      subtitle: 'gestores >10 tareas',
      color: managersOverloaded > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: managersOverloaded > 0 ? 'bg-red-50' : 'bg-green-50',
      icon: managersOverloaded > 0 ? '🔥' : '✓'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          KPIs Ejecutivos - Timeline
        </h2>
        <div className="text-xs text-gray-500">
          {uniqueManagers.size} gestores activos
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${metric.bgColor} rounded-lg p-2 border border-opacity-20`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{metric.icon}</span>
              <div className={`text-right ${metric.color}`}>
                <div className="text-lg font-bold leading-none">{metric.value}</div>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-700 mb-0.5">
              {metric.title}
            </div>
            <div className="text-xs text-gray-500">
              {metric.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda compacta */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-gray-600">Urgente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <span className="text-gray-600">Alta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Media</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span className="text-gray-600">Baja</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">⚠️ Riesgo</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">⏰ Vencida</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">✓ Completada</span>
          </div>
        </div>
      </div>
    </div>
  );
}