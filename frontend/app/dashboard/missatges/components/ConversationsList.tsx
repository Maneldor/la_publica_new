'use client';

import Image from 'next/image';
import { Conversation, CurrentUser } from '../types/chatTypes';
import { Pin, BellOff, Camera, Paperclip, Mic, MessageCircle, User as UserIcon, Tag, Package } from 'lucide-react';

interface ConversationsListProps {
  isMobile: boolean;
  showConversation: boolean;
  filteredConversations: Conversation[];
  activeConversation: Conversation | null;
  currentUser: CurrentUser;
  openConversation: (conversation: Conversation) => void;
  formatTime: (date: Date | string) => string;
}

export function ConversationsList({
  isMobile,
  showConversation,
  filteredConversations,
  activeConversation,
  currentUser,
  openConversation,
  formatTime
}: ConversationsListProps) {
  return (
    <div className={`${isMobile ? 'w-full' : 'w-[350px]'} bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header lista de chats */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Missatges
          </h2>
          <select className="px-3 py-2 pr-8 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer appearance-none bg-no-repeat focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-400 transition-colors"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px'
            }}
          >
            <option value="recent">Recents</option>
            <option value="unread">No llegits</option>
            <option value="starred">Destacats</option>
          </select>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            // Obtenir l'altre participant (excloent l'usuari actual)
            const otherParticipant = conv.participants?.find(p => p.id !== currentUser.id);

            // Obtenir nom i avatar de la conversa
            const convName = conv.name || conv.title ||
              (otherParticipant ?
                (otherParticipant.firstName && otherParticipant.lastName
                  ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                  : otherParticipant.name || otherParticipant.nick || 'Usuari')
                : 'Conversa');

            const convAvatar = conv.avatar || otherParticipant?.image || otherParticipant?.avatar || null;
            const isActive = activeConversation?.id === conv.id;

            // Determinar si és una conversa sobre un anunci
            const isAnuncioConversation = !!conv.anuncio;

            return (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar real del participant */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {convAvatar ? (
                        <Image
                          src={convAvatar}
                          alt={convName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                          {convName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Indicador online */}
                    {conv.type === 'individual' && otherParticipant?.isOnline && (
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {convName}
                        </span>
                        {conv.isPinned && <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                        {conv.isMuted && <BellOff className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conv.lastMessage && formatTime(conv.lastMessage.timestamp)}
                      </span>
                    </div>

                    {/* Subject de l'anunci si existeix */}
                    {isAnuncioConversation && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Tag className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        <span className="text-xs text-indigo-600 font-medium truncate">
                          Re: {conv.anuncio?.title}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 truncate flex-1 mr-2">
                        {conv.lastMessage && (
                          <span className="flex items-center gap-1">
                            {conv.lastMessage.senderId === currentUser.id && (
                              <span className={conv.lastMessage.status === 'read' ? 'text-indigo-500' : 'text-gray-400'}>
                                {conv.lastMessage.status === 'read' ? '✓✓' :
                                 conv.lastMessage.status === 'delivered' ? '✓✓' : '✓'}
                              </span>
                            )}
                            {conv.lastMessage.type === 'image' && <Camera className="w-3 h-3 inline" />}
                            {conv.lastMessage.type === 'document' && <Paperclip className="w-3 h-3 inline" />}
                            {conv.lastMessage.type === 'audio' && <Mic className="w-3 h-3 inline" />}
                            <span className="truncate">{conv.lastMessage.content}</span>
                          </span>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold min-w-[20px] text-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-gray-500">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hi ha converses
            </h3>
            <p className="text-sm">
              Comença una nova conversa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
