'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Bot,
  Database,
  Activity,
  Settings,
  ArrowLeft,
  Plus,
  Monitor,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export default function LeadGenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    {
      name: 'Dashboard',
      href: '/admin/lead-generation',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'AI Providers',
      href: '/admin/lead-generation/ai-providers',
      icon: Bot,
    },
    {
      name: 'Fonts de Scraping',
      href: '/admin/lead-generation/sources',
      icon: Database,
    },
    {
      name: 'Monitor de Jobs',
      href: '/admin/lead-generation/monitor',
      icon: Activity,
    },
    {
      name: 'Configuració',
      href: '/admin/lead-generation/settings',
      icon: Settings,
    },
  ];

  const isTabActive = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Generació Automàtica de Leads
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Sistema d'IA per scraping i qualificació automàtica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse" />
            Sistema Actiu
          </div>
        </div>
      </div>

      {/* Statistics - Only show on dashboard */}
      {pathname === '/admin/lead-generation' && (
        <div>
          {children}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = isTabActive(tab);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Dashboard content below tabs */}
      {pathname === '/admin/lead-generation' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Accions Ràpides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/admin/lead-generation/ai-providers"
                  className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white mb-3 group-hover:scale-110 transition-transform">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Configurar IA
                    </h3>
                    <p className="text-xs text-gray-600">
                      Gestiona providers i configuracions
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/lead-generation/sources/create"
                  className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Nova Font
                    </h3>
                    <p className="text-xs text-gray-600">
                      Afegeix font de scraping
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/lead-generation/monitor"
                  className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white mb-3 group-hover:scale-110 transition-transform">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Monitor Jobs
                    </h3>
                    <p className="text-xs text-gray-600">
                      Veu l'estat dels treballs
                    </p>
                  </div>
                </Link>

                <Link
                  href="/gestor-empreses/leads?tab=ai-review"
                  className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white mb-3 group-hover:scale-110 transition-transform">
                      <Eye className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Revisar Leads
                    </h3>
                    <p className="text-xs text-gray-600">
                      Leads pendents d'aprovació
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activitat Recent
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Nou batch de leads generat per Claude
                      </p>
                      <p className="text-sm text-gray-500">23 leads · Fa 12 minuts</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">12:34</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Font "TechCrunch Startups" actualitzada
                      </p>
                      <p className="text-sm text-gray-500">Scraping completat · Fa 45 minuts</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">11:49</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Provider GPT-4 configurat correctament
                      </p>
                      <p className="text-sm text-gray-500">Test de connexió exitós · Fa 2 hores</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">10:15</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        12 leads aprovats i enviats al pipeline
                      </p>
                      <p className="text-sm text-gray-500">Revisor: admin@lapublica.cat · Fa 3 hores</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">09:22</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Only show on non-dashboard pages */}
      {pathname !== '/admin/lead-generation' && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
}