// Design System Categories
// Definició de totes les categories i elements gestionables

import {
  Building2,
  Gift,
  Palette,
  Type,
  Layout,
  Menu,
  PanelTop,
  MousePointer,
  CreditCard,
  Mail,
  Plug,
  Shield,
  BarChart3,
  Headphones,
  GraduationCap,
  FileText,
  FolderOpen,
  Megaphone,
  Users,
  Bot,
  HardDrive,
  Globe,
  Sparkles,
  Square,
  CircleDot,
  Layers,
  Monitor,
  Smartphone,
  SunMedium,
  Moon,
  Image,
  type LucideIcon
} from 'lucide-react'

export interface DesignElement {
  id: string
  name: string
  description: string
  editorType?: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius' | 'menu' | 'component' | 'button' | 'card' | 'email'
}

export interface DesignCategory {
  id: string
  label: string
  icon: LucideIcon
  color: string
  description: string
  elements: DesignElement[]
}

export const designCategories: DesignCategory[] = [
  {
    id: 'estils',
    label: 'Estils',
    icon: Palette,
    color: '#8B5CF6',
    description: 'Paleta de colors, ombres i cantonades',
    elements: [
      { id: 'colors-primary', name: 'Colors Primaris', description: 'Primary, Secondary, Accent', editorType: 'color' },
      { id: 'colors-semantic', name: 'Colors Semàntics', description: 'Success, Warning, Error, Info', editorType: 'color' },
      { id: 'colors-neutral', name: 'Colors Neutres', description: 'Escala de grisos', editorType: 'color' },
      { id: 'gradients', name: 'Gradients', description: 'Degradats principals', editorType: 'color' },
      { id: 'shadows', name: 'Ombres', description: 'Box shadows (sm, md, lg, xl)', editorType: 'shadow' },
      { id: 'radius', name: 'Border Radius', description: 'Cantonades (sm, md, lg, full)', editorType: 'radius' },
      { id: 'spacing', name: 'Espaiat', description: 'Margins i paddings', editorType: 'spacing' },
    ]
  },
  {
    id: 'tipografia',
    label: 'Tipografia',
    icon: Type,
    color: '#F59E0B',
    description: 'Fonts, mides i pesos tipogràfics',
    elements: [
      { id: 'fonts-family', name: 'Fonts', description: 'Famílies tipogràfiques', editorType: 'typography' },
      { id: 'fonts-headings', name: 'Títols', description: 'H1, H2, H3, H4, H5, H6', editorType: 'typography' },
      { id: 'fonts-body', name: 'Cos', description: 'Paràgrafs i text', editorType: 'typography' },
      { id: 'fonts-ui', name: 'UI Text', description: 'Labels, buttons, inputs', editorType: 'typography' },
      { id: 'fonts-weights', name: 'Pesos', description: 'Light, Regular, Medium, Bold', editorType: 'typography' },
    ]
  },
  {
    id: 'layouts',
    label: 'Layouts',
    icon: Layout,
    color: '#06B6D4',
    description: 'Sistema de grid, containers i breakpoints',
    elements: [
      { id: 'grid-system', name: 'Grid', description: 'Sistema de columnes', editorType: 'spacing' },
      { id: 'containers', name: 'Containers', description: 'Amplades màximes', editorType: 'spacing' },
      { id: 'breakpoints', name: 'Breakpoints', description: 'Responsive (sm, md, lg, xl)', editorType: 'spacing' },
      { id: 'sidebar-width', name: 'Sidebar', description: 'Amplada barra lateral', editorType: 'spacing' },
      { id: 'header-height', name: 'Header', description: 'Alçada capçalera', editorType: 'spacing' },
    ]
  },
  {
    id: 'menus',
    label: 'Menús',
    icon: Menu,
    color: '#EF4444',
    description: 'Configuració de menús i navegació',
    elements: [
      { id: 'sidebar-admin', name: 'Sidebar Admin', description: 'Menú administració', editorType: 'menu' },
      { id: 'sidebar-gestio', name: 'Sidebar Gestió', description: 'Menú gestió empreses', editorType: 'menu' },
      { id: 'sidebar-empresa', name: 'Sidebar Empresa', description: 'Menú dashboard empresa', editorType: 'menu' },
      { id: 'sidebar-empleat', name: 'Sidebar Empleat', description: 'Menú empleat públic', editorType: 'menu' },
      { id: 'mobile-menu', name: 'Menú Mòbil', description: 'Navegació mòbil', editorType: 'menu' },
    ]
  },
  {
    id: 'headers',
    label: 'Headers',
    icon: PanelTop,
    color: '#EC4899',
    description: 'Capçaleres i breadcrumbs',
    elements: [
      { id: 'header-main', name: 'Header Principal', description: 'Capçalera web pública', editorType: 'component' },
      { id: 'header-admin', name: 'Header Admin', description: 'Capçalera administració', editorType: 'component' },
      { id: 'header-empresa', name: 'Header Empresa', description: 'Capçalera dashboard empresa', editorType: 'component' },
      { id: 'breadcrumbs', name: 'Breadcrumbs', description: 'Ruta de navegació', editorType: 'component' },
    ]
  },
  {
    id: 'botons',
    label: 'Botons',
    icon: MousePointer,
    color: '#14B8A6',
    description: 'Variants i mides de botons',
    elements: [
      { id: 'btn-primary', name: 'Primary', description: 'Botó principal', editorType: 'button' },
      { id: 'btn-secondary', name: 'Secondary', description: 'Botó secundari', editorType: 'button' },
      { id: 'btn-outline', name: 'Outline', description: 'Botó contorn', editorType: 'button' },
      { id: 'btn-ghost', name: 'Ghost', description: 'Botó transparent', editorType: 'button' },
      { id: 'btn-danger', name: 'Danger', description: 'Botó perill', editorType: 'button' },
      { id: 'btn-sizes', name: 'Mides', description: 'XS, SM, MD, LG, XL', editorType: 'button' },
    ]
  },
  {
    id: 'cards',
    label: 'Cards',
    icon: CreditCard,
    color: '#A855F7',
    description: 'Targetes i containers',
    elements: [
      { id: 'card-base', name: 'Card Base', description: 'Targeta bàsica', editorType: 'card' },
      { id: 'card-header', name: 'Card amb Header', description: 'Amb capçalera', editorType: 'card' },
      { id: 'card-stats', name: 'Card Stats', description: 'Estadístiques', editorType: 'card' },
      { id: 'card-action', name: 'Card Acció', description: 'Amb botons', editorType: 'card' },
      { id: 'card-hover', name: 'Card Hover', description: 'Efectes hover', editorType: 'card' },
    ]
  },
  {
    id: 'emails',
    label: 'Emails',
    icon: Mail,
    color: '#F97316',
    description: 'Templates i estils d\'emails',
    elements: [
      { id: 'email-welcome', name: 'Benvinguda', description: 'Email nou usuari', editorType: 'email' },
      { id: 'email-notification', name: 'Notificació', description: 'Avisos generals', editorType: 'email' },
      { id: 'email-published', name: 'Publicació', description: 'Empresa publicada', editorType: 'email' },
      { id: 'email-offer', name: 'Nova Oferta', description: 'Alerta d\'oferta', editorType: 'email' },
      { id: 'email-styles', name: 'Estils Email', description: 'Colors i fonts', editorType: 'email' },
    ]
  },
  {
    id: 'icones',
    label: 'Icones',
    icon: Sparkles,
    color: '#64748B',
    description: 'Conjunt d\'icones i símbols',
    elements: [
      { id: 'icons-navigation', name: 'Navegació', description: 'Icones de menú', editorType: 'component' },
      { id: 'icons-actions', name: 'Accions', description: 'Icones d\'acció', editorType: 'component' },
      { id: 'icons-status', name: 'Estat', description: 'Icones d\'estat', editorType: 'component' },
      { id: 'icons-social', name: 'Social', description: 'Xarxes socials', editorType: 'component' },
    ]
  },
]

// Helper functions
export function getCategoryById(categoryId: string): DesignCategory | undefined {
  return designCategories.find(c => c.id === categoryId)
}

export function getElementById(categoryId: string, elementId: string): DesignElement | undefined {
  const category = getCategoryById(categoryId)
  return category?.elements.find(e => e.id === elementId)
}

export function getAllElements(): { category: DesignCategory; element: DesignElement }[] {
  return designCategories.flatMap(category =>
    category.elements.map(element => ({ category, element }))
  )
}

export function getElementsByType(editorType: DesignElement['editorType']): { category: DesignCategory; element: DesignElement }[] {
  return getAllElements().filter(({ element }) => element.editorType === editorType)
}
