// components/gestio-empreses/missatges/NewConversationModal.tsx
'use client'

import { useState } from 'react'
import { X, Search, Users, MessageCircle } from 'lucide-react'
import { createConversation } from '@/lib/gestio-empreses/message-actions'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
}

export function NewConversationModal({ isOpen, onClose, users }: NewConversationModalProps) {
  const [title, setTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [initialMessage, setInitialMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async () => {
    if (!title.trim() || selectedUsers.length === 0) return

    setIsLoading(true)
    try {
      await createConversation(
        title.trim(),
        selectedUsers,
        initialMessage.trim() || undefined
      )

      // Reset form
      setTitle('')
      setSelectedUsers([])
      setInitialMessage('')
      setSearchQuery('')
      onClose()
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle('')
      setSelectedUsers([])
      setInitialMessage('')
      setSearchQuery('')
      onClose()
    }
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      // Admins
      ADMIN: 'Administrador',
      SUPER_ADMIN: 'Super Administrador',
      // Gestors
      EMPLOYEE: 'Empleat',
      ACCOUNT_MANAGER: 'Gestor',
      // Empreses
      COMPANY: 'Empresa',
      COMPANY_MANAGER: 'Admin Empresa',
    }
    return roleLabels[role] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      SUPER_ADMIN: 'bg-red-100 text-red-700',
      ACCOUNT_MANAGER: 'bg-blue-100 text-blue-700',
      EMPLOYEE: 'bg-slate-100 text-slate-700',
      COMPANY: 'bg-green-100 text-green-700',
      COMPANY_MANAGER: 'bg-green-100 text-green-700',
    }
    return roleColors[role] || 'bg-slate-100 text-slate-700'
  }

  const getSelectedUserNames = () => {
    return users
      .filter(user => selectedUsers.includes(user.id))
      .map(user => user.name)
      .join(', ')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Nova conversa</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
          {/* Títol de la conversa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Títol de la conversa
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu un títol descriptiu..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Selecció d'usuaris */}
          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Participants ({selectedUsers.length} seleccionats)
            </label>

            {/* Usuaris seleccionats */}
            {selectedUsers.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Seleccionats:</p>
                <p className="text-sm text-blue-700">{getSelectedUserNames()}</p>
              </div>
            )}

            {/* Barra de cerca */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuaris..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Llista d'usuaris */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-500">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No s'han trobat usuaris</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        disabled={isLoading}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Missatge inicial (opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Missatge inicial (opcional)
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Escriu un missatge per començar la conversa..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || selectedUsers.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creant...' : 'Crear conversa'}
          </button>
        </div>
      </div>
    </div>
  )
}