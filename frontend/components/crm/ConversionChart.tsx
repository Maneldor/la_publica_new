'use client';

import { useState, useEffect } from 'react';

interface ConversionData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
  label: string;
}

interface ConversionChartProps {
  data: {
    new: number;
    contacted: number;
    negotiating: number;
    converted: number;
    lost: number;
  };
}

export default function ConversionChart({ data }: ConversionChartProps) {
  const [animatedData, setAnimatedData] = useState<ConversionData[]>([]);

  const total = data.new + data.contacted + data.negotiating + data.converted + data.lost;

  useEffect(() => {
    // Calcular datos de conversión
    const conversionData: ConversionData[] = [
      {
        stage: 'new',
        count: data.new,
        percentage: total > 0 ? Math.round((data.new / total) * 100) : 0,
        color: 'bg-blue-500',
        label: 'Nuevos'
      },
      {
        stage: 'contacted',
        count: data.contacted,
        percentage: total > 0 ? Math.round((data.contacted / total) * 100) : 0,
        color: 'bg-yellow-500',
        label: 'Contactados'
      },
      {
        stage: 'negotiating',
        count: data.negotiating,
        percentage: total > 0 ? Math.round((data.negotiating / total) * 100) : 0,
        color: 'bg-purple-500',
        label: 'Negociando'
      },
      {
        stage: 'converted',
        count: data.converted,
        percentage: total > 0 ? Math.round((data.converted / total) * 100) : 0,
        color: 'bg-green-500',
        label: 'Convertidos'
      },
      {
        stage: 'lost',
        count: data.lost,
        percentage: total > 0 ? Math.round((data.lost / total) * 100) : 0,
        color: 'bg-red-500',
        label: 'Perdidos'
      }
    ];

    // Animar la aparición de las barras
    const timer = setTimeout(() => {
      setAnimatedData(conversionData);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, total]);

  // Calcular tasas de conversión
  const conversionRate = total > 0 ? Math.round((data.converted / total) * 100) : 0;
  const contactRate = data.new > 0 ? Math.round((data.contacted / data.new) * 100) : 0;
  const negotiationRate = data.contacted > 0 ? Math.round((data.negotiating / data.contacted) * 100) : 0;
  const closingRate = data.negotiating > 0 ? Math.round((data.converted / data.negotiating) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Análisis de Conversión</h3>
        <div className="text-sm text-gray-500">
          Total: {total} leads
        </div>
      </div>

      {/* Gráfico de barras horizontales */}
      <div className="space-y-4 mb-6">
        {animatedData.map((item, index) => (
          <div key={item.stage} className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-gray-700 text-right">
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                  style={{
                    width: `${item.percentage}%`,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {item.percentage > 15 && (
                    <span className="text-white text-xs font-medium">
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>
              {item.percentage <= 15 && item.percentage > 0 && (
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600">
                  {item.percentage}%
                </span>
              )}
            </div>
            <div className="w-12 text-sm font-semibold text-gray-900 text-right">
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* Métricas de conversión */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          <div className="text-xs text-gray-500">Tasa Conversión</div>
          <div className="text-xs text-gray-400">General</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{contactRate}%</div>
          <div className="text-xs text-gray-500">Nuevos → Contactados</div>
          <div className="text-xs text-gray-400">Primer contacto</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{negotiationRate}%</div>
          <div className="text-xs text-gray-500">Contactados → Negociando</div>
          <div className="text-xs text-gray-400">Interés confirmado</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{closingRate}%</div>
          <div className="text-xs text-gray-500">Negociando → Convertidos</div>
          <div className="text-xs text-gray-400">Cierre efectivo</div>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Rendimiento del Pipeline:</span>
          <div className="flex items-center gap-2">
            {conversionRate >= 20 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                ✅ Excelente
              </span>
            )}
            {conversionRate >= 10 && conversionRate < 20 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                ⚠️ Bueno
              </span>
            )}
            {conversionRate < 10 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                🔄 Mejorable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}