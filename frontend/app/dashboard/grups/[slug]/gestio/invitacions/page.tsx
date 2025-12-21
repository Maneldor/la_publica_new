'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { InviteUserModal } from './InviteUserModal'
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  Calendar,
  Mail,
  RefreshCw,
  Trash2,
  Send,
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
  user: {
    id: string
    name: string
    nick: string
    email: string
    image: string | null
  }
  invitedBy: {
    id: string
    name: string
    nick: string
    image: string | null
  }
}

interface StatusCounts {
  PENDING: number
  ACCEPTED: number
  REJECTED: number
  EXPIRED: number
  CANCELLED: number
}

interface GroupData {
  id: string
  name: string
  slug: string
  type: string
}

export default function GestioInvitacionsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<GroupData | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [counts, setCounts] = useState<StatusCounts>({
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
  })
  const [activeTab, setActiveTab] = useState<string>('PENDING')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Carregar dades del grup
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const res = await fetch(`/api/groups/by-slug/${slug}`)
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/dashboard/grups')
            return
          }
          throw new Error('Error carregant grup')
        }
        const data = await res.json()

        if (!data.isAdmin && !data.isModerator) {
          toast({
            title: 'Sense permisos',
            description: 'No tens permisos per gestionar invitacions',
            variant: 'destructive',
          })
          router.push(`/dashboard/grups/${slug}`)
          return
        }

        setGroup({
          id: data.id,
          name: data.name,
          slug: data.slug,
          type: data.type,
        })
      } catch (error) {
        console.error('Error loading group:', error)
        toast({
          title: 'Error',
          description: 'No s\'ha pogut carregar el grup',
          variant: 'destructive',
        })
      }
    }

    loadGroup()
  }, [slug, router, toast])

  // Carregar invitacions
  const loadInvitations = async () => {
    if (!group) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/invitations?status=${activeTab}`)
      if (!res.ok) throw new Error('Error carregant invitacions')

      const data = await res.json()
      setInvitations(data.invitations)
      setCounts(data.counts)
    } catch (error) {
      console.error('Error loading invitations:', error)
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar les invitacions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (group) {
      loadInvitations()
    }
  }, [group, activeTab])

  // Cancel·lar invitació
  const handleCancel = async (invitationId: string) => {
    if (!group) return

    setProcessingId(invitationId)
    try {
      const res = await fetch(
        `/api/groups/${group.id}/invitations/${invitationId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error cancel·lant invitació')
      }

      toast({
        title: 'Invitació cancel·lada',
        description: 'La invitació ha estat cancel·lada',
      })

      loadInvitations()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error cancel·lant invitació',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  // Reenviar invitació
  const handleResend = async (invitationId: string) => {
    if (!group) return

    setProcessingId(invitationId)
    try {
      const res = await fetch(
        `/api/groups/${group.id}/invitations/${invitationId}`,
        { method: 'PATCH' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error reenviant invitació')
      }

      toast({
        title: 'Invitació reenviada',
        description: 'S\'ha reenviat la invitació',
      })

      loadInvitations()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error reenviant invitació',
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
        return <Badge className="bg-green-500">Acceptada</Badge>
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

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/grups/${slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invitacions</h1>
            <p className="text-muted-foreground">{group.name}</p>
          </div>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar usuari
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold">{counts.PENDING}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pendents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{counts.ACCEPTED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Acceptades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{counts.REJECTED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Rebutjades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold">{counts.EXPIRED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Expirades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold">{counts.CANCELLED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Cancel·lades</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="PENDING" className="relative">
            Pendents
            {counts.PENDING > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {counts.PENDING}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ACCEPTED">Acceptades</TabsTrigger>
          <TabsTrigger value="REJECTED">Rebutjades</TabsTrigger>
          <TabsTrigger value="EXPIRED">Expirades</TabsTrigger>
          <TabsTrigger value="ALL">Totes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">Cap invitació</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === 'PENDING'
                    ? 'No hi ha invitacions pendents'
                    : `No hi ha invitacions ${activeTab === 'ACCEPTED' ? 'acceptades' : activeTab === 'REJECTED' ? 'rebutjades' : ''}`}
                </p>
                {activeTab === 'PENDING' && (
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar usuari
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {invitation.user.image ? (
                          <Image
                            src={invitation.user.image}
                            alt={invitation.user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                            {invitation.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{invitation.user.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            @{invitation.user.nick}
                          </span>
                          {getStatusBadge(invitation.status, invitation.isExpired)}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {invitation.user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Convidat per {invitation.invitedBy.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(invitation.createdAt), {
                              addSuffix: true,
                              locale: ca,
                            })}
                          </div>
                        </div>

                        {invitation.message && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            &ldquo;{invitation.message}&rdquo;
                          </div>
                        )}

                        {invitation.expiresAt &&
                          invitation.status === 'PENDING' &&
                          !invitation.isExpired && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              Expira{' '}
                              {formatDistanceToNow(new Date(invitation.expiresAt), {
                                addSuffix: true,
                                locale: ca,
                              })}
                            </div>
                          )}

                        {invitation.respondedAt && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            Resposta{' '}
                            {formatDistanceToNow(new Date(invitation.respondedAt), {
                              addSuffix: true,
                              locale: ca,
                            })}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {(invitation.status === 'PENDING' && !invitation.isExpired) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(invitation.id)}
                            disabled={processingId === invitation.id}
                          >
                            {processingId === invitation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancel·lar
                              </>
                            )}
                          </Button>
                        )}
                        {(invitation.status === 'EXPIRED' || invitation.isExpired) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResend(invitation.id)}
                            disabled={processingId === invitation.id}
                          >
                            {processingId === invitation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reenviar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal d'invitació */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={group.id}
        groupName={group.name}
        onInviteSent={loadInvitations}
      />
    </div>
  )
}
