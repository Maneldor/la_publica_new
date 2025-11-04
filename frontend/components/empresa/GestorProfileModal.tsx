'use client';

import { X, Mail, Phone, Calendar, Users, Award, Clock } from 'lucide-react';

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

interface GestorProfileModalProps {
  gestor: GestorInfo;
  isOpen: boolean;
  onClose: () => void;
}

export default function GestorProfileModal({
  gestor,
  isOpen,
  onClose,
}: GestorProfileModalProps) {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock data extendida del gestor
  const extendedInfo = {
    experience: '5+ anys',
    education: 'Màster en Recursos Humans - UB',
    languages: ['Català', 'Castellà', 'Anglès'],
    schedule: 'Dilluns a Divendres, 9:00 - 18:00',
    responseTime: '< 2 hores',
    successCases: [
      'Ha ajudat a 25+ empreses a millorar el seu employer branding',
      'Especialista en contractació de perfils tecnològics',
      'Reducció mitjana del 40% en temps de contractació'
    ],
    services: [
      'Consultoria estratègica de talent',
      'Optimització de perfils d\'empresa',
      'Formació en processos de selecció',
      'Anàlisi de mercat laboral sectorial'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Perfil del Gestor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0 text-center md:text-left">
              <img
                src={gestor.avatar}
                alt={gestor.name}
                className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg object-cover mx-auto md:mx-0"
              />
              <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-900">{gestor.name}</h3>
                <p className="text-blue-700 font-semibold">{gestor.cargo}</p>
                <p className="text-gray-600 text-sm mt-2">{extendedInfo.experience} d'experiència</p>
              </div>
            </div>

            <div className="flex-1">
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{gestor.email}</span>
                </div>
                {gestor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{gestor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{extendedInfo.schedule}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Temps de resposta: {extendedInfo.responseTime}</span>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Sobre mi</h4>
                <p className="text-gray-700 italic">&ldquo;{gestor.bio}&rdquo;</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{gestor.companies}</div>
                  <div className="text-sm text-blue-700">Empreses gestionades</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">25+</div>
                  <div className="text-sm text-green-700">Casos d'èxit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Especialitzacions</h4>
            <div className="flex flex-wrap gap-2">
              {gestor.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Success Cases */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Casos d'èxit destacats</h4>
            <ul className="space-y-2">
              {extendedInfo.successCases.map((case_item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{case_item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Serveis que ofereixo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extendedInfo.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600">•</span>
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Idiomes</h4>
              <div className="space-y-2">
                {extendedInfo.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-gray-700">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Formació</h4>
              <p className="text-gray-700">{extendedInfo.education}</p>
            </div>
          </div>

          {/* Assignment Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Informació d'assignació</h4>
            <p className="text-blue-800 text-sm">
              Assignat com el teu gestor des del {formatDate(gestor.assignedDate)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
}