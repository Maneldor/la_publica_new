
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLeadsAction } from '@/lib/gestio-empreses/leads-actions'
import { LeadsClient } from './LeadsClient'

// Dades mock per mostrar el disseny (fallback) - Mantingut de l'original
const mockLeads = [
  {
    id: '1',
    company: 'Tech Solutions SL',
    contact: 'Maria García',
    email: 'maria@techsolutions.com',
    phone: '+34 666 123 456',
    status: 'NEW',
    priority: 'HIGH',
    source: 'WEB',
    sector: 'TECHNOLOGY',
    value: 15000,
    assignedTo: 'gestor1',
    gestorName: 'Joan Pujol',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    company: 'Retail Plus SA',
    contact: 'Carlos Ruiz',
    email: 'carlos@retailplus.com',
    phone: '+34 677 987 654',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    source: 'LINKEDIN',
    sector: 'RETAIL',
    value: 8500,
    assignedTo: 'gestor2',
    gestorName: 'Anna Molins',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-10')
  },
  {
    id: '3',
    company: 'Constructora BCN',
    contact: 'Laura Vidal',
    email: 'laura@constructorabcn.com',
    phone: null,
    status: 'QUALIFIED',
    priority: 'LOW',
    source: 'REFERRAL',
    sector: 'CONSTRUCTION',
    value: 25000,
    assignedTo: null,
    gestorName: null,
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-05')
  }
]

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch initial leads on server
  const { leads, success } = await getLeadsAction({})

  // Use mock leads if fetch fails (preserving original behavior)
  const initialLeads = success ? leads : mockLeads

  const currentUser = {
    id: session.user.id,
    role: session.user.role
  }

  return (
    <LeadsClient
      initialLeads={initialLeads}
      currentUser={currentUser}
    />
  )
}