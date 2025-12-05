'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, FileText, ClipboardCheck } from 'lucide-react'

import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { CompanySelector } from '@/components/gestio-empreses/pressupostos/CompanySelector'
import { BudgetLineForm } from '@/components/gestio-empreses/pressupostos/BudgetLineForm'
import { BudgetLinesList } from '@/components/gestio-empreses/pressupostos/BudgetLinesList'
import { BudgetReview } from '@/components/gestio-empreses/pressupostos/BudgetReview'

import {
  getCompaniesForSelect,
  getPlansForSelect,
  getExtrasForSelect,
  createBudget
} from '@/lib/gestio-empreses/budget-actions'

type BudgetItemType = 'PLAN' | 'EXTRA' | 'CUSTOM' | 'DISCOUNT'
type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME'

interface Company {
  id: string
  name: string
  cif: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
}

interface Plan {
  id: string
  nombre: string
  nombreCorto: string
  precioMensual: number
  precioAnual: number
  icono?: string
}

interface Extra {
  id: string
  name: string
  basePrice: number
  category: string
}

interface BudgetLine {
  id: string
  itemType: BudgetItemType
  planId?: string
  extraId?: string
  description: string
  quantity: number
  unitPrice: number
  billingCycle?: BillingCycle
  subtotal: number
}

const wizardSteps = [
  {
    label: 'Empresa',
    description: 'Seleccionar empresa',
    icon: Building2
  },
  {
    label: 'Línies',
    description: 'Configurar pressupost',
    icon: FileText
  },
  {
    label: 'Revisió',
    description: 'Confirmar i crear',
    icon: ClipboardCheck
  },
]

export default function CrearPressupostPage() {
  const router = useRouter()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Data
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [extras, setExtras] = useState<Extra[]>([])

  // Form state
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])
  const [validUntilDays, setValidUntilDays] = useState(30)
  const [notes, setNotes] = useState('')

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [companiesData, plansData, extrasData] = await Promise.all([
          getCompaniesForSelect(),
          getPlansForSelect(),
          getExtrasForSelect(),
        ])

        setCompanies(companiesData)
        setPlans(plansData)
        setExtras(extrasData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const handleAddBudgetLine = (lineData: Omit<BudgetLine, 'id' | 'subtotal'>) => {
    const id = crypto.randomUUID()
    const subtotal = lineData.quantity * lineData.unitPrice

    const newLine: BudgetLine = {
      ...lineData,
      id,
      subtotal,
    }

    setBudgetLines(prev => [...prev, newLine])
  }

  const handleRemoveBudgetLine = (id: string) => {
    setBudgetLines(prev => prev.filter(line => line.id !== id))
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 1:
        return true // Can always start
      case 2:
        return selectedCompanyId !== ''
      case 3:
        return selectedCompanyId !== '' && budgetLines.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleCreateBudget = async () => {
    if (!selectedCompany) return

    setIsLoading(true)
    try {
      const budgetData = {
        companyId: selectedCompanyId,
        lines: budgetLines,
        validUntilDays,
        notes,
      }

      const newBudget = await createBudget(budgetData)

      // Redirect to budget detail or list
      router.push(`/gestio/admin/pressupostos/${newBudget.id}`)
    } catch (error) {
      console.error('Error creating budget:', error)
      alert('Error al crear el pressupost')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregant...</p>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Seleccionar Empresa
              </h2>
              <p className="text-slate-600">
                Tria l'empresa per la qual vols crear el pressupost
              </p>
            </div>
            <CompanySelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelect={(company) => setSelectedCompanyId(company.id)}
            />
          </div>
        )
      case 2:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Configurar Pressupost
              </h2>
              <p className="text-slate-600">
                Afegeix línies al pressupost amb plans, extras o conceptes personalitzats
              </p>
            </div>
            <div className="space-y-6">
              <BudgetLineForm
                plans={plans}
                extras={extras}
                onAddLine={handleAddBudgetLine}
              />
              <BudgetLinesList
                lines={budgetLines}
                onRemove={handleRemoveBudgetLine}
              />
            </div>
          </div>
        )
      case 3:
        return selectedCompany ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Revisar Pressupost
              </h2>
              <p className="text-slate-600">
                Revisa tota la informació abans de crear el pressupost
              </p>
            </div>
            <BudgetReview
              company={selectedCompany}
              lines={budgetLines}
              validUntilDays={validUntilDays}
              notes={notes}
              onChangeValidDays={setValidUntilDays}
              onChangeNotes={setNotes}
            />
          </div>
        ) : null
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Crear Nou Pressupost"
      description="Wizard de creació de pressupostos"
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={currentStep < 3 ? handleNext : handleCreateBudget}
      onPrev={handlePrev}
      onCancel={() => router.back()}
      canProceed={canProceedToStep(currentStep + 1) || (currentStep === 3 && selectedCompany && budgetLines.length > 0)}
      isLoading={isLoading}
      nextLabel="Següent"
      prevLabel="Anterior"
      finalLabel="Crear Pressupost"
      centerContent={true}
    >
      {renderStepContent()}
    </WizardLayout>
  )
}