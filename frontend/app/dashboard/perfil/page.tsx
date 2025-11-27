'use client';

import { useState, useEffect, useRef } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import TimelineTab from './components/tabs/TimelineTab';
import AboutTab from './components/tabs/AboutTab';
import FriendsTab from './components/tabs/FriendsTab';
import GroupsTab from './components/tabs/GroupsTab';
import PostsTab from './components/tabs/PostsTab';
import PhotosTab from './components/tabs/PhotosTab';
import SavedTab from './components/tabs/SavedTab';
import SettingsTab from './components/tabs/SettingsTab';
import { Camera, Upload, User, Users, MessageSquare, Heart,
         Activity, Info, UserPlus, FileText, Image, Settings, Bookmark } from 'lucide-react';

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
type TabType = 'timeline' | 'about' | 'friends' | 'groups' | 'posts' | 'photos' | 'guardats' | 'settings';

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

interface Language {
  name: string;
  level: string;
}

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

export default function PerfilPage() {
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Form and UI states
  const [formData, setFormData] = useState<UserProfile>({
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [previewAvatar, setPreviewAvatar] = useState('');
  const [previewCover, setPreviewCover] = useState('');
  const [isDragOver, setIsDragOver] = useState<'avatar' | 'cover' | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; show: boolean }>({
    type: 'success',
    message: '',
    show: false
  });

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

  const [skills, setSkills] = useState([
    'Transformació Digital', 'Gestió de Projectes', 'Administració Electrònica',
    'Lean Management', 'Process Mining', 'React', 'Node.js', 'TypeScript',
    'Power BI', 'Agile', 'Scrum', 'Leadership', 'Change Management', 'UX/UI Design'
  ]);

  const [interests, setInterests] = useState([
    'Innovació Pública', 'Smart Cities', 'Sostenibilitat', 'Ciclisme',
    'Fotografia', 'Tecnologia', 'Política Local', 'Educació Digital'
  ]);

  const [languages, setLanguages] = useState([
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

  const handleProfileUpdate = async (updatedData: any) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update all the state with the new data from wizard
      setAboutData(updatedData.aboutData);
      setEducation(updatedData.education);
      setExperience(updatedData.experience);
      setSkills(updatedData.skills);
      setInterests(updatedData.interests);
      setLanguages(updatedData.languages);

      showToast('success', '✓ Perfil actualitzat correctament amb el wizard!');
    } catch (error) {
      showToast('error', 'Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          marginBottom: '20px',
          border: '2px solid #e5e7eb',
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
        {activeTab === 'timeline' && <TimelineTab />}

        {activeTab === 'about' && <AboutTab
          aboutData={aboutData}
          education={education}
          experience={experience}
          skills={skills}
          interests={interests}
          languages={languages}
          onProfileUpdate={handleProfileUpdate}
          userProfile={{
            fullName: `${profile.firstName} ${profile.lastName}`,
            username: profile.nick,
            administration: profile.administration,
            registrationDate: profile.createdAt
          }}
        />}

        {activeTab === 'friends' && <FriendsTab />}

        {activeTab === 'groups' && <GroupsTab />}

        {activeTab === 'posts' && <PostsTab />}

        {activeTab === 'photos' && <PhotosTab />}

        {activeTab === 'guardats' && <SavedTab />}

        {activeTab === 'settings' && <SettingsTab profile={profile} setProfile={setProfile} />}
      </div>
    </PageTemplate>
  );
}