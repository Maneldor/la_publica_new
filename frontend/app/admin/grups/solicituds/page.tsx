'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import {
  Clock,
  ArrowLeft,
  User,
  Users,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Mail,
  Calendar,
  Briefcase,
  Lock,
  MessageSquare,
  Shield,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface GroupInfo {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image: string | null
  sensitiveJobCategory?: { id: string; name: string } | null
}

interface UserInfo {
  id: string
  name: string
  nick: string
  email: string
  image: string | null
}

interface JoinRequest {
  id: string
  message: string | null
  createdAt: string
  user: UserInfo
  group: GroupInfo
}

interface GroupSummary {
  id: string
  name: string
  slug: string
  type: string
  pendingCount: number
}

export default function SolicitudsAdminPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filtre per grup
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null)

  // Modal d'acció
  const [actionRequest, setActionRequest] = useState<JoinRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Stats
  const [stats, setStats] = useState({ totalPending: 0, groupsWithPending: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadRequests()
  }, [page, filterGroupId])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/groups/requests?stats=true')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || { totalPending: 0, groupsWithPending: 0 })
        setGroups(data.groups || [])
      }
    } catch {
      // Silently fail for stats
    }
  }

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (filterGroupId) {
        params.append('groupId', filterGroupId)
      }

      const res = await fetch(`/api/admin/groups/requests?${params}`)
      if (!res.ok) throw new Error('Error carregant sol·licituds')

      const data = await res.json()
      setRequests(data.requests || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch {
      setError("No s'han pogut carregar les sol·licituds")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!actionRequest || !actionType) return

    try {
      setIsProcessing(true)

      const res = await fetch(`/api/admin/groups/requests/${actionRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          responseMessage: responseMessage.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error processant sol·licitud')
      }

      // Recarregar
      loadRequests()
      loadStats()
      closeActionModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error processant sol·licitud')
    } finally {
      setIsProcessing(false)
    }
  }

  const openActionModal = (request: JoinRequest, type: 'approve' | 'reject') => {
    setActionRequest(request)
    setActionType(type)
    setResponseMessage('')
  }

  const closeActionModal = () => {
    setActionRequest(null)
    setActionType(null)
    setResponseMessage('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PROFESSIONAL':
        return <Briefcase className="w-4 h-4 text-indigo-600" />
      case 'PRIVATE':
        return <Lock className="w-4 h-4 text-amber-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PROFESSIONAL':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'PRIVATE':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <PageLayout
      title="Sol·licituds d'Accés"
      subtitle="Gestiona les sol·licituds de grups sense administrador"
      icon={<Clock className="w-6 h-6" />}
      actions={
        <Link href="/admin/grups" className={`${BUTTONS.secondary} flex items-center gap-2`}>
          <ArrowLeft className="w-4 h-4" />
          Tornar
        </Link>
      }
    >
      {/* Info banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Panell centralitzat de sol·licituds
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Aquí es mostren les sol·licituds pendents de grups que no tenen cap administrador assignat.
                Com a administrador del sistema, pots aprovar o rebutjar aquestes sol·licituds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPending}</p>
                <p className="text-sm text-gray-500">Sol·licituds pendents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.groupsWithPending}</p>
                <p className="text-sm text-gray-500">Grups amb sol·licituds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre per grup */}
      {groups.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filtrar per grup:</span>
              </div>

              <Button
                variant={filterGroupId === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterGroupId(null)
                  setPage(1)
                }}
              >
                Tots ({stats.totalPending})
              </Button>

              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={filterGroupId === group.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterGroupId(group.id)
                    setPage(1)
                  }}
                  className="flex items-center gap-2"
                >
                  {getTypeIcon(group.type)}
                  {group.name}
                  <Badge variant="secondary" className="ml-1">
                    {group.pendingCount}
                  </Badge>
                </Button>
              ))}

              <button
                onClick={() => {
                  loadRequests()
                  loadStats()
                }}
                disabled={isLoading}
                className="ml-auto p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Refrescar"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className={TYPOGRAPHY.small}>Carregant sol·licituds...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !error && requests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2`}>Tot al dia!</h3>
            <p className={TYPOGRAPHY.body}>
              No hi ha sol·licituds pendents de grups sense administrador.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Llista de sol·licituds */}
      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar usuari */}
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {request.user.image ? (
                      <Image
                        src={request.user.image}
                        alt={request.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{request.user.name}</h3>
                      <span className="text-sm text-gray-500">@{request.user.nick}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {request.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                          locale: ca,
                        })}
                      </span>
                    </div>

                    {/* Info del grup */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                      {getTypeIcon(request.group.type)}
                      <span className="font-medium">{request.group.name}</span>
                      <Badge
                        variant="outline"
                        className={getTypeBadge(request.group.type)}
                      >
                        {request.group.type === 'PROFESSIONAL'
                          ? 'Professional'
                          : request.group.type === 'PRIVATE'
                          ? 'Privat'
                          : request.group.type}
                      </Badge>
                      {request.group.sensitiveJobCategory && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {request.group.sensitiveJobCategory.name}
                        </Badge>
                      )}
                    </div>

                    {/* Missatge */}
                    {request.message && (
                      <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-gray-700">&ldquo;{request.message}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Accions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionModal(request, 'reject')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rebutjar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionModal(request, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginació */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={TYPOGRAPHY.small}>
            Pàgina {page} de {totalPages} ({total} sol·licituds)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal d'acció */}
      <Dialog open={!!actionRequest} onOpenChange={() => closeActionModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle>
              {actionType === 'approve' ? 'Aprovar sol·licitud' : 'Rebutjar sol·licitud'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {actionType === 'approve' ? (
                <>
                  Estàs a punt d&apos;aprovar la sol·licitud de{' '}
                  <span className="font-semibold text-gray-900">{actionRequest?.user.name}</span> per unir-se al grup{' '}
                  <span className="font-semibold text-gray-900">{actionRequest?.group.name}</span>.
                  {actionRequest?.group.sensitiveJobCategory && (
                    <span className="block mt-2 p-2 bg-purple-50 text-purple-700 rounded-lg text-xs">
                      ⚠️ Aquest grup té categoria sensible ({actionRequest.group.sensitiveJobCategory.name}).
                      L&apos;usuari rebrà restriccions de visibilitat.
                    </span>
                  )}
                </>
              ) : (
                <>
                  Estàs a punt de rebutjar la sol·licitud de{' '}
                  <span className="font-semibold text-gray-900">{actionRequest?.user.name}</span> per unir-se al grup{' '}
                  <span className="font-semibold text-gray-900">{actionRequest?.group.name}</span>.
                </>
              )}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Missatge {actionType === 'reject' ? '(recomanat)' : '(opcional)'}
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Benvingut/da al grup!'
                    : "Explica el motiu del rebuig..."
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-gray-100">
            <Button variant="outline" onClick={closeActionModal} disabled={isProcessing}>
              Cancel·lar
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : actionType === 'approve' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {actionType === 'approve' ? 'Aprovar' : 'Rebutjar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
