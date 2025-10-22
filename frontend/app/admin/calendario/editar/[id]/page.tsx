'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarEvent, EventCategory, TenantType, EventVisibility } from '@/lib/types/calendar';
import { useCalendar } from '@/lib/hooks/useCalendar';

interface EventFormData {
  titol: string;
  categoria: string;
  tenantType: string;
  dataInici: string;
  horaInici: string;
  dataFi: string;
  horaFi: string;
  totElDia: boolean;
  modalitat: string;
  ubicacio: string;
  linkOnline: string;
  descripcio: string;
  instructorNom: string;
  organitzador: string;
  color: string;
  icon: string;
  visible: boolean;
  materials: string[];
  objectius: string[];
  // Campos multi-tenant (preservados del evento original)
  tenantId: string;
  createdBy: string;
  createdByRole: string;
  visibility: string;
}

export default function CalendarioEditarPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { getEventById, updateEvent } = useCalendar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    titol: '',
    categoria: 'curs',
    tenantType: 'plataforma',
    dataInici: '',
    horaInici: '',
    dataFi: '',
    horaFi: '',
    totElDia: false,
    modalitat: 'presencial',
    ubicacio: '',
    linkOnline: '',
    descripcio: '',
    instructorNom: '',
    organitzador: '',
    color: '#2563eb',
    icon: '📚',
    visible: true,
    materials: [],
    objectius: [],
    // Campos multi-tenant inicializados
    tenantId: '',
    createdBy: '',
    createdByRole: '',
    visibility: 'public'
  });

  const categorias = [
    { value: 'curs', label: 'Curso', icon: '📚' },
    { value: 'assessorament', label: 'Assessorament', icon: '💼' },
    { value: 'grup', label: 'Reunión de grupo', icon: '👥' },
    { value: 'webinar', label: 'Webinar', icon: '📢' },
    { value: 'esdeveniment', label: 'Evento', icon: '🎪' },
    { value: 'recordatori', label: 'Recordatorio', icon: '⏰' },
    { value: 'personalitzat', label: 'Personalizado', icon: '📌' }
  ];

  const colores = [
    '#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6',
    '#ec4899', '#10b981', '#f97316', '#6366f1', '#84cc16'
  ];

  useEffect(() => {
    // Cargar evento existente
    const loadEvent = () => {
      try {
        const foundEvent = getEventById(eventId);

        if (!foundEvent) {
          alert('Evento no encontrado');
          router.push('/admin/calendario/listar');
          return;
        }

        setEvent(foundEvent);

        // Extraer fecha y hora de los strings de fecha
        const startDate = new Date(foundEvent.dataInici);
        const endDate = new Date(foundEvent.dataFi);

        setFormData({
          titol: foundEvent.titol,
          categoria: foundEvent.categoria,
          tenantType: foundEvent.tenantType,
          dataInici: startDate.toISOString().split('T')[0],
          horaInici: startDate.toTimeString().slice(0, 5),
          dataFi: endDate.toISOString().split('T')[0],
          horaFi: endDate.toTimeString().slice(0, 5),
          totElDia: foundEvent.totElDia || false,
          modalitat: foundEvent.modalitat || 'presencial',
          ubicacio: foundEvent.ubicacio || '',
          linkOnline: foundEvent.linkOnline || '',
          descripcio: foundEvent.descripcio || '',
          instructorNom: foundEvent.instructorNom || '',
          organitzador: foundEvent.organitzador || '',
          color: foundEvent.color,
          icon: foundEvent.icon || '📚',
          visible: foundEvent.visible !== false, // Default to true if undefined
          materials: foundEvent.materials || [],
          objectius: foundEvent.objectius || [],
          // PRESERVAR campos multi-tenant originales
          tenantId: foundEvent.tenantId,
          createdBy: foundEvent.createdBy,
          createdByRole: foundEvent.createdByRole,
          visibility: foundEvent.visibility || 'public'
        });
      } catch (error) {
        console.error('Error al cargar evento:', error);
        alert('Error al cargar el evento');
        router.push('/admin/calendario/listar');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId, router, getEventById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!event) {
        alert('Error: No se encontró el evento a actualizar');
        return;
      }

      // Preparar actualizaciones usando solo los campos que han cambiado
      const updates = {
        titol: formData.titol,
        categoria: formData.categoria as EventCategory,
        tenantType: formData.tenantType as TenantType,
        dataInici: `${formData.dataInici}T${formData.horaInici || '00:00'}:00`,
        dataFi: `${formData.dataFi}T${formData.horaFi || '23:59'}:00`,
        totElDia: formData.totElDia,
        modalitat: formData.modalitat,
        ubicacio: formData.ubicacio,
        linkOnline: formData.linkOnline,
        descripcio: formData.descripcio,
        instructorNom: formData.instructorNom,
        organitzador: formData.organitzador,
        color: formData.color,
        icon: formData.icon,
        visible: formData.visible,
        materials: formData.materials,
        objectius: formData.objectius,
        // Campos multi-tenant
        tenantId: formData.tenantId,
        visibility: formData.visibility as EventVisibility
      };

      // Usar el hook para actualizar el evento
      updateEvent(event.id, updates);

      // Redirigir a la lista
      router.push('/admin/calendario/listar');
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      alert('Error al actualizar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoriaChange = (categoria: string) => {
    const categoriaData = categorias.find(c => c.value === categoria);
    setFormData({
      ...formData,
      categoria,
      icon: categoriaData?.icon || '📌'
    });
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, '']
    });
  };

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = value;
    setFormData({
      ...formData,
      materials: newMaterials
    });
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  const addObjectiu = () => {
    setFormData({
      ...formData,
      objectius: [...formData.objectius, '']
    });
  };

  const updateObjectiu = (index: number, value: string) => {
    const newObjectius = [...formData.objectius];
    newObjectius[index] = value;
    setFormData({
      ...formData,
      objectius: newObjectius
    });
  };

  const removeObjectiu = (index: number) => {
    setFormData({
      ...formData,
      objectius: formData.objectius.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando evento...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Evento no encontrado</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Editar Evento</h1>
          <p className="text-gray-600">Modifica los detalles del evento seleccionado</p>
        </div>
        <Link
          href="/admin/calendario/listar"
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Volver
        </Link>
      </div>

      {/* Información del evento original */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{event.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{event.titol}</h3>
            <p className="text-sm text-gray-600">
              ID: {event.id} • Creado: {event.creatAt ? new Date(event.creatAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titol}
                onChange={(e) => setFormData({ ...formData, titol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del evento"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                required
                value={formData.tenantType}
                onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="plataforma">Evento de plataforma</option>
                <option value="empleat_public">Evento personal</option>
              </select>
            </div>

            {/* Visibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibilitat *
              </label>
              <select
                required
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Públic (visible per a tots)</option>
                <option value="private">Privat (només administradors)</option>
                <option value="tenant_only">Només organització</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Els esdeveniments públics són visibles per a tots els empleats
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcio}
              onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción del evento"
            />
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fecha y hora</h2>

          {/* Todo el día */}
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.totElDia}
                onChange={(e) => setFormData({ ...formData, totElDia: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Todo el día</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                required
                value={formData.dataInici}
                onChange={(e) => setFormData({ ...formData, dataInici: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hora inicio */}
            {!formData.totElDia && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={formData.horaInici}
                  onChange={(e) => setFormData({ ...formData, horaInici: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin *
              </label>
              <input
                type="date"
                required
                value={formData.dataFi}
                onChange={(e) => setFormData({ ...formData, dataFi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hora fin */}
            {!formData.totElDia && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de fin
                </label>
                <input
                  type="time"
                  value={formData.horaFi}
                  onChange={(e) => setFormData({ ...formData, horaFi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y modalidad</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Modalidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad *
              </label>
              <select
                required
                value={formData.modalitat}
                onChange={(e) => setFormData({ ...formData, modalitat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="hibrid">Híbrido</option>
              </select>
            </div>

            {/* Ubicación física */}
            {(formData.modalitat === 'presencial' || formData.modalitat === 'hibrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación física
                </label>
                <input
                  type="text"
                  value={formData.ubicacio}
                  onChange={(e) => setFormData({ ...formData, ubicacio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sala, dirección, etc."
                />
              </div>
            )}

            {/* Link online */}
            {(formData.modalitat === 'online' || formData.modalitat === 'hibrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link online
                </label>
                <input
                  type="url"
                  value={formData.linkOnline}
                  onChange={(e) => setFormData({ ...formData, linkOnline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Organización */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organización</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor
              </label>
              <input
                type="text"
                value={formData.instructorNom}
                onChange={(e) => setFormData({ ...formData, instructorNom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del instructor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizador
              </label>
              <input
                type="text"
                value={formData.organitzador}
                onChange={(e) => setFormData({ ...formData, organitzador: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Organización o entidad"
              />
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Apariencia</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colores.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="📚"
              />
            </div>
          </div>

          {/* Visible */}
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Evento visible</span>
            </label>
          </div>
        </div>

        {/* Materiales y objetivos */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiales y objetivos</h2>

          {/* Materiales */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Materiales
              </label>
              <button
                type="button"
                onClick={addMaterial}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Añadir material
              </button>
            </div>
            {formData.materials.map((material, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del material"
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Objetivos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Objetivos
              </label>
              <button
                type="button"
                onClick={addObjectiu}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Añadir objetivo
              </button>
            </div>
            {formData.objectius.map((objectiu, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={objectiu}
                  onChange={(e) => updateObjectiu(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objetivo del evento"
                />
                <button
                  type="button"
                  onClick={() => removeObjectiu(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/calendario/listar"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}