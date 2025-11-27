'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { User, Message, Conversation } from '../../gestor-empreses/missatges/types/chatTypes';
import { sampleConversations, sampleMessages } from '../../gestor-empreses/missatges/data/chatData';
import { ChatWindow } from '../../gestor-empreses/missatges/components/ChatWindowSimple';
import { ConversationsList } from '../../gestor-empreses/missatges/components/ConversationsList';
import { ChatSidebar } from '../../gestor-empreses/missatges/components/ChatSidebar';
import { empresaConversationsApi, Conversation as ApiConversation, Message as ApiMessage } from '../../../services/empresaConversationsApi';

// Usuario actual para empresas (usando el mismo pattern que gestor)
const currentUser: User = {
  id: 'emp',
  name: 'Empresa de Desarrollo',
  avatar: '/images/company-avatar.png',
  isOnline: true,
  lastSeen: new Date().toISOString(),
  status: 'Empresa'
};

// Funcions de conversió entre tipus del backend i locals
const convertApiConversation = (apiConv: ApiConversation): Conversation => {
  return {
    id: apiConv.id,
    name: apiConv.name,
    type: (apiConv.type === 'company' ? 'company' : apiConv.type) as 'individual' | 'group' | 'company',
    avatar: apiConv.avatar,
    lastMessage: apiConv.lastMessage ? {
      id: apiConv.lastMessage.id,
      conversationId: apiConv.id,
      senderId: apiConv.lastMessage.senderId,
      content: apiConv.lastMessage.content,
      timestamp: new Date(apiConv.lastMessage.timestamp),
      type: (apiConv.lastMessage.type === 'file' ? 'document' : apiConv.lastMessage.type) as 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system',
      status: apiConv.lastMessage.status as 'sending' | 'sent' | 'delivered' | 'read',
      replyTo: apiConv.lastMessage.replyTo ? parseInt(apiConv.lastMessage.replyTo.id) : undefined,
      attachments: (apiConv.lastMessage.attachments || []).map(att => ({
        id: att.id || '',
        type: att.type === 'file' ? 'document' : att.type as 'image' | 'document' | 'audio' | 'video',
        url: att.url || '',
        name: att.name,
        size: att.size
      }))
    } : null,
    unreadCount: apiConv.unreadCount,
    isPinned: apiConv.isPinned,
    isMuted: apiConv.isMuted,
    isArchived: apiConv.isArchived,
    participants: apiConv.participants.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isOnline: p.isOnline,
      lastSeen: new Date().toISOString()
    }))
  };
};

const convertApiMessage = (apiMsg: ApiMessage, conversationId?: string): Message => {
  // Mapear tipos de mensaje
  let messageType: 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system' = 'text';
  if (apiMsg.type === 'file') messageType = 'document';
  else if (apiMsg.type === 'image') messageType = 'image';
  else if (apiMsg.type === 'audio') messageType = 'audio';
  else messageType = apiMsg.type as 'text' | 'link' | 'system';

  return {
    id: apiMsg.id,
    conversationId: apiMsg.conversationId || conversationId || '',
    senderId: apiMsg.senderId,
    content: apiMsg.content,
    timestamp: new Date(apiMsg.timestamp),
    type: messageType,
    status: apiMsg.status as 'sending' | 'sent' | 'delivered' | 'read',
    isEdited: apiMsg.isEdited || false,
    replyTo: apiMsg.replyTo ? parseInt(apiMsg.replyTo.id) : undefined,
    attachments: (apiMsg.attachments || []).map(att => ({
      id: att.id || '',
      type: att.type === 'file' ? 'document' : att.type as 'image' | 'document' | 'audio' | 'video',
      url: att.url || '',
      name: att.name,
      size: att.size
    }))
  };
};

