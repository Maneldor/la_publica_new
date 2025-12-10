// app/gestio/empreses/[id]/completar/page.tsx
import { notFound } from 'next/navigation'
import { CompletarEmpresaWizard } from './CompletarEmpresaWizard'
import { prismaClient as prisma } from '@/lib/prisma'

interface Props {
  params: { id: string }
}

// Función para calcular percentatge de completitud
function calculateCompletionPercentage(empresa: any): number {
  const requiredFields = [
    'name', 'cif', 'email', 'description', 'logo',
    'phone', 'address', 'website', 'sector'
  ]

  let completed = 0
  requiredFields.forEach(field => {
    if (empresa[field]) completed++
  })

  return Math.round((completed / requiredFields.length) * 100)
}

// Función temporal para obtener empresa sin autenticación
async function getEmpresaData(id: string) {
  try {
    const empresa = await prisma.company.findUnique({
      where: { id },
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!empresa) {
      return { data: null }
    }

    // Calcular percentatge de completitud
    const completionPercentage = calculateCompletionPercentage(empresa)

    return {
      data: {
        ...empresa,
        completionPercentage
      }
    }
  } catch (error) {
    console.error('Error obtenint empresa:', error)
    return { data: null }
  }
}

export async function generateMetadata({ params }: Props) {
  const result = await getEmpresaData(params.id)
  return {
    title: result.data
      ? `Completar Perfil - ${result.data.name} | La Pública`
      : 'Empresa no trobada | La Pública'
  }
}

export default async function CompletarEmpresaPage({ params }: Props) {
  const result = await getEmpresaData(params.id)

  if (!result.data) {
    notFound()
  }

  return <CompletarEmpresaWizard empresa={result.data} />
}