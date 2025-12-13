// app/gestio/leads/nou/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Building2,
  Users,
  Euro,
  FileText,
  Globe,
  MapPin,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContactForm, ContactData } from '@/components/gestio-empreses/leads/ContactForm'
import { SOURCES, PRIORITIES, EMPLOYEE_RANGES } from '@/components/gestio-empreses/leads/constants'
import { getCategoriesAsOptions } from '@/lib/constants/categories'
import { createLead } from '@/lib/gestio-empreses/actions'

export default function NewLeadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [contacts, setContacts] = useState<ContactData[]>([{
    name: '',
    position: '',
    email: '',
    phone: '',
    linkedin: '',
    notes: '',
    isPrimary: true,
  }])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Validar que hi ha almenys un contacte amb nom
    const primaryContact = contacts.find(c => c.isPrimary)
    if (!primaryContact?.name) {
      setError('Cal afegir almenys un contacte principal amb nom')
      setIsLoading(false)
      return
    }

    const data = {
      // Dades empresa
      companyName: formData.get('companyName') as string,
      cif: formData.get('cif') as string || null,
      sector: formData.get('sector') as string || null,
      website: formData.get('website') as string || null,
      address: formData.get('address') as string || null,
      employeeCount: formData.get('employeeCount') as string || null,

      // Contacte principal (per compatibilitat)
      contactName: primaryContact.name,
      contactEmail: primaryContact.email || null,
      contactPhone: primaryContact.phone || null,
      contactPosition: primaryContact.position || null,

      // Dades comercials
      priority: priority,
      source: formData.get('source') as string || 'OTHER',
      estimatedRevenue: formData.get('estimatedRevenue') ? parseFloat(formData.get('estimatedRevenue') as string) : null,

      // Notes
      notes: formData.get('notes') as string || null,

      // Contactes addicionals (guardar com a JSON a notes o camp separat)
      contacts: contacts,
    }

    try {
      const result = await createLead({
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.contactEmail || '',
        phone: data.contactPhone,
        sector: data.sector,
        source: data.source,
        priority: data.priority,
        notes: data.notes
      })

      if (result.id) {
        router.push(`/gestio/leads/${result.id}`)
      } else {
        setError('Error creant el lead')
      }
    } catch (err) {
      setError('Error inesperat. Torna-ho a provar.')
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Capçalera */}
      <div className="flex items-center gap-4">
        <Link
          href="/gestio/leads"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nou Lead</h1>
          <p className="text-sm text-slate-500">Registra una nova oportunitat de negoci</p>
        </div>
      </div>

      {/* Formulari */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* SECCIÓ 1: Dades de l'empresa */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="text-base font-medium text-slate-800">Informació de l'empresa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de l'empresa *
              </label>
              <input
                type="text"
                name="companyName"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Tech Solutions SL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  CIF
                </span>
              </label>
              <input
                type="text"
                name="cif"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: B12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sector
              </label>
              <select
                name="sector"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecciona un sector</option>
                {getCategoriesAsOptions().map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  Web
                </span>
              </label>
              <input
                type="url"
                name="website"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  Nombre d'empleats
                </span>
              </label>
              <select
                name="employeeCount"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {EMPLOYEE_RANGES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  Adreça
                </span>
              </label>
              <input
                type="text"
                name="address"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Carrer, número, ciutat, CP"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓ 2: Informació comercial */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Euro className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="text-base font-medium text-slate-800">Informació comercial</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Font del lead *
              </label>
              <select
                name="source"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prioritat *
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors",
                      priority === p.value
                        ? p.value === 'HIGH'
                          ? "bg-red-50 border-red-300 text-red-700"
                          : p.value === 'MEDIUM'
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-slate-50 border-slate-300 text-slate-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="priority" value={priority} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor estimat (€)
              </label>
              <input
                type="number"
                name="estimatedRevenue"
                min="0"
                step="100"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 15000"
              />
              <p className="text-xs text-slate-400 mt-1">Valor estimat del contracte en euros</p>
            </div>
          </div>
        </div>

        {/* SECCIÓ 3: Contactes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="text-base font-medium text-slate-800">Contactes</h2>
          </div>

          <ContactForm contacts={contacts} onChange={setContacts} />
        </div>

        {/* SECCIÓ 4: Notes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="text-base font-medium text-slate-800">Notes addicionals</h2>
          </div>

          <textarea
            name="notes"
            rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informació addicional sobre el lead, context, necessitats específiques..."
          />
        </div>

        {/* Botons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/gestio/leads"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel·lar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {isLoading ? 'Guardant...' : 'Crear lead'}
          </button>
        </div>
      </form>
    </div>
  )
}