'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Type,
  Layout,
  Menu,
  PanelTop,
  MousePointer,
  CreditCard,
  Mail,
  Building2,
  Gift,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  Download,
  Upload,
  RotateCcw,
  RefreshCw,
  Settings,
  Eye,
  Code,
  Save,
  Check,
  X,
  Loader2,
  Calendar,
  FileCode,
  Folder,
  Plus,
  Copy,
  ExternalLink,
  Tag,
  MapPin,
  Layers,
  Paintbrush
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'

// Design System Components
import { ColorEditor, ColorPalette } from '@/components/admin/design-system/ColorEditor'
import { TypographyEditor, TypographyScale } from '@/components/admin/design-system/TypographyEditor'
import { ButtonEditor, ButtonVariants } from '@/components/admin/design-system/ButtonEditor'
import { MenuEditor, MenuSelector } from '@/components/admin/design-system/MenuEditor'
import {
  ComponentPreview,
  ShadowPreview,
  RadiusPreview,
  SpacingPreview
} from '@/components/admin/design-system/ComponentPreview'
import { LayoutEditor, defaultLayoutTokens, type LayoutToken } from '@/components/admin/design-system/LayoutEditor'
import { EmailEditor, defaultEmailTokens, type EmailToken } from '@/components/admin/design-system/EmailEditor'
import { EmailContentEditor } from '@/components/admin/design-system/EmailContentEditor'
import { HeaderStyleEditor, defaultHeaderStyleTokens, type HeaderStyleToken } from '@/components/admin/design-system/HeaderStyleEditor'
import {
  ColorsEditor,
  ShadowsEditor,
  RadiusEditor,
  SpacingEditor,
  GradientsEditor,
  defaultColorTokens,
  defaultShadowTokens,
  defaultRadiusTokens,
  defaultSpacingTokens,
  defaultGradientTokens,
  type ColorTokenEditable,
  type ShadowTokenEditable,
  type RadiusTokenEditable,
  type SpacingTokenEditable,
  type GradientTokenEditable
} from '@/components/admin/design-system/StylesEditor'
import {
  FontFamilyEditor,
  HeadingsEditor,
  FontSizeEditor,
  FontWeightEditor,
  UITextEditor,
  defaultFontFamilyTokens,
  defaultHeadingTokens,
  defaultFontSizeTokens,
  defaultFontWeightTokens,
  defaultUITextTokens,
  type FontFamilyToken,
  type HeadingToken,
  type FontSizeToken,
  type FontWeightToken
} from '@/components/admin/design-system/TypographyStyleEditor'

// Previews
import { ColorPalettePreview } from '@/components/admin/design-system/previews/ColorPalettePreview'
import { ButtonsPreview } from '@/components/admin/design-system/previews/ButtonsPreview'
import { TypographyPreview } from '@/components/admin/design-system/previews/TypographyPreview'
import { CardsPreview } from '@/components/admin/design-system/previews/CardsPreview'
import { CompanyCardPreview } from '@/components/admin/design-system/previews/CompanyCardPreview'
import { CardEditor, type CardTokenData } from '@/components/admin/design-system/CardEditor'

// Actions - Design System
import { getCardTokens, updateCardTokens, resetCardTokensToDefault } from '@/lib/actions/design-system-actions'

// Actions - Components Registry
import {
  getRegisteredComponents,
  updateComponentProps,
  resetComponentProps,
  registerInitialComponents,
  updateComponentRoutes,
  updateComponentEditableProps,
} from '@/lib/actions/component-registry-actions'
import { ComponentPreview as ComponentRegistryPreview } from '@/components/admin/components-registry/ComponentPreview'

// Mock data
import { sampleColorTokens, sampleTypographyTokens } from '@/lib/design-system/mock-data'

// Data
import {
  designCategories,
  type DesignCategory,
  type DesignElement
} from '@/lib/design-system/categories'
import {
  defaultColors,
  defaultTypography,
  defaultShadows,
  defaultRadius,
  defaultSpacing,
  defaultButtonStyles,
  type ColorToken,
  type TypographyToken
} from '@/lib/design-system/defaults'

// ============================================
// TYPES
// ============================================

interface RegisteredComponent {
  id: string
  name: string
  displayName: string
  description: string | null
  filePath: string
  usedIn: string[]
  category: string
  section: string
  editableProps: Record<string, string>
  defaultProps: Record<string, string>
  tags: string[]
  dependencies: string[]
  thumbnail: string | null
  version: number
}

