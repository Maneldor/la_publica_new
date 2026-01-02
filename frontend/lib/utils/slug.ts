import { PrismaClient } from '@prisma/client'

/**
 * Genera un slug a partir d'un nom
 * @example "Tech Solutions Barcelona" → "tech-solutions-barcelona"
 * @example "Empresa Catalana d'Exemple" → "empresa-catalana-dexemple"
 * @example "Café & Restaurant La Plaça" → "cafe-restaurant-la-placa"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')                     // Eliminar accents
    .replace(/[\u0300-\u036f]/g, '')      // Eliminar diacrítics
    .replace(/[^a-z0-9\s-]/g, '')         // Eliminar caràcters especials
    .replace(/\s+/g, '-')                 // Espais per guions
    .replace(/-+/g, '-')                  // Múltiples guions per un
    .replace(/^-|-$/g, '')                // Eliminar guions al principi/final
    .slice(0, 100)                        // Limitar longitud
}

/**
 * Genera un slug únic comprovant que no existeixi a la base de dades
 */
export async function generateUniqueSlug(
  name: string,
  prisma: PrismaClient,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  // Comprovar si ja existeix
  while (true) {
    const existing = await prisma.company.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    })

    if (!existing) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Comprova si un string sembla un ID aleatori (no un slug llegible)
 */
export function isRandomId(slug: string | null | undefined): boolean {
  if (!slug) return true

  // Els IDs aleatoris solen ser llargs i tenir un patró específic
  // Ex: cmjplipe600014vqhkfv46g3k (25+ chars, sense guions o molt pocs)
  const hasNormalPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
  const hasMeaningfulWords = slug.split('-').some(word => word.length > 2 && word.length < 20)

  return slug.length > 24 && !hasMeaningfulWords
}
