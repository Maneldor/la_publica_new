// components/gestio-empreses/pressupostos/CompanySelector.tsx
'use client'

import { useState } from 'react'
import { Search, Building2, Mail, Phone, MapPin, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  cif: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
}

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string
  onSelect: (company: Company) => void
}

export function CompanySelector({ companies, selectedCompanyId, onSelect }: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompanies = companies.filter((company) => {
    const search = searchTerm.toLowerCase()
    return (
      company.name.toLowerCase().includes(search) ||
      company.cif.toLowerCase().includes(search) ||
      company.email.toLowerCase().includes(search)
    )
  })

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Cercar empresa per nom, CIF o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Companies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {filteredCompanies.map((company) => {
          const isSelected = company.id === selectedCompanyId

          return (
            <div
              key={company.id}
              onClick={() => onSelect(company)}
              className={cn(
                'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-blue-100' : 'bg-slate-100'
                  )}>
                    <Building2 className={cn(
                      'h-5 w-5',
                      isSelected ? 'text-blue-600' : 'text-slate-400'
                    )} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.cif}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="p-1 bg-blue-500 rounded-full">
                    <Check className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  {company.email}
                </div>
                {company.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    {company.phone}
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    {company.address}, {company.city}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-slate-500">No s'han trobat empreses</p>
        </div>
      )}

      {/* Selected company detail */}
      {selectedCompany && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            <p className="font-medium text-green-800">Empresa seleccionada</p>
          </div>
          <p className="text-green-700">
            {selectedCompany.name} ({selectedCompany.cif})
          </p>
        </div>
      )}
    </div>
  )
}