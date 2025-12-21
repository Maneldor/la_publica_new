'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CurrentUser } from '../types/chatTypes';
import {
  Inbox, Star, BellOff, Archive, Users, Building2,
  User as UserIcon, Search, X, MessageCircle, Loader2
} from 'lucide-react';

interface Contact {
  id: string;
  nick: string | null;
  name: string;
  image: string | null;
  isOnline: boolean;
  position?: string;
  department?: string;
}

interface ChatSidebarProps {
  isMobile: boolean;
  showConversation: boolean;
  activeConversation: any;
  currentUser: CurrentUser;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies';
  setActiveFilter: (filter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies') => void;
  totalUnread: number;
  onNewConversation?: (conversationId: string) => void;
}

export function ChatSidebar({
  isMobile,
  showConversation,
  activeConversation,
  currentUser,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  totalUnread,
  onNewConversation
}: ChatSidebarProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const userAvatar = currentUser.image;
  const userName = currentUser.name || currentUser.nick || 'Usuari';

  // Carregar contactes
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error carregant contactes:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Iniciar nova conversa amb un contacte
  const startConversation = async (contactId: string) => {
    setIsCreatingConversation(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [contactId]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const conversationId = data.id || data.conversation?.id;

        setShowNewConversationModal(false);
        setContactSearch('');

        // Notificar al pare per recarregar converses i seleccionar la nova
        if (onNewConversation && conversationId) {
          onNewConversation(conversationId);
        }
      }
    } catch (error) {
      console.error('Error iniciant conversa:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Filtrar contactes per cerca
  const filteredContacts = contacts.filter(c => {
    if (!contactSearch) return true;
    const search = contactSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.nick?.toLowerCase().includes(search) ||
      c.position?.toLowerCase().includes(search)
    );
  });

  const filters = [
    { key: 'all', icon: Inbox, label: 'Tots els xats', badge: totalUnread },
    { key: 'starred', icon: Star, label: 'Destacats' },
    { key: 'muted', icon: BellOff, label: 'Silenciats' },
    { key: 'archived', icon: Archive, label: 'Arxivats' },
    { key: 'groups', icon: Users, label: 'Grups' },
    { key: 'companies', icon: Building2, label: 'Empreses' }
  ];

  return (
    <>
      <div className={`${isMobile ? 'w-full' : 'w-60'} bg-slate-800 text-white flex flex-col border-r border-slate-700`}>
        {/* Header Sidebar */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{userName}</div>
              <div className="text-xs text-slate-400">En línia</div>
            </div>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white text-lg transition-colors"
              title="Nova conversa"
            >
              +
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar converses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros de navegación */}
        <div className="flex-1 overflow-y-auto p-3">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`w-full px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 mb-1 transition-colors ${
                activeFilter === filter.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{filter.label}</span>
              {filter.badge && filter.badge > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                  {filter.badge}
                </span>
              )}
            </button>
          ))}

          {/* Secció de contactes */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wide">
                Contactes ({contacts.length})
              </span>
            </div>

            {isLoadingContacts ? (
              <div className="text-center py-3">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-3 text-sm text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No tens contactes</p>
                <button
                  onClick={() => router.push('/dashboard/membres')}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-xs transition-colors"
                >
                  Anar a Membres
                </button>
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto">
                {contacts.slice(0, 5).map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => startConversation(contact.id)}
                    className="w-full p-2 rounded-md flex items-center gap-2.5 hover:bg-slate-700 transition-colors"
                  >
                    <div className="relative">
                      {contact.image ? (
                        <img
                          src={contact.image}
                          alt={contact.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-slate-800" />
                      )}
                    </div>
                    <span className="text-sm truncate">{contact.name}</span>
                  </button>
                ))}
                {contacts.length > 5 && (
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="w-full py-2 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                  >
                    Veure tots ({contacts.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Conversa */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Nova conversa
              </h3>
              <button
                onClick={() => {
                  setShowNewConversationModal(false);
                  setContactSearch('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cercador */}
            <div className="p-5 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contacte..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Llista de contactes */}
            <div className="max-h-80 overflow-y-auto p-2">
              {isLoadingContacts ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  <p className="mt-3 text-gray-500 text-sm">Carregant contactes...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm mb-4">
                    {contacts.length === 0
                      ? 'No tens contactes. Connecta amb altres membres primer.'
                      : 'No s\'han trobat contactes'
                    }
                  </p>
                  {contacts.length === 0 && (
                    <button
                      onClick={() => {
                        setShowNewConversationModal(false);
                        router.push('/dashboard/membres');
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Anar a Membres
                    </button>
                  )}
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => startConversation(contact.id)}
                    disabled={isCreatingConversation}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isCreatingConversation
                        ? 'opacity-70 cursor-wait'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="relative">
                      {contact.image ? (
                        <img
                          src={contact.image}
                          alt={contact.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {contact.isOnline && (
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </p>
                      {contact.position && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {contact.position}
                        </p>
                      )}
                    </div>
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
