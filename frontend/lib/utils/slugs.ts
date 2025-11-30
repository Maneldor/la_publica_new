// Función para convertir nombre de empresa a slug amigable
export function createCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones múltiples con un solo guión
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
}

// Función para convertir slug de vuelta a nombre (para mostrar)
export function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}