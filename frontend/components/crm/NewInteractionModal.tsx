'use client';

import { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCreateInteraction, CreateInteractionData } from '@/hooks/crm/useInteractions';
import { Lead, Contact } from '@/hooks/crm/useLeadDetail';

interface NewInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

const interactionTypes = [
  {
    id: 'email',
    label: 'Email',
    icon: EnvelopeIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    focusColor: 'ring-blue-500',
    subjectPlaceholder: 'Assumpte de l\'email'
  },
  {
    id: 'call',
    label: 'Trucada',
    icon: PhoneIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    focusColor: 'ring-green-500',
    subjectPlaceholder: 'Motiu de la trucada'
  },
  {
    id: 'meeting',
    label: 'Reunió',
    icon: UserGroupIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    focusColor: 'ring-purple-500',
    subjectPlaceholder: 'Títol de la reunió'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    focusColor: 'ring-emerald-500',
    subjectPlaceholder: 'Tema del missatge'
  },
  {
    id: 'note',
    label: 'Nota',
    icon: PencilIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    focusColor: 'ring-gray-500',
    subjectPlaceholder: 'Títol de la nota'
  }
];

const outcomeOptions = [
  { value: 'positive', label: 'Positiu', color: 'text-green-600' },
  { value: 'neutral', label: 'Neutral', color: 'text-yellow-600' },
  { value: 'negative', label: 'Negatiu', color: 'text-red-600' },
  { value: 'no_response', label: 'Sense resposta', color: 'text-gray-600' }
];

export default function NewInteractionModal({ isOpen, onClose, lead, onSuccess }: NewInteractionModalProps) {
  const [selectedType, setSelectedType] = useState<string>('email');
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [outcome, setOutcome] = useState<string>('');
  const [showFollowUp, setShowFollowUp] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('');
  const [nextActionDate, setNextActionDate] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const createInteraction = useCreateInteraction();

  const selectedTypeConfig = interactionTypes.find(type => type.id === selectedType);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType('email');
      setSelectedContact(lead.contacts.find(c => c.isPrimary)?.id || lead.contacts[0]?.id || '');
      setSubject('');
      setContent('');
      setOutcome('');
      setShowFollowUp(false);
      setNextAction('');
      setNextActionDate('');
      setShowSuccessToast(false);
    }
  }, [isOpen, lead.contacts]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const interactionData: CreateInteractionData = {
      type: selectedType as any,
      subject: subject.trim() || undefined,
      content: content.trim(),
      outcome: outcome || undefined,
      nextAction: nextAction.trim() || undefined,
      nextActionDate: nextActionDate || undefined,
      contactId: selectedContact || undefined
    };

    try {
      await createInteraction.mutateAsync({ leadId: lead.id, data: interactionData });

      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Call success callback and close modal
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error('Error creating interaction:', error);
    }
  };

  const isSubmitDisabled = !content.trim() || createInteraction.isPending;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nova Interacció amb {lead.companyName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Interaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipus d'interacció
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {interactionTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `${type.borderColor} ${type.bgColor} ${type.color}`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Selection */}
              {lead.contacts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacte
                  </label>
                  <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecciona un contacte...</option>
                    {lead.contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                        {contact.position && ` • ${contact.position}`}
                        {contact.isPrimary && ' (Principal)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedTypeConfig?.subjectPlaceholder?.replace('Assumpte de l\'', 'Assumpte de l\'').replace('Motiu de la', 'Motiu de la').replace('Títol de la', 'Títol de la').replace('Tema del', 'Tema del').replace('Títol de la', 'Títol de la')}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={selectedTypeConfig?.subjectPlaceholder}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contingut <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descriu el contingut de la interacció..."
                  rows={4}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultat
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona el resultat...</option>
                  {outcomeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Follow-up section */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Seguiment</span>
                  {showFollowUp ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>

                {showFollowUp && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Propera acció
                      </label>
                      <input
                        type="text"
                        value={nextAction}
                        onChange={(e) => setNextAction(e.target.value)}
                        placeholder="Descripció de la propera acció..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de seguiment
                      </label>
                      <input
                        type="datetime-local"
                        value={nextActionDate}
                        onChange={(e) => setNextActionDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {createInteraction.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardant...
                  </>
                ) : (
                  'Guardar Interacció'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[60] flex items-center p-4 bg-green-600 text-white rounded-lg shadow-lg">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Interacció creada correctament!</span>
        </div>
      )}
    </>
  );
}