'use client'

import { useState, useEffect } from 'react'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    ShoppingBag,
    Handshake,
    RefreshCw,
    Download,
    Calendar,
    Activity,
    Star,
    Eye,
    Clock,
    LogIn
} from 'lucide-react'

// Tipos
interface StatCard {
    title: string
    value: string
    subtitle: string
    trend?: {
        value: string
        isPositive: boolean
    }
    icon: any
    color: string
}

interface ChartData {
    label: string
    value: number
}

interface StatsData {
    cards: StatCard[]
    loginChart: ChartData[]
    viewsChart: ChartData[]
    quickSummary: {
        activeUsers: number
        newSignups: number
        pendingApprovals: number
        systemHealth: string
    }
    popularCategories: Array<{
        name: string
        count: number
        percentage: number
    }>
    recentActivity: Array<{
        id: string
        action: string
        user: string
        time: string
        type: 'success' | 'warning' | 'info'
    }>
}

// Componente StatCard reutilizable
function StatCard({ title, value, subtitle, trend, icon: Icon, color }: StatCard) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">{title}</p>
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? (
                            <TrendingUp className="h-4 w-4 mr-1" strokeWidth={1.5} />
                        ) : (
                            <TrendingDown className="h-4 w-4 mr-1" strokeWidth={1.5} />
                        )}
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
        </div>
    )
}

// Componente SimpleBarChart
function SimpleBarChart({ data, title, color }: { data: ChartData[], title: string, color: string }) {
    const maxValue = Math.max(...data.map(d => d.value))
    
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" strokeWidth={1.5} />
                {title}
            </h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-16 text-sm text-slate-600">{item.label}</div>
                        <div className="flex-1 mx-3">
                            <div className="bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-12 text-sm font-medium text-slate-900 text-right">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function EstadistiquesPage() {
    const [period, setPeriod] = useState('30d')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState<StatsData | null>(null)

    // Datos de ejemplo como fallback
    const mockData: StatsData = {
        cards: [
            {
                title: 'Total Usuaris',
                value: '1,234',
                subtitle: 'Usuaris registrats al sistema',
                trend: { value: '+12%', isPositive: true },
                icon: Users,
                color: 'bg-blue-500'
            },
            {
                title: 'Empreses',
                value: '456',
                subtitle: 'Empreses registrades',
                trend: { value: '+8%', isPositive: true },
                icon: Building2,
                color: 'bg-green-500'
            },
            {
                title: 'Ofertes Actives',
                value: '789',
                subtitle: 'Ofertes públiques actives',
                trend: { value: '-3%', isPositive: false },
                icon: ShoppingBag,
                color: 'bg-purple-500'
            },
            {
                title: 'Bescanvis',
                value: '2,345',
                subtitle: 'Intercanvis realitzats',
                trend: { value: '+15%', isPositive: true },
                icon: Handshake,
                color: 'bg-orange-500'
            }
        ],
        loginChart: [
            { label: 'Dill', value: 45 },
            { label: 'Dim', value: 52 },
            { label: 'Dic', value: 61 },
            { label: 'Dij', value: 38 },
            { label: 'Div', value: 42 },
            { label: 'Dis', value: 28 },
            { label: 'Dum', value: 35 }
        ],
        viewsChart: [
            { label: 'Dill', value: 156 },
            { label: 'Dim', value: 189 },
            { label: 'Dic', value: 234 },
            { label: 'Dij', value: 178 },
            { label: 'Div', value: 198 },
            { label: 'Dis', value: 145 },
            { label: 'Dum', value: 167 }
        ],
        quickSummary: {
            activeUsers: 892,
            newSignups: 24,
            pendingApprovals: 7,
            systemHealth: 'Excellent'
        },
        popularCategories: [
            { name: 'Tecnologia', count: 145, percentage: 32 },
            { name: 'Educació', count: 98, percentage: 22 },
            { name: 'Salut', count: 76, percentage: 17 },
            { name: 'Serveis', count: 65, percentage: 14 },
            { name: 'Altres', count: 67, percentage: 15 }
        ],
        recentActivity: [
            {
                id: '1',
                action: 'Nova empresa aprovada: TechCorp SL',
                user: 'Admin System',
                time: '5 min',
                type: 'success'
            },
            {
                id: '2', 
                action: 'Oferta reportada per contingut inadequat',
                user: 'Maria García',
                time: '12 min',
                type: 'warning'
            },
            {
                id: '3',
                action: 'Nou usuari registrat: Joan Martí',
                user: 'System',
                time: '18 min',
                type: 'info'
            },
            {
                id: '4',
                action: 'Backup automàtic completat',
                user: 'System',
                time: '1 hora',
                type: 'success'
            }
        ]
    }

    useEffect(() => {
        fetchStats()
    }, [period])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/admin/stats?period=${period}`)
            if (response.ok) {
                const statsData = await response.json()
                setData(statsData)
            } else {
                // Usar datos de ejemplo si la API no existe
                console.log('Using mock data - API endpoint not available')
                setData(mockData)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
            setData(mockData)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchStats()
        setRefreshing(false)
    }

    const handleExport = () => {
        // TODO: Implementar exportación
        console.log('Export functionality to be implemented')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                Error carregant estadístiques
            </div>
        )
    }

    return (
        <div className="space-y-8 mx-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <BarChart3 className="h-7 w-7 text-slate-700" strokeWidth={1.5} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Estadístiques</h1>
                        <p className="text-slate-500">Anàlisi i mètriques de la plataforma</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Selector de període */}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7d">Últims 7 dies</option>
                            <option value="30d">Últims 30 dies</option>
                            <option value="90d">Últims 90 dies</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                        Actualitzar
                    </button>
                    
                    <button 
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* StatCards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {data.cards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SimpleBarChart 
                    data={data.loginChart}
                    title="Inicis de Sessió"
                    color="bg-blue-500"
                />
                <SimpleBarChart 
                    data={data.viewsChart}
                    title="Visualitzacions d'Ofertes"
                    color="bg-green-500"
                />
            </div>

            {/* Paneles adicionales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Resum Ràpid */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2" strokeWidth={1.5} />
                        Resum Ràpid
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Usuaris actius</span>
                            <span className="font-medium">{data.quickSummary.activeUsers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Nous registres</span>
                            <span className="font-medium">{data.quickSummary.newSignups}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Pendents d'aprovació</span>
                            <span className="font-medium">{data.quickSummary.pendingApprovals}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-4">
                            <span className="text-slate-600">Estat del sistema</span>
                            <span className="font-medium text-green-600">{data.quickSummary.systemHealth}</span>
                        </div>
                    </div>
                </div>

                {/* Categories Populars */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2" strokeWidth={1.5} />
                        Categories Populars
                    </h3>
                    <div className="space-y-3">
                        {data.popularCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <span className="text-sm text-slate-900">{category.name}</span>
                                    <div className="flex-1 mx-3">
                                        <div className="bg-slate-100 rounded-full h-2">
                                            <div 
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${category.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{category.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activitat Recent */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2" strokeWidth={1.5} />
                        Activitat Recent
                    </h3>
                    <div className="space-y-4">
                        {data.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    activity.type === 'success' ? 'bg-green-500' : 
                                    activity.type === 'warning' ? 'bg-yellow-500' : 
                                    'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900">{activity.action}</p>
                                    <p className="text-xs text-slate-500">
                                        {activity.user} • fa {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}