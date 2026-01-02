'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, ChevronLeft, ChevronRight, ThumbsUp, AlertCircle, Lightbulb } from 'lucide-react'
import { ConclusionsIcon } from '@/components/icons'

interface Conclusion {
  id: string
  date: string
  type: string
  whatWentWell?: string
  whatToImprove?: string
  lessonsLearned?: string
}

interface ConclusionsModuleProps {
  onClose?: () => void
}

export function ConclusionsModule({ onClose }: ConclusionsModuleProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [conclusion, setConclusion] = useState<Conclusion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatToImprove, setWhatToImprove] = useState('')
  const [lessonsLearned, setLessonsLearned] = useState('')

  useEffect(() => {
    loadConclusion()
  }, [currentDate])

  const loadConclusion = async () => {
    setIsLoading(true)
    try {
      const dateStr = currentDate.toISOString().split('T')[0]
      const res = await fetch(`/api/agenda/conclusions?date=${dateStr}&type=daily`)
      if (res.ok) {
        const data = await res.json()
        setConclusion(data)
        setWhatWentWell(data.whatWentWell || '')
        setWhatToImprove(data.whatToImprove || '')
        setLessonsLearned(data.lessonsLearned || '')
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error carregant conclusions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveConclusion = async () => {
    setIsSaving(true)
    try {
      const dateStr = currentDate.toISOString().split('T')[0]
      await fetch('/api/agenda/conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          type: 'daily',
          whatWentWell: whatWentWell || null,
          whatToImprove: whatToImprove || null,
          lessonsLearned: lessonsLearned || null
        })
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error guardant conclusions:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    if (newDate <= new Date()) {
      setCurrentDate(newDate)
    }
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }
    return date.toLocaleDateString('ca-ES', options)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ConclusionsIcon size="md" />
          <h3 className="font-semibold text-gray-900">Conclusions del dia</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDate('prev')}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm text-gray-600 capitalize">
          {isToday ? 'Avui' : formatDate(currentDate)}
        </span>
        <button
          onClick={() => navigateDate('next')}
          disabled={isToday}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        {/* Qué ha anat bé */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            Què ha anat bé?
          </label>
          <textarea
            value={whatWentWell}
            onChange={(e) => { setWhatWentWell(e.target.value); setHasChanges(true) }}
            placeholder="Les coses positives del dia..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
            rows={2}
          />
        </div>

        {/* Què puc millorar */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Què puc millorar?
          </label>
          <textarea
            value={whatToImprove}
            onChange={(e) => { setWhatToImprove(e.target.value); setHasChanges(true) }}
            placeholder="Aspectes a treballar..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
            rows={2}
          />
        </div>

        {/* Lliçons apreses */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            Lliçons apreses
          </label>
          <textarea
            value={lessonsLearned}
            onChange={(e) => { setLessonsLearned(e.target.value); setHasChanges(true) }}
            placeholder="Què he après avui..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
            rows={2}
          />
        </div>
      </div>

      {/* Footer */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-end"
        >
          <button
            onClick={saveConclusion}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              'Guardant...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}
