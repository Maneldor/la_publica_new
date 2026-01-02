'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'
import { CompanySingle, CompanySingleData } from '@/components/empreses/CompanySingle'

export default function EmpresaSinglePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [company, setCompany] = useState<CompanySingleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const response = await fetch(`/api/dashboard/empreses/${params.slug}`)
        const result = await response.json()

        if (result.success && result.data) {
          setCompany(result.data)
        } else {
          setError(result.error || 'Empresa no trobada')
        }
      } catch (err) {
        setError('Error carregant empresa')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Building2 className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Empresa no trobada</h2>
        <p className="text-slate-500 mb-4">{error || 'No s\'ha pogut carregar l\'empresa'}</p>
        <button
          onClick={() => router.push('/dashboard/empreses')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tornar a empreses
        </button>
      </div>
    )
  }

  return (
    <CompanySingle
      company={company}
      backUrl="/dashboard/empreses"
    />
  )
}
