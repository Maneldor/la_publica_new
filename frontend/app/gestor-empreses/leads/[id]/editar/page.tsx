'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPut } from '@/lib/api-client';

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

const statusOptions = [
  { value: 'new', label: 'Nuevo', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'contacted', label: 'Contactado', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'negotiating', label: 'Negociando', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'converted', label: 'Convertido', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'lost', label: 'Perdido', color: 'text-red-600 bg-red-50 border-red-200' }
];

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    cif: '',
    sector: '',
    website: '',
    employees: '',
    source: '',
    priority: 'medium',
    status: 'new',
    estimatedValue: '',
    notes: ''
  });

  const [contacts, setContacts] = useState([{
    name: '',
    position: '',
    phone: '',
    email: '',
    notes: ''
  }]);

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const lead = await apiGet(`/crm/leads/${leadId}`, { requireAuth: false });

      setFormData({
        companyName: lead.companyName || '',
        cif: lead.cif || '',
        sector: lead.sector || '',
        website: lead.website || '',
        employees: lead.employees ? lead.employees.toString() : '',
        source: lead.source || '',
        priority: lead.priority || 'medium',
        status: lead.status || 'new',
        estimatedValue: lead.estimatedValue ? lead.estimatedValue.toString() : '',
        notes: lead.notes || ''
      });

      if (lead.contacts && lead.contacts.length > 0) {
        const processedContacts = lead.contacts.map((contact: any) => ({
          name: contact.name || '',
          position: contact.position || '',
          phone: contact.phone || '',
          email: contact.email || '',
          notes: contact.notes || ''
        }));
        setContacts(processedContacts);
      }

    } catch (error) {
      console.error('Error cargando lead:', error);
      setError('Error al cargar los datos del lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      setError('El nombre de la empresa es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const submitData = {
        ...formData,
        employees: formData.employees ? parseInt(formData.employees) : null,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        contacts: contacts.filter(contact => contact.name.trim())
      };

      await apiPut(`/crm/leads/${leadId}`, submitData, { requireAuth: false });

      router.push('/gestor-empreses/leads');
    } catch (error) {
      console.error('Error actualizando lead:', error);
      setError('Error al actualizar el lead. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, {
      name: '',
      position: '',
      phone: '',
      email: '',
      notes: ''
    }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando lead...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/gestor-empreses/leads"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Volver a Leads
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Lead</h1>
            <p className="text-gray-600">Actualiza la información del lead</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información de la Empresa */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CIF/NIF
              </label>
              <input
                type="text"
                value={formData.cif}
                onChange={(e) => handleInputChange('cif', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar sector</option>
                {sectorOptions.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Empleados
              </label>
              <input
                type="number"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente del Lead
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar fuente</option>
                {sourceOptions.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <div className="flex space-x-3">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('priority', option.value)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      formData.priority === option.value
                        ? option.color
                        : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('status', option.value)}
                    className={`px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${
                      formData.status === option.value
                        ? option.color
                        : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Estimado (€)
              </label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Información adicional sobre el lead..."
            />
          </div>
        </div>

        {/* Contactos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contactos</h2>
            <button
              type="button"
              onClick={addContact}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Añadir Contacto
            </button>
          </div>

          <div className="space-y-6">
            {contacts.map((contact, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Contacto {index + 1}
                  </h3>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={contact.position}
                      onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={contact.notes}
                    onChange={(e) => handleContactChange(index, 'notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Información adicional sobre este contacto..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/gestor-empreses/leads"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}