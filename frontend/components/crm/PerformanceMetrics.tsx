'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Users,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface PerformanceMetricsProps {
  data: {
    totalLeads: number;
    convertedLeads: number;
    totalValue: number;
    avgDealSize: number;
    avgTimeToClose: number;
    activeLeads: number;
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    // Calcular métricas con datos reales
    const conversionRate = data.totalLeads > 0 ? ((data.convertedLeads / data.totalLeads) * 100) : 0;
    const avgDealSize = data.convertedLeads > 0 ? Math.round(data.totalValue / data.convertedLeads) : 0;

    const calculatedMetrics: MetricCard[] = [
      {
        title: 'Tasa de Conversión',
        value: `${conversionRate.toFixed(1)}%`,
        change: 5.2, // Mock - en producción sería calculado vs período anterior
        changeLabel: 'vs mes anterior',
        icon: Target,
        color: 'green',
        description: 'Porcentaje de leads convertidos'
      },
      {
        title: 'Tiempo Promedio de Cierre',
        value: `${data.avgTimeToClose} días`,
        change: -3.5, // Negativo es bueno en tiempo
        changeLabel: 'vs mes anterior',
        icon: Clock,
        color: 'blue',
        description: 'Días promedio desde lead hasta conversión'
      },
      {
        title: 'Valor Promedio por Deal',
        value: `€${avgDealSize.toLocaleString()}`,
        change: 12.8,
        changeLabel: 'vs mes anterior',
        icon: DollarSign,
        color: 'purple',
        description: 'Valor promedio de cada conversión'
      },
      {
        title: 'Leads Activos en Pipeline',
        value: data.activeLeads.toString(),
        change: 8.1,
        changeLabel: 'vs mes anterior',
        icon: Users,
        color: 'orange',
        description: 'Leads actualmente en progreso'
      },
      {
        title: 'Revenue Total Generado',
        value: `€${data.totalValue.toLocaleString()}`,
        change: 24.5,
        changeLabel: 'vs mes anterior',
        icon: TrendingUp,
        color: 'emerald',
        description: 'Ingresos totales del período'
      },
      {
        title: 'Leads Convertidos',
        value: data.convertedLeads.toString(),
        change: 15.3,
        changeLabel: 'vs mes anterior',
        icon: Award,
        color: 'indigo',
        description: 'Total de conversiones exitosas'
      }
    ];

    setMetrics(calculatedMetrics);
  }, [data]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-600';
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      case 'emerald': return 'bg-emerald-100 text-emerald-600';
      case 'indigo': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Métricas de Rendimiento</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Últimos 30 días</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.change)}`}>
                {getChangeIcon(metric.change)}
                <span className="font-medium">
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Value */}
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {metric.title}
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-gray-500 mb-2">
              {metric.description}
            </div>

            {/* Change label */}
            <div className="text-xs text-gray-400">
              {metric.changeLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Insights de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/50 rounded-lg p-4">
            <div className="font-medium text-blue-800 mb-1">🎯 Conversión</div>
            <div className="text-blue-700">
              {((data.convertedLeads / data.totalLeads) * 100) >= 15
                ? "Excelente tasa de conversión. Mantén las estrategias actuales."
                : ((data.convertedLeads / data.totalLeads) * 100) >= 8
                ? "Buena tasa de conversión. Hay espacio para optimizar."
                : "Tasa de conversión mejorable. Revisa el proceso de calificación."
              }
            </div>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <div className="font-medium text-blue-800 mb-1">⏱️ Velocidad</div>
            <div className="text-blue-700">
              {data.avgTimeToClose <= 30
                ? "Ciclo de ventas eficiente. Excelente seguimiento."
                : data.avgTimeToClose <= 60
                ? "Tiempo de cierre razonable. Considera automatizar seguimientos."
                : "Ciclo largo. Revisa puntos de fricción en el proceso."
              }
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}