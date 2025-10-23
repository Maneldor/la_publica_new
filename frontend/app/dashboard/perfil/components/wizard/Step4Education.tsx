'use client';

import { GraduationCap, Plus, X } from 'lucide-react';
import { ProfileFormData, Education } from '../../hooks/useProfileWizard';

interface Step4Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  removeEducation: (id: string) => void;
}

export const Step4Education = ({
  formData,
  errors,
  updateField,
  addEducation,
  updateEducation,
  removeEducation
}: Step4Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 5 }, (_, i) => currentYear + 4 - i);

  const commonDegrees = [
    'Grau en Administració i Direcció d\'Empreses',
    'Grau en Dret',
    'Grau en Economia',
    'Grau en Ciències Polítiques',
    'Grau en Enginyeria Informàtica',
    'Grau en Psicologia',
    'Màster en Administració Pública',
    'Màster en Transformació Digital',
    'Màster en Gestió Pública',
    'Postgrau en Innovació Pública',
    'Doctorat (PhD)',
    'Formació Professional (FP)',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Formació Acadèmica
        </h2>
        <p className="text-gray-600">
          Afegeix els teus estudis, títols i certificacions per mostrar la teva preparació professional
        </p>
      </div>

      {/* Education List */}
      <div className="space-y-6">
        {formData.education.map((edu, index) => (
          <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Estudi #{index + 1}
                </h3>
              </div>
              <button
                onClick={() => removeEducation(edu.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Títol / Nom de l'Estudi *
                </label>
                <input
                  type="text"
                  value={edu.title}
                  onChange={(e) => updateEducation(edu.id, 'title', e.target.value)}
                  placeholder="Ex: Màster en Administració i Direcció d'Empreses (MBA)"
                  list={`degrees-${edu.id}`}
                  className={`
                    w-full px-4 py-3 rounded-lg border
                    ${errors[`education_${index}_title`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  `}
                />
                <datalist id={`degrees-${edu.id}`}>
                  {commonDegrees.map((degree) => (
                    <option key={degree} value={degree} />
                  ))}
                </datalist>
                {errors[`education_${index}_title`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`education_${index}_title`]}</p>
                )}
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institució / Universitat *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder="Ex: Universitat Pompeu Fabra"
                  className={`
                    w-full px-4 py-3 rounded-lg border
                    ${errors[`education_${index}_institution`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  `}
                />
                {errors[`education_${index}_institution`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`education_${index}_institution`]}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialització / Descripció
                </label>
                <input
                  type="text"
                  value={edu.specialization}
                  onChange={(e) => updateEducation(edu.id, 'specialization', e.target.value)}
                  placeholder="Ex: Especialització en Gestió Pública"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any d'Inici
                </label>
                <select
                  value={edu.startYear}
                  onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona l'any</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any de Fi
                </label>
                <select
                  value={edu.endYear}
                  onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona l'any</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors[`education_${index}_years`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`education_${index}_years`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Education Button */}
        <button
          onClick={addEducation}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          Afegir Formació Acadèmica
        </button>
      </div>

      {/* Quick Add Suggestions */}
      {formData.education.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            🎓 Exemples de formació habitual en l'administració pública:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Grau en Administració i Direcció d\'Empreses',
              'Grau en Dret',
              'Màster en Administració Pública',
              'Màster en Transformació Digital',
              'Postgrau en Innovació Pública',
              'Grau en Ciències Polítiques'
            ].map((degree) => (
              <button
                key={degree}
                onClick={() => {
                  addEducation();
                  // Wait for the education to be added and then update it
                  setTimeout(() => {
                    const newEducation = formData.education[formData.education.length];
                    if (newEducation) {
                      updateEducation(newEducation.id, 'title', degree);
                    }
                  }, 100);
                }}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                {degree}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📚 Consells per afegir la formació:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Inclou títols oficials, postgraus, màsters i certificacions rellevants</li>
          <li>• Especifica l'especialització si és aplicable</li>
          <li>• Afegeix la formació més recent primer</li>
          <li>• No oblidis certificacions professional o cursos importants</li>
          <li>• Pots deixar l'any de fi en blanc si encara estàs estudiant</li>
        </ul>
      </div>

      {/* Education Summary */}
      {formData.education.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            ✅ Resum de la teva formació:
          </h4>
          <div className="space-y-2">
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="text-sm text-green-700">
                <strong>{index + 1}.</strong> {edu.title || 'Títol pendent'}
                {edu.institution && ` - ${edu.institution}`}
                {edu.startYear && edu.endYear && ` (${edu.startYear}-${edu.endYear})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};