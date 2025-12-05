'use client'

import { useState } from 'react'
import {
  Search,
  // Manteniment i Suport
  Wrench, Settings, Hammer, Headphones, LifeBuoy, Shield, ShieldCheck,
  // Branding i Disseny
  Palette, Brush, PenTool, Image, Camera, Video,
  // Marketing i SEO
  Megaphone, Target, TrendingUp, BarChart3, PieChart, Globe, Share2, Mail, Send,
  // Contingut i Formació
  FileText, BookOpen, GraduationCap, Presentation, Newspaper, MessageSquare,
  // Desenvolupament
  Code, Terminal, Database, Server, Cloud, Cpu, Smartphone, Monitor,
  // Consultoria i Negoci
  Lightbulb, Users, Handshake, Briefcase, Building2, Rocket, Award, Star,
  // Altres
  Package, Gift, Zap, Clock, Calendar, CheckCircle,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconOption {
  name: string
  icon: LucideIcon
  label: string
  category: string
}

const SERVICE_ICONS: IconOption[] = [
  // Manteniment i Suport
  { name: 'Wrench', icon: Wrench, label: 'Manteniment', category: 'Manteniment' },
  { name: 'Settings', icon: Settings, label: 'Configuració', category: 'Manteniment' },
  { name: 'Hammer', icon: Hammer, label: 'Reparació', category: 'Manteniment' },
  { name: 'Headphones', icon: Headphones, label: 'Suport', category: 'Manteniment' },
  { name: 'LifeBuoy', icon: LifeBuoy, label: 'Ajuda', category: 'Manteniment' },
  { name: 'Shield', icon: Shield, label: 'Seguretat', category: 'Manteniment' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Protecció', category: 'Manteniment' },

  // Branding i Disseny
  { name: 'Palette', icon: Palette, label: 'Disseny', category: 'Disseny' },
  { name: 'Brush', icon: Brush, label: 'Branding', category: 'Disseny' },
  { name: 'PenTool', icon: PenTool, label: 'Creativitat', category: 'Disseny' },
  { name: 'Image', icon: Image, label: 'Imatges', category: 'Disseny' },
  { name: 'Camera', icon: Camera, label: 'Fotografia', category: 'Disseny' },
  { name: 'Video', icon: Video, label: 'Vídeo', category: 'Disseny' },

  // Marketing i SEO
  { name: 'Megaphone', icon: Megaphone, label: 'Marketing', category: 'Marketing' },
  { name: 'Target', icon: Target, label: 'Objectius', category: 'Marketing' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Creixement', category: 'Marketing' },
  { name: 'BarChart3', icon: BarChart3, label: 'Analítiques', category: 'Marketing' },
  { name: 'PieChart', icon: PieChart, label: 'Estadístiques', category: 'Marketing' },
  { name: 'Search', icon: Search, label: 'SEO', category: 'Marketing' },
  { name: 'Globe', icon: Globe, label: 'Web', category: 'Marketing' },
  { name: 'Share2', icon: Share2, label: 'Social', category: 'Marketing' },
  { name: 'Mail', icon: Mail, label: 'Email', category: 'Marketing' },
  { name: 'Send', icon: Send, label: 'Campanyes', category: 'Marketing' },

  // Contingut i Formació
  { name: 'FileText', icon: FileText, label: 'Contingut', category: 'Contingut' },
  { name: 'BookOpen', icon: BookOpen, label: 'Formació', category: 'Contingut' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Cursos', category: 'Contingut' },
  { name: 'Presentation', icon: Presentation, label: 'Presentacions', category: 'Contingut' },
  { name: 'Newspaper', icon: Newspaper, label: 'Blog', category: 'Contingut' },
  { name: 'MessageSquare', icon: MessageSquare, label: 'Comunicació', category: 'Contingut' },

  // Desenvolupament
  { name: 'Code', icon: Code, label: 'Codi', category: 'Desenvolupament' },
  { name: 'Terminal', icon: Terminal, label: 'Desenvolupament', category: 'Desenvolupament' },
  { name: 'Database', icon: Database, label: 'Base de dades', category: 'Desenvolupament' },
  { name: 'Server', icon: Server, label: 'Servidor', category: 'Desenvolupament' },
  { name: 'Cloud', icon: Cloud, label: 'Cloud', category: 'Desenvolupament' },
  { name: 'Cpu', icon: Cpu, label: 'Tecnologia', category: 'Desenvolupament' },
  { name: 'Smartphone', icon: Smartphone, label: 'App mòbil', category: 'Desenvolupament' },
  { name: 'Monitor', icon: Monitor, label: 'Web App', category: 'Desenvolupament' },

  // Consultoria i Negoci
  { name: 'Lightbulb', icon: Lightbulb, label: 'Consultoria', category: 'Negoci' },
  { name: 'Users', icon: Users, label: 'Equip', category: 'Negoci' },
  { name: 'Handshake', icon: Handshake, label: 'Partnership', category: 'Negoci' },
  { name: 'Briefcase', icon: Briefcase, label: 'Negoci', category: 'Negoci' },
  { name: 'Building2', icon: Building2, label: 'Empresa', category: 'Negoci' },
  { name: 'Rocket', icon: Rocket, label: 'Llançament', category: 'Negoci' },
  { name: 'Award', icon: Award, label: 'Premi', category: 'Negoci' },
  { name: 'Star', icon: Star, label: 'Premium', category: 'Negoci' },

  // Altres
  { name: 'Package', icon: Package, label: 'Pack', category: 'Altres' },
  { name: 'Gift', icon: Gift, label: 'Bonus', category: 'Altres' },
  { name: 'Zap', icon: Zap, label: 'Ràpid', category: 'Altres' },
  { name: 'Clock', icon: Clock, label: 'Temps', category: 'Altres' },
  { name: 'Calendar', icon: Calendar, label: 'Planificació', category: 'Altres' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'Verificat', category: 'Altres' },
]

const CATEGORIES = ['Tots', 'Manteniment', 'Disseny', 'Marketing', 'Contingut', 'Desenvolupament', 'Negoci', 'Altres']

interface IconSelectorProps {
  selectedIcon: string
  onSelect: (iconName: string) => void
  color?: string
}

export function IconSelector({ selectedIcon, onSelect, color = '#3B82F6' }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tots')

  const filteredIcons = SERVICE_ICONS.filter(icon => {
    const matchesSearch = icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'Tots' || icon.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const SelectedIconComponent = SERVICE_ICONS.find(i => i.name === selectedIcon)?.icon

  return (
    <div className="space-y-4">
      {/* Icona seleccionada */}
      {selectedIcon && SelectedIconComponent && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: color + '20' }}
          >
            <SelectedIconComponent
              className="h-6 w-6"
              style={{ color }}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="font-medium text-slate-900">Icona seleccionada</p>
            <p className="text-sm text-slate-500">{SERVICE_ICONS.find(i => i.name === selectedIcon)?.label}</p>
          </div>
        </div>
      )}

      {/* Cerca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Cercar icona..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid d'icones */}
      <div className="grid grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
        {filteredIcons.map((iconOption) => {
          const IconComponent = iconOption.icon
          const isSelected = selectedIcon === iconOption.name

          return (
            <button
              key={iconOption.name}
              onClick={() => onSelect(iconOption.name)}
              title={iconOption.label}
              className={cn(
                'p-3 rounded-lg transition-all flex items-center justify-center',
                isSelected
                  ? 'bg-blue-100 ring-2 ring-blue-500'
                  : 'bg-white hover:bg-slate-100 border border-slate-200'
              )}
            >
              <IconComponent
                className={cn(
                  'h-5 w-5',
                  isSelected ? 'text-blue-600' : 'text-slate-600'
                )}
                strokeWidth={1.5}
              />
            </button>
          )
        })}
      </div>

      {filteredIcons.length === 0 && (
        <p className="text-center text-slate-500 py-4">
          No s'han trobat icones amb "{searchTerm}"
        </p>
      )}
    </div>
  )
}

// Export per usar en altres components
export { SERVICE_ICONS }
export type { IconOption }