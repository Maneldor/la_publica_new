// app/gestio/empreses/[id]/completar/page.tsx
import { notFound, redirect } from 'next/navigation'
import { CompletarEmpresaWizard } from './CompletarEmpresaWizard'
import { getEmpresaPerCompletar } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const result = await getEmpresaPerCompletar(params.id)
  return {
    title: result.success && result.data
      ? `Completar Perfil - ${result.data.name} | La Pública`
      : 'Empresa no trobada | La Pública'
  }
}

export default async function CompletarEmpresaPage({ params }: Props) {
  const result = await getEmpresaPerCompletar(params.id)

  if (!result.success || !result.data) {
    if (result.error === 'No autenticat') {
      redirect('/auth/login')
    }
    notFound()
  }

  return <CompletarEmpresaWizard empresa={result.data} />
}