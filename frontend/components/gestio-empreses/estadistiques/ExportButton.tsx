'use client'

import { useState } from 'react'
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { exportStatisticsData, type StatisticsFilters } from '@/lib/gestio-empreses/statistics-actions'

interface ExportButtonProps {
  filters: StatisticsFilters
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function ExportButton({ filters, className, size = 'default' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(format)

    try {
      const blob = await exportStatisticsData(filters, format)

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generar nombre del archivo con fecha
      const date = new Date().toISOString().split('T')[0]
      const fileName = `estadistiques-${date}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      link.download = fileName

      // Ejecutar descarga
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Mostrar mensaje de éxito (opcional)
      // toast.success(`Estadístiques exportades en format ${format.toUpperCase()}`)

    } catch (error) {
      console.error('Error exportando estadístiques:', error)
      // toast.error('Error exportant les estadístiques')
    } finally {
      setIsExporting(null)
    }
  }

  const exportItems = [
    {
      format: 'pdf' as const,
      label: 'Exportar PDF',
      description: 'Informe complet amb gràfics',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      format: 'excel' as const,
      label: 'Exportar Excel',
      description: 'Dades en format spreadsheet',
      icon: Table,
      color: 'text-green-600'
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            'gap-2 hover:bg-slate-50',
            className
          )}
          disabled={isExporting !== null}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Download className="h-4 w-4" strokeWidth={1.5} />
          )}
          <span className="hidden sm:inline">
            {isExporting
              ? `Exportant ${isExporting.toUpperCase()}...`
              : 'Exportar'
            }
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Opcions d'exportació
        </div>
        <DropdownMenuSeparator />

        {exportItems.map((item) => {
          const Icon = item.icon
          const isLoading = isExporting === item.format

          return (
            <DropdownMenuItem
              key={item.format}
              onClick={() => handleExport(item.format)}
              disabled={isExporting !== null}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  'w-8 h-8 rounded flex items-center justify-center',
                  item.format === 'pdf' ? 'bg-red-100' : 'bg-green-100'
                )}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" strokeWidth={1.5} />
                  ) : (
                    <Icon className={cn('h-4 w-4', item.color)} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <div className="px-3 py-2">
          <div className="text-xs text-slate-500">
            📊 Inclou totes les dades del període seleccionat
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Componente adicional para exportación rápida con botones separados
interface QuickExportButtonsProps {
  filters: StatisticsFilters
  className?: string
}

export function QuickExportButtons({ filters, className }: QuickExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(format)

    try {
      const blob = await exportStatisticsData(filters, format)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const date = new Date().toISOString().split('T')[0]
      const fileName = `estadistiques-${date}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      link.download = fileName

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exportando estadístiques:', error)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting !== null}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <FileText className="h-4 w-4" strokeWidth={1.5} />
        )}
        <span className="hidden sm:inline ml-2">PDF</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('excel')}
        disabled={isExporting !== null}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        {isExporting === 'excel' ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <Table className="h-4 w-4" strokeWidth={1.5} />
        )}
        <span className="hidden sm:inline ml-2">Excel</span>
      </Button>
    </div>
  )
}