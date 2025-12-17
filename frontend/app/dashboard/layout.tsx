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
  const [postImage, setPostImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // NotificationBell component now handles its own state

  // Messages state
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(5); // Mock data

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
        { name: 'Agenda', href: '/dashboard/agenda', icon: CalendarDays, iconColor: 'text-amber-300' },
        { name: 'El Meu Perfil', href: '/dashboard/perfil', icon: UserCircle, iconColor: 'text-cyan-300' },
        { name: 'Missatges', href: '/dashboard/missatges', icon: MessageCircle, iconColor: 'text-teal-300' },
        { name: 'Els Meus Grups', href: '/dashboard/els-meus-grups', icon: Users, iconColor: 'text-green-300' },
      ],
    },
    {
      id: 'comunitat',
      title: 'Comunitat',
      defaultOpen: true,
      items: [
        { name: 'Xarxa Social', href: '/dashboard', icon: Home, iconColor: 'text-rose-300' },
        { name: 'Membres', href: '/dashboard/membres', icon: UsersRound, iconColor: 'text-purple-300' },
        { name: 'Grups', href: '/dashboard/grups', icon: Users, iconColor: 'text-blue-300' },
        { name: 'Fòrums', href: '/dashboard/forums', icon: MessagesSquare, iconColor: 'text-orange-300' },
        { name: 'Blogs', href: '/dashboard/blogs', icon: FileText, iconColor: 'text-emerald-300' },
        { name: 'Anuncis', href: '/dashboard/anuncis', icon: Megaphone, iconColor: 'text-yellow-300' },
      ],
    },
    {
      id: 'serveis',
      title: 'Serveis',
      defaultOpen: false,
      items: [
        { name: 'Empreses i Col·laboradors', href: '/dashboard/empreses', icon: Building2, iconColor: 'text-slate-300' },
        { name: 'Ofertes', href: '/dashboard/ofertes', icon: Gift, iconColor: 'text-pink-300' },
        { name: 'Assessorament', href: '/dashboard/assessorament', icon: Lightbulb, iconColor: 'text-amber-300' },
        { name: 'Enllaços d\'Interès', href: '/dashboard/enllacos', icon: LinkIcon, iconColor: 'text-cyan-300' },
        { name: 'Formació', href: '/dashboard/formacio', icon: GraduationCap, iconColor: 'text-indigo-300' },
        { name: 'Recursos', href: '/dashboard/recursos', icon: FolderOpen, iconColor: 'text-lime-300' },
        { name: 'Calendari', href: '/dashboard/calendari', icon: Calendar, iconColor: 'text-violet-300' },
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
        <div className="flex min-h-screen">
          {/* SIDEBAR - Altura completa */}
          <aside 
            className="w-64 min-h-screen flex flex-col sticky top-0 border-r-2 border-gray-300"
            style={{
              background: 'linear-gradient(180deg, #A78BFA 0%, #60A5FA 100%)',
            }}
          >
            {/* Logo - Logo original con colores */}
            <div className="flex items-center justify-center border-b-2 border-gray-300 px-5" style={{ height: '72px' }}>
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
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
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
                                flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${active 
                                  ? "bg-white/20 text-white border-l-3 border-white" 
                                  : "text-white/85 hover:bg-white/10 hover:text-white"
                                }
                              `}
                              style={active ? { borderLeft: '3px solid white', paddingLeft: '17px' } : {}}
                            >
                              <span className={`
                                transition-transform duration-200 group-hover:scale-110 
                                ${active ? "text-amber-300" : item.iconColor}
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
          <div className="flex-1 flex flex-col">
            {/* HEADER - Sin logo, solo funcionalidades */}
            <header className="bg-white border-b-2 border-gray-300 flex items-center justify-between px-6 sticky top-0 z-10" style={{ height: '72px' }}>
              {/* Barra de búsqueda */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
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
                  <span className="text-lg">+</span>
                  Crear Post
                </button>
                
                <div className="relative messages-dropdown">
                  <button
                    onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    💬
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  {showMessagesDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Missatges</h3>
                      </div>
                      <div className="p-4 text-center text-gray-500">
                        <p>Funcionalitat de missatges en desenvolupament</p>
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
                        <span className="text-lg">👤</span>
                        El meu perfil
                      </Link>
                      <Link
                        href="/dashboard/missatges"
                        prefetch={true}
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="text-lg">💬</span>
                        Missatges
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <Link
                        href="/dashboard/perfil"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="text-lg">⚙️</span>
                        Configuració
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          // Aquí aniria la lògica de logout
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <span className="text-lg">🚪</span>
                        Tancar sessió
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
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
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
                        <p className="font-medium">Joan Domènech</p>
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
                      <span className="text-2xl">👫</span>
                      <div>
                        <p className="font-medium">Economia Social</p>
                        <p className="text-sm text-gray-500">234 membres</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-2xl">🌱</span>
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
                    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <p className="font-medium">Assemblea General 2025</p>
                      <p className="text-sm text-gray-500">📅 15 de gener • 🏛️ Fòrum General</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <p className="font-medium">Taller de Cooperatives</p>
                      <p className="text-sm text-gray-500">📅 22 de gener • 🎓 Formació</p>
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
              onClick={() => setShowPostModal(false)}
            />

            {/* Modal - Ajustado para nueva estructura */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              z-[201] w-full max-w-lg bg-white rounded-xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Crear nou post</h2>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* User info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700
                    flex items-center justify-center text-white font-bold text-sm">
                    AL
                  </div>
                  <div>
                    <p className="font-medium">Admin</p>
                    <select className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1">
                      <option>🌍 Públic</option>
                      <option>👥 Només membres</option>
                      <option>🔒 Privat</option>
                    </select>
                  </div>
                </div>

                {/* Content textarea */}
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Què vols compartir?"
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />

                {/* Image preview if exists */}
                {postImage && (
                  <div className="mt-3 relative">
                    <img
                      src={postImage}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setPostImage('')}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <span className="text-xl leading-none">×</span>
                    </button>
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => setPostImage(e.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                        flex items-center gap-2 text-sm"
                    >
                      📷 Foto
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                      flex items-center gap-2 text-sm">
                      🎥 Vídeo
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                      flex items-center gap-2 text-sm">
                      😊 Emoji
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors
                      flex items-center gap-2 text-sm">
                      📍 Ubicació
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowPostModal(false);
                        setPostContent('');
                        setPostImage('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel·lar
                    </button>
                    <button
                      onClick={() => {
                        // Aquí iria la lògica per publicar el post
                        console.log('Publicant:', { content: postContent, image: postImage });
                        setShowPostModal(false);
                        setPostContent('');
                        setPostImage('');
                      }}
                      disabled={!postContent.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
                        hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Publicar
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