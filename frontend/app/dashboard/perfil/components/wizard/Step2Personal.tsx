'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, MapPin, Briefcase, Globe } from 'lucide-react';
import SensitiveCategoryAlert from './SensitiveCategoryAlert';

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  forceHidePosition: boolean
  forceHideDepartment: boolean
  forceHideBio: boolean
  forceHideLocation: boolean
  forceHidePhone: boolean
  forceHideEmail: boolean
  forceHideGroups: boolean
}

interface DetectionResult {
  category: SensitiveCategory | null
  matchedOn?: 'position' | 'department'
  matchedPattern?: string
}

interface Step2Props {
  data: {
    profile: {
      bio?: string;
      headline?: string;
      birthDate?: string;
      city?: string;
      province?: string;
      country?: string;
      organization?: string;
      department?: string;
      position?: string;
      yearsInPublicSector?: number;
      website?: string;
    };
    hasSystemRestrictions?: boolean;
  };
  updateProfile: (updates: Record<string, any>) => Promise<boolean>;
  isSaving: boolean;
}

export const Step2Personal = ({ data, updateProfile, isSaving }: Step2Props) => {
  const [formData, setFormData] = useState({
    bio: '',
    headline: '',
    birthDate: '',
    city: '',
    province: '',
    country: '',
    organization: '',
    department: '',
    position: '',
    yearsInPublicSector: 0,
    website: ''
  });

  // Estat per a la detecció de categoria sensible
  const [detectedCategory, setDetectedCategory] = useState<DetectionResult | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [categoryDismissed, setCategoryDismissed] = useState(false);
  const [hasExistingRestrictions, setHasExistingRestrictions] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    if (data.profile) {
      setFormData({
        bio: data.profile.bio || '',
        headline: data.profile.headline || '',
        birthDate: data.profile.birthDate || '',
        city: data.profile.city || '',
        province: data.profile.province || '',
        country: data.profile.country || '',
        organization: data.profile.organization || '',
        department: data.profile.department || '',
        position: data.profile.position || '',
        yearsInPublicSector: data.profile.yearsInPublicSector || 0,
        website: data.profile.website || ''
      });
    }
    // Si l'usuari ja té restriccions, no mostrar l'alerta
    if (data.hasSystemRestrictions) {
      setHasExistingRestrictions(true);
    }
  }, [data.profile, data.hasSystemRestrictions]);

  // Funció per detectar categoria sensible
  const detectSensitiveCategory = useCallback(async (position: string, department: string) => {
    // No detectar si ja té restriccions o ja ha descartat l'alerta
    if (hasExistingRestrictions || categoryDismissed) return;

    // Només detectar si hi ha algun valor
    if (!position && !department) {
      setDetectedCategory(null);
      return;
    }

    try {
      const response = await fetch('/api/user/privacy/detect-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, department }),
      });

      if (response.ok) {
        const result: DetectionResult = await response.json();
        if (result.category) {
          setDetectedCategory(result);
        } else {
          setDetectedCategory(null);
        }
      }
    } catch (error) {
      console.error('Error detecting sensitive category:', error);
    }
  }, [hasExistingRestrictions, categoryDismissed]);

  // Funció per acceptar la categoria
  const handleAcceptCategory = async () => {
    if (!detectedCategory?.category) return;

    setIsAssigning(true);
    try {
      const response = await fetch('/api/user/privacy/assign-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: detectedCategory.category.id }),
      });

      if (response.ok) {
        setHasExistingRestrictions(true);
        setDetectedCategory(null);
      }
    } catch (error) {
      console.error('Error assigning category:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Funció per declinar la categoria
  const handleDeclineCategory = () => {
    setCategoryDismissed(true);
    setDetectedCategory(null);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = async (field: string) => {
    await updateProfile({ [field]: formData[field as keyof typeof formData] });

    // Detectar categoria sensible quan es modifica posició o departament
    if (field === 'position' || field === 'department') {
      detectSensitiveCategory(
        field === 'position' ? formData.position : formData.position,
        field === 'department' ? formData.department : formData.department
      );
    }
  };

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
          onChange={(e) => handleChange('bio', e.target.value)}
          onBlur={() => handleBlur('bio')}
          placeholder="Explica'ns sobre tu: la teva passió pel treball públic, experiència, interessos professionals, objectius... Aquesta descripció apareixerà a la secció 'Sobre mi' del teu perfil."
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
        <div className="flex justify-between mt-1">
          <div></div>
          <p className="text-sm text-gray-500">
            {formData.bio.length}/1000
          </p>
        </div>
      </div>

      {/* Birth Date and Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Data de Naixement
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            onBlur={() => handleBlur('birthDate')}
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
            Ciutat
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            placeholder="Ex: Barcelona"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Província
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            onBlur={() => handleBlur('province')}
            placeholder="Ex: Catalunya"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Current Job */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Organització
          </label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            onBlur={() => handleBlur('organization')}
            placeholder="Ex: Ajuntament de Barcelona"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Càrrec
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            placeholder="Ex: Tècnic en Transformació Digital"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departament
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            onBlur={() => handleBlur('department')}
            placeholder="Ex: Sistemes d'Informació"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anys al Sector Públic
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.yearsInPublicSector}
            onChange={(e) => handleChange('yearsInPublicSector', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('yearsInPublicSector')}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Sensitive Category Alert */}
      {detectedCategory?.category && detectedCategory.matchedOn && detectedCategory.matchedPattern && (
        <SensitiveCategoryAlert
          category={detectedCategory.category}
          matchedOn={detectedCategory.matchedOn}
          matchedPattern={detectedCategory.matchedPattern}
          onAccept={handleAcceptCategory}
          onDecline={handleDeclineCategory}
          isLoading={isAssigning}
        />
      )}

      {/* Personal Website + Headline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Lloc Web Personal
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
            placeholder="https://el-meu-web.cat"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-sm text-gray-500 mt-1">
            Opcional - pot ser el teu blog, portfolio, LinkedIn, etc.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Títol Professional
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            onBlur={() => handleBlur('headline')}
            placeholder="Ex: Expert en Transformació Digital Pública"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-sm text-gray-500 mt-1">
            Apareix com a subtítol al teu perfil
          </p>
        </div>
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