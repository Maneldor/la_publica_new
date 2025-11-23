'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface TaskKanbanViewProps {
  tasks: any[];
  onOpenDetail: (id: string) => void;
  onUpdateTask: (id: string, updates: any) => Promise<void>;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  icon: string;
}

const columns: Column[] = [
  {
    id: 'PENDING',
    title: 'Pendents',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'IN_PROGRESS',
    title: 'En Progrés',
    color: 'bg-blue-100 border-blue-300 text-blue-700',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    id: 'WAITING',
    title: 'Esperant',
    color: 'bg-purple-100 border-purple-300 text-purple-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'COMPLETED',
    title: 'Completades',
    color: 'bg-green-100 border-green-300 text-green-700',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

export default function TaskKanbanView({
  tasks,
  onOpenDetail,
  onUpdateTask,
}: TaskKanbanViewProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      URGENT: 'border-l-4 border-l-red-500',
      HIGH: 'border-l-4 border-l-orange-500',
      MEDIUM: 'border-l-4 border-l-yellow-500',
      LOW: 'border-l-4 border-l-green-500',
    };
    return colors[priority];
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const badges = {
      URGENT: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-green-100 text-green-700',
    };
    const labels = {
      URGENT: 'Urgent',
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baixa',
    };
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const isOverdue = d < today;
    const formattedDate = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    return (
      <span className={`text-[10px] ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
        {isOverdue && '⚠️ '}
        {formattedDate}
      </span>
    );
  };

  const handleDragStart = (result: any) => {
    setDraggingTaskId(result.draggableId);
  };

  const handleDragEnd = async (result: DropResult) => {
    setDraggingTaskId(null);

    const { destination, source, draggableId } = result;

    // No se movió o se soltó fuera
    if (!destination) return;

    // Se soltó en la misma posición
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Cambiar estado de la tarea
    const newStatus = destination.droppableId as TaskStatus;

    try {
      await onUpdateTask(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al mover la tarea');
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-2 h-[calc(100vh-400px)] overflow-x-hidden pb-2">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div
              key={column.id}
              className="flex-1 min-w-0 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Header de columna */}
              <div className={`px-3 py-2 border-b-2 ${column.color} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={column.icon}
                      />
                    </svg>
                    <h3 className="font-semibold text-xs">{column.title}</h3>
                  </div>
                  <span className="px-1.5 py-0.5 bg-white rounded-full text-xs font-semibold">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Lista de tareas */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 space-y-2 min-h-[200px] overflow-y-auto max-h-[calc(100vh-500px)] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {columnTasks.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400">No hi ha tasques</p>
                      </div>
                    )}

                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => !snapshot.isDragging && onOpenDetail(task.id)}
                            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 cursor-pointer hover:shadow-md transition-shadow ${
                              getPriorityColor(task.priority)
                            } ${
                              snapshot.isDragging
                                ? 'shadow-2xl rotate-2 opacity-90'
                                : ''
                            }`}
                          >
                            {/* Título */}
                            <h4 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                              {task.title}
                            </h4>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-1">
                              {getPriorityBadge(task.priority)}
                              {task.tags && task.tags.slice(0, 1).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                                >
                                  {tag.length > 8 ? tag.slice(0, 8) + '...' : tag}
                                </span>
                              ))}
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-1 border-t border-gray-100">
                              {/* Asignado */}
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-medium">
                                  {task.assignedTo?.name?.[0] || '?'}
                                </div>
                              </div>

                              {/* Fecha límite */}
                              {task.dueDate && formatDate(task.dueDate)}
                            </div>

                            {/* Score */}
                            {task.autoScore > 0 && (
                              <div className="mt-1 pt-1 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-500">Score:</span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      task.autoScore >= 80
                                        ? 'text-red-600'
                                        : task.autoScore >= 60
                                        ? 'text-orange-600'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {task.autoScore}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Indicador de comentarios/subtareas */}
                            {(task._count?.comments > 0 || task._count?.subtasks > 0) && (
                              <div className="flex gap-2 mt-1 pt-1 border-t border-gray-100">
                                {task._count?.comments > 0 && (
                                  <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                      />
                                    </svg>
                                    {task._count.comments}
                                  </div>
                                )}
                                {task._count?.subtasks > 0 && (
                                  <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                    {task._count.subtasks}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}