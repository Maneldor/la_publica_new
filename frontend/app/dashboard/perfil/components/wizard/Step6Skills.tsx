'use client';

import { useState } from 'react';
import { Target, Plus, X, Lightbulb, Star } from 'lucide-react';
import { ProfileFormData } from '../../hooks/useProfileWizard';

interface Step6Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
}

export const Step6Skills = ({ formData, errors, updateField }: Step6Props) => {
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const commonSkills = [
    'Transformació Digital', 'Gestió de Projectes', 'React', 'TypeScript', 'JavaScript',
    'Administració Pública', 'Gestió d\'Equips', 'Comunicació', 'Lideratge',
    'Analítica de Dades', 'PowerBI', 'Excel Avançat', 'Python', 'SQL',
    'Pressupostos Públics', 'Contractació Pública', 'Procediment Administratiu',
    'Atenció Ciutadana', 'Gestió Documental', 'RGPD', 'Ciberseguretat',
    'Innovació', 'Design Thinking', 'Scrum', 'Agile'
  ];

  const commonInterests = [
    'Innovació Pública', 'Smart Cities', 'Sostenibilitat', 'Participació Ciutadana',
    'Govern Obert', 'Transparència', 'Eficiència Energètica', 'Mobilitat Sostenible',
    'Economia Circular', 'Digitalització', 'Inteligència Artificial',
    'Blockchain', 'IoT', 'Big Data', 'Ciberseguretat',
    'Formació Contínua', 'Networking Professional', 'Mentoring',
    'Emprenedoria Social', 'Cooperació Internacional', 'Desenvolupament Local'
  ];

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      updateField('skills', [...formData.skills, skill.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateField('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      updateField('interests', [...formData.interests, interest.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    updateField('interests', formData.interests.filter(interest => interest !== interestToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest(interestInput);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--Step6Skills-title-color, #111827)',
          marginBottom: '8px'
        }}>
          Habilitats i Interessos
        </h2>
        <p style={{ color: 'var(--Step6Skills-description-color, #4b5563)' }}>
          Defineix les teves competències tècniques i àrees d'interès per connectar amb projectes i persones afins
        </p>
      </div>

      {/* Skills Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Habilitats Tècniques</h3>
            <p className="text-sm text-gray-600">Competències, tecnologies i expertesa professional</p>
          </div>
        </div>

        {/* Skills Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Afegir Habilitat
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              placeholder="Ex: Transformació Digital, React, Gestió de Projectes..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={() => addSkill(skillInput)}
              disabled={!skillInput.trim()}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Prem Enter o fes clic en + per afegir
          </p>
        </div>

        {/* Current Skills */}
        {formData.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Les teves habilitats ({formData.skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary-dark text-sm rounded-full"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Skills Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💡 Suggeriments populars:
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonSkills
              .filter(skill => !formData.skills.includes(skill))
              .slice(0, 12)
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interessos Professionals</h3>
            <p className="text-sm text-gray-600">Àrees que t'interessen o en les que vols desenvolupar-te</p>
          </div>
        </div>

        {/* Interests Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Afegir Interès
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={handleInterestKeyPress}
              placeholder="Ex: Innovació Pública, Smart Cities, Sostenibilitat..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-success focus:border-transparent transition-all"
            />
            <button
              onClick={() => addInterest(interestInput)}
              disabled={!interestInput.trim()}
              className="px-4 py-3 bg-success text-white rounded-lg hover:bg-success-dark disabled:bg-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Prem Enter o fes clic en + per afegir
          </p>
        </div>

        {/* Current Interests */}
        {formData.interests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Els teus interessos ({formData.interests.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success-dark text-sm rounded-full"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:bg-success/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Interests Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            🌟 Suggeriments populars:
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonInterests
              .filter(interest => !formData.interests.includes(interest))
              .slice(0, 12)
              .map((interest) => (
                <button
                  key={interest}
                  onClick={() => addInterest(interest)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-success/10 hover:text-success transition-colors"
                >
                  + {interest}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-4">
        <p className="text-sm text-info-dark font-medium mb-2">
          🎯 Consells per completar aquesta secció:
        </p>
        <ul className="text-sm text-info space-y-1">
          <li>• Afegeix habilitats específiques i mesurables</li>
          <li>• Inclou tant competències tècniques com transversals</li>
          <li>• Els interessos ajuden a trobar oportunitats de col·laboració</li>
          <li>• Pots afegir entre 5-15 elements per secció</li>
          <li>• Utilitza termes que altres professionals puguin buscar</li>
        </ul>
      </div>

      {/* Summary */}
      {(formData.skills.length > 0 || formData.interests.length > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            📊 Resum del teu perfil professional:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.skills.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-primary-dark mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Habilitats ({formData.skills.length})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {formData.skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary-dark text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {formData.skills.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{formData.skills.length - 5} més
                    </span>
                  )}
                </div>
              </div>
            )}

            {formData.interests.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-success-dark mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Interessos ({formData.interests.length})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {formData.interests.slice(0, 5).map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-success/10 text-success-dark text-xs rounded">
                      {interest}
                    </span>
                  ))}
                  {formData.interests.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{formData.interests.length - 5} més
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};