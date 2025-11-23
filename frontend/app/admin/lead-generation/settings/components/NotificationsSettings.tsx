'use client';

import { useState } from 'react';
import { Mail, AlertTriangle, BarChart3, X, Plus } from 'lucide-react';

interface NotificationsSettingsProps {
  settings: {
    adminEmail: string;
    additionalEmails: string[];
    alerts: {
      jobFailed: { enabled: boolean; method: string };
      costExceeded: { enabled: boolean; method: string };
      rateLimitReached: { enabled: boolean; method: string };
      jobStuck: { enabled: boolean; method: string };
      sourceDown: { enabled: boolean; method: string };
      lowSuccessRate: { enabled: boolean; threshold: number };
      manyLowScores: { enabled: boolean; threshold: number };
    };
    summaries: {
      daily: { enabled: boolean; time: string };
      weekly: { enabled: boolean; day: string; time: string };
      content: {
        totalLeads: boolean;
        approvalRate: boolean;
        aiCost: boolean;
        topSources: boolean;
        errorsWarnings: boolean;
        scheduledJobs: boolean;
      };
    };
  };
  onChange: (settings: any) => void;
}

export default function NotificationsSettings({ settings, onChange }: NotificationsSettingsProps) {
  const [newEmail, setNewEmail] = useState('');

  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const handleAlertChange = (alertType: string, field: string, value: any) => {
    onChange({
      ...settings,
      alerts: {
        ...settings.alerts,
        [alertType]: {
          ...settings.alerts[alertType as keyof typeof settings.alerts],
          [field]: value,
        },
      },
    });
  };

  const handleSummaryChange = (summaryType: string, field: string, value: any) => {
    onChange({
      ...settings,
      summaries: {
        ...settings.summaries,
        [summaryType]: {
          ...settings.summaries[summaryType as keyof typeof settings.summaries],
          [field]: value,
        },
      },
    });
  };

  const handleContentChange = (contentType: string, value: boolean) => {
    onChange({
      ...settings,
      summaries: {
        ...settings.summaries,
        content: {
          ...settings.summaries.content,
          [contentType]: value,
        },
      },
    });
  };

  const addEmail = () => {
    if (newEmail && isValidEmail(newEmail) && !settings.additionalEmails.includes(newEmail)) {
      handleChange('additionalEmails', [...settings.additionalEmails, newEmail]);
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    handleChange('additionalEmails', settings.additionalEmails.filter(email => email !== emailToRemove));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const notificationMethods = [
    { value: 'email', label: 'Email' },
    { value: 'toast', label: 'Toast' },
    { value: 'both', label: 'Ambdós' },
  ];

  const weekDays = [
    { value: 'monday', label: 'Dilluns' },
    { value: 'tuesday', label: 'Dimarts' },
    { value: 'wednesday', label: 'Dimecres' },
    { value: 'thursday', label: 'Dijous' },
    { value: 'friday', label: 'Divendres' },
    { value: 'saturday', label: 'Dissabte' },
    { value: 'sunday', label: 'Diumenge' },
  ];

  return (
    <div className="space-y-8">
      {/* Emails de Notificació Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Emails de Notificació</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Admin Email */}
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email d'administrador *
            </label>
            <input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${
                !isValidEmail(settings.adminEmail) && settings.adminEmail
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="admin@lapublica.cat"
            />
            <p className="mt-1 text-sm text-gray-600">
              Email principal per alertes crítiques
            </p>
            {!isValidEmail(settings.adminEmail) && settings.adminEmail && (
              <p className="mt-1 text-sm text-red-600">
                Format d'email no vàlid
              </p>
            )}
          </div>

          {/* Additional Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emails addicionals
            </label>

            {/* Email Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <span>{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Email Input */}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="nou@email.com"
              />
              <button
                onClick={addEmail}
                disabled={!newEmail || !isValidEmail(newEmail)}
                className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Afegir
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Altres destinataris per notificacions
            </p>
          </div>
        </div>
      </div>

      {/* Alertes de Sistema Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Alertes de Sistema</h2>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-lg p-6">
          {/* Job Failed */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Job fallit</h3>
              <p className="text-sm text-gray-600">Quan un job de scraping falla</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.alerts.jobFailed.method}
                onChange={(e) => handleAlertChange('jobFailed', 'method', e.target.value)}
                disabled={!settings.alerts.jobFailed.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {notificationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAlertChange('jobFailed', 'enabled', !settings.alerts.jobFailed.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.jobFailed.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.jobFailed.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cost Exceeded */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Límit de cost excedit</h3>
              <p className="text-sm text-gray-600">Quan s'excedeix el cost diari d'IA</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.alerts.costExceeded.method}
                onChange={(e) => handleAlertChange('costExceeded', 'method', e.target.value)}
                disabled={!settings.alerts.costExceeded.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {notificationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAlertChange('costExceeded', 'enabled', !settings.alerts.costExceeded.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.costExceeded.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.costExceeded.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Rate Limit Reached */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Rate limit arribat</h3>
              <p className="text-sm text-gray-600">Quan s'arriba al rate limit d'un provider</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.alerts.rateLimitReached.method}
                onChange={(e) => handleAlertChange('rateLimitReached', 'method', e.target.value)}
                disabled={!settings.alerts.rateLimitReached.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {notificationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAlertChange('rateLimitReached', 'enabled', !settings.alerts.rateLimitReached.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.rateLimitReached.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.rateLimitReached.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Job Stuck */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Job bloquejat</h3>
              <p className="text-sm text-gray-600">Quan un job porta més de 30 minuts sense progrés</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.alerts.jobStuck.method}
                onChange={(e) => handleAlertChange('jobStuck', 'method', e.target.value)}
                disabled={!settings.alerts.jobStuck.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {notificationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAlertChange('jobStuck', 'enabled', !settings.alerts.jobStuck.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.jobStuck.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.jobStuck.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Source Down */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Font de scraping caiguda</h3>
              <p className="text-sm text-gray-600">Quan una font falla 3 vegades seguides</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.alerts.sourceDown.method}
                onChange={(e) => handleAlertChange('sourceDown', 'method', e.target.value)}
                disabled={!settings.alerts.sourceDown.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {notificationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAlertChange('sourceDown', 'enabled', !settings.alerts.sourceDown.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.sourceDown.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.sourceDown.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes de Qualitat Section */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Alertes de Qualitat</h3>

        <div className="space-y-4 bg-gray-50 rounded-lg p-6">
          {/* Low Success Rate */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Taxa d'èxit baixa</h3>
              <p className="text-sm text-gray-600">
                Quan una font té menys del {settings.alerts.lowSuccessRate.threshold}% d'èxit
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="10"
                max="90"
                value={settings.alerts.lowSuccessRate.threshold}
                onChange={(e) => handleAlertChange('lowSuccessRate', 'threshold', parseInt(e.target.value) || 60)}
                disabled={!settings.alerts.lowSuccessRate.enabled}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-500">%</span>
              <button
                onClick={() => handleAlertChange('lowSuccessRate', 'enabled', !settings.alerts.lowSuccessRate.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.lowSuccessRate.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.lowSuccessRate.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Many Low Scores */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Molts leads amb score baix</h3>
              <p className="text-sm text-gray-600">
                Quan més del {settings.alerts.manyLowScores.threshold}% dels leads tenen score &lt; 50
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="30"
                max="80"
                value={settings.alerts.manyLowScores.threshold}
                onChange={(e) => handleAlertChange('manyLowScores', 'threshold', parseInt(e.target.value) || 50)}
                disabled={!settings.alerts.manyLowScores.enabled}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-500">%</span>
              <button
                onClick={() => handleAlertChange('manyLowScores', 'enabled', !settings.alerts.manyLowScores.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alerts.manyLowScores.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alerts.manyLowScores.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resums Periòdics Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Resums Periòdics</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Daily Summary */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Resum diari</h3>
              <p className="text-sm text-gray-600">Email amb resum de leads generats ahir</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={settings.summaries.daily.time}
                onChange={(e) => handleSummaryChange('daily', 'time', e.target.value)}
                disabled={!settings.summaries.daily.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleSummaryChange('daily', 'enabled', !settings.summaries.daily.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.summaries.daily.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.summaries.daily.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Resum setmanal</h3>
              <p className="text-sm text-gray-600">Email amb resum de la setmana</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={settings.summaries.weekly.day}
                onChange={(e) => handleSummaryChange('weekly', 'day', e.target.value)}
                disabled={!settings.summaries.weekly.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {weekDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={settings.summaries.weekly.time}
                onChange={(e) => handleSummaryChange('weekly', 'time', e.target.value)}
                disabled={!settings.summaries.weekly.enabled}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleSummaryChange('weekly', 'enabled', !settings.summaries.weekly.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.summaries.weekly.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.summaries.weekly.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Summary Content */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Contingut del resum</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'totalLeads', label: 'Total de leads generats' },
                { key: 'approvalRate', label: 'Taxa d\'aprovació' },
                { key: 'aiCost', label: 'Cost d\'IA' },
                { key: 'topSources', label: 'Fonts més exitoses' },
                { key: 'errorsWarnings', label: 'Errors i warnings' },
                { key: 'scheduledJobs', label: 'Jobs programats per avui/setmana' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.summaries.content[item.key as keyof typeof settings.summaries.content]}
                    onChange={(e) => handleContentChange(item.key, e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-900">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Email Recipients */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          📧 Destinataris configurats
        </h3>
        <div className="text-sm text-blue-700">
          <div><span className="font-medium">Principal:</span> {settings.adminEmail}</div>
          {settings.additionalEmails.length > 0 && (
            <div><span className="font-medium">Addicionals:</span> {settings.additionalEmails.join(', ')}</div>
          )}
          <div><span className="font-medium">Total:</span> {1 + settings.additionalEmails.length} destinataris</div>
        </div>
      </div>
    </div>
  );
}