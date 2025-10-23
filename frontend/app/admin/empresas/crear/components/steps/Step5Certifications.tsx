'use client';

import { Award, Plus, X, Building } from 'lucide-react';
import { AdminEmpresaFormData, Certification } from '../../hooks/useAdminCreateEmpresa';

interface Step5Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
  addCertification: () => void;
  updateCertification: (id: string, field: keyof Certification, value: any) => void;
  removeCertification: (id: string) => void;
}

export const Step5Certifications = ({
  formData,
  errors,
  updateField,
  addCertification,
  updateCertification,
  removeCertification
}: Step5Props) => {
  const commonCertifications = [
    { name: 'ISO 9001:2015', code: 'ISO 9001', icon: '🏆', description: 'Gestió de la Qualitat' },
    { name: 'ISO 27001:2013', code: 'ISO 27001', icon: '🔒', description: 'Seguretat de la Informació' },
    { name: 'ISO 14001:2015', code: 'ISO 14001', icon: '🌱', description: 'Gestió Ambiental' },
    { name: 'Esquema Nacional de Seguretat', code: 'ENS', icon: '🛡️', description: 'Seguretat TIC' },
    { name: 'RGPD / LOPD-GDD', code: 'RGPD', icon: '🔐', description: 'Protecció de Dades' },
    { name: 'UNE 166002', code: 'UNE 166002', icon: '💡', description: 'Gestió d\'I+D+i' },
  ];

  const publicSectors = [
    'Administració Local',
    'Diputacions',
    'Generalitat',
    'Administració Central',
    'Educació',
    'Salut',
    'Justícia',
    'Seguretat',
    'Transports',
    'Habitatge',
    'Turisme',
    'Agricultura',
    'Medi Ambient',
    'Cultura',
    'Esports',
    'Serveis Socials'
  ];

  const addQuickCertification = (cert: typeof commonCertifications[0]) => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: cert.name,
      code: cert.code,
      year: new Date().getFullYear().toString(),
      icon: cert.icon,
    };
    updateField('certifications', [...formData.certifications, newCert]);
  };

  const togglePublicSector = (sector: string) => {
    const currentSectors = formData.publicSectors || [];
    if (currentSectors.includes(sector)) {
      updateField('publicSectors', currentSectors.filter(s => s !== sector));
    } else {
      updateField('publicSectors', [...currentSectors, sector]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Certificacions i Sectors
        </h2>
        <p className="text-gray-600">
          Afegeix les certificacions que demostren la qualitat i els sectors públics on treballeu
        </p>
      </div>

      {/* Certifications Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Award className="w-4 h-4 inline mr-2" />
          Certificacions de l'Empresa
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Les certificacions demostren el compromís amb la qualitat i els estàndards professionals
        </p>

        {/* Quick Add Common Certifications */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Certificacions Habituals:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonCertifications.map((cert) => (
              <button
                key={cert.code}
                type="button"
                onClick={() => addQuickCertification(cert)}
                className="flex items-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
              >
                <span className="text-xl mr-3">{cert.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{cert.name}</div>
                  <div className="text-xs text-gray-500">{cert.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Certifications List */}
        <div className="space-y-4">
          {formData.certifications.map((cert) => (
            <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-16">
                  <select
                    value={cert.icon}
                    onChange={(e) => updateCertification(cert.id, 'icon', e.target.value)}
                    className="w-full text-2xl text-center border border-gray-300 rounded-lg p-1"
                  >
                    <option value="🏆">🏆</option>
                    <option value="🔒">🔒</option>
                    <option value="🌱">🌱</option>
                    <option value="🛡️">🛡️</option>
                    <option value="🔐">🔐</option>
                    <option value="💡">💡</option>
                    <option value="📜">📜</option>
                    <option value="⭐">⭐</option>
                    <option value="🎯">🎯</option>
                  </select>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nom de la Certificació
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                      placeholder="Ex: ISO 9001:2015"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Codi
                    </label>
                    <input
                      type="text"
                      value={cert.code}
                      onChange={(e) => updateCertification(cert.id, 'code', e.target.value)}
                      placeholder="Ex: ISO 9001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Any d'Obtenció
                    </label>
                    <select
                      value={cert.year}
                      onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCertification(cert.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCertification}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
          >
            <Plus className="w-5 h-5" />
            Afegir Certificació
          </button>
        </div>
      </div>

      {/* Public Sectors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Building className="w-4 h-4 inline mr-2" />
          Sectors Públics on Treballeu *
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Seleccioneu els àmbits de l'administració pública on teniu experiència (mínim 1)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {publicSectors.map((sector) => {
            const isSelected = formData.publicSectors?.includes(sector) || false;
            return (
              <label
                key={sector}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-all border-2
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePublicSector(sector)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3"
                />
                <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                  {sector}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            {errors.publicSectors && (
              <p className="text-sm text-red-600">{errors.publicSectors}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.publicSectors?.length || 0} sectors seleccionats
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 font-medium mb-2">
          🏅 Importància de les Certificacions:
        </p>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Les certificacions ISO demostren compromís amb la qualitat</li>
          <li>• L'ENS és fonamental per projectes tecnològics públics</li>
          <li>• El compliment RGPD és obligatori per gestionar dades</li>
          <li>• Especifiqueu els sectors on teniu més experiència</li>
        </ul>
      </div>
    </div>
  );
};