// app/gestio/missatges/[conversationId]/page.tsx
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { MessageThread } from '@/components/gestio-empreses/missatges/MessageThread'
import { getConversationMessages } from '@/lib/gestio-empreses/message-actions'

export const metadata = {
  title: 'Conversa | Missatges',
}

interface ConversationPageProps {
  params: {
    conversationId: string
  }
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  let conversationData
  try {
    conversationData = await getConversationMessages(params.conversationId)
  } catch (error) {
    notFound()
  }

  const { conversation, messages } = conversationData

  return (
    <div className="h-full flex flex-col">
      {/* Header de navegació */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/gestio/missatges"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MessageSquare className="h-4 w-4" />
            <span>Missatges</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">{conversation.title}</span>
          </div>
        </div>
      </div>

      {/* Contingut del missatge */}
      <div className="flex-1 bg-white">
        <MessageThread
          conversation={conversation}
          messages={messages}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  )
}