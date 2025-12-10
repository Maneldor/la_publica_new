// lib/gestio-empreses/ia-lead-client-actions.ts
'use client'

import { GeneratedLead } from './ia-lead-actions'

/**
 * Guardar leads seleccionats (CLIENT SIDE)
 * Esta función se ejecuta en el cliente y puede hacer fetch a APIs
 */
export async function saveGeneratedLeads(
  generationId: string,
  leads: GeneratedLead[],
  userId: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const response = await fetch(`${baseUrl}/api/leads/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generationId, leads }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error guardant els leads: ${error}`)
    }

    const result = await response.json()
    return result.leads
  } catch (error) {
    console.error('Error guardant leads:', error)
    throw error
  }
}