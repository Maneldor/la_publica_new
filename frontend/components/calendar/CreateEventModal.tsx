'use client';

import { useState } from 'react';
import { type Event } from '@/lib/calendar/mockData';

interface CreateEventModalProps {
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
}

export function CreateEventModal({ onClose, onSave }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    titol: '',
    tipus: 'personalitzat',
    data_inici: '',
    hora_inici: '',
    data_fi: '',
    hora_fi: '',
    tot_el_dia: false,
    ubicacio: '',
    descripcio: '',
    color: '#2563eb',
    recordatoris: {
      quinze_minuts: true,
      una_hora: false,
      un_dia: false
    },
    repetir: 'no',
    convidats: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Partial<Event> = {
      titol: formData.titol,
      categoria: 'personalitzat',
      tipus_propietari: 'meu',
      data_inici: `${formData.data_inici}T${formData.hora_inici}:00`,
      data_fi: `${formData.data_fi}T${formData.hora_fi}:00`,
      tot_el_dia: formData.tot_el_dia,
      ubicacio: formData.ubicacio,
      descripcio: formData.descripcio,
      modalitat: 'presencial',
      color: formData.color,
      icon: '📌',
      recordatoris: [],
      visible: true
    };

    onSave(newEvent);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[200] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Crear esdeveniment personalitzat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Títol */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Títol *
            </label>
            <input
              type="text"
              required
              value={formData.titol}
              onChange={(e) => setFormData({ ...formData, titol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reunió amb..."
            />
          </div>

          {/* Tipus */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipus
            </label>
            <select
              value={formData.tipus}
              onChange={(e) => setFormData({ ...formData, tipus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personalitzat">Personalitzat</option>
              <option value="reunio">Reunió</option>
              <option value="recordatori">Recordatori</option>
              <option value="tasca">Tasca</option>
              <option value="altre">Altre</option>
            </select>
          </div>

          {/* Data i hora */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data i hora *
            </label>

            {/* Checkbox tot el dia */}
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={formData.tot_el_dia}
                onChange={(e) => setFormData({ ...formData, tot_el_dia: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Tot el dia</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              {/* Inici */}
              <div>
                <label className="text-xs text-gray-500">Inici</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={formData.data_inici}
                    onChange={(e) => setFormData({ ...formData, data_inici: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!formData.tot_el_dia && (
                    <input
                      type="time"
                      required
                      value={formData.hora_inici}
                      onChange={(e) => setFormData({ ...formData, hora_inici: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Fi */}
              <div>
                <label className="text-xs text-gray-500">Fi</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={formData.data_fi}
                    onChange={(e) => setFormData({ ...formData, data_fi: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!formData.tot_el_dia && (
                    <input
                      type="time"
                      required
                      value={formData.hora_fi}
                      onChange={(e) => setFormData({ ...formData, hora_fi: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ubicació */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicació
            </label>
            <input
              type="text"
              value={formData.ubicacio}
              onChange={(e) => setFormData({ ...formData, ubicacio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sala de reunions, online, etc."
            />
          </div>

          {/* Descripció */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripció
            </label>
            <textarea
              value={formData.descripcio}
              onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detalls de l'esdeveniment..."
            />
          </div>

          {/* Color */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
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

          {/* Recordatoris */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recordatoris
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recordatoris.quinze_minuts}
                  onChange={(e) => setFormData({
                    ...formData,
                    recordatoris: { ...formData.recordatoris, quinze_minuts: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">15 minuts abans</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recordatoris.una_hora}
                  onChange={(e) => setFormData({
                    ...formData,
                    recordatoris: { ...formData.recordatoris, una_hora: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">1 hora abans</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recordatoris.un_dia}
                  onChange={(e) => setFormData({
                    ...formData,
                    recordatoris: { ...formData.recordatoris, un_dia: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">1 dia abans</span>
              </label>
            </div>
          </div>

          {/* Repetir */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repetir
            </label>
            <select
              value={formData.repetir}
              onChange={(e) => setFormData({ ...formData, repetir: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no">No repetir</option>
              <option value="diari">Diari</option>
              <option value="setmanal">Setmanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          {/* Botons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Crear esdeveniment
            </button>
          </div>
        </form>
      </div>
    </>
  );
}