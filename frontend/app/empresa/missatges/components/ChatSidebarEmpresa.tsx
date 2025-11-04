'use client';

import { useState } from 'react';
import { Search, Plus, Settings, X } from 'lucide-react';
import { Conversation } from '../types/chatTypes';

interface ChatSidebarEmpresaProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation?: () => void;
  onToggleSidebar: () => void;
  isLoading?: boolean;
  userPlan: 'BÀSIC' | 'ESTÀNDARD' | 'PREMIUM' | 'EMPRESARIAL';
}

export default function ChatSidebarEmpresa({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onNewConversation,
  onToggleSidebar,
  isLoading = false,
  userPlan
}: ChatSidebarEmpresaProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'gestor':
        return '👨‍💼';
      case 'company':
      case 'equip':
        return '👥';
      default:
        return '💬';
    }
  };

  const getConversationTypeBadge = (type: string) => {
    switch (type) {
      case 'gestor':
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Gestor Assignat
          </span>
        );
      case 'company':
      case 'equip':
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Equip
          </span>
        );
      default:
        return null;
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ara mateix';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('ca-ES', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Mostrar restricción de plan BÀSIC
  if (userPlan === 'BÀSIC') {
    return (
      <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Missatges</h2>
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Pla Bàsic
          </div>
        </div>

        {/* Contenido de restricción */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Missatges no disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              La funcionalitat de missatges no està inclosa al pla Bàsic.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Actualitzar pla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Missatges</h2>
          <div className="flex items-center gap-2">
            {onNewConversation && (
              <button
                onClick={onNewConversation}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Nova conversa"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configuració"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicador de plan */}
        <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            userPlan === 'PREMIUM'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
              : userPlan === 'EMPRESARIAL'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {userPlan === 'PREMIUM' && '⭐ '}
            {userPlan === 'EMPRESARIAL' && '👑 '}
            Pla {userPlan}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cercar converses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 mb-2">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No es troben converses' : 'No hi ha converses encara'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 border-r-2 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar with type icon */}
                  <div className="relative">
                    <img
                      src={conversation.avatar || '/images/default-avatar.png'}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-1 shadow-sm">
                      {getConversationTypeIcon(conversation.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name and time */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatLastMessageTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    {/* Type badge */}
                    <div className="mb-2">
                      {getConversationTypeBadge(conversation.type)}
                    </div>

                    {/* Last message */}
                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {truncateMessage(conversation.lastMessage.content)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status indicators */}
                    <div className="flex items-center mt-2 space-x-2">
                      {conversation.isPinned && (
                        <span className="text-yellow-500 text-xs">📌</span>
                      )}
                      {conversation.isMuted && (
                        <span className="text-gray-400 text-xs">🔇</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with company info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p>Missatgeria empresarial</p>
          <p className="mt-1">
            {userPlan !== 'BÀSIC' && `${filteredConversations.length} converses`}
          </p>
        </div>
      </div>
    </div>
  );
}