import { getEmpresesLlista, getEmpresesStats, getGestorsPerFiltre } from '@/lib/gestio-empreses/actions/empreses-llista-actions'
import { EmpresesClientPage } from './EmpresesClient'

export default async function EmpresesPage() {
  // Fetch initial data on the server (parallel)
  const [empresesRes, statsRes, gestorsRes] = await Promise.all([
    getEmpresesLlista(), // TODO: Pass searchParams here when URL filters are implemented
    getEmpresesStats(),
    getGestorsPerFiltre()
  ])

  // Extract data safely
  const initialEmpreses = empresesRes.success && empresesRes.data ? empresesRes.data : []
  const initialStats = statsRes.success && statsRes.data ? statsRes.data : null
  const initialGestors = gestorsRes.success && gestorsRes.data ? gestorsRes.data : []

  return (
    <EmpresesClientPage
      initialEmpreses={initialEmpreses}
      initialStats={initialStats}
      initialGestors={initialGestors}
    />
  )
}