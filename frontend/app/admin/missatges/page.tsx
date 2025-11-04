'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Users, Send, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function MissatgesAdminPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    // Cargar mensajes desde localStorage
    const savedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    setMessages(savedMessages);
  };

  const deleteMessage = (id: number) => {
    if (confirm('Estàs segur que vols eliminar aquest missatge?')) {
      const savedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      const updatedMessages = savedMessages.filter((msg: any) => msg.id !== id);
      localStorage.setItem('adminMessages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    }
  };

  // Estadísticas
  const stats = {
    total: messages.length,
    enviats: messages.filter(m => m.status === 'sent').length,
    programats: messages.filter(m => m.status === 'scheduled').length,
    esborranys: messages.filter(m => m.status === 'draft').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💬 Gestió de Missatges</h1>
          <p className="text-gray-600">Envia missatges massius i gestiona les comunicacions</p>
        </div>
        <Link
          href="/admin/missatges/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nou Missatge
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Missatges"
          value={stats.total}
          icon={<MessageSquare className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Enviats"
          value={stats.enviats}
          icon={<Send className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Programats"
          value={stats.programats}
          icon={<Clock className="w-10 h-10" />}
          color="yellow"
        />
        <StatCard
          title="Esborranys"
          value={stats.esborranys}
          icon={<Users className="w-10 h-10" />}
          color="gray"
        />
      </div>

      {/* Lista de mensajes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Missatges</h2>
        </div>

        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No hi ha missatges encara</p>
            <p className="text-sm">Crea el teu primer missatge massiu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Títol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinataris
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.title}</div>
                      <div className="text-sm text-gray-500">{message.preview}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.recipientType === 'all' && '👥 Tots els usuaris'}
                        {message.recipientType === 'employees' && '👔 Empleats públics'}
                        {message.recipientType === 'companies' && '🏢 Empreses'}
                        {message.recipientType === 'groups' && `👥 ${message.groups?.length || 0} grups`}
                        {message.recipientType === 'individual' && `👤 ${message.recipients?.length || 0} usuaris`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {message.totalRecipients} destinataris
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.messageType === 'announcement' ? 'bg-blue-100 text-blue-800' :
                        message.messageType === 'notification' ? 'bg-green-100 text-green-800' :
                        message.messageType === 'alert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.messageType === 'announcement' && '📢 Anunci'}
                        {message.messageType === 'notification' && '🔔 Notificació'}
                        {message.messageType === 'alert' && '⚠️ Alerta'}
                        {message.messageType === 'message' && '💬 Missatge'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('ca-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.status === 'sent' ? 'bg-green-100 text-green-800' :
                        message.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        message.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {message.status === 'sent' && '✓ Enviat'}
                        {message.status === 'scheduled' && '⏰ Programat'}
                        {message.status === 'draft' && '📝 Esborrany'}
                        {message.status === 'failed' && '❌ Error'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/missatges/view/${message.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Veure
                      </button>
                      {message.status === 'draft' && (
                        <button
                          onClick={() => router.push(`/admin/missatges/editar/${message.id}`)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}