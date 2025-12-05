// components/gestio-empreses/tasques/TaskHeader.tsx
'use client'

import { useState } from 'react'
import { CheckSquare, Plus, FileText, Download } from 'lucide-react'
import { TaskModal } from './TaskModal'
import { TaskTemplateWizard } from './TaskTemplateWizard'
import { TaskExportModal } from './TaskExportModal'

interface TaskHeaderProps {
  onRefresh: () => void
  tasks?: any[]
}

export function TaskHeader({ onRefresh, tasks = [] }: TaskHeaderProps) {
  const [showModal, setShowModal] = useState(false)
  const [showTemplateWizard, setShowTemplateWizard] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
              Task Management Enterprise
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sistema de gestió empresarial completa de tasques, workflows i automatitzacions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplateWizard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" strokeWidth={1.5} />
              Plantilla
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              <Download className="h-4 w-4" strokeWidth={1.5} />
              Exportar
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nova Tasca
            </button>
          </div>
        </div>
      </div>

      {/* Modal Nova Tasca */}
      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            onRefresh()
          }}
        />
      )}

      {/* Wizard Plantilles */}
      {showTemplateWizard && (
        <TaskTemplateWizard
          onClose={() => setShowTemplateWizard(false)}
          onTaskCreated={onRefresh}
        />
      )}

      {/* Modal Exportar */}
      {showExportModal && (
        <TaskExportModal
          tasks={tasks}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  )
}