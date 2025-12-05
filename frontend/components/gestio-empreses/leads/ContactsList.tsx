// components/gestio-empreses/leads/ContactsList.tsx
'use client'

import { Star, Mail, Phone, Linkedin, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id?: string
  name: string
  position?: string | null
  email?: string | null
  phone?: string | null
  linkedin?: string | null
  notes?: string | null
  isPrimary?: boolean
}

interface ContactsListProps {
  contacts: Contact[]
  className?: string
}

export function ContactsList({ contacts, className }: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-6">
        <User className="h-8 w-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm text-slate-500">No hi ha contactes registrats</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {contacts.map((contact, index) => (
        <div
          key={contact.id || index}
          className={cn(
            "p-4 rounded-lg border",
            contact.isPrimary ? "border-blue-200 bg-blue-50/50" : "border-slate-200"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{contact.name}</span>
                {contact.isPrimary && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    <Star className="h-3 w-3 fill-current" strokeWidth={1.5} />
                    Principal
                  </span>
                )}
              </div>
              {contact.position && (
                <p className="text-sm text-slate-500">{contact.position}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                {contact.phone}
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600"
              >
                <Linkedin className="h-3.5 w-3.5" strokeWidth={1.5} />
                LinkedIn
              </a>
            )}
          </div>

          {contact.notes && (
            <p className="mt-2 text-sm text-slate-500 italic">{contact.notes}</p>
          )}
        </div>
      ))}
    </div>
  )
}