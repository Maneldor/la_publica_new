'use client';

import { Users, Plus, Trash2, Mail, Phone, Linkedin, User } from 'lucide-react';
import { TeamStepProps, TeamMember } from '../types';

export const Step7Team = ({
  formData,
  errors,
  updateField,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
}: TeamStepProps) => {
  const teamMembers = formData.teamMembers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Equip</h2>
        <p className="text-gray-600">
          Presenta les persones clau de la teva empresa
        </p>
      </div>

      {/* Lista de miembros */}
      <div className="space-y-4">
        {teamMembers.map((member: TeamMember, index: number) => (
          <div
            key={member.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {member.name?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {member.name || `Membre ${index + 1}`}
                  </span>
                  {member.role && (
                    <p className="text-sm text-gray-500">{member.role}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeTeamMember(member.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                  placeholder="Joan Garcia"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrec *
                </label>
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                  placeholder="Director/a General"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                  placeholder="joan@empresa.cat"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Telefon (opcional)
                </label>
                <input
                  type="tel"
                  value={member.phone || ''}
                  onChange={(e) => updateTeamMember(member.id, 'phone', e.target.value)}
                  placeholder="600 123 456"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Linkedin className="w-3.5 h-3.5 inline mr-1" />
                  LinkedIn (opcional)
                </label>
                <input
                  type="url"
                  value={member.linkedin || ''}
                  onChange={(e) => updateTeamMember(member.id, 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/joangarcia"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {teamMembers.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No hi ha membres de l'equip</p>
            <p className="text-sm text-gray-400">
              Afegeix les persones clau per humanitzar la teva empresa
            </p>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={addTeamMember}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Afegir membre de l'equip
      </button>

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Mostrar l'equip ajuda a generar confianca i a humanitzar la teva empresa.
          Recomanem afegir almenys la persona de contacte principal.
        </p>
      </div>
    </div>
  );
};
