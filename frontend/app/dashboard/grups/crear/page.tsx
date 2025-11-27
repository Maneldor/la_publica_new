'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

export default function CreateGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    purpose: string;
    category: string;
    privacy: 'public' | 'private' | 'secret';
    coverImage: string;
    tags: string[];
    newTag: string;
  }>({
    name: '',
    description: '',
    purpose: '', // Nuevo campo: finalidad
    category: '',
    privacy: 'public', // Solo público permitido
    coverImage: '',
    tags: [],
    newTag: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categorías disponibles
  const categories = [
    'Tecnologia',
    'Disseny',
    'Marketing',
    'Negocis',
    'Educació',
    'Recerca',
    'Consultoria',
    'Innovació',
    'Altres'
  ];

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    const newTag = formData.newTag.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nom del grup és obligatori';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nom ha de tenir almenys 3 caràcters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripció és obligatòria';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripció ha de tenir almenys 10 caràcters';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'La finalitat és obligatòria';
    } else if (formData.purpose.length < 10) {
      newErrors.purpose = 'La finalitat ha de tenir almenys 10 caràcters';
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoria';
    }

    if (!formData.coverImage.trim()) {
      newErrors.coverImage = 'La imatge de portada és obligatòria';
    } else {
      // Validar que sea una URL válida
      try {
        new URL(formData.coverImage);
      } catch {
        newErrors.coverImage = 'Introdueix una URL vàlida per a la imatge';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Corregeix els errors del formulari');
      return;
    }

    setIsLoading(true);
    try {
      // Simular envío de solicitud de grupo
      await new Promise(resolve => setTimeout(resolve, 2000));

      const groupRequest = {
        id: Date.now(), // En producción sería generado por el backend
        name: formData.name,
        description: formData.description,
        purpose: formData.purpose,
        category: formData.category,
        privacy: 'public', // Siempre público para empleados
        coverImage: formData.coverImage,
        tags: formData.tags,
        requestedBy: 'Usuari Actual', // En producción sería el usuario logueado
        requestDate: new Date().toISOString(),
        status: 'pending', // pending, approved, rejected
        adminNotes: ''
      };

      showNotification('success', `Sol·licitud de grup "${formData.name}" enviada correctament!`);
      showNotification('info', 'Els administradors revisaran la teva sol·licitud en un termini de 2-3 dies laborables.');
      showNotification('success', '📧 Notificació enviada als administradors: Nova sol·licitud de grup pendent de revisió');

      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        purpose: '',
        category: '',
        privacy: 'public',
        coverImage: '',
        tags: [],
        newTag: ''
      });

      // Redireccionar a la página de grupos después de un momento
      setTimeout(() => {
        router.push('/dashboard/grups');
      }, 3000);

    } catch (error) {
      showNotification('error', 'Error al enviar la sol·licitud');
      console.error('Error al enviar sol·licitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    { label: 'Sol·licituds Pendents', value: '8', trend: '+3' },
    { label: 'Grups Aprovats', value: '67', trend: '+5' },
    { label: 'Sol·licituds Aquest Mes', value: '24', trend: '+12' },
    { label: 'Temps Mitjà Aprovació', value: '2.3 dies', trend: '-0.5d' }
  ];

  const getPrivacyInfo = () => {
    switch (formData.privacy) {
      case 'public':
        return {
          icon: '🌐',
          title: 'Públic',
          description: 'Qualsevol pot veure el grup i unir-s\'hi directament'
        };
      case 'private':
        return {
          icon: '🔒',
          title: 'Privat',
          description: 'Visible per a tots, però cal sol·licitar unir-se'
        };
      case 'secret':
        return {
          icon: '🤫',
          title: 'Secret',
          description: 'Només visible per als membres convidades'
        };
    }
  };

  const privacy = getPrivacyInfo();

  return (
    <PageTemplate
      title="Sol·licitud de Creació de Grup"
      subtitle="Sol·licita la creació d'un nou grup públic per a la comunitat"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>

        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>

            {/* Información básica */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 20px 0'
              }}>
                Informació bàsica
              </h3>

              {/* Nombre del grupo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '6px'
                }}>
                  Nom del grup *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Desenvolupadors Frontend Barcelona"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.name ? '#ef4444' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
                {errors.name && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '6px'
                }}>
                  Descripció *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descriu el propòsit i objectius del grup..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.description ? '#ef4444' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                {errors.description && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Finalidad */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '6px'
                }}>
                  Finalitat *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Explica per què vols crear aquest grup i quins beneficis aportarà a la comunitat..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.purpose ? '#ef4444' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                {errors.purpose && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {errors.purpose}
                  </span>
                )}
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  Aquest camp ajuda als administradors a avaluar la necessitat i viabilitat del grup.
                </span>
              </div>

              {/* Categoría */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '6px'
                }}>
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.category ? '#ef4444' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Cover Image */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '6px'
                }}>
                  Imatge de portada *
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.coverImage ? '#ef4444' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
                {errors.coverImage && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {errors.coverImage}
                  </span>
                )}
                {formData.coverImage && !errors.coverImage && (
                  <div style={{
                    marginTop: '12px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef'
                  }}>
                    <img
                      src={formData.coverImage}
                      alt="Vista previa"
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        setErrors(prev => ({ ...prev, coverImage: 'URL d\'imatge no vàlida' }));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Información sobre privacidad */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 20px 0'
              }}>
                Tipus de grup
              </h3>

              <div style={{
                padding: '16px',
                backgroundColor: '#f0f7ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '24px'
                }}>
                  🌐
                </div>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '4px'
                  }}>
                    Grup Públic
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    lineHeight: '1.4'
                  }}>
                    Tots els empleats públics poden veure el grup i unir-s'hi directament.
                    <br />
                    <strong>Nota:</strong> Per política interna, només es permeten grups públics per fomentar la transparència i col·laboració oberta.
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 20px 0'
              }}>
                Etiquetes (opcional)
              </h3>

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <input
                  type="text"
                  value={formData.newTag}
                  onChange={(e) => handleInputChange('newTag', e.target.value)}
                  placeholder="Afegir etiqueta..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!formData.newTag.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: formData.newTag.trim() ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: formData.newTag.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Afegir
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f0f7ff',
                        color: '#3b82f6',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                type="button"
                onClick={() => router.push('/dashboard/grups')}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Enviant sol·licitud...
                  </>
                ) : (
                  '📤 Enviar sol·licitud'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* CSS para la animación de loading */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </PageTemplate>
  );
}