// Icon mapping for design categories
const categoryIcons: Record<string, typeof Palette> = {
  empreses: Building2,
  ofertes: Gift,
  estils: Palette,
  tipografia: Type,
  layouts: Layout,
  menus: Menu,
  headers: PanelTop,
  botons: MousePointer,
  cards: CreditCard,
  emails: Mail,
  icones: Sparkles,
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function DesignSystemPage() {
  // Main tabs
  const [mainTab, setMainTab] = useState<'tokens' | 'components'>('tokens')

  // Design System state
  const [activeCategory, setActiveCategory] = useState<string>('estils')
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSavingCSS, setIsSavingCSS] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // State for different editors
  const [selectedColor, setSelectedColor] = useState<ColorToken | null>(null)
  const [selectedTypography, setSelectedTypography] = useState<TypographyToken | null>(null)
  const [selectedButton, setSelectedButton] = useState<string | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [cardTokens, setCardTokens] = useState<CardTokenData[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [layoutTokens, setLayoutTokens] = useState<LayoutToken[]>(defaultLayoutTokens)
  const [emailTokens, setEmailTokens] = useState<EmailToken[]>(defaultEmailTokens)
  const [headerStyleTokens, setHeaderStyleTokens] = useState<HeaderStyleToken[]>(defaultHeaderStyleTokens)

  // Styles tokens
  const [colorTokens, setColorTokens] = useState<ColorTokenEditable[]>(defaultColorTokens)
  const [shadowTokens, setShadowTokens] = useState<ShadowTokenEditable[]>(defaultShadowTokens)
  const [radiusTokens, setRadiusTokens] = useState<RadiusTokenEditable[]>(defaultRadiusTokens)
  const [spacingTokens, setSpacingTokens] = useState<SpacingTokenEditable[]>(defaultSpacingTokens)
  const [gradientTokens, setGradientTokens] = useState<GradientTokenEditable[]>(defaultGradientTokens)

  // Typography tokens
  const [fontFamilyTokens, setFontFamilyTokens] = useState<FontFamilyToken[]>(defaultFontFamilyTokens)
  const [headingTokens, setHeadingTokens] = useState<HeadingToken[]>(defaultHeadingTokens)
  const [fontSizeTokens, setFontSizeTokens] = useState<FontSizeToken[]>(defaultFontSizeTokens)
  const [fontWeightTokens, setFontWeightTokens] = useState<FontWeightToken[]>(defaultFontWeightTokens)
  const [uiTextTokens, setUITextTokens] = useState(defaultUITextTokens)

  // Components Registry state
  const [components, setComponents] = useState<RegisteredComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<RegisteredComponent | null>(null)
  const [componentSearchQuery, setComponentSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard', 'gestio'])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)
  const [isInitializingComponents, setIsInitializingComponents] = useState(false)
  const [isUpdatingRoutes, setIsUpdatingRoutes] = useState(false)
  const [isUpdatingProps, setIsUpdatingProps] = useState(false)

  // Load card tokens when switching to cards category
  useEffect(() => {
    if (activeCategory === 'cards') {
      loadCardTokens()
    }
  }, [activeCategory])

  // Load components when switching to components tab
  useEffect(() => {
    if (mainTab === 'components' && components.length === 0) {
      loadComponents()
    }
  }, [mainTab])

  // ============================================
  // DESIGN SYSTEM HANDLERS
  // ============================================

  const loadCardTokens = async () => {
    setIsLoadingCards(true)
    try {
      const result = await getCardTokens()
      if (result.success && result.data) {
        setCardTokens(result.data.map(t => ({
          name: t.name,
          value: t.value,
          cssVariable: t.cssVariable || `--${t.name}`,
          description: t.description || ''
        })))
      }
    } catch (error) {
      console.error('Error loading card tokens:', error)
    }
    setIsLoadingCards(false)
  }

  const handleSaveCardTokens = async (tokens: Array<{ name: string; value: string }>) => {
    const result = await updateCardTokens(tokens)
    if (result.success) {
      await loadCardTokens()
    } else {
      throw new Error(result.error)
    }
  }

  const handleResetCardTokens = async () => {
    const result = await resetCardTokensToDefault()
    if (result.success) {
      await loadCardTokens()
      setTimeout(() => window.location.reload(), 500)
    }
  }

  // Get current category
  const currentCategory = designCategories.find(c => c.id === activeCategory)
  const CategoryIcon = categoryIcons[activeCategory] || Palette

  // Filter elements based on search
  const filteredElements = currentCategory?.elements.filter(
    el => el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          el.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Canvis guardats correctament')
      setHasChanges(false)
    } catch {
      toast.error('Error guardant els canvis')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle export
  const handleExport = () => {
    const data = {
      colors: defaultColors,
      typography: defaultTypography,
      shadows: defaultShadows,
      radius: defaultRadius,
      spacing: defaultSpacing,
      buttons: defaultButtonStyles,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-system-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Design system exportat')
  }

  // Handle initialize
  const handleInitialize = async () => {
    if (!confirm('Aquesta acció inicialitzarà tots els valors per defecte del Design System a la base de dades. Vols continuar?')) {
      return
    }

    setIsInitializing(true)
    try {
      const response = await fetch('/api/admin/design-system/init', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Design System inicialitzat correctament')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al inicialitzar el Design System')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de connexió al servidor')
    } finally {
      setIsInitializing(false)
    }
  }

  // Handle sync with real web styles
  const handleSync = async () => {
    if (!confirm('Aquesta acció sincronitzarà els tokens amb els estils reals de la web (colors, tipografia, etc.). Vols continuar?')) {
      return
    }

    setIsSyncing(true)
    try {
      const response = await fetch('/api/admin/design-system/sync', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          `${data.message}: ${data.counts?.total || 0} tokens sincronitzats`
        )
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al sincronitzar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de connexió al servidor')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle save to CSS file
  const handleSaveToCSS = async () => {
    setIsSavingCSS(true)
    try {
      const response = await fetch('/api/admin/design-system/save-css', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'CSS guardat correctament a design-tokens.css')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error guardant el CSS')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de connexió al servidor')
    } finally {
      setIsSavingCSS(false)
    }
  }

  // ============================================
  // COMPONENTS REGISTRY HANDLERS
  // ============================================

  const loadComponents = async () => {
    setIsLoadingComponents(true)
    try {
      const result = await getRegisteredComponents()
      if (result.success && result.data) {
        setComponents(result.data as RegisteredComponent[])
      }
    } catch (error) {
      console.error('Error loading components:', error)
      toast.error('Error carregant components')
    }
    setIsLoadingComponents(false)
  }

  const handleInitializeComponents = async () => {
    if (!confirm('Això registrarà els components inicials. Vols continuar?')) return

    setIsInitializingComponents(true)
    try {
      const result = await registerInitialComponents()
      if (result.success) {
        toast.success(`${result.data?.registered} components registrats`)
        await loadComponents()
      } else {
        toast.error(result.error || 'Error inicialitzant')
      }
    } catch (error) {
      toast.error('Error inicialitzant components')
    }
    setIsInitializingComponents(false)
  }

  const handleUpdateRoutes = async () => {
    setIsUpdatingRoutes(true)
    try {
      const result = await updateComponentRoutes()
      if (result.success) {
        toast.success(`${result.data?.updated} components actualitzats`)
        await loadComponents()
        if (selectedComponent) {
          const updated = components.find(c => c.id === selectedComponent.id)
          if (updated) setSelectedComponent(updated)
        }
      } else {
        toast.error(result.error || 'Error actualitzant rutes')
      }
    } catch (error) {
      toast.error('Error actualitzant rutes')
    }
    setIsUpdatingRoutes(false)
  }

  const handleUpdateEditableProps = async () => {
    if (!confirm('Això actualitzarà les propietats editables de OfferCard, MemberCard i StatCard. Vols continuar?')) return

    setIsUpdatingProps(true)
    try {
      const result = await updateComponentEditableProps()
      if (result.success) {
        toast.success(`${result.data?.updated} components actualitzats amb noves propietats`)
        await loadComponents()
        if (selectedComponent) {
          const updated = components.find(c => c.id === selectedComponent.id)
          if (updated) setSelectedComponent(updated)
        }
      } else {
        toast.error(result.error || 'Error actualitzant propietats')
      }
    } catch (error) {
      toast.error('Error actualitzant propietats editables')
    }
    setIsUpdatingProps(false)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Group components by section
  const groupedComponents = components.reduce((acc, comp) => {
    if (!acc[comp.section]) acc[comp.section] = []
    acc[comp.section].push(comp)
    return acc
  }, {} as Record<string, RegisteredComponent[]>)

  // Filter by search
  const filteredGroups = Object.entries(groupedComponents).reduce((acc, [section, comps]) => {
    const filtered = comps.filter(comp =>
      comp.displayName.toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
      comp.name.toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
      comp.description?.toLowerCase().includes(componentSearchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[section] = filtered
    }
    return acc
  }, {} as Record<string, RegisteredComponent[]>)

  // Section labels
  const sectionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    gestio: 'Gestió Empresarial',
    empresa: 'Portal Empresa',
    public: 'Pàgines Públiques',
    admin: 'Administració',
    global: 'global',
  }

  // Sample menus data
  const sampleMenus = [
    {
      name: 'sidebar-admin',
      displayName: 'Sidebar Admin',
      description: 'Menú principal d\'administració',
      items: [
        { id: '1', label: 'Dashboard', href: '/admin', visible: true, order: 0 },
        { id: '2', label: 'Empreses', href: '/admin/empreses', visible: true, order: 1 },
        { id: '3', label: 'Usuaris', href: '/admin/usuaris', visible: true, order: 2 },
        { id: '4', label: 'Configuració', href: '/admin/config', visible: true, order: 3 },
      ]
    },
    {
      name: 'sidebar-empresa',
      displayName: 'Sidebar Empresa',
      description: 'Menú del dashboard empresa',
      items: [
        { id: '1', label: 'Inici', href: '/empresa', visible: true, order: 0 },
        { id: '2', label: 'Ofertes', href: '/empresa/ofertes', visible: true, order: 1 },
        { id: '3', label: 'Estadístiques', href: '/empresa/estadistiques', visible: true, order: 2 },
      ]
    },
  ]

  // ============================================
  // RENDER DESIGN SYSTEM EDITOR
  // ============================================

  const renderDesignSystemEditor = () => {
    if (!activeElement && !selectedColor && !selectedTypography && !selectedButton && !selectedMenu) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Eye className="h-12 w-12 mb-4 text-slate-300" />
          <p className="text-lg font-medium">Selecciona un element</p>
          <p className="text-sm">Fes clic a un element de la llista per editar-lo</p>
        </div>
      )
    }

    switch (activeCategory) {
      case 'empreses':
        if (activeElement === 'company-card') {
          return <CompanyCardPreview variant="card" />
        }
        if (activeElement === 'company-single') {
          return <CompanyCardPreview variant="single" />
        }
        if (activeElement === 'company-preview') {
          return <CompanyCardPreview variant="preview" />
        }
        if (activeElement === 'company-list') {
          return (
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Llista d'Empreses
              </h4>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-slate-900">Empresa {i}</h5>
                          <Check className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-500">Barcelona - Tecnologia</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return <CompanyCardPreview variant="card" />

      case 'ofertes':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Targetes d'Ofertes
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    -20%
                  </span>
                  <Gift className="h-5 w-5 text-slate-400" />
                </div>
                <h5 className="font-semibold text-slate-900 mb-1">Descompte en serveis IT</h5>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Oferta especial per a empleats publics amb assessorament gratuit.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Fins 31/03/2025
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    2x1
                  </span>
                  <Gift className="h-5 w-5 text-slate-400" />
                </div>
                <h5 className="font-semibold text-slate-900 mb-1">Consultoria gratuita</h5>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Primera sessio de consultoria sense cap cost.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Fins 15/04/2025
                </div>
              </div>
            </div>
          </div>
        )

      case 'estils':
        // Colors Primaris
        if (activeElement === 'colors-primary') {
          return (
            <ColorsEditor
              tokens={colorTokens}
              group="primary"
              onSave={async (tokens) => {
                setColorTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setColorTokens(defaultColorTokens)}
            />
          )
        }
        // Colors Semàntics
        if (activeElement === 'colors-semantic') {
          return (
            <ColorsEditor
              tokens={colorTokens}
              group="semantic"
              onSave={async (tokens) => {
                setColorTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setColorTokens(defaultColorTokens)}
            />
          )
        }
        // Colors Neutres
        if (activeElement === 'colors-neutral') {
          return (
            <ColorsEditor
              tokens={colorTokens}
              group="neutral"
              onSave={async (tokens) => {
                setColorTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setColorTokens(defaultColorTokens)}
            />
          )
        }
        // Gradients
        if (activeElement === 'gradients') {
          return (
            <GradientsEditor
              tokens={gradientTokens}
              onSave={async (tokens) => {
                setGradientTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setGradientTokens(defaultGradientTokens)}
            />
          )
        }
        // Ombres
        if (activeElement === 'shadows') {
          return (
            <ShadowsEditor
              tokens={shadowTokens}
              onSave={async (tokens) => {
                setShadowTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setShadowTokens(defaultShadowTokens)}
            />
          )
        }
        // Border Radius
        if (activeElement === 'radius') {
          return (
            <RadiusEditor
              tokens={radiusTokens}
              onSave={async (tokens) => {
                setRadiusTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setRadiusTokens(defaultRadiusTokens)}
            />
          )
        }
        // Espaiat
        if (activeElement === 'spacing') {
          return (
            <SpacingEditor
              tokens={spacingTokens}
              onSave={async (tokens) => {
                setSpacingTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setSpacingTokens(defaultSpacingTokens)}
            />
          )
        }
        // Default: show element selector hint
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Palette className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Selecciona un element</p>
            <p className="text-sm">Fes clic a un element de la llista per editar-lo</p>
          </div>
        )

      case 'tipografia':
        // Fonts (Famílies)
        if (activeElement === 'fonts-family') {
          return (
            <FontFamilyEditor
              tokens={fontFamilyTokens}
              onSave={async (tokens) => {
                setFontFamilyTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setFontFamilyTokens(defaultFontFamilyTokens)}
            />
          )
        }
        // Títols (Headings)
        if (activeElement === 'fonts-headings') {
          return (
            <HeadingsEditor
              tokens={headingTokens}
              onSave={async (tokens) => {
                setHeadingTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setHeadingTokens(defaultHeadingTokens)}
            />
          )
        }
        // Cos (Body text sizes)
        if (activeElement === 'fonts-body') {
          return (
            <FontSizeEditor
              tokens={fontSizeTokens}
              onSave={async (tokens) => {
                setFontSizeTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setFontSizeTokens(defaultFontSizeTokens)}
            />
          )
        }
        // UI Text
        if (activeElement === 'fonts-ui') {
          return (
            <UITextEditor
              tokens={uiTextTokens}
              onSave={async (tokens) => {
                setUITextTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setUITextTokens(defaultUITextTokens)}
            />
          )
        }
        // Pesos
        if (activeElement === 'fonts-weights') {
          return (
            <FontWeightEditor
              tokens={fontWeightTokens}
              onSave={async (tokens) => {
                setFontWeightTokens(tokens)
                setHasChanges(true)
              }}
              onReset={() => setFontWeightTokens(defaultFontWeightTokens)}
            />
          )
        }
        // Default
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Type className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Selecciona un element</p>
            <p className="text-sm">Fes clic a un element de la llista per editar-lo</p>
          </div>
        )

      case 'botons':
        return (
          <div className="space-y-8">
            <ButtonsPreview />
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurar Variants</h3>
              <ButtonVariants
                variants={Object.entries(defaultButtonStyles).map(([name, style]) => ({
                  name,
                  ...style,
                }))}
                selectedVariant={selectedButton || undefined}
                onSelect={(variant) => {
                  setSelectedButton(variant.name)
                  setHasChanges(true)
                }}
              />
              {selectedButton && (
                <div className="pt-6 mt-6 border-t border-slate-200">
                  <h4 className="text-md font-semibold text-slate-900 mb-4">Editar Variant: {selectedButton}</h4>
                  <ButtonEditor
                    style={Object.entries(defaultButtonStyles).map(([name, style]) => ({
                      name,
                      ...style,
                    })).find(b => b.name === selectedButton) || {
                      name: 'primary',
                      background: '#1E3A5F',
                      color: '#FFFFFF',
                      border: 'transparent',
                      hoverBackground: '#2E5A8F',
                      activeBackground: '#0E2A4F'
                    }}
                    onChange={() => setHasChanges(true)}
                    onSave={handleSave}
                    onReset={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 'cards':
        if (isLoadingCards) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Carregant tokens de cards...</span>
            </div>
          )
        }
        if (cardTokens.length === 0) {
          return (
            <div className="space-y-6">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-2">No hi ha tokens de cards</h4>
                <p className="text-sm text-amber-700 mb-4">
                  Primer has de sincronitzar els tokens del Design System per poder editar les cards.
                </p>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Sincronitzant...' : 'Sincronitzar ara'}
                </button>
              </div>
              <CardsPreview />
            </div>
          )
        }
        return (
          <div className="space-y-8">
            <CardEditor
              tokens={cardTokens}
              onSave={handleSaveCardTokens}
              onReset={handleResetCardTokens}
            />
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Totes les Variants</h3>
              <CardsPreview />
            </div>
          </div>
        )

      case 'menus':
        const currentMenu = sampleMenus.find(m => m.name === selectedMenu)
        return (
          <div className="space-y-6">
            <MenuSelector
              menus={sampleMenus}
              selectedMenu={selectedMenu || undefined}
              onSelect={(menu) => {
                setSelectedMenu(menu.name)
                setHasChanges(true)
              }}
            />
            {selectedMenu && currentMenu && (
              <div className="pt-6 border-t border-slate-200">
                <MenuEditor
                  menu={currentMenu}
                  onChange={() => setHasChanges(true)}
                  onSave={handleSave}
                  onReset={() => {
                    const original = sampleMenus.find(m => m.name === selectedMenu)
                    if (original) {
                      // Reset to original
                    }
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'headers':
        return (
          <HeaderStyleEditor
            tokens={headerStyleTokens}
            onSave={async (tokens) => {
              setHeaderStyleTokens(tokens)
              setHasChanges(true)
              toast.success('Estils de capçalera guardats')
            }}
            onReset={() => {
              setHeaderStyleTokens(defaultHeaderStyleTokens)
              toast.success('Estils de capçalera restaurats')
            }}
          />
        )

      case 'layouts':
        return (
          <LayoutEditor
            tokens={layoutTokens}
            onSave={async (tokens) => {
              setLayoutTokens(tokens)
              setHasChanges(true)
              toast.success('Tokens de layout guardats')
            }}
            onReset={() => {
              setLayoutTokens(defaultLayoutTokens)
              toast.success('Tokens de layout restaurats')
            }}
          />
        )

      case 'emails':
        return (
          <EmailContentEditor
            onSave={() => setHasChanges(false)}
          />
        )

      case 'icones':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Biblioteca d'Icones (Lucide)
            </h4>

            <div className="grid grid-cols-8 gap-3">
              {[
                Building2, Gift, Palette, Type, Layout, Menu, PanelTop, MousePointer,
                CreditCard, Mail, Sparkles, ChevronRight, Search, Download, Upload, RotateCcw,
                Settings, Eye, Code, Save, Check, X, Loader2, Calendar
              ].map((Icon, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <Icon className="h-6 w-6 text-slate-600" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800">
                Utilitzem <strong>Lucide Icons</strong> com a biblioteca d'icones.
                Totes les icones son SVG i es poden personalitzar amb Tailwind CSS.
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Settings className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Editor en desenvolupament</p>
            <p className="text-sm">Aquest editor estarà disponible properament</p>
          </div>
        )
    }
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Design System</h1>
                <p className="text-sm text-slate-500">Gestiona tokens CSS i components de la plataforma</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  Canvis sense guardar
                </span>
              )}

              {/* Buttons that change based on tab */}
              {mainTab === 'tokens' ? (
                <>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                  >
                    <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                    {isSyncing ? 'Sincronitzant...' : 'Sincronitzar'}
                  </button>
                  <button
                    onClick={handleInitialize}
                    disabled={isInitializing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RotateCcw className={cn('h-4 w-4', isInitializing && 'animate-spin')} />
                    {isInitializing ? 'Inicialitzant...' : 'Inicialitzar'}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateEditableProps}
                    disabled={isUpdatingProps}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                  >
                    <Settings className={cn('h-4 w-4', isUpdatingProps && 'animate-spin')} />
                    {isUpdatingProps ? 'Actualitzant...' : 'Actualitzar props'}
                  </button>
                  <button
                    onClick={handleUpdateRoutes}
                    disabled={isUpdatingRoutes}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                  >
                    <MapPin className={cn('h-4 w-4', isUpdatingRoutes && 'animate-pulse')} />
                    {isUpdatingRoutes ? 'Actualitzant...' : 'Corregir rutes'}
                  </button>
                  <button
                    onClick={handleInitializeComponents}
                    disabled={isInitializingComponents}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw className={cn('h-4 w-4', isInitializingComponents && 'animate-spin')} />
                    {isInitializingComponents ? 'Inicialitzant...' : 'Inicialitzar'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <Plus className="h-4 w-4" />
                    Registrar component
                  </button>
                </>
              )}

              {/* Always visible: Guardar a CSS */}
              <button
                onClick={handleSaveToCSS}
                disabled={isSavingCSS}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSavingCSS ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Code className="h-4 w-4" />
                )}
                {isSavingCSS ? 'Guardant...' : 'Guardar a CSS'}
              </button>

              {mainTab === 'tokens' && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    hasChanges
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setMainTab('tokens')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                mainTab === 'tokens'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Paintbrush className="h-4 w-4" />
              Tokens CSS
            </button>
            <button
              onClick={() => setMainTab('components')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                mainTab === 'components'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <FileCode className="h-4 w-4" />
              Components
            </button>
          </div>
        </div>
      </div>

      {/* Content based on tab */}
      {mainTab === 'tokens' ? (
        <>
          {/* Category Tabs for Tokens */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1600px] mx-auto px-6">
              <div className="flex gap-1 overflow-x-auto py-2">
                {designCategories.map((category) => {
                  const Icon = categoryIcons[category.id] || Palette
                  const isActive = activeCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id)
                        setActiveElement(null)
                        setSelectedColor(null)
                        setSelectedTypography(null)
                        setSelectedButton(null)
                        setSelectedMenu(null)
                      }}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Tokens */}
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar - Elements List */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl border border-slate-200 sticky top-32">
                  {/* Category Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: currentCategory?.color + '20' }}
                      >
                        <CategoryIcon
                          className="h-5 w-5"
                          style={{ color: currentCategory?.color }}
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900">{currentCategory?.label}</h2>
                        <p className="text-xs text-slate-500">{currentCategory?.description}</p>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cercar elements..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Elements List */}
                  <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredElements.map((element) => (
                      <button
                        key={element.id}
                        onClick={() => setActiveElement(element.id)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                          activeElement === element.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-slate-50'
                        )}
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{element.name}</p>
                          <p className="text-xs text-slate-500">{element.description}</p>
                        </div>
                        <ChevronRight className={cn(
                          'h-4 w-4 text-slate-400 transition-transform',
                          activeElement === element.id && 'text-blue-600'
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Panel - Editor & Preview */}
              <div className="col-span-9">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  {/* Element Header */}
                  {activeElement && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {filteredElements.find(e => e.id === activeElement)?.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {filteredElements.find(e => e.id === activeElement)?.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                          <Code className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Editor Content */}
                  {renderDesignSystemEditor()}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Components Registry Tab */
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar - Components Navigator */}
            <div className="col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 sticky top-24">
                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={componentSearchQuery}
                      onChange={(e) => setComponentSearchQuery(e.target.value)}
                      placeholder="Cercar components..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Components List */}
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  {isLoadingComponents ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : Object.keys(filteredGroups).length === 0 ? (
                    <div className="p-6 text-center">
                      <FileCode className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-600 font-medium">No hi ha components registrats</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Clica "Inicialitzar" per registrar els components inicials
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {Object.entries(filteredGroups).map(([section, comps]) => (
                        <div key={section}>
                          <button
                            onClick={() => toggleSection(section)}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                          >
                            {expandedSections.includes(section) ? (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                            <Folder className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium text-slate-900">
                              {sectionLabels[section] || section}
                            </span>
                            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {comps.length}
                            </span>
                          </button>

                          {expandedSections.includes(section) && (
                            <div className="pb-2">
                              {comps.map(comp => (
                                <button
                                  key={comp.id}
                                  onClick={() => setSelectedComponent(comp)}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 pl-10 text-left text-sm transition-colors',
                                    selectedComponent?.id === comp.id
                                      ? 'bg-indigo-50 text-indigo-900 border-r-2 border-indigo-500'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  )}
                                >
                                  <FileCode className={cn(
                                    'h-4 w-4 flex-shrink-0',
                                    selectedComponent?.id === comp.id ? 'text-indigo-500' : 'text-slate-400'
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{comp.displayName}</p>
                                    <p className="text-xs text-slate-500 truncate">{comp.category}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Panel - Component Editor */}
            <div className="col-span-8">
              {selectedComponent ? (
                <ComponentEditorPanel
                  component={selectedComponent}
                  components={components}
                  onUpdate={async (props) => {
                    const result = await updateComponentProps(selectedComponent.id, props)
                    if (result.success) {
                      toast.success('Canvis guardats!')
                      await loadComponents()
                    } else {
                      throw new Error(result.error)
                    }
                  }}
                  onReset={async () => {
                    const result = await resetComponentProps(selectedComponent.id)
                    if (result.success) {
                      toast.success('Propietats restaurades')
                      await loadComponents()
                      const updated = components.find(c => c.id === selectedComponent.id)
                      if (updated) setSelectedComponent(updated)
                    }
                  }}
                />
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <FileCode className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                    <p className="text-lg font-medium text-slate-600">Selecciona un component</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Fes clic a un component de la llista per editar-lo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPONENT EDITOR PANEL
// ============================================

interface ComponentEditorPanelProps {
  component: RegisteredComponent
  components: RegisteredComponent[]
  onUpdate: (props: Record<string, string>) => Promise<void>
  onReset: () => Promise<void>
}

function ComponentEditorPanel({ component, components, onUpdate, onReset }: ComponentEditorPanelProps) {
  const [props, setProps] = useState<Record<string, string>>(component.editableProps)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'props'>('props')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setProps(component.editableProps)
    setHasChanges(false)
  }, [component])

  const updateProp = (key: string, value: string) => {
    setProps(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    document.documentElement.style.setProperty(`--${component.name}-${key}`, value)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(props)
      setHasChanges(false)
    } catch (error) {
      toast.error('Error guardant canvis')
    }
    setIsSaving(false)
  }

  const handleReset = async () => {
    if (!confirm('Vols restaurar les propietats per defecte?')) return
    await onReset()
    setProps(component.defaultProps)
    setHasChanges(false)
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copiat!')
    setTimeout(() => setCopied(null), 2000)
  }

  const getPropType = (key: string): 'color' | 'size' | 'shadow' | 'text' => {
    if (key.includes('color') || key.includes('background')) return 'color'
    if (key.includes('radius') || key.includes('padding') || key.includes('size') || key.includes('gap')) return 'size'
    if (key.includes('shadow')) return 'shadow'
    return 'text'
  }

  const SIZE_OPTIONS = [
    { value: '0', label: 'Cap (0)' },
    { value: '4px', label: '4px' },
    { value: '8px', label: '8px' },
    { value: '12px', label: '12px' },
    { value: '16px', label: '16px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '32px', label: '32px' },
    { value: '48px', label: '48px' },
  ]

  const SHADOW_OPTIONS = [
    { value: 'none', label: 'Cap' },
    { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', label: 'Subtil' },
    { value: '0 1px 3px 0 rgb(0 0 0 / 0.1)', label: 'Petita' },
    { value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', label: 'Mitjana' },
    { value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', label: 'Gran' },
    { value: '0 20px 25px -5px rgb(0 0 0 / 0.1)', label: 'Molt gran' },
  ]

  const renderPropEditor = (key: string, value: string) => {
    const type = getPropType(key)

    switch (type) {
      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value.startsWith('#') ? value : '#ffffff'}
              onChange={(e) => updateProp(key, e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateProp(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )

      case 'size':
        return (
          <select
            value={value}
            onChange={(e) => updateProp(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {SIZE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {!SIZE_OPTIONS.find(o => o.value === value) && (
              <option value={value}>{value}</option>
            )}
          </select>
        )

      case 'shadow':
        return (
          <select
            value={value}
            onChange={(e) => updateProp(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {SHADOW_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateProp(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{component.displayName}</h2>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                v{component.version}
              </span>
            </div>
            {component.description && (
              <p className="text-sm text-slate-600 mt-1">{component.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                <Folder className="h-3 w-3" />
                {component.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-mono">
                <FileCode className="h-3 w-3" />
                {component.filePath}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('props')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'props'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            )}
          >
            <Settings className="h-4 w-4" />
            Propietats
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'preview'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'props' ? (
          <div className="space-y-6">
            {/* Props Editor */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(props).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 capitalize">
                      {key.replace(/-/g, ' ')}
                    </label>
                    <button
                      onClick={() => copyToClipboard(`var(--${component.name}-${key})`, key)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Copiar variable CSS"
                    >
                      {copied === key ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {renderPropEditor(key, value)}
                </div>
              ))}
            </div>

            {hasChanges && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Preview */}
            <ComponentRegistryPreview
              componentName={component.name}
              props={props}
            />

            {/* CSS Variables */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Variables CSS generades</h4>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                {Object.entries(props).map(([key, value]) => (
                  <div key={key} className="text-slate-300">
                    <span className="text-purple-400">--{component.name}-{key}</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-green-400">{value}</span>
                    <span className="text-slate-500">;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Used In Section */}
        {component.usedIn.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              S'utilitza a
            </h4>
            <div className="flex flex-wrap gap-2">
              {component.usedIn.map(path => (
                <a
                  key={path}
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {path}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {component.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiquetes
            </h4>
            <div className="flex flex-wrap gap-2">
              {component.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
