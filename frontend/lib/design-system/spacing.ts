/**
 * SISTEMA DE DISEÑO - LA PÚBLICA
 *
 * Archivo de referencia para mantener consistencia visual en toda la plataforma.
 * Usar estas constantes y clases en todas las páginas.
 */

// ============================================
// ESPACIADO DE PÁGINA (Page Layout)
// ============================================

export const PAGE_SPACING = {
  // Padding del contenedor principal de página
  container: 'px-6 py-6',           // Espaciado lateral y superior
  containerLg: 'px-8 py-8',         // Para pantallas grandes

  // Márgenes entre secciones principales
  sectionGap: 'space-y-6',          // Gap entre secciones (24px)
  sectionGapLg: 'space-y-8',        // Gap mayor (32px)

  // Padding interno de cards/secciones
  cardPadding: 'p-4',               // Padding estándar de cards (16px)
  cardPaddingLg: 'p-6',             // Padding mayor (24px)

  // Gap entre elementos dentro de cards
  contentGap: 'space-y-4',          // Gap entre elementos (16px)
  contentGapSm: 'space-y-3',        // Gap pequeño (12px)
  contentGapLg: 'space-y-6',        // Gap grande (24px)
} as const

// ============================================
// TIPOGRAFÍA (Typography)
// ============================================

export const TYPOGRAPHY = {
  // Títulos de página (h1)
  pageTitle: 'text-2xl font-bold text-gray-900',
  pageTitleLg: 'text-3xl font-bold text-gray-900',

  // Subtítulos de página
  pageSubtitle: 'text-sm text-gray-500',

  // Títulos de sección/card (h2)
  sectionTitle: 'text-lg font-semibold text-gray-900',

  // Títulos de subsección (h3)
  subsectionTitle: 'text-base font-semibold text-gray-900',

  // Texto de cuerpo
  body: 'text-sm text-gray-600',
  bodyLg: 'text-base text-gray-600',

  // Texto pequeño / labels
  small: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',

  // Links
  link: 'text-sm text-indigo-600 hover:text-indigo-800 font-medium',
} as const

// ============================================
// CARDS Y CONTENEDORES
// ============================================

export const CARDS = {
  // Card estándar
  base: 'bg-white rounded-xl border border-gray-200 shadow-sm',

  // Card con hover
  interactive: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow',

  // Card destacada (con color de fondo)
  highlighted: 'rounded-xl border shadow-sm',

  // Header de card
  header: 'flex items-center justify-between px-5 py-4 border-b border-gray-100',

  // Cuerpo de card
  body: 'p-5',
  bodyCompact: 'p-4',
} as const

// ============================================
// GRIDS Y LAYOUTS
// ============================================

export const LAYOUTS = {
  // Grid de 2 columnas
  twoColumns: 'grid grid-cols-1 lg:grid-cols-2 gap-6',

  // Grid de 3 columnas
  threeColumns: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',

  // Grid de 4 columnas (stats)
  fourColumns: 'grid grid-cols-2 lg:grid-cols-4 gap-4',

  // Layout con sidebar
  withSidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  mainContent: 'lg:col-span-2',
  sidebar: 'lg:col-span-1 space-y-6',

  // Flex layouts
  flexBetween: 'flex items-center justify-between',
  flexCenter: 'flex items-center justify-center',
  flexStart: 'flex items-center gap-3',
} as const

// ============================================
// BREADCRUMB
// ============================================

export const BREADCRUMB = {
  container: 'flex items-center gap-2 text-sm text-gray-500 mb-6',
  separator: 'text-gray-300',
  link: 'hover:text-gray-700 transition-colors',
  current: 'text-gray-900 font-medium',
} as const

// ============================================
// ICONOS EN HEADERS
// ============================================

export const ICON_SIZES = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',

  // Para iconos dentro de círculos/cuadrados
  containerSm: 'w-8 h-8',
  containerMd: 'w-10 h-10',
  containerLg: 'w-12 h-12',
} as const

// ============================================
// BOTONES
// ============================================

export const BUTTONS = {
  // Botón primario
  primary: 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm',

  // Botón secundario
  secondary: 'px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm',

  // Botón ghost
  ghost: 'px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm',

  // Botón de icono
  icon: 'p-2 rounded-lg hover:bg-gray-100 transition-colors',
  iconSm: 'p-1.5 rounded-lg hover:bg-gray-100 transition-colors',
} as const

// ============================================
// COLORES SEMÁNTICOS
// ============================================

export const COLORS = {
  // Estados
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
} as const
