'use client';

import { FileText, Calendar, MapPin, Briefcase, Globe } from 'lucide-react';
import { ProfileFormData } from '../../hooks/useProfileWizard';

interface Step2Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
}

export const Step2Personal = ({ formData, errors, updateField }: Step2Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informació Personal
        </h2>
        <p className="text-gray-600">
          Afegeix detalls sobre tu que ajudaran altres usuaris a conèixer-te millor
        </p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Descripció Personal *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Explica'ns sobre tu: la teva passió pel treball públic, experiència, interessos professionals, objectius... Aquesta descripció apareixerà a la secció 'Sobre mi' del teu perfil."
          rows={6}
          maxLength={1000}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.bio ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all resize-none
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.bio.length}/1000
          </p>
        </div>
      </div>

      {/* Birth Date and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Data de Naixement
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => updateField('birthDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-sm text-gray-500 mt-1">
            Opcional - només l'any serà visible públicament
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Ubicació *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="Ex: Barcelona, Catalunya"
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
            `}
          />
          {errors.location && (
            <p className="text-sm text-red-600 mt-1">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Current Job */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Treball Actual *
        </label>
        <input
          type="text"
          value={formData.currentJob}
          onChange={(e) => updateField('currentJob', e.target.value)}
          placeholder="Ex: Tècnic en Transformació Digital a Ajuntament de Barcelona"
          maxLength={200}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.currentJob ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        />
        {errors.currentJob && (
          <p className="text-sm text-red-600 mt-1">{errors.currentJob}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Inclou el teu càrrec i organització actual
        </p>
      </div>

      {/* Personal Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Lloc Web Personal
        </label>
        <input
          type="url"
          value={formData.personalWebsite}
          onChange={(e) => updateField('personalWebsite', e.target.value)}
          placeholder="https://el-meu-web.cat"
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.personalWebsite ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        />
        {errors.personalWebsite && (
          <p className="text-sm text-red-600 mt-1">{errors.personalWebsite}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Opcional - pot ser el teu blog, portfolio, LinkedIn, etc.
        </p>
      </div>

      {/* Example Bio Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          💡 Exemple de descripció personal:
        </h4>
        <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200 italic">
          "Funcionari públic apassionat per la innovació tecnològica i la modernització de l'administració.
          M'especialitzo en transformació digital i processos administratius eficients. Sempre buscant maneres
          de millorar l'experiència ciutadana a través de la tecnologia. Amb més de 10 anys d'experiència en
          el sector públic, he liderat projectes de digitalització que han impactat positivament a milers de ciutadans."
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          ✨ Consells per a una bona descripció:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Explica la teva passió pel treball en l'administració pública</li>
          <li>• Menciona les teves especialitats o àrees d'expertesa</li>
          <li>• Inclou els teus objectius professionals o personals</li>
          <li>• Parla del teu impacte o contribucions destacades</li>
          <li>• Mantingues un to professional però proper</li>
        </ul>
      </div>
    </div>
  );
};