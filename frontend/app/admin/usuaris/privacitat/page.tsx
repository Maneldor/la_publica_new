'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, FolderLock, Settings, FileText } from 'lucide-react'
import { CategoriesTab } from './components/CategoriesTab'
import { ConfiguracioTab } from './components/ConfiguracioTab'
import { AuditoriaTab } from './components/AuditoriaTab'

const tabs = [
  { id: 'categories', label: 'Categories Sensibles', icon: FolderLock },
  { id: 'configuracio', label: 'Configuració Global', icon: Settings },
  { id: 'auditoria', label: 'Auditoria', icon: FileText },
]

export default function PrivacitatAdminPage() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <PageLayout
      title="Privacitat"
      subtitle="Gestiona les categories sensibles i configuració de privacitat dels usuaris"
      icon={<Shield className="w-6 h-6" />}
    >
      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'configuracio' && <ConfiguracioTab />}
      {activeTab === 'auditoria' && <AuditoriaTab />}
    </PageLayout>
  )
}
