'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useCreateLead, CreateLeadData, CreateContactData } from '@/hooks/crm/useLeads';

const sectorOptions = [
  'Tecnología',
  'Marketing',
  'Consultoría',
  'Educación',
  'Salud',
  'Finanzas',
  'Manufactura',
  'Comercio',
  'Servicios',
  'Otros'
];

const sourceOptions = [
  'Web',
  'Referido',
  'LinkedIn',
  'Llamada en frío',
  'Email marketing',
  'Evento',
  'Redes sociales',
  'Publicidad',
  'Otros'
];

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'low', label: 'Baja', color: 'text-green-600 bg-green-50 border-green-200' }
];

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const [formData, setFormData] = useState<CreateLeadData>({
    companyName: '',
    cif: '',
    sector: '',
    website: '',
    employees: undefined,
    source: '',
    priority: 'medium',
    estimatedValue: undefined,
    notes: '',
    contacts: [{
      name: '',
      position: '',
      phone: '',
      email: '',
      linkedin: '',
      notes: ''
    }]
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleInputChange = (field: keyof CreateLeadData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (index: number, field: keyof CreateContactData, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ) || []
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [
        ...(prev.contacts || []),
        {
          name: '',
          position: '',
          phone: '',
          email: '',
          linkedin: '',
          notes: ''
        }
      ]
    }));
  };

  const removeContact = (index: number) => {
    if ((formData.contacts?.length || 0) <= 1) return; // Mantener al menos un contacto

    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index) || []
    }));
  };

  const setPrimaryContact = (index: number) => {
    if (!formData.contacts) return;

    // Mover el contacto seleccionado al principio
    const contacts = [...formData.contacts];
    const selectedContact = contacts.splice(index, 1)[0];
    contacts.unshift(selectedContact);

    setFormData(prev => ({
      ...prev,
      contacts
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim() || !formData.source || !formData.priority) {
      return;
    }

    // Validar que al menos haya un contacto con nombre
    const validContacts = formData.contacts?.filter(contact => contact.name.trim()) || [];
    if (validContacts.length === 0) {
      return;
    }

    // Limpiar campos vacíos
    const cleanData: CreateLeadData = {
      companyName: formData.companyName.trim(),
      source: formData.source,
      priority: formData.priority,
      ...(formData.cif?.trim() && { cif: formData.cif.trim() }),
      ...(formData.sector && { sector: formData.sector }),
      ...(formData.website?.trim() && { website: formData.website.trim() }),
      ...(formData.employees && { employees: formData.employees }),
      ...(formData.estimatedValue && { estimatedValue: formData.estimatedValue }),
      ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
      contacts: validContacts.map(contact => ({
        name: contact.name.trim(),
        ...(contact.position?.trim() && { position: contact.position.trim() }),
        ...(contact.phone?.trim() && { phone: contact.phone.trim() }),
        ...(contact.email?.trim() && { email: contact.email.trim() }),
        ...(contact.linkedin?.trim() && { linkedin: contact.linkedin.trim() }),
        ...(contact.notes?.trim() && { notes: contact.notes.trim() })
      }))
    };

    try {
      const newLead = await createLead.mutateAsync(cleanData);

      // Mostrar toast de éxito
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      // Redirigir al detalle del lead después de un breve delay
      setTimeout(() => {
        router.push(`/gestor-empreses/leads/${newLead.id}`);
      }, 1500);

    } catch (error) {
      console.error('Error creando lead:', error);
    }
  };

  const hasValidContact = formData.contacts?.some(contact => contact.name.trim()) || false;
  const isSubmitDisabled = !formData.companyName.trim() || !formData.source || !formData.priority || !hasValidContact || createLead.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/gestor-empreses/leads"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="ml-1">Volver a leads</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Nuevo Lead</h1>
                <p className="text-sm text-gray-600">Registra una nueva oportunidad de negocio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Información de la Empresa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Ej. Tech Solutions SL"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIF
                </label>
                <input
                  type="text"
                  value={formData.cif}
                  onChange={(e) => handleInputChange('cif', e.target.value)}
                  placeholder="Ej. B12345678"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un sector...</option>
                  {sectorOptions.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Ej. www.techsolutions.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="h-4 w-4 inline mr-1" />
                  Número de empleados
                </label>
                <input
                  type="number"
                  value={formData.employees || ''}
                  onChange={(e) => handleInputChange('employees', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ej. 25"
                  min="1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CurrencyEuroIcon className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Información Comercial</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente del lead <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona la fuente...</option>
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('priority', option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                        formData.priority === option.value
                          ? option.color
                          : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyEuroIcon className="h-4 w-4 inline mr-1" />
                  Valor estimado
                </label>
                <input
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ej. 15000"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Valor estimado del contrato en euros</p>
              </div>
            </div>
          </div>

          {/* Contactos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <UserIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Contactos</h2>
              </div>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar contacto
              </button>
            </div>

            <div className="space-y-6">
              {formData.contacts?.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {/* Header del contacto */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryContact(index)}
                        className={`flex items-center text-sm font-medium transition-colors ${
                          index === 0
                            ? 'text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={index === 0 ? 'Contacto principal' : 'Marcar como principal'}
                      >
                        {index === 0 ? (
                          <StarIconSolid className="h-4 w-4 mr-1" />
                        ) : (
                          <StarIcon className="h-4 w-4 mr-1" />
                        )}
                        {index === 0 ? 'Contacto Principal' : 'Contacto Secundario'}
                      </button>
                    </div>
                    {formData.contacts && formData.contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
                        title="Eliminar contacto"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>

                  {/* Campos del contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo {index === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        placeholder="Ej. María García López"
                        required={index === 0}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo/Posición
                      </label>
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                        placeholder="Ej. CEO, Director Comercial"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="Ej. +34 666 777 888"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        placeholder="Ej. maria@empresa.com"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={contact.linkedin}
                        onChange={(e) => handleContactChange(index, 'linkedin', e.target.value)}
                        placeholder="Ej. https://linkedin.com/in/mariagarcia"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas del contacto
                      </label>
                      <textarea
                        value={contact.notes}
                        onChange={(e) => handleContactChange(index, 'notes', e.target.value)}
                        placeholder="Información adicional sobre este contacto..."
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Notas Adicionales</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas y observaciones
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Información adicional sobre el lead, contexto, necesidades específicas..."
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              href="/gestor-empreses/leads"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {createLead.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando Lead...
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Crear Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center p-4 bg-green-600 text-white rounded-lg shadow-lg">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Lead creado correctamente! Redirigiendo...</span>
        </div>
      )}
    </div>
  );
}