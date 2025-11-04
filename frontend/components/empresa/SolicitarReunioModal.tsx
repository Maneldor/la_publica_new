'use client';

import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video } from 'lucide-react';

interface SolicitarReunioModalProps {
  isOpen: boolean;
  onClose: () => void;
  gestorName: string;
}

export default function SolicitarReunioModal({
  isOpen,
  onClose,
  gestorName,
}: SolicitarReunioModalProps) {
  const [formData, setFormData] = useState({
    assumpte: '',
    descripcio: '',
    dataPreferent: '',
    modalitat: 'online'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí aniria la lògica per enviar la sol·licitud
    console.log('Sol·licitud de reunió:', formData);

    // Mostrar missatge d'èxit (temporal)
    alert('Sol·licitud enviada correctament! El gestor es posarà en contacte amb tu aviat.');

    // Reiniciar formulari i tancar modal
    setFormData({
      assumpte: '',
      descripcio: '',
      dataPreferent: '',
      modalitat: 'online'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generar dates mínimes (avui + 1 dia)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sol·licitar Reunió</h2>
            <p className="text-gray-600 mt-1">Amb {gestorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Assumpte */}
          <div>
            <label htmlFor="assumpte" className="block text-sm font-medium text-gray-700 mb-2">
              Assumpte de la reunió *
            </label>
            <input
              type="text"
              id="assumpte"
              name="assumpte"
              value={formData.assumpte}
              onChange={handleChange}
              required
              placeholder="Ex: Revisió de perfil d'empresa, consulta sobre talent..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Descripció */}
          <div>
            <label htmlFor="descripcio" className="block text-sm font-medium text-gray-700 mb-2">
              Descripció *
            </label>
            <textarea
              id="descripcio"
              name="descripcio"
              value={formData.descripcio}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Explica breument què vols tractar a la reunió, quins dubtes tens o què necessites..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Data preferent */}
          <div>
            <label htmlFor="dataPreferent" className="block text-sm font-medium text-gray-700 mb-2">
              Data preferent
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="dataPreferent"
                name="dataPreferent"
                value={formData.dataPreferent}
                onChange={handleChange}
                min={minDate}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              El gestor confirmarà la disponibilitat i proposarà horaris alternatius si cal.
            </p>
          </div>

          {/* Modalitat */}
          <div>
            <label htmlFor="modalitat" className="block text-sm font-medium text-gray-700 mb-2">
              Modalitat *
            </label>
            <select
              id="modalitat"
              name="modalitat"
              value={formData.modalitat}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="online">🖥️ Online (Videocridada)</option>
              <option value="presencial">🏢 Presencial (Oficines La Pública)</option>
              <option value="flexible">🔄 Flexible (Deixo decidir al gestor)</option>
            </select>
          </div>

          {/* Info sobre modalitats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Informació sobre reunions
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Online:</strong> Reunions per Google Meet o Teams, flexibilitat total d'horaris</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Presencial:</strong> Oficines de La Pública a Barcelona, horari d'oficina</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> Les reunions solen durar entre 30-60 minuts. El gestor es posarà en contacte
              en un termini màxim de 2 dies laborables per confirmar la cita i enviar els detalls de connexió o ubicació.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            form="reunio-form"
            onClick={handleSubmit}
            disabled={!formData.assumpte || !formData.descripcio}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              formData.assumpte && formData.descripcio
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Enviar Sol·licitud
          </button>
        </div>
      </div>
    </div>
  );
}