'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Database,
  TrendingUp,
  Clock,
  Zap,
  DollarSign,
  Activity,
  CheckCircle,
  Settings,
  Plus,
  Monitor,
  Eye,
  ArrowRight,
  RefreshCw,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useDashboard';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Components auxiliars
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = 'text-gray-900',
  trend,
  onClick,
  subtitle
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  color?: string;
  trend?: 'up' | 'down';
  onClick?: () => void;
  subtitle?: string;
}) {
  return (
    <Card className={`overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className={`text-2xl font-bold ${color}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {(change || subtitle) && (
              <p className="text-sm mt-1 text-gray-500">
                {change && changeLabel ? `${change} ${changeLabel}` : subtitle}
              </p>
            )}
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBar({
  label,
  value,
  total,
  color
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.PENDING}`}>
      {status}
    </span>
  );
}

export default function LeadGenerationDashboard() {
  const router = useRouter();

  const {
    stats,
    quickStats,
    loading,
    error,
    refreshStats,
  } = useDashboard();

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 underline"
        >
          Reload page
        </button>
      </div>
    );
  }

  if (!stats) return null;


  const quickActions = [
    {
      title: 'Configurar IA',
      description: 'Gestiona providers i configuracions',
      icon: Settings,
      href: '/admin/lead-generation/ai-providers',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Nova Font',
      description: 'Afegeix font de scraping',
      icon: Plus,
      href: '/admin/lead-generation/sources',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Monitor Jobs',
      description: 'Veu l\'estat dels treballs',
      icon: Monitor,
      href: '/admin/lead-generation/monitor',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Revisar Leads',
      description: 'Leads pendents d\'aprovació',
      icon: Eye,
      href: '/gestor-empreses/leads?tab=ai-review',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header amb Quick Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Generation Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Sistema automàtic de generació de leads amb IA
          </p>
        </div>

        <button
          onClick={refreshStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.overview.totalLeads}
          change={stats.overview.leadsToday}
          changeLabel="today"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Pending Review"
          value={stats.overview.pendingReview}
          icon={Clock}
          color="text-yellow-600"
          onClick={() => router.push('/gestor-empreses/leads')}
        />
        <StatCard
          title="Active Sources"
          value={stats.sources.active}
          subtitle={`${stats.sources.total} total`}
          icon={Database}
          color="text-blue-600"
          onClick={() => router.push('/admin/lead-generation/sources')}
        />
        <StatCard
          title="Active Jobs"
          value={stats.jobs.running}
          subtitle={`${stats.jobs.pending} pending`}
          icon={Activity}
          color="text-green-600"
          onClick={() => router.push('/admin/lead-generation/monitor')}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Leads per Day Chart */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Leads Generated (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trends.leadsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('ca', {
                  day: 'numeric',
                  month: 'short'
                })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString('ca')}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Chart */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Success Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trends.successRateOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('ca', {
                  day: 'numeric',
                  month: 'short'
                })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString('ca')}
                formatter={(value: number) => `${value}%`}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={2}
                name="Success Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sources & AI Providers Stats */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Sources */}
        <div className="bg-white p-6 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Top Performing Sources</h3>
            <button
              onClick={() => router.push('/admin/lead-generation/sources')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats.sources.topPerformers.map((source, idx) => (
              <div key={source.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-gray-500">
                      {source.leadsGenerated} leads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {source.successRate}%
                  </p>
                  <p className="text-xs text-gray-500">success rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Providers Stats */}
        <div className="bg-white p-6 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">AI Provider Usage</h3>
            <button
              onClick={() => router.push('/admin/lead-generation/ai-providers')}
              className="text-sm text-blue-600 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">
                  {stats.aiProviders.usage.totalRequests.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (stats.aiProviders.usage.successfulRequests /
                    stats.aiProviders.usage.totalRequests) * 100
                  )}%
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-blue-600">
                ${stats.aiProviders.usage.totalCost.toFixed(2)}
              </p>
            </div>

            {/* Providers by Type */}
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Providers by Type</p>
              <div className="space-y-2">
                {stats.aiProviders.byType.map(item => (
                  <div key={item.type} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.type}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Recent Job Activity</h3>
          <button
            onClick={() => router.push('/admin/lead-generation/monitor')}
            className="text-sm text-blue-600 hover:underline"
          >
            View All Jobs
          </button>
        </div>

        <div className="space-y-3">
          {stats.jobs.recentActivity.slice(0, 5).map(job => (
            <div
              key={job.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push('/admin/lead-generation/monitor')}
            >
              <div className="flex items-center gap-3">
                <JobStatusBadge status={job.status} />
                <div>
                  <p className="font-medium">{job.sourceName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString('ca')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{job.leadsGenerated}</p>
                <p className="text-xs text-gray-500">leads</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Distribution */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sources by Type Pie Chart */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Sources by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.sources.byType}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {stats.sources.byType.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Jobs Status Distribution */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Jobs Status Distribution</h3>
          <div className="space-y-3">
            <StatBar
              label="Completed"
              value={stats.jobs.completed}
              total={stats.jobs.total}
              color="green"
            />
            <StatBar
              label="Running"
              value={stats.jobs.running}
              total={stats.jobs.total}
              color="blue"
            />
            <StatBar
              label="Pending"
              value={stats.jobs.pending}
              total={stats.jobs.total}
              color="yellow"
            />
            <StatBar
              label="Failed"
              value={stats.jobs.failed}
              total={stats.jobs.total}
              color="red"
            />
          </div>
        </div>
      </div>
    </div>
  );
}