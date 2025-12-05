'use client'

import { useState } from 'react'
import { Download, FileText, File, Table } from 'lucide-react'

interface LeadExportProps {
  totalItems: number
  onExport: (format: 'csv' | 'excel' | 'pdf') => void
}

export function LeadExport({ totalItems, onExport }: LeadExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    try {
      await onExport(format)
    } catch (error) {
      console.error('Error exporting leads:', error)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <Download className="h-4 w-4" strokeWidth={1.5} />
        {isExporting ? 'Exportant...' : 'Exportar'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg">
            <div className="p-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">Exportar Leads</p>
              <p className="text-xs text-slate-500">{totalItems} resultats</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-3 w-full p-2 text-left text-sm text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <File className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-slate-500">Compatible amb Excel, Google Sheets</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="flex items-center gap-3 w-full p-2 text-left text-sm text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <Table className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">Excel</p>
                  <p className="text-xs text-slate-500">Fitxer .xlsx amb format</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center gap-3 w-full p-2 text-left text-sm text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 text-red-600" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">PDF</p>
                  <p className="text-xs text-slate-500">Document per imprimir</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}