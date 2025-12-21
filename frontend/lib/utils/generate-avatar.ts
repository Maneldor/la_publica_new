/**
 * Tipus d'administració pública
 */
export type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL'

/**
 * Genera URL d'avatar amb inicials
 */
export function generateAvatarUrl(firstName: string, lastName: string, bgColor?: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const color = bgColor || getRandomAvatarColor()
  // Usar ui-avatars.com per generar avatar amb inicials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.replace('#', '')}&color=fff&size=200&bold=true&font-size=0.4`
}

/**
 * Genera color de fons aleatori per avatar
 */
export function getRandomAvatarColor(): string {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Obtiene gradient de Tailwind per portada segons tipus d'administració
 */
export function getCoverGradientByAdministration(administration: AdministrationType): string {
  const gradients: Record<AdministrationType, string> = {
    LOCAL: 'from-green-100 to-green-200',       // Verd suau
    AUTONOMICA: 'from-blue-100 to-blue-200',    // Blau suau
    CENTRAL: 'from-violet-100 to-violet-200',   // Violeta suau
  }
  return gradients[administration] || 'from-gray-100 to-gray-200'
}

/**
 * Obtiene color sòlid de portada segons tipus d'administració
 */
export function getCoverSolidColorByAdministration(administration: AdministrationType): string {
  const colors: Record<AdministrationType, string> = {
    LOCAL: '#bbf7d0',      // green-200
    AUTONOMICA: '#bfdbfe', // blue-200
    CENTRAL: '#ddd6fe',    // violet-200
  }
  return colors[administration] || '#e5e7eb' // gray-200
}

/**
 * Obtiene CSS gradient per portada segons tipus d'administració
 */
export function getCoverCSSGradientByAdministration(administration: AdministrationType): string {
  const gradients: Record<AdministrationType, string> = {
    LOCAL: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',       // Verd suau
    AUTONOMICA: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 100%)',  // Blau suau
    CENTRAL: 'linear-gradient(135deg, #c4b5fd 0%, #ddd6fe 100%)',     // Violeta suau
  }
  return gradients[administration] || 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)'
}

/**
 * Obtiene el badge de color per administració
 */
export function getAdministrationBadgeColors(administration: AdministrationType): {
  bg: string
  text: string
  border: string
} {
  const colors: Record<AdministrationType, { bg: string; text: string; border: string }> = {
    LOCAL: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    AUTONOMICA: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    CENTRAL: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  }
  return colors[administration] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
}

/**
 * Obtiene el nom llegible de l'administració
 */
export function getAdministrationLabel(administration: AdministrationType): string {
  const labels: Record<AdministrationType, string> = {
    LOCAL: 'Administració Local',
    AUTONOMICA: 'Administració Autonòmica',
    CENTRAL: 'Administració Central',
  }
  return labels[administration] || 'Administració'
}
