'use client';

import { useState, useEffect } from 'react';
import { Camera, Upload, Eye, EyeOff, Lock, Check, X } from 'lucide-react';

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';

interface UserProfile {
  id: string;
  nick: string;
  firstName: string;
  lastName: string;
  email: string;
  administration: AdministrationType;
  createdAt: string;
  avatar?: string;
  coverImage?: string;
}

interface ToastNotification {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

interface SettingsTabProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function SettingsTab({ profile, setProfile }: SettingsTabProps) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastNotification>({ type: 'success', message: '', show: false });

  // Image handling states
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [previewCover, setPreviewCover] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<'avatar' | 'cover' | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  useEffect(() => {
    const hasProfileChanges = JSON.stringify(profile) !== JSON.stringify(formData);
    const hasImageChanges = previewAvatar !== '' || previewCover !== '';
    setHasChanges(hasProfileChanges || hasImageChanges);
  }, [formData, profile, previewAvatar, previewCover]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Toast notification function
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Image validation
  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Només s\'accepten imatges JPG, PNG o WebP';
    }
    if (file.size > maxSize) {
      return 'La imatge no pot superar els 5MB';
    }
    return null;
  };

  // Handle image file selection
  const handleImageSelect = (file: File, type: 'avatar' | 'cover') => {
    const error = validateImage(file);
    if (error) {
      setUploadError(error);
      showToast('error', error);
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'avatar') {
        setPreviewAvatar(result);
      } else {
        setPreviewCover(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Enhanced drag and drop handlers
  const handleDragEnter = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setIsDragOver(type);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setIsDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setIsDragOver(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0], type);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Dèbil';
    if (strength <= 3) return 'Mitjana';
    return 'Forta';
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile with form data and images
      const updatedProfile = {
        ...formData,
        avatar: previewAvatar || profile.avatar,
        coverImage: previewCover || profile.coverImage
      };

      setProfile(updatedProfile);
      setPreviewAvatar('');
      setPreviewCover('');
      showToast('success', '✓ Perfil actualitzat correctament!');
    } catch (error) {
      showToast('error', 'Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Les contrasenyes no coincideixen');
      return;
    }

    if (calculatePasswordStrength(passwordData.newPassword) < 3) {
      showToast('error', 'La contrasenya és massa feble');
      return;
    }

    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      showToast('success', '✓ Contrasenya actualitzada correctament!');
    } catch (error) {
      showToast('error', 'Error al canviar la contrasenya');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  return (
    <div>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 50,
          backgroundColor: toast.type === 'success' ? '#f0f9ff' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#e0f2fe' : '#fecaca'}`,
          color: toast.type === 'success' ? '#075985' : '#dc2626'
        }}>
          {toast.message}
        </div>
      )}

      {/* Formulari d'edició - Content moved from original */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #f0f0f0'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 24px 0'
        }}>
          Informació Personal
        </h3>

        {/* Upload Error */}
        {uploadError && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px'
          }}>
            {uploadError}
          </div>
        )}

        <form style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px'
        }}>
          {/* Nick (readonly) */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              <Lock style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Nick
            </label>
            <input
              type="text"
              value={formData.nick}
              readOnly
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              El nick no es pot modificar
            </p>
          </div>

          {/* Nom */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Nom
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              required
            />
          </div>

          {/* Cognoms */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Cognoms
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              required
            />
          </div>

          {/* Tipus d'afiliació */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Tipus d'Afiliació
            </label>
            <select
              name="administration"
              value={formData.administration}
              onChange={handleInputChange}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="LOCAL">Local - Ajuntaments, Diputacions</option>
              <option value="AUTONOMICA">Autonòmica - Generalitat de Catalunya</option>
              <option value="CENTRAL">Central - Administració General de l'Estat</option>
            </select>
          </div>
        </form>

        {/* Botó guardar */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSaveProfile}
            disabled={!hasChanges || loading}
            style={{
              padding: '8px 24px',
              backgroundColor: hasChanges && !loading ? '#2563eb' : '#9ca3af',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: hasChanges && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (hasChanges && !loading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (hasChanges && !loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {loading ? 'Desant...' : 'Desa els canvis'}
          </button>
        </div>
      </div>

      {/* Secció canvi de contrasenya */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Contrasenya
          </h3>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            style={{
              color: '#2563eb',
              fontWeight: '500',
              fontSize: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
          >
            {showPasswordSection ? 'Amagar' : 'Canviar contrasenya'}
          </button>
        </div>

        {showPasswordSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Contrasenya actual */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Contrasenya Actual
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    paddingRight: '40px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showCurrentPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            {/* Nova contrasenya */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nova Contrasenya
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    paddingRight: '40px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showNewPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {passwordData.newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      height: '8px'
                    }}>
                      <div
                        style={{
                          height: '8px',
                          borderRadius: '9999px',
                          transition: 'all 0.3s',
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: passwordStrength <= 2 ? '#ef4444' : passwordStrength <= 3 ? '#eab308' : '#10b981'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#4b5563'
                    }}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                    <p style={{ margin: 0 }}>La contrasenya ha de contenir:</p>
                    <ul style={{
                      listStyle: 'disc',
                      paddingLeft: '16px',
                      margin: '4px 0 0 0'
                    }}>
                      <li style={{
                        color: passwordData.newPassword.length >= 8 ? '#059669' : '#9ca3af',
                        marginBottom: '2px'
                      }}>
                        Mínim 8 caràcters
                      </li>
                      <li style={{
                        color: /[a-z]/.test(passwordData.newPassword) ? '#059669' : '#9ca3af',
                        marginBottom: '2px'
                      }}>
                        Lletra minúscula
                      </li>
                      <li style={{
                        color: /[A-Z]/.test(passwordData.newPassword) ? '#059669' : '#9ca3af',
                        marginBottom: '2px'
                      }}>
                        Lletra majúscula
                      </li>
                      <li style={{
                        color: /[0-9]/.test(passwordData.newPassword) ? '#059669' : '#9ca3af',
                        marginBottom: '2px'
                      }}>
                        Número
                      </li>
                      <li style={{
                        color: /[^A-Za-z0-9]/.test(passwordData.newPassword) ? '#059669' : '#9ca3af'
                      }}>
                        Caràcter especial
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar nova contrasenya */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirma Nova Contrasenya
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    paddingRight: '40px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            {/* Botó canviar contrasenya */}
            <div style={{ paddingTop: '16px' }}>
              <button
                onClick={handleChangePassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading}
                style={{
                  padding: '8px 24px',
                  backgroundColor: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading) ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading) ? 'not-allowed' : 'pointer',
                  opacity: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!(!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading)) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading)) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {loading ? 'Canviant...' : 'Canvia contrasenya'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}