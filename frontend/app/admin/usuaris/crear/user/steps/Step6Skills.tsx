'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Sparkles, X } from 'lucide-react'

interface SkillItem {
  id: string
  name: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  category: string
}

interface Step6SkillsProps {
  data: SkillItem[]
  onChange: (data: SkillItem[]) => void
}

const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Tècniques' },
  { value: 'administrative', label: 'Administratives' },
  { value: 'management', label: 'Gestió' },
  { value: 'communication', label: 'Comunicació' },
  { value: 'digital', label: 'Digitals' },
  { value: 'legal', label: 'Jurídiques' },
  { value: 'other', label: 'Altres' }
]

const SKILL_LEVELS = [
  { value: 'basic', label: 'Bàsic', color: 'bg-gray-200 text-gray-700' },
  { value: 'intermediate', label: 'Intermedi', color: 'bg-blue-200 text-blue-700' },
  { value: 'advanced', label: 'Avançat', color: 'bg-green-200 text-green-700' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-200 text-purple-700' }
]

const SUGGESTED_SKILLS = [
  'Gestió de projectes',
  'Contractació pública',
  'Procediment administratiu',
  'Atenció ciutadana',
  'Excel avançat',
  'Anàlisi de dades',
  'Comunicació institucional',
  'Tramitació electrònica',
  'Normativa local',
  'Pressupostos públics'
]

export default function Step6Skills({ data, onChange }: Step6SkillsProps) {
  const [items, setItems] = useState<SkillItem[]>(data || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'intermediate' as SkillItem['level'],
    category: 'technical'
  })

  useEffect(() => {
    onChange(items)
  }, [items, onChange])

  const addSkill = () => {
    if (!newSkill.name.trim()) return

    const skill: SkillItem = {
      id: Date.now().toString(),
      ...newSkill
    }
    setItems(prev => [...prev, skill])
    setNewSkill({ name: '', level: 'intermediate', category: 'technical' })
    setShowAddForm(false)
  }

  const addSuggestedSkill = (skillName: string) => {
    if (items.some(s => s.name.toLowerCase() === skillName.toLowerCase())) return

    const skill: SkillItem = {
      id: Date.now().toString(),
      name: skillName,
      level: 'intermediate',
      category: 'technical'
    }
    setItems(prev => [...prev, skill])
  }

  const removeSkill = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateSkillLevel = (id: string, level: SkillItem['level']) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, level } : item
      )
    )
  }

  const getLevelInfo = (level: SkillItem['level']) => {
    return SKILL_LEVELS.find(l => l.value === level) || SKILL_LEVELS[1]
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Habilitats i Competències</h3>
          <p className="text-sm text-gray-500">Competències professionals de l&apos;usuari (opcional)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Afegir Habilitat
        </button>
      </div>

      {/* Formulario para añadir */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Nova Habilitat</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom *
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Gestió de projectes"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nivell
              </label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as SkillItem['level'] }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              >
                {SKILL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Categoria
              </label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              >
                {SKILL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={addSkill}
              disabled={!newSkill.name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Afegir
            </button>
          </div>
        </div>
      )}

      {/* Habilidades añadidas */}
      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl mb-6">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Cap habilitat afegida</p>
          <p className="text-sm text-gray-400">
            Selecciona de les suggerències o afegeix les teves pròpies
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6">
          {items.map(item => {
            const levelInfo = getLevelInfo(item.level)
            return (
              <div
                key={item.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full"
              >
                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                <select
                  value={item.level}
                  onChange={(e) => updateSkillLevel(item.id, e.target.value as SkillItem['level'])}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 ${levelInfo.color} cursor-pointer`}
                >
                  {SKILL_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Sugerencias */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggerències</h4>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.filter(skill =>
            !items.some(s => s.name.toLowerCase() === skill.toLowerCase())
          ).map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => addSuggestedSkill(skill)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
