'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Twitter, Linkedin, Instagram, Plus, X, GraduationCap, Briefcase, Target, Globe, Lightbulb, Star, Save, Eye } from 'lucide-react';
import { SkillInput } from '../SkillInput';

interface Education {
  id: string;
  title: string;
  institution: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface AboutData {
  bio: string;
  birthDate: string;
  location: string;
  workplace: string;
  position: string;
  website: string;
  socialNetworks: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

interface Language {
  name: string;
  level: string;
}

interface AboutTabProps {
  aboutData: AboutData;
  education: Education[];
  experience: Experience[];
  skills: string[];
  interests: string[];
  languages: Language[];
  onProfileUpdate?: (data: any) => void;
  userProfile?: {
    fullName: string;
    username: string;
    administration: string;
    registrationDate: string;
  };
}

export default function AboutTab({
  aboutData,
  education,
  experience,
  skills,
  interests,
  languages,
  onProfileUpdate,
  userProfile
}: AboutTabProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1 - Basic
    fullName: userProfile?.fullName || '',
    username: userProfile?.username || '',
    profileType: userProfile?.administration || 'Local',

    // Step 2 - Personal
    bio: aboutData.bio || '',
    birthDate: aboutData.birthDate || '',
    location: aboutData.location || '',
    currentJob: aboutData.position && aboutData.workplace ? `${aboutData.position} a ${aboutData.workplace}` : '',
    personalWebsite: aboutData.website || '',

    // Step 3 - Social
    socialNetworks: {
      twitter: aboutData.socialNetworks?.twitter || '',
      linkedin: aboutData.socialNetworks?.linkedin || '',
      instagram: aboutData.socialNetworks?.instagram || ''
    },

    // Step 4 - Education
    education: education || [],

    // Step 5 - Experience
    experience: experience || [],

    // Step 6 - Skills
    skills: skills || [],
    interests: interests || [],

    // Step 7 - Languages
    languages: languages?.map(lang => ({
      id: Math.random().toString(36).substr(2, 9),
      name: lang.name,
      proficiency: lang.level
    })) || []
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialNetwork = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialNetworks: {
        ...prev.socialNetworks,
        [platform]: value
      }
    }));
  };

  // Education functions
  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      title: '',
      institution: '',
      startYear: '',
      endYear: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Experience functions
  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Skills and interests functions
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  // Language functions
  const addLanguage = () => {
    const newLanguage = {
      id: Date.now().toString(),
      name: '',
      proficiency: ''
    };
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  // Save function
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Transform data to match expected structure
      const transformedData = {
        aboutData: {
          bio: formData.bio,
          birthDate: formData.birthDate,
          location: formData.location,
          workplace: formData.currentJob.split(' a ')[1] || formData.currentJob,
          position: formData.currentJob.split(' a ')[0] || formData.currentJob,
          website: formData.personalWebsite,
          socialNetworks: formData.socialNetworks
        },
        education: formData.education,
        experience: formData.experience,
        skills: formData.skills,
        interests: formData.interests,
        languages: formData.languages.map((lang: any) => ({
          name: lang.name,
          level: lang.proficiency
        }))
      };

      if (onProfileUpdate) {
        await onProfileUpdate(transformedData);
      }

      // Show success message
      setSaveMessage({
        type: 'success',
        text: 'Perfil guardat correctament! Els canvis s\'han aplicat.'
      });

      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);

    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({
        type: 'error',
        text: 'Error al guardar el perfil. Si us plau, intenta-ho de nou.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, title: 'Imatges i Bàsic', description: 'Fotos i informació principal' },
    { id: 2, title: 'Informació Personal', description: 'Bio, ubicació i detalls personals' },
    { id: 3, title: 'Xarxes Socials', description: 'Perfils de Twitter, LinkedIn i Instagram' },
    { id: 4, title: 'Formació', description: 'Estudis i certificacions acadèmiques' },
    { id: 5, title: 'Experiència', description: 'Trajectòria professional' },
    { id: 6, title: 'Habilitats', description: 'Competències i interessos' },
    { id: 7, title: 'Idiomes', description: 'Llengües i nivells de competència' },
    { id: 8, title: 'Revisió', description: 'Revisió final i guardar' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const ProgressIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.id
                ? 'bg-white text-blue-600'
                : 'bg-blue-400 text-white'
            }`}
          >
            {step.id}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-12 mx-2 ${
                currentStep > step.id ? 'bg-white' : 'bg-blue-400'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Imatges i Informació Bàsica</h3>
            <p>Configura les teves imatges de perfil i la informació principal.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Jordi García Martínez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'Usuari
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jordi_funcionari"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Informació Personal</h3>
            <p>Afegeix detalls sobre tu que ajudaran altres usuaris a conèixer-te millor.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció Personal
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Explica'ns sobre tu: la teva passió pel treball públic, experiència, interessos professionals, objectius..."
              />
              <div className="flex justify-between mt-1">
                <div></div>
                <p className="text-sm text-gray-500">
                  {formData.bio.length}/1000
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Xarxes Socials</h3>
            <p>Connecta les teves xarxes socials per facilitar que altres usuaris et trobin i contactin.</p>

            <div className="space-y-6">
              {/* Twitter */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Twitter / X</h4>
                    <p className="text-sm text-gray-600">Connecta el teu compte de Twitter</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                  <input
                    type="text"
                    value={formData.socialNetworks.twitter}
                    onChange={(e) => updateSocialNetwork('twitter', e.target.value.replace('@', ''))}
                    placeholder="jordi_garcia"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {formData.socialNetworks.twitter && (
                  <p className="text-sm text-blue-600 mt-1">
                    📱 Perfil: https://twitter.com/{formData.socialNetworks.twitter}
                  </p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">LinkedIn</h4>
                    <p className="text-sm text-gray-600">Connecta el teu perfil professional</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.socialNetworks.linkedin}
                  onChange={(e) => updateSocialNetwork('linkedin', e.target.value)}
                  placeholder="jordi-garcia-martinez o https://linkedin.com/in/jordi-garcia-martinez"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.socialNetworks.linkedin && (
                  <p className="text-sm text-blue-600 mt-1">
                    💼 Perfil: {formData.socialNetworks.linkedin.startsWith('http')
                      ? formData.socialNetworks.linkedin
                      : `https://linkedin.com/in/${formData.socialNetworks.linkedin}`}
                  </p>
                )}
              </div>

              {/* Instagram */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Instagram</h4>
                    <p className="text-sm text-gray-600">Connecta el teu compte d'Instagram</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                  <input
                    type="text"
                    value={formData.socialNetworks.instagram}
                    onChange={(e) => updateSocialNetwork('instagram', e.target.value.replace('@', ''))}
                    placeholder="jordigarcia_public"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {formData.socialNetworks.instagram && (
                  <p className="text-sm text-pink-600 mt-1">
                    📸 Perfil: https://instagram.com/{formData.socialNetworks.instagram}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Formació Acadèmica</h3>
            <p>Afegeix els teus estudis, títols i certificacions per mostrar la teva preparació professional.</p>

            <div className="space-y-6">
              {formData.education.map((edu, index) => (
                <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Estudi #{index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Títol / Nom de l'Estudi *
                      </label>
                      <input
                        type="text"
                        value={edu.title}
                        onChange={(e) => updateEducation(edu.id, 'title', e.target.value)}
                        placeholder="Ex: Màster en Administració i Direcció d'Empreses (MBA)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institució / Universitat *
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="Ex: Universitat Pompeu Fabra"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any d'Inici - Any de Fi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={edu.startYear}
                          onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                          placeholder="2020"
                          min="1960"
                          max="2030"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={edu.endYear}
                          onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                          placeholder="2022"
                          min="1960"
                          max="2030"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-5 h-5" />
                Afegir Formació Acadèmica
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Experiència Professional</h3>
            <p>Detalla la teva trajectòria professional per mostrar la teva experiència i expertise.</p>

            <div className="space-y-6">
              {formData.experience.map((exp, index) => (
                <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Experiència #{index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
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
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">{exp.description.length}/500 caràcters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data d'Inici</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fi</label>
                        <div className="space-y-2">
                          <input
                            type="month"
                            value={exp.endDate === 'Present' ? '' : exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.endDate === 'Present'}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exp.endDate === 'Present'}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.checked ? 'Present' : '')}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">Treball actual</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addExperience}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-5 h-5" />
                Afegir Experiència Professional
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Habilitats i Interessos</h3>
            <p>Defineix les teves competències tècniques i àrees d'interès per connectar amb projectes i persones afins.</p>

            <div className="space-y-6">
              {/* Skills */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Habilitats Tècniques</h4>
                    <p className="text-sm text-gray-600">Competències, tecnologies i expertesa professional</p>
                  </div>
                </div>

                <SkillInput
                  skills={formData.skills}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                  placeholder="Ex: Transformació Digital, React, Gestió de Projectes..."
                  color="blue"
                />
              </div>

              {/* Interests */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Interessos Professionals</h4>
                    <p className="text-sm text-gray-600">Àrees que t'interessen o en les que vols desenvolupar-te</p>
                  </div>
                </div>

                <SkillInput
                  skills={formData.interests}
                  onAddSkill={addInterest}
                  onRemoveSkill={removeInterest}
                  placeholder="Ex: Innovació Pública, Smart Cities, Sostenibilitat..."
                  color="green"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Idiomes</h3>
            <p>Indica els idiomes que coneixes i el teu nivell de competència per facilitar la col·laboració internacional.</p>

            <div className="space-y-6">
              {formData.languages.map((lang, index) => (
                <div key={lang.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Idioma #{index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeLanguage(lang.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Idioma *</label>
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                        placeholder="Ex: Anglès"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nivell de Competència *</label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona el nivell</option>
                        <option value="Bàsic">Bàsic (A1-A2)</option>
                        <option value="Intermig">Intermig (B1-B2)</option>
                        <option value="Avançat">Avançat (C1-C2)</option>
                        <option value="Natiu">Natiu</option>
                      </select>
                    </div>
                  </div>

                  {lang.proficiency && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{lang.proficiency}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (['Bàsic', 'Intermig', 'Avançat', 'Natiu'].indexOf(lang.proficiency) + 2)
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

              <button
                onClick={addLanguage}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-5 h-5" />
                Afegir Idioma
              </button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Revisió Final</h3>
            <p>Revisa la informació del teu perfil abans de desar els canvis.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resum del Perfil</h4>
                <div className="space-y-3 text-sm">
                  <div><strong>Nom:</strong> {formData.fullName || 'No especificat'}</div>
                  <div><strong>Usuari:</strong> @{formData.username || 'No especificat'}</div>
                  <div><strong>Bio:</strong> {formData.bio.length > 0 ? `${formData.bio.substring(0, 100)}...` : 'No especificat'}</div>
                  <div><strong>Ubicació:</strong> {formData.location || 'No especificat'}</div>
                  <div><strong>Treball:</strong> {formData.currentJob || 'No especificat'}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contingut</h4>
                <div className="space-y-3 text-sm">
                  <div><strong>Formació:</strong> {formData.education.length} elements</div>
                  <div><strong>Experiència:</strong> {formData.experience.length} elements</div>
                  <div><strong>Habilitats:</strong> {formData.skills.length} elements</div>
                  <div><strong>Interessos:</strong> {formData.interests.length} elements</div>
                  <div><strong>Idiomes:</strong> {formData.languages.length} elements</div>
                  <div><strong>Xarxes socials:</strong> {Object.values(formData.socialNetworks).filter(v => v).length} connectades</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                🎉 Perfil llest per desar!
              </p>
              <p className="text-sm text-green-700">
                Un cop desat, la informació apareixerà al teu perfil públic i podràs editar-la en qualsevol moment.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Pas {currentStep}</h3>
            <p>Contingut del pas {currentStep} - {steps[currentStep - 1]?.description}</p>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">Contingut del pas {currentStep} aquí</p>
            </div>
          </div>
        );
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Configurar Perfil</h1>
          <div className="text-sm">
            Pas {currentStep} de {steps.length}
          </div>
        </div>

        <ProgressIndicator />
      </div>

      {/* Content */}
      <div className="p-8">
        {renderCurrentStep()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            {!isLastStep && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Següent
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isLastStep && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardant...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Perfil
                  </>
                )}
              </button>
            )}
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {saveMessage.type === 'success' ? '✅' : '❌'} {saveMessage.text}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            Completat: {Math.round((currentStep / steps.length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}