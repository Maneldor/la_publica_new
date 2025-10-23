'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Hash, Users, Clock, Globe } from 'lucide-react';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

interface ForumFormData {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  tags: string[];
  isAnonymous: boolean;
}

export default function CrearForumPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<ForumFormData>({
    title: '',
    description: '',
    category: '',
    visibility: 'public',
    tags: [],
    isAnonymous: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Transformació Digital',
    'Innovació Pública',
    'Gestió de Projectes',
    'Recursos Humans',
    'Pressupostos i Finances',
    'Sostenibilitat',
    'Participació Ciutadana',
    'Transparència',
    'Formació i Desenvolupament',
    'Cooperació Institucional',
    'Altres'
  ];

  const statsData = [
    { label: 'Fòrums Actius', value: '1,234', trend: '+12%' },
    { label: 'Participants', value: '8,567', trend: '+8%' },
    { label: 'Discussions', value: '15,678', trend: '+15%' },
    { label: 'Avui', value: '234', trend: '+25%' }
  ];

  const updateField = (field: keyof ForumFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim()) && formData.tags.length < 5) {
      updateField('tags', [...formData.tags, tag.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El títol és obligatori';
    } else if (formData.title.length < 10) {
      newErrors.title = 'El títol ha de tenir mínim 10 caràcters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripció és obligatòria';
    } else if (formData.description.length < 50) {
      newErrors.description = 'La descripció ha de tenir mínim 50 caràcters';
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirigir al fórum creado (simulado)
      router.push('/dashboard/forums');

    } catch (error) {
      console.error('Error creando fórum:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PageTemplate
      title="Crear Nou Fòrum"
      subtitle="Inicia una nova discussió professional"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6c757d',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            <ArrowLeft size={16} />
            Tornar als Fòrums
          </button>

          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 8px 0'
          }}>
            Crear Nou Fòrum de Discussió
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6c757d',
            margin: 0
          }}>
            Comparteix idees, fes preguntes i col·labora amb altres professionals del sector públic
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
        }}>

          {/* Título */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Títol del Fòrum *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: Implementació de sistemes de participació ciutadana digital"
              maxLength={120}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.title ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#fff',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.title) e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.title) e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px'
            }}>
              {errors.title && (
                <span style={{ fontSize: '12px', color: '#ef4444' }}>
                  {errors.title}
                </span>
              )}
              <span style={{
                fontSize: '12px',
                color: '#6c757d',
                marginLeft: 'auto'
              }}>
                {formData.title.length}/120
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Descripció i Context *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descriu el tema de discussió, el context i els objectius del fòrum. Inclou preguntes específiques o punts de debat que vols abordar..."
              rows={6}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.description ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff',
                resize: 'vertical',
                minHeight: '120px',
                transition: 'border-color 0.2s',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                if (!errors.description) e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.description) e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px'
            }}>
              {errors.description && (
                <span style={{ fontSize: '12px', color: '#ef4444' }}>
                  {errors.description}
                </span>
              )}
              <span style={{
                fontSize: '12px',
                color: '#6c757d',
                marginLeft: 'auto'
              }}>
                {formData.description.length}/1000
              </span>
            </div>
          </div>

          {/* Categoría */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.category ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">Selecciona una categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errors.category}
              </span>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Etiquetes (màxim 5)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Ex: digitalització, innovació, participació..."
                disabled={formData.tags.length >= 5}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: formData.tags.length >= 5 ? '#f8f9fa' : '#fff',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
                style={{
                  padding: '10px 16px',
                  backgroundColor: !tagInput.trim() || formData.tags.length >= 5 ? '#e5e7eb' : '#3b82f6',
                  color: !tagInput.trim() || formData.tags.length >= 5 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: !tagInput.trim() || formData.tags.length >= 5 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Hash size={16} />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1e40af',
                        cursor: 'pointer',
                        padding: '0',
                        marginLeft: '4px',
                        fontSize: '14px',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibilidad */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Visibilitat
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px 16px',
                border: `2px solid ${formData.visibility === 'public' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: formData.visibility === 'public' ? '#eff6ff' : '#fff',
                transition: 'all 0.2s',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => updateField('visibility', e.target.value)}
                  style={{ margin: 0 }}
                />
                <Globe size={18} color={formData.visibility === 'public' ? '#3b82f6' : '#6c757d'} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Públic</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Tots poden veure i participar</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px 16px',
                border: `2px solid ${formData.visibility === 'private' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: formData.visibility === 'private' ? '#eff6ff' : '#fff',
                transition: 'all 0.2s',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => updateField('visibility', e.target.value)}
                  style={{ margin: 0 }}
                />
                <Users size={18} color={formData.visibility === 'private' ? '#3b82f6' : '#6c757d'} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Privat</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Només membres convidats</div>
                </div>
              </label>
            </div>
          </div>

          {/* Anónimo */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => updateField('isAnonymous', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6'
                }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  Permetre participació anònima
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  Els participants podran comentar de forma anònima per fomentar la participació oberta
                </div>
              </div>
            </label>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#6c757d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Cancel·lar
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '12px 24px',
                backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSaving ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creant Fòrum...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Crear Fòrum
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </PageTemplate>
  );
}