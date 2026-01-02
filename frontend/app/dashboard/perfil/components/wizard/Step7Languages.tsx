'use client';

import { Globe, Plus, X, Star } from 'lucide-react';
import { ProfileFormData, Language } from '../../hooks/useProfileWizard';

interface Step7Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: keyof Language, value: string) => void;
  removeLanguage: (id: string) => void;
}

export const Step7Languages = ({
  formData,
  errors,
  updateField,
  addLanguage,
  updateLanguage,
  removeLanguage
}: Step7Props) => {
  const commonLanguages = [
    'Català', 'Castellà', 'Anglès', 'Francès', 'Alemany',
    'Italià', 'Portuguès', 'Euskera', 'Gallec', 'Àrab',
    'Xinès', 'Japonès', 'Rus', 'Hindi', 'Neerlandès'
  ];

  const levelLevels = [
    { value: 'Bàsic', label: 'Bàsic (A1-A2)', description: 'Conceptes elementals i converses senzilles' },
    { value: 'Intermig', label: 'Intermig (B1-B2)', description: 'Comunicació fluida en situacions quotidianes' },
    { value: 'Avançat', label: 'Avançat (C1-C2)', description: 'Domini professional i acadèmic' },
    { value: 'Natiu', label: 'Natiu', description: 'Llengua materna o equivalent' }
  ];

  const getLevelColor = (level: string) => {
    const colors = {
      'Bàsic': 'bg-warning/10 text-warning-dark border-warning/30',
      'Intermig': 'bg-accent/10 text-accent-dark border-accent/30',
      'Avançat': 'bg-success/10 text-success-dark border-success/30',
      'Natiu': 'bg-primary/10 text-primary-dark border-primary/30'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLevelStars = (level: string) => {
    const stars = {
      'Bàsic': 2,
      'Intermig': 3,
      'Avançat': 4,
      'Natiu': 5
    };
    return stars[level as keyof typeof stars] || 1;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--Step7Languages-title-color, #111827)',
          marginBottom: '8px'
        }}>
          Idiomes
        </h2>
        <p style={{ color: 'var(--Step7Languages-description-color, #4b5563)' }}>
          Indica els idiomes que coneixes i el teu nivell de competència per facilitar la col·laboració internacional
        </p>
      </div>

      {/* Languages List */}
      <div className="space-y-6">
        {formData.languages.map((lang, index) => (
          <div key={lang.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Idioma #{index + 1}
                </h3>
              </div>
              <button
                onClick={() => removeLanguage(lang.id)}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma *
                </label>
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                  placeholder="Ex: Anglès"
                  list={`languages-${lang.id}`}
                  className={`
                    w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400
                    ${errors[`language_${index}_name`] ? 'border-error bg-error/10' : 'border-gray-300'}
                    focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-all
                  `}
                />
                <datalist id={`languages-${lang.id}`}>
                  {commonLanguages.map((language) => (
                    <option key={language} value={language} />
                  ))}
                </datalist>
                {errors[`language_${index}_name`] && (
                  <p className="text-sm text-error mt-1">{errors[`language_${index}_name`]}</p>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivell de Competència *
                </label>
                <select
                  value={lang.level}
                  onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400
                    ${errors[`language_${index}_level`] ? 'border-error bg-error/10' : 'border-gray-300'}
                    focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-all
                  `}
                >
                  <option value="">Selecciona el nivell</option>
                  {levelLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors[`language_${index}_level`] && (
                  <p className="text-sm text-error mt-1">{errors[`language_${index}_level`]}</p>
                )}
              </div>
            </div>

            {/* Level Preview */}
            {lang.level && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(lang.level)}`}>
                      {lang.level}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {levelLevels.find(level => level.value === lang.level)?.description}
                    </p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < getLevelStars(lang.level)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Language Button */}
        <button
          onClick={addLanguage}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/10 transition-all text-gray-600 hover:text-primary"
        >
          <Plus className="w-5 h-5" />
          Afegir Idioma
        </button>
      </div>

      {/* Quick Add Suggestions */}
      {formData.languages.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            🌍 Idiomes habituals en l'administració pública:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Català', level: 'Natiu' },
              { name: 'Castellà', level: 'Natiu' },
              { name: 'Anglès', level: 'Intermig' },
              { name: 'Francès', level: 'Bàsic' }
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  addLanguage();
                  // Wait for the language to be added and then update it
                  setTimeout(() => {
                    const languages = formData.languages;
                    const newLanguage = languages[languages.length - 1];
                    if (newLanguage) {
                      updateLanguage(newLanguage.id, 'name', suggestion.name);
                      updateLanguage(newLanguage.id, 'level', suggestion.level);
                    }
                  }, 100);
                }}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:bg-primary/10 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.name}</div>
                <div className="text-xs text-gray-600">{suggestion.level}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level Guide */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-info-dark mb-3">
          📚 Guia de nivells de competència:
        </h4>
        <div className="space-y-2">
          {levelLevels.map((level) => (
            <div key={level.value} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getLevelColor(level.value)}`}>
                  {level.label}
                </span>
                <span className="text-sm text-info">{level.description}</span>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < getLevelStars(level.value)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-success/10 border border-success/30 rounded-lg p-4">
        <p className="text-sm text-success-dark font-medium mb-2">
          💡 Consells per aquesta secció:
        </p>
        <ul className="text-sm text-success space-y-1">
          <li>• Sigues honest amb el teu nivell real de competència</li>
          <li>• Inclou idiomes oficials i co-oficials del teu àmbit</li>
          <li>• Els idiomes t'ajudaran en projectes de cooperació</li>
          <li>• Considera certificacions oficials (Cambridge, DELE, etc.)</li>
          <li>• Ordena per nivell de competència (del més alt al més baix)</li>
        </ul>
      </div>

      {/* Languages Summary */}
      {formData.languages.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            ✅ Resum dels teus idiomes:
          </h4>
          <div className="space-y-2">
            {formData.languages.map((lang, index) => (
              <div key={lang.id} className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <strong>{index + 1}.</strong> {lang.name || 'Idioma pendent'}
                  {lang.level && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getLevelColor(lang.level)}`}>
                      {lang.level}
                    </span>
                  )}
                </div>
                {lang.level && (
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < getLevelStars(lang.level)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};