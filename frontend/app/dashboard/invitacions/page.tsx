'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Mail,
  Users,
  Check,
  X,
  Clock,
  Loader2,
  ArrowRight,
  Calendar,
  User,
  EyeOff,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface Invitation {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  message: string | null
  createdAt: string
  expiresAt: string | null
  respondedAt: string | null
  isExpired: boolean
  group: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    type: string
    membersCount: number
  }
  invitedBy: {
    id: string
    name: string
    nick: string
    image: string | null
  }
}

export default function InvitationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('PENDING')

  useEffect(() => {
    loadInvitations()
  }, [filter])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/user/invitations?status=${filter}`)
      if (!res.ok) throw new Error('Error carregant invitacions')

      const data = await res.json()
      setInvitations(data.invitations || [])
      setPendingCount(data.pendingCount || 0)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar les invitacions',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponse = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(invitationId)
      const res = await fetch(`/api/user/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error processant invitació')
      }

      toast({
        title: action === 'accept' ? 'T\'has unit al grup!' : 'Invitació rebutjada',
        description: data.message,
      })

      if (action === 'accept' && data.groupSlug) {
        router.push(`/dashboard/grups/${data.groupSlug}`)
      } else {
        loadInvitations()
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error processant invitació',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired && status === 'PENDING') {
      return <Badge variant="secondary">Expirada</Badge>
    }
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pendent</Badge>
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-green-500">Acceptada</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rebutjada</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancel·lada</Badge>
      case 'EXPIRED':
        return <Badge variant="secondary">Expirada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invitacions</h1>
        <p className="text-gray-500">Gestiona les invitacions a grups que has rebut</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'PENDING', label: 'Pendents', count: pendingCount },
          { key: 'ACCEPTED', label: 'Acceptades' },
          { key: 'REJECTED', label: 'Rebutjades' },
          { key: 'ALL', label: 'Totes' },
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Llista */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-gray-500 mt-2">Carregant invitacions...</p>
          </CardContent>
        </Card>
      ) : invitations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No tens invitacions {filter === 'PENDING' ? 'pendents' : ''}
            </h3>
            <p className="text-gray-500">
              Les invitacions a grups apareixeran aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <Card
              key={inv.id}
              className={inv.isExpired || inv.status === 'CANCELLED' ? 'opacity-60' : ''}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar del grup */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden flex-shrink-0">
                    {inv.group.image ? (
                      <Image
                        src={inv.group.image}
                        alt={inv.group.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        {inv.group.type === 'SECRET' ? (
                          <EyeOff className="w-8 h-8" />
                        ) : (
                          <Users className="w-8 h-8" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{inv.group.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          inv.group.type === 'SECRET'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-gray-300 text-gray-600'
                        }
                      >
                        {inv.group.type === 'SECRET' ? 'Secret' : inv.group.type}
                      </Badge>
                      {getStatusBadge(inv.status, inv.isExpired)}
                    </div>

                    {inv.group.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {inv.group.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {inv.group.membersCount} membres
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Convidat per {inv.invitedBy.name || inv.invitedBy.nick}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(inv.createdAt), {
                          addSuffix: true,
                          locale: ca,
                        })}
                      </span>
                    </div>

                    {inv.message && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 italic">&ldquo;{inv.message}&rdquo;</p>
                      </div>
                    )}

                    {inv.expiresAt && inv.status === 'PENDING' && !inv.isExpired && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        Expira{' '}
                        {formatDistanceToNow(new Date(inv.expiresAt), {
                          addSuffix: true,
                          locale: ca,
                        })}
                      </div>
                    )}
                  </div>

                  {/* Accions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {inv.status === 'PENDING' && !inv.isExpired ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleResponse(inv.id, 'accept')}
                          disabled={processingId === inv.id}
                        >
                          {processingId === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Acceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResponse(inv.id, 'reject')}
                          disabled={processingId === inv.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rebutjar
                        </Button>
                      </>
                    ) : inv.status === 'ACCEPTED' ? (
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/grups/${inv.group.slug}`}>
                          Veure grup
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    ) : (
                      <div className="text-center">
                        {inv.status === 'REJECTED' && (
                          <span className="text-sm text-gray-500">Rebutjada</span>
                        )}
                        {(inv.status === 'EXPIRED' || inv.isExpired) && (
                          <span className="text-sm text-gray-500">Expirada</span>
                        )}
                        {inv.status === 'CANCELLED' && (
                          <span className="text-sm text-gray-500">Cancel·lada</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
