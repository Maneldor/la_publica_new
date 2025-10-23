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

  const proficiencyLevels = [
    { value: 'Bàsic', label: 'Bàsic (A1-A2)', description: 'Conceptes elementals i converses senzilles' },
    { value: 'Intermig', label: 'Intermig (B1-B2)', description: 'Comunicació fluida en situacions quotidianes' },
    { value: 'Avançat', label: 'Avançat (C1-C2)', description: 'Domini professional i acadèmic' },
    { value: 'Natiu', label: 'Natiu', description: 'Llengua materna o equivalent' }
  ];

  const getLevelColor = (level: string) => {
    const colors = {
      'Bàsic': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Intermig': 'bg-orange-100 text-orange-800 border-orange-200',
      'Avançat': 'bg-green-100 text-green-800 border-green-200',
      'Natiu': 'bg-blue-100 text-blue-800 border-blue-200'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Idiomes
        </h2>
        <p className="text-gray-600">
          Indica els idiomes que coneixes i el teu nivell de competència per facilitar la col·laboració internacional
        </p>
      </div>

      {/* Languages List */}
      <div className="space-y-6">
        {formData.languages.map((lang, index) => (
          <div key={lang.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Idioma #{index + 1}
                </h3>
              </div>
              <button
                onClick={() => removeLanguage(lang.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                    w-full px-4 py-3 rounded-lg border
                    ${errors[`language_${index}_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  `}
                />
                <datalist id={`languages-${lang.id}`}>
                  {commonLanguages.map((language) => (
                    <option key={language} value={language} />
                  ))}
                </datalist>
                {errors[`language_${index}_name`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`language_${index}_name`]}</p>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivell de Competència *
                </label>
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border
                    ${errors[`language_${index}_proficiency`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  `}
                >
                  <option value="">Selecciona el nivell</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors[`language_${index}_proficiency`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`language_${index}_proficiency`]}</p>
                )}
              </div>
            </div>

            {/* Level Preview */}
            {lang.proficiency && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(lang.proficiency)}`}>
                      {lang.proficiency}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {proficiencyLevels.find(level => level.value === lang.proficiency)?.description}
                    </p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < getLevelStars(lang.proficiency)
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
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
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
                      updateLanguage(newLanguage.id, 'proficiency', suggestion.level);
                    }
                  }, 100);
                }}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.name}</div>
                <div className="text-xs text-gray-600">{suggestion.level}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-3">
          📚 Guia de nivells de competència:
        </h4>
        <div className="space-y-2">
          {proficiencyLevels.map((level) => (
            <div key={level.value} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getLevelColor(level.value)}`}>
                  {level.label}
                </span>
                <span className="text-sm text-blue-700">{level.description}</span>
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          💡 Consells per aquesta secció:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
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
                  {lang.proficiency && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getLevelColor(lang.proficiency)}`}>
                      {lang.proficiency}
                    </span>
                  )}
                </div>
                {lang.proficiency && (
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < getLevelStars(lang.proficiency)
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