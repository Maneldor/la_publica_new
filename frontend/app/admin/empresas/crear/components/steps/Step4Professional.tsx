'use client';

import { Users, Calendar, Clock } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step4Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
}

export const Step4Professional = ({ formData, errors, updateField }: Step4Props) => {
  const employeeRanges = [
    { value: '', label: 'Selecciona el nombre d\'empleats' },
    { value: '1-10', label: '1-10 empleats (Microempresa)' },
    { value: '11-25', label: '11-25 empleats (Petita empresa)' },
    { value: '26-50', label: '26-50 empleats (Petita empresa)' },
    { value: '51-100', label: '51-100 empleats (Empresa mitjana)' },
    { value: '101-250', label: '101-250 empleats (Empresa mitjana)' },
    { value: '251-500', label: '251-500 empleats (Empresa gran)' },
    { value: '500+', label: 'Més de 500 empleats (Empresa gran)' },
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Dilluns' },
    { key: 'tuesday', label: 'Dimarts' },
    { key: 'wednesday', label: 'Dimecres' },
    { key: 'thursday', label: 'Dijous' },
    { key: 'friday', label: 'Divendres' },
    { key: 'saturday', label: 'Dissabte' },
    { key: 'sunday', label: 'Diumenge' },
  ];

  const updateSchedule = (day: string, value: string) => {
    updateField('schedule', {
      ...formData.schedule,
      [day]: value
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informació Professional
        </h2>
        <p className="text-gray-600">
          Detalls sobre la mida de l'empresa, experiència i disponibilitat
        </p>
      </div>

      {/* Employee Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-2" />
          Nombre d'Empleats *
        </label>
        <select
          value={formData.employeeRange}
          onChange={(e) => updateField('employeeRange', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.employeeRange ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        >
          {employeeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        {errors.employeeRange && (
          <p className="text-sm text-red-600 mt-1">{errors.employeeRange}</p>
        )}
      </div>

      {/* Founded Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Any de Fundació *
        </label>
        <select
          value={formData.foundedYear}
          onChange={(e) => updateField('foundedYear', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.foundedYear ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        >
          <option value="">Selecciona l'any de fundació</option>
          {years.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
        {errors.foundedYear && (
          <p className="text-sm text-red-600 mt-1">{errors.foundedYear}</p>
        )}
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Clock className="w-4 h-4 inline mr-2" />
          Horari d'Atenció
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Especifica l'horari en què l'empresa està disponible per atendre consultes
        </p>

        <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
          {daysOfWeek.map((day) => (
            <div key={day.key} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium text-gray-700">
                {day.label}:
              </div>
              <div className="flex-1 max-w-xs">
                <select
                  value={formData.schedule[day.key] || ''}
                  onChange={(e) => updateSchedule(day.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="Tancat">Tancat</option>
                  <option value="9:00-13:00">9:00 - 13:00</option>
                  <option value="9:00-14:00">9:00 - 14:00</option>
                  <option value="9:00-18:00">9:00 - 18:00</option>
                  <option value="9:00-17:00">9:00 - 17:00</option>
                  <option value="8:00-16:00">8:00 - 16:00</option>
                  <option value="10:00-14:00">10:00 - 14:00</option>
                  <option value="16:00-20:00">16:00 - 20:00</option>
                  <option value="9:00-13:00, 15:00-18:00">9:00 - 13:00, 15:00 - 18:00</option>
                  <option value="personalitzat">Personalitzat</option>
                </select>
              </div>
              {formData.schedule[day.key] === 'personalitzat' && (
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Ex: 8:30-12:30, 14:30-17:30"
                    onChange={(e) => updateSchedule(day.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Schedule Presets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">
          Plantilles d'Horari Ràpid:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const workdaySchedule = {
                monday: '9:00-18:00',
                tuesday: '9:00-18:00',
                wednesday: '9:00-18:00',
                thursday: '9:00-18:00',
                friday: '9:00-18:00',
                saturday: 'Tancat',
                sunday: 'Tancat'
              };
              updateField('schedule', workdaySchedule);
            }}
            className="px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            Dilluns a Divendres 9-18h
          </button>
          <button
            type="button"
            onClick={() => {
              const extendedSchedule = {
                monday: '9:00-18:00',
                tuesday: '9:00-18:00',
                wednesday: '9:00-18:00',
                thursday: '9:00-18:00',
                friday: '9:00-18:00',
                saturday: '10:00-14:00',
                sunday: 'Tancat'
              };
              updateField('schedule', extendedSchedule);
            }}
            className="px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            + Dissabte matí
          </button>
          <button
            type="button"
            onClick={() => {
              const splitSchedule = {
                monday: '9:00-13:00, 15:00-18:00',
                tuesday: '9:00-13:00, 15:00-18:00',
                wednesday: '9:00-13:00, 15:00-18:00',
                thursday: '9:00-13:00, 15:00-18:00',
                friday: '9:00-13:00, 15:00-18:00',
                saturday: 'Tancat',
                sunday: 'Tancat'
              };
              updateField('schedule', splitSchedule);
            }}
            className="px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            Horari Partit (pausa migdia)
          </button>
          <button
            type="button"
            onClick={() => {
              const continuousSchedule = {
                monday: '8:00-16:00',
                tuesday: '8:00-16:00',
                wednesday: '8:00-16:00',
                thursday: '8:00-16:00',
                friday: '8:00-16:00',
                saturday: 'Tancat',
                sunday: 'Tancat'
              };
              updateField('schedule', continuousSchedule);
            }}
            className="px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            Jornada Intensiva 8-16h
          </button>
        </div>
      </div>

      {/* Professional Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          💼 Informació Professional:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• La mida de l'empresa ajuda a avaluar la capacitat de projectes</li>
          <li>• L'any de fundació mostra l'experiència i estabilitat</li>
          <li>• Un horari clar facilita la comunicació amb l'administració</li>
          <li>• Considereu ampliar l'horari per projectes públics importants</li>
        </ul>
      </div>
    </div>
  );
};