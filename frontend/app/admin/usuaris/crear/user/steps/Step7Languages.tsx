'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Languages as LanguagesIcon } from 'lucide-react'

interface LanguageItem {
  id: string
  language: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native'
}

interface Step7LanguagesProps {
  data: LanguageItem[]
  onChange: (data: LanguageItem[]) => void
}

const LANGUAGES = [
  { value: 'catala', label: 'Català' },
  { value: 'castella', label: 'Castellà' },
  { value: 'angles', label: 'Anglès' },
  { value: 'frances', label: 'Francès' },
  { value: 'alemany', label: 'Alemany' },
  { value: 'italia', label: 'Italià' },
  { value: 'portugues', label: 'Portuguès' },
  { value: 'aranès', label: 'Aranès' },
  { value: 'xinès', label: 'Xinès' },
  { value: 'àrab', label: 'Àrab' },
  { value: 'rus', label: 'Rus' },
  { value: 'japonès', label: 'Japonès' },
  { value: 'altres', label: 'Altres' }
]

const LEVELS = [
  { value: 'A1', label: 'A1 - Principiant', description: 'Nivell bàsic' },
  { value: 'A2', label: 'A2 - Elemental', description: 'Comunicació bàsica' },
  { value: 'B1', label: 'B1 - Intermedi', description: 'Comunicació independent' },
  { value: 'B2', label: 'B2 - Intermedi Alt', description: 'Fluïdesa funcional' },
  { value: 'C1', label: 'C1 - Avançat', description: 'Domini efectiu' },
  { value: 'C2', label: 'C2 - Competent', description: 'Domini excel·lent' },
  { value: 'native', label: 'Natiu', description: 'Llengua materna' }
]

const getLevelColor = (level: string): string => {
  switch (level) {
    case 'A1':
    case 'A2':
      return 'bg-gray-200 text-gray-700'
    case 'B1':
    case 'B2':
      return 'bg-blue-200 text-blue-700'
    case 'C1':
    case 'C2':
      return 'bg-green-200 text-green-700'
    case 'native':
      return 'bg-purple-200 text-purple-700'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

export default function Step7Languages({ data, onChange }: Step7LanguagesProps) {
  const [items, setItems] = useState<LanguageItem[]>(data || [])

  useEffect(() => {
    onChange(items)
  }, [items, onChange])

  const addItem = () => {
    const newItem: LanguageItem = {
      id: Date.now().toString(),
      language: '',
      level: 'B1'
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof LanguageItem, value: string) => {
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
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Idiomes</h3>
          <p className="text-sm text-gray-500">Llengües i nivells de l&apos;usuari (opcional)</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Afegir Idioma
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <LanguagesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Cap idioma afegit</p>
          <p className="text-sm text-gray-400">
            Fes clic a &quot;Afegir Idioma&quot; per afegir llengües
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Idioma {index + 1}
                  </label>
                  <select
                    value={item.language}
                    onChange={(e) => updateItem(item.id, 'language', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  >
                    <option value="">Selecciona idioma...</option>
                    {LANGUAGES.map(lang => (
                      <option
                        key={lang.value}
                        value={lang.value}
                        disabled={items.some(i => i.id !== item.id && i.language === lang.value)}
                      >
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nivell
                  </label>
                  <select
                    value={item.level}
                    onChange={(e) => updateItem(item.id, 'level', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  >
                    {LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badge del nivel */}
              <div className="hidden md:block">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelColor(item.level)}`}>
                  {item.level === 'native' ? 'Natiu' : item.level}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda de niveles */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Marc Europeu Comú de Referència (MECR)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><span className="font-medium">A1-A2:</span> Usuari bàsic</div>
          <div><span className="font-medium">B1-B2:</span> Usuari independent</div>
          <div><span className="font-medium">C1-C2:</span> Usuari competent</div>
          <div><span className="font-medium">Natiu:</span> Llengua materna</div>
        </div>
      </div>
    </div>
  )
}
