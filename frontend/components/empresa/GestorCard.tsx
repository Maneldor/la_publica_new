'use client';

import { Mail, Phone, Eye, Calendar } from 'lucide-react';

interface GestorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  cargo: string;
  bio: string;
  expertise: string[];
  assignedDate: Date;
  companies: number;
}

interface GestorCardProps {
  gestor: GestorInfo;
  onSendMessage: () => void;
  onRequestMeeting: () => void;
  onViewProfile: () => void;
}

export default function GestorCard({
  gestor,
  onSendMessage,
  onRequestMeeting,
  onViewProfile,
}: GestorCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-8">
      {/* Badge superior */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
          <span>🤝</span>
          <span>EL TEU GESTOR DE LA PÚBLICA</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={gestor.avatar}
              alt={gestor.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* Información principal */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{gestor.name}</h2>
          <p className="text-blue-700 font-semibold mb-2">{gestor.cargo}</p>
          <p className="text-gray-600 mb-2 flex items-center justify-center lg:justify-start gap-2">
            <Mail className="w-4 h-4" />
            {gestor.email}
          </p>
          {gestor.phone && (
            <p className="text-gray-600 mb-4 flex items-center justify-center lg:justify-start gap-2">
              <Phone className="w-4 h-4" />
              {gestor.phone}
            </p>
          )}

          {/* Bio */}
          <blockquote className="italic text-gray-700 mb-4 max-w-2xl">
            &ldquo;{gestor.bio}&rdquo;
          </blockquote>

          {/* Tags de expertise */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
            {gestor.expertise.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={onSendMessage}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar missatge
            </button>
            <button
              onClick={onRequestMeeting}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Sol·licitar reunió
            </button>
            <button
              onClick={onViewProfile}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Veure perfil
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <span>Assignat des de {formatDate(gestor.assignedDate)}</span>
          <span className="hidden sm:inline">•</span>
          <span>{gestor.companies} empreses gestionades</span>
        </div>
        <div className="text-blue-600 font-medium">
          ✨ Disponible per ajudar-te
        </div>
      </div>
    </div>
  );
}