/**
 * Genera contrasenya automàtica per usuaris creats des d'admin
 * Patró: [3 primeres lletres nick] + [data ddmmaaaa] + [última lletra nom]
 * Exemple: nick "malote", nom "Manel", data 18/12/2025 → "mal18122025l"
 */
export function generateUserPassword(nick: string, firstName: string, date?: Date): string {
  const d = date || new Date()

  // Netejar nick (treure @ si existeix) i agafar les 3 primeres lletres
  const nickClean = nick.replace('@', '').toLowerCase()
  const nickPart = nickClean.substring(0, 3).padEnd(3, 'x') // Pad si el nick és més curt

  // Format de data: ddmmaaaa
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear().toString()
  const datePart = `${day}${month}${year}`

  // Última lletra del nom
  const namePart = firstName.toLowerCase().slice(-1) || 'x'

  return `${nickPart}${datePart}${namePart}`
}

/**
 * Valida la fortalesa d'una contrasenya
 * @returns puntuació de 0 a 5
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  return strength
}

/**
 * Valida si una contrasenya compleix els requisits mínims
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password) {
    return { valid: false, errors: ['La contrasenya és obligatòria'] }
  }

  if (password.length < 8) {
    errors.push('Mínim 8 caràcters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Ha de tenir almenys una majúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Ha de tenir almenys una minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Ha de tenir almenys un número')
  }

  return { valid: errors.length === 0, errors }
}
