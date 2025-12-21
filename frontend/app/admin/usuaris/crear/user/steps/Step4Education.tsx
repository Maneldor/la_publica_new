'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GraduationCap } from 'lucide-react'

interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear?: string
  current: boolean
}

interface Step4EducationProps {
  data: EducationItem[]
  onChange: (data: EducationItem[]) => void
}

export default function Step4Education({ data, onChange }: Step4EducationProps) {
  const [items, setItems] = useState<EducationItem[]>(data || [])

  useEffect(() => {
    onChange(items)
  }, [items, onChange])

  const addItem = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof EducationItem, value: string | boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Formació Acadèmica</h3>
          <p className="text-sm text-gray-500">Estudis i certificacions de l&apos;usuari (opcional)</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Afegir Formació
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Cap formació afegida</p>
          <p className="text-sm text-gray-400">
            Fes clic a &quot;Afegir Formació&quot; per afegir estudis
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
                  Formació {index + 1}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Institució *
                    </label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => updateItem(item.id, 'institution', e.target.value)}
                      placeholder="Universitat de Barcelona"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Titulació *
                    </label>
                    <select
                      value={item.degree}
                      onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Selecciona...</option>
                      <option value="grau">Grau</option>
                      <option value="llicenciatura">Llicenciatura</option>
                      <option value="diplomatura">Diplomatura</option>
                      <option value="master">Màster</option>
                      <option value="postgrau">Postgrau</option>
                      <option value="doctorat">Doctorat</option>
                      <option value="fp_superior">FP Superior</option>
                      <option value="fp_mitja">FP Mitjà</option>
                      <option value="certificat">Certificat</option>
                      <option value="altres">Altres</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Camp d&apos;Estudi
                  </label>
                  <input
                    type="text"
                    value={item.field}
                    onChange={(e) => updateItem(item.id, 'field', e.target.value)}
                    placeholder="Administració Pública, Dret, Economia..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Any Inici
                    </label>
                    <select
                      value={item.startYear}
                      onChange={(e) => updateItem(item.id, 'startYear', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Selecciona...</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Any Fi
                    </label>
                    <select
                      value={item.endYear || ''}
                      onChange={(e) => updateItem(item.id, 'endYear', e.target.value)}
                      disabled={item.current}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                    >
                      <option value="">Selecciona...</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">En curs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
