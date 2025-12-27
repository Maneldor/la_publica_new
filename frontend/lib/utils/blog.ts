/**
 * Utilitats per al sistema de blog
 */

/**
 * Calcula el temps de lectura estimat en minuts
 */
export function calculateReadingTime(html: string): number {
  // Eliminar HTML tags
  const text = html.replace(/<[^>]*>/g, '')
  // Comptar paraules
  const words = text.trim().split(/\s+/).length
  // ~200 paraules per minut
  return Math.max(1, Math.ceil(words / 200))
}

/**
 * Genera un slug a partir d'un text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Eliminar accents
    .replace(/[^a-z0-9]+/g, '-')       // Substituir no-alfanumèrics per guions
    .replace(/(^-|-$)/g, '')           // Eliminar guions al principi/final
}

/**
 * Extreu el primer paràgraf com a excerpt
 */
export function extractExcerpt(html: string, maxLength: number = 300): string {
  const text = html.replace(/<[^>]*>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Formata una data de manera relativa
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diff = now.getTime() - targetDate.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Fa uns minuts'
  if (hours < 24) return `Fa ${hours}h`
  if (days < 2) return 'Ahir'
  if (days < 7) return `Fa ${days} dies`
  return targetDate.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
