'use client'

import { useState } from 'react'
import { X, ArrowLeft, ArrowRight, MessageSquare, User, FileText, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecipientSelector } from './RecipientSelector'
import { MessageTemplates } from './MessageTemplates'
import { createConversationWithRecipient, applyTemplate } from '@/lib/gestio-empreses/message-actions'
import type { Recipient, MessageTemplate } from '@/lib/gestio-empreses/message-actions'

interface NewConversationWizardProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

const steps = [
  {
    id: 'recipient',
    title: 'Seleccionar destinatari',
    description: 'Tria qui rebrà el missatge',
    icon: User
  },
  {
    id: 'template',
    title: 'Plantilla (Opcional)',
    description: 'Utilitza una plantilla o escriu lliurement',
    icon: FileText
  },
  {
    id: 'message',
    title: 'Redactar missatge',
    description: 'Escriu el contingut del missatge',
    icon: MessageSquare
  }
]

export function NewConversationWizard({
  userId,
  isOpen,
  onClose,
  onConversationCreated
}: NewConversationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Reset del wizard
  const resetWizard = () => {
    setCurrentStep(0)
    setSelectedRecipient(null)
    setSelectedTemplate(null)
    setSubject('')
    setMessageContent('')
    setIsCreating(false)
  }

  const handleClose = () => {
    resetWizard()
    onClose()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleApplyTemplate = async (templateSubject: string, templateContent: string) => {
    setSubject(templateSubject)
    setMessageContent(templateContent)
  }

  const generateTemplateVariables = (): Record<string, string> => {
    if (!selectedRecipient) return {}

    return {
      firstName: selectedRecipient.name.split(' ')[0] || selectedRecipient.name,
      lastName: selectedRecipient.name.split(' ').slice(1).join(' ') || '',
      email: selectedRecipient.email,
      companyName: selectedRecipient.companyName || 'La vostra empresa',
      position: selectedRecipient.position || '',
      senderName: 'El vostre equip',
      // Variables addicionals per plantilles específiques
      topic: 'el nostre servei',
      projectName: 'el vostre projecte',
      completedTasks: 'Tasques completades',
      inProgressTasks: 'Tasques en procés',
      nextSteps: 'Pròxims passos',
      purpose: 'revisar el projecte',
      option1: 'Dimarts 10:00',
      option2: 'Dimecres 14:00',
      option3: 'Dijous 16:00',
      duration: '1 hora',
      invoiceNumber: 'INV-2024-001',
      amount: '1.500',
      dueDate: '31/12/2024',
      achievements: 'Objectius assolits aquesta setmana',
      metrics: 'Mètriques clau del rendiment',
      priorities: 'Prioritats de la propera setmana',
      taskTitle: 'Nova tasca',
      taskDescription: 'Descripció de la tasca',
      priority: 'Alta',
      service1: 'Servei 1',
      service2: 'Servei 2',
      service3: 'Servei 3'
    }
  }

  const handleCreateConversation = async () => {
    if (!selectedRecipient || !messageContent.trim()) return

    setIsCreating(true)
    try {
      const conversationId = await createConversationWithRecipient(
        selectedRecipient.id,
        selectedRecipient.type,
        messageContent,
        selectedTemplate?.id
      )

      onConversationCreated(conversationId)
      handleClose()
    } catch (error) {
      console.error('Error creant conversa:', error)
    }
    setIsCreating(false)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedRecipient !== null
      case 1: return true // La plantilla és opcional
      case 2: return messageContent.trim().length > 0
      default: return false
    }
  }

  const canCreateConversation = () => {
    return selectedRecipient && messageContent.trim().length > 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Nova Conversa</h2>
              <p className="text-sm text-slate-500">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    isActive && 'bg-blue-100 text-blue-700',
                    isCompleted && 'bg-green-100 text-green-700',
                    !isActive && !isCompleted && 'text-slate-400'
                  )}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium hidden sm:inline">
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-8 h-0.5 mx-2',
                      index < currentStep ? 'bg-green-300' : 'bg-slate-200'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Pas 1: Seleccionar destinatari */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Qui rebrà el missatge?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Selecciona un destinatari de la llista. Pots filtrar per tipus: administradors, gestors, leads o empreses.
                </p>
              </div>

              <RecipientSelector
                userId={userId}
                selectedRecipient={selectedRecipient}
                onRecipientSelect={setSelectedRecipient}
              />

              {selectedRecipient && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Destinatari seleccionat</p>
                      <p className="text-sm text-green-700">
                        {selectedRecipient.name} • {selectedRecipient.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pas 2: Seleccionar plantilla */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Vols utilitzar una plantilla?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Pots seleccionar una plantilla predefinida o saltar aquest pas per escriure lliurement.
                </p>
              </div>

              <MessageTemplates
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                onApplyTemplate={handleApplyTemplate}
                variables={generateTemplateVariables()}
              />

              {selectedTemplate && messageContent && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Vista prèvia del missatge:</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Assumpte:</strong> {subject}</p>
                    <div>
                      <strong>Contingut:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs bg-white p-2 rounded border">
                        {messageContent.substring(0, 200)}
                        {messageContent.length > 200 && '...'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pas 3: Redactar missatge */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Redacta el teu missatge
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Escriu el contingut del missatge que s'enviarà a {selectedRecipient?.name}.
                </p>
              </div>

              {subject && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assumpte
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Assumpte del missatge..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Missatge
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Escriu el teu missatge aquí..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  {messageContent.length} caràcters
                </p>
              </div>

              {selectedTemplate && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Plantilla aplicada:</strong> {selectedTemplate.name}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  canProceedToNext()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                Següent
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={handleCreateConversation}
                disabled={!canCreateConversation() || isCreating}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-colors',
                  canCreateConversation() && !isCreating
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    Creant...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Crear Conversa
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}