'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
} from 'lucide-react'

interface JoinRequestButtonProps {
  groupId: string
  groupName: string
  groupType: 'PUBLIC' | 'PRIVATE' | 'PROFESSIONAL' | 'SECRET'
  isMember: boolean
  className?: string
  onJoined?: () => void
}

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null

export function JoinRequestButton({
  groupId,
  groupName,
  groupType,
  isMember,
  className,
  onJoined,
}: JoinRequestButtonProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  // Comprovar si ja té sol·licitud
  useEffect(() => {
    if (isMember) {
      setCheckingStatus(false)
      return
    }

    const checkRequest = async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/request-join`)
        if (res.ok) {
          const data = await res.json()
          setRequestStatus(data.request?.status || null)
        }
      } catch (error) {
        console.error('Error checking request status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    checkRequest()
  }, [groupId, isMember])

  // Unir-se directament (PUBLIC)
  const handleDirectJoin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error en unir-se')
      }

      toast({
        title: 'T\'has unit al grup!',
        description: `Ara ets membre de ${groupName}`,
      })

      onJoined?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No s\'ha pogut unir-se al grup',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Enviar sol·licitud (PRIVATE/PROFESSIONAL)
  const handleSendRequest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error en enviar sol·licitud')
      }

      setRequestStatus('PENDING')
      setShowModal(false)
      setMessage('')

      toast({
        title: 'Sol·licitud enviada!',
        description: 'Els administradors del grup revisaran la teva sol·licitud.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No s\'ha pogut enviar la sol·licitud',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Cancel·lar sol·licitud
  const handleCancelRequest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/request-join`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error en cancel·lar')
      }

      setRequestStatus('CANCELLED')

      toast({
        title: 'Sol·licitud cancel·lada',
        description: 'Has cancel·lat la teva sol·licitud.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No s\'ha pogut cancel·lar',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Si és membre, no mostrar res o mostrar que ja és membre
  if (isMember) {
    return (
      <Button variant="outline" disabled className={className}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Ja ets membre
      </Button>
    )
  }

  // Carregant estat
  if (checkingStatus) {
    return (
      <Button variant="outline" disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Comprovant...
      </Button>
    )
  }

  // Segons l'estat de la sol·licitud
  if (requestStatus === 'PENDING') {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled className={className}>
          <Clock className="h-4 w-4 mr-2 text-amber-500" />
          Sol·licitud pendent
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancelRequest}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel·lar'}
        </Button>
      </div>
    )
  }

  if (requestStatus === 'REJECTED') {
    return (
      <Button variant="outline" disabled className={className}>
        <XCircle className="h-4 w-4 mr-2 text-red-500" />
        Sol·licitud rebutjada
      </Button>
    )
  }

  // Grups PUBLIC - unir-se directament
  if (groupType === 'PUBLIC') {
    return (
      <Button
        onClick={handleDirectJoin}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4 mr-2" />
        )}
        Unir-se
      </Button>
    )
  }

  // Grups SECRET - només invitació
  if (groupType === 'SECRET') {
    return (
      <Button variant="outline" disabled className={className}>
        Només per invitació
      </Button>
    )
  }

  // Grups PRIVATE i PROFESSIONAL - sol·licitud
  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={className}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Sol·licitar accés
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sol·licitar accés a {groupName}</DialogTitle>
            <DialogDescription>
              {groupType === 'PROFESSIONAL' ? (
                <>
                  Aquest és un <strong>grup professional</strong>. Només pots pertànyer a un grup professional.
                  Els administradors revisaran la teva sol·licitud.
                </>
              ) : (
                'Els administradors del grup revisaran la teva sol·licitud i decidiran si acceptar-la.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Missatge (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Escriu un missatge per als administradors explicant per què vols unir-te..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/500 caràcters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel·lar
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Enviar sol·licitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
