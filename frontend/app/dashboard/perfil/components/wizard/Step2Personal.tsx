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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--Step2Personal-title-color, #111827)',
          marginBottom: '8px'
        }}>
          Informació Personal
        </h2>
        <p style={{ color: 'var(--Step2Personal-description-color, #4b5563)' }}>
          Afegeix detalls sobre tu que ajudaran altres usuaris a conèixer-te millor
        </p>
      </div>

      {/* Bio */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--Step2Personal-label-color, #374151)',
          marginBottom: '8px'
        }}>
          <FileText style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
          Descripció Personal *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          onBlur={() => handleBlur('bio')}
          placeholder="Explica'ns sobre tu: la teva passió pel treball públic, experiència, interessos professionals, objectius... Aquesta descripció apareixerà a la secció 'Sobre mi' del teu perfil."
          rows={6}
          maxLength={1000}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
            resize: 'none',
            color: 'var(--Step2Personal-input-text, #111827)',
            backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
            transition: 'all 0.2s'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <p style={{ fontSize: '14px', color: 'var(--Step2Personal-hint-color, #6b7280)' }}>
            {formData.bio.length}/1000
          </p>
        </div>
      </div>

      {/* Birth Date and Location */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <Calendar style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Data de Naixement
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            onBlur={() => handleBlur('birthDate')}
            max={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
          <p style={{ fontSize: '14px', color: 'var(--Step2Personal-hint-color, #6b7280)', marginTop: '4px' }}>
            Opcional - només l'any serà visible públicament
          </p>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <MapPin style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Ciutat
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            placeholder="Ex: Barcelona"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <MapPin style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Província
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            onBlur={() => handleBlur('province')}
            placeholder="Ex: Catalunya"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      {/* Current Job */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <Briefcase style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Organització
          </label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            onBlur={() => handleBlur('organization')}
            placeholder="Ex: Ajuntament de Barcelona"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <Briefcase style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Càrrec
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            placeholder="Ex: Tècnic en Transformació Digital"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            Departament
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            onBlur={() => handleBlur('department')}
            placeholder="Ex: Sistemes d'Informació"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            Anys al Sector Públic
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.yearsInPublicSector}
            onChange={(e) => handleChange('yearsInPublicSector', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('yearsInPublicSector')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <Globe style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Lloc Web Personal
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
            placeholder="https://el-meu-web.cat"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
          <p style={{ fontSize: '14px', color: 'var(--Step2Personal-hint-color, #6b7280)', marginTop: '4px' }}>
            Opcional - pot ser el teu blog, portfolio, LinkedIn, etc.
          </p>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step2Personal-label-color, #374151)',
            marginBottom: '8px'
          }}>
            <FileText style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Títol Professional
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            onBlur={() => handleBlur('headline')}
            placeholder="Ex: Expert en Transformació Digital Pública"
            maxLength={100}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--Step2Personal-input-border, #d1d5db)',
              color: 'var(--Step2Personal-input-text, #111827)',
              backgroundColor: 'var(--Step2Personal-input-bg, #ffffff)',
              transition: 'all 0.2s'
            }}
          />
          <p style={{ fontSize: '14px', color: 'var(--Step2Personal-hint-color, #6b7280)', marginTop: '4px' }}>
            Apareix com a subtítol al teu perfil
          </p>
        </div>
      </div>

      {/* Example Bio Section */}
      <div style={{
        backgroundColor: 'var(--Step2Personal-example-bg, #f9fafb)',
        border: '1px solid var(--Step2Personal-example-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--Step2Personal-example-title, #111827)',
          marginBottom: '12px'
        }}>
          Exemple de descripció personal:
        </h4>
        <div style={{
          fontSize: '14px',
          color: 'var(--Step2Personal-example-text, #374151)',
          backgroundColor: 'var(--Step2Personal-example-quote-bg, #ffffff)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--Step2Personal-example-quote-border, #e5e7eb)',
          fontStyle: 'italic'
        }}>
          "Funcionari públic apassionat per la innovació tecnològica i la modernització de l'administració.
          M'especialitzo en transformació digital i processos administratius eficients. Sempre buscant maneres
          de millorar l'experiència ciutadana a través de la tecnologia. Amb més de 10 anys d'experiència en
          el sector públic, he liderat projectes de digitalització que han impactat positivament a milers de ciutadans."
        </div>
      </div>

      {/* Tips */}
      <div style={{
        backgroundColor: 'var(--Step2Personal-tips-bg, #f0fdf4)',
        border: '1px solid var(--Step2Personal-tips-border, #bbf7d0)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--Step2Personal-tips-title, #166534)',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          Consells per a una bona descripció:
        </p>
        <ul style={{
          fontSize: '14px',
          color: 'var(--Step2Personal-tips-text, #15803d)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          margin: 0,
          paddingLeft: '0',
          listStyle: 'none'
        }}>
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