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
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSession } from 'next-auth/react';
import { CalendarProvider } from '@/lib/context/CalendarContext';
import { Settings } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

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

  const comunitatItems = [
    { href: '/dashboard', label: 'Xarxa Social', icon: '🏠' },
    { href: '/dashboard/perfil', label: 'El Meu Perfil', icon: '👤' },
    { href: '/dashboard/membres', label: 'Membres', icon: '👥' },
    { href: '/dashboard/grups', label: 'Grups', icon: '👫' },
    { href: '/dashboard/missatges', label: 'Missatges', icon: '💬' },
    { href: '/dashboard/forums', label: 'Fòrums', icon: '🏛️' },
    { href: '/dashboard/blogs', label: 'Blogs', icon: '📝' },
    { href: '/dashboard/anuncis', label: 'Anuncis', icon: '📢' },
  ];

  const serveisItems = [
    { href: '/dashboard/empreses', label: 'Empreses i Col·laboradors', icon: '🏢' },
    { href: '/gestor-empreses', label: 'Gestor Empreses (CRM)', icon: '📈' },
    { href: '/dashboard/ofertes', label: 'Ofertes', icon: '🎁' },
    { href: '/dashboard/assessorament', label: 'Assessorament', icon: '💡' },
    { href: '/dashboard/enllacos', label: "Enllaços d'Interès", icon: '🔗' },
    { href: '/dashboard/formacio', label: 'Formació', icon: '🎓' },
    { href: '/dashboard/recursos', label: 'Recursos', icon: '📚' },
    { href: '/dashboard/calendari', label: 'Calendari', icon: '📅' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <CalendarProvider>
      <div className="min-h-screen bg-gray-50">
        {/* HEADER GLOBAL - Fixed at top */}
        <header className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-[100]">
          <div className="flex items-center justify-between h-16 px-4">
            {/* ZONA ESQUERRA - Logo */}
            <div className="flex items-center w-64 px-4 py-3">
              <img
                src="/images/cropped-logo_la-Pública-ok-2.png"
                alt="La Pública"
                className="w-[150px] h-auto object-contain"
              />
            </div>

            {/* ZONA CENTRAL - Barra de cerca */}
            <div className="flex-1 max-w-2xl mx-4">
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
                  className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-gray-300 text-sm
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                    transition-all duration-200 placeholder-gray-500"
                />
              </div>
            </div>

            {/* ZONA DRETA - Accions */}
            <div className="flex items-center gap-3">
              {/* Create Post Button */}
              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white
                rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-200
                shadow-sm hover:shadow">
                <span className="text-lg">+</span>
                Crear Post
              </button>


              {/* Messages */}
              <div className="relative messages-dropdown">
                <button
                  onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
                  className="w-10 h-10 rounded-lg border border-gray-200 bg-white
                    flex items-center justify-center text-gray-600 hover:text-blue-600
                    hover:border-blue-300 transition-all duration-200 relative"
                >
                  💬
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full
                      w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>

                {/* TODO: Create MessagesDropdown component */}
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

              {/* Configuración de notificaciones */}
              <Link
                href="/dashboard/configuracio/preferencies"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preferències de notificacions"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border-2 border-blue-500
                    bg-white hover:bg-blue-50 transition-all duration-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700
                    flex items-center justify-center text-white font-bold text-sm">
                    AL
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Admin</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
        </div>
      </header>

        {/* CONTENT AREA - Below header */}
        <div className="pt-16 flex">
          {/* SIDEBAR - Fixed left, dark theme, no logo */}
          <aside className="fixed left-0 w-64 h-[calc(100vh-4rem)] bg-gray-900 overflow-y-auto">
            {/* COMUNITAT */}
            <div className="px-4 pt-6 pb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Comunitat
              </p>
              <nav className="flex flex-col gap-1">
                {comunitatItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-xl w-6 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* SERVEIS */}
            <div className="px-4 py-4 border-t border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Serveis
              </p>
              <nav className="flex flex-col gap-1">
                {serveisItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-xl w-6 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

          </aside>

          {/* MAIN CONTENT */}
          <main className="ml-64 flex-1 bg-gray-50">
            <div className="p-6">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>

        {/* MODAL DE BÚSQUEDA */}
        {showSearchModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[200] transition-opacity"
              onClick={() => setShowSearchModal(false)}
            />

            {/* Modal */}
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

            {/* Modal */}
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
        </div>
      </CalendarProvider>
  );
}