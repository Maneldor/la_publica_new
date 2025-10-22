'use client';

import { useState, useEffect, useRef } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { Camera, Upload, Eye, EyeOff, Lock, Check, X, User, Users, MessageSquare, Heart,
         Activity, Info, UserPlus, FileText, Image, Settings, Calendar, MapPin,
         Briefcase, Globe, GraduationCap, Plus, Edit, Save, Bookmark } from 'lucide-react';

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

interface Activity {
  id: string;
  type: 'post' | 'group' | 'comment' | 'like' | 'share';
  content: string;
  timestamp: string;
  icon: any;
}

interface Friend {
  id: string;
  name: string;
  nick: string;
  avatar: string;
  administration: AdministrationType;
}

interface Group {
  id: string;
  name: string;
  avatar: string;
  members: number;
  lastActivity: string;
  role: 'admin' | 'moderator' | 'member';
}

type TabType = 'timeline' | 'about' | 'friends' | 'groups' | 'posts' | 'photos' | 'settings';

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    nick: 'jordi_funcionari',
    firstName: 'Jordi',
    lastName: 'García Martínez',
    email: 'jordi.garcia@lapublica.cat',
    administration: 'LOCAL',
    createdAt: '2024-01-15',
    avatar: '',
    coverImage: ''
  });

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

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const statsData = [
    {
      label: 'Perfil Completat',
      value: '85%',
      trend: '+5%',
      icon: User,
      color: '#10b981'
    },
    {
      label: 'Connexions',
      value: '142',
      trend: '+12',
      icon: Users,
      color: '#3b82f6'
    },
    {
      label: 'Posts Publicats',
      value: '23',
      trend: '+3',
      icon: MessageSquare,
      color: '#8b5cf6'
    },
    {
      label: 'Likes Rebuts',
      value: '367',
      trend: '+45',
      icon: Heart,
      color: '#ef4444'
    }
  ];

  // Sample data
  const [aboutData, setAboutData] = useState({
    bio: "Funcionari públic apassionat per la innovació tecnològica i la modernització de l'administració. M'especialitzo en transformació digital i processos administratius eficients. Sempre buscant maneres de millorar l'experiència ciutadana a través de la tecnologia.",
    birthDate: '1985-03-15',
    location: 'Barcelona, Catalunya',
    workplace: 'Ajuntament de Barcelona',
    position: 'Tècnic en Transformació Digital',
    website: 'https://jordi-garcia.dev',
    socialNetworks: {
      twitter: '@jordi_garcia',
      linkedin: 'jordi-garcia-martinez',
      instagram: '@jordigarcia_public'
    }
  });

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      title: 'Màster en Administració i Direcció d\'Empreses (MBA)',
      institution: 'ESADE Business School',
      startYear: '2010',
      endYear: '2012',
      description: 'Especialització en Gestió Pública i Transformació Digital'
    },
    {
      id: '2',
      title: 'Grau en Administració i Direcció d\'Empreses',
      institution: 'Universitat Pompeu Fabra',
      startYear: '2003',
      endYear: '2007',
      description: 'Especialitat en Gestió d\'Organitzacions Públiques'
    },
    {
      id: '3',
      title: 'Postgrau en Transformació Digital',
      institution: 'UOC - Universitat Oberta de Catalunya',
      startYear: '2018',
      endYear: '2019',
      description: 'Certificació en tecnologies emergents aplicades al sector públic'
    }
  ]);

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: '1',
      position: 'Tècnic en Transformació Digital',
      company: 'Ajuntament de Barcelona',
      startDate: '2015-09',
      endDate: 'Present',
      description: 'Lidero projectes de digitalització de serveis ciutadans. He implementat més de 20 tràmits online, reduint els temps de gestió en un 60%.'
    },
    {
      id: '2',
      position: 'Analista de Processos',
      company: 'Diputació de Barcelona',
      startDate: '2012-03',
      endDate: '2015-08',
      description: 'Optimització de processos administratius i implementació de sistemes de gestió documental electrònica.'
    },
    {
      id: '3',
      position: 'Consultor Junior',
      company: 'Deloitte Public Sector',
      startDate: '2008-01',
      endDate: '2012-02',
      description: 'Assessorament en projectes de modernització administrativa per a diversos organismes públics.'
    }
  ]);

  const [skills] = useState([
    'Transformació Digital', 'Gestió de Projectes', 'Administració Electrònica',
    'Lean Management', 'Process Mining', 'React', 'Node.js', 'TypeScript',
    'Power BI', 'Agile', 'Scrum', 'Leadership', 'Change Management', 'UX/UI Design'
  ]);

  const [interests] = useState([
    'Innovació Pública', 'Smart Cities', 'Sostenibilitat', 'Ciclisme',
    'Fotografia', 'Tecnologia', 'Política Local', 'Educació Digital'
  ]);

  const [languages] = useState([
    { name: 'Català', level: 'Natiu' },
    { name: 'Castellà', level: 'Natiu' },
    { name: 'Anglès', level: 'Avançat (C1)' },
    { name: 'Francès', level: 'Intermedi (B2)' }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'post',
      content: 'Ha publicat: "Nou sistema de cita prèvia digital implementat amb èxit"',
      timestamp: 'fa 2 hores',
      icon: FileText
    },
    {
      id: '2',
      type: 'group',
      content: 'S\'ha unit al grup "Innovació en Administració Pública"',
      timestamp: 'fa 1 dia',
      icon: Users
    },
    {
      id: '3',
      type: 'comment',
      content: 'Ha comentat la publicació de Maria González sobre processos digitals',
      timestamp: 'fa 2 dies',
      icon: MessageSquare
    },
    {
      id: '4',
      type: 'like',
      content: 'Li ha agradat la publicació "Millores en l\'atenció ciutadana"',
      timestamp: 'fa 3 dies',
      icon: Heart
    },
    {
      id: '5',
      type: 'share',
      content: 'Ha compartit l\'article "Futur de l\'administració digital"',
      timestamp: 'fa 5 dies',
      icon: Upload
    }
  ]);

  const [friends] = useState<Friend[]>([
    { id: '1', name: 'Maria González', nick: 'maria_admin', avatar: '', administration: 'LOCAL' },
    { id: '2', name: 'Carles Puig', nick: 'carles_tech', avatar: '', administration: 'AUTONOMICA' },
    { id: '3', name: 'Anna Soler', nick: 'anna_design', avatar: '', administration: 'LOCAL' },
    { id: '4', name: 'David Martín', nick: 'david_dev', avatar: '', administration: 'CENTRAL' },
    { id: '5', name: 'Laura Vidal', nick: 'laura_pm', avatar: '', administration: 'AUTONOMICA' },
    { id: '6', name: 'Marc Torres', nick: 'marc_frontend', avatar: '', administration: 'LOCAL' }
  ]);

  const [groups] = useState<Group[]>([
    { id: '1', name: 'Innovació en Administració', avatar: '', members: 247, lastActivity: 'fa 2 hores', role: 'admin' },
    { id: '2', name: 'Desenvolupadors Frontend', avatar: '', members: 189, lastActivity: 'fa 1 dia', role: 'member' },
    { id: '3', name: 'Transformació Digital', avatar: '', members: 156, lastActivity: 'fa 3 dies', role: 'moderator' },
    { id: '4', name: 'UX/UI Barcelona', avatar: '', members: 234, lastActivity: 'fa 1 setmana', role: 'member' }
  ]);

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'about', label: 'Sobre mi', icon: Info },
    { id: 'friends', label: 'Amistats', icon: UserPlus },
    { id: 'groups', label: 'Grups', icon: Users },
    { id: 'posts', label: 'Publicacions', icon: FileText },
    { id: 'photos', label: 'Fotos', icon: Image },
    { id: 'guardats', label: 'Guardats', icon: Bookmark },
    { id: 'settings', label: 'Configuració', icon: Settings }
  ];

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

  const getAdministrationBadge = (type: AdministrationType) => {
    const badges = {
      LOCAL: { label: 'Local', color: 'bg-green-100 text-green-800' },
      AUTONOMICA: { label: 'Autonòmica', color: 'bg-purple-100 text-purple-800' },
      CENTRAL: { label: 'Central', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[type];
  };

  const getAvatarInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  return (
    <PageTemplate
      title="El Meu Perfil"
      subtitle="Gestiona la teva informació personal i configuració"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>
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

        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'avatar')}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'cover')}
        />

        {/* Cover Image Section */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div
            style={{
              position: 'relative',
              height: '310px',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              background: previewCover || profile.coverImage ?
                `url(${previewCover || profile.coverImage}) center/cover` :
                'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: isDragOver === 'cover' ? '4px dashed #3b82f6' : 'none',
              transition: 'all 0.2s',
              boxShadow: isDragOver === 'cover' ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
              zIndex: 10
            }}
            onClick={() => coverInputRef.current?.click()}
            onMouseEnter={() => setIsHoveringCover(true)}
            onMouseLeave={() => setIsHoveringCover(false)}
            onDragEnter={(e) => handleDragEnter(e, 'cover')}
            onDragOver={(e) => handleDragOver(e, 'cover')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'cover')}
          >
            {/* Cover overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isHoveringCover || isDragOver === 'cover' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                borderRadius: '12px'
              }}
            >
              <div
                style={{
                  color: 'white',
                  textAlign: 'center',
                  opacity: isHoveringCover || isDragOver === 'cover' ? 1 : 0,
                  transition: 'opacity 0.3s',
                  transform: isHoveringCover || isDragOver === 'cover' ? 'translateY(0)' : 'translateY(10px)'
                }}
              >
                <Camera style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>
                  {isDragOver === 'cover' ? 'Deixa anar la imatge' : 'Canviar imatge de portada'}
                </p>
                <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>
                  {isDragOver === 'cover' ? 'Formats: JPG, PNG, WebP (màx. 5MB)' : 'Arrossega una imatge aquí o fes clic'}
                </p>
              </div>
            </div>

          </div>

          {/* Avatar - COMPLETAMENT VISIBLE FORA DE LA PORTADA */}
          <div
            style={{
              position: 'relative',
              zIndex: 40,
              marginTop: '-64px',
              paddingLeft: '24px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '128px',
                height: '128px'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '4px solid white',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isHoveringAvatar || isDragOver === 'avatar' ? 'scale(1.05)' : 'scale(1)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                onMouseEnter={() => setIsHoveringAvatar(true)}
                onMouseLeave={() => setIsHoveringAvatar(false)}
                onDragEnter={(e) => {
                  e.stopPropagation();
                  handleDragEnter(e, 'avatar');
                }}
                onDragOver={(e) => {
                  e.stopPropagation();
                  handleDragOver(e, 'avatar');
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  handleDragLeave(e);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, 'avatar');
                }}
              >
                {previewAvatar || profile.avatar ? (
                  <img
                    src={previewAvatar || profile.avatar}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {getAvatarInitials(profile.firstName, profile.lastName)}
                    </span>
                  </div>
                )}

                {/* Overlay Camera - DENTRO del avatar para que funcione el hover */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    opacity: isHoveringAvatar || isDragOver === 'avatar' ? 1 : 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <Camera style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
              </div>
            </div>
          </div>

          {/* User info below avatar */}
          <div style={{ marginTop: '16px', padding: '0 24px 24px' }}>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              @{profile.nick}
            </p>

            <div style={{
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: getAdministrationBadge(profile.administration).color.includes('green') ? '#dcfce7' :
                                 getAdministrationBadge(profile.administration).color.includes('purple') ? '#f3e8ff' : '#dbeafe',
                color: getAdministrationBadge(profile.administration).color.includes('green') ? '#166534' :
                       getAdministrationBadge(profile.administration).color.includes('purple') ? '#7c3aed' : '#1d4ed8'
              }}>
                {getAdministrationBadge(profile.administration).label}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Registrat el {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          border: '1px solid #f0f0f0',
          position: 'sticky',
          top: '80px',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 24px',
                    border: 'none',
                    background: 'none',
                    color: isActive ? '#3b82f6' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' && (
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
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity style={{ width: '20px', height: '20px' }} />
              Activitat Recent
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4'
                      }}>
                        {activity.content}
                      </p>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Veure més activitat
            </button>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Personal Information */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User style={{ width: '20px', height: '20px' }} />
                  Informació Personal
                </h3>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  <Edit style={{ width: '14px', height: '14px' }} />
                  Editar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Descripció
                  </label>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: '4px 0 0 0',
                    lineHeight: '1.5'
                  }}>
                    {aboutData.bio}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar style={{ width: '12px', height: '12px' }} />
                      Data de naixement
                    </label>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                      {new Date(aboutData.birthDate).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <MapPin style={{ width: '12px', height: '12px' }} />
                      Ubicació
                    </label>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                      {aboutData.location}
                    </p>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Briefcase style={{ width: '12px', height: '12px' }} />
                      Treball
                    </label>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                      {aboutData.position} a {aboutData.workplace}
                    </p>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Globe style={{ width: '12px', height: '12px' }} />
                      Lloc web
                    </label>
                    <a href={aboutData.website} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      margin: '4px 0 0 0',
                      textDecoration: 'none'
                    }}>
                      {aboutData.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Networks */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Xarxes Socials
                </h4>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Twitter: <strong>{aboutData.socialNetworks.twitter}</strong>
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    LinkedIn: <strong>{aboutData.socialNetworks.linkedin}</strong>
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Instagram: <strong>{aboutData.socialNetworks.instagram}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Education */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <GraduationCap style={{ width: '20px', height: '20px' }} />
                  Formació Acadèmica
                </h3>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Afegir
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {edu.title}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {edu.startYear} - {edu.endYear}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      fontWeight: '500',
                      margin: '0 0 8px 0'
                    }}>
                      {edu.institution}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Briefcase style={{ width: '20px', height: '20px' }} />
                  Experiència Professional
                </h3>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Afegir
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {experience.map((exp) => (
                  <div key={exp.id} style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {exp.position}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {new Date(exp.startDate).toLocaleDateString('ca-ES', { year: 'numeric', month: 'short' })} - {exp.endDate === 'Present' ? 'Present' : new Date(exp.endDate).toLocaleDateString('ca-ES', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      fontWeight: '500',
                      margin: '0 0 8px 0'
                    }}>
                      {exp.company}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills and Interests */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 20px 0'
              }}>
                Habilitats i Interessos
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Habilitats
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((skill, index) => (
                    <span key={index} style={{
                      padding: '4px 12px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Interessos
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {interests.map((interest, index) => (
                    <span key={index} style={{
                      padding: '4px 12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Idiomes
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {languages.map((lang, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#f3e8ff',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#7c3aed'
                      }}>
                        {lang.name}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#8b5cf6',
                        backgroundColor: '#ede9fe',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
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
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <UserPlus style={{ width: '20px', height: '20px' }} />
                Amistats ({friends.length} connexions)
              </h3>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Gestionar sol·licituds
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {friends.map((friend) => (
                <div key={friend.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 auto 12px'
                  }}>
                    {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {friend.name}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 8px 0'
                  }}>
                    @{friend.nick}
                  </p>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    backgroundColor: getAdministrationBadge(friend.administration).color.includes('green') ? '#dcfce7' :
                                     getAdministrationBadge(friend.administration).color.includes('purple') ? '#f3e8ff' : '#dbeafe',
                    color: getAdministrationBadge(friend.administration).color.includes('green') ? '#166534' :
                           getAdministrationBadge(friend.administration).color.includes('purple') ? '#7c3aed' : '#1d4ed8',
                    borderRadius: '10px',
                    fontWeight: '500'
                  }}>
                    {getAdministrationBadge(friend.administration).label}
                  </span>
                </div>
              ))}
            </div>

            <button style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Veure totes les connexions
            </button>
          </div>
        )}

        {activeTab === 'groups' && (
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
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users style={{ width: '20px', height: '20px' }} />
                Els Meus Grups ({groups.length})
              </h3>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Descobrir grups
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {groups.map((group) => (
                <div key={group.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {group.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {group.name}
                        </h4>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: group.role === 'admin' ? '#fef3c7' :
                                           group.role === 'moderator' ? '#dbeafe' : '#f3e8ff',
                          color: group.role === 'admin' ? '#92400e' :
                                 group.role === 'moderator' ? '#1e40af' : '#7c3aed',
                          borderRadius: '4px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {group.role}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        {group.members.toLocaleString()} membres
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        Última activitat: {group.lastActivity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
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
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText style={{ width: '20px', height: '20px' }} />
              Publicacions (23 posts)
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  margin: '0 0 4px 0'
                }}>
                  23
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Posts
                </p>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  margin: '0 0 4px 0'
                }}>
                  367
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Likes Rebuts
                </p>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  margin: '0 0 4px 0'
                }}>
                  89
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Comentaris
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <FileText style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                opacity: 0.5
              }} />
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                Les publicacions es mostraran aquí
              </p>
              <p style={{
                fontSize: '14px',
                margin: 0
              }}>
                Implementació completa disponible en la següent fase
              </p>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
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
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Image style={{ width: '20px', height: '20px' }} />
              Galeria de Fotos
            </h3>

            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <Image style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                opacity: 0.5
              }} />
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                La galeria de fotos es mostrarà aquí
              </p>
              <p style={{
                fontSize: '14px',
                margin: 0
              }}>
                Implementació amb grid responsive i lightbox
              </p>
            </div>
          </div>
        )}

        {activeTab === 'guardats' && (
          <div>
            {/* Resum estadístiques */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px',
              border: '1px solid #f0f0f0'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Bookmark style={{ width: '20px', height: '20px' }} />
                📊 Resum de Guardats
              </h2>

              <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                Total guardats: **47**
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#0369a1' }}>📝 12</div>
                  <div style={{ fontSize: '12px', color: '#0369a1' }}>Blogs</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#166534' }}>🎁 8</div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>Ofertes</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#86198f' }}>💬 15</div>
                  <div style={{ fontSize: '12px', color: '#86198f' }}>Forums</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#c2410c' }}>📢 6</div>
                  <div style={{ fontSize: '12px', color: '#c2410c' }}>Anuncis</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#4338ca' }}>🏢 3</div>
                  <div style={{ fontSize: '12px', color: '#4338ca' }}>Empreses</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#be185d' }}>👥 3</div>
                  <div style={{ fontSize: '12px', color: '#be185d' }}>Grups</div>
                </div>
              </div>
            </div>

            {/* Ofertes guardades */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  🎁 OFERTES GUARDADES (8)
                </h3>
                <button
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
                >
                  Veure totes →
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {[
                  {
                    title: 'Descuento 25% en Portàtils Professionals',
                    company: 'TechSolutions BCN',
                    price: '900€',
                    originalPrice: '1200€',
                    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Monitors 24" Full HD',
                    company: 'DisplayTech',
                    price: '150€',
                    originalPrice: '200€',
                    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Teclats mecànics professionals',
                    company: 'KeyboardPro',
                    price: '75€',
                    originalPrice: '100€',
                    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Auriculars Bluetooth Premium',
                    company: 'AudioTech',
                    price: '120€',
                    originalPrice: '160€',
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'
                  }
                ].map((offer, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={offer.image}
                      alt={offer.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                        {offer.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        {offer.company}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                          {offer.price}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'line-through' }}>
                          {offer.originalPrice}
                        </span>
                      </div>
                    </div>

                    <button
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                      title="Eliminar de guardats"
                    >
                      <Heart style={{ width: '14px', height: '14px', fill: '#ef4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Blogs guardats */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  📝 BLOGS GUARDATS (12)
                </h3>
                <button
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
                >
                  Veure tots →
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {[
                  {
                    title: 'Digitalització de l\'Administració Pública',
                    description: 'Estratègies per modernitzar els processos administratius',
                    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Innovació en Serveis Públics',
                    description: 'Com implementar noves tecnologies al servei públic',
                    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Transformació Digital Local',
                    description: 'Casos d\'èxit en l\'administració municipal',
                    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
                  },
                  {
                    title: 'Ciberseguretat en el Sector Públic',
                    description: 'Protocols i mesures de protecció essencials',
                    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=300&h=200&fit=crop'
                  }
                ].map((blog, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                        {blog.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                        {blog.description}
                      </p>
                    </div>

                    <button
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#3b82f6'
                      }}
                      title="Eliminar de guardats"
                    >
                      <Bookmark style={{ width: '14px', height: '14px', fill: '#3b82f6' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Altres categories */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                📂 Altres Categories
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                  <div style={{ fontWeight: '600', color: '#86198f' }}>Forums (15)</div>
                  <div style={{ fontSize: '12px', color: '#a855f7' }}>Temes guardats</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fff7ed', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
                  <div style={{ fontWeight: '600', color: '#c2410c' }}>Anuncis (6)</div>
                  <div style={{ fontSize: '12px', color: '#ea580c' }}>Anuncis d'interès</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#eef2ff', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
                  <div style={{ fontWeight: '600', color: '#4338ca' }}>Empreses (3)</div>
                  <div style={{ fontSize: '12px', color: '#6366f1' }}>Empreses seguides</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                  <div style={{ fontWeight: '600', color: '#be185d' }}>Grups (3)</div>
                  <div style={{ fontSize: '12px', color: '#ec4899' }}>Grups d'interès</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => window.open('/dashboard/perfil/guardats', '_blank')}
                >
                  Veure tots els guardats →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
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
        )}
      </div>
    </PageTemplate>
  );
}