/*
 * ⚠️  CORE ARCHITECTURE - DO NOT MODIFY ⚠️
 *
 * This is the main dashboard layout component that defines the entire application structure.
 *
 * CRITICAL COMPONENTS:
 * - Fixed header with logo, search, and user actions spanning full width
 * - Fixed sidebar navigation with 3 sections (Comunitat, Serveis, Accions Ràpides)
 * - Responsive layout with proper spacing and positioning
 *
 * PROTECTED ELEMENTS:
 * - Header layout with logo positioning
 * - Sidebar structure and navigation items
 * - Main content area dimensions and margins
 * - Color scheme and spacing consistency
 *
 * ⚠️  MODIFICATION GUIDELINES:
 * - Only modify navigation items or add new sections if explicitly requested
 * - Do not change positioning, dimensions, or core styling
 * - Test thoroughly after any changes to ensure layout integrity
 * - Consult ARCHITECTURE.md before making structural changes
 *
 * Last modified: 2025-10-14 | Version: 3.0 | Status: PROTECTED
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useSession } from 'next-auth/react';
import { CalendarProvider } from '@/lib/context/CalendarContext';
import { Settings } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { OnboardingCheck } from './OnboardingCheck';
import {
  CalendarDays,
  UserCircle,
  MessageCircle,
  Users,
  Home,
  UsersRound,
  MessagesSquare,
  FileText,
  Megaphone,
  Building2,
  Gift,
  Lightbulb,
  Link as LinkIcon,
  GraduationCap,
  FolderOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  X,
  Search,
  Plus,
  Loader2,
  Globe,
  Lock,
  User,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'CONNECTIONS' | 'PRIVATE'>('PUBLIC');
  const [postAttachments, setPostAttachments] = useState<{ type: 'IMAGE' | 'DOCUMENT'; url: string; filename?: string }[]>([]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalImageInputRef = useRef<HTMLInputElement>(null);
  const modalDocumentInputRef = useRef<HTMLInputElement>(null);

  // Upload file to API
  const uploadFile = async (file: File, type: 'IMAGE' | 'DOCUMENT'): Promise<{ type: 'IMAGE' | 'DOCUMENT'; url: string; filename?: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type === 'IMAGE' ? 'image' : 'document');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error pujant fitxer');
      }

      const data = await response.json();
      return {
        type,
        url: data.url,
        filename: file.name,
      };
    } catch (error) {
      console.error('Error pujant fitxer:', error);
      return null;
    }
  };

  // Handle image selection in modal
  const handleModalImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        alert('Nomes es permeten imatges');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imatge no pot superar els 5MB');
        continue;
      }
      const attachment = await uploadFile(file, 'IMAGE');
      if (attachment) {
        setPostAttachments(prev => [...prev, attachment]);
      }
    }
    setIsUploading(false);
    if (modalImageInputRef.current) modalImageInputRef.current.value = '';
  };

  // Handle document selection in modal
  const handleModalDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(files)) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipus de fitxer no permes. Acceptem: PDF, Word, Excel, TXT');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El document no pot superar els 10MB');
        continue;
      }
      const attachment = await uploadFile(file, 'DOCUMENT');
      if (attachment) {
        setPostAttachments(prev => [...prev, attachment]);
      }
    }
    setIsUploading(false);
    if (modalDocumentInputRef.current) modalDocumentInputRef.current.value = '';
  };

  // Remove attachment
  const removeModalAttachment = (index: number) => {
    setPostAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Reset modal state
  const resetModalState = () => {
    setShowPostModal(false);
    setPostContent('');
    setPostAttachments([]);
    setPostVisibility('PUBLIC');
    setShowPollForm(false);
    setPollOptions(['', '']);
  };

  // NotificationBell component now handles its own state

  // Messages state
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Carregar comptador de missatges no llegits des de l'API
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await fetch('/api/messages/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadMessagesCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error carregant comptador de missatges:', error);
      }
    };

    fetchUnreadMessages();

    // Polling cada 30 segons
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // NotificationBell component now manages notifications internally

  // NotificationBell component handles notification clicks internally

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProfileDropdown && !target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
      if (showMessagesDropdown && !target.closest('.messages-dropdown')) {
        setShowMessagesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showMessagesDropdown]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'el-meu-espai': true,   // expandida
    'comunitat': false,      // contraída
    'serveis': false,        // contraída
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const menuSections = [
    {
      id: 'el-meu-espai',
      title: 'El Meu Espai',
      defaultOpen: true,
      items: [
        { name: 'Agenda', href: '/dashboard/agenda', icon: CalendarDays, iconColor: 'text-blue-500' },
        { name: 'Avui', href: '/dashboard/avui', icon: Home, iconColor: 'text-emerald-500' },
        { name: 'El Meu Perfil', href: '/dashboard/perfil', icon: UserCircle, iconColor: 'text-violet-500' },
        { name: 'Missatges', href: '/dashboard/missatges', icon: MessageCircle, iconColor: 'text-green-500' },
      ],
    },
    {
      id: 'comunitat',
      title: 'Comunitat',
      defaultOpen: true,
      items: [
        { name: 'Xarxa Social', href: '/dashboard', icon: Home, iconColor: 'text-rose-500' },
        { name: 'Membres', href: '/dashboard/membres', icon: UsersRound, iconColor: 'text-fuchsia-500' },
        { name: 'Grups', href: '/dashboard/grups', icon: Users, iconColor: 'text-sky-500' },
        { name: 'Fòrums', href: '/dashboard/forums', icon: MessagesSquare, iconColor: 'text-teal-500' },
        { name: 'Blogs', href: '/dashboard/blogs', icon: FileText, iconColor: 'text-indigo-500' },
        { name: 'Anuncis', href: '/dashboard/anuncis', icon: Megaphone, iconColor: 'text-pink-500' },
      ],
    },
    {
      id: 'serveis',
      title: 'Serveis',
      defaultOpen: false,
      items: [
        { name: 'Empreses i Col·laboradors', href: '/dashboard/empreses', icon: Building2, iconColor: 'text-slate-600' },
        { name: 'Ofertes', href: '/dashboard/ofertes', icon: Gift, iconColor: 'text-emerald-500' },
        { name: 'Assessorament', href: '/dashboard/assessorament', icon: Lightbulb, iconColor: 'text-purple-500' },
        { name: 'Enllaços d\'Interès', href: '/dashboard/enllacos', icon: LinkIcon, iconColor: 'text-cyan-500' },
        { name: 'Formació', href: '/dashboard/formacio', icon: GraduationCap, iconColor: 'text-violet-500' },
        { name: 'Recursos', href: '/dashboard/recursos', icon: FolderOpen, iconColor: 'text-blue-500' },
        { name: 'Calendari', href: '/dashboard/calendari', icon: Calendar, iconColor: 'text-indigo-500' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <OnboardingCheck>
      <CalendarProvider>
        {/* Nueva estructura: Sidebar height completa | Header + Content */}
        <div className="flex h-screen overflow-hidden">
          {/* SIDEBAR - Fijo con sticky */}
          <aside
            className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-200"
          >
            {/* Logo - Logo original con colores */}
            <div className="flex items-center justify-center border-b border-gray-200 px-5" style={{ height: '72px' }}>
              <Link href="/dashboard" className="flex items-center justify-center">
                <img
                  src="/images/cropped-logo_la-Pública-ok-2.png"
                  alt="La Pública"
                  className="h-14 w-auto"
                />
              </Link>
            </div>

            {/* Menu sections */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {menuSections.map((section) => (
                <div key={section.id} className="mb-2">
                  {/* Section header - clickable to expand/collapse */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-500 hover:bg-gray-50 transition-colors"
                  >
                    <span>{section.title}</span>
                    <motion.span
                      animate={{ rotate: openSections[section.id] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  {/* Section items */}
                  <AnimatePresence initial={false}>
                    {openSections[section.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {section.items.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.href)

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`
                                flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200 group
                                ${active
                                  ? "bg-orange-50 text-orange-600 font-medium"
                                  : "text-gray-700 hover:bg-gray-50"
                                }
                              `}
                              style={active ? { borderLeft: '3px solid #F97316', paddingLeft: '17px' } : {}}
                            >
                              <span className={`
                                transition-transform duration-200 group-hover:scale-110
                                ${active ? "text-orange-500" : item.iconColor}
                              `}>
                                <Icon className="w-5 h-5" strokeWidth={1.75} />
                              </span>
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </aside>

          {/* CONTENEDOR DERECHO: Header + Contenido */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* HEADER - Sin logo, solo funcionalidades */}
            <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10" style={{ height: '72px' }}>
              {/* Barra de búsqueda */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar membres, grups, activitats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        setShowSearchModal(true);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Crear Post
                </button>
                
                <div className="relative messages-dropdown">
                  <button
                    onClick={() => router.push('/dashboard/missatges')}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Missatges"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {showMessagesDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Missatges</h3>
                        {unreadMessagesCount > 0 && (
                          <span className="text-sm text-gray-500">{unreadMessagesCount} no llegits</span>
                        )}
                      </div>
                      <div className="p-4 text-center text-gray-500">
                        <p>Fes clic per veure els teus missatges</p>
                        <button
                          onClick={() => router.push('/dashboard/missatges')}
                          className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Anar a Missatges →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notifications - Using NotificationBell component */}
                <NotificationBell />
                
                <Link
                  href="/dashboard/configuracio/preferencies"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Preferències de notificacions"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                
                {/* Avatar usuario */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {session?.user?.name || 'Usuari'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/dashboard/perfil"
                        prefetch={true}
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        El meu perfil
                      </Link>
                      <Link
                        href="/dashboard/missatges"
                        prefetch={true}
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        Missatges
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <Link
                        href="/dashboard/configuracio/preferencies"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        Configuracio
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          // Aqui aniria la logica de logout
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Tancar sessio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 bg-gray-50 overflow-y-auto">
              <div className="p-6">
                <Breadcrumbs />
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* MODAL DE BÚSQUEDA */}
        {showSearchModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[200] transition-opacity"
              onClick={() => setShowSearchModal(false)}
            />

            {/* Modal - Ajustado para nueva estructura */}
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2
              z-[201] w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[70vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Resultats de cerca: "{searchQuery}"</h2>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
                {/* Membres */}
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Membres</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        JD
                      </div>
                      <div>
                        <p className="font-medium">Joan Domenech</p>
                        <p className="text-sm text-gray-500">@jdomenech</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-sm">
                        MR
                      </div>
                      <div>
                        <p className="font-medium">Maria Rovira</p>
                        <p className="text-sm text-gray-500">@mrovira</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grups */}
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Grups</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">Economia Social</p>
                        <p className="text-sm text-gray-500">234 membres</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sostenibilitat</p>
                        <p className="text-sm text-gray-500">189 membres</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activitats */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Activitats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Assemblea General 2025</p>
                        <p className="text-sm text-gray-500">15 de gener - Forum General</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Taller de Cooperatives</p>
                        <p className="text-sm text-gray-500">22 de gener - Formacio</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODAL CREAR POST */}
        {showPostModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[200] transition-opacity"
              onClick={() => !isPublishing && resetModalState()}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              z-[201] w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-gray-900">Crear nou post</h2>
                <button
                  onClick={() => !isPublishing && resetModalState()}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                {/* User info */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-indigo-600
                    flex items-center justify-center text-white font-bold">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{session?.user?.name || 'Usuari'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {postVisibility === 'PUBLIC' && <Globe className="w-3.5 h-3.5 text-gray-500" />}
                      {postVisibility === 'CONNECTIONS' && <Users className="w-3.5 h-3.5 text-gray-500" />}
                      {postVisibility === 'PRIVATE' && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                      <select
                        value={postVisibility}
                        onChange={(e) => setPostVisibility(e.target.value as 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE')}
                        className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="CONNECTIONS">Nomes connexions</option>
                        <option value="PRIVATE">Privat</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content textarea */}
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Que vols compartir amb la comunitat?"
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white
                    placeholder:text-gray-400"
                  rows={6}
                />

                {/* Attachments preview */}
                {postAttachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {postAttachments.map((att, index) => (
                      <div key={index} className="relative group">
                        {att.type === 'IMAGE' ? (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img src={att.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-700 max-w-[100px] truncate">{att.filename}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeModalAttachment(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Poll form */}
                {showPollForm && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Opcions de l'enquesta</span>
                      <button
                        onClick={() => setShowPollForm(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[index] = e.target.value;
                              setPollOptions(newOptions);
                            }}
                            placeholder={`Opcio ${index + 1}`}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {pollOptions.length < 4 && (
                      <button
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Afegir opcio
                      </button>
                    )}
                  </div>
                )}

                {/* Hidden file inputs */}
                <input
                  ref={modalImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleModalImageSelect}
                  className="hidden"
                />
                <input
                  ref={modalDocumentInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  multiple
                  onChange={handleModalDocumentSelect}
                  className="hidden"
                />

                {/* Actions bar */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t">
                  <div className="flex gap-1">
                    <button
                      onClick={() => modalImageInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                        flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      Foto
                    </button>
                    <button
                      onClick={() => modalDocumentInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                        flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Document
                    </button>
                    <button
                      onClick={() => setShowPollForm(!showPollForm)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                        showPollForm
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Enquesta
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={resetModalState}
                      disabled={isPublishing}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancellar
                    </button>
                    <button
                      onClick={async () => {
                        if ((!postContent.trim() && postAttachments.length === 0) || isPublishing) return;

                        setIsPublishing(true);
                        try {
                          const res = await fetch('/api/posts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              content: postContent.trim(),
                              type: postAttachments.some(a => a.type === 'IMAGE') ? 'PHOTO' : 'TEXT',
                              visibility: postVisibility,
                              attachments: postAttachments,
                            })
                          });

                          if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.error || 'Error creant el post');
                          }

                          // Reset and close
                          resetModalState();

                          // Refresh page
                          router.refresh();
                          if (pathname === '/dashboard') {
                            window.location.reload();
                          }
                        } catch (error) {
                          console.error('Error creant post:', error);
                          alert(error instanceof Error ? error.message : 'Hi ha hagut un error creant la publicacio');
                        } finally {
                          setIsPublishing(false);
                        }
                      }}
                      disabled={(!postContent.trim() && postAttachments.length === 0) || isPublishing || isUploading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium
                        hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Publicant...
                        </>
                      ) : (
                        'Publicar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CalendarProvider>
    </OnboardingCheck>
  );
}