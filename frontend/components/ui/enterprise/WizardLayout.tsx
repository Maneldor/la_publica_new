'use client'

import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardStep {
  label: string
  description: string
  icon?: any
}

interface WizardLayoutProps {
  title: string
  description: string
  steps: WizardStep[]
  currentStep: number
  children: React.ReactNode
  onNext: () => void
  onPrev: () => void
  onCancel: () => void
  canProceed: boolean
  isLoading?: boolean
  nextLabel?: string
  prevLabel?: string
  finalLabel?: string
  showProgress?: boolean
  centerContent?: boolean
}

export function WizardLayout({
  title,
  description,
  steps,
  currentStep,
  children,
  onNext,
  onPrev,
  onCancel,
  canProceed,
  isLoading = false,
  nextLabel = 'Següent',
  prevLabel = 'Anterior',
  finalLabel = 'Finalitzar',
  showProgress = true,
  centerContent = false
}: WizardLayoutProps) {
  const isFirstStep = currentStep === 1
  const isFinalStep = currentStep === steps.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {title}
                </h1>
                <p className="text-sm text-slate-500">
                  {description}
                </p>
              </div>
            </div>
            {showProgress && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                Pas {currentStep} de {steps.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 py-8",
        centerContent ? "max-w-4xl" : "max-w-7xl"
      )}>
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > index + 1
              const isCurrent = currentStep === index + 1
              const isUpcoming = currentStep < index + 1

              return (
                <div key={index} className="flex items-center">
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                        isCompleted && 'bg-green-500 border-green-500',
                        isCurrent && 'bg-blue-600 border-blue-600',
                        isUpcoming && 'bg-white border-slate-300'
                      )}
                    >
                      {isCompleted ? (
                        <ArrowRight className="h-6 w-6 text-white rotate-90" strokeWidth={2} />
                      ) : StepIcon ? (
                        <StepIcon
                          className={cn(
                            'h-5 w-5',
                            isCurrent ? 'text-white' : 'text-slate-400'
                          )}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <span className={cn(
                          'text-sm font-semibold',
                          isCurrent ? 'text-white' : 'text-slate-400'
                        )}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 hidden md:block">{step.description}</p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-20 md:w-32 h-1 mx-2 rounded-full transition-all',
                        currentStep > index + 1 ? 'bg-green-500' : 'bg-slate-200'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[500px] mb-8">
          {children}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-200">
          <button
            onClick={onPrev}
            disabled={isFirstStep || isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors',
              isFirstStep || isLoading
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            {prevLabel}
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              {steps[currentStep - 1]?.description || `Pas ${currentStep} de ${steps.length}`}
            </p>
          </div>

          <button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors',
              canProceed && !isLoading
                ? isFinalStep
                  ? 'text-white bg-green-600 hover:bg-green-700'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-slate-400 bg-slate-200 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processant...
              </>
            ) : isFinalStep ? (
              <>
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                {finalLabel}
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}