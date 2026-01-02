'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CalendarDays,
  Target,
  TrendingUp,
  MessageSquare,
  Trophy,
  Heart,
  FileText,
  BookOpen,
  Plane,
  Triangle,
  Pill,
  Eye,
  Lock,
  RotateCcw,
  Download,
  Check,
} from 'lucide-react'
import { SettingsIcon, TodoIcon, SparklesIcon, RefreshIcon } from '@/components/icons'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  modules: { moduleType: string; isActive: boolean }[]
  onToggleModule: (moduleType: string, isActive: boolean) => Promise<void>
  onResetData?: () => void
}

const BASE_MODULES = [
  {
    id: 'events',
    icon: CalendarDays,
    name: 'Agenda del Dia',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Organitza les teves cites, reunions i esdeveniments del dia. Pots sincronitzar-ho amb Google Calendar per tenir tot centralitzat en un sol lloc. Veure el teu dia d\'un cop d\'ull t\'ajuda a planificar millor el temps.',
    alwaysActive: true
  },
  {
    id: 'goals',
    icon: Target,
    name: 'Objectius',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    description: 'Defineix el teu objectiu principal del dia i desglossa\'l en tasques concretes. Estudis demostren que escriure els objectius augmenta un 42% la probabilitat d\'aconseguir-los. La barra de progrés et mantindrà motivat.',
    alwaysActive: true
  },
  {
    id: 'habits',
    icon: TrendingUp,
    name: 'Seguiment d\'Hàbits',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'La constància és la clau de l\'èxit. Fes seguiment dels teus hàbits diaris i construeix una "racha" que et motivarà a no trencar la cadena. Es diu que calen 21 dies per formar un hàbit i 90 per fer-lo permanent.',
    alwaysActive: true
  },
  {
    id: 'reflection',
    icon: MessageSquare,
    name: 'Reflexió del Dia',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    description: 'Dedica uns minuts a reflexionar sobre com ha anat el dia. Registra el teu estat d\'ànim i escriu els teus pensaments. Aquesta pràctica de "journaling" millora el benestar emocional i l\'autoconeixement.',
    alwaysActive: true
  }
]

const OPTIONAL_MODULES = [
  {
    id: 'desafiament',
    icon: Trophy,
    emoji: '🏆',
    name: 'Desafiament 21 dies',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Es diu que calen 21 dies per crear un hàbit. Tria un desafiament específic i compromet-te durant 21 dies seguits. Visualitzar el teu progrés dia a dia t\'ajudarà a mantenir la motivació.'
  },
  {
    id: 'agraiments',
    icon: Heart,
    emoji: '🙏',
    name: 'Agraïments',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    description: 'Escriure 3 coses per les quals estàs agraït cada dia millora significativament el benestar i la felicitat. Estudis científics demostren que la gratitud redueix l\'estrès i augmenta l\'optimisme.'
  },
  {
    id: 'conclusions',
    icon: FileText,
    emoji: '📝',
    name: 'Conclusions',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    description: 'Al final del dia o de la setmana, escriu les teves conclusions: què ha funcionat, què pots millorar, quines lliçons has après. Aquesta reflexió estructurada accelera el creixement personal.'
  },
  {
    id: 'lectures',
    icon: BookOpen,
    emoji: '📖',
    name: 'Les meves lectures',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    description: 'Porta un registre dels llibres que estàs llegint, els que vols llegir i els que has acabat. Pots afegir notes, cites favorites i valoracions. La lectura és una de les millors inversions en tu mateix.'
  },
  {
    id: 'viatges',
    icon: Plane,
    emoji: '✈️',
    name: 'Els meus viatges',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    description: 'Planifica els teus viatges somniats i registra els que ja has fet. Pots afegir fotos, records i llocs que vols visitar. Tenir una llista de desitjos de viatges et manté il·lusionat.'
  },
  {
    id: 'triangles',
    icon: Triangle,
    emoji: '🔺',
    name: '6 Triangles de la vida',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'Avalua les 6 àrees clau de la teva vida: Salut, Relacions, Carrera, Finances, Creixement Personal i Diversió. Puntua cada àrea i treballa per equilibrar el teu triangle vital.'
  },
  {
    id: 'capsula',
    icon: Pill,
    emoji: '💊',
    name: 'Càpsula del temps',
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    description: 'Escriu missatges al teu jo futur. Pots programar-los per obrir-los en dates especials: aniversaris, Cap d\'Any, o quan necessitis motivació. És una forma poderosa de connectar amb els teus objectius a llarg termini.'
  },
  {
    id: 'visualitzacions',
    icon: Eye,
    emoji: '👁️',
    name: 'Visualitzacions',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    description: 'La visualització és una tècnica utilitzada per atletes d\'elit i empresaris d\'èxit. Imagina amb detall els teus objectius aconseguits i com et sentiràs. El cervell no distingeix entre experiències reals i vívides visualitzacions.'
  },
  {
    id: 'diari',
    icon: Lock,
    emoji: '🔒',
    name: 'Diari Privat',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Un espai completament privat per escriure els teus pensaments més íntims. Com un diari "sota el coixí" digital. Escriure sense filtres ajuda a processar emocions i aclarir pensaments.'
  }
]

export function ConfigModal({ isOpen, onClose, modules, onToggleModule, onResetData }: ConfigModalProps) {
  const [saving, setSaving] = useState<string | null>(null)

  const isModuleActive = (moduleType: string) => {
    return modules.find(m => m.moduleType === moduleType)?.isActive ?? false
  }

  const handleToggle = async (moduleType: string) => {
    setSaving(moduleType)
    try {
      await onToggleModule(moduleType, !isModuleActive(moduleType))
    } finally {
      setSaving(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <SettingsIcon size="lg" />
              <h2 className="text-xl font-bold text-gray-900">Configurar la Meva Agenda</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Módulos Base */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TodoIcon size="xs" variant="ghost" />
                Mòduls Base
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Aquests mòduls formen el nucli de la teva agenda i sempre estan visibles.
              </p>
              
              <div className="space-y-3">
                {BASE_MODULES.map((module) => (
                  <div 
                    key={module.id}
                    className={`p-4 rounded-xl border-2 border-gray-200 ${module.bgColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-white rounded-lg ${module.color}`}>
                        <module.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{module.name}</h4>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            Sempre actiu
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-6" />

            {/* Módulos Opcionales */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <SparklesIcon size="xs" variant="ghost" />
                Mòduls Opcionals
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Activa els mòduls que vulguis afegir a la teva agenda. Pots canviar-ho en qualsevol moment.
              </p>
              
              <div className="space-y-3">
                {OPTIONAL_MODULES.map((module) => {
                  const isActive = isModuleActive(module.id)
                  const isSaving = saving === module.id
                  
                  return (
                    <div 
                      key={module.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive 
                          ? `border-indigo-300 ${module.bgColor}` 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => handleToggle(module.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white' : 'bg-gray-100'} ${module.color}`}>
                          <module.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              {module.name}
                            </h4>
                            <button
                              className={`w-12 h-6 rounded-full transition-colors relative ${
                                isActive ? 'bg-indigo-600' : 'bg-gray-300'
                              }`}
                              disabled={isSaving}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                isActive ? 'left-7' : 'left-1'
                              }`}>
                                {isSaving && (
                                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                )}
                                {!isSaving && isActive && (
                                  <Check className="w-4 h-4 text-indigo-600" />
                                )}
                              </div>
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-6" />

            {/* Acciones */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <RefreshIcon size="xs" variant="ghost" />
                Accions
              </h3>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onResetData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restablir dades d&apos;exemple
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Exportar dades
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Tancar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}