// Design System Default Values
// Valors per defecte de tots els tokens del design system

export interface ColorToken {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface TypographyToken {
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing?: string
  cssVariable?: string
}

export interface SpacingToken {
  name: string
  value: string
  cssVariable: string
}

export interface ShadowToken {
  name: string
  value: string
  cssVariable: string
}

export interface RadiusToken {
  name: string
  value: string
  cssVariable: string
}

// Colors per defecte
export const defaultColors: Record<string, ColorToken[]> = {
  primary: [
    { name: 'primary', value: '#1E3A5F', cssVariable: '--color-primary', description: 'Color principal de la marca' },
    { name: 'primary-light', value: '#2E5A8F', cssVariable: '--color-primary-light', description: 'Variant clara' },
    { name: 'primary-dark', value: '#0E2A4F', cssVariable: '--color-primary-dark', description: 'Variant fosca' },
    { name: 'primary-50', value: '#EEF4FA', cssVariable: '--color-primary-50' },
    { name: 'primary-100', value: '#D4E4F4', cssVariable: '--color-primary-100' },
    { name: 'primary-500', value: '#1E3A5F', cssVariable: '--color-primary-500' },
    { name: 'primary-600', value: '#183250', cssVariable: '--color-primary-600' },
    { name: 'primary-700', value: '#122A42', cssVariable: '--color-primary-700' },
  ],
  secondary: [
    { name: 'secondary', value: '#2E7D32', cssVariable: '--color-secondary', description: 'Color secundari' },
    { name: 'secondary-light', value: '#4CAF50', cssVariable: '--color-secondary-light' },
    { name: 'secondary-dark', value: '#1B5E20', cssVariable: '--color-secondary-dark' },
  ],
  accent: [
    { name: 'accent', value: '#FF6B35', cssVariable: '--color-accent', description: 'Color d\'accent' },
    { name: 'accent-light', value: '#FF8A5B', cssVariable: '--color-accent-light' },
    { name: 'accent-dark', value: '#E55A24', cssVariable: '--color-accent-dark' },
  ],
  semantic: [
    { name: 'success', value: '#10B981', cssVariable: '--color-success', description: 'Accions correctes' },
    { name: 'warning', value: '#F59E0B', cssVariable: '--color-warning', description: 'Avisos' },
    { name: 'error', value: '#EF4444', cssVariable: '--color-error', description: 'Errors' },
    { name: 'info', value: '#3B82F6', cssVariable: '--color-info', description: 'Informació' },
  ],
  neutral: [
    { name: 'white', value: '#FFFFFF', cssVariable: '--color-white' },
    { name: 'black', value: '#000000', cssVariable: '--color-black' },
    { name: 'slate-50', value: '#F8FAFC', cssVariable: '--color-slate-50' },
    { name: 'slate-100', value: '#F1F5F9', cssVariable: '--color-slate-100' },
    { name: 'slate-200', value: '#E2E8F0', cssVariable: '--color-slate-200' },
    { name: 'slate-300', value: '#CBD5E1', cssVariable: '--color-slate-300' },
    { name: 'slate-400', value: '#94A3B8', cssVariable: '--color-slate-400' },
    { name: 'slate-500', value: '#64748B', cssVariable: '--color-slate-500' },
    { name: 'slate-600', value: '#475569', cssVariable: '--color-slate-600' },
    { name: 'slate-700', value: '#334155', cssVariable: '--color-slate-700' },
    { name: 'slate-800', value: '#1E293B', cssVariable: '--color-slate-800' },
    { name: 'slate-900', value: '#0F172A', cssVariable: '--color-slate-900' },
  ],
  background: [
    { name: 'background', value: '#FFFFFF', cssVariable: '--color-background', description: 'Fons principal' },
    { name: 'background-alt', value: '#F8FAFC', cssVariable: '--color-background-alt', description: 'Fons alternatiu' },
    { name: 'surface', value: '#FFFFFF', cssVariable: '--color-surface', description: 'Superfícies (cards)' },
    { name: 'overlay', value: 'rgba(0, 0, 0, 0.5)', cssVariable: '--color-overlay', description: 'Overlay modals' },
  ],
  text: [
    { name: 'text-primary', value: '#0F172A', cssVariable: '--color-text-primary', description: 'Text principal' },
    { name: 'text-secondary', value: '#475569', cssVariable: '--color-text-secondary', description: 'Text secundari' },
    { name: 'text-muted', value: '#94A3B8', cssVariable: '--color-text-muted', description: 'Text atenuat' },
    { name: 'text-inverse', value: '#FFFFFF', cssVariable: '--color-text-inverse', description: 'Text sobre fons fosc' },
  ],
  border: [
    { name: 'border', value: '#E2E8F0', cssVariable: '--color-border', description: 'Vora per defecte' },
    { name: 'border-light', value: '#F1F5F9', cssVariable: '--color-border-light' },
    { name: 'border-dark', value: '#CBD5E1', cssVariable: '--color-border-dark' },
  ],
}

// Tipografia per defecte
export const defaultTypography: Record<string, TypographyToken[]> = {
  family: [
    { name: 'font-sans', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '', fontWeight: '', lineHeight: '', cssVariable: '--font-sans' },
    { name: 'font-mono', fontFamily: 'JetBrains Mono, monospace', fontSize: '', fontWeight: '', lineHeight: '', cssVariable: '--font-mono' },
  ],
  headings: [
    { name: 'h1', fontFamily: 'Inter', fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem', letterSpacing: '-0.025em', cssVariable: '--text-h1' },
    { name: 'h2', fontFamily: 'Inter', fontSize: '1.875rem', fontWeight: '600', lineHeight: '2.25rem', letterSpacing: '-0.025em', cssVariable: '--text-h2' },
    { name: 'h3', fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem', cssVariable: '--text-h3' },
    { name: 'h4', fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem', cssVariable: '--text-h4' },
    { name: 'h5', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5rem', cssVariable: '--text-h5' },
    { name: 'h6', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem', cssVariable: '--text-h6' },
  ],
  body: [
    { name: 'body-xl', fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: '400', lineHeight: '1.75rem', cssVariable: '--text-body-xl' },
    { name: 'body-lg', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.75rem', cssVariable: '--text-body-lg' },
    { name: 'body', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem', cssVariable: '--text-body' },
    { name: 'body-sm', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25rem', cssVariable: '--text-body-sm' },
    { name: 'body-xs', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', cssVariable: '--text-body-xs' },
  ],
  ui: [
    { name: 'label', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25rem', cssVariable: '--text-label' },
    { name: 'button', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25rem', cssVariable: '--text-button' },
    { name: 'caption', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', cssVariable: '--text-caption' },
    { name: 'overline', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '600', lineHeight: '1rem', letterSpacing: '0.05em', cssVariable: '--text-overline' },
  ],
}

// Espaiat per defecte
export const defaultSpacing: SpacingToken[] = [
  { name: 'spacing-0', value: '0', cssVariable: '--spacing-0' },
  { name: 'spacing-1', value: '0.25rem', cssVariable: '--spacing-1' },
  { name: 'spacing-2', value: '0.5rem', cssVariable: '--spacing-2' },
  { name: 'spacing-3', value: '0.75rem', cssVariable: '--spacing-3' },
  { name: 'spacing-4', value: '1rem', cssVariable: '--spacing-4' },
  { name: 'spacing-5', value: '1.25rem', cssVariable: '--spacing-5' },
  { name: 'spacing-6', value: '1.5rem', cssVariable: '--spacing-6' },
  { name: 'spacing-8', value: '2rem', cssVariable: '--spacing-8' },
  { name: 'spacing-10', value: '2.5rem', cssVariable: '--spacing-10' },
  { name: 'spacing-12', value: '3rem', cssVariable: '--spacing-12' },
  { name: 'spacing-16', value: '4rem', cssVariable: '--spacing-16' },
  { name: 'spacing-20', value: '5rem', cssVariable: '--spacing-20' },
  { name: 'spacing-24', value: '6rem', cssVariable: '--spacing-24' },
]

// Ombres per defecte
export const defaultShadows: ShadowToken[] = [
  { name: 'shadow-none', value: 'none', cssVariable: '--shadow-none' },
  { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', cssVariable: '--shadow-sm' },
  { name: 'shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', cssVariable: '--shadow' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-md' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-lg' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-xl' },
  { name: 'shadow-2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)', cssVariable: '--shadow-2xl' },
  { name: 'shadow-inner', value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', cssVariable: '--shadow-inner' },
]

// Border radius per defecte
export const defaultRadius: RadiusToken[] = [
  { name: 'radius-none', value: '0', cssVariable: '--radius-none' },
  { name: 'radius-sm', value: '0.125rem', cssVariable: '--radius-sm' },
  { name: 'radius', value: '0.25rem', cssVariable: '--radius' },
  { name: 'radius-md', value: '0.375rem', cssVariable: '--radius-md' },
  { name: 'radius-lg', value: '0.5rem', cssVariable: '--radius-lg' },
  { name: 'radius-xl', value: '0.75rem', cssVariable: '--radius-xl' },
  { name: 'radius-2xl', value: '1rem', cssVariable: '--radius-2xl' },
  { name: 'radius-3xl', value: '1.5rem', cssVariable: '--radius-3xl' },
  { name: 'radius-full', value: '9999px', cssVariable: '--radius-full' },
]

// Breakpoints per defecte
export const defaultBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Layout per defecte
export const defaultLayout = {
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '64px',
  headerHeight: '64px',
  footerHeight: '48px',
  containerMaxWidth: '1280px',
  containerPadding: '1.5rem',
}

// Button styles per defecte
export const defaultButtonStyles = {
  primary: {
    background: '#1E3A5F',
    color: '#FFFFFF',
    border: 'none',
    hoverBackground: '#2E5A8F',
    activeBackground: '#0E2A4F',
  },
  secondary: {
    background: '#F1F5F9',
    color: '#334155',
    border: 'none',
    hoverBackground: '#E2E8F0',
    activeBackground: '#CBD5E1',
  },
  outline: {
    background: 'transparent',
    color: '#334155',
    border: '1px solid #E2E8F0',
    hoverBackground: '#F8FAFC',
    activeBackground: '#F1F5F9',
  },
  ghost: {
    background: 'transparent',
    color: '#334155',
    border: 'none',
    hoverBackground: '#F1F5F9',
    activeBackground: '#E2E8F0',
  },
  danger: {
    background: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    hoverBackground: '#DC2626',
    activeBackground: '#B91C1C',
  },
}

// Card styles per defecte
export const defaultCardStyles = {
  base: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  hover: {
    transform: 'translateY(-2px)',
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition: 'all 0.2s ease',
  },
}

// Email styles per defecte
export const defaultEmailStyles = {
  header: {
    background: '#1E3A5F',
    color: '#FFFFFF',
    padding: '24px',
    logoHeight: '40px',
  },
  body: {
    background: '#FFFFFF',
    color: '#334155',
    padding: '32px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  footer: {
    background: '#F8FAFC',
    color: '#64748B',
    padding: '24px',
    fontSize: '12px',
  },
  button: {
    background: '#1E3A5F',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
  },
}

// Export all defaults
export const designSystemDefaults = {
  colors: defaultColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  shadows: defaultShadows,
  radius: defaultRadius,
  breakpoints: defaultBreakpoints,
  layout: defaultLayout,
  buttonStyles: defaultButtonStyles,
  cardStyles: defaultCardStyles,
  emailStyles: defaultEmailStyles,
}
