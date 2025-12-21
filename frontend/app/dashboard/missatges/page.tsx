'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { User, Message, Conversation, CurrentUser } from './types/chatTypes';
import { ChatWindow } from './components/ChatWindow';
import { ConversationsList } from './components/ConversationsList';
import { ChatSidebar } from './components/ChatSidebar';
import { CreateGroupModal } from './components/CreateGroupModal';
import { MessageCircle, Lock, Loader2, Plus } from 'lucide-react';


export default function MissatgesPage() {
  const { data: session } = useSession();

  // Usuario actual desde la sessió
  const currentUser: CurrentUser = useMemo(() => ({
    id: session?.user?.id || '',
    name: session?.user?.name || null,
    nick: (session?.user as { nick?: string })?.nick || null,
    image: session?.user?.image || null,
    email: session?.user?.email || null,
  }), [session]);

  // Estados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatTerm, setSearchInChatTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  // Estats de càrrega
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Estat per crear grup
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Carregar converses des de l'API
  const loadConversations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error carregant converses:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [session?.user?.id]);

  // Carregar missatges d'una conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);

        // Marcar com a llegits
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: 'POST'
        });

        // Actualitzar comptador a la llista
        setConversations(prev => prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Error carregant missatges:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Efecte inicial: carregar converses
  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session?.user?.id, loadConversations]);

  // Efecte: carregar missatges quan canvia la conversa activa
  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation?.id, loadMessages]);

  // Polling per actualitzar converses cada 30 segons
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id, loadConversations]);

  // Detectar mòbil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll a l'últim missatge
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tancar pickers al fer clic fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-emoji-picker]') && !target.closest('[data-emoji-button]')) {
        setShowEmojiPicker(false);
      }
      if (!target.closest('[data-attach-menu]') && !target.closest('[data-attach-button]')) {
        setShowAttachMenu(false);
      }
    };

    if (showEmojiPicker || showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker, showAttachMenu]);

  // Funcions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date | string | undefined | null) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ahir';
    } else if (days < 7) {
      return d.toLocaleDateString('ca-ES', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Enviar missatge real a l'API
  const sendMessage = async () => {
    if (!messageText.trim() || !activeConversation || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setReplyingTo(null);
    setIsSending(true);

    // Missatge optimista
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        nick: currentUser.nick,
        image: currentUser.image,
      },
      content,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          replyToId: replyingTo?.id
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        // Reemplaçar missatge temporal amb el real
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...newMessage, status: 'sent' } : msg
        ));

        // Actualitzar llista de converses
        loadConversations();
      } else {
        // Error: marcar com a fallat
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: 'sending' } : msg
        ));
      }
    } catch (error) {
      console.error('Error enviant missatge:', error);
      // Revertir missatge temporal
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageText(content); // Restaurar text
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Implementar pujada de fitxers
      console.log('Arxius seleccionats:', files);
      setShowAttachMenu(false);
    }
  };

  const togglePin = (conversationId: string) => {
    // TODO: Implementar amb API
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  const toggleMute = (conversationId: string) => {
    // TODO: Implementar amb API
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
    ));
  };

  const archiveConversation = (conversationId: string) => {
    // TODO: Implementar amb API
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: true } : conv
    ));
  };

  const deleteMessage = (messageId: string) => {
    // TODO: Implementar amb API
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const starMessage = (messageId: string) => {
    // TODO: Implementar amb API
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  // Filtrar converses
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Aplicar filtre de categoria
    switch (activeFilter) {
      case 'starred':
        filtered = filtered.filter(c => c.isPinned);
        break;
      case 'muted':
        filtered = filtered.filter(c => c.isMuted);
        break;
      case 'archived':
        filtered = filtered.filter(c => c.isArchived);
        break;
      case 'groups':
        filtered = filtered.filter(c => c.type === 'group');
        break;
      case 'companies':
        filtered = filtered.filter(c => c.type === 'company');
        break;
      default:
        filtered = filtered.filter(c => !c.isArchived);
    }

    // Aplicar cerca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.name || c.title || '').toLowerCase().includes(term) ||
        c.lastMessage?.content.toLowerCase().includes(term)
      );
    }

    // Ordenar: fixats primer, després per data
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations, activeFilter, searchTerm]);

  // Calcular total de no llegits
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const statsData = [
    { label: 'Converses Actives', value: conversations.filter(c => !c.isArchived).length },
    { label: 'Missatges No Llegits', value: totalUnread },
    { label: 'Grups', value: conversations.filter(c => c.type === 'group').length },
    { label: 'Arxivats', value: conversations.filter(c => c.isArchived).length }
  ];

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    if (isMobile) {
      setShowConversation(true);
    }
  };

  const closeConversation = () => {
    if (isMobile) {
      setShowConversation(false);
    }
  };

  // Handler per quan es crea/obre una nova conversa des del sidebar
  const handleNewConversation = useCallback(async (conversationId: string) => {
    // Recarregar converses
    await loadConversations();

    // Buscar la conversa i seleccionar-la
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data = await res.json();
      const newConv = data.find((c: Conversation) => c.id === conversationId);
      if (newConv) {
        setActiveConversation(newConv);
        if (isMobile) {
          setShowConversation(true);
        }
      }
    }
  }, [loadConversations, isMobile]);

  // Handlers per al menú d'opcions
  const handleCreateGroup = () => {
    setShowCreateGroup(true);
  };

  const handleMuteConversation = async (conversationId: string) => {
    try {
      const conv = conversations.find(c => c.id === conversationId);
      const newMutedState = !conv?.isMuted;

      // Actualitzar localment primer (optimistic update)
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, isMuted: newMutedState } : c
      ));

      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => prev ? { ...prev, isMuted: newMutedState } : prev);
      }

      // TODO: Cridar API per persistir
      // await fetch(`/api/conversations/${conversationId}/mute`, { method: 'POST' });

      console.log(`Conversa ${conversationId} ${newMutedState ? 'silenciada' : 'activada'}`);
    } catch (error) {
      console.error('Error silenciant conversa:', error);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      const conv = conversations.find(c => c.id === conversationId);
      const newArchivedState = !conv?.isArchived;

      // Actualitzar localment
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, isArchived: newArchivedState } : c
      ));

      // Si s'arxiva la conversa activa, tancar-la
      if (newArchivedState && activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }

      // TODO: Cridar API per persistir
      // await fetch(`/api/conversations/${conversationId}/archive`, { method: 'POST' });

      console.log(`Conversa ${conversationId} ${newArchivedState ? 'arxivada' : 'desarxivada'}`);
    } catch (error) {
      console.error('Error arxivant conversa:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta conversa? Aquesta acció no es pot desfer.')) {
      return;
    }

    try {
      // Eliminar localment
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      // Si s'elimina la conversa activa, tancar-la
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }

      // TODO: Cridar API per eliminar
      // await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });

      console.log(`Conversa ${conversationId} eliminada`);
    } catch (error) {
      console.error('Error eliminant conversa:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navegar al perfil de l'usuari
    window.location.href = `/dashboard/membres/${userId}`;
  };

  // Estat de càrrega inicial
  if (isLoadingConversations && conversations.length === 0) {
    return (
      <PageLayout
        title="Missatges"
        subtitle="Sistema de missatgeria instantània"
        icon={<MessageCircle className="w-6 h-6" />}
        noPadding
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-gray-500">Carregant converses...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Missatges"
      subtitle="Sistema de missatgeria instantània"
      icon={<MessageCircle className="w-6 h-6" />}
      actions={
        <button
          onClick={() => setShowCreateGroup(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova conversa
        </button>
      }
      noPadding
    >
      {/* Stats Grid */}
      <div className="px-6 mb-4">
        <StatsGrid stats={statsData} columns={4} />
      </div>

      {/* Contenedor principal de missatgeria */}
      <Card className="mx-6 mb-6 overflow-hidden" style={{ height: 'calc(100vh - 340px)' }}>
        <div className="flex h-full">

        {/* COLUMNA 1: SIDEBAR ESQUERRA */}
        {(!isMobile || (!showConversation && !activeConversation)) && (
          <ChatSidebar
            isMobile={isMobile}
            showConversation={showConversation}
            activeConversation={activeConversation}
            currentUser={currentUser}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            totalUnread={totalUnread}
            onNewConversation={handleNewConversation}
          />
        )}

        {/* COLUMNA 2: LLISTA DE XATS */}
        {(!isMobile || (!showConversation)) && (
          <ConversationsList
            isMobile={isMobile}
            showConversation={showConversation}
            filteredConversations={filteredConversations}
            activeConversation={activeConversation}
            currentUser={currentUser}
            openConversation={openConversation}
            formatTime={formatTime}
          />
        )}

        {/* COLUMNA 3: CONVERSA ACTIVA */}
        {(!isMobile || showConversation) && activeConversation && (
          <ChatWindow
            activeConversation={activeConversation}
            currentUser={currentUser}
            messages={messages}
            messageText={messageText}
            setMessageText={setMessageText}
            showSearchInChat={showSearchInChat}
            setShowSearchInChat={setShowSearchInChat}
            searchInChatTerm={searchInChatTerm}
            setSearchInChatTerm={setSearchInChatTerm}
            hoveredMessage={hoveredMessage}
            setHoveredMessage={setHoveredMessage}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            showAttachMenu={showAttachMenu}
            setShowAttachMenu={setShowAttachMenu}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            messageInputRef={messageInputRef}
            fileInputRef={fileInputRef}
            isMobile={isMobile}
            closeConversation={closeConversation}
            sendMessage={sendMessage}
            starMessage={starMessage}
            deleteMessage={deleteMessage}
            setMessages={setMessages}
            handleFileSelect={handleFileSelect}
            formatTime={formatTime}
            formatFileSize={formatFileSize}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            onCreateGroup={handleCreateGroup}
            onMuteConversation={handleMuteConversation}
            onArchiveConversation={handleArchiveConversation}
            onDeleteConversation={handleDeleteConversation}
            onViewProfile={handleViewProfile}
          />
        )}

        {/* Estat buit quan no hi ha conversa activa (desktop) */}
        {!isMobile && !activeConversation && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center">
            <div className="p-10">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {conversations.length === 0 ? 'Encara no tens converses' : 'Benvingut als Missatges'}
              </h2>
              <p className="text-gray-500 mb-6">
                {conversations.length === 0
                  ? 'Inicia una nova conversa per començar a xatejar'
                  : 'Selecciona una conversa per començar a xatejar'
                }
              </p>
              <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Els missatges estan xifrats de punta a punta</span>
              </div>
            </div>
          </div>
        )}
        </div>
      </Card>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }

        .typing-dot {
          animation: typing 1.4s infinite;
        }
      `}</style>

      {/* Modal per crear grup */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleNewConversation}
      />
    </PageLayout>
  );
}
