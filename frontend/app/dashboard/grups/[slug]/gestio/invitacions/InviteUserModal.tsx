'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Search, Send, X, Loader2, User } from 'lucide-react'

interface SearchUser {
  id: string
  name: string
  nick: string
  email: string
  image: string | null
}

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
  onInviteSent: () => void
}

export function InviteUserModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onInviteSent,
}: InviteUserModalProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Buscar usuaris
  useEffect(() => {
    if (!isOpen) return

    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10&excludeGroup=${groupId}`
        )
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.users || [])
        }
      } catch (err) {
        console.error('Error searching users:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, isOpen])

  const handleSendInvitation = async () => {
    if (!selectedUser) return

    try {
      setIsSending(true)

      const res = await fetch(`/api/groups/${groupId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          message: message.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error enviant invitació')
      }

      toast({
        title: 'Invitació enviada',
        description: data.message,
      })

      onInviteSent()
      handleClose()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error enviant invitació',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar usuari</DialogTitle>
          <DialogDescription>
            Convida un usuari a unir-se al grup &quot;{groupName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedUser ? (
            <>
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar per nom, nick o email..."
                  className="pl-9"
                  autoFocus
                />
              </div>

              {/* Resultats */}
              {isSearching && (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  <span className="text-sm">Buscant...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.nick} · {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cap usuari trobat</p>
                </div>
              )}

              {searchQuery.length < 2 && searchQuery.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Escriu almenys 2 caràcters per buscar
                </p>
              )}
            </>
          ) : (
            <>
              {/* Usuari seleccionat */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                    {selectedUser.image ? (
                      <Image
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedUser.nick}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Missatge opcional */}
              <div className="space-y-2">
                <Label htmlFor="message">Missatge (opcional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Afegeix un missatge personalitzat per a la invitació..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/500 caràcters
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel·lar
          </Button>
          {selectedUser && (
            <Button onClick={handleSendInvitation} disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar invitació
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
