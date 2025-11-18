'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Save,
  RefreshCw,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface NotificationPreferences {
  // Email
  emailEnabled: boolean;
  emailCouponGenerated: boolean;
  emailCouponUsed: boolean;
  emailWeeklySummary: boolean;
  emailMarketing: boolean;

  // In-App
  inAppCouponGenerated: boolean;
  inAppCouponUsed: boolean;
  inAppOfferExpiring: boolean;
  inAppNewFavorite: boolean;

  // Configuración adicional
  weeklyReportDay?: string;
  timezone?: string;
}

export default function PreferenciesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar preferencias actuales
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/preferences');

      if (!response.ok) {
        throw new Error('Error al carregar preferències');
      }

      const data = await response.json();

      console.log('✅ Preferences loaded:', data);

      setPreferences(data.preferences);
      setHasChanges(false);

    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setLoading(false);
    }
  };

  // Guardar preferencias
  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Error al guardar preferències');
      }

      const data = await response.json();

      console.log('✅ Preferences saved:', data);

      setPreferences(data.preferences);
      setHasChanges(false);
      setSuccessMessage('Preferències guardades correctament');

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Actualizar preferencia
  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: value
    });
    setHasChanges(true);
  };

  // Toggle global de emails
  const toggleAllEmails = (enabled: boolean) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      emailEnabled: enabled,
      emailCouponGenerated: enabled,
      emailCouponUsed: enabled,
      emailWeeklySummary: enabled,
      emailMarketing: enabled
    });
    setHasChanges(true);
  };

  // Toggle global de in-app
  const toggleAllInApp = (enabled: boolean) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      inAppCouponGenerated: enabled,
      inAppCouponUsed: enabled,
      inAppOfferExpiring: enabled,
      inAppNewFavorite: enabled
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant preferències...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error al carregar preferències</p>
          <button
            onClick={loadPreferences}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-7 h-7" />
                Preferències de Notificacions
              </h1>
              <p className="text-gray-600 mt-1">
                Configura com i quan vols rebre notificacions
              </p>
            </div>

            {hasChanges && (
              <button
                onClick={savePreferences}
                disabled={saving}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 font-semibold"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Guardant...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Canvis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Info banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Com funcionen les notificacions
              </h3>
              <p className="text-blue-800 text-sm">
                Pots rebre notificacions per email i/o dins l'aplicació. Configura què vols rebre
                i amb quina freqüència. Els canvis s'apliquen immediatament.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Notificaciones por Email */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Notificacions per Email
                  </h2>
                  <p className="text-sm text-gray-600">
                    Rebre notificacions al teu correu electrònic
                  </p>
                </div>
              </div>

              {/* Toggle global */}
              <button
                onClick={() => toggleAllEmails(!preferences.emailEnabled)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${preferences.emailEnabled ? 'bg-green-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Cupón generado */}
            <PreferenceToggle
              icon="🎫"
              title="Cupó Generat"
              description="Quan generes un nou cupó per a una oferta"
              enabled={preferences.emailCouponGenerated}
              disabled={!preferences.emailEnabled}
              onChange={(value) => updatePreference('emailCouponGenerated', value)}
            />

            {/* Cupón usado */}
            <PreferenceToggle
              icon="✅"
              title="Cupó Utilitzat"
              description="Quan un cupó que has creat és utilitzat (només per empreses)"
              enabled={preferences.emailCouponUsed}
              disabled={!preferences.emailEnabled}
              onChange={(value) => updatePreference('emailCouponUsed', value)}
            />

            {/* Resumen semanal */}
            <PreferenceToggle
              icon="📊"
              title="Resum Setmanal"
              description="Rebre un resum setmanal de la teva activitat"
              enabled={preferences.emailWeeklySummary}
              disabled={!preferences.emailEnabled}
              onChange={(value) => updatePreference('emailWeeklySummary', value)}
            />

            {/* Marketing */}
            <PreferenceToggle
              icon="📣"
              title="Novetats i Promocions"
              description="Rebre informació sobre noves funcionalitats i ofertes especials"
              enabled={preferences.emailMarketing}
              disabled={!preferences.emailEnabled}
              onChange={(value) => updatePreference('emailMarketing', value)}
            />
          </div>
        </div>

        {/* SECCIÓN: Notificaciones In-App */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Notificacions In-App
                  </h2>
                  <p className="text-sm text-gray-600">
                    Rebre notificacions dins l'aplicació (campaneta 🔔)
                  </p>
                </div>
              </div>

              {/* Toggle global */}
              <button
                onClick={() => {
                  const allEnabled = preferences.inAppCouponGenerated &&
                                   preferences.inAppCouponUsed &&
                                   preferences.inAppOfferExpiring &&
                                   preferences.inAppNewFavorite;
                  toggleAllInApp(!allEnabled);
                }}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${(preferences.inAppCouponGenerated || preferences.inAppCouponUsed ||
                     preferences.inAppOfferExpiring || preferences.inAppNewFavorite)
                    ? 'bg-green-600'
                    : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${(preferences.inAppCouponGenerated || preferences.inAppCouponUsed ||
                       preferences.inAppOfferExpiring || preferences.inAppNewFavorite)
                      ? 'translate-x-6'
                      : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Cupón generado */}
            <PreferenceToggle
              icon="🎫"
              title="Cupó Generat"
              description="Notificació quan generes un nou cupó"
              enabled={preferences.inAppCouponGenerated}
              onChange={(value) => updatePreference('inAppCouponGenerated', value)}
            />

            {/* Cupón usado */}
            <PreferenceToggle
              icon="✅"
              title="Cupó Utilitzat"
              description="Notificació quan un dels teus cupons és utilitzat (empreses)"
              enabled={preferences.inAppCouponUsed}
              onChange={(value) => updatePreference('inAppCouponUsed', value)}
            />

            {/* Oferta expirando */}
            <PreferenceToggle
              icon="⏰"
              title="Oferta a Punt de Caducar"
              description="Avís quan una oferta guardada està a punt d'expirar"
              enabled={preferences.inAppOfferExpiring}
              onChange={(value) => updatePreference('inAppOfferExpiring', value)}
            />

            {/* Nuevo favorito */}
            <PreferenceToggle
              icon="❤️"
              title="Nou Favorit"
              description="Notificació quan algú guarda una de les teves ofertes (empreses)"
              enabled={preferences.inAppNewFavorite}
              onChange={(value) => updatePreference('inAppNewFavorite', value)}
            />
          </div>
        </div>

        {/* Botón guardar inferior */}
        {hasChanges && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Tens canvis sense guardar
                </p>
                <p className="text-sm text-gray-600">
                  Recorda guardar les preferències per aplicar els canvis
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={loadPreferences}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 font-semibold"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Guardant...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Canvis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Toggle reutilizable
function PreferenceToggle({
  icon,
  title,
  description,
  enabled,
  disabled = false,
  onChange
}: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${
      disabled ? 'bg-gray-50 opacity-60' : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex gap-3 flex-1">
        <div className="text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-0.5">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0
          ${disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : enabled
              ? 'bg-green-600'
              : 'bg-gray-300'
          }
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}