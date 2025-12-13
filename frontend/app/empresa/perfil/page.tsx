'use client'

import Link from 'next/link'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Star,
  CheckCircle,
  Camera,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  LucideIcon
} from 'lucide-react'

export default function PerfilEmpresaPage() {
  return (
    <div className="space-y-6">
      {/* Header de pàgina */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Perfil d'Empresa</h1>
            <p className="text-slate-500">Gestiona la informació pública de la teva empresa</p>
          </div>
        </div>

        <Link
          href="/empresa/perfil/editar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" strokeWidth={1.5} />
          Editar perfil
        </Link>
      </div>

      {/* Contingut principal - 2 columnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna esquerra (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card principal empresa */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <button className="absolute bottom-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                <Camera className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Info empresa */}
            <div className="p-6 -mt-12 relative">
              {/* Logo */}
              <div className="w-24 h-24 bg-white border-4 border-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
              </div>

              {/* Nom i badge */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-slate-900">MAPFRE</h2>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Star className="h-3 w-3" fill="currentColor" />
                  PREMIUM
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Verificada
                </span>
              </div>

              {/* Sector i valoració */}
              <p className="text-slate-500 mb-2">Sector: Serveis Professionals i Corporatius</p>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                <span className="font-medium text-slate-900">4.8</span>
                <span className="text-slate-500">(127 valoracions)</span>
              </div>
            </div>
          </div>

          {/* Sobre nosaltres */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Sobre nosaltres</h3>
            <p className="text-slate-600 leading-relaxed">
              MAPFRE és una empresa líder global en assegurances i reassegurances.
              Oferim solucions innovadores i personalitzades per a particulars, empreses i
              organismes públics. La nostra experiència de més de 90 anys i la nostra presència
              internacional ens permeten oferir els millors serveis del sector assegurador.
            </p>
          </div>

          {/* Informació de contacte */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Informació de contacte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContactItem icon={MapPin} label="Ubicació" value="Barcelona, Catalunya" />
              <ContactItem icon={Mail} label="Email" value="contacte@mapfre.cat" />
              <ContactItem icon={Phone} label="Telèfon" value="+34 93 123 45 67" />
              <ContactItem icon={Globe} label="Web" value="www.mapfre.cat" isLink />
            </div>
          </div>

          {/* Xarxes socials */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Xarxes socials</h3>
            <div className="flex items-center gap-3">
              <SocialButton icon={Facebook} href="#" />
              <SocialButton icon={Instagram} href="#" />
              <SocialButton icon={Linkedin} href="#" />
              <SocialButton icon={Twitter} href="#" />
            </div>
          </div>
        </div>

        {/* Columna dreta (1/3) */}
        <div className="space-y-6">

          {/* Estadístiques del perfil */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Estadístiques del perfil</h3>
            <div className="space-y-4">
              <MiniStat label="Visualitzacions del perfil" value="1,234" change="+12%" />
              <MiniStat label="Ofertes guardades" value="89" />
              <MiniStat label="Clics a la web" value="156" />
              <MiniStat label="Contactes rebuts" value="34" />
            </div>
          </div>

          {/* Completitud del perfil */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Completitud del perfil</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">85% completat</span>
              <span className="text-sm font-medium text-blue-600">85%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Afegeix les xarxes socials per completar el perfil al 100%.
            </p>
          </div>

          {/* Accions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Accions</h3>
            <div className="space-y-2">

              <Link
                href="/empresa/perfil/editar"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" strokeWidth={1.5} />
                Editar informació
              </Link>

              <Link
                href="/empresa/perfil/preview"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Globe className="h-4 w-4" strokeWidth={1.5} />
                Veure perfil públic
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Components auxiliars

// ContactItem
function ContactItem({
  icon: Icon,
  label,
  value,
  isLink = false
}: {
  icon: LucideIcon
  label: string
  value: string
  isLink?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg">
        <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        {isLink ? (
          <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm text-slate-900">{value}</p>
        )}
      </div>
    </div>
  )
}

// SocialButton
function SocialButton({ icon: Icon, href }: { icon: LucideIcon; href: string }) {
  return (
    <a
      href={href}
      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
    >
      <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
    </a>
  )
}

// MiniStat
function MiniStat({
  label,
  value,
  change
}: {
  label: string
  value: string
  change?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-900">{value}</span>
        {change && (
          <span className="text-xs text-green-600">{change}</span>
        )}
      </div>
    </div>
  )
}