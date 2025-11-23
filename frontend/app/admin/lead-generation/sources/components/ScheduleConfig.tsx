'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

type ScheduleFrequency = 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface ScheduleConfig {
  frequency: ScheduleFrequency;
  time?: string; // HH:mm format
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // For monthly frequency
  isActive: boolean;
}

interface ScheduleConfigProps {
  value: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  disabled?: boolean;
}

export default function ScheduleConfig({
  value,
  onChange,
  disabled = false,
}: ScheduleConfigProps) {
  const [localConfig, setLocalConfig] = useState<ScheduleConfig>(value);

  useEffect(() => {
    setLocalConfig(value);
  }, [value]);

  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    const newConfig: ScheduleConfig = {
      ...localConfig,
      frequency,
      // Reset dependent fields when frequency changes
      ...(frequency === 'MANUAL' && {
        time: undefined,
        daysOfWeek: undefined,
        dayOfMonth: undefined,
      }),
      ...(frequency === 'HOURLY' && {
        time: undefined,
        daysOfWeek: undefined,
        dayOfMonth: undefined,
      }),
      ...(frequency === 'DAILY' && {
        time: localConfig.time || '09:00',
        daysOfWeek: undefined,
        dayOfMonth: undefined,
      }),
      ...(frequency === 'WEEKLY' && {
        time: localConfig.time || '09:00',
        daysOfWeek: localConfig.daysOfWeek || [1], // Default to Monday
        dayOfMonth: undefined,
      }),
      ...(frequency === 'MONTHLY' && {
        time: localConfig.time || '09:00',
        daysOfWeek: undefined,
        dayOfMonth: localConfig.dayOfMonth || 1,
      }),
    };

    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleTimeChange = (time: string) => {
    const newConfig = { ...localConfig, time };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleDaysOfWeekChange = (day: number) => {
    const currentDays = localConfig.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();

    const newConfig = { ...localConfig, daysOfWeek: newDays };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleDayOfMonthChange = (dayOfMonth: number) => {
    const newConfig = { ...localConfig, dayOfMonth };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleActiveToggle = () => {
    const newConfig = { ...localConfig, isActive: !localConfig.isActive };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const frequencyOptions = [
    { value: 'MANUAL', label: 'Manual', description: 'Només execució manual' },
    { value: 'HOURLY', label: 'Cada hora', description: 'Execució automàtica cada hora' },
    { value: 'DAILY', label: 'Diari', description: 'Una vegada al dia' },
    { value: 'WEEKLY', label: 'Setmanal', description: 'Una o més vegades per setmana' },
    { value: 'MONTHLY', label: 'Mensual', description: 'Una vegada al mes' },
  ] as const;

  const daysOfWeekOptions = [
    { value: 1, label: 'Dl', fullLabel: 'Dilluns' },
    { value: 2, label: 'Dt', fullLabel: 'Dimarts' },
    { value: 3, label: 'Dc', fullLabel: 'Dimecres' },
    { value: 4, label: 'Dj', fullLabel: 'Dijous' },
    { value: 5, label: 'Dv', fullLabel: 'Divendres' },
    { value: 6, label: 'Ds', fullLabel: 'Dissabte' },
    { value: 0, label: 'Dg', fullLabel: 'Diumenge' },
  ];

  const getNextExecutionPreview = (): string => {
    if (!localConfig.isActive || localConfig.frequency === 'MANUAL') {
      return 'Execució manual';
    }

    const now = new Date();
    const today = now.getDay();
    const currentHour = now.getHours();

    switch (localConfig.frequency) {
      case 'HOURLY':
        return `Cada hora (pròxima: ${String((currentHour + 1) % 24).padStart(2, '0')}:00)`;

      case 'DAILY':
        const dailyTime = localConfig.time || '09:00';
        const [hours] = dailyTime.split(':').map(Number);
        const isToday = hours > currentHour;
        const nextDay = isToday ? 'avui' : 'demà';
        return `Cada dia a les ${dailyTime} (pròxim: ${nextDay})`;

      case 'WEEKLY':
        if (!localConfig.daysOfWeek?.length) return 'Cap dia seleccionat';
        const nextWeekday = localConfig.daysOfWeek.find(day => day > today) ||
                           localConfig.daysOfWeek[0];
        const dayName = daysOfWeekOptions.find(d => d.value === nextWeekday)?.fullLabel;
        return `${dayName} a les ${localConfig.time || '09:00'}`;

      case 'MONTHLY':
        const dayOfMonth = localConfig.dayOfMonth || 1;
        const nextMonth = now.getDate() > dayOfMonth ? 'mes que ve' : 'aquest mes';
        return `Dia ${dayOfMonth} de cada mes (pròxim: ${nextMonth})`;

      default:
        return 'Configuració no vàlida';
    }
  };

  const hasValidConfiguration = (): boolean => {
    if (!localConfig.isActive || localConfig.frequency === 'MANUAL') {
      return true;
    }

    switch (localConfig.frequency) {
      case 'HOURLY':
        return true;
      case 'DAILY':
        return !!localConfig.time;
      case 'WEEKLY':
        return !!localConfig.time && !!localConfig.daysOfWeek?.length;
      case 'MONTHLY':
        return !!localConfig.time && !!localConfig.dayOfMonth;
      default:
        return false;
    }
  };

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">Programació automàtica</h3>
            <p className="text-sm text-gray-600">Activa l'execució automatitzada</p>
          </div>
        </div>
        <button
          onClick={handleActiveToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            localConfig.isActive ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          disabled={disabled}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              localConfig.isActive ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Freqüència d'execució
        </label>
        <div className="grid grid-cols-1 gap-2">
          {frequencyOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                localConfig.frequency === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={localConfig.frequency === option.value}
                onChange={(e) => handleFrequencyChange(e.target.value as ScheduleFrequency)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={disabled}
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Time Selection (for non-manual and non-hourly) */}
      {localConfig.isActive &&
       localConfig.frequency !== 'MANUAL' &&
       localConfig.frequency !== 'HOURLY' && (
        <div className="space-y-3">
          <label htmlFor="execution-time" className="block text-sm font-medium text-gray-700">
            Hora d'execució
          </label>
          <input
            id="execution-time"
            type="time"
            value={localConfig.time || '09:00'}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          />
        </div>
      )}

      {/* Days of Week Selection (for weekly) */}
      {localConfig.isActive && localConfig.frequency === 'WEEKLY' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Dies de la setmana
          </label>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeekOptions.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDaysOfWeekChange(day.value)}
                className={`p-2 text-sm font-medium rounded-md transition-colors ${
                  localConfig.daysOfWeek?.includes(day.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={day.fullLabel}
                disabled={disabled}
              >
                {day.label}
              </button>
            ))}
          </div>
          {localConfig.daysOfWeek?.length === 0 && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Selecciona almenys un dia de la setmana
            </p>
          )}
        </div>
      )}

      {/* Day of Month Selection (for monthly) */}
      {localConfig.isActive && localConfig.frequency === 'MONTHLY' && (
        <div className="space-y-3">
          <label htmlFor="day-of-month" className="block text-sm font-medium text-gray-700">
            Dia del mes
          </label>
          <select
            id="day-of-month"
            value={localConfig.dayOfMonth || 1}
            onChange={(e) => handleDayOfMonthChange(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                Dia {day}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Vista prèvia de l'execució
        </h4>
        <div className={`p-3 rounded-lg text-sm ${
          hasValidConfiguration()
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {hasValidConfiguration() ? (
            <span>📅 {getNextExecutionPreview()}</span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Configuració incompleta
            </span>
          )}
        </div>
      </div>

      {/* Additional Info for Complex Schedules */}
      {localConfig.isActive && localConfig.frequency !== 'MANUAL' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ Informació important:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Les execucions s'executaran en horari del servidor (CET/CEST)</li>
            <li>• Si una execució falla, es reintentarà automàticament</li>
            <li>• Pots veure l'historial d'execucions a la secció de logs</li>
            {localConfig.frequency === 'WEEKLY' && localConfig.daysOfWeek?.length && (
              <li>• Execucions: {localConfig.daysOfWeek.map(day =>
                daysOfWeekOptions.find(d => d.value === day)?.label
              ).join(', ')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}