'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Participant {
  id: string;
  name: string;
  image: string | null;
  role: string;
  companyName: string | null;
}

interface Conversation {
  id: string;
  title: string;
  participant: Participant;
  lastMessage: string | null;
  lastMessageAt: Date;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  createdAt: Date;
  isOwn: boolean;
}

interface MessagesContextType {
  conversations: Conversation[];
  totalUnread: number;
  isLoading: boolean;
  activeConversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  fetchConversations: () => Promise<void>;
  openConversation: (conversation: Conversation) => Promise<void>;
  closeConversation: () => void;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/empresa/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        setTotalUnread(data.totalUnread || 0);
      }
    } catch (error) {
      console.error('Error carregant converses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setMessagesLoading(true);

    try {
      const response = await fetch(`/api/empresa/messages?conversationId=${conversation.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Actualitzar comptador local
        if (conversation.unreadCount > 0) {
          setConversations(prev =>
            prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
          );
          setTotalUnread(prev => Math.max(0, prev - conversation.unreadCount));
        }
      }
    } catch (error) {
      console.error('Error carregant missatges:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!activeConversation || !content.trim()) return false;

    try {
      const response = await fetch('/api/empresa/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);

        // Actualitzar últim missatge a la llista
        setConversations(prev =>
          prev.map(c => c.id === activeConversation.id
            ? { ...c, lastMessage: content, lastMessageAt: new Date() }
            : c
          )
        );

        return true;
      }
    } catch (error) {
      console.error('Error enviant missatge:', error);
    }

    return false;
  }, [activeConversation]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch('/api/empresa/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
    } catch (error) {
      console.error('Error marcant com a llegit:', error);
    }
  }, []);

  // Carregar converses inicialment
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Polling cada 30 segons
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/empresa/messages');
        if (response.ok) {
          const data = await response.json();
          setTotalUnread(data.totalUnread || 0);
          // Actualitzar converses si el panel està tancat
          if (!activeConversation) {
            setConversations(data.conversations || []);
          }
        }
      } catch (error) {
        console.error('Error actualitzant missatges:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        totalUnread,
        isLoading,
        activeConversation,
        messages,
        messagesLoading,
        fetchConversations,
        openConversation,
        closeConversation,
        sendMessage,
        markAsRead
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
}
