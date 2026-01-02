'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Heart, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { GratitudeIcon } from '@/components/icons'

interface Gratitude {
  id: string
  date: string
  item1?: string
  item2?: string
  item3?: string
}

interface AgraïmentsModuleProps {
  onClose?: () => void
}

export function AgraïmentsModule({ onClose }: AgraïmentsModuleProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [gratitude, setGratitude] = useState<Gratitude | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState(['', '', ''])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadGratitude()
  }, [currentDate])

  const loadGratitude = async () => {
    setIsLoading(true)
    try {
      const dateStr = currentDate.toISOString().split('T')[0]
      const res = await fetch(`/api/agenda/gratitudes?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        setGratitude(data)
        setItems([data.item1 || '', data.item2 || '', data.item3 || ''])
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error carregant agraïments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveGratitude = async () => {
    setIsSaving(true)
    try {
      const dateStr = currentDate.toISOString().split('T')[0]
      await fetch('/api/agenda/gratitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          item1: items[0] || null,
          item2: items[1] || null,
          item3: items[2] || null
        })
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error guardant agraïments:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
    setHasChanges(true)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))

    // No permitir fechas futuras
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

  const filledCount = items.filter(item => item.trim()).length

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
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
          <GratitudeIcon size="md" />
          <h3 className="font-semibold text-gray-900">Agraïments</h3>
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

      {/* Items de gratitud */}
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                items[index].trim()
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {items[index].trim() ? (
                  <Heart className="w-3 h-3" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <input
                type="text"
                value={items[index]}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`Estic agraït/da per...`}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < filledCount ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {filledCount}/3
          </span>
        </div>

        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={saveGratitude}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              'Guardant...'
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Guardar
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
