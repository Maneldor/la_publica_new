'use client'

import { ArrowLeft, ArrowRight, FileText, Check, Save, Loader2 } from 'lucide-react'
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
  // New props for save functionality
  onSave?: () => void
  isSaving?: boolean
  saveLabel?: string
  showSaveButton?: boolean
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
  centerContent = false,
  onSave,
  isSaving = false,
  saveLabel = 'Guardar',
  showSaveButton = true
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
        centerContent ? "max-w-4xl" : "max-w-5xl"
      )}>
        {/* Steps indicator */}
        {steps.length <= 5 ? (
          // Layout de una fila para 5 o menos steps
          <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex items-center justify-start min-w-max md:justify-center">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = currentStep > index + 1
                const isCurrent = currentStep === index + 1

                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                          isCompleted && 'bg-green-500 border-green-500',
                          isCurrent && 'bg-indigo-600 border-indigo-600',
                          !isCompleted && !isCurrent && 'bg-white border-slate-300'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-white" strokeWidth={2} />
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
                        <p className={cn(
                          'text-sm font-medium',
                          isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                        )}>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-400 hidden lg:block">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        'w-16 md:w-24 h-0.5 mx-2 rounded-full transition-all',
                        currentStep > index + 1 ? 'bg-green-500' : 'bg-slate-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          // Layout de dos filas para más de 5 steps
          <div className="mb-8 space-y-4">
            {/* Primera fila: Primera mitad de steps */}
            <div className="flex items-center justify-center">
              {steps.slice(0, Math.ceil(steps.length / 2)).map((step, index) => {
                const StepIcon = step.icon
                const stepNumber = index + 1
                const isCompleted = currentStep > stepNumber
                const isCurrent = currentStep === stepNumber

                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all',
                          isCompleted && 'bg-green-500 border-green-500',
                          isCurrent && 'bg-indigo-600 border-indigo-600',
                          !isCompleted && !isCurrent && 'bg-white border-slate-300'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-white" strokeWidth={2} />
                        ) : StepIcon ? (
                          <StepIcon
                            className={cn(
                              'h-4 w-4 md:h-5 md:w-5',
                              isCurrent ? 'text-white' : 'text-slate-400'
                            )}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <span className={cn(
                            'text-xs md:text-sm font-semibold',
                            isCurrent ? 'text-white' : 'text-slate-400'
                          )}>
                            {stepNumber}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs mt-1.5 text-center font-medium max-w-[80px] md:max-w-[100px] truncate',
                        isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < Math.ceil(steps.length / 2) - 1 && (
                      <div className={cn(
                        'w-8 md:w-16 lg:w-24 h-0.5 mx-1 md:mx-2 rounded-full transition-all',
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Segunda fila: Segunda mitad de steps */}
            <div className="flex items-center justify-center">
              {steps.slice(Math.ceil(steps.length / 2)).map((step, index) => {
                const StepIcon = step.icon
                const stepNumber = index + Math.ceil(steps.length / 2) + 1
                const isCompleted = currentStep > stepNumber
                const isCurrent = currentStep === stepNumber

                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all',
                          isCompleted && 'bg-green-500 border-green-500',
                          isCurrent && 'bg-indigo-600 border-indigo-600',
                          !isCompleted && !isCurrent && 'bg-white border-slate-300'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-white" strokeWidth={2} />
                        ) : StepIcon ? (
                          <StepIcon
                            className={cn(
                              'h-4 w-4 md:h-5 md:w-5',
                              isCurrent ? 'text-white' : 'text-slate-400'
                            )}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <span className={cn(
                            'text-xs md:text-sm font-semibold',
                            isCurrent ? 'text-white' : 'text-slate-400'
                          )}>
                            {stepNumber}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs mt-1.5 text-center font-medium max-w-[80px] md:max-w-[100px] truncate',
                        isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.slice(Math.ceil(steps.length / 2)).length - 1 && (
                      <div className={cn(
                        'w-8 md:w-16 lg:w-24 h-0.5 mx-1 md:mx-2 rounded-full transition-all',
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[500px] mb-8">
          {children}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-200">
          <button
            onClick={onPrev}
            disabled={isFirstStep || isLoading || isSaving}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors',
              isFirstStep || isLoading || isSaving
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            {prevLabel}
          </button>

          {/* Center: Step info + Save button */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500 hidden sm:block">
              {steps[currentStep - 1]?.label || `Pas ${currentStep}`}
            </p>

            {/* Save button - always visible */}
            {showSaveButton && onSave && (
              <button
                onClick={onSave}
                disabled={isSaving || isLoading}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isSaving || isLoading
                    ? 'bg-emerald-400 text-white cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    Guardant...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" strokeWidth={1.5} />
                    {saveLabel}
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!canProceed || isLoading || isSaving}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors',
              canProceed && !isLoading && !isSaving
                ? isFinalStep
                  ? 'text-white bg-green-600 hover:bg-green-700'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700'
                : 'text-slate-400 bg-slate-200 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
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