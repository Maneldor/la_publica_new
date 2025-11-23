'use client';

import { useState } from 'react';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date | string;
  dueDate?: Date | string;
  company?: { name: string } | null;
  lead?: { companyName: string } | null;
}

interface Manager {
  id: string;
  name: string | null;
  email: string;
}

interface ManagerRowProps {
  manager: Manager;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  timelineStart: Date;
  timelineEnd: Date;
  weekWidth: number;
}

export default function ManagerRow({
  manager,
  tasks,
  onTaskClick,
  timelineStart,
  timelineEnd,
  weekWidth
}: ManagerRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const occupationPercentage = Math.min((activeTasks.length / 8) * 100, 100);

  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      URGENT: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-green-500'
    };
    return colors[priority];
  };

  const getStatusIcon = (status: TaskStatus, dueDate?: Date | string) => {
    if (status === 'COMPLETED') return '✓';
    if (status === 'IN_PROGRESS') return '●';

    if (dueDate) {
      const today = new Date();
      const due = new Date(dueDate);
      if (due < today) return '⏰';

      const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 2) return '⚠️';
    }

    return '';
  };

  const getTaskPosition = (task: Task) => {
    const createdDate = new Date(task.createdAt);
    const dueDate = task.dueDate ? new Date(task.dueDate) : new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startOffset = Math.max(0, createdDate.getTime() - timelineStart.getTime());
    const endOffset = Math.min(timelineEnd.getTime() - timelineStart.getTime(), dueDate.getTime() - timelineStart.getTime());

    const left = (startOffset / timelineDuration) * 100;
    const width = Math.max(2, ((endOffset - startOffset) / timelineDuration) * 100);

    return { left, width };
  };

  const getProgressPercentage = (task: Task) => {
    if (task.status === 'COMPLETED') return 100;
    if (task.status === 'IN_PROGRESS') return 60;
    if (task.status === 'WAITING') return 30;
    return 10;
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Header del gestor */}
      <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {(manager.name || manager.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">
                {manager.name || manager.email.split('@')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {activeTasks.length} activas • {completedTasks.length} completadas
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicador de ocupación */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  occupationPercentage > 80 ? 'bg-red-500' :
                  occupationPercentage > 60 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${occupationPercentage}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ${
              occupationPercentage > 80 ? 'text-red-600' :
              occupationPercentage > 60 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {Math.round(occupationPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Timeline de tareas */}
      {isExpanded && (
        <div className="relative h-20 bg-white overflow-hidden">
          {/* Grid de fondo (semanas) */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) }, (_, i) => (
              <div
                key={i}
                className="border-r border-gray-100 flex-shrink-0"
                style={{ width: `${weekWidth}%` }}
              ></div>
            ))}
          </div>

          {/* Línea "HOY" */}
          {(() => {
            const today = new Date();
            if (today >= timelineStart && today <= timelineEnd) {
              const todayOffset = ((today.getTime() - timelineStart.getTime()) / timelineDuration) * 100;
              return (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                  style={{ left: `${todayOffset}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              );
            }
          })()}

          {/* Tareas como barras */}
          <div className="absolute inset-0 p-2">
            {tasks.slice(0, 4).map((task, index) => {
              const { left, width } = getTaskPosition(task);
              const progressPercentage = getProgressPercentage(task);

              return (
                <div
                  key={task.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${8 + index * 16}px`,
                    height: '14px'
                  }}
                  onClick={() => onTaskClick(task.id)}
                  title={`${task.title} - ${task.company?.name || task.lead?.companyName || 'Sin empresa'}`}
                >
                  {/* Barra de fondo */}
                  <div className={`w-full h-full ${getPriorityColor(task.priority)} rounded opacity-60 group-hover:opacity-80`}></div>

                  {/* Barra de progreso */}
                  <div
                    className={`absolute top-0 left-0 h-full ${getPriorityColor(task.priority)} rounded transition-all`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>

                  {/* Texto de la tarea */}
                  <div className="absolute inset-0 flex items-center justify-between px-1 text-white">
                    <span className="text-xs font-medium truncate">
                      {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                    </span>
                    <span className="text-xs">
                      {getStatusIcon(task.status, task.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Indicador de más tareas */}
            {tasks.length > 4 && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                +{tasks.length - 4} más
              </div>
            )}
          </div>

          {/* Tooltip en hover */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Aquí se pueden añadir tooltips más elaborados si es necesario */}
          </div>
        </div>
      )}
    </div>
  );
}