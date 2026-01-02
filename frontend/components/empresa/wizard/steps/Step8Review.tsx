'use client';

import {
  CheckCircle,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Briefcase,
  Award,
  Users,
  AlertCircle,
} from 'lucide-react';
import { EmpresaFormData } from '../types';

interface Step8ReviewProps {
  formData: EmpresaFormData;
  errors: Record<string, string>;
  onSaveDraft?: () => void;
  onPublish: () => void;
}

export const Step8Review = ({ formData, errors, onSaveDraft, onPublish }: Step8ReviewProps) => {
  const hasErrors = Object.keys(errors).length > 0;

  const completionChecks = [
    { label: 'Informacio basica', completed: !!formData.name && !!formData.cif && !!formData.sector },
    { label: 'Descripcio', completed: !!formData.description },
    { label: 'Email de contacte', completed: !!formData.email },
    { label: 'Adreca', completed: !!formData.address && !!formData.city },
    { label: 'Serveis', completed: (formData.services?.length || 0) > 0 },
  ];

  const completedCount = completionChecks.filter((c) => c.completed).length;
  const completionPercent = Math.round((completedCount / completionChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisio Final</h2>
        <p className="text-gray-600">
          Revisa les dades abans de publicar el perfil
        </p>
      </div>

      {/* Completion status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">Completesa del perfil</span>
          <span className={`font-bold ${completionPercent === 100 ? 'text-green-600' : 'text-amber-600'}`}>
            {completionPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all ${completionPercent === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {completionChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-sm">
              {check.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className={check.completed ? 'text-gray-700' : 'text-amber-600'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Cover & Logo */}
        <div
          className="h-32 relative"
          style={{
            backgroundColor: formData.coverImage ? undefined : (formData.brandColor || '#3B82F6'),
            backgroundImage: formData.coverImage ? `url(${formData.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute -bottom-10 left-6">
            <div
              className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white"
            >
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 pb-6 px-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {formData.name || 'Nom de l\'empresa'}
          </h3>
          <p className="text-gray-500 capitalize mb-4">{formData.sector || 'Sector'}</p>

          {formData.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {formData.description}
            </p>
          )}

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {formData.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                {formData.email}
              </div>
            )}
            {formData.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {formData.phone}
              </div>
            )}
            {formData.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-4 h-4" />
                {formData.website}
              </div>
            )}
            {(formData.city || formData.address) && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {[formData.address, formData.city].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {/* Social */}
          {(formData.linkedin || formData.twitter || formData.instagram || formData.facebook) && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              {formData.linkedin && (
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-4 h-4" />
                </div>
              )}
              {formData.twitter && (
                <div className="w-8 h-8 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center">
                  <Twitter className="w-4 h-4" />
                </div>
              )}
              {formData.instagram && (
                <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
              )}
              {formData.facebook && (
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Services & Specializations */}
      {((formData.services?.length || 0) > 0 || (formData.specializations?.length || 0) > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Serveis i Especialitats
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.services?.map((service: string) => (
              <span key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {service}
              </span>
            ))}
            {formData.specializations?.map((spec: string) => (
              <span key={spec} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {(formData.certifications?.length || 0) > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certificacions ({formData.certifications?.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.certifications?.map((cert) => (
              <span key={cert.id} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {cert.name} {cert.year && `(${cert.year})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team */}
      {(formData.teamMembers?.length || 0) > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equip ({formData.teamMembers?.length})
          </h4>
          <div className="flex flex-wrap gap-3">
            {formData.teamMembers?.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {member.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if incomplete */}
      {completionPercent < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Perfil incomplet</p>
            <p className="text-sm text-amber-700">
              Completa tots els camps recomanats per millorar la visibilitat del teu perfil.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
