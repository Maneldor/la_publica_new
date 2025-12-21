'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Building2 } from 'lucide-react'

interface ExperienceItem {
  id: string
  organization: string
  position: string
  department?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

interface Step5ExperienceProps {
  data: ExperienceItem[]
  onChange: (data: ExperienceItem[]) => void
}

export default function Step5Experience({ data, onChange }: Step5ExperienceProps) {
  const [items, setItems] = useState<ExperienceItem[]>(data || [])

  useEffect(() => {
    onChange(items)
  }, [items, onChange])

  const addItem = () => {
    const newItem: ExperienceItem = {
      id: Date.now().toString(),
      organization: '',
      position: '',
      department: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ExperienceItem, value: string | boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Experiència Professional</h3>
          <p className="text-sm text-gray-500">Trajectòria laboral de l&apos;usuari (opcional)</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Afegir Experiència
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Cap experiència afegida</p>
          <p className="text-sm text-gray-400">
            Fes clic a &quot;Afegir Experiència&quot; per afegir llocs de treball
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg relative"
            >
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pr-12 space-y-4">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Experiència {index + 1}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organització *
                    </label>
                    <input
                      type="text"
                      value={item.organization}
                      onChange={(e) => updateItem(item.id, 'organization', e.target.value)}
                      placeholder="Ajuntament de Barcelona"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Càrrec *
                    </label>
                    <input
                      type="text"
                      value={item.position}
                      onChange={(e) => updateItem(item.id, 'position', e.target.value)}
                      placeholder="Tècnic d'Administració General"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Departament
                  </label>
                  <input
                    type="text"
                    value={item.department || ''}
                    onChange={(e) => updateItem(item.id, 'department', e.target.value)}
                    placeholder="Gerència de Recursos Humans"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Data Inici
                    </label>
                    <input
                      type="month"
                      value={item.startDate}
                      onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Data Fi
                    </label>
                    <input
                      type="month"
                      value={item.endDate || ''}
                      onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                      disabled={item.current}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Actual</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripció
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Descripció de les responsabilitats i assoliments..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
