'use client'

import { Building2, Users, TrendingUp, Tag, Clock, Heart, Eye } from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface ComponentPreviewProps {
  componentName: string
  props: Record<string, string>
}

// ============================================
// MOCK DATA
// ============================================

const mockGroupData = {
  id: 1,
  name: 'Innovació Digital Municipal',
  description: 'Grup dedicat a compartir experiències i bones pràctiques en transformació digital als ajuntaments.',
  category: 'Tecnologia',
  privacy: 'public' as const,
  coverImage: '',
  membersCount: 128,
  postsCount: 47,
  lastActivity: 'Fa 2h',
  isMember: false,
  isAdmin: false,
  adminName: 'Anna Puig',
  tags: ['smart city', 'innovació', 'digitalització'],
  membershipStatus: 'none' as const,
}

const mockCompanyData = {
  id: 1,
  name: 'Tech Solutions BCN',
  description: 'Consultoria especialitzada en transformació digital per al sector públic.',
  sector: 'Tecnologia',
  location: 'Barcelona',
  logo: '',
  coverImage: '',
  collaborationType: 'Partner Oficial',
  status: 'Verificada' as const,
  contactEmail: 'info@techsolutions.cat',
  website: 'https://techsolutions.cat',
  rating: 4.8,
  reviewsCount: 32,
  projectsCount: 45,
  yearsActive: 8,
  isFavorite: false,
}

const mockOfferData = {
  id: 1,
  title: 'Consultoria en Ciberseguretat',
  description: 'Anàlisi complet de vulnerabilitats i pla de millora per a entitats públiques.',
  company: {
    id: 1,
    name: 'SecureGov',
    logo: '',
    plan: 'Premium',
  },
  category: 'Seguretat',
  originalPrice: 5000,
  discountPrice: 3500,
  discountPercentage: 30,
  images: [],
  validUntil: '2025-03-31',
  stock: null,
  isHighlighted: true,
  isFavorite: false,
  views: 245,
  saves: 18,
  createdAt: '2025-01-15',
  terms: 'Oferta vàlida per a nous clients',
}

const mockMemberData = {
  id: 'member-1',
  username: 'mariagarcia',
  name: 'Maria García',
  firstName: 'Maria',
  lastName: 'García',
  role: 'Cap de Sistemes',
  department: 'Tecnologia',
  departmentPublic: true,
  location: 'Barcelona',
  administration: 'LOCAL' as const,
  isConnected: false,
  isPending: false,
  avatar: '',
  connectionsCount: 145,
  groupsCount: 8,
  postsCount: 23,
  bio: 'Especialista en transformació digital amb més de 10 anys d\'experiència.',
  tags: ['tecnologia', 'innovació', 'smart city'],
}

// ============================================
// PREVIEW COMPONENTS
// ============================================

function PreviewGroupCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="overflow-hidden border transition-all duration-300 flex flex-col group"
      style={{
        ...cssVars,
        background: 'var(--GroupCard-background, #ffffff)',
        borderRadius: 'var(--GroupCard-border-radius, 12px)',
        borderColor: 'var(--GroupCard-border-color, #e5e7eb)',
        boxShadow: 'var(--GroupCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
      }}
    >
      {/* Cover Image */}
      <div
        className="relative flex-shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500"
        style={{ height: 'var(--GroupCard-header-height, 128px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border bg-emerald-100 text-emerald-700 border-emerald-200">
            Públic
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col"
        style={{ padding: 'var(--GroupCard-padding, 16px)' }}
      >
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{mockGroupData.name}</h3>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{mockGroupData.category}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mt-2 flex-1">{mockGroupData.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {mockGroupData.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-medium rounded"
              style={{
                background: 'var(--GroupCard-badge-background, #dbeafe)',
                color: 'var(--GroupCard-badge-color, #1e40af)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {mockGroupData.membersCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {mockGroupData.lastActivity}
          </span>
        </div>
      </div>
    </div>
  )
}

function PreviewCompanyCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="overflow-hidden border transition-all duration-300"
      style={{
        ...cssVars,
        background: 'var(--CompanyCard-background, #ffffff)',
        borderRadius: 'var(--CompanyCard-border-radius, 12px)',
        borderColor: 'var(--CompanyCard-border-color, #e5e7eb)',
        boxShadow: 'var(--CompanyCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
        padding: 'var(--CompanyCard-padding, 16px)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0"
        >
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-base line-clamp-1"
            style={{ color: 'var(--CompanyCard-title-color, #111827)' }}
          >
            {mockCompanyData.name}
          </h3>
          <p
            className="text-sm line-clamp-1 mt-0.5"
            style={{ color: 'var(--CompanyCard-text-color, #6b7280)' }}
          >
            {mockCompanyData.sector} · {mockCompanyData.location}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">{mockCompanyData.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span>⭐ {mockCompanyData.rating}</span>
            <span>{mockCompanyData.reviewsCount} ressenyes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewOfferCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="overflow-hidden border transition-all duration-300"
      style={{
        ...cssVars,
        background: 'var(--OfferCard-background, #ffffff)',
        borderRadius: 'var(--OfferCard-border-radius, 12px)',
        borderColor: 'var(--OfferCard-border-color, #e5e7eb)',
        boxShadow: 'var(--OfferCard-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        padding: 'var(--OfferCard-padding, 16px)',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Tag className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{mockOfferData.title}</h3>
            <span
              className="px-2 py-0.5 text-xs font-bold rounded"
              style={{
                background: 'var(--OfferCard-discount-background, #dcfce7)',
                color: 'var(--OfferCard-discount-color, #166534)',
              }}
            >
              -{mockOfferData.discountPercentage}%
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{mockOfferData.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--OfferCard-price-color, #111827)' }}
            >
              {mockOfferData.discountPrice.toLocaleString()}€
            </span>
            <span className="text-sm text-gray-400 line-through">
              {mockOfferData.originalPrice.toLocaleString()}€
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {mockOfferData.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {mockOfferData.saves}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewMemberCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="overflow-hidden border transition-all duration-300"
      style={{
        ...cssVars,
        background: 'var(--MemberCard-background, #ffffff)',
        borderRadius: 'var(--MemberCard-border-radius, 16px)',
        borderColor: 'var(--MemberCard-border-color, #e5e7eb)',
        boxShadow: 'var(--MemberCard-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold"
            style={{
              width: 'var(--MemberCard-avatar-size, 48px)',
              height: 'var(--MemberCard-avatar-size, 48px)',
            }}
          >
            MG
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold line-clamp-1"
              style={{ color: 'var(--MemberCard-name-color, #111827)' }}
            >
              {mockMemberData.name}
            </h3>
            <p
              className="text-sm line-clamp-1"
              style={{ color: 'var(--MemberCard-meta-color, #6b7280)' }}
            >
              {mockMemberData.role}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{mockMemberData.bio}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{mockMemberData.connectionsCount} connexions</span>
          <span>{mockMemberData.groupsCount} grups</span>
        </div>
      </div>
    </div>
  )
}

function PreviewStatCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="border-l-4 border-blue-500"
      style={{
        ...cssVars,
        background: 'var(--StatCard-background, #ffffff)',
        borderRadius: 'var(--StatCard-border-radius, 12px)',
        borderColor: 'var(--StatCard-border-color, #e5e7eb)',
        padding: 'var(--StatCard-padding, 20px)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">Total Empreses</p>
          <p
            className="font-bold text-gray-900 mt-1"
            style={{
              fontSize: 'var(--StatCard-value-size, 2rem)',
              fontWeight: 'var(--StatCard-value-weight, 700)',
            }}
          >
            245
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: 'var(--StatCard-trend-up-color, #16a34a)' }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--StatCard-trend-up-color, #16a34a)' }}
            >
              +12%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--StatCard-icon-background, #f3f4f6)' }}
        >
          <Building2 className="w-6 h-6 text-blue-500" />
        </div>
      </div>
    </div>
  )
}

function PreviewLeadCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="border cursor-grab"
      style={{
        ...cssVars,
        background: 'var(--LeadCard-background, #ffffff)',
        borderRadius: 'var(--LeadCard-border-radius, 8px)',
        borderColor: 'var(--LeadCard-border-color, #e5e7eb)',
        boxShadow: 'var(--LeadCard-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        padding: 'var(--LeadCard-padding, 12px)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--LeadCard-priority-high-color, #dc2626)' }}
        />
        <span className="text-xs font-medium text-gray-500">Alta prioritat</span>
      </div>
      <h4 className="font-medium text-gray-900 text-sm">Ajuntament de Sabadell</h4>
      <p className="text-xs text-gray-500 mt-1">Contacte: Joan Martínez</p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Fa 2 dies</span>
        <span className="text-xs font-medium text-indigo-600">15.000€</span>
      </div>
    </div>
  )
}

function PreviewInvoiceCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="border"
      style={{
        ...cssVars,
        background: 'var(--InvoiceCard-background, #ffffff)',
        borderRadius: 'var(--InvoiceCard-border-radius, 12px)',
        borderColor: 'var(--InvoiceCard-border-color, #e5e7eb)',
        padding: 'var(--InvoiceCard-padding, 16px)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm font-medium text-gray-900">FAC-2025-001</span>
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{
            background: 'var(--InvoiceCard-status-paid-background, #dcfce7)',
            color: 'var(--InvoiceCard-status-paid-color, #166534)',
          }}
        >
          Pagada
        </span>
      </div>
      <p className="text-sm text-gray-600">Ajuntament de Barcelona</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">15/01/2025</span>
        <span className="font-semibold text-gray-900">2.450,00€</span>
      </div>
    </div>
  )
}

function PreviewPlanCard({ cssVars }: { cssVars: Record<string, string> }) {
  return (
    <div
      className="border-2 relative"
      style={{
        ...cssVars,
        background: 'var(--PlanCard-background, #ffffff)',
        borderRadius: 'var(--PlanCard-border-radius, 16px)',
        borderColor: 'var(--PlanCard-featured-border-color, #3b82f6)',
        boxShadow: 'var(--PlanCard-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
        padding: 'var(--PlanCard-padding, 24px)',
      }}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full"
        style={{
          background: 'var(--PlanCard-featured-badge-background, #3b82f6)',
          color: 'var(--PlanCard-featured-badge-color, #ffffff)',
        }}
      >
        RECOMANAT
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mt-2">Pla Professional</h3>
      <div className="text-center mt-4">
        <span
          className="font-bold"
          style={{
            color: 'var(--PlanCard-price-color, #111827)',
            fontSize: 'var(--PlanCard-price-size, 2.5rem)',
          }}
        >
          49€
        </span>
        <span className="text-gray-500 text-sm">/mes</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span> Fins a 50 usuaris
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span> Suport prioritari
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span> Analytics avançat
        </li>
      </ul>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ComponentPreview({ componentName, props }: ComponentPreviewProps) {
  // Convert props to CSS variables
  const cssVars: Record<string, string> = {}
  Object.entries(props).forEach(([key, value]) => {
    cssVars[`--${componentName}-${key}`] = value
  })

  const renderPreview = () => {
    switch (componentName) {
      case 'GroupCard':
        return <PreviewGroupCard cssVars={cssVars} />
      case 'CompanyCard':
        return <PreviewCompanyCard cssVars={cssVars} />
      case 'OfferCard':
        return <PreviewOfferCard cssVars={cssVars} />
      case 'MemberCard':
        return <PreviewMemberCard cssVars={cssVars} />
      case 'StatCard':
        return <PreviewStatCard cssVars={cssVars} />
      case 'LeadCard':
        return <PreviewLeadCard cssVars={cssVars} />
      case 'InvoiceCard':
        return <PreviewInvoiceCard cssVars={cssVars} />
      case 'PlanCard':
        return <PreviewPlanCard cssVars={cssVars} />
      default:
        return (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-200 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Preview no disponible</p>
            <p className="text-sm text-slate-500 mt-1">
              Component: {componentName}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="bg-slate-100 rounded-xl p-8 min-h-[300px]">
      <div className="max-w-md mx-auto">
        {renderPreview()}
      </div>
    </div>
  )
}

export default ComponentPreview
