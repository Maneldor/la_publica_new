'use client';

import { Users, Plus, X, Upload, Linkedin, Twitter, Facebook } from 'lucide-react';
import { AdminEmpresaFormData, TeamMember } from '../../hooks/useAdminCreateEmpresa';

interface Step6Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: <K extends keyof AdminEmpresaFormData>(field: K, value: AdminEmpresaFormData[K]) => void;
  addTeamMember: () => void;
  updateTeamMember: <K extends keyof TeamMember>(id: string, field: K, value: TeamMember[K]) => void;
  removeTeamMember: (id: string) => void;
}

export const Step6Team = ({
  formData,
  errors,
  updateField,
  addTeamMember,
  updateTeamMember,
  removeTeamMember
}: Step6Props) => {

  const commonPositions = [
    'CEO / Director General',
    'CTO / Director Tecnològic',
    'CFO / Director Financer',
    'COO / Director Operacions',
    'Directora Comercial',
    'Director de Projectes',
    'Cap de Desenvolupament',
    'Responsable de Qualitat',
    'Consultora Senior',
    'Arquitecte de Solucions',
    'Responsable de Recursos Humans',
    'Coordinadora de Projectes'
  ];

  const handlePhotoUpload = (memberId: string, file: File) => {
    if (file && file.type.startsWith('image/')) {
      updateTeamMember(memberId, 'photo', file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      updateTeamMember(memberId, 'photoUrl', url);
    }
  };

  const removePhoto = (memberId: string) => {
    const member = formData.teamMembers.find(m => m.id === memberId);
    if (member?.photoUrl) {
      URL.revokeObjectURL(member.photoUrl);
    }
    updateTeamMember(memberId, 'photo', null);
    updateTeamMember(memberId, 'photoUrl', '');
  };

  const updateSocialMedia = (platform: string, value: string) => {
    updateField('socialMedia', {
      ...formData.socialMedia,
      [platform]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Equip i Xarxes Socials
        </h2>
        <p className="text-gray-600">
          Presenta l'equip de l'empresa i les xarxes socials per generar més confiança
        </p>
      </div>

      {/* Team Members */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Users className="w-4 h-4 inline mr-2" />
          Membres de l'Equip
        </label>
        <p className="text-sm text-gray-500 mb-6">
          Afegeix els membres clau de l'equip per mostrar l'experiència i professionalitat de l'empresa
        </p>

        <div className="space-y-4">
          {formData.teamMembers.map((member, index) => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-6">
                {/* Photo Upload */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200 relative">
                    {member.photoUrl ? (
                      <>
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(member.id)}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handlePhotoUpload(member.id, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">Foto</p>
                </div>

                {/* Member Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                      placeholder="Ex: Maria García López"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors[`teamMember_${index}_name`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`teamMember_${index}_name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Càrrec
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) => updateTeamMember(member.id, 'position', e.target.value)}
                        placeholder="Ex: Directora Comercial"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        list={`positions-${member.id}`}
                      />
                      <datalist id={`positions-${member.id}`}>
                        {commonPositions.map((position) => (
                          <option key={position} value={position} />
                        ))}
                      </datalist>
                    </div>
                    {errors[`teamMember_${index}_position`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`teamMember_${index}_position`]}</p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTeamMember}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
          >
            <Plus className="w-5 h-5" />
            Afegir Membre de l'Equip
          </button>
        </div>
      </div>

      {/* Social Media */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Xarxes Socials de l'Empresa
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Afegeix els perfils de xarxes socials per millorar la credibilitat i visibilitat
        </p>

        <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
          {/* LinkedIn */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">LinkedIn</span>
            </div>
            <input
              type="url"
              value={formData.socialMedia.linkedin || ''}
              onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/empresa"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Twitter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-700">Twitter / X</span>
            </div>
            <input
              type="url"
              value={formData.socialMedia.twitter || ''}
              onChange={(e) => updateSocialMedia('twitter', e.target.value)}
              placeholder="https://twitter.com/empresa"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Facebook */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <Facebook className="w-5 h-5 text-blue-800" />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </div>
            <input
              type="url"
              value={formData.socialMedia.facebook || ''}
              onChange={(e) => updateSocialMedia('facebook', e.target.value)}
              placeholder="https://facebook.com/empresa"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Related Companies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Empreses Col·laboradores (Opcional)
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Menciona empreses amb les quals col·laboreu habitualment
        </p>

        <textarea
          value={formData.relatedCompanies.join(', ')}
          onChange={(e) => {
            const companies = e.target.value.split(',').map(c => c.trim()).filter(c => c);
            updateField('relatedCompanies', companies);
          }}
          placeholder="Ex: Microsoft, IBM, Oracle, SAP (separades per comes)"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separeu els noms d'empresa amb comes
        </p>
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-800 font-medium mb-2">
          👥 Consells per l'Equip i Xarxes:
        </p>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Les fotos professionals generen més confiança</li>
          <li>• Especifica càrrecs clars i reconeixibles</li>
          <li>• LinkedIn és especialment valorat en l'àmbit professional</li>
          <li>• Les col·laboracions amb grans empreses afegeixen credibilitat</li>
          <li>• No cal afegir tot l'equip, només els membres clau</li>
        </ul>
      </div>
    </div>
  );
};