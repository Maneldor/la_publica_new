'use client';

import { useState } from 'react';
import { Briefcase, Plus, X, Star } from 'lucide-react';
import { EmpresaWizardProps } from '../types';

const SUGGESTED_SERVICES = [
  'Consultoria',
  'Desenvolupament web',
  'Disseny grafic',
  'Marketing digital',
  'Recursos humans',
  'Comptabilitat',
  'Assessoria legal',
  'Formacio',
  'Gestio de projectes',
  'Suport tecnic',
];

const SUGGESTED_SPECIALIZATIONS = [
  'Empreses',
  'Pymes',
  'Startups',
  'Sector public',
  'E-commerce',
  'Industria',
  'Salut',
  'Educacio',
  'ONG',
  'Internacional',
];

export const Step5Services = ({ formData, errors, updateField }: EmpresaWizardProps) => {
  const [newService, setNewService] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const services = formData.services || [];
  const specializations = formData.specializations || [];

  const addService = (service: string) => {
    if (service.trim() && !services.includes(service.trim())) {
      updateField('services', [...services, service.trim()]);
    }
    setNewService('');
  };

  const removeService = (service: string) => {
    updateField('services', services.filter((s: string) => s !== service));
  };

  const addSpecialization = (spec: string) => {
    if (spec.trim() && !specializations.includes(spec.trim())) {
      updateField('specializations', [...specializations, spec.trim()]);
    }
    setNewSpecialization('');
  };

  const removeSpecialization = (spec: string) => {
    updateField('specializations', specializations.filter((s: string) => s !== spec));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Serveis i Especialitats</h2>
        <p className="text-gray-600">
          Quins serveis ofereix la teva empresa?
        </p>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Serveis que oferim
        </label>

        {/* Selected services */}
        <div className="flex flex-wrap gap-2 mb-4">
          {services.map((service: string) => (
            <span
              key={service}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {service}
              <button
                onClick={() => removeService(service)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {services.length === 0 && (
            <span className="text-sm text-gray-500">Cap servei afegit</span>
          )}
        </div>

        {/* Add new service */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addService(newService)}
            placeholder="Escriu un servei..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => addService(newService)}
            disabled={!newService.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested services */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Suggeriments:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SERVICES.filter((s) => !services.includes(s)).slice(0, 6).map((service) => (
              <button
                key={service}
                onClick={() => addService(service)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                + {service}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Specializations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Star className="w-4 h-4 inline mr-2" />
          Especialitzacions
        </label>

        {/* Selected specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.map((spec: string) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm"
            >
              {spec}
              <button
                onClick={() => removeSpecialization(spec)}
                className="hover:bg-amber-200 rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {specializations.length === 0 && (
            <span className="text-sm text-gray-500">Cap especialitzacio afegida</span>
          )}
        </div>

        {/* Add new specialization */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSpecialization}
            onChange={(e) => setNewSpecialization(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSpecialization(newSpecialization)}
            placeholder="Escriu una especialitzacio..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => addSpecialization(newSpecialization)}
            disabled={!newSpecialization.trim()}
            className="px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested specializations */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Suggeriments:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SPECIALIZATIONS.filter((s) => !specializations.includes(s)).slice(0, 6).map((spec) => (
              <button
                key={spec}
                onClick={() => addSpecialization(spec)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                + {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Afegeix els serveis i especialitzacions per ajudar als usuaris a trobar-te quan cerquin empreses del teu sector.
        </p>
      </div>
    </div>
  );
};
