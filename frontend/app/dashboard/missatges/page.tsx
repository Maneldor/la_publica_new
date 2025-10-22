'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { User, Message, Conversation } from './types/chatTypes';
import { currentUser, sampleConversations, sampleMessages } from './data/chatData';
import { EmojiPicker } from './components/EmojiPicker';
import { ChatWindow } from './components/ChatWindow';
import { ConversationsList } from './components/ConversationsList';
import { ChatSidebar } from './components/ChatSidebar';


export default function MissatgesPage() {
  // Estados
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(sampleConversations[0]);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatTerm, setSearchInChatTerm] = useState('');
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);

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

  const sendMessage = () => {
    if (!messageText.trim() && !replyingTo) return;

    const newMessage: Message = {
      id: messages.length + 1,
      conversationId: activeConversation?.id || 1,
      senderId: currentUser.id,
      content: messageText,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo?.id
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
    setReplyingTo(null);

    // Simular cambio de estado del mensaje
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);

    // Actualizar última conversación
    if (activeConversation) {
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation.id
          ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
          : conv
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

  const togglePin = (conversationId: number) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  const toggleMute = (conversationId: number) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
    ));
  };

  const archiveConversation = (conversationId: number) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: true } : conv
    ));
  };

  const deleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const starMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  // Filtrar conversaciones
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Aplicar filtro de categoría
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

  const statsData = [
    { label: 'Converses Actives', value: conversations.filter(c => !c.isArchived).length.toString(), trend: '+3' },
    { label: 'Missatges No Llegits', value: totalUnread.toString(), trend: totalUnread > 0 ? '!' : '' },
    { label: 'Grups', value: conversations.filter(c => c.type === 'group').length.toString(), trend: '' },
    { label: 'Arxivats', value: conversations.filter(c => c.isArchived).length.toString(), trend: '' }
  ];

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    if (isMobile) {
      setShowConversation(true);
    }
    // Marcar como leídos
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const closeConversation = () => {
    if (isMobile) {
      setShowConversation(false);
    }
  };

  return (
    <PageTemplate
      title="Missatges"
      subtitle="Sistema de missatgeria instantània"
      statsData={statsData}
    >
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 280px)',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        overflow: 'hidden',
        margin: '0 24px 24px 24px',
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
            setActiveFilter={setActiveFilter}
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
              <div style={{ fontSize: '72px', marginBottom: '24px' }}>💬</div>
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
                <span>🔒</span>
                <span>Els missatges estan xifrats de punta a punta</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </PageTemplate>
  );
}