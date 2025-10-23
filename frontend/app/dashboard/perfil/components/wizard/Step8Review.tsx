'use client';

import { useState } from 'react';
import { CheckCircle, Eye, Save, User, MapPin, Briefcase, GraduationCap, Target, Globe, Lightbulb, Calendar, Twitter, Linkedin, Instagram, Star } from 'lucide-react';
import { ProfileFormData } from '../../hooks/useProfileWizard';

interface Step8Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  onSave: () => void;
  isSaving?: boolean;
}

export const Step8Review = ({ formData, errors, onSave, isSaving = false }: Step8Props) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString: string) => {
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

  const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
      'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
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

  const getCompletionStats = () => {
    const sections = [
      { name: 'Informació Bàsica', completed: !!(formData.fullName && formData.username) },
      { name: 'Informació Personal', completed: !!(formData.bio && formData.location && formData.currentJob) },
      { name: 'Xarxes Socials', completed: !!(formData.socialNetworks.twitter || formData.socialNetworks.linkedin || formData.socialNetworks.instagram) },
      { name: 'Formació', completed: formData.education.length > 0 },
      { name: 'Experiència', completed: formData.experience.length > 0 },
      { name: 'Habilitats', completed: formData.skills.length > 0 },
      { name: 'Idiomes', completed: formData.languages.length > 0 }
    ];

    const completedSections = sections.filter(section => section.completed).length;
    const totalSections = sections.length;
    const percentage = Math.round((completedSections / totalSections) * 100);

    return { sections, completedSections, totalSections, percentage };
  };

  const { sections, completedSections, totalSections, percentage } = getCompletionStats();

  if (showPreview) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vista Prèvia del Perfil
            </h2>
            <p className="text-gray-600">
              Així és com altres usuaris veuran el teu perfil a La Pública
            </p>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tornar a Revisió
          </button>
        </div>

        {/* Profile Preview */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {formData.coverImageUrl && (
              <img src={formData.coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Profile Content */}
          <div className="px-8 py-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-6 -mt-16">
              <div className="relative">
                {formData.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl}
                    alt="Perfil"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 mt-16">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{formData.fullName || 'Nom complet'}</h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {formData.profileType || 'Local'}
                  </span>
                </div>
                <p className="text-xl text-gray-600 mb-2">@{formData.username || 'usuari'}</p>
                <p className="text-lg text-gray-700">{formData.currentJob || 'Treball actual'}</p>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {formData.location || 'Ubicació'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre des de {formatRegistrationDate(formData.registrationDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {formData.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre mi</h3>
                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
              </div>
            )}

            {/* Social Networks */}
            {(formData.socialNetworks.twitter || formData.socialNetworks.linkedin || formData.socialNetworks.instagram) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Xarxes Socials</h3>
                <div className="flex flex-wrap gap-3">
                  {formData.socialNetworks.twitter && (
                    <a href={`https://twitter.com/${formData.socialNetworks.twitter}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      <Twitter className="w-4 h-4" />
                      @{formData.socialNetworks.twitter}
                    </a>
                  )}
                  {formData.socialNetworks.linkedin && (
                    <a href={formData.socialNetworks.linkedin.startsWith('http') ? formData.socialNetworks.linkedin : `https://linkedin.com/in/${formData.socialNetworks.linkedin}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {formData.socialNetworks.instagram && (
                    <a href={`https://instagram.com/${formData.socialNetworks.instagram}`} className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg">
                      <Instagram className="w-4 h-4" />
                      @{formData.socialNetworks.instagram}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Skills and Interests */}
            {(formData.skills.length > 0 || formData.interests.length > 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilitats i Interessos</h3>
                <div className="space-y-3">
                  {formData.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Habilitats</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Interessos</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {formData.experience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Experiència Professional</h3>
                <div className="space-y-4">
                  {formData.experience.slice(0, 3).map((exp, index) => (
                    <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                      <p className="text-blue-600">{exp.company}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate) || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                  {formData.experience.length > 3 && (
                    <p className="text-sm text-gray-500">I {formData.experience.length - 3} experiències més...</p>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {formData.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Formació</h3>
                <div className="space-y-3">
                  {formData.education.slice(0, 3).map((edu, index) => (
                    <div key={edu.id}>
                      <h4 className="font-semibold text-gray-900">{edu.title}</h4>
                      <p className="text-blue-600">{edu.institution}</p>
                      {edu.specialization && (
                        <p className="text-gray-600">{edu.specialization}</p>
                      )}
                      {(edu.startYear || edu.endYear) && (
                        <p className="text-sm text-gray-500">
                          {edu.startYear} - {edu.endYear}
                        </p>
                      )}
                    </div>
                  ))}
                  {formData.education.length > 3 && (
                    <p className="text-sm text-gray-500">I {formData.education.length - 3} formacions més...</p>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            {formData.languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Idiomes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.languages.map((lang, index) => (
                    <div key={lang.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{lang.name}</span>
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisió Final
        </h2>
        <p className="text-gray-600">
          Revisa la informació del teu perfil abans de desar els canvis
        </p>
      </div>

      {/* Completion Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Completesa del Perfil</h3>
          <div className="flex items-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
              percentage >= 80 ? 'bg-green-100 text-green-800' :
              percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {percentage}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{section.name}</span>
              <div className="flex items-center gap-2">
                {section.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={`text-sm ${section.completed ? 'text-green-600' : 'text-gray-500'}`}>
                  {section.completed ? 'Completat' : 'Pendent'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>{completedSections} de {totalSections}</strong> seccions completades.
            {percentage < 80 && ' Considera completar més seccions per tenir un perfil més atractiu.'}
          </p>
        </div>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informació Bàsica
          </h3>
          <div className="space-y-2 text-sm">
            <div><strong>Nom:</strong> {formData.fullName || 'No especificat'}</div>
            <div><strong>Usuari:</strong> @{formData.username || 'No especificat'}</div>
            <div><strong>Tipus:</strong> {formData.profileType || 'No especificat'}</div>
            <div><strong>Ubicació:</strong> {formData.location || 'No especificat'}</div>
            <div><strong>Treball:</strong> {formData.currentJob || 'No especificat'}</div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Contingut
          </h3>
          <div className="space-y-2 text-sm">
            <div><strong>Formació:</strong> {formData.education.length} elements</div>
            <div><strong>Experiència:</strong> {formData.experience.length} elements</div>
            <div><strong>Habilitats:</strong> {formData.skills.length} elements</div>
            <div><strong>Interessos:</strong> {formData.interests.length} elements</div>
            <div><strong>Idiomes:</strong> {formData.languages.length} elements</div>
            <div><strong>Bio:</strong> {formData.bio.length}/1000 caràcters</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-5 h-5" />
          Vista Prèvia del Perfil
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Desant...' : 'Desar Perfil'}
        </button>
      </div>

      {/* Final Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          🎉 Felicitats! Estàs a punt de completar el teu perfil
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Un perfil complet té més visibilitat a la plataforma</li>
          <li>• Podràs editar qualsevol informació més tard</li>
          <li>• La teva informació ajudarà a trobar oportunitats de col·laboració</li>
          <li>• Recorda mantenir el teu perfil actualitzat</li>
        </ul>
      </div>
    </div>
  );
};