// components/gestio-empreses/tasques/TaskExportModal.tsx
'use client'

import { useState } from 'react'
import { X, Download, Calendar, FileText, Filter, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface TaskExportModalProps {
  tasks: Task[]
  onClose: () => void
}

interface ExportFilters {
  status: string[]
  priority: string[]
  dateRange: 'all' | 'thisWeek' | 'thisMonth' | 'custom'
  customStartDate: string
  customEndDate: string
  includeCompleted: boolean
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendent' },
  { value: 'IN_PROGRESS', label: 'En progrés' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancel·lada' }
]

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Mitjana' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgent' }
]

const dateRangeOptions = [
  { value: 'all', label: 'Totes les dates' },
  { value: 'thisWeek', label: 'Aquesta setmana' },
  { value: 'thisMonth', label: 'Aquest mes' },
  { value: 'custom', label: 'Rang personalitzat' }
]

export function TaskExportModal({ tasks, onClose }: TaskExportModalProps) {
  const [filters, setFilters] = useState<ExportFilters>({
    status: ['PENDING', 'IN_PROGRESS'],
    priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    includeCompleted: false
  })

  const [isExporting, setIsExporting] = useState(false)

  const applyFilters = (tasks: Task[]): Task[] => {
    let filtered = tasks

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status))
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }

    // Filter by date range
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (filters.dateRange) {
      case 'thisWeek':
        filtered = filtered.filter(task =>
          task.dueDate && new Date(task.dueDate) >= startOfWeek
        )
        break
      case 'thisMonth':
        filtered = filtered.filter(task =>
          task.dueDate && new Date(task.dueDate) >= startOfMonth
        )
        break
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          const startDate = new Date(filters.customStartDate)
          const endDate = new Date(filters.customEndDate)
          filtered = filtered.filter(task =>
            task.dueDate &&
            new Date(task.dueDate) >= startDate &&
            new Date(task.dueDate) <= endDate
          )
        }
        break
    }

    // Filter completed tasks
    if (!filters.includeCompleted) {
      filtered = filtered.filter(task => task.status !== 'COMPLETED')
    }

    return filtered
  }

  const filteredTasks = applyFilters(tasks)

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const handlePriorityChange = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }))
  }

  const convertTasksToCSV = (tasks: Task[]): string => {
    const headers = [
      'ID',
      'Títol',
      'Descripció',
      'Prioritat',
      'Estat',
      'Data límit',
      'Data completada',
      'Data creació',
      'Client/Lead',
      'Empresa'
    ]

    const rows = tasks.map(task => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      task.description ? `"${task.description.replace(/"/g, '""')}"` : '',
      task.priority,
      task.status,
      task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm', { locale: ca }) : '',
      task.completedAt ? format(new Date(task.completedAt), 'yyyy-MM-dd HH:mm', { locale: ca }) : '',
      format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm', { locale: ca }),
      task.lead ? `"${task.lead.companyName.replace(/"/g, '""')}"` : '',
      task.company ? `"${task.company.name.replace(/"/g, '""')}"` : ''
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const csvContent = convertTasksToCSV(filteredTasks)
      const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `tasques_export_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Error exportant CSV:', error)
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Download className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              Exportar Tasques
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Exporta les tasques a format CSV amb filtres personalitzats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
                <Filter className="h-4 w-4" strokeWidth={1.5} />
                Estats a incloure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => handleStatusChange(option.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Prioritats a incloure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(option.value)}
                      onChange={() => handlePriorityChange(option.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                Rang de dates
              </label>
              <div className="space-y-3">
                {dateRangeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateRange"
                      value={option.value}
                      checked={filters.dateRange === option.value}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}

                {filters.dateRange === 'custom' && (
                  <div className="ml-6 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Data inici</label>
                      <input
                        type="date"
                        value={filters.customStartDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, customStartDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Data final</label>
                      <input
                        type="date"
                        value={filters.customEndDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, customEndDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includeCompleted}
                  onChange={(e) => setFilters(prev => ({ ...prev, includeCompleted: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Incloure tasques completades</span>
              </label>
            </div>

            {/* Preview */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                Previsualització
              </h4>
              <p className="text-sm text-slate-600">
                S'exportaran <span className="font-medium text-slate-900">{filteredTasks.length}</span> tasques
                de {tasks.length} totals.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format: CSV amb codificació UTF-8 compatible amb Excel
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredTasks.length === 0}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Exportant...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Exportar CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}