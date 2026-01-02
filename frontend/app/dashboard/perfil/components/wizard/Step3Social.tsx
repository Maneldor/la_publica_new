'use client';

import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Instagram, Plus, X } from 'lucide-react';

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  username?: string;
}

interface Step3Props {
  data: {
    socialLinks: SocialLink[];
  };
  addSocialLink: (link: Omit<SocialLink, 'id'>) => Promise<SocialLink | null>;
  deleteSocialLink: (id: string) => Promise<boolean>;
  isSaving: boolean;
}

export const Step3Social = ({ data, addSocialLink, deleteSocialLink, isSaving }: Step3Props) => {
  const [socialInputs, setSocialInputs] = useState({
    twitter: '',
    linkedin: '',
    instagram: ''
  });

  // Cargar datos existentes
  useEffect(() => {
    if (data.socialLinks) {
      const inputs = { twitter: '', linkedin: '', instagram: '' };
      data.socialLinks.forEach(link => {
        if (link.platform === 'Twitter' && link.username) {
          inputs.twitter = link.username;
        } else if (link.platform === 'LinkedIn' && (link.username || link.url)) {
          inputs.linkedin = link.username || link.url;
        } else if (link.platform === 'Instagram' && link.username) {
          inputs.instagram = link.username;
        }
      });
      setSocialInputs(inputs);
    }
  }, [data.socialLinks]);

  const handleSocialChange = (platform: string, value: string) => {
    setSocialInputs(prev => ({ ...prev, [platform]: value }));
  };

  const handleSocialSave = async (platform: string) => {
    const value = socialInputs[platform as keyof typeof socialInputs];
    if (!value.trim()) return;

    // Eliminar link existente si existe
    const existing = data.socialLinks.find(link => 
      link.platform.toLowerCase() === platform.toLowerCase()
    );
    if (existing?.id) {
      await deleteSocialLink(existing.id);
    }

    // Crear nuevo link
    let url = '';
    let username = value;

    if (platform === 'twitter') {
      url = `https://twitter.com/${value}`;
      username = value;
    } else if (platform === 'linkedin') {
      if (value.startsWith('http')) {
        url = value;
        username = value.split('/').pop() || value;
      } else {
        url = `https://linkedin.com/in/${value}`;
        username = value;
      }
    } else if (platform === 'instagram') {
      url = `https://instagram.com/${value}`;
      username = value;
    }

    await addSocialLink({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      url,
      username
    });
  };

  const handleSocialRemove = async (platform: string) => {
    const existing = data.socialLinks.find(link => 
      link.platform.toLowerCase() === platform.toLowerCase()
    );
    if (existing?.id) {
      await deleteSocialLink(existing.id);
      setSocialInputs(prev => ({ ...prev, [platform]: '' }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--Step3Social-title-color, #111827)',
          marginBottom: '8px'
        }}>
          Xarxes Socials
        </h2>
        <p style={{ color: 'var(--Step3Social-description-color, #4b5563)' }}>
          Connecta les teves xarxes socials per facilitar que altres usuaris et trobin i contactin
        </p>
      </div>

      {/* Social Networks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Twitter */}
        <div style={{
          backgroundColor: 'var(--Step3Social-card-bg, #ffffff)',
          border: '1px solid var(--Step3Social-card-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--Step3Social-twitter-bg, #dbeafe)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Twitter style={{ width: '24px', height: '24px', color: 'var(--Step3Social-twitter-icon, #2563eb)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--Step3Social-card-title, #111827)' }}>Twitter / X</h3>
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-card-subtitle, #4b5563)' }}>Connecta el teu compte de Twitter</p>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--Step3Social-label-color, #374151)',
              marginBottom: '8px'
            }}>
              Nom d'usuari (sense @)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--Step3Social-prefix-color, #6b7280)'
              }}>
                @
              </span>
              <input
                type="text"
                value={socialInputs.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value.replace('@', ''))}
                onBlur={() => handleSocialSave('twitter')}
                placeholder="jordi_garcia"
                style={{
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '48px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--Step3Social-input-border, #d1d5db)',
                  color: 'var(--Step3Social-input-text, #111827)',
                  backgroundColor: 'var(--Step3Social-input-bg, #ffffff)',
                  transition: 'all 0.2s'
                }}
              />
              {socialInputs.twitter && (
                <button
                  onClick={() => handleSocialRemove('twitter')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    color: 'var(--Step3Social-remove-color, #9ca3af)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
            {socialInputs.twitter && (
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-twitter-link, #2563eb)', marginTop: '4px' }}>
                Perfil: https://twitter.com/{socialInputs.twitter}
              </p>
            )}
          </div>
        </div>

        {/* LinkedIn */}
        <div style={{
          backgroundColor: 'var(--Step3Social-card-bg, #ffffff)',
          border: '1px solid var(--Step3Social-card-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--Step3Social-linkedin-bg, #dbeafe)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Linkedin style={{ width: '24px', height: '24px', color: 'var(--Step3Social-linkedin-icon, #1d4ed8)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--Step3Social-card-title, #111827)' }}>LinkedIn</h3>
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-card-subtitle, #4b5563)' }}>Connecta el teu perfil professional</p>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--Step3Social-label-color, #374151)',
              marginBottom: '8px'
            }}>
              Nom d'usuari o URL completa
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={socialInputs.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                onBlur={() => handleSocialSave('linkedin')}
                placeholder="jordi-garcia-martinez o https://linkedin.com/in/jordi-garcia-martinez"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--Step3Social-input-border, #d1d5db)',
                  color: 'var(--Step3Social-input-text, #111827)',
                  backgroundColor: 'var(--Step3Social-input-bg, #ffffff)',
                  transition: 'all 0.2s'
                }}
              />
              {socialInputs.linkedin && (
                <button
                  onClick={() => handleSocialRemove('linkedin')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    color: 'var(--Step3Social-remove-color, #9ca3af)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
            {socialInputs.linkedin && (
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-linkedin-link, #1d4ed8)', marginTop: '4px' }}>
                Perfil: {socialInputs.linkedin.startsWith('http')
                  ? socialInputs.linkedin
                  : `https://linkedin.com/in/${socialInputs.linkedin}`}
              </p>
            )}
          </div>
        </div>

        {/* Instagram */}
        <div style={{
          backgroundColor: 'var(--Step3Social-card-bg, #ffffff)',
          border: '1px solid var(--Step3Social-card-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--Step3Social-instagram-bg, #fce7f3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Instagram style={{ width: '24px', height: '24px', color: 'var(--Step3Social-instagram-icon, #db2777)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--Step3Social-card-title, #111827)' }}>Instagram</h3>
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-card-subtitle, #4b5563)' }}>Connecta el teu compte d'Instagram</p>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--Step3Social-label-color, #374151)',
              marginBottom: '8px'
            }}>
              Nom d'usuari (sense @)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--Step3Social-prefix-color, #6b7280)'
              }}>
                @
              </span>
              <input
                type="text"
                value={socialInputs.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value.replace('@', ''))}
                onBlur={() => handleSocialSave('instagram')}
                placeholder="jordigarcia_public"
                style={{
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '48px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--Step3Social-input-border, #d1d5db)',
                  color: 'var(--Step3Social-input-text, #111827)',
                  backgroundColor: 'var(--Step3Social-input-bg, #ffffff)',
                  transition: 'all 0.2s'
                }}
              />
              {socialInputs.instagram && (
                <button
                  onClick={() => handleSocialRemove('instagram')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    color: 'var(--Step3Social-remove-color, #9ca3af)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
            {socialInputs.instagram && (
              <p style={{ fontSize: '14px', color: 'var(--Step3Social-instagram-link, #db2777)', marginTop: '4px' }}>
                Perfil: https://instagram.com/{socialInputs.instagram}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div style={{
        backgroundColor: 'var(--Step3Social-warning-bg, #fefce8)',
        border: '1px solid var(--Step3Social-warning-border, #fef08a)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--Step3Social-warning-title, #854d0e)',
          marginBottom: '8px'
        }}>
          Nota sobre Privacitat:
        </h4>
        <ul style={{
          fontSize: '14px',
          color: 'var(--Step3Social-warning-text, #a16207)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          margin: 0,
          paddingLeft: '0',
          listStyle: 'none'
        }}>
          <li>• Les xarxes socials que afegeixis seran visibles per altres usuaris de La Pública</li>
          <li>• Assegura't que els teus perfils siguin públics o professionals</li>
          <li>• Pots deixar qualsevol camp buit si no vols compartir aquesta informació</li>
          <li>• Sempre pots modificar o eliminar aquesta informació més tard</li>
        </ul>
      </div>

      {/* Benefits Section */}
      <div style={{
        backgroundColor: 'var(--Step3Social-info-bg, #eff6ff)',
        border: '1px solid var(--Step3Social-info-border, #bfdbfe)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--Step3Social-info-title, #1e40af)',
          marginBottom: '8px'
        }}>
          Beneficis de connectar les xarxes socials:
        </h4>
        <ul style={{
          fontSize: '14px',
          color: 'var(--Step3Social-info-text, #1d4ed8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          margin: 0,
          paddingLeft: '0',
          listStyle: 'none'
        }}>
          <li>• Facilita que altres professionals et trobin i contactin</li>
          <li>• Augmenta la credibilitat del teu perfil</li>
          <li>• Permet mostrar la teva experiència i projectes</li>
          <li>• Crea oportunitats de networking professional</li>
        </ul>
      </div>

      {/* Preview Section */}
      {data.socialLinks && data.socialLinks.length > 0 && (
        <div style={{
          backgroundColor: 'var(--Step3Social-preview-bg, #f9fafb)',
          border: '1px solid var(--Step3Social-preview-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step3Social-preview-title, #111827)',
            marginBottom: '12px'
          }}>
            Vista prèvia de les teves xarxes:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {data.socialLinks.map((link) => {
              const getPlatformIcon = () => {
                switch (link.platform) {
                  case 'Twitter': return <Twitter style={{ width: '16px', height: '16px', color: 'var(--Step3Social-twitter-icon, #2563eb)' }} />;
                  case 'LinkedIn': return <Linkedin style={{ width: '16px', height: '16px', color: 'var(--Step3Social-linkedin-icon, #1d4ed8)' }} />;
                  case 'Instagram': return <Instagram style={{ width: '16px', height: '16px', color: 'var(--Step3Social-instagram-icon, #db2777)' }} />;
                  default: return <Plus style={{ width: '16px', height: '16px', color: 'var(--Step3Social-default-icon, #4b5563)' }} />;
                }
              };

              return (
                <div key={link.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--Step3Social-tag-bg, #ffffff)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--Step3Social-tag-border, #e5e7eb)'
                }}>
                  {getPlatformIcon()}
                  <span style={{ fontSize: '14px', color: 'var(--Step3Social-tag-text, #374151)' }}>
                    {link.platform === 'LinkedIn' && link.url.startsWith('http')
                      ? 'LinkedIn Profile'
                      : link.username || link.url}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};