'use client';

import { Globe, Users, CheckCircle, FileText } from 'lucide-react';

interface GeneralSettingsProps {
  settings: {
    systemName: string;
    defaultLanguage: string;
    timezone: string;
    autoApprove: boolean;
    autoApproveThreshold: number;
    autoAssign: boolean;
    assignmentMethod: string;
    strictEmailValidation: boolean;
    requirePhone: boolean;
    avoidDuplicates: boolean;
    duplicateCriteria: string;
  };
  onChange: (settings: any) => void;
}

export default function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const languageOptions = [
    { value: 'ca', label: 'Català' },
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  const timezoneOptions = [
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  ];

  const assignmentMethods = [
    { value: 'round-robin', label: 'Round-robin (per torns)' },
    { value: 'balanced', label: 'Càrrega equilibrada (basat en leads actius)' },
    { value: 'manual', label: 'Manual (sempre manual)' },
  ];

  const duplicateCriteria = [
    { value: 'email', label: 'Email' },
    { value: 'company', label: 'Nom de l\'empresa' },
    { value: 'email-name', label: 'Email + Nom (recomanat)' },
    { value: 'phone', label: 'Telèfon' },
  ];

  return (
    <div className="space-y-8">
      {/* Sistema Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Sistema</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* System Name */}
          <div>
            <label htmlFor="systemName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom del Sistema
            </label>
            <input
              id="systemName"
              type="text"
              value={settings.systemName}
              onChange={(e) => handleChange('systemName', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="La Pública - Lead Generation"
            />
            <p className="mt-1 text-sm text-gray-600">
              Nom que apareixerà als emails i notificacions
            </p>
          </div>

          {/* Default Language */}
          <div>
            <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              Idioma per Defecte
            </label>
            <select
              id="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-600">
              Idioma per pitches i comunicacions generades per IA
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horària
            </label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-600">
              Per programació de jobs i timestamps
            </p>
          </div>
        </div>
      </div>

      {/* Auto-aprovació Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Auto-aprovació de Leads</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Auto Approve Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Auto-aprovar leads amb score alt</h3>
              <p className="text-sm text-gray-600">
                Els leads amb score ≥ threshold s'aprovaran automàticament
              </p>
            </div>
            <button
              onClick={() => handleChange('autoApprove', !settings.autoApprove)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoApprove ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoApprove ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Auto Approve Threshold */}
          {settings.autoApprove && (
            <div>
              <label htmlFor="autoApproveThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                Threshold d'auto-aprovació ({settings.autoApproveThreshold})
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">70</span>
                <input
                  id="autoApproveThreshold"
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={settings.autoApproveThreshold}
                  onChange={(e) => handleChange('autoApproveThreshold', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-500">95</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Score mínim per auto-aprovació
              </p>
            </div>
          )}

          {/* Auto Assignment Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Assignació automàtica</h3>
              <p className="text-sm text-gray-600">
                Assignar leads aprovats automàticament als gestors
              </p>
            </div>
            <button
              onClick={() => handleChange('autoAssign', !settings.autoAssign)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoAssign ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoAssign ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Assignment Method */}
          {settings.autoAssign && (
            <div>
              <label htmlFor="assignmentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Mètode d'assignació
              </label>
              <select
                id="assignmentMethod"
                value={settings.assignmentMethod}
                onChange={(e) => handleChange('assignmentMethod', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {assignmentMethods.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Qualitat de Dades Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Qualitat de Dades</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Strict Email Validation */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Validació estricta d'emails</h3>
              <p className="text-sm text-gray-600">
                Rebutjar leads amb emails invàlids
              </p>
            </div>
            <button
              onClick={() => handleChange('strictEmailValidation', !settings.strictEmailValidation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.strictEmailValidation ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.strictEmailValidation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Require Phone */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Requerir telèfon</h3>
              <p className="text-sm text-gray-600">
                Descartar leads sense número de telèfon
              </p>
            </div>
            <button
              onClick={() => handleChange('requirePhone', !settings.requirePhone)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requirePhone ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requirePhone ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Avoid Duplicates */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Evitar duplicats</h3>
              <p className="text-sm text-gray-600">
                Detectar empreses duplicades abans de crear lead
              </p>
            </div>
            <button
              onClick={() => handleChange('avoidDuplicates', !settings.avoidDuplicates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.avoidDuplicates ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.avoidDuplicates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Duplicate Criteria */}
          {settings.avoidDuplicates && (
            <div>
              <label htmlFor="duplicateCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                Criteri de duplicat
              </label>
              <select
                id="duplicateCriteria"
                value={settings.duplicateCriteria}
                onChange={(e) => handleChange('duplicateCriteria', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {duplicateCriteria.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          📋 Resum de Configuració
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <div><span className="font-medium">Sistema:</span> {settings.systemName} ({settings.defaultLanguage.toUpperCase()})</div>
          <div><span className="font-medium">Auto-aprovació:</span> {settings.autoApprove ? `Activada (≥${settings.autoApproveThreshold})` : 'Desactivada'}</div>
          <div><span className="font-medium">Assignació:</span> {settings.autoAssign ? settings.assignmentMethod : 'Manual'}</div>
          <div><span className="font-medium">Qualitat:</span>
            {settings.strictEmailValidation ? ' Email estricte' : ''}
            {settings.requirePhone ? ' • Telèfon obligatori' : ''}
            {settings.avoidDuplicates ? ` • Anti-duplicats (${settings.duplicateCriteria})` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}