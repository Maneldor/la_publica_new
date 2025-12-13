import { LucideIcon, TrendingUp } from "lucide-react";
import Link from 'next/link';

// StatCard component
interface StatCardProps {
    title: string
    value: string
    subtitle?: string
    change?: string
    changeType?: 'positive' | 'negative'
    icon: LucideIcon
}

export function StatCard({ title, value, subtitle, change, changeType, icon: Icon }: StatCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    )}
                    {change && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <TrendingUp className="h-3 w-3" />
                            {change}
                        </p>
                    )}
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    )
}

// QuickAction component
interface QuickActionProps {
    href: string
    icon: LucideIcon
    label: string
    description: string
    color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorStyles = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
}

export function QuickAction({ href, icon: Icon, label, description, color }: QuickActionProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg text-white ${colorStyles[color]} transition-colors`}
        >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs opacity-80">{description}</p>
            </div>
        </Link>
    )
}

// ActivityItem component
export function ActivityItem({ icon: Icon, text, time }: { icon: LucideIcon, text: string, time: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-1.5 bg-slate-100 rounded">
                <Icon className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-700">{text}</p>
                <p className="text-xs text-slate-400">{time}</p>
            </div>
        </div>
    )
}
