'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/app/contexts/MessagesContext';
import { X, MessageSquare, ArrowLeft, Send, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ca } from 'date-fns/locale';

interface MessagesCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagesCenter({ isOpen, onClose }: MessagesCenterProps) {
  const {
    conversations,
    isLoading,
    activeConversation,
    messages,
    messagesLoading,
    fetchConversations,
    openConversation,
    closeConversation,
    sendMessage
  } = useMessages();

  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Scroll al final quan arriben nous missatges
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Recarregar converses quan s'obre
  useEffect(() => {
    if (isOpen && !activeConversation) {
      fetchConversations();
    }
  }, [isOpen, activeConversation, fetchConversations]);

  // Tancar al fer clic fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    closeConversation();
    onClose();
  };

  const handleBack = () => {
    closeConversation();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute right-0 top-0 h-full w-full max-w-md pointer-events-auto">
        <div
          ref={panelRef}
          className="h-full bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeConversation ? (
                  <>
                    <button
                      onClick={handleBack}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                      {activeConversation.participant.image ? (
                        <img
                          src={activeConversation.participant.image}
                          alt={activeConversation.participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        {activeConversation.participant.name}
                      </h2>
                      {activeConversation.participant.companyName && (
                        <p className="text-xs text-slate-400">
                          {activeConversation.participant.companyName}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <h2 className="text-lg font-semibold text-white">Missatges</h2>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contingut */}
          <div className="flex-1 overflow-y-auto">
            {activeConversation ? (
              // Vista de missatges
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No hi ha missatges encara</p>
                      <p className="text-sm text-gray-400 mt-1">Envia el primer missatge!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.isOwn
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.isOwn ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                                locale: ca
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Llista de converses
              isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No tens converses</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Les converses amb empreses i gestors apareixeran aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => openConversation(conversation)}
                      className={`w-full p-4 hover:bg-gray-50 transition-colors text-left flex gap-3 ${
                        conversation.unreadCount > 0 ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {conversation.participant.image ? (
                          <img
                            src={conversation.participant.image}
                            alt={conversation.participant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.participant.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="h-5 min-w-[20px] px-1.5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.participant.companyName && (
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.participant.companyName}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: ca
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Input per enviar (només si hi ha conversa activa) */}
          {activeConversation && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escriu un missatge..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer amb link a pàgina completa */}
          {!activeConversation && conversations.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/empresa/missatgeria"
                onClick={handleClose}
                className="block text-center text-sm text-blue-600 hover:underline"
              >
                Veure tots els missatges
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
