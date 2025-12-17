// app/gestio/admin/pipeline/page.tsx
// Redirigir al pipeline unificado
import { redirect } from 'next/navigation'

export default function AdminPipelinePage() {
  redirect('/gestio/pipeline')
}