export default function EmpresaMissatgesPage() {
  // Estados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'muted' | 'archived' | 'gestors' | 'companies' | 'admins'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatTerm, setSearchInChatTerm] = useState('');
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Effects
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cerrar pickers al hacer clic fuera
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

  // Carregar converses del backend
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiConversations = await empresaConversationsApi.getConversations();
        const convertedConversations = apiConversations.map(convertApiConversation);
        setConversations(convertedConversations);

        // Seleccionar la primera conversa per defecte
        if (convertedConversations.length > 0) {
          setActiveConversation(convertedConversations[0]);
        }
      } catch (err) {
        console.error('Error carregant converses:', err);
        setError('Error carregant les converses');
        // Fallback a dades mock en cas d'error
        setConversations(sampleConversations);
        setActiveConversation(sampleConversations[0]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Carregar missatges quan canvia la conversa activa
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) return;

      try {
        const apiMessages = await empresaConversationsApi.getMessages(activeConversation.id);
        const convertedMessages = apiMessages.map(msg => convertApiMessage(msg, activeConversation.id));
        setMessages(convertedMessages);
      } catch (err) {
        console.error('Error carregant missatges:', err);
        // Fallback a dades mock
        setMessages(sampleMessages);
      }
    };

    loadMessages();
  }, [activeConversation]);

  // Funciones
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ahir';
    } else if (days < 7) {
      return date.toLocaleDateString('ca-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !replyingTo) return;
    if (!activeConversation) return;

    // Usar un ID temporal único como string
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: Message = {
      id: tempId,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      content: messageText,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo?.id ? parseInt(replyingTo.id) : undefined
    };

    // Afegir missatge temporal a la UI
    setMessages([...messages, tempMessage]);
    const messageToSend = messageText;
    setMessageText('');
    setReplyingTo(null);

    try {
      const apiMessage = await empresaConversationsApi.sendMessage(activeConversation.id.toString(), {
        content: messageToSend,
        type: 'text',
        replyToId: replyingTo?.id.toString()
      });

      const sentMessage = convertApiMessage(apiMessage, activeConversation.id);
      console.log('✅ Mensaje enviado del backend:', sentMessage);

      // Reemplaçar el missatge temporal amb el real
      setMessages(prev => {
        const newMessages = prev.map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        );
        return newMessages;
      });

      // Actualitzar darrera conversa
      if (activeConversation) {
        setConversations(prev => prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, lastMessage: sentMessage, unreadCount: 0 }
            : conv
        ));
      }
    } catch (err) {
      console.error('Error enviant missatge:', err);
      // Marcar el missatge com a error (usar 'sending' como fallback ya que 'error' no existe)
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...msg, status: 'sending' } : msg
      ));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Aquí procesaríamos los archivos
      console.log('Archivos seleccionados:', files);
      setShowAttachMenu(false);
    }
  };

  const togglePin = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        await empresaConversationsApi.pinConversation(conversationId, !conversation.isPinned);
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
        ));
      }
    } catch (err) {
      console.error('Error canviant estat de fixat:', err);
    }
  };

  const toggleMute = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        await empresaConversationsApi.muteConversation(conversationId, !conversation.isMuted);
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
        ));
      }
    } catch (err) {
      console.error('Error canviant estat de silenciat:', err);
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        await empresaConversationsApi.archiveConversation(conversationId, !conversation.isArchived);
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, isArchived: true } : conv
        ));
      }
    } catch (err) {
      console.error('Error arxivant conversa:', err);
    }
  };

  const deleteMessage = (messageId: number) => {
    const messageIdStr = messageId.toString();
    setMessages(prev => prev.filter(msg => {
      // Intentar convertir el ID del mensaje a número para comparar
      const msgIdNum = parseInt(msg.id);
      return !isNaN(msgIdNum) ? msgIdNum !== messageId : msg.id !== messageIdStr;
    }));
  };

  const starMessage = (messageId: number) => {
    const messageIdStr = messageId.toString();
    setMessages(prev => prev.map(msg => {
      const msgIdNum = parseInt(msg.id);
      const matches = !isNaN(msgIdNum) ? msgIdNum === messageId : msg.id === messageIdStr;
      return matches ? { ...msg, isStarred: !msg.isStarred } : msg;
    }));
  };

  // Filtrar conversaciones (adaptado para empresa)
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Aplicar filtro de categoría (adaptado para empresa)
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
      case 'gestors':
        filtered = filtered.filter(c => (c.type as string) === 'gestor' || (c.type as string) === 'admin');
        break;
      case 'companies':
        filtered = filtered.filter(c => c.type === 'company' || (c.type as string) === 'team');
        break;
      default:
        filtered = filtered.filter(c => !c.isArchived);
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar: fijados primero, luego por fecha
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp || new Date(0);
      const bTime = b.lastMessage?.timestamp || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
  }, [conversations, activeFilter, searchTerm]);

  // Calcular total de no leídos
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const openConversation = async (conv: Conversation) => {
    console.log('🔍 Abriendo conversación:', conv.id, conv.name);
    setActiveConversation(conv);
    if (isMobile) {
      setShowConversation(true);
    }

    // Cargar mensajes de la conversación
    try {
      console.log('📨 Cargando mensajes para conversación:', conv.id);
      const apiMessages = await empresaConversationsApi.getMessages(conv.id);
      console.log('📨 Mensajes recibidos:', apiMessages);
      const convertedMessages = apiMessages.map(msg => convertApiMessage(msg, conv.id));
      console.log('📨 Mensajes convertidos:', convertedMessages);
      setMessages(convertedMessages);
    } catch (err) {
      console.error('Error carregant missatges:', err);
      setMessages([]); // Fallback a lista vacía
    }

    // Marcar como leídos
    try {
      await empresaConversationsApi.markAsRead(conv.id);
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error('Error marcant com llegit:', err);
      // Fallback local
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  };

  const closeConversation = () => {
    if (isMobile) {
      setShowConversation(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con estadísticas simplificadas */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Missatges</h1>

          {/* Estadísticas empresa */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-500">Converses Actives</span>
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {conversations.filter(c => !c.isArchived).length}
                  </span>
                  <span className="text-sm font-medium text-green-600">+2</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-500">Missatges No Llegits</span>
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-gray-900">{totalUnread}</span>
                  {totalUnread > 0 && <span className="text-sm font-medium text-red-600">!</span>}
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-500">Gestors</span>
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {conversations.filter(c => (c.type as string) === 'gestor' || (c.type as string) === 'admin').length}
                  </span>
                  <span className="text-sm font-medium text-green-600">+1</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-500">Equip</span>
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {conversations.filter(c => c.type === 'company' || (c.type as string) === 'team').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Carregant converses...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: 'flex',
            height: 'calc(100vh - 280px)',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
          }}>

            {/* COLUMNA 1: SIDEBAR IZQUIERDA */}
            {(!isMobile || (!showConversation && !activeConversation)) && (
              <ChatSidebar
                isMobile={isMobile}
                showConversation={showConversation}
                activeConversation={activeConversation}
                currentUser={currentUser}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter as (filter: 'all' | 'starred' | 'muted' | 'archived' | 'gestors' | 'companies' | 'admins') => void}
                totalUnread={totalUnread}
              />
            )}

            {/* COLUMNA 2: LISTA DE CHATS */}
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

            {/* COLUMNA 3: CONVERSACIÓN ACTIVA */}
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
              />
            )}

            {/* Estado vacío cuando no hay conversación activa (desktop) */}
            {!isMobile && !activeConversation && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f2f5',
                textAlign: 'center'
              }}>
                <div style={{ padding: '40px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '12px'
                  }}>
                    Benvingut als Missatges
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#6c757d',
                    marginBottom: '24px'
                  }}>
                    Selecciona una conversa per començar a xatejar
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: '#8e8e93',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>Els missatges estan xifrats de punta a punta</span>
                  </div>
                </div>
              </div>
            )}

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
          </div>
        )}
      </div>
    </div>
  );
}