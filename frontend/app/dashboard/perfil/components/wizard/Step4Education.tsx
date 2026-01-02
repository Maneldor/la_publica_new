'use client';

import { GraduationCap, Plus, X } from 'lucide-react';

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

interface Step4Props {
  data: {
    education: Education[];
  };
  addEducation: (education: Omit<Education, 'id'>) => Promise<Education | null>;
  updateEducation: (id: string, updates: Partial<Education>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  isSaving: boolean;
}

export const Step4Education = ({
  data,
  addEducation,
  updateEducation,
  deleteEducation,
  isSaving
}: Step4Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 5 }, (_, i) => currentYear + 4 - i);

  // Protecció contra data undefined
  const education = data?.education || [];

  const commonDegrees = [
    'Grau en Administració i Direcció d\'Empreses',
    'Grau en Dret',
    'Grau en Economia',
    'Grau en Ciències Polítiques',
    'Grau en Enginyeria Informàtica',
    'Grau en Psicologia',
    'Màster en Administració Pública',
    'Màster en Transformació Digital',
    'Màster en Gestió Pública',
    'Postgrau en Innovació Pública',
    'Doctorat (PhD)',
    'Formació Professional (FP)',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--Step4Education-title-color, #111827)',
          marginBottom: '8px'
        }}>
          Formació Acadèmica
        </h2>
        <p style={{ color: 'var(--Step4Education-description-color, #4b5563)' }}>
          Afegeix els teus estudis, títols i certificacions per mostrar la teva preparació professional
        </p>
      </div>

      {/* Education List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {education.map((edu, index) => (
          <div key={edu.id} style={{
            backgroundColor: 'var(--Step4Education-card-bg, #ffffff)',
            border: '1px solid var(--Step4Education-card-border, #e5e7eb)',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--Step4Education-icon-bg, #dbeafe)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap style={{ width: '20px', height: '20px', color: 'var(--Step4Education-icon-color, #2563eb)' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--Step4Education-card-title, #111827)' }}>
                  Estudi #{index + 1}
                </h3>
              </div>
              <button
                onClick={() => edu.id && deleteEducation(edu.id)}
                style={{
                  padding: '8px',
                  color: 'var(--Step4Education-delete-color, #ef4444)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Title */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--Step4Education-label-color, #374151)',
                  marginBottom: '8px'
                }}>
                  Títol / Nom de l'Estudi *
                </label>
                <input
                  type="text"
                  value={edu.degree || ''}
                  onChange={(e) => {
                    if (edu.id) {
                      updateEducation(edu.id, { degree: e.target.value });
                    }
                  }}
                  placeholder="Ex: Màster en Administració i Direcció d'Empreses (MBA)"
                  list={`degrees-${edu.id}`}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--Step4Education-input-border, #d1d5db)',
                    color: 'var(--Step4Education-input-text, #111827)',
                    backgroundColor: 'var(--Step4Education-input-bg, #ffffff)',
                    transition: 'all 0.2s'
                  }}
                />
                <datalist id={`degrees-${edu.id}`}>
                  {commonDegrees.map((degree) => (
                    <option key={degree} value={degree} />
                  ))}
                </datalist>
              </div>

              {/* Institution */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--Step4Education-label-color, #374151)',
                  marginBottom: '8px'
                }}>
                  Institució / Universitat *
                </label>
                <input
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => {
                    if (edu.id) {
                      updateEducation(edu.id, { institution: e.target.value });
                    }
                  }}
                  placeholder="Ex: Universitat Pompeu Fabra"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--Step4Education-input-border, #d1d5db)',
                    color: 'var(--Step4Education-input-text, #111827)',
                    backgroundColor: 'var(--Step4Education-input-bg, #ffffff)',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              {/* Specialization */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--Step4Education-label-color, #374151)',
                  marginBottom: '8px'
                }}>
                  Especialització / Descripció
                </label>
                <input
                  type="text"
                  value={edu.field || ''}
                  onChange={(e) => {
                    if (edu.id) {
                      updateEducation(edu.id, { field: e.target.value });
                    }
                  }}
                  placeholder="Ex: Especialització en Gestió Pública"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--Step4Education-input-border, #d1d5db)',
                    color: 'var(--Step4Education-input-text, #111827)',
                    backgroundColor: 'var(--Step4Education-input-bg, #ffffff)',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              {/* Years */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--Step4Education-label-color, #374151)',
                  marginBottom: '8px'
                }}>
                  Any d'Inici
                </label>
                <select
                  value={edu.startYear}
                  onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--Step4Education-input-border, #d1d5db)',
                    color: 'var(--Step4Education-input-text, #111827)',
                    backgroundColor: 'var(--Step4Education-input-bg, #ffffff)',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="">Selecciona l'any</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--Step4Education-label-color, #374151)',
                  marginBottom: '8px'
                }}>
                  Any de Fi
                </label>
                <select
                  value={edu.endYear}
                  onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--Step4Education-input-border, #d1d5db)',
                    color: 'var(--Step4Education-input-text, #111827)',
                    backgroundColor: 'var(--Step4Education-input-bg, #ffffff)',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="">Selecciona l'any</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Add Education Button */}
        <button
          onClick={addEducation}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            border: '2px dashed var(--Step4Education-add-border, #d1d5db)',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: 'var(--Step4Education-add-text, #4b5563)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Afegir Formació Acadèmica
        </button>
      </div>

      {/* Quick Add Suggestions */}
      {education.length === 0 && (
        <div style={{
          backgroundColor: 'var(--Step4Education-suggestions-bg, #f9fafb)',
          border: '1px solid var(--Step4Education-suggestions-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step4Education-suggestions-title, #111827)',
            marginBottom: '12px'
          }}>
            Exemples de formació habitual en l'administració pública:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              'Grau en Administració i Direcció d\'Empreses',
              'Grau en Dret',
              'Màster en Administració Pública',
              'Màster en Transformació Digital',
              'Postgrau en Innovació Pública',
              'Grau en Ciències Polítiques'
            ].map((degree) => (
              <button
                key={degree}
                onClick={() => {
                  addEducation({
                    institution: '',
                    degree: degree,
                    isCurrent: false
                  });
                }}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  backgroundColor: 'var(--Step4Education-suggestion-bg, #ffffff)',
                  border: '1px solid var(--Step4Education-suggestion-border, #e5e7eb)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--Step4Education-suggestion-text, #374151)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {degree}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{
        backgroundColor: 'var(--Step4Education-tips-bg, #eff6ff)',
        border: '1px solid var(--Step4Education-tips-border, #bfdbfe)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--Step4Education-tips-title, #1e40af)',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          Consells per afegir la formació:
        </p>
        <ul style={{
          fontSize: '14px',
          color: 'var(--Step4Education-tips-text, #1d4ed8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          margin: 0,
          paddingLeft: '0',
          listStyle: 'none'
        }}>
          <li>• Inclou títols oficials, postgraus, màsters i certificacions rellevants</li>
          <li>• Especifica l'especialització si és aplicable</li>
          <li>• Afegeix la formació més recent primer</li>
          <li>• No oblidis certificacions professional o cursos importants</li>
          <li>• Pots deixar l'any de fi en blanc si encara estàs estudiant</li>
        </ul>
      </div>

      {/* Education Summary */}
      {education.length > 0 && (
        <div style={{
          backgroundColor: 'var(--Step4Education-summary-bg, #f0fdf4)',
          border: '1px solid var(--Step4Education-summary-border, #bbf7d0)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step4Education-summary-title, #166534)',
            marginBottom: '8px'
          }}>
            Resum de la teva formació:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {education.map((edu, index) => (
              <div key={edu.id} style={{ fontSize: '14px', color: 'var(--Step4Education-summary-text, #15803d)' }}>
                <strong>{index + 1}.</strong> {edu.title || 'Títol pendent'}
                {edu.institution && ` - ${edu.institution}`}
                {edu.startYear && edu.endYear && ` (${edu.startYear}-${edu.endYear})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};