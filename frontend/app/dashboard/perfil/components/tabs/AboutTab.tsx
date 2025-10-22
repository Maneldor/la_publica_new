'use client';

import { User, Edit, Calendar, MapPin, Briefcase, Globe, GraduationCap, Plus } from 'lucide-react';

interface Education {
  id: string;
  title: string;
  institution: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface AboutData {
  bio: string;
  birthDate: string;
  location: string;
  workplace: string;
  position: string;
  website: string;
  socialNetworks: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

interface Language {
  name: string;
  level: string;
}

interface AboutTabProps {
  aboutData: AboutData;
  education: Education[];
  experience: Experience[];
  skills: string[];
  interests: string[];
  languages: Language[];
}

export default function AboutTab({
  aboutData,
  education,
  experience,
  skills,
  interests,
  languages
}: AboutTabProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
      'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const monthsShort = [
      'gen.', 'feb.', 'març', 'abr.', 'maig', 'juny',
      'jul.', 'ag.', 'set.', 'oct.', 'nov.', 'des.'
    ];
    const month = monthsShort[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Personal Information */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <User style={{ width: '20px', height: '20px' }} />
            Informació Personal
          </h3>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            color: '#374151',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            <Edit style={{ width: '14px', height: '14px' }} />
            Editar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Descripció
            </label>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: '4px 0 0 0',
              lineHeight: '1.5'
            }}>
              {aboutData.bio}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar style={{ width: '12px', height: '12px' }} />
                Data de naixement
              </label>
              <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                {formatDate(aboutData.birthDate)}
              </p>
            </div>

            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <MapPin style={{ width: '12px', height: '12px' }} />
                Ubicació
              </label>
              <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                {aboutData.location}
              </p>
            </div>

            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Briefcase style={{ width: '12px', height: '12px' }} />
                Treball
              </label>
              <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                {aboutData.position} a {aboutData.workplace}
              </p>
            </div>

            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Globe style={{ width: '12px', height: '12px' }} />
                Lloc web
              </label>
              <a href={aboutData.website} target="_blank" rel="noopener noreferrer" style={{
                fontSize: '14px',
                color: '#3b82f6',
                margin: '4px 0 0 0',
                textDecoration: 'none'
              }}>
                {aboutData.website}
              </a>
            </div>
          </div>
        </div>

        {/* Social Networks */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Xarxes Socials
          </h4>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Twitter: <strong>{aboutData.socialNetworks.twitter}</strong>
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              LinkedIn: <strong>{aboutData.socialNetworks.linkedin}</strong>
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Instagram: <strong>{aboutData.socialNetworks.instagram}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Education */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <GraduationCap style={{ width: '20px', height: '20px' }} />
            Formació Acadèmica
          </h3>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            <Plus style={{ width: '14px', height: '14px' }} />
            Afegir
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {education.map((edu) => (
            <div key={edu.id} style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {edu.title}
                </h4>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {edu.startYear} - {edu.endYear}
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#3b82f6',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                {edu.institution}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Briefcase style={{ width: '20px', height: '20px' }} />
            Experiència Professional
          </h3>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            <Plus style={{ width: '14px', height: '14px' }} />
            Afegir
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {experience.map((exp) => (
            <div key={exp.id} style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {exp.position}
                </h4>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {formatDateShort(exp.startDate)} - {exp.endDate === 'Present' ? 'Present' : formatDateShort(exp.endDate)}
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#3b82f6',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                {exp.company}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills and Interests */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 20px 0'
        }}>
          Habilitats i Interessos
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Habilitats
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, index) => (
              <span key={index} style={{
                padding: '4px 12px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Interessos
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {interests.map((interest, index) => (
              <span key={index} style={{
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Idiomes
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {languages.map((lang, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: '#f3e8ff',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#7c3aed'
                }}>
                  {lang.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: '#8b5cf6',
                  backgroundColor: '#ede9fe',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {lang.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}