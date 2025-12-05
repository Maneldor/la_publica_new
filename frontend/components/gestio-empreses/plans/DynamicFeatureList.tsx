'use client'

import { useState } from 'react'
import { Plus, X, GripVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  id: string
  text: string
}

interface DynamicFeatureListProps {
  features: Feature[]
  onChange: (features: Feature[]) => void
  placeholder?: string
  maxFeatures?: number
}

export function DynamicFeatureList({
  features,
  onChange,
  placeholder = "Escriu una funcionalitat...",
  maxFeatures = 20
}: DynamicFeatureListProps) {
  const [newFeatureText, setNewFeatureText] = useState('')

  const addFeature = () => {
    if (!newFeatureText.trim()) return
    if (features.length >= maxFeatures) return

    const newFeature: Feature = {
      id: crypto.randomUUID(),
      text: newFeatureText.trim()
    }

    onChange([...features, newFeature])
    setNewFeatureText('')
  }

  const removeFeature = (id: string) => {
    onChange(features.filter(f => f.id !== id))
  }

  const updateFeature = (id: string, text: string) => {
    onChange(features.map(f =>
      f.id === id ? { ...f, text } : f
    ))
  }

  const moveFeature = (fromIndex: number, toIndex: number) => {
    const newFeatures = [...features]
    const [movedFeature] = newFeatures.splice(fromIndex, 1)
    newFeatures.splice(toIndex, 0, movedFeature)
    onChange(newFeatures)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Funcionalitats del pla
        </label>
        <span className="text-xs text-slate-500">
          {features.length}/{maxFeatures}
        </span>
      </div>

      {/* Lista de funcionalitats existents */}
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group hover:border-slate-300 transition-colors"
          >
            <GripVertical
              className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
              strokeWidth={1.5}
            />
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={feature.text}
              onChange={(e) => updateFeature(feature.id, e.target.value)}
              className="flex-1 text-sm text-slate-700 bg-transparent border-none outline-none focus:ring-0"
              placeholder="Funcionalitat..."
            />
            <button
              onClick={() => removeFeature(feature.id)}
              className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      {/* Afegir nova funcionalitat */}
      {features.length < maxFeatures && (
        <div className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
          <Plus className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={newFeatureText}
            onChange={(e) => setNewFeatureText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 text-sm text-slate-700 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-400"
          />
          <button
            onClick={addFeature}
            disabled={!newFeatureText.trim()}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              newFeatureText.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Afegir
          </button>
        </div>
      )}

      {features.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <Check className="h-8 w-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm">No hi ha funcionalitats afegides</p>
          <p className="text-xs">Afegeix funcionalitats per descriure el pla</p>
        </div>
      )}
    </div>
  )
}