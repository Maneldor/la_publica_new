'use client'

import {
  User,
  Mail,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Share2,
  Lock,
  Eye,
  Check
} from 'lucide-react'
import type { UserBasicInfoFormData } from '@/components/forms/UserBasicInfoForm'

interface PersonalData {
  bio?: string
  headline?: string
  city?: string
  province?: string
  organization?: string
  department?: string
  position?: string
  professionalGroup?: string
  phone?: string
}

interface SocialData {
  linkedin?: string
  twitter?: string
  github?: string
  website?: string
}

interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear?: string
  current: boolean
}

interface ExperienceItem {
  id: string
  organization: string
  position: string
  department?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

interface SkillItem {
  id: string
  name: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  category: string
}

interface LanguageItem {
  id: string
  language: string
  level: string
}

interface UserData {
  basic: UserBasicInfoFormData | null
  personal: PersonalData
  social: SocialData
  education: EducationItem[]
  experience: ExperienceItem[]
  skills: SkillItem[]
  languages: LanguageItem[]
}

interface Step8ReviewProps {
  userData: UserData
}

function SectionCard({
  title,
  icon: Icon,
  children,
  isEmpty = false,
  emptyText = 'No s\'ha afegit informació'
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  isEmpty?: boolean
  emptyText?: string
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h4 className="font-medium text-gray-900">{title}</h4>
        {!isEmpty && <Check className="w-4 h-4 text-green-500 ml-auto" />}
      </div>
      <div className="p-4">
        {isEmpty ? (
          <p className="text-sm text-gray-400 italic">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 ml-2">
      <Lock className="w-3 h-3" />
      Privat
    </span>
  )
}

export default function Step8Review({ userData }: Step8ReviewProps) {
  const { basic, personal, social, education, experience, skills, languages } = userData

  const getAdministrationLabel = (admin: string) => {
    switch (admin) {
      case 'LOCAL': return 'Administració Local'
      case 'AUTONOMICA': return 'Administració Autonòmica'
      case 'CENTRAL': return 'Administració Central'
      default: return admin
    }
  }

  const getDisplayPreferenceLabel = (pref: string) => {
    switch (pref) {
      case 'NICK': return 'Nick (@usuari)'
      case 'NOM': return 'Només nom'
      case 'NOM_COGNOM': return 'Nom i cognom'
      default: return pref
    }
  }

  const getLanguageLabel = (langValue: string) => {
    const langs: Record<string, string> = {
      catala: 'Català',
      castella: 'Castellà',
      angles: 'Anglès',
      frances: 'Francès',
      alemany: 'Alemany',
      italia: 'Italià',
      portugues: 'Portuguès',
      aranès: 'Aranès',
      xinès: 'Xinès',
      àrab: 'Àrab',
      rus: 'Rus',
      japonès: 'Japonès',
      altres: 'Altres'
    }
    return langs[langValue] || langValue
  }

  if (!basic) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No hi ha dades per revisar.</p>
          <p className="text-sm text-gray-400 mt-2">Torna al pas 1 per introduir les dades bàsiques.</p>
        </div>
      </div>
    )
  }

  const fullName = `${basic.firstName} ${basic.lastName} ${basic.secondLastName || ''}`.trim()

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Revisió Final</h3>
        <p className="text-sm text-gray-500">
          Revisa tota la informació abans de crear l&apos;usuari
        </p>
      </div>

      {/* Resumen del usuario */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
            {basic.firstName.charAt(0)}{basic.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-indigo-600 font-medium">@{basic.nick}</p>
            {personal.headline && (
              <p className="text-sm text-gray-600 mt-1">{personal.headline}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Datos básicos */}
        <SectionCard title="Dades Bàsiques" icon={User}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nick:</span>
              <span className="font-medium">@{basic.nick}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nom complet:</span>
              <span className="font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{basic.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Administració:</span>
              <span className="font-medium">{getAdministrationLabel(basic.administration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Visualització:
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 ml-1">
                  <Eye className="w-3 h-3" />
                </span>
              </span>
              <span className="font-medium">{getDisplayPreferenceLabel(basic.displayPreference)}</span>
            </div>
          </div>
        </SectionCard>

        {/* Información personal */}
        <SectionCard
          title="Informació Personal"
          icon={Briefcase}
          isEmpty={!personal.bio && !personal.city && !personal.organization}
        >
          <div className="space-y-2 text-sm">
            {personal.bio && (
              <div>
                <span className="text-gray-500">Bio:</span>
                <p className="text-gray-900 mt-1">{personal.bio}</p>
              </div>
            )}
            {(personal.city || personal.province) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{[personal.city, personal.province].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {personal.organization && (
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Organització:
                  <PrivateBadge />
                </span>
                <span className="font-medium">{personal.organization}</span>
              </div>
            )}
            {personal.position && (
              <div className="flex justify-between">
                <span className="text-gray-500">Càrrec:<PrivateBadge /></span>
                <span className="font-medium">{personal.position}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Redes sociales */}
        <SectionCard
          title="Xarxes Socials"
          icon={Share2}
          isEmpty={!social.linkedin && !social.twitter && !social.github && !social.website}
        >
          <div className="space-y-2 text-sm">
            {social.linkedin && (
              <div className="flex justify-between">
                <span className="text-gray-500">LinkedIn:</span>
                <span className="font-medium">linkedin.com/in/{social.linkedin}</span>
              </div>
            )}
            {social.twitter && (
              <div className="flex justify-between">
                <span className="text-gray-500">Twitter:</span>
                <span className="font-medium">@{social.twitter}</span>
              </div>
            )}
            {social.github && (
              <div className="flex justify-between">
                <span className="text-gray-500">GitHub:</span>
                <span className="font-medium">github.com/{social.github}</span>
              </div>
            )}
            {social.website && (
              <div className="flex justify-between">
                <span className="text-gray-500">Web:</span>
                <span className="font-medium">{social.website}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Formación */}
        <SectionCard
          title={`Formació (${education.length})`}
          icon={GraduationCap}
          isEmpty={education.length === 0}
        >
          <div className="space-y-3">
            {education.map((item, i) => (
              <div key={item.id} className={i > 0 ? 'pt-3 border-t border-gray-100' : ''}>
                <p className="font-medium text-gray-900">{item.institution}</p>
                <p className="text-sm text-gray-600">{item.degree} - {item.field}</p>
                <p className="text-xs text-gray-400">
                  {item.startYear} - {item.current ? 'Actual' : item.endYear}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Experiencia */}
        <SectionCard
          title={`Experiència (${experience.length})`}
          icon={Building2}
          isEmpty={experience.length === 0}
        >
          <div className="space-y-3">
            {experience.map((item, i) => (
              <div key={item.id} className={i > 0 ? 'pt-3 border-t border-gray-100' : ''}>
                <p className="font-medium text-gray-900">{item.position}</p>
                <p className="text-sm text-gray-600">{item.organization}</p>
                <p className="text-xs text-gray-400">
                  {item.startDate} - {item.current ? 'Actual' : item.endDate}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Habilidades */}
        <SectionCard
          title={`Habilitats (${skills.length})`}
          icon={Sparkles}
          isEmpty={skills.length === 0}
        >
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Idiomas */}
        <SectionCard
          title={`Idiomes (${languages.length})`}
          icon={Languages}
          isEmpty={languages.length === 0}
        >
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <span
                key={lang.id}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {getLanguageLabel(lang.language)} ({lang.level})
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Nota final */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> En crear l&apos;usuari, es generarà una contrasenya automàtica que hauràs de comunicar a l&apos;usuari.
          L&apos;usuari podrà canviar-la després d&apos;iniciar sessió per primera vegada.
        </p>
      </div>
    </div>
  )
}
