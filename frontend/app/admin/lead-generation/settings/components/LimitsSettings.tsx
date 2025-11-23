'use client';

import { Activity, Bot, TrendingUp, Trash2 } from 'lucide-react';

interface LimitsSettingsProps {
  settings: {
    maxConcurrentJobs: number;
    maxLeadsPerJob: number;
    maxJobDuration: number;
    requestDelay: number;
    maxAIRequestsPerMinute: number;
    maxDailyAICost: number;
    costAlertThreshold: number;
    maxDailyLeads: number;
    maxWeeklyLeads: number;
    deleteJobsAfterDays: number;
    deleteLogsAfterDays: number;
    archiveRejectedAfterDays: number;
  };
  onChange: (settings: any) => void;
}

export default function LimitsSettings({ settings, onChange }: LimitsSettingsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Límits de Scraping Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Límits de Scraping</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Max Concurrent Jobs */}
          <div>
            <label htmlFor="maxConcurrentJobs" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim jobs simultanis
            </label>
            <input
              id="maxConcurrentJobs"
              type="number"
              min="1"
              max="10"
              value={settings.maxConcurrentJobs}
              onChange={(e) => handleChange('maxConcurrentJobs', parseInt(e.target.value) || 1)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Jobs de scraping que poden executar-se alhora
            </p>
          </div>

          {/* Max Leads Per Job */}
          <div>
            <label htmlFor="maxLeadsPerJob" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim leads per job
            </label>
            <input
              id="maxLeadsPerJob"
              type="number"
              min="10"
              max="500"
              value={settings.maxLeadsPerJob}
              onChange={(e) => handleChange('maxLeadsPerJob', parseInt(e.target.value) || 10)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Màxim de leads a processar per execució
            </p>
          </div>

          {/* Max Job Duration */}
          <div>
            <label htmlFor="maxJobDuration" className="block text-sm font-medium text-gray-700 mb-2">
              Temps màxim per job (minuts)
            </label>
            <input
              id="maxJobDuration"
              type="number"
              min="5"
              max="60"
              value={settings.maxJobDuration}
              onChange={(e) => handleChange('maxJobDuration', parseInt(e.target.value) || 5)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Temps màxim abans de cancel·lar automàticament
            </p>
            {(settings.maxJobDuration < 5 || settings.maxJobDuration > 60) && (
              <p className="mt-1 text-sm text-red-600">
                El valor ha d'estar entre 5 i 60 minuts
              </p>
            )}
          </div>

          {/* Request Delay */}
          <div>
            <label htmlFor="requestDelay" className="block text-sm font-medium text-gray-700 mb-2">
              Delay entre requests (ms)
            </label>
            <input
              id="requestDelay"
              type="number"
              min="0"
              max="5000"
              value={settings.requestDelay}
              onChange={(e) => handleChange('requestDelay', parseInt(e.target.value) || 0)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Pausa entre requests per evitar rate limits
            </p>
          </div>
        </div>
      </div>

      {/* Límits d'IA Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Límits d'IA</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Max AI Requests Per Minute */}
          <div>
            <label htmlFor="maxAIRequestsPerMinute" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim requests IA per minut
            </label>
            <input
              id="maxAIRequestsPerMinute"
              type="number"
              min="10"
              max="100"
              value={settings.maxAIRequestsPerMinute}
              onChange={(e) => handleChange('maxAIRequestsPerMinute', parseInt(e.target.value) || 10)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Límit per evitar excedir quotes dels providers
            </p>
          </div>

          {/* Max Daily AI Cost */}
          <div>
            <label htmlFor="maxDailyAICost" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim cost diari d'IA ($)
            </label>
            <input
              id="maxDailyAICost"
              type="number"
              min="1"
              max="100"
              step="0.01"
              value={settings.maxDailyAICost}
              onChange={(e) => handleChange('maxDailyAICost', parseFloat(e.target.value) || 1)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Pausar jobs si s'excedeix el cost diari
            </p>
          </div>

          {/* Cost Alert Threshold */}
          <div>
            <label htmlFor="costAlertThreshold" className="block text-sm font-medium text-gray-700 mb-2">
              Alertar al arribar al (%)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">50</span>
              <input
                id="costAlertThreshold"
                type="range"
                min="50"
                max="90"
                step="5"
                value={settings.costAlertThreshold}
                onChange={(e) => handleChange('costAlertThreshold', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">90</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {settings.costAlertThreshold}% del límit diari per enviar alerta (${(settings.maxDailyAICost * settings.costAlertThreshold / 100).toFixed(2)})
            </p>
            {settings.maxDailyAICost < (settings.maxDailyAICost * settings.costAlertThreshold / 100) && (
              <p className="mt-1 text-sm text-red-600">
                El cost màxim diari ha de ser superior al threshold d'alerta
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quotes de Generació Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quotes de Generació</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Max Daily Leads */}
          <div>
            <label htmlFor="maxDailyLeads" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim leads nous per dia
            </label>
            <input
              id="maxDailyLeads"
              type="number"
              min="50"
              max="1000"
              value={settings.maxDailyLeads}
              onChange={(e) => handleChange('maxDailyLeads', parseInt(e.target.value) || 50)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Límit diari de leads generats automàticament
            </p>
          </div>

          {/* Max Weekly Leads */}
          <div>
            <label htmlFor="maxWeeklyLeads" className="block text-sm font-medium text-gray-700 mb-2">
              Màxim leads nous per setmana
            </label>
            <input
              id="maxWeeklyLeads"
              type="number"
              min="200"
              max="5000"
              value={settings.maxWeeklyLeads}
              onChange={(e) => handleChange('maxWeeklyLeads', parseInt(e.target.value) || 200)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Límit setmanal total
            </p>
            {settings.maxWeeklyLeads < (settings.maxDailyLeads * 7) && (
              <p className="mt-1 text-sm text-yellow-600">
                El límit setmanal és inferior al diari × 7 ({settings.maxDailyLeads * 7})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Neteja Automàtica Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Neteja Automàtica</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Delete Jobs After Days */}
          <div>
            <label htmlFor="deleteJobsAfterDays" className="block text-sm font-medium text-gray-700 mb-2">
              Eliminar jobs antics després de (dies)
            </label>
            <input
              id="deleteJobsAfterDays"
              type="number"
              min="7"
              max="90"
              value={settings.deleteJobsAfterDays}
              onChange={(e) => handleChange('deleteJobsAfterDays', parseInt(e.target.value) || 7)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Jobs completats/fallits s'eliminaran automàticament
            </p>
            {settings.deleteJobsAfterDays < 7 && (
              <p className="mt-1 text-sm text-red-600">
                Mínim 7 dies per evitar perdre dades recents
              </p>
            )}
          </div>

          {/* Delete Logs After Days */}
          <div>
            <label htmlFor="deleteLogsAfterDays" className="block text-sm font-medium text-gray-700 mb-2">
              Eliminar logs després de (dies)
            </label>
            <input
              id="deleteLogsAfterDays"
              type="number"
              min="7"
              max="90"
              value={settings.deleteLogsAfterDays}
              onChange={(e) => handleChange('deleteLogsAfterDays', parseInt(e.target.value) || 7)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Logs d'execució s'eliminaran per estalviar espai
            </p>
          </div>

          {/* Archive Rejected After Days */}
          <div>
            <label htmlFor="archiveRejectedAfterDays" className="block text-sm font-medium text-gray-700 mb-2">
              Arxivar leads rebutjats després de (dies)
            </label>
            <input
              id="archiveRejectedAfterDays"
              type="number"
              min="30"
              max="180"
              value={settings.archiveRejectedAfterDays}
              onChange={(e) => handleChange('archiveRejectedAfterDays', parseInt(e.target.value) || 30)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Leads rebutjats s'arxivaran automàticament
            </p>
          </div>
        </div>
      </div>

      {/* Cost Calculator Preview */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
          💰 Estimació de Costos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded p-3">
            <div className="text-purple-700 font-medium">Cost diari màxim</div>
            <div className="text-lg font-bold text-purple-900">${settings.maxDailyAICost}</div>
            <div className="text-xs text-purple-600">Alerta als ${(settings.maxDailyAICost * settings.costAlertThreshold / 100).toFixed(2)}</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-purple-700 font-medium">Cost setmanal estimat</div>
            <div className="text-lg font-bold text-purple-900">${(settings.maxDailyAICost * 7).toFixed(2)}</div>
            <div className="text-xs text-purple-600">Si s'usa el màxim diari</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-purple-700 font-medium">Leads processables/dia</div>
            <div className="text-lg font-bold text-purple-900">{settings.maxDailyLeads}</div>
            <div className="text-xs text-purple-600">Amb {settings.maxConcurrentJobs} jobs simultanis</div>
          </div>
        </div>
      </div>

      {/* Warning for High Limits */}
      {(settings.maxConcurrentJobs > 5 || settings.maxDailyAICost > 50) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800">Límits elevats detectats</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Els límits configurats són elevats. Assegura't que el sistema pot gestionar aquesta càrrega de treball.
              </p>
              {settings.maxConcurrentJobs > 5 && (
                <p className="text-sm text-yellow-700">• Més de 5 jobs simultanis poden saturar el sistema</p>
              )}
              {settings.maxDailyAICost > 50 && (
                <p className="text-sm text-yellow-700">• Cost diari d'IA superior a $50</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}