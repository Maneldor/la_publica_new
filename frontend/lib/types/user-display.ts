/**
 * Preferència de visualització del nom d'usuari
 * - NICK: Mostra només el nick (@usuari)
 * - NOM: Mostra només el nom de pila
 * - NOM_COGNOM: Mostra nom i primer cognom
 */
export type UserDisplayPreference = 'NICK' | 'NOM' | 'NOM_COGNOM'

/**
 * Interfície bàsica d'usuari per visualització
 */
export interface UserDisplayInfo {
  nick: string
  firstName: string
  lastName: string
  secondLastName?: string
  displayPreference?: UserDisplayPreference
}

/**
 * Obté el nom a mostrar segons la preferència de l'usuari
 */
export function getDisplayName(
  user: UserDisplayInfo,
  preference?: UserDisplayPreference
): string {
  const pref = preference || user.displayPreference || 'NICK'

  switch (pref) {
    case 'NICK':
      return `@${user.nick}`
    case 'NOM':
      return user.firstName
    case 'NOM_COGNOM':
      return `${user.firstName} ${user.lastName}`
    default:
      return `@${user.nick}`
  }
}

/**
 * Obté el nom complet de l'usuari (sense tenir en compte la preferència)
 */
export function getFullName(user: UserDisplayInfo): string {
  const parts = [user.firstName, user.lastName]
  if (user.secondLastName) {
    parts.push(user.secondLastName)
  }
  return parts.filter(Boolean).join(' ')
}

/**
 * Obté les inicials de l'usuari per l'avatar
 */
export function getInitials(user: UserDisplayInfo): string {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

/**
 * Opcions disponibles de visualització amb etiquetes
 */
export function getDisplayPreferenceOptions(user: UserDisplayInfo): Array<{
  value: UserDisplayPreference
  label: string
  description: string
}> {
  return [
    {
      value: 'NICK',
      label: `@${user.nick || 'nick'}`,
      description: 'Només el nick'
    },
    {
      value: 'NOM',
      label: user.firstName || 'Nom',
      description: 'Només el nom'
    },
    {
      value: 'NOM_COGNOM',
      label: `${user.firstName || 'Nom'} ${user.lastName || 'Cognom'}`,
      description: 'Nom i primer cognom'
    }
  ]
}
