// components/gestio-empreses/missatges/NewConversationButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { MessageCirclePlus } from 'lucide-react'
import { NewConversationModal } from './NewConversationModal'
import { getAvailableUsers } from '@/lib/gestio-empreses/message-actions'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function NewConversationButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isModalOpen && users.length === 0) {
      loadUsers()
    }
  }, [isModalOpen])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const availableUsers = await getAvailableUsers()
      setUsers(availableUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        <MessageCirclePlus className="h-4 w-4" strokeWidth={1.5} />
        Nova conversa
      </button>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        users={users}
      />
    </>
  )
}