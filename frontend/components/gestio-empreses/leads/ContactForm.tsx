// components/gestio-empreses/leads/ContactForm.tsx
'use client'

import { useState } from 'react'
import { Plus, Trash2, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ContactData {
  id?: string
  name: string
  position: string
  email: string
  phone: string
  linkedin: string
  notes: string
  isPrimary: boolean
}

interface ContactFormProps {
  contacts: ContactData[]
  onChange: (contacts: ContactData[]) => void
}

const emptyContact: ContactData = {
  name: '',
  position: '',
  email: '',
  phone: '',
  linkedin: '',
  notes: '',
  isPrimary: false,
}

export function ContactForm({ contacts, onChange }: ContactFormProps) {
  const addContact = () => {
    const newContact = {
      ...emptyContact,
      isPrimary: contacts.length === 0
    }
    onChange([...contacts, newContact])
  }

  const removeContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index)
    // Si eliminem el principal, fer el primer com a principal
    if (contacts[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true
    }
    onChange(updated)
  }

  const updateContact = (index: number, field: keyof ContactData, value: string | boolean) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const setPrimary = (index: number) => {
    const updated = contacts.map((c, i) => ({
      ...c,
      isPrimary: i === index
    }))
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact, index) => (
        <div
          key={index}
          className={cn(
            "border rounded-lg p-4 space-y-4",
            contact.isPrimary ? "border-blue-300 bg-blue-50/50" : "border-slate-200"
          )}
        >
          {/* Capçalera contacte */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {contact.isPrimary ? (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Star className="h-4 w-4 fill-current" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Contacte principal</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Star className="h-4 w-4" strokeWidth={1.5} />
                  <span className="text-sm">Fer principal</span>
                </button>
              )}
            </div>
            {contacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Camps del contacte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                required={contact.isPrimary}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Maria García López"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Càrrec / Posició
              </label>
              <input
                type="text"
                value={contact.position}
                onChange={(e) => updateContact(index, 'position', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CEO, Director Comercial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateContact(index, 'email', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="maria@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telèfon
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+34 666 777 888"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={contact.linkedin}
                onChange={(e) => updateContact(index, 'linkedin', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/mariagarcia"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes del contacte
              </label>
              <textarea
                value={contact.notes}
                onChange={(e) => updateContact(index, 'notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informació addicional sobre aquest contacte..."
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addContact}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Afegir contacte
      </button>
    </div>
  )
}