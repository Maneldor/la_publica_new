'use client';

import { useState } from 'react';
import { Wrench, Trash2, Database, HardDrive, AlertTriangle, Download, Play, RefreshCw, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MaintenanceSettingsProps {
  settings: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    autoCleanup: boolean;
    cleanupFrequency: string;
    autoBackup: boolean;
    backupFrequency: string;
    backupTime: string;
    lastBackup: string;
    logLevel: string;
    realtimeLogs: boolean;
  };
  onChange: (settings: any) => void;
}

export default function MaintenanceSettings({ settings, onChange }: MaintenanceSettingsProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Diari' },
    { value: 'weekly', label: 'Setmanal' },
    { value: 'monthly', label: 'Mensual' },
  ];

  const logLevelOptions = [
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' },
  ];

  const formatLastBackup = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formattedDate = date.toLocaleDateString('ca-ES') + ' ' + date.toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diffDays === 0) return `avui (${formattedDate})`;
    if (diffDays === 1) return `fa 1 dia (${formattedDate})`;
    return `fa ${diffDays} dies (${formattedDate})`;
  };

  const handleMaintenanceModeToggle = () => {
    if (!settings.maintenanceMode) {
      const confirmed = confirm(
        'Activar el mode manteniment pausarà tots els jobs automàtics. Estàs segur?'
      );
      if (confirmed) {
        handleChange('maintenanceMode', true);
        toast({
          title: '⚠️ Mode manteniment activat',
          description: 'Tots els jobs automàtics han estat pausats',
          variant: 'destructive',
        });
      }
    } else {
      handleChange('maintenanceMode', false);
      toast({
        title: '✅ Mode manteniment desactivat',
        description: 'Els jobs automàtics s\'han reprès',
      });
    }
  };

  const handleOptimizeDatabase = async () => {
    setIsOptimizing(true);
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: '✅ Base de dades optimitzada',
        description: 'Les taules han estat reindexades correctament',
      });
    } catch (error) {
      toast({
        title: 'Error d\'optimització',
        description: 'No s\'ha pogut optimitzar la base de dades',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleManualCleanup = async () => {
    setShowCleanupDialog(false);
    setIsCleaning(true);
    try {
      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 5000));
      toast({
        title: '✅ Neteja completada',
        description: 'S\'han eliminat 47 jobs antics, 234 logs i 12 leads rebutjats (~12.3 MB)',
      });
    } catch (error) {
      toast({
        title: 'Error de neteja',
        description: 'No s\'ha pogut completar la neteja',
        variant: 'destructive',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 4000));

      const now = new Date();
      handleChange('lastBackup', now.toISOString());

      toast({
        title: '✅ Backup creat',
        description: 'Còpia de seguretat creada correctament (52.1 MB)',
      });
    } catch (error) {
      toast({
        title: 'Error de backup',
        description: 'No s\'ha pogut crear la còpia de seguretat',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = () => {
    toast({
      title: 'Descarregant backup',
      description: 'La còpia de seguretat s\'està preparant per descarregar',
    });
  };

  const handleExportLogs = () => {
    toast({
      title: 'Exportant logs',
      description: 'Els logs del sistema s\'estan preparant (.zip)',
    });
  };

  const CleanupDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmar Neteja Manual
          </h3>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-3">Aquesta acció eliminarà:</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 47 jobs antics (&gt;30 dies)</li>
              <li>• 234 logs antics (&gt;14 dies)</li>
              <li>• 12 leads rebutjats (&gt;90 dies)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-yellow-300">
              <p className="text-sm font-medium text-yellow-800">
                Total espai alliberat: ~12.3 MB
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCleanupDialog(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleManualCleanup}
              disabled={isCleaning}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Confirmar Neteja
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Mode Manteniment Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Mode Manteniment</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Activar mode manteniment</h3>
              <p className="text-sm text-gray-600">
                Això pausarà tots els jobs automàtics
              </p>
              {settings.maintenanceMode && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ El sistema està actualment en manteniment
                </p>
              )}
            </div>
            <button
              onClick={handleMaintenanceModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Maintenance Message */}
          {settings.maintenanceMode && (
            <div>
              <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Missatge de manteniment
              </label>
              <textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                maxLength={200}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="El sistema està en manteniment. Tornarà aviat."
              />
              <p className="mt-1 text-sm text-gray-600">
                {settings.maintenanceMessage.length}/200 caràcters
              </p>
              {settings.maintenanceMessage.length > 200 && (
                <p className="mt-1 text-sm text-red-600">
                  El missatge no pot superar els 200 caràcters
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tasques de Neteja Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tasques de Neteja</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Manual Cleanup */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Executar neteja ara</h3>
              <p className="text-sm text-gray-600">
                Elimina jobs antics, logs i leads rebutjats
              </p>
            </div>
            <button
              onClick={() => setShowCleanupDialog(true)}
              disabled={isCleaning}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Netejant...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Executar Neteja Manual
                </>
              )}
            </button>
          </div>

          {/* Auto Cleanup */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Neteja automàtica</h3>
              <p className="text-sm text-gray-600">
                Executar neteja cada nit a les 03:00
              </p>
            </div>
            <button
              onClick={() => handleChange('autoCleanup', !settings.autoCleanup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoCleanup ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoCleanup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Cleanup Frequency */}
          {settings.autoCleanup && (
            <div>
              <label htmlFor="cleanupFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                Freqüència de neteja
              </label>
              <select
                id="cleanupFrequency"
                value={settings.cleanupFrequency}
                onChange={(e) => handleChange('cleanupFrequency', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Base de Dades Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Base de Dades</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Optimize Database */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Optimitzar base de dades</h3>
              <p className="text-sm text-gray-600">
                Reindexar i optimitzar taules
              </p>
            </div>
            <button
              onClick={handleOptimizeDatabase}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Optimitzant...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Optimitzar Ara
                </>
              )}
            </button>
          </div>

          {/* Last Optimization */}
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">Última optimització</h3>
            <p className="text-sm text-gray-600">
              fa 5 dies (17/11/2024 03:00)
            </p>
          </div>
        </div>
      </div>

      {/* Còpies de Seguretat Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Còpies de Seguretat</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Auto Backup */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Backup automàtic</h3>
              <p className="text-sm text-gray-600">
                Crear còpies de seguretat programades
              </p>
            </div>
            <button
              onClick={() => handleChange('autoBackup', !settings.autoBackup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBackup ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.autoBackup && (
            <>
              {/* Backup Frequency */}
              <div>
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Freqüència de backup
                </label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Backup Time */}
              <div>
                <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora del backup
                </label>
                <input
                  id="backupTime"
                  type="time"
                  value={settings.backupTime}
                  onChange={(e) => handleChange('backupTime', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </>
          )}

          {/* Last Backup */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Últim backup</h3>
              <p className="text-sm text-gray-600">
                {formatLastBackup(settings.lastBackup)} - 45.2 MB
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Download className="h-4 w-4" />
              Descarregar
            </button>
          </div>

          {/* Manual Backup */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Crear backup manual ara</h3>
              <p className="text-sm text-gray-600">
                Genera una còpia de seguretat immediata
              </p>
            </div>
            <button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Creant...
                </>
              ) : (
                <>
                  <HardDrive className="h-4 w-4" />
                  Crear Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logs i Debugging Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Logs i Debugging</h2>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          {/* Log Level */}
          <div>
            <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Nivell de logging
            </label>
            <select
              id="logLevel"
              value={settings.logLevel}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {logLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-600">
              Més verbós = més espai ocupat
            </p>
          </div>

          {/* Realtime Logs */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Logs en temps real</h3>
              <p className="text-sm text-gray-600">
                Només per debugging, afecta el rendiment
              </p>
              {settings.realtimeLogs && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Pot afectar el rendiment del sistema
                </p>
              )}
            </div>
            <button
              onClick={() => handleChange('realtimeLogs', !settings.realtimeLogs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.realtimeLogs ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.realtimeLogs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Export Logs */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Exportar logs del sistema</h3>
              <p className="text-sm text-gray-600">
                Útil per debugging amb suport tècnic
              </p>
            </div>
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              Exportar Logs (.zip)
            </button>
          </div>
        </div>
      </div>

      {/* Warning for Debug Mode */}
      {settings.logLevel === 'debug' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Mode debug activat</h4>
              <p className="text-sm text-yellow-700 mt-1">
                El nivell de logging està configurat en debug. Això pot generar molts logs i ocupar espai d'emmagatzematge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Dialog */}
      {showCleanupDialog && <CleanupDialog />}
    </div>
  );
}