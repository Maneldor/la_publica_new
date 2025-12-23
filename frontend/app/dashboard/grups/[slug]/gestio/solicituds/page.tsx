'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
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
  Briefcase,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface JoinRequest {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  message: string | null
  createdAt: string
  reviewedAt: string | null
  reviewNote: string | null
  user: {
    id: string
    nick: string
    name: string
    email: string
    image: string | null
    position: string | null
    department: string | null
    bio: string | null
    memberSince: string
  }
  reviewedBy: {
    id: string
    nick: string
    name: string
    image: string | null
  } | null
}

interface StatusCounts {
  PENDING: number
  APPROVED: number
  REJECTED: number
  CANCELLED: number
}

interface GroupData {
  id: string
  name: string
  slug: string
  type: string
}

export default function GestioSolicitudsPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<GroupData | null>(null)
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [counts, setCounts] = useState<StatusCounts>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  })
  const [activeTab, setActiveTab] = useState<string>('PENDING')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Modal per aprovar/rebutjar
  const [actionModal, setActionModal] = useState<{
    open: boolean
    request: JoinRequest | null
    action: 'approve' | 'reject' | null
  }>({ open: false, request: null, action: null })
  const [actionNote, setActionNote] = useState('')

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
            description: 'No tens permisos per gestionar sol·licituds',
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

  // Carregar sol·licituds
  useEffect(() => {
    if (!group) return

    const loadRequests = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/groups/${group.id}/requests?status=${activeTab}`)
        if (!res.ok) throw new Error('Error carregant sol·licituds')

        const data = await res.json()
        setRequests(data.requests)
        setCounts(data.counts)
      } catch (error) {
        console.error('Error loading requests:', error)
        toast({
          title: 'Error',
          description: 'No s\'han pogut carregar les sol·licituds',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [group, activeTab, toast])

  // Processar sol·licitud
  const handleProcessRequest = async () => {
    if (!actionModal.request || !actionModal.action || !group) return

    setProcessingId(actionModal.request.id)
    try {
      const res = await fetch(
        `/api/groups/${group.id}/requests/${actionModal.request.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: actionModal.action,
            note: actionNote.trim() || null,
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error processant sol·licitud')
      }

      const data = await res.json()

      toast({
        title: actionModal.action === 'approve' ? 'Sol·licitud aprovada' : 'Sol·licitud rebutjada',
        description: data.message,
      })

      // Actualitzar llista
      setRequests((prev) => prev.filter((r) => r.id !== actionModal.request!.id))
      setCounts((prev) => ({
        ...prev,
        PENDING: prev.PENDING - 1,
        [actionModal.action === 'approve' ? 'APPROVED' : 'REJECTED']:
          prev[actionModal.action === 'approve' ? 'APPROVED' : 'REJECTED'] + 1,
      }))

      // Tancar modal
      setActionModal({ open: false, request: null, action: null })
      setActionNote('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error processant sol·licitud',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const openActionModal = (request: JoinRequest, action: 'approve' | 'reject') => {
    setActionModal({ open: true, request, action })
    setActionNote('')
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/grups/${slug}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Sol·licituds d&apos;accés</h1>
          <p className="text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <span className="text-2xl font-bold">{counts.APPROVED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Aprovades</p>
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
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{counts.CANCELLED}</span>
            </div>
            <p className="text-sm text-muted-foreground">Cancel·lades</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="PENDING" className="relative">
            Pendents
            {counts.PENDING > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {counts.PENDING}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">Aprovades</TabsTrigger>
          <TabsTrigger value="REJECTED">Rebutjades</TabsTrigger>
          <TabsTrigger value="ALL">Totes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">Cap sol·licitud</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'PENDING'
                    ? 'No hi ha sol·licituds pendents de revisar'
                    : `No hi ha sol·licituds ${activeTab === 'APPROVED' ? 'aprovades' : activeTab === 'REJECTED' ? 'rebutjades' : ''}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {request.user.image ? (
                          <Image
                            src={request.user.image}
                            alt={request.user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                            {request.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.user.name}</h3>
                          <span className="text-sm text-muted-foreground">@{request.user.nick}</span>
                          {request.status !== 'PENDING' && (
                            <Badge
                              variant={
                                request.status === 'APPROVED'
                                  ? 'default'
                                  : request.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {request.status === 'APPROVED' && 'Aprovada'}
                              {request.status === 'REJECTED' && 'Rebutjada'}
                              {request.status === 'CANCELLED' && 'Cancel·lada'}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {request.user.email}
                          </div>
                          {request.user.position && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {request.user.position}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Membre des de{' '}
                            {formatDistanceToNow(new Date(request.user.memberSince), {
                              addSuffix: true,
                              locale: ca,
                            })}
                          </div>
                        </div>

                        {request.message && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Sol·licitud enviada{' '}
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                            locale: ca,
                          })}
                        </div>

                        {request.reviewedBy && request.reviewedAt && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            Revisada per {request.reviewedBy.name}{' '}
                            {formatDistanceToNow(new Date(request.reviewedAt), {
                              addSuffix: true,
                              locale: ca,
                            })}
                            {request.reviewNote && `: "${request.reviewNote}"`}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {request.status === 'PENDING' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => openActionModal(request, 'approve')}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Aprovar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionModal(request, 'reject')}
                            disabled={processingId === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rebutjar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal aprovar/rebutjar */}
      <Dialog
        open={actionModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setActionModal({ open: false, request: null, action: null })
            setActionNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.action === 'approve' ? 'Aprovar sol·licitud' : 'Rebutjar sol·licitud'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.action === 'approve' ? (
                <>
                  <strong>{actionModal.request?.user.name}</strong> es convertirà en membre del grup.
                  {group.type === 'PROFESSIONAL' &&
                    ' Si el grup té una categoria sensible assignada, l\'usuari la rebrà automàticament.'}
                </>
              ) : (
                <>
                  La sol·licitud de <strong>{actionModal.request?.user.name}</strong> serà rebutjada.
                  L&apos;usuari serà notificat.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">
                {actionModal.action === 'approve' ? 'Nota (opcional)' : 'Motiu del rebuig (opcional)'}
              </Label>
              <Textarea
                id="note"
                placeholder={
                  actionModal.action === 'approve'
                    ? 'Afegeix una nota interna...'
                    : 'Explica el motiu del rebuig...'
                }
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionModal({ open: false, request: null, action: null })}
              disabled={!!processingId}
            >
              Cancel·lar
            </Button>
            <Button
              variant={actionModal.action === 'approve' ? 'default' : 'destructive'}
              onClick={handleProcessRequest}
              disabled={!!processingId}
            >
              {processingId ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : actionModal.action === 'approve' ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {actionModal.action === 'approve' ? 'Aprovar' : 'Rebutjar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
