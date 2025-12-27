'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Log {
  id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'
  topicType: 'FIXED' | 'DYNAMIC' | null
  topicUsed: string | null
  subtopicGenerated: string | null
  postId: string | null
  postTitle: string | null
  errorMessage: string | null
  executionTime: number | null
  createdAt: string
}

interface ScheduleLogsModalProps {
  scheduleId: string
  onClose: () => void
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendent', color: 'bg-gray-100 text-gray-700', icon: Clock },
  RUNNING: { label: 'Executant', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  SUCCESS: { label: 'Correcte', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  FAILED: { label: 'Error', color: 'bg-red-100 text-red-700', icon: XCircle },
  SKIPPED: { label: 'Saltat', color: 'bg-amber-100 text-amber-700', icon: Clock }
}

export default function ScheduleLogsModal({ scheduleId, onClose }: ScheduleLogsModalProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)

  useEffect(() => {
    loadLogs()
  }, [scheduleId])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}`)
      const data = await res.json()
      if (res.ok && data.recentLogs) {
        setLogs(data.recentLogs)
      }
    } catch (error) {
      console.error('Error carregant logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial d&apos;execucions
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadLogs}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-gray-500">Carregant historial...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Cap execució registrada encara</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const StatusIcon = STATUS_CONFIG[log.status].icon
                  const isExpanded = selectedLog?.id === log.id

                  return (
                    <div
                      key={log.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setSelectedLog(isExpanded ? null : log)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          log.status === 'SUCCESS' ? 'bg-green-100' :
                          log.status === 'FAILED' ? 'bg-red-100' :
                          log.status === 'RUNNING' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            log.status === 'SUCCESS' ? 'text-green-600' :
                            log.status === 'FAILED' ? 'text-red-600' :
                            log.status === 'RUNNING' ? 'text-blue-600 animate-spin' :
                            'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[log.status].color}`}>
                              {STATUS_CONFIG[log.status].label}
                            </span>
                            {log.topicType && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">
                                {log.topicType === 'FIXED' ? 'Tema fix' : 'Tema dinàmic'}
                              </span>
                            )}
                            {log.executionTime && (
                              <span className="text-xs text-gray-400">
                                {Math.round(log.executionTime / 1000)}s
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.postTitle || log.topicUsed || 'Execució sense tema'}
                          </p>

                          {log.subtopicGenerated && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Subtema: {log.subtopicGenerated}
                            </p>
                          )}

                          {log.errorMessage && (
                            <p className="text-xs text-red-500 mt-1 truncate">
                              {log.errorMessage}
                            </p>
                          )}

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.createdAt).toLocaleString('ca-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {log.postId && (
                          <Link
                            href={`/gestio/contingut/blog/${log.postId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <FileText className="w-4 h-4" />
                            Veure article
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tema utilitzat</p>
                              <p className="text-gray-900">{log.topicUsed || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Subtema generat</p>
                              <p className="text-gray-900">{log.subtopicGenerated || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Títol de l&apos;article</p>
                              <p className="text-gray-900">{log.postTitle || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Temps d&apos;execució</p>
                              <p className="text-gray-900">
                                {log.executionTime ? `${(log.executionTime / 1000).toFixed(2)}s` : '-'}
                              </p>
                            </div>
                          </div>
                          {log.errorMessage && (
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Missatge d&apos;error</p>
                              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg whitespace-pre-wrap">
                                {log.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Mostrant {logs.length} execucions</span>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
