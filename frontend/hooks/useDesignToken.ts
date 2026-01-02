'use client'

import { useEffect, useState } from 'react'

/**
 * Hook per obtenir el valor d'un token del Design System
 *
 * @param tokenName - Nom del token sense el prefix "--" (ex: "color-primary", "font-size-h1")
 * @returns El valor del token o null si no existeix
 *
 * @example
 * const primaryColor = useDesignToken('color-primary')
 * // primaryColor = "#1E3A5F"
 *
 * const fontSize = useDesignToken('font-size-h1')
 * // fontSize = "2.5rem"
 */
export function useDesignToken(tokenName: string): string | null {
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    // Llegir del CSS computed
    const root = document.documentElement
    const cssValue = getComputedStyle(root).getPropertyValue(`--${tokenName}`)
    setValue(cssValue.trim() || null)
  }, [tokenName])

  return value
}

/**
 * Hook per obtenir múltiples tokens del Design System
 *
 * @param tokenNames - Array de noms de tokens sense el prefix "--"
 * @returns Objecte amb els valors dels tokens
 *
 * @example
 * const tokens = useDesignTokens(['color-primary', 'color-secondary'])
 * // tokens = { 'color-primary': '#1E3A5F', 'color-secondary': '#2E7D32' }
 */
export function useDesignTokens(tokenNames: string[]): Record<string, string | null> {
  const [values, setValues] = useState<Record<string, string | null>>({})

  useEffect(() => {
    const root = document.documentElement
    const newValues: Record<string, string | null> = {}

    for (const tokenName of tokenNames) {
      const cssValue = getComputedStyle(root).getPropertyValue(`--${tokenName}`)
      newValues[tokenName] = cssValue.trim() || null
    }

    setValues(newValues)
  }, [tokenNames])

  return values
}

/**
 * Funció per obtenir un token de forma síncrona (útil per SSR fallbacks)
 * Retorna el valor per defecte si el token no existeix
 *
 * @param tokenName - Nom del token sense el prefix "--"
 * @param defaultValue - Valor per defecte si el token no existeix
 * @returns El valor del token o el valor per defecte
 */
export function getDesignToken(tokenName: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const root = document.documentElement
  const cssValue = getComputedStyle(root).getPropertyValue(`--${tokenName}`)
  return cssValue.trim() || defaultValue
}

/**
 * Funció per obtenir la variable CSS amb el format var(--token-name)
 * Útil per usar directament en styles
 *
 * @param tokenName - Nom del token sense el prefix "--"
 * @param fallback - Valor de fallback opcional
 * @returns String amb format var(--token-name) o var(--token-name, fallback)
 *
 * @example
 * const style = { color: cssVar('color-primary') }
 * // style = { color: 'var(--color-primary)' }
 *
 * const style = { color: cssVar('color-primary', '#1E3A5F') }
 * // style = { color: 'var(--color-primary, #1E3A5F)' }
 */
export function cssVar(tokenName: string, fallback?: string): string {
  if (fallback) {
    return `var(--${tokenName}, ${fallback})`
  }
  return `var(--${tokenName})`
}
