'use client';

import { Briefcase, Plus, X, Calendar } from 'lucide-react';
import { ProfileFormData, Experience } from '../../hooks/useProfileWizard';

interface Step5Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
  removeExperience: (id: string) => void;
}

export const Step5Experience = ({
  formData,
  errors,
  updateField,
  addExperience,
  updateExperience,
  removeExperience
}: Step5Props) => {
  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === 'Present') return '';
    // Convert "2015-09" to "2015-09" (should already be in correct format)
    return dateString;
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    if (dateString === 'Present') return 'Present';

    const [year, month] = dateString.split('-');
    const months = [
      'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
      'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
    ];

    if (month) {
      return `${months[parseInt(month) - 1]} ${year}`;
    }
    return year;
  };

  const toggleCurrentJob = (expId: string, isCurrent: boolean) => {
    if (isCurrent) {
      updateExperience(expId, 'endDate', 'Present');
    } else {
      updateExperience(expId, 'endDate', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Experiència Professional
        </h2>
        <p className="text-gray-600">
          Detalla la teva trajectòria professional per mostrar la teva experiència i expertise
        </p>
      </div>

      {/* Experience List */}
      <div className="space-y-6">
        {formData.experience.map((exp, index) => (
          <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Experiència #{index + 1}
                </h3>
              </div>
              <button
                onClick={() => removeExperience(exp.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Position and Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Càrrec / Posició *
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    placeholder="Ex: Tècnic en Transformació Digital"
                    className={`
                      w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400
                      ${errors[`experience_${index}_position`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all
                    `}
                  />
                  {errors[`experience_${index}_position`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_position`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organització / Empresa *
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Ex: Ajuntament de Barcelona"
                    className={`
                      w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400
                      ${errors[`experience_${index}_company`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all
                    `}
                  />
                  {errors[`experience_${index}_company`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_company`]}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció del Rol
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  placeholder="Descriu les teves responsabilitats, èxits i projectes destacats en aquest rol..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {exp.description.length}/500 caràcters
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data d'Inici
                  </label>
                  <input
                    type="month"
                    value={formatDateForInput(exp.startDate)}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Fi
                  </label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={formatDateForInput(exp.endDate)}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.endDate === 'Present'}
                      className={`
                        w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all
                        ${exp.endDate === 'Present' ? 'bg-gray-100 cursor-not-allowed' : ''}
                      `}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.endDate === 'Present'}
                        onChange={(e) => toggleCurrentJob(exp.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">Treball actual</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Duration Display */}
              {exp.startDate && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <strong>Durada:</strong> {formatDateDisplay(exp.startDate)} - {formatDateDisplay(exp.endDate) || 'Present'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Experience Button */}
        <button
          onClick={addExperience}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          Afegir Experiència Professional
        </button>
      </div>

      {/* Quick Add Suggestions */}
      {formData.experience.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            💼 Exemples de rols habituals en l'administració:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { position: 'Tècnic en Transformació Digital', company: 'Ajuntament' },
              { position: 'Analista de Processos', company: 'Diputació' },
              { position: 'Responsable de Projectes', company: 'Generalitat' },
              { position: 'Coordinador TIC', company: 'Administració Central' },
              { position: 'Tècnic d\'Administració', company: 'Consell Comarcal' },
              { position: 'Consultor Public Sector', company: 'Empresa Privada' }
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  addExperience();
                  // Wait for the experience to be added and then update it
                  setTimeout(() => {
                    const experiences = formData.experience;
                    const newExperience = experiences[experiences.length - 1];
                    if (newExperience) {
                      updateExperience(newExperience.id, 'position', suggestion.position);
                      updateExperience(newExperience.id, 'company', suggestion.company);
                    }
                  }, 100);
                }}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.position}</div>
                <div className="text-xs text-gray-600">{suggestion.company}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          🎯 Consells per descriure l'experiència:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Inclou responsabilitats clau i projectes destacats</li>
          <li>• Menciona resultats quantificables quan sigui possible</li>
          <li>• Utilitza paraules clau rellevants per al teu sector</li>
          <li>• Ordena l'experiència de la més recent a la més antiga</li>
          <li>• Sigues específic sobre les teves contribucions</li>
        </ul>
      </div>

      {/* Experience Summary */}
      {formData.experience.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            ✅ Resum de la teva experiència:
          </h4>
          <div className="space-y-2">
            {formData.experience.map((exp, index) => (
              <div key={exp.id} className="text-sm text-green-700">
                <strong>{index + 1}.</strong> {exp.position || 'Càrrec pendent'}
                {exp.company && ` a ${exp.company}`}
                {exp.startDate && ` (${formatDateDisplay(exp.startDate)} - ${formatDateDisplay(exp.endDate) || 'Present'})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};