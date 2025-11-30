import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar classes de Tailwind amb clsx i tailwind-merge
export function combineIconStyles(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Variants d'estil per als iconos
export type IconVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'muted'
  | 'disabled';

// Mides disponibles
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Estils per a cada variant
export const iconVariantStyles: Record<IconVariant, string> = {
  default: 'text-gray-600',
  primary: 'text-blue-600',
  secondary: 'text-purple-600',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-sky-600',
  muted: 'text-gray-400',
  disabled: 'text-gray-300 opacity-50',
};

// Valors numèrics de les mides (en píxels, per @mdi/react)
export const iconSizeValues: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
};

// Estils d'interacció opcionals
export const iconInteractionStyles = {
  hover: 'transition-colors duration-200 hover:opacity-80',
  clickable: 'cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95',
  disabled: 'cursor-not-allowed opacity-50',
};

// Presets predefinits per a casos d'ús comuns
export const iconPresets = {
  // Navegació
  nav: combineIconStyles(iconVariantStyles.default, iconInteractionStyles.hover),
  navActive: combineIconStyles(iconVariantStyles.primary, iconInteractionStyles.hover),

  // Botons
  button: combineIconStyles(iconVariantStyles.default, iconInteractionStyles.clickable),
  buttonPrimary: combineIconStyles(iconVariantStyles.primary, iconInteractionStyles.clickable),
  buttonDanger: combineIconStyles(iconVariantStyles.error, iconInteractionStyles.clickable),

  // Estats
  success: combineIconStyles(iconVariantStyles.success),
  error: combineIconStyles(iconVariantStyles.error),
  warning: combineIconStyles(iconVariantStyles.warning),

  // UI elements
  subtle: combineIconStyles(iconVariantStyles.muted),
  decorative: combineIconStyles(iconVariantStyles.muted, 'opacity-60'),
};

// Funcions d'utilitat
export function getVariantStyle(variant: IconVariant): string {
  return iconVariantStyles[variant];
}

export function getSizeValue(size: IconSize): number {
  return iconSizeValues[size];
}